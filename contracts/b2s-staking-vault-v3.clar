;; B2S Staking Vault v3 - stake $B2S tokens, 12.5% base APY, multipliers 1x/1.5x/2x/3x
;; ============================================================
;; B2S Staking Vault v3
;; Contract: b2s-staking-vault-v3
;; Author: Wkalidev (zcodebase)
;; Uses: b2s-token-v4 (official token)
;; ============================================================

;;  Points to b2s-token-v4 (official mainnet token)
(define-constant B2S .b2s-token-v4)

;; Constants
(define-constant ERR-ZERO         (err u100))
(define-constant ERR-NOT-FOUND    (err u101))
(define-constant ERR-LOCKED       (err u102))
(define-constant ERR-UNAUTHORIZED (err u403))
(define-constant ERR-INSUFFICIENT (err u104))

;; APY multipliers in basis points (100 = 1x, 150 = 1.5x, 200 = 2x, 300 = 3x)
(define-constant MULTIPLIER-1X  u100)
(define-constant MULTIPLIER-15X u150)
(define-constant MULTIPLIER-2X  u200)
(define-constant MULTIPLIER-3X  u300)

;; Lock thresholds in blocks (~3.5d = 525, ~7d = 1050, ~14d = 2100)
(define-constant LOCK-35D u525)
(define-constant LOCK-7D  u1050)
(define-constant LOCK-14D u2100)

;; Annual blocks (~144/day * 365)
(define-constant BLOCKS-PER-YEAR u52560)

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

;; ============================================================
;; PRIVATE FUNCTIONS
;; ============================================================

(define-private (get-multiplier (blocks uint))
  (if (>= blocks LOCK-14D) MULTIPLIER-3X
    (if (>= blocks LOCK-7D) MULTIPLIER-2X
      (if (>= blocks LOCK-35D) MULTIPLIER-15X
        MULTIPLIER-1X
      )
    )
  )
)

;; ============================================================
;; REWARD CALCULATION
;; Base APY = 12.5% = 1250 bps
;; Formula: amount * (baseRate * multiplier / 100) * elapsed / (BLOCKS-PER-YEAR * 10000)
;; ============================================================

(define-read-only (get-pending-rewards (user principal))
  (match (map-get? vaults user)
    vault
    (let (
      (elapsed        (- block-height (get locked-at vault)))
      (amount         (get amount vault))
      (multiplier     (get multiplier vault))
      (base-rate      u1250)
      (effective-rate (/ (* base-rate multiplier) u100))
      (rewards        (/ (* (* amount effective-rate) elapsed) (* BLOCKS-PER-YEAR u10000)))
    )
      (ok rewards)
    )
    ERR-NOT-FOUND
  )
)

;; ============================================================
;; STAKING
;; ============================================================

(define-public (stake (amount uint) (lock-blocks uint))
  (begin
    (asserts! (> amount u0) ERR-ZERO)

    ;; Transfer b2s-token-v4 from user to vault contract
    (try! (contract-call? B2S transfer amount tx-sender (as-contract tx-sender) none))

    (let ((existing (map-get? vaults tx-sender)))
      (match existing
        prev
        ;; Add to existing vault
        (map-set vaults tx-sender {
          amount:      (+ (get amount prev) amount),
          locked-at:   block-height,
          lock-blocks: lock-blocks,
          multiplier:  (get-multiplier lock-blocks)
        })
        ;; New vault
        (begin
          (map-set vaults tx-sender {
            amount:      amount,
            locked-at:   block-height,
            lock-blocks: lock-blocks,
            multiplier:  (get-multiplier lock-blocks)
          })
          (var-set total-vaults (+ (var-get total-vaults) u1))
        )
      )
    )

    (var-set total-staked (+ (var-get total-staked) amount))

    (ok true)
  )
)

;; ============================================================
;; UNSTAKE - no amount arg, unstakes entire vault
;; ============================================================

(define-public (unstake)
  (let ((vault (unwrap! (map-get? vaults tx-sender) ERR-NOT-FOUND)))

    ;; Check lock period expired
    (asserts!
      (>= block-height (+ (get locked-at vault) (get lock-blocks vault)))
      ERR-LOCKED)

    ;; Return tokens to user
    (try!
      (as-contract
        (contract-call? B2S transfer
          (get amount vault)
          tx-sender
          tx-sender
          none)))

    ;; Update global stats
    (var-set total-staked
      (if (>= (var-get total-staked) (get amount vault))
        (- (var-get total-staked) (get amount vault))
        u0))

    ;; Remove vault
    (map-delete vaults tx-sender)

    (ok (get amount vault))
  )
)

;; ============================================================
;; COMPOUND - add pending rewards to vault
;; ============================================================

(define-public (compound-rewards)
  (let (
    (vault   (unwrap! (map-get? vaults tx-sender) ERR-NOT-FOUND))
    (pending (unwrap! (get-pending-rewards tx-sender) ERR-NOT-FOUND))
  )
    (asserts! (> pending u0) ERR-ZERO)

    (map-set vaults tx-sender {
      amount:      (+ (get amount vault) pending),
      locked-at:   (get locked-at vault),
      lock-blocks: (get lock-blocks vault),
      multiplier:  (get multiplier vault)
    })

    (var-set total-staked (+ (var-get total-staked) pending))

    (ok pending)
  )
)

;; ============================================================
;; ADMIN
;; ============================================================

(define-public (set-owner (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-UNAUTHORIZED)
    (var-set contract-owner new-owner)
    (ok true)
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

(define-read-only (get-owner)
  (ok (var-get contract-owner))
)
