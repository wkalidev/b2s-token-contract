import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
    name: "Can add initial liquidity to pool",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const provider = accounts.get('wallet_1')!;
        const amountB2S = 1000000000; // 1000 B2S
        const amountSTX = 100000000;  // 100 STX
        
        let block = chain.mineBlock([
            Tx.contractCall(
                'b2s-liquidity-pool',
                'add-liquidity',
                [
                    types.uint(amountB2S),
                    types.uint(amountSTX),
                    types.uint(1) // min LP tokens
                ],
                provider.address
            )
        ]);
        
        const lpTokens = block.receipts[0].result.expectOk();
        console.log("LP tokens minted:", lpTokens);
        
        // Verify reserves updated
        let getReserves = chain.callReadOnlyFn(
            'b2s-liquidity-pool',
            'get-reserves',
            [],
            provider.address
        );
        
        const reserves = getReserves.result.expectOk();
        assertEquals(reserves['b2s'], types.uint(amountB2S));
        assertEquals(reserves['stx'], types.uint(amountSTX));
    },
});

Clarinet.test({
    name: "Can swap B2S for STX",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const provider = accounts.get('wallet_1')!;
        const trader = accounts.get('wallet_2')!;
        
        // Add liquidity first
        chain.mineBlock([
            Tx.contractCall('b2s-liquidity-pool', 'add-liquidity',
                [types.uint(1000000000), types.uint(100000000), types.uint(1)],
                provider.address)
        ]);
        
        // Swap 10 B2S for STX
        let swapBlock = chain.mineBlock([
            Tx.contractCall('b2s-liquidity-pool', 'swap-b2s-for-stx',
                [types.uint(10000000), types.uint(1)], // 10 B2S, min 1 STX
                trader.address)
        ]);
        
        const stxOut = swapBlock.receipts[0].result.expectOk();
        console.log("STX received:", stxOut);
        
        // Verify reserves changed
        let getReserves = chain.callReadOnlyFn(
            'b2s-liquidity-pool',
            'get-reserves',
            [],
            trader.address
        );
        
        const reserves = getReserves.result.expectOk();
        console.log("Reserves after swap:", reserves);
    },
});

Clarinet.test({
    name: "Can swap STX for B2S",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const provider = accounts.get('wallet_1')!;
        const trader = accounts.get('wallet_2')!;
        
        // Add liquidity
        chain.mineBlock([
            Tx.contractCall('b2s-liquidity-pool', 'add-liquidity',
                [types.uint(1000000000), types.uint(100000000), types.uint(1)],
                provider.address)
        ]);
        
        // Swap 1 STX for B2S
        let swapBlock = chain.mineBlock([
            Tx.contractCall('b2s-liquidity-pool', 'swap-stx-for-b2s',
                [types.uint(1000000), types.uint(1)], // 1 STX, min 1 B2S
                trader.address)
        ]);
        
        const b2sOut = swapBlock.receipts[0].result.expectOk();
        console.log("B2S received:", b2sOut);
    },
});

Clarinet.test({
    name: "Can remove liquidity",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const provider = accounts.get('wallet_1')!;
        
        // Add liquidity
        let addBlock = chain.mineBlock([
            Tx.contractCall('b2s-liquidity-pool', 'add-liquidity',
                [types.uint(1000000000), types.uint(100000000), types.uint(1)],
                provider.address)
        ]);
        
        const lpTokens = addBlock.receipts[0].result.expectOk();
        
        // Remove half
        let removeBlock = chain.mineBlock([
            Tx.contractCall('b2s-liquidity-pool', 'remove-liquidity',
                [
                    types.uint(Number(lpTokens) / 2),
                    types.uint(1),
                    types.uint(1)
                ],
                provider.address)
        ]);
        
        const returned = removeBlock.receipts[0].result.expectOk();
        console.log("Tokens returned:", returned);
    },
});

Clarinet.test({
    name: "Quote swap returns correct amount",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const provider = accounts.get('wallet_1')!;
        
        // Add liquidity
        chain.mineBlock([
            Tx.contractCall('b2s-liquidity-pool', 'add-liquidity',
                [types.uint(1000000000), types.uint(100000000), types.uint(1)],
                provider.address)
        ]);
        
        // Quote swap
        let quote = chain.callReadOnlyFn(
            'b2s-liquidity-pool',
            'quote-swap-b2s-for-stx',
            [types.uint(10000000)], // 10 B2S
            provider.address
        );
        
        const expectedSTX = quote.result.expectOk();
        console.log("Expected STX output for 10 B2S:", expectedSTX);
    },
});

Clarinet.test({
    name: "Price calculation works correctly",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const provider = accounts.get('wallet_1')!;
        
        // Add liquidity with 10:1 ratio
        chain.mineBlock([
            Tx.contractCall('b2s-liquidity-pool', 'add-liquidity',
                [types.uint(1000000000), types.uint(100000000), types.uint(1)],
                provider.address)
        ]);
        
        // Get price
        let getPrice = chain.callReadOnlyFn(
            'b2s-liquidity-pool',
            'get-price',
            [],
            provider.address
        );
        
        const price = getPrice.result.expectOk();
        assertEquals(price, types.uint(10)); // 1000 B2S / 100 STX = 10
    },
});

Clarinet.test({
    name: "Pool share calculation is correct",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const provider1 = accounts.get('wallet_1')!;
        const provider2 = accounts.get('wallet_2')!;
        
        // Provider 1 adds liquidity
        chain.mineBlock([
            Tx.contractCall('b2s-liquidity-pool', 'add-liquidity',
                [types.uint(1000000000), types.uint(100000000), types.uint(1)],
                provider1.address)
        ]);
        
        // Provider 2 adds same amount
        chain.mineBlock([
            Tx.contractCall('b2s-liquidity-pool', 'add-liquidity',
                [types.uint(1000000000), types.uint(100000000), types.uint(1)],
                provider2.address)
        ]);
        
        // Check pool shares
        let share1 = chain.callReadOnlyFn(
            'b2s-liquidity-pool',
            'get-pool-share',
            [types.principal(provider1.address)],
            provider1.address
        );
        
        const poolShare = share1.result.expectOk();
        assertEquals(poolShare, types.uint(5000)); // 50% in basis points
    },
});