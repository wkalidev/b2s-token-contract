(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-AUTH (err u100))
(define-constant ERR-CLAIMED (err u101))
(define-constant ERR-ZERO (err u102))
(define-constant ERR-DEADLINE (err u103))

(define-constant B2S 'SP936YWJPST8GB8FFRCN7CC6P2YR5K6NNBAARQ96.b2s-token)

(define-map claimed principal bool)
(define-map allocations principal uint)

(define-data-var total-distributed uint u0)
(define-data-var claim-deadline uint u0)

;; -----------------------------
;; ADMIN FUNCTIONS
;; -----------------------------

(define-public (set-allocation (user principal) (amount uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-AUTH)
    (asserts! (> amount u0) ERR-ZERO)
    (map-set allocations user amount)
    (ok true)
  )
)

(define-public (set-claim-deadline (deadline uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-AUTH)
    (var-set claim-deadline deadline)
    (ok deadline)
  )
)

;; -----------------------------
;; CLAIM FUNCTION
;; -----------------------------

(define-public (claim)
  (let ((amount (default-to u0 (map-get? allocations tx-sender))))
    
    ;; deadline check
    (asserts!
      (or (is-eq (var-get claim-deadline) u0)
          (< block-height (var-get claim-deadline)))
      ERR-DEADLINE
    )

    (asserts! (> amount u0) ERR-ZERO)

    (asserts!
      (not (default-to false (map-get? claimed tx-sender)))
      ERR-CLAIMED
    )

    (try!
      (as-contract
        (contract-call? B2S transfer amount tx-sender tx-sender none)
      )
    )

    (map-set claimed tx-sender true)

    (var-set total-distributed
      (+ (var-get total-distributed) amount)
    )

    (ok amount)
  )
)

;; -----------------------------
;; READ ONLY
;; -----------------------------

(define-read-only (get-allocation (user principal))
  (ok (default-to u0 (map-get? allocations user)))
)

(define-read-only (has-claimed (user principal))
  (ok (default-to false (map-get? claimed user)))
)

(define-read-only (get-deadline)
  (ok (var-get claim-deadline))
)

(define-read-only (get-stats)
  (ok { distributed: (var-get total-distributed) })
)
