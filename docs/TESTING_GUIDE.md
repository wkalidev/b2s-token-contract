# Testing Guide

## Setup
```bash
npm install -g @hirosystems/clarinet-cli
clarinet new my-test
cd my-test
```

## Run all tests
```bash
clarinet test
```

## Test example
```typescript
import { describe, expect, it } from "vitest";
import { initSimnet } from "@hirosystems/clarinet-sdk";

const simnet = await initSimnet();

describe("b2s-token", () => {
  it("claim daily reward", async () => {
    const result = simnet.callPublicFn(
      "b2s-token",
      "claim-daily-reward",
      [],
      simnet.getAccounts().get("wallet_1")!
    );
    expect(result.result).toBeOk(Cl.bool(true));
  });
});
```
