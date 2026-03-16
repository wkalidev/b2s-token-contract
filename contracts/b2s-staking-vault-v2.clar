;; B2S Staking Vault v2 — stake $B2S tokens, 12.5% base APY, multipliers 1x/1.5x/2x/3x
;; ============================================================
;; B2S Staking Vault v2
;; Contract: b2s-staking-vault-v2
;; Author: Wkalidev (zcodebase)
;; Uses: stacks-clarity-toolkit/toolkit-math
;; ============================================================

;; Toolkit import
(define-constant TOOLKIT 'SP936YWJPST8GB8FFRCN7CC6P2YR5K6NNBAARQ96.toolkit-math)
(define-constant B2S     'SP936YWJPST8GB8FFRCN7CC6P2YR5K6NNBAARQ96.b2s-token)

;; Constants
(define-constant ERR-ZERO      (err u100))
(define-constant ERR-NOT-FOUND (err u101))
(define-constant ERR-LOCKED    (err u102))
(define-constant ERR-UNAUTHORIZED (err u403))

;; APY multipliers in basis points (100 = 1x, 150 = 1.5x, 200 = 2x, 300 = 3x)
(define-constant MULTIPLIER-1X   u100)
(define-constant MULTIPLIER-15X  u150)
(define-constant MULTIPLIER-2X   u200)
(define-constant MULTIPLIER-3X   u300)

;; Lock thresholds in blocks (~1 week = 525, ~2w = 1050, ~1mo = 2100)
(define-constant LOCK-1W  u525)
(define-constant LOCK-2W  u1050)
(define-constant LOCK-1M  u2100)

;; Contract owner
(define-data-var contract-owner principal tx-sender)

;; Maps & vars
(define-map vaults principal {
  amount:      uint,
  locked-at:   uint,
  lock-blocks: uint,
  multiplier:  uint
})

(define-data-var total-staked uint u0)
(define-data-var total-vaults uint u0)

;; Minimum rewards required to auto-compound (micro-tokens, 6 decimals)
;; Default = 1 B2S
(define-data-var compound-threshold uint u1000000)

;; ============================================================
;; PRIVATE FUNCTIONS
;; ============================================================

;; Get APY multiplier based on lock duration
(define-private (get-multiplier (blocks uint))
  (if (>= blocks LOCK-1M) MULTIPLIER-3X
    (if (>= blocks LOCK-2W) MULTIPLIER-2X
      (if (>= blocks LOCK-1W) MULTIPLIER-15X
        MULTIPLIER-1X
      )
    )
  )
)

;; ============================================================
;; REWARD CALCULATION
;; ============================================================

;; Base APY = 12.5% = 1250 bps
(define-read-only (get-pending-rewards (user principal))
  (match (map-get? vaults user)
    vault
    (let (
      (elapsed    (- block-height (get locked-at vault)))
      (base-rate  u1250)
      (multiplier (get multiplier vault))

      (effective-rate
        (unwrap-panic
          (contract-call? TOOLKIT safe-div
            (unwrap-panic (contract-call? TOOLKIT safe-mul base-rate multiplier))
            u100)))

      ;; rewards formula
      (rewards
        (unwrap-panic
          (contract-call? TOOLKIT safe-div
            (unwrap-panic
              (contract-call? TOOLKIT safe-mul
                (unwrap-panic
                  (contract-call? TOOLKIT safe-mul
                    (get amount vault)
                    effective-rate))
                elapsed))
            u525600000)))
    )
      (ok rewards)
    )
    ERR-NOT-FOUND
  )
)

;; ============================================================
;; ADMIN
;; ============================================================

(define-read-only (get-compound-threshold)
  (ok (var-get compound-threshold))
)

(define-public (set-compound-threshold (amount uint))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-UNAUTHORIZED)
    (asserts! (> amount u0) ERR-ZERO)

    (var-set compound-threshold amount)

    (ok amount)
  )
)

;; ============================================================
;; STAKING
;; ============================================================

(define-public (stake (amount uint) (lock-blocks uint))
  (begin
    (asserts! (> amount u0) ERR-ZERO)

    (try! (contract-call? B2S transfer amount tx-sender (as-contract tx-sender) none))

    (map-set vaults tx-sender {
      amount:      amount,
      locked-at:   block-height,
      lock-blocks: lock-blocks,
      multiplier:  (get-multiplier lock-blocks)
    })

    (var-set total-staked
      (unwrap-panic
        (contract-call? TOOLKIT safe-add
          (var-get total-staked)
          amount)))

    (var-set total-vaults (+ (var-get total-vaults) u1))

    (ok true)
  )
)

;; ============================================================
;; UNSTAKE
;; ============================================================

(define-public (unstake)
  (let ((vault (unwrap! (map-get? vaults tx-sender) ERR-NOT-FOUND)))

    (asserts!
      (>= block-height (+ (get locked-at vault) (get lock-blocks vault)))
      ERR-LOCKED)

    (try!
      (as-contract
        (contract-call? B2S transfer
          (get amount vault)
          tx-sender
          tx-sender
          none)))

    (var-set total-staked
      (unwrap-panic
        (contract-call? TOOLKIT safe-sub
          (var-get total-staked)
          (get amount vault))))

    (map-delete vaults tx-sender)

    (ok (get amount vault))
  )
)

;; ============================================================
;; COMPOUND
;; ============================================================

(define-public (compound-rewards)

  (let (
        (pending (unwrap! (get-pending-rewards tx-sender) ERR-NOT-FOUND))
        (threshold (var-get compound-threshold))
        (vault (unwrap! (map-get? vaults tx-sender) ERR-NOT-FOUND))
       )

    (asserts! (>= pending threshold) ERR-NOT-FOUND)

    (map-set vaults tx-sender {

      amount:
        (unwrap-panic
          (contract-call? TOOLKIT safe-add
            (get amount vault)
            pending)),

      locked-at:   (get locked-at vault),
      lock-blocks: (get lock-blocks vault),
      multiplier:  (get multiplier vault)

    })

    (var-set total-staked
      (unwrap-panic
        (contract-call? TOOLKIT safe-add
          (var-get total-staked)
          pending)))

    (ok pending)
  )
)

;; ============================================================
;; READ ONLY
;; ============================================================

(define-read-only (get-vault (user principal))
  (ok (map-get? vaults user))
)

(define-read-only (get-stats)
  (ok {
    total-staked: (var-get total-staked),
    total-vaults: (var-get total-vaults)
  })
)

(define-read-only (get-unlock-block (user principal))
  (match (map-get? vaults user)
    v (ok (+ (get locked-at v) (get lock-blocks v)))
    ERR-NOT-FOUND
  )
)

(define-read-only (get-multiplier-for (blocks uint))
  (ok (get-multiplier blocks))
)
