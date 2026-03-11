;; ============================================================
;; B2S Fee Router - Bridge Fee Collector
;; Contract: b2s-fee-router
;; Author: Wkalidev (zcodebase)
;; Uses: stacks-clarity-toolkit/toolkit-math
;; ============================================================

;; Toolkit import
(define-constant TOOLKIT 'SP936YWJPST8GB8FFRCN7CC6P2YR5K6NNBAARQ96.toolkit-math)

;; Constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-NOT-OWNER        (err u100))
(define-constant ERR-ZERO-AMOUNT      (err u101))
(define-constant ERR-INVALID-FEE      (err u102))
(define-constant ERR-TRANSFER-FAILED  (err u103))
(define-constant ERR-PAUSED           (err u104))
(define-constant MAX-FEE-BPS u100)

;; Data vars
(define-data-var fee-bps uint u30)
(define-data-var treasury-address principal 'SP936YWJPST8GB8FFRCN7CC6P2YR5K6NNBAARQ96)
(define-data-var rewards-pool-address principal 'SP936YWJPST8GB8FFRCN7CC6P2YR5K6NNBAARQ96)
(define-data-var paused bool false)
(define-data-var treasury-share-bps uint u5000)
(define-data-var total-volume-bridged uint u0)
(define-data-var total-fees-collected uint u0)
(define-data-var total-bridge-count uint u0)

;; Maps
(define-map user-bridge-count principal uint)
(define-map user-volume principal uint)

;; Read-only
(define-read-only (get-fee-bps) (var-get fee-bps))

(define-read-only (get-stats)
  {
    total-volume: (var-get total-volume-bridged),
    total-fees:   (var-get total-fees-collected),
    bridge-count: (var-get total-bridge-count),
    fee-bps:      (var-get fee-bps),
    paused:       (var-get paused),
  })

(define-read-only (get-user-stats (user principal))
  {
    bridge-count: (default-to u0 (map-get? user-bridge-count user)),
    volume:       (default-to u0 (map-get? user-volume user)),
  })

;; calculate-fee — now uses toolkit basis-points (safe, no overflow)
(define-read-only (calculate-fee (amount uint))
  (unwrap-panic (contract-call? TOOLKIT basis-points amount (var-get fee-bps)))
)

(define-read-only (get-treasury) (var-get treasury-address))
(define-read-only (get-rewards-pool) (var-get rewards-pool-address))

;; record-bridge — uses toolkit for all fee math
(define-public (record-bridge (amount uint))
  (let (
    (sender tx-sender)
    (fee          (unwrap! (contract-call? TOOLKIT basis-points amount (var-get fee-bps)) ERR-ZERO-AMOUNT))
    (treasury-cut (unwrap! (contract-call? TOOLKIT basis-points fee (var-get treasury-share-bps)) ERR-ZERO-AMOUNT))
    (rewards-cut  (unwrap! (contract-call? TOOLKIT safe-sub fee treasury-cut) ERR-ZERO-AMOUNT))
  )
    (asserts! (not (var-get paused)) ERR-PAUSED)
    (asserts! (> amount u0) ERR-ZERO-AMOUNT)
    (asserts! (> fee u0) ERR-ZERO-AMOUNT)
    (try! (stx-transfer? treasury-cut sender (var-get treasury-address)))
    (try! (stx-transfer? rewards-cut sender (var-get rewards-pool-address)))
    (var-set total-volume-bridged (+ (var-get total-volume-bridged) amount))
    (var-set total-fees-collected (+ (var-get total-fees-collected) fee))
    (var-set total-bridge-count   (+ (var-get total-bridge-count) u1))
    (map-set user-bridge-count sender
      (+ (default-to u0 (map-get? user-bridge-count sender)) u1))
    (map-set user-volume sender
      (+ (default-to u0 (map-get? user-volume sender)) amount))
    (ok { fee-paid: fee, bridge-count: (var-get total-bridge-count) })
  )
)

;; Admin
(define-public (set-fee-bps (new-fee uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-OWNER)
    (asserts! (<= new-fee MAX-FEE-BPS) ERR-INVALID-FEE)
    (var-set fee-bps new-fee)
    (ok new-fee)
  )
)

(define-public (set-treasury (new-address principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-OWNER)
    (var-set treasury-address new-address)
    (ok true)
  )
)

(define-public (set-rewards-pool (new-address principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-OWNER)
    (var-set rewards-pool-address new-address)
    (ok true)
  )
)

(define-public (set-treasury-share (share-bps uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-OWNER)
    (asserts! (<= share-bps u10000) ERR-INVALID-FEE)
    (var-set treasury-share-bps share-bps)
    (ok true)
  )
)

(define-public (set-paused (is-paused bool))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-OWNER)
    (var-set paused is-paused)
    (ok true)
  )
)
