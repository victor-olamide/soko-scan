import { createPublicClient, createWalletClient, http } from "viem";
import { celo } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";
import { ERC8004_IDENTITY_REGISTRY, ERC8004_REGISTRY_ABI, CELO_RPC } from "./contracts.js";

dotenv.config();

const REGISTRATION_JSON_PATH = path.resolve(
  new URL(".", import.meta.url).pathname,
  "../registration.json"
);

async function uploadToPinata(json: object): Promise<string> {
  const jwt = process.env.PINATA_JWT;
  if (!jwt) throw new Error("PINATA_JWT not set in .env");

  const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
    body: JSON.stringify({
      pinataContent: json,
      pinataMetadata: { name: "SokoAgent Registration" },
    }),
  });

  if (!res.ok) throw new Error(`Pinata upload failed: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { IpfsHash: string };
  return `ipfs://${data.IpfsHash}`;
}

async function main() {
  console.log("═".repeat(52));
  console.log("  SokoAgent  |  ERC-8004 Registration");
  console.log("═".repeat(52));

  if (!fs.existsSync(REGISTRATION_JSON_PATH)) {
    throw new Error(`registration.json not found at ${REGISTRATION_JSON_PATH}`);
  }
  const registrationJson = JSON.parse(fs.readFileSync(REGISTRATION_JSON_PATH, "utf-8"));

  const account = (() => {
    const pk = process.env.AGENT_PRIVATE_KEY;
    if (!pk) throw new Error("AGENT_PRIVATE_KEY not set in .env");
    return privateKeyToAccount(`0x${pk.replace(/^0x/, "")}`);
  })();

  console.log(`\nAgent wallet : ${account.address}`);
  console.log(`Registry     : ${ERC8004_IDENTITY_REGISTRY}`);

  const publicClient = createPublicClient({ chain: celo, transport: http(CELO_RPC) });

  const balance = await publicClient.readContract({
    address: ERC8004_IDENTITY_REGISTRY,
    abi: ERC8004_REGISTRY_ABI,
    functionName: "balanceOf",
    args: [account.address],
  });

  if (balance > 0n) {
    const agentId = await publicClient.readContract({
      address: ERC8004_IDENTITY_REGISTRY,
      abi: ERC8004_REGISTRY_ABI,
      functionName: "tokenOfOwnerByIndex",
      args: [account.address, 0n],
    });
    console.log(`\n✓ Already registered!  Agent ID: ${agentId}`);
    console.log(`  View on 8004scan: https://8004scan.io/agents/celo/${agentId}`);
    return;
  }

  console.log("\nUploading registration.json to IPFS via Pinata...");
  const agentURI = await uploadToPinata(registrationJson);
  console.log(`IPFS URI: ${agentURI}`);

  console.log("\nCalling Identity Registry on Celo mainnet...");
  const walletClient = createWalletClient({ account, chain: celo, transport: http(CELO_RPC) });

  const hash = await walletClient.writeContract({
    address: ERC8004_IDENTITY_REGISTRY,
    abi: ERC8004_REGISTRY_ABI,
    functionName: "register",
    args: [agentURI],
  });

  console.log(`Transaction: https://celoscan.io/tx/${hash}`);
  console.log("Waiting for confirmation...");

  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  if (receipt.status === "success") {
    // Get tokenId from Transfer event (topic[3])
    const transferLog = receipt.logs.find(
      l => l.topics[0] === "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"
    );
    const agentId = transferLog ? BigInt(transferLog.topics[3] ?? "0x0") : null;
    console.log(`\n✓ Registered!  Agent ID: ${agentId}`);
    console.log(`  View on 8004scan: https://8004scan.io/agents/celo/${agentId}`);
    console.log(`\nNext: add AGENT_8004_ID=${agentId} to your .env`);
  } else {
    console.error("Transaction reverted. Check celoscan for details.");
  }
}

main().catch((err) => { console.error("Error:", err.message ?? err); process.exit(1); });
