;; =============================================================================
;; B2S Rewards Distributor
;; Automatic reward distribution for B2S stakers
;; =============================================================================

(define-constant contract-owner tx-sender)

;; -----------------------------------------------------------------------------
;; Error codes
;; -----------------------------------------------------------------------------
(define-constant err-not-authorized       (err u401))
(define-constant err-insufficient-balance (err u402))
(define-constant err-not-staked           (err u403))
(define-constant err-too-soon             (err u404))
(define-constant err-invalid-amount       (err u405))
(define-constant err-below-minimum        (err u406))
(define-constant err-above-maximum        (err u407))

;; -----------------------------------------------------------------------------
;; Constants
;; blocks-per-day  = 144  (~10 min blocks)
;; blocks-per-year = 144 * 365 = 52560
;; precision       = 1_000_000 (6 decimals)
;; min-stake       = 1 token  (1_000_000 micro-units)
;; max-stake       = 1M tokens
;; -----------------------------------------------------------------------------
(define-constant blocks-per-day  u144)
(define-constant blocks-per-year u52560)
(define-constant precision        u1000000)
(define-constant min-stake        u1000000)
(define-constant max-stake        u1000000000000)

;; -----------------------------------------------------------------------------
;; State variables
;; base-apy: 12.5% = 125000 / 1_000_000
;; -----------------------------------------------------------------------------
(define-data-var base-apy                  uint u125000)
(define-data-var total-staked              uint u0)
(define-data-var total-rewards-distributed uint u0)

;; -----------------------------------------------------------------------------
;; Maps
;; -----------------------------------------------------------------------------
(define-map staker-info principal {
  staked-amount:        uint,
  stake-block:          uint,
  last-reward-block:    uint,
  total-rewards-earned: uint
})

;; =============================================================================
;; Private helpers
;; =============================================================================

;; reward = staked * apy * blocks-elapsed / (precision * blocks-per-year)
(define-private (compute-rewards (staked uint) (last-reward-block uint))
  (let (
    (blocks-elapsed (- block-height last-reward-block))
    (apy            (var-get base-apy))
  )
    (/ (* (* staked apy) blocks-elapsed)
       (* precision blocks-per-year))
  )
)

;; Internal claim: updates state and returns reward amount (0 if nothing to claim)
(define-private (do-claim (staker principal))
  (match (map-get? staker-info staker)
    info
      (let (
        (staked  (get staked-amount info))
        (pending (compute-rewards staked (get last-reward-block info)))
      )
        (if (> pending u0)
          (begin
            (map-set staker-info staker (merge info {
              last-reward-block:    block-height,
              total-rewards-earned: (+ (get total-rewards-earned info) pending)
            }))
            (var-set total-rewards-distributed
              (+ (var-get total-rewards-distributed) pending))
            pending
          )
          u0
        )
      )
    u0
  )
)

;; =============================================================================
;; Public functions
;; =============================================================================

;; -----------------------------------------------------------------------------
;; Stake B2S tokens
;; -----------------------------------------------------------------------------
(define-public (stake (amount uint))
  (let (
    (staker       tx-sender)
    (current-info (default-to
      { staked-amount: u0, stake-block: u0, last-reward-block: u0, total-rewards-earned: u0 }
      (map-get? staker-info staker)))
    (new-total    (+ (get staked-amount current-info) amount))
  )
    (asserts! (> amount u0)            err-invalid-amount)
    (asserts! (>= amount min-stake)    err-below-minimum)
    (asserts! (<= new-total max-stake) err-above-maximum)

    (let (
      (claimed (do-claim staker))
    )
      ;; TODO: add ft-transfer? here once B2S token contract is known
      ;; (try! (contract-call? .b2s-token transfer amount staker (as-contract tx-sender) none))

      (map-set staker-info staker (merge current-info {
        staked-amount:     new-total,
        stake-block:       block-height,
        last-reward-block: block-height
      }))

      (var-set total-staked (+ (var-get total-staked) amount))
      (ok amount)
    )
  )
)

;; -----------------------------------------------------------------------------
;; Claim pending rewards
;; -----------------------------------------------------------------------------
(define-public (claim-rewards)
  (let (
    (staker  tx-sender)
    (pending (do-claim staker))
  )
    (asserts! (is-some (map-get? staker-info staker)) err-not-staked)
    (asserts! (> pending u0)                          err-too-soon)

    ;; TODO: transfer reward tokens to staker
    ;; (try! (as-contract (contract-call? .b2s-token transfer pending tx-sender staker none)))

    (ok pending)
  )
)

;; -----------------------------------------------------------------------------
;; Unstake tokens (claims pending rewards first)
;; -----------------------------------------------------------------------------
(define-public (unstake (amount uint))
  (let (
    (staker tx-sender)
    (info   (unwrap! (map-get? staker-info staker) err-not-staked))
    (staked (get staked-amount info))
  )
    (asserts! (> amount u0)      err-invalid-amount)
    (asserts! (>= staked amount) err-insufficient-balance)

    (let (
      (claimed (do-claim staker))
    )
      ;; TODO: return B2S tokens to staker
      ;; (try! (as-contract (contract-call? .b2s-token transfer amount tx-sender staker none)))

      (map-set staker-info staker (merge info {
        staked-amount: (- staked amount)
      }))

      (var-set total-staked (- (var-get total-staked) amount))
      (ok amount)
    )
  )
)

;; -----------------------------------------------------------------------------
;; Admin: update base APY (owner only)
;; e.g. u125000 = 12.5%,  u200000 = 20%
;; -----------------------------------------------------------------------------
(define-public (set-base-apy (new-apy uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-not-authorized)
    (asserts! (> new-apy u0)                   err-invalid-amount)
    (var-set base-apy new-apy)
    (ok new-apy)
  )
)

;; =============================================================================
;; Read-only functions
;; =============================================================================

(define-read-only (get-pending-rewards (staker principal))
  (match (map-get? staker-info staker)
    info (ok (compute-rewards (get staked-amount info) (get last-reward-block info)))
    (ok u0)
  )
)

(define-read-only (get-staker-info (staker principal))
  (ok (map-get? staker-info staker))
)

(define-read-only (get-total-staked)
  (ok (var-get total-staked))
)

(define-read-only (get-total-rewards-distributed)
  (ok (var-get total-rewards-distributed))
)

(define-read-only (get-base-apy)
  (ok (var-get base-apy))
)

;; Estimate rewards for a given stake amount over N days
(define-read-only (estimate-rewards (amount uint) (days uint))
  (ok (/ (* (* amount (var-get base-apy)) (* days blocks-per-day))
         (* precision blocks-per-year)))
)
