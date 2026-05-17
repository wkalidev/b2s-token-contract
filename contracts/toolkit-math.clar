;; Stacks Clarity Toolkit - Math Utilities
;; Safe math operations with overflow protection

;; Constants
(define-constant err-overflow (err u100))
(define-constant err-divide-by-zero (err u101))
(define-constant err-underflow (err u102))

;; Safe Addition
(define-read-only (safe-add (a uint) (b uint))
  (let ((result (+ a b)))
    (asserts! (>= result a) err-overflow)
    (ok result)
  )
)

;; Safe Subtraction
(define-read-only (safe-sub (a uint) (b uint))
  (begin
    (asserts! (>= a b) err-underflow)
    (ok (- a b))
  )
)

;; Safe Multiplication
(define-read-only (safe-mul (a uint) (b uint))
  (if (is-eq a u0)
    (ok u0)
    (let ((result (* a b)))
      (asserts! (is-eq (/ result a) b) err-overflow)
      (ok result)
    )
  )
)

;; Safe Division
(define-read-only (safe-div (a uint) (b uint))
  (begin
    (asserts! (> b u0) err-divide-by-zero)
    (ok (/ a b))
  )
)

;; Safe Modulo
(define-read-only (safe-mod (a uint) (b uint))
  (begin
    (asserts! (> b u0) err-divide-by-zero)
    (ok (mod a b))
  )
)

;; Calculate Percentage
;; Returns (amount * percent / 100)
(define-read-only (percentage (amount uint) (percent uint))
  (ok (/ (* amount percent) u100))
)

;; Calculate with basis points (0.01%)
;; Returns (amount * bps / 10000)
(define-read-only (basis-points (amount uint) (bps uint))
  (ok (/ (* amount bps) u10000))
)

;; Minimum of two values
(define-read-only (min (a uint) (b uint))
  (if (<= a b) a b)
)

;; Maximum of two values
(define-read-only (max (a uint) (b uint))
  (if (>= a b) a b)
)

;; Absolute difference
(define-read-only (abs-diff (a uint) (b uint))
  (if (>= a b)
    (ok (- a b))
    (ok (- b a))
  )
)

;; Power function (a^b) -- non-recursive via fold, max exponent 20
(define-private (safe-pow-step
  (unused uint)
  (acc {base: uint, result: uint, remaining: uint}))
  (if (is-eq (get remaining acc) u0)
    acc
    { base:      (get base acc),
      result:    (* (get result acc) (get base acc)),
      remaining: (- (get remaining acc) u1) }))

(define-read-only (safe-pow (base uint) (exponent uint))
  (ok (get result
    (fold safe-pow-step
      (list u1 u2 u3 u4 u5 u6 u7 u8 u9 u10 u11 u12 u13 u14 u15 u16 u17 u18 u19 u20)
      { base: base, result: u1, remaining: exponent }))))


;; Average of two values
(define-read-only (average (a uint) (b uint))
  (ok (/ (+ a b) u2))
)

;; Check if number is even
(define-read-only (is-even (n uint))
  (is-eq (mod n u2) u0)
)

;; Check if number is odd
(define-read-only (is-odd (n uint))
  (is-eq (mod n u2) u1)
)

;; Clamp value between min and max
(define-read-only (clamp (value uint) (min-val uint) (max-val uint))
  (ok (max min-val (min value max-val)))
)

;; Linear interpolation
;; lerp(a, b, t) = a + t * (b - a) where t is [0, 100]
(define-read-only (lerp (a uint) (b uint) (t uint))
  (begin
    (asserts! (<= t u100) err-overflow)
    (if (>= b a)
      (ok (+ a (/ (* (- b a) t) u100)))
      (ok (- a (/ (* (- a b) t) u100)))
    )
  )
)

;; Sum of arithmetic sequence
;; sum = n * (first + last) / 2
(define-read-only (arithmetic-sum (first uint) (last uint) (n uint))
  (ok (/ (* n (+ first last)) u2))
)

;; Ceiling Division
;; Returns ceil(a / b)
(define-read-only (ceil-div (a uint) (b uint))
  (begin
    (asserts! (> b u0) err-divide-by-zero)
    (ok (/ (+ a (- b u1)) b))
  )
)
