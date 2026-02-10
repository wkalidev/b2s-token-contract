import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
    name: "Can create a proposal with sufficient stake",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get('wallet_1')!;
        
        // Set voting power first
        let block = chain.mineBlock([
            Tx.contractCall(
                'b2s-governance',
                'set-voting-power',
                [types.principal(wallet1.address), types.uint(10000000000)],
                wallet1.address
            ),
            Tx.contractCall(
                'b2s-governance',
                'create-proposal',
                [
                    types.ascii("Increase APY to 15%"),
                    types.utf8("We should increase the staking APY from 12.5% to 15% to attract more stakers."),
                    types.ascii("economic")
                ],
                wallet1.address
            )
        ]);
        
        block.receipts[1].result.expectOk().expectUint(1);
        
        // Verify proposal was created
        let getProposal = chain.callReadOnlyFn(
            'b2s-governance',
            'get-proposal',
            [types.uint(1)],
            wallet1.address
        );
        
        const proposal = getProposal.result.expectOk().expectSome();
        assertEquals(proposal['title'], types.ascii("Increase APY to 15%"));
    },
});

Clarinet.test({
    name: "Can vote on a proposal",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get('wallet_1')!;
        const wallet2 = accounts.get('wallet_2')!;
        
        // Setup voting power
        let setupBlock = chain.mineBlock([
            Tx.contractCall('b2s-governance', 'set-voting-power',
                [types.principal(wallet1.address), types.uint(10000000000)],
                wallet1.address),
            Tx.contractCall('b2s-governance', 'set-voting-power',
                [types.principal(wallet2.address), types.uint(5000000000)],
                wallet2.address),
        ]);
        
        // Create proposal
        let createBlock = chain.mineBlock([
            Tx.contractCall('b2s-governance', 'create-proposal',
                [types.ascii("Test Proposal"), types.utf8("Test"), types.ascii("test")],
                wallet1.address)
        ]);
        
        // Vote YES
        let voteBlock = chain.mineBlock([
            Tx.contractCall('b2s-governance', 'cast-vote',
                [types.uint(1), types.bool(true)],
                wallet2.address)
        ]);
        
        voteBlock.receipts[0].result.expectOk().expectBool(true);
        
        // Check vote was recorded
        let getVote = chain.callReadOnlyFn(
            'b2s-governance',
            'get-vote',
            [types.uint(1), types.principal(wallet2.address)],
            wallet2.address
        );
        
        const vote = getVote.result.expectOk().expectSome();
        assertEquals(vote['vote'], types.bool(true));
    },
});

Clarinet.test({
    name: "Cannot vote twice on same proposal",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get('wallet_1')!;
        
        // Setup
        chain.mineBlock([
            Tx.contractCall('b2s-governance', 'set-voting-power',
                [types.principal(wallet1.address), types.uint(10000000000)],
                wallet1.address),
            Tx.contractCall('b2s-governance', 'create-proposal',
                [types.ascii("Test"), types.utf8("Test"), types.ascii("test")],
                wallet1.address)
        ]);
        
        // First vote
        chain.mineBlock([
            Tx.contractCall('b2s-governance', 'cast-vote',
                [types.uint(1), types.bool(true)],
                wallet1.address)
        ]);
        
        // Second vote should fail
        let doubleVote = chain.mineBlock([
            Tx.contractCall('b2s-governance', 'cast-vote',
                [types.uint(1), types.bool(false)],
                wallet1.address)
        ]);
        
        doubleVote.receipts[0].result.expectErr().expectUint(405); // err-already-voted
    },
});

Clarinet.test({
    name: "Can check if proposal passed",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get('wallet_1')!;
        const wallet2 = accounts.get('wallet_2')!;
        
        // Setup with enough voting power
        chain.mineBlock([
            Tx.contractCall('b2s-governance', 'set-voting-power',
                [types.principal(wallet1.address), types.uint(100000000000)],
                wallet1.address),
            Tx.contractCall('b2s-governance', 'set-voting-power',
                [types.principal(wallet2.address), types.uint(80000000000)],
                wallet2.address),
        ]);
        
        // Create and vote
        chain.mineBlock([
            Tx.contractCall('b2s-governance', 'create-proposal',
                [types.ascii("Test"), types.utf8("Test"), types.ascii("test")],
                wallet1.address)
        ]);
        
        chain.mineBlock([
            Tx.contractCall('b2s-governance', 'cast-vote',
                [types.uint(1), types.bool(true)],
                wallet1.address),
            Tx.contractCall('b2s-governance', 'cast-vote',
                [types.uint(1), types.bool(true)],
                wallet2.address)
        ]);
        
        // Check results
        let results = chain.callReadOnlyFn(
            'b2s-governance',
            'get-voting-results',
            [types.uint(1)],
            wallet1.address
        );
        
        const res = results.result.expectOk();
        console.log("Voting results:", res);
    },
});