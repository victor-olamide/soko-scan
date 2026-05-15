import { ethers, network } from "hardhat";

const CUSD_MAINNET = "0x765DE816845861e75A25fCA122bb6898B8B1282a";
const CUSD_ALFAJORES = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);
  const cUSD = network.name === "celo" ? CUSD_MAINNET : CUSD_ALFAJORES;
  console.log("Network:", network.name, "| cUSD:", cUSD);

  const SokoPoints = await ethers.getContractFactory("SokoPoints");
  const sokoPoints = await SokoPoints.deploy();
  await sokoPoints.waitForDeployment();
  const spAddr = await sokoPoints.getAddress();
  console.log("SokoPoints deployed to:", spAddr);

  const SokoScan = await ethers.getContractFactory("SokoScan");
  const sokoScan = await SokoScan.deploy(cUSD, spAddr);
  await sokoScan.waitForDeployment();
  const ssAddr = await sokoScan.getAddress();
  console.log("SokoScan deployed to:", ssAddr);

  await sokoPoints.setSokoScan(ssAddr);
  console.log("SokoPoints linked to SokoScan.");

  console.log("\n=== Paste into frontend/lib/contracts.ts ===");
  console.log(`SOKO_SCAN_ADDRESS[${network.name === "celo" ? 42220 : 44787}] = "${ssAddr}"`);
  console.log(`SOKO_POINTS_ADDRESS[${network.name === "celo" ? 42220 : 44787}] = "${spAddr}"`);
}

main().catch((e) => { console.error(e); process.exit(1); });
