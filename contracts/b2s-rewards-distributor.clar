;; B2S Rewards Distributor
;; Automatic reward distribution for stakers

(define-constant contract-owner tx-sender)

;; Error codes
(define-constant err-not-authorized (err u401))
(define-constant err-insufficient-balance (err u402))
(define-constant err-not-staked (err u403))
(define-constant err-too-soon (err u404))
(define-constant err-invalid-amount (err u405))

;; Constants
(define-constant blocks-per-day u144) ;; ~10 min blocks
(define-constant precision u1000000) ;; 6 decimals
(define-constant base-apy u125000) ;; 12.5% (125000 / precision)

;; Data vars
(define-data-var total-staked uint u0)
(define-data-var total-rewards-distributed uint u0)

;; Data maps
(define-map staker-info principal {
  staked-amount: uint,
  stake-timestamp: uint,
  last-reward-claim: uint,
  total-rewards-earned: uint
})

(define-map pool-config {
  min-stake: uint,
  max-stake: uint,
  lock-period: uint,
  bonus-apy: uint
})

;; Initialize default pool
(map-set pool-config {
  min-stake: u1000000, ;; 1 token
  max-stake: u1000000000000, ;; 1M tokens
  lock-period: u0, ;; No lock
  bonus-apy: u0
})

;; Stake tokens
(define-public (stake (amount uint))
  (let (
    (staker tx-sender)
    (current-block block-height)
    (current-info (default-to 
      {staked-amount: u0, stake-timestamp: u0, last-reward-claim: u0, total-rewards-earned: u0}
      (map-get? staker-info staker)
    ))
  )
    (asserts! (> amount u0) err-invalid-amount)
    
    ;; Update staker info
    (map-set staker-info staker {
      staked-amount: (+ (get staked-amount current-info) amount),
      stake-timestamp: current-block,
      last-reward-claim: current-block,
      total-rewards-earned: (get total-rewards-earned current-info)
    })
    
    ;; Update total staked
    (var-set total-staked (+ (var-get total-staked) amount))
    
    (ok true)
  )
)

;; Calculate pending rewards
(define-read-only (get-pending-rewards (staker principal))
  (let (
    (info (unwrap! (map-get? staker-info staker) (ok u0)))
    (staked (get staked-amount info))
    (last-claim (get last-reward-claim info))
    (blocks-passed (- block-height last-claim))
    (days-passed (/ blocks-passed blocks-per-day))
  )
    (if (is-eq staked u0)
      (ok u0)
      (ok (/ (* (* staked base-apy) days-passed) (* precision u365)))
    )
  )
)

;; Claim rewards
(define-public (claim-rewards)
  (let (
    (staker tx-sender)
    (pending (unwrap! (get-pending-rewards staker) err-not-staked))
    (info (unwrap! (map-get? staker-info staker) err-not-staked))
  )
    (asserts! (> pending u0) err-too-soon)
    
    ;; Update staker info
    (map-set staker-info staker (merge info {
      last-reward-claim: block-height,
      total-rewards-earned: (+ (get total-rewards-earned info) pending)
    }))
    
    ;; Update total rewards distributed
    (var-set total-rewards-distributed (+ (var-get total-rewards-distributed) pending))
    
    (ok pending)
  )
)

;; Unstake tokens
(define-public (unstake (amount uint))
  (let (
    (staker tx-sender)
    (info (unwrap! (map-get? staker-info staker) err-not-staked))
    (staked (get staked-amount info))
  )
    (asserts! (> amount u0) err-invalid-amount)
    (asserts! (>= staked amount) err-insufficient-balance)
    
    ;; Claim pending rewards first
    (try! (claim-rewards))
    
    ;; Update staker info
    (map-set staker-info staker (merge info {
      staked-amount: (- staked amount)
    }))
    
    ;; Update total staked
    (var-set total-staked (- (var-get total-staked) amount))
    
    (ok true)
  )
)

;; Get staker info
(define-read-only (get-staker-info (staker principal))
  (ok (map-get? staker-info staker))
)

;; Get APY for amount
(define-read-only (calculate-apy (amount uint) (days uint))
  (ok (/ (* (* amount base-apy) days) (* precision u365)))
)

;; Get total staked
(define-read-only (get-total-staked)
  (ok (var-get total-staked))
)

;; Get total rewards distributed
(define-read-only (get-total-rewards-distributed)
  (ok (var-get total-rewards-distributed))
)

;; Admin: Set APY (for future governance)
(define-public (set-base-apy (new-apy uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-not-authorized)
    ;; Would update base-apy constant in real implementation
    (ok true)
  )
)