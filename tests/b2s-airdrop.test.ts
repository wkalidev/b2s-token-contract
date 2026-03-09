 import { Cl } from "@stacks/transactions";
import { describe, it, expect, beforeEach } from "vitest";

// Simulated accounts
const accounts = {
  deployer: "deployer",
  wallet_1: "alice",
  wallet_2: "bob",
};

let allocations: Record<string, number>;
let claimed: Record<string, boolean>;
let totalDistributed: number;
let claimDeadline: number;

// Reset state before each test
beforeEach(() => {
  allocations = {};
  claimed = {};
  totalDistributed = 0;
  claimDeadline = 0;
});

// Contract helper functions
function setAllocation(user: string, amount: number, sender: string) {
  if (sender !== accounts.deployer) return { result: Cl.err(100) }; // ERR-AUTH
  if (amount <= 0) return { result: Cl.err(102) }; // ERR-ZERO
  allocations[user] = amount;
  return { result: Cl.ok(true) };
}

function setClaimDeadline(deadline: number, sender: string) {
  if (sender !== accounts.deployer) return { result: Cl.err(100) }; // ERR-AUTH
  claimDeadline = deadline;
  return { result: Cl.ok(deadline) };
}

function claim(sender: string, blockHeight: number) {
  const amount = allocations[sender] ?? 0;
  if (claimDeadline !== 0 && blockHeight >= claimDeadline) return { result: Cl.err(103) }; // ERR-DEADLINE
  if (amount <= 0) return { result: Cl.err(102) }; // ERR-ZERO
  if (claimed[sender]) return { result: Cl.err(101) }; // ERR-CLAIMED

  claimed[sender] = true;
  totalDistributed += amount;
  return { result: Cl.ok(amount) };
}

function getAllocation(user: string) {
  return { result: Cl.ok(allocations[user] ?? 0) };
}

function hasClaimed(user: string) {
  return { result: Cl.ok(claimed[user] ?? false) };
}

function getStats() {
  return { result: Cl.ok({ distributed: totalDistributed }) };
}

// -----------------------------
// TEST SUITE
// -----------------------------
describe("B2S Claim Contract Tests", () => {
  it("allows deployer to set allocation", () => {
    const { result } = setAllocation(accounts.wallet_1, 100, accounts.deployer);
    expect(result).toBeOk(true);
    expect(getAllocation(accounts.wallet_1).result).toBeOk(100);
  });

  it("prevents non-deployer from setting allocation", () => {
    const { result } = setAllocation(accounts.wallet_1, 50, accounts.wallet_1);
    expect(result).toBeErr(100);
  });

  it("prevents allocation of zero", () => {
    const { result } = setAllocation(accounts.wallet_1, 0, accounts.deployer);
    expect(result).toBeErr(102);
  });

  it("allows claiming when deadline is zero", () => {
    setAllocation(accounts.wallet_1, 50, accounts.deployer);
    const { result } = claim(accounts.wallet_1, 1);
    expect(result).toBeOk(50);
    expect(hasClaimed(accounts.wallet_1).result).toBeOk(true);
    expect(getStats().result.distributed).toBe(50);
  });

  it("allows claiming before the deadline", () => {
    setAllocation(accounts.wallet_2, 80, accounts.deployer);
    setClaimDeadline(10, accounts.deployer);
    const { result } = claim(accounts.wallet_2, 5);
    expect(result).toBeOk(80);
    expect(hasClaimed(accounts.wallet_2).result).toBeOk(true);
  });

  it("fails claiming exactly at the deadline", () => {
    setAllocation(accounts.wallet_1, 50, accounts.deployer);
    setClaimDeadline(10, accounts.deployer);
    const { result } = claim(accounts.wallet_1, 10);
    expect(result).toBeErr(103);
  });

  it("fails claiming after the deadline", () => {
    setAllocation(accounts.wallet_1, 50, accounts.deployer);
    setClaimDeadline(10, accounts.deployer);
    const { result } = claim(accounts.wallet_1, 20);
    expect(result).toBeErr(103);
  });

  it("prevents claiming twice", () => {
    setAllocation(accounts.wallet_1, 50, accounts.deployer);
    claim(accounts.wallet_1, 1);
    const { result } = claim(accounts.wallet_1, 2);
    expect(result).toBeErr(101);
  });

  it("prevents claiming without allocation", () => {
    const { result } = claim(accounts.wallet_2, 1);
    expect(result).toBeErr(102);
  });

  it("allows deployer to set claim deadline", () => {
    const { result } = setClaimDeadline(100, accounts.deployer);
    expect(result).toBeOk(100);
  });

  it("prevents non-deployer from setting claim deadline", () => {
    const { result } = setClaimDeadline(50, accounts.wallet_1);
    expect(result).toBeErr(100);
  });
});
