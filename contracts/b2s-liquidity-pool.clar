;; =============================================================================
;; B2S Liquidity Pool - AMM (Automated Market Maker)
;; Swap B2S <-> STX using the constant product formula (x * y = k)
;; Based on Uniswap v2 design
;; =============================================================================

(define-constant contract-owner tx-sender)

;; -----------------------------------------------------------------------------
;; Error codes
;; -----------------------------------------------------------------------------
(define-constant err-not-authorized        (err u401))
(define-constant err-insufficient-balance  (err u402))
(define-constant err-slippage-too-high     (err u403))
(define-constant err-insufficient-liquidity (err u404))
(define-constant err-invalid-amount        (err u405))
(define-constant err-zero-amount           (err u406))

;; -----------------------------------------------------------------------------
;; Constants
;; Fee = 0.25% (25 / 10000)
;; minimum-liquidity is locked on first deposit to prevent price manipulation
;; -----------------------------------------------------------------------------
(define-constant fee-numerator    u25)
(define-constant fee-denominator  u10000)
(define-constant minimum-liquidity u1000)

;; -----------------------------------------------------------------------------
;; State variables
;; -----------------------------------------------------------------------------
(define-data-var reserve-b2s      uint u0)
(define-data-var reserve-stx      uint u0)
(define-data-var total-lp-tokens  uint u0)
(define-data-var total-volume-b2s uint u0)
(define-data-var total-volume-stx uint u0)

;; -----------------------------------------------------------------------------
;; Maps
;; -----------------------------------------------------------------------------

;; LP token balances per provider
(define-map lp-balances principal uint)

;; Liquidity history per provider
(define-map liquidity-history principal {
  added:   uint,
  removed: uint,
  rewards: uint
})

;; =============================================================================
;; Private helpers
;; =============================================================================

(define-private (min-uint (a uint) (b uint))
  (if (<= a b) a b)
)

;; Uniswap v2 exact output formula with fee applied inside:
;;   amount-out = (amount-in * (fee-denom - fee-num) * reserve-out)
;;              / (reserve-in * fee-denom + amount-in * (fee-denom - fee-num))
(define-private (get-amount-out
    (amount-in  uint)
    (reserve-in  uint)
    (reserve-out uint))
  (let (
    (amount-in-with-fee (* amount-in (- fee-denominator fee-numerator)))
    (numerator          (* amount-in-with-fee reserve-out))
    (denominator        (+ (* reserve-in fee-denominator) amount-in-with-fee))
  )
    (/ numerator denominator)
  )
)

;; Integer square root via Newton's method (8 iterations — sufficient for u128 range)
(define-private (sqrt-newton (n uint))
  (if (<= n u1)
    n
    (let (
      (x0 (/ n u2))
      (x1 (/ (+ x0 (/ n x0)) u2))
      (x2 (/ (+ x1 (/ n x1)) u2))
      (x3 (/ (+ x2 (/ n x2)) u2))
      (x4 (/ (+ x3 (/ n x3)) u2))
      (x5 (/ (+ x4 (/ n x4)) u2))
      (x6 (/ (+ x5 (/ n x5)) u2))
      (x7 (/ (+ x6 (/ n x6)) u2))
      (x8 (/ (+ x7 (/ n x7)) u2))
    )
      (if (<= x8 x7) x8 x7)
    )
  )
)

;; Update the liquidity history for a provider (add or remove)
(define-private (update-liquidity-history
    (provider principal)
    (amount   uint)
    (is-add   bool))
  (let (
    (history (default-to
      { added: u0, removed: u0, rewards: u0 }
      (map-get? liquidity-history provider)))
  )
    (map-set liquidity-history provider {
      added:   (if is-add (+ (get added history) amount) (get added history)),
      removed: (if is-add (get removed history) (+ (get removed history) amount)),
      rewards: (get rewards history)
    })
  )
)

;; =============================================================================
;; Public functions
;; =============================================================================

;; -----------------------------------------------------------------------------
;; Add liquidity
;; Mints LP tokens proportional to contribution.
;; On first deposit, `minimum-liquidity` is permanently locked.
;; -----------------------------------------------------------------------------
(define-public (add-liquidity
    (amount-b2s    uint)
    (amount-stx    uint)
    (min-lp-tokens uint))
  (let (
    (provider          tx-sender)
    (cur-reserve-b2s   (var-get reserve-b2s))
    (cur-reserve-stx   (var-get reserve-stx))
    (cur-total-lp      (var-get total-lp-tokens))
  )
    (asserts! (> amount-b2s u0) err-zero-amount)
    (asserts! (> amount-stx u0) err-zero-amount)

    ;; Transfer tokens into the pool
    (try! (stx-transfer? amount-stx provider (as-contract tx-sender)))

    (let (
      (raw-lp (if (is-eq cur-total-lp u0)
        ;; First deposit: geometric mean minus the locked minimum
        (- (sqrt-newton (* amount-b2s amount-stx)) minimum-liquidity)
        ;; Subsequent deposits: proportional to existing reserves
        (min-uint
          (/ (* amount-b2s cur-total-lp) cur-reserve-b2s)
          (/ (* amount-stx cur-total-lp) cur-reserve-stx)
        )
      ))
    )
      (asserts! (>= raw-lp min-lp-tokens) err-slippage-too-high)
      (asserts! (> raw-lp u0)             err-zero-amount)

      ;; Update reserves and LP supply
      (var-set reserve-b2s     (+ cur-reserve-b2s amount-b2s))
      (var-set reserve-stx     (+ cur-reserve-stx amount-stx))
      (var-set total-lp-tokens (+ cur-total-lp
        (if (is-eq cur-total-lp u0)
          (+ raw-lp minimum-liquidity)  ;; include locked portion in total
          raw-lp
        )))

      ;; Credit LP tokens to provider
      (map-set lp-balances provider
        (+ (default-to u0 (map-get? lp-balances provider)) raw-lp))

      (update-liquidity-history provider raw-lp true)
      (ok raw-lp)
    )
  )
)

;; -----------------------------------------------------------------------------
;; Remove liquidity
;; Burns LP tokens and returns proportional B2S + STX to provider.
;; -----------------------------------------------------------------------------
(define-public (remove-liquidity
    (lp-tokens uint)
    (min-b2s   uint)
    (min-stx   uint))
  (let (
    (provider         tx-sender)
    (provider-balance (default-to u0 (map-get? lp-balances provider)))
    (cur-reserve-b2s  (var-get reserve-b2s))
    (cur-reserve-stx  (var-get reserve-stx))
    (cur-total-lp     (var-get total-lp-tokens))
  )
    (asserts! (> lp-tokens u0)               err-zero-amount)
    (asserts! (>= provider-balance lp-tokens) err-insufficient-balance)

    (let (
      (b2s-out (/ (* lp-tokens cur-reserve-b2s) cur-total-lp))
      (stx-out (/ (* lp-tokens cur-reserve-stx) cur-total-lp))
    )
      (asserts! (>= b2s-out min-b2s) err-slippage-too-high)
      (asserts! (>= stx-out min-stx) err-slippage-too-high)
      (asserts! (> b2s-out u0)       err-insufficient-liquidity)
      (asserts! (> stx-out u0)       err-insufficient-liquidity)

      ;; Return STX to provider
      (try! (as-contract (stx-transfer? stx-out tx-sender provider)))

      ;; Update reserves and LP supply
      (var-set reserve-b2s     (- cur-reserve-b2s b2s-out))
      (var-set reserve-stx     (- cur-reserve-stx stx-out))
      (var-set total-lp-tokens (- cur-total-lp lp-tokens))

      (map-set lp-balances provider (- provider-balance lp-tokens))
      (update-liquidity-history provider lp-tokens false)

      (ok { b2s: b2s-out, stx: stx-out })
    )
  )
)

;; -----------------------------------------------------------------------------
;; Swap B2S → STX
;; -----------------------------------------------------------------------------
(define-public (swap-b2s-for-stx
    (amount-b2s-in uint)
    (min-stx-out   uint))
  (let (
    (caller           tx-sender)
    (cur-reserve-b2s  (var-get reserve-b2s))
    (cur-reserve-stx  (var-get reserve-stx))
  )
    (asserts! (> amount-b2s-in u0)     err-zero-amount)
    (asserts! (> cur-reserve-stx u0)   err-insufficient-liquidity)
    (asserts! (> cur-reserve-b2s u0)   err-insufficient-liquidity)

    (let (
      (stx-out (get-amount-out amount-b2s-in cur-reserve-b2s cur-reserve-stx))
    )
      (asserts! (>= stx-out min-stx-out) err-slippage-too-high)
      (asserts! (> stx-out u0)           err-insufficient-liquidity)

      ;; Send STX to caller
      (try! (as-contract (stx-transfer? stx-out tx-sender caller)))

      ;; Update reserves and volume
      (var-set reserve-b2s     (+ cur-reserve-b2s amount-b2s-in))
      (var-set reserve-stx     (- cur-reserve-stx stx-out))
      (var-set total-volume-b2s (+ (var-get total-volume-b2s) amount-b2s-in))

      (ok stx-out)
    )
  )
)

;; -----------------------------------------------------------------------------
;; Swap STX → B2S
;; -----------------------------------------------------------------------------
(define-public (swap-stx-for-b2s
    (amount-stx-in uint)
    (min-b2s-out   uint))
  (let (
    (caller           tx-sender)
    (cur-reserve-b2s  (var-get reserve-b2s))
    (cur-reserve-stx  (var-get reserve-stx))
  )
    (asserts! (> amount-stx-in u0)    err-zero-amount)
    (asserts! (> cur-reserve-b2s u0)  err-insufficient-liquidity)
    (asserts! (> cur-reserve-stx u0)  err-insufficient-liquidity)

    ;; Transfer STX into the pool
    (try! (stx-transfer? amount-stx-in caller (as-contract tx-sender)))

    (let (
      (b2s-out (get-amount-out amount-stx-in cur-reserve-stx cur-reserve-b2s))
    )
      (asserts! (>= b2s-out min-b2s-out) err-slippage-too-high)
      (asserts! (> b2s-out u0)           err-insufficient-liquidity)

      ;; Update reserves and volume
      (var-set reserve-stx     (+ cur-reserve-stx amount-stx-in))
      (var-set reserve-b2s     (- cur-reserve-b2s b2s-out))
      (var-set total-volume-stx (+ (var-get total-volume-stx) amount-stx-in))

      (ok b2s-out)
    )
  )
)

;; =============================================================================
;; Read-only functions
;; =============================================================================

(define-read-only (get-reserves)
  (ok { b2s: (var-get reserve-b2s), stx: (var-get reserve-stx) })
)

(define-read-only (get-lp-balance (provider principal))
  (ok (default-to u0 (map-get? lp-balances provider)))
)

(define-read-only (get-total-lp-tokens)
  (ok (var-get total-lp-tokens))
)

;; Price of 1 B2S expressed in STX (scaled by 1,000,000 for 6 decimal precision)
(define-read-only (get-price)
  (let (
    (rb2s (var-get reserve-b2s))
    (rstx (var-get reserve-stx))
  )
    (if (and (> rb2s u0) (> rstx u0))
      (ok (/ (* rstx u1000000) rb2s))
      (ok u0)
    )
  )
)

(define-read-only (get-total-volume)
  (ok { b2s: (var-get total-volume-b2s), stx: (var-get total-volume-stx) })
)

(define-read-only (get-liquidity-history (provider principal))
  (ok (map-get? liquidity-history provider))
)

;; Pool share in basis points (1 bp = 0.01%)
(define-read-only (get-pool-share (provider principal))
  (let (
    (provider-lp (default-to u0 (map-get? lp-balances provider)))
    (total-lp    (var-get total-lp-tokens))
  )
    (if (> total-lp u0)
      (ok (/ (* provider-lp u10000) total-lp))
      (ok u0)
    )
  )
)

(define-read-only (quote-swap-b2s-for-stx (amount-b2s uint))
  (ok (get-amount-out amount-b2s (var-get reserve-b2s) (var-get reserve-stx)))
)

(define-read-only (quote-swap-stx-for-b2s (amount-stx uint))
  (ok (get-amount-out amount-stx (var-get reserve-stx) (var-get reserve-b2s)))
)
