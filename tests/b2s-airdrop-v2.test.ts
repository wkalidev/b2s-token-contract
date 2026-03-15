import { Cl } from "@stacks/transactions";
import { describe, it, expect, beforeAll } from "vitest";

const CONTRACT = "b2s-airdrop";

let deployer: string;
let wallet1: string;
let wallet2: string;

beforeAll(() => {
  const accounts = simnet.getAccounts();
  deployer = accounts.get("deployer")!;
  wallet1  = accounts.get("wallet_1")!;
  wallet2  = accounts.get("wallet_2")!;
});

const ERR_AUTH     = Cl.uint(100);
const ERR_CLAIMED  = Cl.uint(101);
const ERR_ZERO     = Cl.uint(102);
const ERR_DEADLINE = Cl.uint(103);

const setAllocation = (user: string, amount: number, sender: string) =>
  simnet.callPublicFn(CONTRACT, "set-allocation", [Cl.principal(user), Cl.uint(amount)], sender);

const setClaimDeadline = (deadline: number, sender: string) =>
  simnet.callPublicFn(CONTRACT, "set-claim-deadline", [Cl.uint(deadline)], sender);

const claimAirdrop = (sender: string) =>
  simnet.callPublicFn(CONTRACT, "claim", [], sender);

const getAllocation = (user: string) =>
  simnet.callReadOnlyFn(CONTRACT, "get-allocation", [Cl.principal(user)], deployer);

const hasClaimed = (user: string) =>
  simnet.callReadOnlyFn(CONTRACT, "has-claimed", [Cl.principal(user)], deployer);

describe("b2s-airdrop — authorization", () => {
  it("deployer can set allocation", () => {
    const { result } = setAllocation(wallet1, 100, deployer);
    expect(result).toBeOk(Cl.bool(true));
  });
  it("non-deployer cannot set allocation", () => {
    const { result } = setAllocation(wallet2, 50, wallet1);
    expect(result).toBeErr(ERR_AUTH);
  });
  it("cannot set zero allocation", () => {
    const { result } = setAllocation(wallet1, 0, deployer);
    expect(result).toBeErr(ERR_ZERO);
  });
  it("deployer can set claim deadline", () => {
    const { result } = setClaimDeadline(9999, deployer);
    expect(result).toBeOk(Cl.uint(9999));
  });
  it("non-deployer cannot set deadline", () => {
    const { result } = setClaimDeadline(9999, wallet1);
    expect(result).toBeErr(ERR_AUTH);
  });
});

describe("b2s-airdrop — claim", () => {
  it("wallet can claim allocated amount", () => {
    setAllocation(wallet1, 500, deployer);
    const { result } = claimAirdrop(wallet1);
    expect(result).toBeOk(Cl.uint(500));
  });
  it("prevents double claim", () => {
    setAllocation(wallet1, 100, deployer);
    claimAirdrop(wallet1);
    const { result } = claimAirdrop(wallet1);
    expect(result).toBeErr(ERR_CLAIMED);
  });
  it("prevents claim with no allocation", () => {
    const { result } = claimAirdrop(wallet2);
    expect(result).toBeErr(ERR_ZERO);
  });
});

describe("b2s-airdrop — multi-wallet", () => {
  it("two wallets claim independently", () => {
    setAllocation(wallet1, 100, deployer);
    setAllocation(wallet2, 200, deployer);
    expect(claimAirdrop(wallet1).result).toBeOk(Cl.uint(100));
    expect(claimAirdrop(wallet2).result).toBeOk(Cl.uint(200));
  });
});