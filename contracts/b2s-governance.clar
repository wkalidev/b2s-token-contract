;; B2S Governance DAO
;; On-chain voting system for protocol decisions

(define-constant contract-owner tx-sender)

;; Error codes
(define-constant err-not-authorized (err u401))
(define-constant err-proposal-not-found (err u404))
(define-constant err-already-voted (err u405))
(define-constant err-voting-closed (err u406))
(define-constant err-insufficient-stake (err u407))
(define-constant err-proposal-not-passed (err u408))

;; Constants
(define-constant min-stake-to-propose u10000000000) ;; 10,000 tokens
(define-constant voting-period u1008) ;; ~7 days (144 blocks/day)
(define-constant quorum-percentage u20) ;; 20% of staked tokens
(define-constant approval-threshold u51) ;; 51% approval needed

;; Data vars
(define-data-var proposal-count uint u0)
(define-data-var total-voting-power uint u0)

;; Proposal data structure
(define-map proposals uint {
  proposer: principal,
  title: (string-ascii 100),
  description: (string-utf8 500),
  start-block: uint,
  end-block: uint,
  yes-votes: uint,
  no-votes: uint,
  executed: bool,
  category: (string-ascii 20)
})

;; Track who voted on which proposal
(define-map votes {proposal-id: uint, voter: principal} {
  vote: bool,
  voting-power: uint
})

;; User voting power (based on staked amount)
(define-map voting-power principal uint)

;; Public Functions

;; Create a proposal
(define-public (create-proposal 
  (title (string-ascii 100))
  (description (string-utf8 500))
  (category (string-ascii 20)))
  (let (
    (proposer tx-sender)
    (proposer-stake (default-to u0 (map-get? voting-power proposer)))
    (proposal-id (+ (var-get proposal-count) u1))
    (start-block block-height)
    (end-block (+ block-height voting-period))
  )
    ;; Check minimum stake
    (asserts! (>= proposer-stake min-stake-to-propose) err-insufficient-stake)
    
    ;; Create proposal
    (map-set proposals proposal-id {
      proposer: proposer,
      title: title,
      description: description,
      start-block: start-block,
      end-block: end-block,
      yes-votes: u0,
      no-votes: u0,
      executed: false,
      category: category
    })
    
    (var-set proposal-count proposal-id)
    (ok proposal-id)
  )
)

;; Cast a vote
(define-public (cast-vote (proposal-id uint) (vote-yes bool))
  (let (
    (voter tx-sender)
    (voter-power (default-to u0 (map-get? voting-power voter)))
    (proposal (unwrap! (map-get? proposals proposal-id) err-proposal-not-found))
    (vote-key {proposal-id: proposal-id, voter: voter})
  )
    ;; Checks
    (asserts! (> voter-power u0) err-insufficient-stake)
    (asserts! (is-none (map-get? votes vote-key)) err-already-voted)
    (asserts! (<= block-height (get end-block proposal)) err-voting-closed)
    
    ;; Record vote
    (map-set votes vote-key {
      vote: vote-yes,
      voting-power: voter-power
    })
    
    ;; Update proposal vote counts
    (map-set proposals proposal-id (merge proposal {
      yes-votes: (if vote-yes 
        (+ (get yes-votes proposal) voter-power)
        (get yes-votes proposal)),
      no-votes: (if vote-yes
        (get no-votes proposal)
        (+ (get no-votes proposal) voter-power))
    }))
    
    (ok true)
  )
)

;; Execute passed proposal
(define-public (execute-proposal (proposal-id uint))
  (let (
    (proposal (unwrap! (map-get? proposals proposal-id) err-proposal-not-found))
  )
    ;; Checks
    (asserts! (>= block-height (get end-block proposal)) err-voting-closed)
    (asserts! (not (get executed proposal)) err-proposal-not-passed)
    
    ;; Check if proposal passed
    (asserts! (has-proposal-passed proposal-id) err-proposal-not-passed)
    
    ;; Mark as executed
    (map-set proposals proposal-id (merge proposal {executed: true}))
    
    ;; Execute proposal logic here
    (ok true)
  )
)

;; Set voting power (called by staking contract)
(define-public (set-voting-power (user principal) (power uint))
  (begin
    ;; In production, check this is called by authorized contract
    (map-set voting-power user power)
    (ok true)
  )
)

;; Read-only functions

;; Get proposal details
(define-read-only (get-proposal (proposal-id uint))
  (ok (map-get? proposals proposal-id))
)

;; Get vote
(define-read-only (get-vote (proposal-id uint) (voter principal))
  (ok (map-get? votes {proposal-id: proposal-id, voter: voter}))
)

;; Get voting power
(define-read-only (get-voting-power (user principal))
  (ok (default-to u0 (map-get? voting-power user)))
)

;; Check if proposal passed
(define-read-only (has-proposal-passed (proposal-id uint))
  (match (map-get? proposals proposal-id)
    proposal
      (let (
        (total-votes (+ (get yes-votes proposal) (get no-votes proposal)))
        (yes-percentage (if (> total-votes u0)
          (/ (* (get yes-votes proposal) u100) total-votes)
          u0))
        (quorum-met (>= total-votes (/ (* (var-get total-voting-power) quorum-percentage) u100)))
        (approval-met (>= yes-percentage approval-threshold))
      )
        (and quorum-met approval-met)
      )
    false
  )
)

;; Get proposal status
(define-read-only (get-proposal-status (proposal-id uint))
  (match (map-get? proposals proposal-id)
    proposal
      (if (get executed proposal)
        (ok "executed")
        (if (> block-height (get end-block proposal))
          (if (has-proposal-passed proposal-id)
            (ok "passed")
            (ok "failed"))
          (ok "active")))
    (err err-proposal-not-found)
  )
)

;; Get total proposals
(define-read-only (get-proposal-count)
  (ok (var-get proposal-count))
)

;; Calculate voting results
(define-read-only (get-voting-results (proposal-id uint))
  (match (map-get? proposals proposal-id)
    proposal
      (let (
        (total (+ (get yes-votes proposal) (get no-votes proposal)))
        (yes-pct (if (> total u0) (/ (* (get yes-votes proposal) u100) total) u0))
        (no-pct (if (> total u0) (/ (* (get no-votes proposal) u100) total) u0))
      )
        (ok {
          yes-votes: (get yes-votes proposal),
          no-votes: (get no-votes proposal),
          total-votes: total,
          yes-percentage: yes-pct,
          no-percentage: no-pct
        })
      )
    (err err-proposal-not-found)
  )
)