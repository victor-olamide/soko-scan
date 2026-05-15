import { expect } from "chai";
import { ethers } from "hardhat";

describe("SokoPoints", function () {
  async function deploy() {
    const [owner, sokoScan, user] = await ethers.getSigners();
    const SP = await ethers.getContractFactory("SokoPoints");
    const sp = await SP.deploy();
    return { sp, owner, sokoScan, user };
  }

  it("should deploy with correct name and symbol", async function () {
    const { sp } = await deploy();
    expect(await sp.name()).to.equal("SokoPoints");
    expect(await sp.symbol()).to.equal("SOKO");
  });

  it("should allow owner to set sokoScan address", async function () {
    const { sp, sokoScan } = await deploy();
    await sp.setSokoScan(sokoScan.address);
    expect(await sp.sokoScan()).to.equal(sokoScan.address);
  });
});
