import { expect } from "chai";
import { ethers } from "hardhat";

describe("SokoScan", function () {
  async function deploy() {
    const [owner, merchant, customer] = await ethers.getSigners();
    const SP = await ethers.getContractFactory("SokoPoints");
    const sokoPoints = await SP.deploy();
    const SS = await ethers.getContractFactory("SokoScan");
    const CUSD = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1";
    const sokoScan = await SS.deploy(CUSD, await sokoPoints.getAddress());
    await sokoPoints.setSokoScan(await sokoScan.getAddress());
    return { sokoScan, sokoPoints, owner, merchant, customer };
  }

  it("should register a merchant", async function () {
    const { sokoScan, merchant } = await deploy();
    await sokoScan.connect(merchant).registerMerchant("Test Shop", "Food & Drinks", 10);
    expect(await sokoScan.isMerchant(merchant.address)).to.be.true;
    const id = await sokoScan.merchantIdByWallet(merchant.address);
    const data = await sokoScan.getMerchant(id);
    expect(data.name).to.equal("Test Shop");
    expect(data.pointsPerCUSD).to.equal(10);
  });

  it("should reject duplicate merchant registration", async function () {
    const { sokoScan, merchant } = await deploy();
    await sokoScan.connect(merchant).registerMerchant("Test Shop", "Food & Drinks", 10);
    await expect(
      sokoScan.connect(merchant).registerMerchant("Test Shop 2", "Clothing", 5)
    ).to.be.revertedWith("Already registered");
  });

  it("should reject invalid points rate", async function () {
    const { sokoScan, merchant } = await deploy();
    await expect(
      sokoScan.connect(merchant).registerMerchant("Shop", "Food & Drinks", 0)
    ).to.be.revertedWith("Invalid rate");
    await expect(
      sokoScan.connect(merchant).registerMerchant("Shop", "Food & Drinks", 101)
    ).to.be.revertedWith("Invalid rate");
  });
});
