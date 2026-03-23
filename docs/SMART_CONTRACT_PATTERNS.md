# Smart Contract Patterns

## Cooldown Pattern
Used in: claim-daily-reward
```clarity
(define-map last-claim principal uint)
(asserts!
  (>= block-height (+ (default-to u0 (map-get? last-claim tx-sender)) u144))
  ERR-TOO-SOON
)
(map-set last-claim tx-sender block-height)
```

## Access Control Pattern
Used in: admin functions
```clarity
(define-constant contract-owner tx-sender)
(asserts! (is-eq tx-sender contract-owner) ERR-UNAUTHORIZED)
```

## Safe Transfer Pattern
```clarity
(try! (ft-transfer? b2s-token amount sender recipient))
```
