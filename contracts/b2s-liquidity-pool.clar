;; =============================================================================
;; B2S Liquidity Pool - AMM (Automated Market Maker)
;; Swap B2S <-> STX using the constant product formula (x * y = k)
;; Based on Uniswap v2 design
;; Uses: stacks-clarity-toolkit/toolkit-math
;; =============================================================================

(define-constant contract-owner tx-sender)
(define-constant TOOLKIT 'SP936YWJPST8GB8FFRCN7CC6P2YR5K6NNBAARQ96.toolkit-math)

;; Error codes
(define-constant err-not-authorized         (err u401))
(define-constant err-insufficient-balance   (err u402))
(define-constant err-slippage-too-high      (err u403))
(define-constant err-insufficient-liquidity (err u404))
(define-constant err-invalid-amount         (err u405))
(define-constant err-zero-amount            (err u406))
(define-constant err-overflow               (err u407))

;; Fee = 0.25% (25 / 10000)
(define-constant fee-numerator   u25)
(define-constant fee-denominator u10000)
(define-constant minimum-liquidity u1000)

;; State
(define-data-var reserve-b2s      uint u0)
(define-data-var reserve-stx      uint u0)
(define-data-var total-lp-tokens  uint u0)
(define-data-var total-volume-b2s uint u0)
(define-data-var total-volume-stx uint u0)

;; Maps
(define-map lp-balances principal uint)
(define-map liquidity-history principal {
  added:   uint,
  removed: uint,
  rewards: uint
})

;; =============================================================================
;; Private helpers — all math via toolkit
;; =============================================================================

(define-private (min-uint (a uint) (b uint))
  (contract-call? TOOLKIT min a b)
)

;; Uniswap v2 formula with toolkit safe math:
;; amount-out = (amount-in * (fee-denom - fee-num) * reserve-out)
;;            / (reserve-in * fee-denom + amount-in * (fee-denom - fee-num))
(define-private (get-amount-out
    (amount-in   uint)
    (reserve-in  uint)
    (reserve-out uint))
  (let (
    (fee-adjusted       (- fee-denominator fee-numerator))
    (amount-in-with-fee (unwrap! (contract-call? TOOLKIT safe-mul amount-in fee-adjusted) err-overflow))
    (numerator          (unwrap! (contract-call? TOOLKIT safe-mul amount-in-with-fee reserve-out) err-overflow))
    (denom-left         (unwrap! (contract-call? TOOLKIT safe-mul reserve-in fee-denominator) err-overflow))
    (denominator        (unwrap! (contract-call? TOOLKIT safe-add denom-left amount-in-with-fee) err-overflow))
  )
    (contract-call? TOOLKIT safe-div numerator denominator)
  )
)

;; Integer square root via Newton's method
(define-private (sqrt-newton (n uint))
  (if (<= n u1)
    n
    (let (
      (x0 (unwrap-panic (contract-call? TOOLKIT safe-div n u2)))
      (x1 (unwrap-panic (contract-call? TOOLKIT safe-div
             (+ x0 (unwrap-panic (contract-call? TOOLKIT safe-div n x0)))
             u2)))
      (x2 (unwrap-panic (contract-call? TOOLKIT safe-div
             (+ x1 (unwrap-panic (contract-call? TOOLKIT safe-div n x1)))
             u2)))
      (x3 (unwrap-panic (contract-call? TOOLKIT safe-div
             (+ x2 (unwrap-panic (contract-call? TOOLKIT safe-div n x2)))
             u2)))
      (x4 (unwrap-panic (contract-call? TOOLKIT safe-div
             (+ x3 (unwrap-panic (contract-call? TOOLKIT safe-div n x3)))
             u2)))
      (x5 (unwrap-panic (contract-call? TOOLKIT safe-div
             (+ x4 (unwrap-panic (contract-call? TOOLKIT safe-div n x4)))
             u2)))
      (x6 (unwrap-panic (contract-call? TOOLKIT safe-div
             (+ x5 (unwrap-panic (contract-call? TOOLKIT safe-div n x5)))
             u2)))
      (x7 (unwrap-panic (contract-call? TOOLKIT safe-div
             (+ x6 (unwrap-panic (contract-call? TOOLKIT safe-div n x6)))
             u2)))
      (x8 (unwrap-panic (contract-call? TOOLKIT safe-div
             (+ x7 (unwrap-panic (contract-call? TOOLKIT safe-div n x7)))
             u2)))
    )
      x8
    )
  )
)

;; =============================================================================
;; Read-only
;; =============================================================================

(define-read-only (get-reserves)
  { b2s: (var-get reserve-b2s), stx: (var-get reserve-stx) }
)

(define-read-only (get-lp-balance (who principal))
  (default-to u0 (map-get? lp-balances who))
)

(define-read-only (get-total-lp) (var-get total-lp-tokens))

(define-read-only (quote-swap-b2s-for-stx (amount-in uint))
  (get-amount-out amount-in (var-get reserve-b2s) (var-get reserve-stx))
)

(define-read-only (quote-swap-stx-for-b2s (amount-in uint))
  (get-amount-out amount-in (var-get reserve-stx) (var-get reserve-b2s))
)

(define-read-only (get-pool-stats)
  {
    reserve-b2s:      (var-get reserve-b2s),
    reserve-stx:      (var-get reserve-stx),
    total-lp:         (var-get total-lp-tokens),
    total-volume-b2s: (var-get total-volume-b2s),
    total-volume-stx: (var-get total-volume-stx),
  }
)