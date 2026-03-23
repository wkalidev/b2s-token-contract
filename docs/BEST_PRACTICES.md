# Clarity Best Practices

## Never use unwrap-panic in public functions
Use unwrap! with proper error codes instead.

## Always validate inputs
Check amounts > 0, addresses are valid principals.

## Use toolkit for math
Never use raw + * - / on uints without overflow protection.

## No recursive functions
Clarity on mainnet forbids recursion.

## Minimize storage reads
Cache values in let bindings.
