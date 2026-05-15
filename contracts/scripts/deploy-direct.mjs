import { ethers } from "ethers";
import { readFileSync } from "fs";
import { createRequire } from "module";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import dotenv from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "../.env") });

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CUSD = "0x765DE816845861e75A25fCA122bb6898B8B1282a";

const RPCS = [
  "https://forno.celo.org",
  "https://1rpc.io/celo",
  "https://rpc.ankr.com/celo",
];

async function getProvider() {
  for (const url of RPCS) {
    try {
      const p = new ethers.JsonRpcProvider(url, { chainId: 42220, name: "celo" });
      await p.getBlockNumber();
      console.log("Connected via:", url);
      return p;
    } catch (e) {
      console.log("Failed:", url, "-", e.message?.slice(0, 60));
    }
  }
  throw new Error("All RPCs failed");
}

const require = createRequire(import.meta.url);
const artifactsPath = join(__dirname, "../artifacts/contracts");

function loadArtifact(name) {
  const path = join(artifactsPath, `${name}.sol/${name}.json`);
  return JSON.parse(readFileSync(path, "utf8"));
}

async function main() {
  const provider = await getProvider();
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  console.log("Deployer:", wallet.address);

  const balance = await provider.getBalance(wallet.address);
  console.log("Balance:", ethers.formatEther(balance), "CELO");

  // Deploy SokoPoints
  const spArtifact = loadArtifact("SokoPoints");
  const SPFactory = new ethers.ContractFactory(spArtifact.abi, spArtifact.bytecode, wallet);
  console.log("\nDeploying SokoPoints...");
  const sokoPoints = await SPFactory.deploy();
  await sokoPoints.waitForDeployment();
  const spAddr = await sokoPoints.getAddress();
  console.log("SokoPoints deployed to:", spAddr);

  // Deploy SokoScan
  const ssArtifact = loadArtifact("SokoScan");
  const SSFactory = new ethers.ContractFactory(ssArtifact.abi, ssArtifact.bytecode, wallet);
  console.log("\nDeploying SokoScan...");
  const sokoScan = await SSFactory.deploy(CUSD, spAddr);
  await sokoScan.waitForDeployment();
  const ssAddr = await sokoScan.getAddress();
  console.log("SokoScan deployed to:", ssAddr);

  // Link
  console.log("\nLinking SokoPoints → SokoScan...");
  const tx = await sokoPoints.setSokoScan(ssAddr);
  await tx.wait();
  console.log("Linked.");

  console.log("\n=== Paste into frontend/lib/contracts.ts ===");
  console.log(`  42220: "${ssAddr}" as \`0x\${string}\`,  // SOKO_SCAN_ADDRESS`);
  console.log(`  42220: "${spAddr}" as \`0x\${string}\`,  // SOKO_POINTS_ADDRESS`);
}

main().catch((e) => { console.error(e); process.exit(1); });
