import { ethers, network } from "hardhat";

const CUSD_MAINNET = "0x765DE816845861e75A25fCA122bb6898B8B1282a";
const CUSD_ALFAJORES = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);
  const cUSD = network.name === "celo" ? CUSD_MAINNET : CUSD_ALFAJORES;

  const SokoPoints = await ethers.getContractFactory("SokoPoints");
  const sokoPoints = await SokoPoints.deploy();
  await sokoPoints.waitForDeployment();
  console.log("SokoPoints deployed to:", await sokoPoints.getAddress());
}

main().catch((e) => { console.error(e); process.exit(1); });
