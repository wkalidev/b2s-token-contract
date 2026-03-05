;; B2S Prediction Market
;; Phase 1: Owner resolve -> Phase 2: DAO vote

(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-NOT-OWNER (err u100))
(define-constant ERR-MARKET-NOT-FOUND (err u101))
(define-constant ERR-MARKET-CLOSED (err u102))
(define-constant ERR-MARKET-NOT-RESOLVED (err u103))
(define-constant ERR-MARKET-ALREADY-RESOLVED (err u104))
(define-constant ERR-ALREADY-CLAIMED (err u105))
(define-constant ERR-NO-BET (err u106))
(define-constant ERR-INVALID-AMOUNT (err u107))
(define-constant ERR-DEADLINE-NOT-REACHED (err u109))
(define-constant ERR-MARKET-OPEN (err u110))
(define-constant PLATFORM-FEE-PCT u200)
(define-constant MIN-BET u1000000)

(define-data-var market-counter uint u0)
(define-data-var total-platform-fees uint u0)

(define-map markets
  { market-id: uint }
  {
    creator: principal,
    question: (string-utf8 256),
    category: (string-ascii 32),
    deadline: uint,
    resolved: bool,
    outcome: bool,
    total-yes: uint,
    total-no: uint,
    resolved-by: (optional principal),
  }
)

(define-map bets
  { market-id: uint, bettor: principal }
  {
    yes-amount: uint,
    no-amount: uint,
    claimed: bool,
  }
)

(define-read-only (get-market (market-id uint))
  (map-get? markets { market-id: market-id })
)

(define-read-only (get-bet (market-id uint) (bettor principal))
  (map-get? bets { market-id: market-id, bettor: bettor })
)

(define-read-only (get-market-count)
  (var-get market-counter)
)

(define-read-only (get-platform-fees)
  (var-get total-platform-fees)
)

(define-public (create-market
  (question (string-utf8 256))
  (category (string-ascii 32))
  (deadline-blocks uint))
  (let (
    (market-id (+ (var-get market-counter) u1))
    (deadline (+ block-height deadline-blocks))
  )
    (map-set markets
      { market-id: market-id }
      {
        creator: tx-sender,
        question: question,
        category: category,
        deadline: deadline,
        resolved: false,
        outcome: false,
        total-yes: u0,
        total-no: u0,
        resolved-by: none,
      }
    )
    (var-set market-counter market-id)
    (ok market-id)
  )
)

(define-public (place-bet (market-id uint) (vote bool) (amount uint))
  (let (
    (market (unwrap! (map-get? markets { market-id: market-id }) ERR-MARKET-NOT-FOUND))
    (existing-bet (default-to
      { yes-amount: u0, no-amount: u0, claimed: false }
      (map-get? bets { market-id: market-id, bettor: tx-sender })))
  )
    (asserts! (not (get resolved market)) ERR-MARKET-ALREADY-RESOLVED)
    (asserts! (< block-height (get deadline market)) ERR-MARKET-CLOSED)
    (asserts! (>= amount MIN-BET) ERR-INVALID-AMOUNT)
    (try! (contract-call? .b2s-token transfer amount tx-sender (as-contract tx-sender) none))
    (map-set bets
      { market-id: market-id, bettor: tx-sender }
      {
        yes-amount: (if vote (+ (get yes-amount existing-bet) amount) (get yes-amount existing-bet)),
        no-amount: (if vote (get no-amount existing-bet) (+ (get no-amount existing-bet) amount)),
        claimed: false,
      }
    )
    (map-set markets
      { market-id: market-id }
      (merge market {
        total-yes: (if vote (+ (get total-yes market) amount) (get total-yes market)),
        total-no: (if vote (get total-no market) (+ (get total-no market) amount)),
      })
    )
    (ok true)
  )
)

(define-public (resolve-market (market-id uint) (outcome bool))
  (let (
    (market (unwrap! (map-get? markets { market-id: market-id }) ERR-MARKET-NOT-FOUND))
  )
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-OWNER)
    (asserts! (not (get resolved market)) ERR-MARKET-ALREADY-RESOLVED)
    (asserts! (>= block-height (get deadline market)) ERR-DEADLINE-NOT-REACHED)
    (map-set markets
      { market-id: market-id }
      (merge market {
        resolved: true,
        outcome: outcome,
        resolved-by: (some tx-sender),
      })
    )
    (ok true)
  )
)

(define-public (claim-winnings (market-id uint))
  (let (
    (market (unwrap! (map-get? markets { market-id: market-id }) ERR-MARKET-NOT-FOUND))
    (bet (unwrap! (map-get? bets { market-id: market-id, bettor: tx-sender }) ERR-NO-BET))
    (total-pool (+ (get total-yes market) (get total-no market)))
    (user-side (if (get outcome market) (get yes-amount bet) (get no-amount bet)))
    (winning-pool (if (get outcome market) (get total-yes market) (get total-no market)))
  )
    (asserts! (get resolved market) ERR-MARKET-NOT-RESOLVED)
    (asserts! (not (get claimed bet)) ERR-ALREADY-CLAIMED)
    (asserts! (> user-side u0) ERR-NO-BET)
    (asserts! (> winning-pool u0) ERR-INVALID-AMOUNT)
    (let (
      (gross-payout (/ (* user-side total-pool) winning-pool))
      (fee (/ (* gross-payout PLATFORM-FEE-PCT) u10000))
      (net-payout (- gross-payout fee))
    )
      (map-set bets
        { market-id: market-id, bettor: tx-sender }
        (merge bet { claimed: true })
      )
      (var-set total-platform-fees (+ (var-get total-platform-fees) fee))
      (try! (as-contract (contract-call? .b2s-token transfer net-payout tx-sender tx-sender none)))
      (ok net-payout)
    )
  )
)

(define-public (withdraw-fees (recipient principal))
  (let ((fees (var-get total-platform-fees)))
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-OWNER)
    (asserts! (> fees u0) ERR-INVALID-AMOUNT)
    (var-set total-platform-fees u0)
    (as-contract (contract-call? .b2s-token transfer fees tx-sender recipient none))
  )
)

(define-public (emergency-refund (market-id uint))
  (let (
    (market (unwrap! (map-get? markets { market-id: market-id }) ERR-MARKET-NOT-FOUND))
    (bet (unwrap! (map-get? bets { market-id: market-id, bettor: tx-sender }) ERR-NO-BET))
    (user-total (+ (get yes-amount bet) (get no-amount bet)))
  )
    (asserts! (not (get resolved market)) ERR-MARKET-ALREADY-RESOLVED)
    (asserts! (>= block-height (+ (get deadline market) u1000)) ERR-MARKET-OPEN)
    (asserts! (not (get claimed bet)) ERR-ALREADY-CLAIMED)
    (asserts! (> user-total u0) ERR-NO-BET)
    (map-set bets
      { market-id: market-id, bettor: tx-sender }
      (merge bet { claimed: true })
    )
    (as-contract (contract-call? .b2s-token transfer user-total tx-sender tx-sender none))
  )
)
