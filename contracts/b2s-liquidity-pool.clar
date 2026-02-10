;; B2S Liquidity Pool - AMM (Automated Market Maker)
;; Swap B2S ↔ STX with constant product formula (x * y = k)

(define-constant contract-owner tx-sender)

;; Error codes
(define-constant err-not-authorized (err u401))
(define-constant err-insufficient-balance (err u402))
(define-constant err-slippage-too-high (err u403))
(define-constant err-insufficient-liquidity (err u404))
(define-constant err-invalid-amount (err u405))
(define-constant err-zero-amount (err u406))

;; Constants
(define-constant fee-numerator u25) ;; 0.25% fee (25/10000)
(define-constant fee-denominator u10000)
(define-constant minimum-liquidity u1000)

;; Data vars
(define-data-var reserve-b2s uint u0) ;; B2S token reserve
(define-data-var reserve-stx uint u0) ;; STX reserve
(define-data-var total-lp-tokens uint u0) ;; Total LP tokens
(define-data-var total-volume-b2s uint u0)
(define-data-var total-volume-stx uint u0)

;; LP token balances
(define-map lp-balances principal uint)

;; User liquidity history
(define-map liquidity-history principal {
  added: uint,
  removed: uint,
  rewards: uint
})

;; Public Functions

;; Add liquidity to pool
(define-public (add-liquidity (amount-b2s uint) (amount-stx uint) (min-lp-tokens uint))
  (let (
    (provider tx-sender)
    (current-reserve-b2s (var-get reserve-b2s))
    (current-reserve-stx (var-get reserve-stx))
    (current-total-lp (var-get total-lp-tokens))
    (lp-tokens-to-mint u0)
  )
    ;; Validations
    (asserts! (> amount-b2s u0) err-zero-amount)
    (asserts! (> amount-stx u0) err-zero-amount)
    
    ;; Calculate LP tokens to mint
    (let (
      (lp-to-mint (if (is-eq current-total-lp u0)
        ;; First liquidity provider
        (sqrti (* amount-b2s amount-stx))
        ;; Subsequent providers - use ratio
        (min 
          (/ (* amount-b2s current-total-lp) current-reserve-b2s)
          (/ (* amount-stx current-total-lp) current-reserve-stx)
        )
      ))
    )
      (asserts! (>= lp-to-mint min-lp-tokens) err-slippage-too-high)
      
      ;; Update reserves
      (var-set reserve-b2s (+ current-reserve-b2s amount-b2s))
      (var-set reserve-stx (+ current-reserve-stx amount-stx))
      
      ;; Mint LP tokens
      (var-set total-lp-tokens (+ current-total-lp lp-to-mint))
      (map-set lp-balances provider 
        (+ (default-to u0 (map-get? lp-balances provider)) lp-to-mint))
      
      ;; Update history
      (update-liquidity-history provider lp-to-mint true)
      
      (ok lp-to-mint)
    )
  )
)

;; Remove liquidity from pool
(define-public (remove-liquidity (lp-tokens uint) (min-b2s uint) (min-stx uint))
  (let (
    (provider tx-sender)
    (provider-balance (default-to u0 (map-get? lp-balances provider)))
    (current-reserve-b2s (var-get reserve-b2s))
    (current-reserve-stx (var-get reserve-stx))
    (current-total-lp (var-get total-lp-tokens))
  )
    ;; Validations
    (asserts! (> lp-tokens u0) err-zero-amount)
    (asserts! (>= provider-balance lp-tokens) err-insufficient-balance)
    
    ;; Calculate amounts to return
    (let (
      (b2s-to-return (/ (* lp-tokens current-reserve-b2s) current-total-lp))
      (stx-to-return (/ (* lp-tokens current-reserve-stx) current-total-lp))
    )
      (asserts! (>= b2s-to-return min-b2s) err-slippage-too-high)
      (asserts! (>= stx-to-return min-stx) err-slippage-too-high)
      
      ;; Update reserves
      (var-set reserve-b2s (- current-reserve-b2s b2s-to-return))
      (var-set reserve-stx (- current-reserve-stx stx-to-return))
      
      ;; Burn LP tokens
      (var-set total-lp-tokens (- current-total-lp lp-tokens))
      (map-set lp-balances provider (- provider-balance lp-tokens))
      
      ;; Update history
      (update-liquidity-history provider lp-tokens false)
      
      (ok {b2s: b2s-to-return, stx: stx-to-return})
    )
  )
)

;; Swap B2S for STX
(define-public (swap-b2s-for-stx (amount-b2s-in uint) (min-stx-out uint))
  (let (
    (trader tx-sender)
    (reserve-b2s-before (var-get reserve-b2s))
    (reserve-stx-before (var-get reserve-stx))
  )
    (asserts! (> amount-b2s-in u0) err-zero-amount)
    (asserts! (> reserve-stx-before u0) err-insufficient-liquidity)
    
    ;; Calculate output with fee
    (let (
      (amount-with-fee (- amount-b2s-in (/ (* amount-b2s-in fee-numerator) fee-denominator)))
      (stx-out (get-amount-out amount-with-fee reserve-b2s-before reserve-stx-before))
    )
      (asserts! (>= stx-out min-stx-out) err-slippage-too-high)
      
      ;; Update reserves
      (var-set reserve-b2s (+ reserve-b2s-before amount-b2s-in))
      (var-set reserve-stx (- reserve-stx-before stx-out))
      
      ;; Update volume
      (var-set total-volume-b2s (+ (var-get total-volume-b2s) amount-b2s-in))
      
      (ok stx-out)
    )
  )
)

;; Swap STX for B2S
(define-public (swap-stx-for-b2s (amount-stx-in uint) (min-b2s-out uint))
  (let (
    (trader tx-sender)
    (reserve-b2s-before (var-get reserve-b2s))
    (reserve-stx-before (var-get reserve-stx))
  )
    (asserts! (> amount-stx-in u0) err-zero-amount)
    (asserts! (> reserve-b2s-before u0) err-insufficient-liquidity)
    
    ;; Calculate output with fee
    (let (
      (amount-with-fee (- amount-stx-in (/ (* amount-stx-in fee-numerator) fee-denominator)))
      (b2s-out (get-amount-out amount-with-fee reserve-stx-before reserve-b2s-before))
    )
      (asserts! (>= b2s-out min-b2s-out) err-slippage-too-high)
      
      ;; Update reserves
      (var-set reserve-stx (+ reserve-stx-before amount-stx-in))
      (var-set reserve-b2s (- reserve-b2s-before b2s-out))
      
      ;; Update volume
      (var-set total-volume-stx (+ (var-get total-volume-stx) amount-stx-in))
      
      (ok b2s-out)
    )
  )
)

;; Private Functions

;; Calculate output amount using constant product formula
(define-private (get-amount-out (amount-in uint) (reserve-in uint) (reserve-out uint))
  (let (
    (numerator (* amount-in reserve-out))
    (denominator (+ reserve-in amount-in))
  )
    (/ numerator denominator)
  )
)

;; Square root helper (Newton's method)
(define-private (sqrti (n uint))
  (if (<= n u1)
    n
    (let (
      (x0 (/ n u2))
      (x1 (/ (+ x0 (/ n x0)) u2))
    )
      (if (< x1 x0)
        (sqrti-helper n x1 x0)
        x0
      )
    )
  )
)

(define-private (sqrti-helper (n uint) (x1 uint) (x0 uint))
  (if (>= x1 x0)
    x0
    (let ((x2 (/ (+ x1 (/ n x1)) u2)))
      (sqrti-helper n x2 x1)
    )
  )
)

;; Update liquidity history
(define-private (update-liquidity-history (provider principal) (amount uint) (is-add bool))
  (let (
    (current-history (default-to 
      {added: u0, removed: u0, rewards: u0}
      (map-get? liquidity-history provider)))
  )
    (map-set liquidity-history provider {
      added: (if is-add (+ (get added current-history) amount) (get added current-history)),
      removed: (if is-add (get removed current-history) (+ (get removed current-history) amount)),
      rewards: (get rewards current-history)
    })
  )
)

;; Read-only Functions

;; Get reserves
(define-read-only (get-reserves)
  (ok {b2s: (var-get reserve-b2s), stx: (var-get reserve-stx)})
)

;; Get LP token balance
(define-read-only (get-lp-balance (provider principal))
  (ok (default-to u0 (map-get? lp-balances provider)))
)

;; Get total LP tokens
(define-read-only (get-total-lp-tokens)
  (ok (var-get total-lp-tokens))
)

;; Quote swap output
(define-read-only (quote-swap-b2s-for-stx (amount-b2s uint))
  (let (
    (reserve-b2s (var-get reserve-b2s))
    (reserve-stx (var-get reserve-stx))
    (amount-with-fee (- amount-b2s (/ (* amount-b2s fee-numerator) fee-denominator)))
  )
    (ok (get-amount-out amount-with-fee reserve-b2s reserve-stx))
  )
)

;; Quote swap output
(define-read-only (quote-swap-stx-for-b2s (amount-stx uint))
  (let (
    (reserve-b2s (var-get reserve-b2s))
    (reserve-stx (var-get reserve-stx))
    (amount-with-fee (- amount-stx (/ (* amount-stx fee-numerator) fee-denominator)))
  )
    (ok (get-amount-out amount-with-fee reserve-stx reserve-b2s))
  )
)

;; Get current price (B2S per STX)
(define-read-only (get-price)
  (let (
    (reserve-b2s (var-get reserve-b2s))
    (reserve-stx (var-get reserve-stx))
  )
    (if (and (> reserve-b2s u0) (> reserve-stx u0))
      (ok (/ reserve-b2s reserve-stx))
      (ok u0)
    )
  )
)

;; Get total volume
(define-read-only (get-total-volume)
  (ok {
    b2s: (var-get total-volume-b2s),
    stx: (var-get total-volume-stx)
  })
)

;; Get liquidity history
(define-read-only (get-liquidity-history (provider principal))
  (ok (map-get? liquidity-history provider))
)

;; Calculate share of pool
(define-read-only (get-pool-share (provider principal))
  (let (
    (provider-lp (default-to u0 (map-get? lp-balances provider)))
    (total-lp (var-get total-lp-tokens))
  )
    (if (> total-lp u0)
      (ok (/ (* provider-lp u10000) total-lp)) ;; Returns basis points
      (ok u0)
    )
  )
)