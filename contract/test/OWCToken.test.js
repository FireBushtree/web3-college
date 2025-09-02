const OWCToken = artifacts.require("OWCToken");

contract("OWCToken", function (accounts) {
  let owcToken;
  const owner = accounts[0];
  const buyer1 = accounts[1];
  const buyer2 = accounts[2];
  const rate = 5000; // 1 ETH = 5000 OWC

  beforeEach(async function () {
    // Deploy OWC token
    owcToken = await OWCToken.new({ from: owner });
  });

  describe("Deployment", function () {
    it("Should set the owner correctly", async function () {
      const tokenOwner = await owcToken.owner();
      assert.equal(tokenOwner, owner, "Owner should be set correctly");
    });

    it("Should set the rate correctly", async function () {
      const tokenRate = await owcToken.rate();
      assert.equal(tokenRate.toString(), rate.toString(), "Rate should be set correctly");
    });

    it("Should have 0 decimals", async function () {
      const decimals = await owcToken.decimals();
      assert.equal(decimals.toString(), "0", "Decimals should be 0");
    });

    it("Should mint initial supply to owner", async function () {
      const ownerBalance = await owcToken.balanceOf(owner);
      // 1000000 * 10^0 = 1000000
      assert.equal(ownerBalance.toString(), "1000000", "Owner should have initial supply");
    });

    it("Should have correct token name and symbol", async function () {
      const name = await owcToken.name();
      const symbol = await owcToken.symbol();
      assert.equal(name, "OWC", "Token name should be OWC");
      assert.equal(symbol, "OW", "Token symbol should be OW");
    });
  });

  describe("Buy Tokens", function () {
    it("Should allow buying tokens with ETH", async function () {
      const ethAmount = web3.utils.toBN(web3.utils.toWei("1", "ether")); // 1 ETH
      const expectedTokenAmount = web3.utils.toBN("5000"); // 1 ETH * 5000 rate = 5000 OWC
      
      const initialBuyerBalance = await owcToken.balanceOf(buyer1);
      const initialOwnerBalance = await owcToken.balanceOf(owner);
      
      const tx = await owcToken.buyTokens({ from: buyer1, value: ethAmount });
      
      // Check balances
      const finalBuyerBalance = await owcToken.balanceOf(buyer1);
      const finalOwnerBalance = await owcToken.balanceOf(owner);
      
      const buyerIncrease = finalBuyerBalance.sub(initialBuyerBalance);
      const ownerDecrease = initialOwnerBalance.sub(finalOwnerBalance);
      
      assert.equal(buyerIncrease.toString(), expectedTokenAmount.toString(), "Buyer should receive correct token amount");
      assert.equal(ownerDecrease.toString(), expectedTokenAmount.toString(), "Owner should lose correct token amount");
      
      // Check Transfer event
      assert.equal(tx.logs.length, 1, "Should emit one Transfer event");
      assert.equal(tx.logs[0].event, "Transfer", "Should emit Transfer event");
      assert.equal(tx.logs[0].args.from, owner, "Transfer should be from owner");
      assert.equal(tx.logs[0].args.to, buyer1, "Transfer should be to buyer");
      assert.equal(tx.logs[0].args.value.toString(), expectedTokenAmount.toString(), "Transfer amount should be correct");
    });

    it("Should allow multiple buyers to buy tokens", async function () {
      const ethAmount1 = web3.utils.toBN(web3.utils.toWei("0.5", "ether")); // 0.5 ETH
      const ethAmount2 = web3.utils.toBN(web3.utils.toWei("2", "ether")); // 2 ETH
      
      const expectedTokens1 = web3.utils.toBN("2500"); // 0.5 ETH * 5000 = 2500 OWC
      const expectedTokens2 = web3.utils.toBN("10000"); // 2 ETH * 5000 = 10000 OWC
      
      await owcToken.buyTokens({ from: buyer1, value: ethAmount1 });
      await owcToken.buyTokens({ from: buyer2, value: ethAmount2 });
      
      const buyer1Balance = await owcToken.balanceOf(buyer1);
      const buyer2Balance = await owcToken.balanceOf(buyer2);
      
      assert.equal(buyer1Balance.toString(), expectedTokens1.toString(), "Buyer1 should have correct token balance");
      assert.equal(buyer2Balance.toString(), expectedTokens2.toString(), "Buyer2 should have correct token balance");
    });

    it("Should allow same buyer to buy tokens multiple times", async function () {
      const ethAmount = web3.utils.toBN(web3.utils.toWei("0.1", "ether")); // 0.1 ETH each time
      const expectedTokensPerPurchase = web3.utils.toBN("500"); // 0.1 ETH * 5000 = 500 OWC
      
      // First purchase
      await owcToken.buyTokens({ from: buyer1, value: ethAmount });
      let balance = await owcToken.balanceOf(buyer1);
      assert.equal(balance.toString(), expectedTokensPerPurchase.toString(), "First purchase should work");
      
      // Second purchase
      await owcToken.buyTokens({ from: buyer1, value: ethAmount });
      balance = await owcToken.balanceOf(buyer1);
      const expectedTotal = expectedTokensPerPurchase.mul(web3.utils.toBN("2"));
      assert.equal(balance.toString(), expectedTotal.toString(), "Second purchase should accumulate");
      
      // Third purchase
      await owcToken.buyTokens({ from: buyer1, value: ethAmount });
      balance = await owcToken.balanceOf(buyer1);
      const expectedTotal3 = expectedTokensPerPurchase.mul(web3.utils.toBN("3"));
      assert.equal(balance.toString(), expectedTotal3.toString(), "Third purchase should accumulate");
    });

    it("Should handle small ETH amounts correctly", async function () {
      // Test with very small amount: 1 wei
      // With the fixed calculation: (1 wei * 5000) / 1e18 = 0 tokens (due to integer division)
      const ethAmount = web3.utils.toBN("1"); // 1 wei
      const expectedTokens = web3.utils.toBN("0"); // (1 * 5000) / 1e18 = 0 (integer division)
      
      await owcToken.buyTokens({ from: buyer1, value: ethAmount });
      
      const balance = await owcToken.balanceOf(buyer1);
      assert.equal(balance.toString(), expectedTokens.toString(), "Should handle small amounts correctly");
    });

    it("Should revert when no ETH is sent", async function () {
      try {
        await owcToken.buyTokens({ from: buyer1, value: 0 });
        assert.fail("Should have reverted");
      } catch (error) {
        assert(error.message.includes("Send ETH to buy tokens"), "Should revert with correct message");
      }
    });

    it("Should revert when owner doesn't have enough tokens", async function () {
      // Transfer most tokens away from owner to simulate shortage
      const ownerBalance = await owcToken.balanceOf(owner);
      const keepAmount = web3.utils.toBN("1000"); // Keep only 1000 tokens
      const transferAmount = ownerBalance.sub(keepAmount);
      
      await owcToken.transfer(buyer2, transferAmount, { from: owner });
      
      // Try to buy more tokens than available
      const largeEthAmount = web3.utils.toBN(web3.utils.toWei("1", "ether")); // Would need 5000 tokens
      
      try {
        await owcToken.buyTokens({ from: buyer1, value: largeEthAmount });
        assert.fail("Should have reverted");
      } catch (error) {
        assert(error.message.includes("Not enough tokens"), "Should revert with correct message");
      }
    });

    it("Should handle edge case: buying a large amount of tokens", async function () {
      // Test buying 10000 tokens (a reasonable amount)
      const tokensToBuy = web3.utils.toBN("10000");
      
      // Calculate ETH needed: tokens = (ethAmount * rate) / 1e18
      // So: ethAmount = (tokens * 1e18) / rate
      const ethNeeded = tokensToBuy.mul(web3.utils.toBN(web3.utils.toWei("1", "ether"))).div(web3.utils.toBN(rate.toString()));
      
      const initialOwnerBalance = await owcToken.balanceOf(owner);
      
      await owcToken.buyTokens({ from: buyer1, value: ethNeeded });
      
      const finalOwnerBalance = await owcToken.balanceOf(owner);
      const buyerBalance = await owcToken.balanceOf(buyer1);
      
      assert.equal(buyerBalance.toString(), tokensToBuy.toString(), "Buyer should have correct token amount");
      
      const ownerDecrease = initialOwnerBalance.sub(finalOwnerBalance);
      assert.equal(ownerDecrease.toString(), tokensToBuy.toString(), "Owner should lose correct token amount");
    });

    it("Should properly calculate token amounts with rate", async function () {
      // Test different ETH amounts and verify calculations
      const testCases = [
        { eth: "0.001", expectedTokens: "5" }, // 0.001 ETH * 5000 = 5 tokens
        { eth: "0.1", expectedTokens: "500" },   // 0.1 ETH * 5000 = 500 tokens
        { eth: "1", expectedTokens: "5000" },    // 1 ETH * 5000 = 5000 tokens
        { eth: "10", expectedTokens: "50000" }   // 10 ETH * 5000 = 50000 tokens
      ];
      
      for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        const ethAmount = web3.utils.toBN(web3.utils.toWei(testCase.eth, "ether"));
        const expectedTokens = web3.utils.toBN(testCase.expectedTokens);
        
        const buyerAddress = accounts[3 + i]; // Use different accounts for each test
        
        await owcToken.buyTokens({ from: buyerAddress, value: ethAmount });
        
        const balance = await owcToken.balanceOf(buyerAddress);
        assert.equal(balance.toString(), expectedTokens.toString(), 
          `${testCase.eth} ETH should give ${testCase.expectedTokens} tokens`);
      }
    });
  });

  describe("Contract ETH Balance", function () {
    it("Should receive ETH when tokens are bought", async function () {
      const ethAmount = web3.utils.toBN(web3.utils.toWei("1", "ether"));
      
      const initialContractBalance = web3.utils.toBN(await web3.eth.getBalance(owcToken.address));
      
      await owcToken.buyTokens({ from: buyer1, value: ethAmount });
      
      const finalContractBalance = web3.utils.toBN(await web3.eth.getBalance(owcToken.address));
      const balanceIncrease = finalContractBalance.sub(initialContractBalance);
      
      assert.equal(balanceIncrease.toString(), ethAmount.toString(), "Contract should receive ETH");
    });

    it("Should accumulate ETH from multiple purchases", async function () {
      const ethAmount1 = web3.utils.toBN(web3.utils.toWei("0.5", "ether"));
      const ethAmount2 = web3.utils.toBN(web3.utils.toWei("1.5", "ether"));
      const expectedTotal = ethAmount1.add(ethAmount2);
      
      const initialContractBalance = web3.utils.toBN(await web3.eth.getBalance(owcToken.address));
      
      await owcToken.buyTokens({ from: buyer1, value: ethAmount1 });
      await owcToken.buyTokens({ from: buyer2, value: ethAmount2 });
      
      const finalContractBalance = web3.utils.toBN(await web3.eth.getBalance(owcToken.address));
      const totalIncrease = finalContractBalance.sub(initialContractBalance);
      
      assert.equal(totalIncrease.toString(), expectedTotal.toString(), "Contract should accumulate ETH");
    });
  });
});