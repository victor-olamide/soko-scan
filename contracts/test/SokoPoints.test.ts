import { expect } from "chai";
import { ethers } from "hardhat";

describe("SokoPoints", function () {
  async function deploy() {
    const [owner, sokoScan, user] = await ethers.getSigners();
    const SP = await ethers.getContractFactory("SokoPoints");
    const sp = await SP.deploy();
    await sp.setSokoScan(sokoScan.address);
    return { sp, owner, sokoScan, user };
  }

  it("should deploy with correct name and symbol", async function () {
    const { sp } = await deploy();
    expect(await sp.name()).to.equal("SokoPoints");
    expect(await sp.symbol()).to.equal("SOKO");
  });

  it("should allow owner to set sokoScan address", async function () {
    const { sp, sokoScan } = await deploy();
    expect(await sp.sokoScan()).to.equal(sokoScan.address);
  });

  it("should only allow sokoScan to mint", async function () {
    const { sp, sokoScan, user } = await deploy();
    await expect(sp.connect(user).mint(user.address, 100)).to.be.revertedWith("Only SokoScan");
    await sp.connect(sokoScan).mint(user.address, 100);
    expect(await sp.balanceOf(user.address)).to.equal(100);
  });

  it("should only allow sokoScan to burn", async function () {
    const { sp, sokoScan, user } = await deploy();
    await sp.connect(sokoScan).mint(user.address, 100);
    await expect(sp.connect(user).burn(user.address, 50)).to.be.revertedWith("Only SokoScan");
    await sp.connect(sokoScan).burn(user.address, 50);
    expect(await sp.balanceOf(user.address)).to.equal(50);
  });
});
