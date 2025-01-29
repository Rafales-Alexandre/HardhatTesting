const { ethers } = require("hardhat");
const {
    loadFixture,
  } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
  const { expect } = require("chai");
  
  describe("RCoin", function () {
    
    async function deployRCoinFixture() {
      const [owner, addr1, addr2] = await ethers.getSigners();
      const initialSupply = ethers.parseEther("10000");
      const MyToken = await ethers.deployContract("MyToken", ["Rafales Coin", "RC", initialSupply]);
      return { myToken: MyToken, owner, addr1,addr2, initialSupply };
    }
  
    it("Should have the correct name and symbol", async function () {
      const { myToken } = await loadFixture(deployRCoinFixture);
      expect(await myToken.name()).to.equal("Rafales Coin");
      expect(await myToken.symbol()).to.equal("RC");
    });
  
    it("Should assign the initial supply to the owner", async function () {
      const { myToken, owner,initialSupply } = await loadFixture(deployRCoinFixture);
      const ownerBalance = await myToken.balanceOf(owner.address);
      expect(ownerBalance).to.equal(BigInt(initialSupply));
    });
    
    it("Should allow transfers between accounts", async function () {
      const { myToken, owner, addr1, initialSupply } = await loadFixture(deployRCoinFixture);
    
      const testBigNumber = ethers.toBigInt("10000");
      
      const transferAmount = testBigNumber;
      await myToken.transfer(addr1.address, transferAmount);
    
      const ownerBalance = await myToken.balanceOf(owner.address);
      const addr1Balance = await myToken.balanceOf(addr1.address);
    
      expect(ownerBalance).to.equal(initialSupply - transferAmount);
      expect(addr1Balance).to.equal(transferAmount);
    });
    
    
  
    it("Should fail if sender does not have enough balance", async function () {
      const { myToken, addr1, addr2 } = await loadFixture(deployRCoinFixture);
      const transferAmount = ethers.parseEther("10001");
  
      await expect(
        myToken.connect(addr1).transfer(addr2.address, transferAmount)
      ).to.be.revertedWithCustomError(myToken, "ERC20InsufficientBalance");
    });
  
    it("Should allow the owner to mint new tokens", async function () {
      const { myToken, owner, initialSupply } = await loadFixture(deployRCoinFixture);
  
      const mintAmount = ethers.parseEther("5000");
  
      await myToken.mint(owner.address, mintAmount);
  
      const totalSupply = await myToken.totalSupply();
      const ownerBalance = await myToken.balanceOf(owner.address);
  
      expect(totalSupply).to.equal(initialSupply + mintAmount);
      expect(ownerBalance).to.equal(initialSupply + mintAmount);
  });
    
    
    
  
    it("Should allow token burning", async function () {
      const { myToken, owner, initialSupply } = await loadFixture(deployRCoinFixture);

      const burnAmount = ethers.parseEther("1"); 

      await myToken.burn(burnAmount);

      const totalSupply = await myToken.totalSupply();
      const ownerBalance = await myToken.balanceOf(owner.address);

      expect(totalSupply).to.equal(initialSupply - burnAmount);
      expect(ownerBalance).to.equal(initialSupply - burnAmount);
  });
  
    it("Should emit Transfer events on transfers", async function () {
      const { myToken, owner, addr1 } = await loadFixture(deployRCoinFixture);
      const transferAmount = ethers.parseEther("500");
  
      await expect(myToken.transfer(addr1.address, transferAmount))
        .to.emit(myToken, "Transfer")
        .withArgs(owner.address, addr1.address, transferAmount);
    });

    it("Should emit Transfer and Approval events on minting", async function () {
      const { myToken, addr1 } = await loadFixture(deployRCoinFixture);
      const mintAmount = ethers.parseEther("2000");
    
      await expect(myToken.mint(addr1.address, mintAmount))
        .to.emit(myToken, "Transfer")
        .withArgs(ethers.ZeroAddress, addr1.address, mintAmount);
    });
    it("Should not allow non-owner to mint tokens", async function () {
      const { myToken, addr1 } = await loadFixture(deployRCoinFixture);
      const mintAmount = ethers.parseEther("1000");
    
      await expect(
        myToken.connect(addr1).mint(addr1.address, mintAmount)
      ).to.be.revertedWithCustomError(myToken, "OwnableUnauthorizedAccount");
    });
    it("Should emit Transfer event on burning", async function () {
      const { myToken, owner } = await loadFixture(deployRCoinFixture);
      const burnAmount = ethers.parseEther("1000");
    
      await expect(myToken.burn(burnAmount))
        .to.emit(myToken, "Transfer")
        .withArgs(owner.address, ethers.ZeroAddress, burnAmount);
    });
  });
  