const {
    loadFixture,
  } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
  const { expect } = require("chai");
  
  describe("SimpleNFT", function () {
    const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
  
    // Définition de la fixture
    async function deploySimpleNFTFixture() {
      const [owner, addr1, addr2] = await ethers.getSigners();
      const SimpleNFT = await ethers.deployContract("SimpleNFT", ["TestNFT", "TNFT"]);
  
      return { simpleNFT: SimpleNFT, owner, addr1, addr2 };
    }
  
    it("Should initialize with the correct name and symbol", async function () {
      const { simpleNFT } = await loadFixture(deploySimpleNFTFixture);
  
      expect(await simpleNFT.name()).to.equal("TestNFT");
      expect(await simpleNFT.symbol()).to.equal("TNFT");
    });
  
    it("Should mint a new token and assign it to the correct owner", async function () {
      const { simpleNFT, addr1 } = await loadFixture(deploySimpleNFTFixture);
  
      await simpleNFT.mint(addr1.address, 1);
  
      expect(await simpleNFT.balanceOf(addr1.address)).to.equal(1);
      expect(await simpleNFT.ownerOf(1)).to.equal(addr1.address);
    });
  
    it("Should not mint a token to the zero address", async function () {
      const { simpleNFT } = await loadFixture(deploySimpleNFTFixture);
  
      await expect(simpleNFT.mint(ZERO_ADDRESS, 1)).to.be.revertedWithCustomError(
        simpleNFT,
        "InvalidRecipient"
      );
    });
  
    it("Should not mint a token with an existing ID", async function () {
      const { simpleNFT, addr1, addr2 } = await loadFixture(deploySimpleNFTFixture);
  
      await simpleNFT.mint(addr1.address, 1);
  
      await expect(simpleNFT.mint(addr2.address, 1)).to.be.revertedWithCustomError(
        simpleNFT,
        "TokenAlreadyExists"
      );
    });
  
    it("Should transfer a token from one owner to another", async function () {
      const { simpleNFT, addr1, addr2 } = await loadFixture(deploySimpleNFTFixture);
  
      await simpleNFT.mint(addr1.address, 1);
  
      await simpleNFT.connect(addr1).transferFrom(addr1.address, addr2.address, 1);
  
      expect(await simpleNFT.ownerOf(1)).to.equal(addr2.address);
      expect(await simpleNFT.balanceOf(addr1.address)).to.equal(0);
      expect(await simpleNFT.balanceOf(addr2.address)).to.equal(1);
    });
  
    it("Should not transfer a token if not authorized", async function () {
      const { simpleNFT, addr1, addr2 } = await loadFixture(deploySimpleNFTFixture);
  
      await simpleNFT.mint(addr1.address, 1);
  
      await expect(
        simpleNFT.connect(addr2).transferFrom(addr1.address, addr2.address, 1)
      ).to.be.revertedWithCustomError(simpleNFT, "NotAuthorized");
    });
  
    it("Should approve an address to manage a specific token", async function () {
      const { simpleNFT, addr1, addr2 } = await loadFixture(deploySimpleNFTFixture);
  
      await simpleNFT.mint(addr1.address, 1);
  
      await simpleNFT.connect(addr1).approve(addr2.address, 1);
  
      expect(await simpleNFT.getApproved(1)).to.equal(addr2.address);
    });
  
    it("Should not approve the zero address as an operator", async function () {
      const { simpleNFT, addr1 } = await loadFixture(deploySimpleNFTFixture);
  
      await simpleNFT.mint(addr1.address, 1);
  
      await expect(
        simpleNFT.connect(addr1).approve(ZERO_ADDRESS, 1)
      ).to.be.revertedWithCustomError(simpleNFT, "InvalidRecipient");
    });
  
    it("Should allow an operator to transfer tokens", async function () {
      const { simpleNFT, addr1, addr2 } = await loadFixture(deploySimpleNFTFixture);
  
      await simpleNFT.mint(addr1.address, 1);
  
      await simpleNFT.connect(addr1).setApprovalForAll(addr2.address, true);
  
      expect(await simpleNFT.isApprovedForAll(addr1.address, addr2.address)).to.equal(true);
  
      await simpleNFT.connect(addr2).transferFrom(addr1.address, addr2.address, 1);
  
      expect(await simpleNFT.ownerOf(1)).to.equal(addr2.address);
      expect(await simpleNFT.balanceOf(addr1.address)).to.equal(0);
      expect(await simpleNFT.balanceOf(addr2.address)).to.equal(1);
    });
  
    it("Should not allow self-approval as an operator", async function () {
      const { simpleNFT, addr1 } = await loadFixture(deploySimpleNFTFixture);
  
      await expect(
        simpleNFT.connect(addr1).setApprovalForAll(addr1.address, true)
      ).to.be.revertedWithCustomError(simpleNFT, "CannotApproveSelf");
    });
  });
  