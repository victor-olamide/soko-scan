import { expect } from "chai";
import { ethers } from "hardhat";

describe("SokoScan", function () {
  async function deploy() {
    const [owner, merchant, customer] = await ethers.getSigners();
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const cUSD = await MockERC20.deploy("cUSD", "cUSD");
    const SP = await ethers.getContractFactory("SokoPoints");
    const sokoPoints = await SP.deploy();
    const SS = await ethers.getContractFactory("SokoScan");
    const sokoScan = await SS.deploy(await cUSD.getAddress(), await sokoPoints.getAddress());
    await sokoPoints.setSokoScan(await sokoScan.getAddress());
    return { sokoScan, sokoPoints, cUSD, owner, merchant, customer };
  }

  it("should deploy with correct cUSD address", async function () {
    const { sokoScan, cUSD } = await deploy();
    expect(await sokoScan.cUSD()).to.equal(await cUSD.getAddress());
  });
});
