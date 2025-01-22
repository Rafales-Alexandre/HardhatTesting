const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RCoin", function () {
    let MyToken, myToken, owner, addr1, addr2;
    const initialSupply = ethers.parseEther("10000");

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();
        MyToken = await ethers.getContractFactory("MyToken");
        myToken = await MyToken.deploy("Rafales Coin", "RC", 10000);
        await myToken.waitForDeployment();
    });

    it("Should have the correct name and symbol", async function () {
        expect(await myToken.name()).to.equal("Rafales Coin");
        expect(await myToken.symbol()).to.equal("RC");
    });

    it("Should assign the initial supply to the owner", async function () {
        const ownerBalance = await myToken.balanceOf(owner.address);
        expect(ownerBalance).to.equal(initialSupply);
    });

    it("Should allow transfers between accounts", async function () {
        const initialSupply = ethers.parseEther("10000"); 
        const transferAmount = ethers.parseEther("1000"); 
    
        await myToken.transfer(addr1.address, transferAmount);
    
        const ownerBalance = await myToken.balanceOf(owner.address);
        const addr1Balance = await myToken.balanceOf(addr1.address);
    
        expect(ownerBalance).to.equal(initialSupply - transferAmount);
        expect(addr1Balance).to.equal(transferAmount);
    });
    
    


    it("Should fail if sender does not have enough balance", async function () {
        const transferAmount = ethers.parseEther("10001"); 
    
        await expect(
            myToken.connect(addr1).transfer(addr2.address, transferAmount)
        ).to.be.revertedWithCustomError(myToken, "ERC20InsufficientBalance");
    });

    it("Should allow the owner to mint new tokens", async function () {
        const mintAmount = ethers.parseEther("5000"); 
    
        await myToken.mint(owner.address, mintAmount);
    
        const totalSupply = await myToken.totalSupply();
        const ownerBalance = await myToken.balanceOf(owner.address);
    
        expect(totalSupply.toString()).to.equal(ethers.parseEther("15000").toString());
        expect(ownerBalance.toString()).to.equal(ethers.parseEther("15000").toString());
    });

    it("Should allow token burning", async function () {
        const initialSupply = ethers.parseEther("10000"); 
        const burnAmount = ethers.parseEther("1000"); 
    
        const ownerBalanceBefore = await myToken.balanceOf(owner.address);
    
        await myToken.burn(burnAmount);
    
        const totalSupply = await myToken.totalSupply();
        const ownerBalance = await myToken.balanceOf(owner.address);
    
        expect(totalSupply).to.equal(initialSupply - burnAmount);
        expect(ownerBalance).to.equal(initialSupply - burnAmount);
    });

    it("Should not allow burning more tokens than the balance", async function () {
        const burnAmount = ethers.parseEther("15000"); 
    
        await expect(myToken.burn(burnAmount))
            .to.be.revertedWithCustomError(myToken, "ERC20InsufficientBalance");
    });

    it("Should emit Transfer events on transfers", async function () {
        const transferAmount = ethers.parseEther("500"); 
    
        await expect(myToken.transfer(addr1.address, transferAmount))
            .to.emit(myToken, "Transfer")
            .withArgs(owner.address, addr1.address, transferAmount);
    });
    

    it("Should not allow burning more tokens than the balance", async function () {
        const burnAmount = ethers.parseEther("15000"); 
    
        await expect(myToken.burn(burnAmount))
            .to.be.revertedWithCustomError(myToken, "ERC20InsufficientBalance");
    });
    
    

    it("Should emit Transfer and Approval events on minting", async function () {
        const mintAmount = ethers.parseEther("2000"); 
    
        await expect(myToken.mint(addr1.address, mintAmount))
            .to.emit(myToken, "Transfer")
            .withArgs(ethers.ZeroAddress, addr1.address, mintAmount);
    });
    
});