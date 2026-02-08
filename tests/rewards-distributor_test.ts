import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
    name: "Can stake tokens",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1 = accounts.get('wallet_1')!;
        
        let block = chain.mineBlock([
            Tx.contractCall(
                'b2s-rewards-distributor',
                'stake',
                [types.uint(1000000)], // 1 token
                wallet1.address
            )
        ]);
        
        block.receipts[0].result.expectOk().expectBool(true);
        
        // Verify staked amount
        let getInfo = chain.callReadOnlyFn(
            'b2s-rewards-distributor',
            'get-staker-info',
            [types.principal(wallet1.address)],
            wallet1.address
        );
        
        const info = getInfo.result.expectOk().expectSome();
        assertEquals(info['staked-amount'], types.uint(1000000));
    },
});

Clarinet.test({
    name: "Can calculate pending rewards",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get('wallet_1')!;
        
        // Stake tokens
        let block = chain.mineBlock([
            Tx.contractCall(
                'b2s-rewards-distributor',
                'stake',
                [types.uint(10000000000)], // 10,000 tokens
                wallet1.address
            )
        ]);
        
        // Mine 144 blocks (1 day)
        chain.mineEmptyBlockUntil(chain.blockHeight + 144);
        
        // Check pending rewards
        let pendingRewards = chain.callReadOnlyFn(
            'b2s-rewards-distributor',
            'get-pending-rewards',
            [types.principal(wallet1.address)],
            wallet1.address
        );
        
        // Should have ~1 day of rewards at 12.5% APY
        const rewards = pendingRewards.result.expectOk();
        console.log("Pending rewards after 1 day:", rewards);
    },
});

Clarinet.test({
    name: "Can claim rewards",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get('wallet_1')!;
        
        // Stake tokens
        chain.mineBlock([
            Tx.contractCall(
                'b2s-rewards-distributor',
                'stake',
                [types.uint(10000000000)],
                wallet1.address
            )
        ]);
        
        // Wait 1 day
        chain.mineEmptyBlockUntil(chain.blockHeight + 144);
        
        // Claim rewards
        let block = chain.mineBlock([
            Tx.contractCall(
                'b2s-rewards-distributor',
                'claim-rewards',
                [],
                wallet1.address
            )
        ]);
        
        block.receipts[0].result.expectOk();
    },
});

Clarinet.test({
    name: "Can unstake tokens",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get('wallet_1')!;
        
        // Stake tokens
        chain.mineBlock([
            Tx.contractCall(
                'b2s-rewards-distributor',
                'stake',
                [types.uint(5000000000)],
                wallet1.address
            )
        ]);
        
        // Unstake half
        let block = chain.mineBlock([
            Tx.contractCall(
                'b2s-rewards-distributor',
                'unstake',
                [types.uint(2500000000)],
                wallet1.address
            )
        ]);
        
        block.receipts[0].result.expectOk().expectBool(true);
    },
});

Clarinet.test({
    name: "Cannot unstake more than staked",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get('wallet_1')!;
        
        // Stake 5 tokens
        chain.mineBlock([
            Tx.contractCall(
                'b2s-rewards-distributor',
                'stake',
                [types.uint(5000000)],
                wallet1.address
            )
        ]);
        
        // Try to unstake 10 tokens
        let block = chain.mineBlock([
            Tx.contractCall(
                'b2s-rewards-distributor',
                'unstake',
                [types.uint(10000000)],
                wallet1.address
            )
        ]);
        
        block.receipts[0].result.expectErr().expectUint(402); // err-insufficient-balance
    },
});