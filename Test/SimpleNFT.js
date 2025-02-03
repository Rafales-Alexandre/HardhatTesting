const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");

describe("SimpleNFT", function () {
  const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

  let owner, addr1, addr2;
  before(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
  });

  async function deploySimpleNFTFixture() {
    const SimpleNFT = await ethers.deployContract("SimpleNFT", ["TestNFT", "TNFT"]);
    return { simpleNFT: SimpleNFT, owner, addr1, addr2 };
  }

  describe("Deployment", function () {
    it("Should initialize with the correct name and symbol", async function () {
      const { simpleNFT } = await loadFixture(deploySimpleNFTFixture);
      expect(await simpleNFT.name()).to.equal("TestNFT");
      expect(await simpleNFT.symbol()).to.equal("TNFT");
    });
  });

  describe("Minting", function () {
    beforeEach(async function () {});

    it("Should mint a new token and assign it to the correct owner", async function () {
      const { simpleNFT, addr1 } = await loadFixture(deploySimpleNFTFixture);
      await expect(simpleNFT.mint(addr1.address, 1))
        .to.emit(simpleNFT, "Transfer")
        .withArgs(ZERO_ADDRESS, addr1.address, 1);
      expect(await simpleNFT.balanceOf(addr1.address)).to.equal(1);
      expect(await simpleNFT.ownerOf(1)).to.equal(addr1.address);
    });

    it("Should not mint a token to the zero address", async function () {
      const { simpleNFT } = await loadFixture(deploySimpleNFTFixture);
      await expect(simpleNFT.mint(ZERO_ADDRESS, 1))
        .to.be.revertedWithCustomError(simpleNFT, "InvalidRecipient");
    });

    it("Should not mint a token with an existing ID", async function () {
      const { simpleNFT, addr1, addr2 } = await loadFixture(deploySimpleNFTFixture);
      await simpleNFT.mint(addr1.address, 1);
      await expect(simpleNFT.mint(addr2.address, 1))
        .to.be.revertedWithCustomError(simpleNFT, "TokenAlreadyExists");
    });
  });

  describe("Token Transfers", function () {
    beforeEach(async function () {
      const fixture = await loadFixture(deploySimpleNFTFixture);
      this.simpleNFT = fixture.simpleNFT;
      this.addr1 = fixture.addr1;
      this.addr2 = fixture.addr2;
      await this.simpleNFT.mint(this.addr1.address, 1);
    });

    it("Should transfer a token from one owner to another", async function () {
      await expect(
        this.simpleNFT.connect(this.addr1).transferFrom(this.addr1.address, this.addr2.address, 1)
      )
        .to.emit(this.simpleNFT, "Transfer")
        .withArgs(this.addr1.address, this.addr2.address, 1);
      expect(await this.simpleNFT.ownerOf(1)).to.equal(this.addr2.address);
      expect(await this.simpleNFT.balanceOf(this.addr1.address)).to.equal(0);
      expect(await this.simpleNFT.balanceOf(this.addr2.address)).to.equal(1);
    });

    it("Should not transfer a token if not authorized", async function () {
      await expect(
        this.simpleNFT.connect(this.addr2).transferFrom(this.addr1.address, this.addr2.address, 1)
      ).to.be.revertedWithCustomError(this.simpleNFT, "NotAuthorized");
    });
  });

  describe("Token Approval", function () {
    beforeEach(async function () {
      const fixture = await loadFixture(deploySimpleNFTFixture);
      this.simpleNFT = fixture.simpleNFT;
      this.addr1 = fixture.addr1;
      this.addr2 = fixture.addr2;
      await this.simpleNFT.mint(this.addr1.address, 1);
    });

    it("Should approve an address to manage a specific token", async function () {
      await expect(
        this.simpleNFT.connect(this.addr1).approve(this.addr2.address, 1)
      )
        .to.emit(this.simpleNFT, "Approval")
        .withArgs(this.addr1.address, this.addr2.address, 1);
      expect(await this.simpleNFT.getApproved(1)).to.equal(this.addr2.address);
    });

    it("Should not approve the zero address as an operator", async function () {
      await expect(
        this.simpleNFT.connect(this.addr1).approve(ZERO_ADDRESS, 1)
      ).to.be.revertedWithCustomError(this.simpleNFT, "InvalidRecipient");
    });
  });

  describe("Operator Approvals", function () {
    beforeEach(async function () {
      const fixture = await loadFixture(deploySimpleNFTFixture);
      this.simpleNFT = fixture.simpleNFT;
      this.addr1 = fixture.addr1;
      this.addr2 = fixture.addr2;
      await this.simpleNFT.mint(this.addr1.address, 1);
    });

    it("Should allow an operator to transfer tokens", async function () {
      await expect(
        this.simpleNFT.connect(this.addr1).setApprovalForAll(this.addr2.address, true)
      )
        .to.emit(this.simpleNFT, "ApprovalForAll")
        .withArgs(this.addr1.address, this.addr2.address, true);
      expect(await this.simpleNFT.isApprovedForAll(this.addr1.address, this.addr2.address)).to.equal(true);
      await expect(
        this.simpleNFT.connect(this.addr2).transferFrom(this.addr1.address, this.addr2.address, 1)
      )
        .to.emit(this.simpleNFT, "Transfer")
        .withArgs(this.addr1.address, this.addr2.address, 1);
      expect(await this.simpleNFT.ownerOf(1)).to.equal(this.addr2.address);
      expect(await this.simpleNFT.balanceOf(this.addr1.address)).to.equal(0);
      expect(await this.simpleNFT.balanceOf(this.addr2.address)).to.equal(1);
    });

    it("Should not allow self-approval as an operator", async function () {
      await expect(
        this.simpleNFT.connect(this.addr1).setApprovalForAll(this.addr1.address, true)
      ).to.be.revertedWithCustomError(this.simpleNFT, "CannotApproveSelf");
    });
  });
});
