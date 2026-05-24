import Anthropic from "@anthropic-ai/sdk";
import { createPublicClient, http, parseAbiItem, formatUnits } from "viem";
import { NextRequest, NextResponse } from "next/server";

const SOKO_SCAN_ADDRESS = "0x95F3d1fd127813109db55a1ca547e2823406ea94" as const;
const CELO_RPC = "https://forno.celo.org";

const SOKO_SCAN_ABI = [
  {
    name: "getMerchant", type: "function", stateMutability: "view",
    inputs: [{ name: "merchantId", type: "uint256" }],
    outputs: [{ name: "", type: "tuple", components: [
      { name: "wallet", type: "address" }, { name: "name", type: "string" },
      { name: "category", type: "string" }, { name: "active", type: "bool" },
      { name: "totalReceived", type: "uint256" }, { name: "txCount", type: "uint256" },
      { name: "pointsPerCUSD", type: "uint256" },
    ]}],
  },
  {
    name: "getCustomerPoints", type: "function", stateMutability: "view",
    inputs: [{ name: "customer", type: "address" }, { name: "merchantId", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "getLoyaltyRules", type: "function", stateMutability: "view",
    inputs: [{ name: "merchantId", type: "uint256" }],
    outputs: [{ name: "", type: "tuple[]", components: [
      { name: "pointsRequired", type: "uint256" }, { name: "discountBPS", type: "uint256" },
    ]}],
  },
  {
    name: "merchantIdByWallet", type: "function", stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "isMerchant", type: "function", stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

const celoClient = createPublicClient({ transport: http(CELO_RPC) });

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const tools: Anthropic.Tool[] = [
  {
    name: "get_platform_stats",
    description: "Fetch live platform-wide statistics: total registered merchants, total payment transactions, and total cUSD volume processed on SokoScan.",
    input_schema: { type: "object" as const, properties: {}, required: [] },
  },
  {
    name: "get_merchant_info",
    description: "Get details about a specific merchant by their numeric ID. Returns name, category, total earnings, transaction count, points rate, and loyalty rules.",
    input_schema: {
      type: "object" as const,
      properties: {
        merchant_id: { type: "number", description: "The numeric merchant ID (e.g. 0, 1, 2, ...)" },
      },
      required: ["merchant_id"],
    },
  },
  {
    name: "get_customer_points",
    description: "Check how many SokoPoints a customer has earned at a specific merchant.",
    input_schema: {
      type: "object" as const,
      properties: {
        customer_address: { type: "string", description: "The customer's Celo wallet address (0x...)" },
        merchant_id: { type: "number", description: "The numeric merchant ID" },
      },
      required: ["customer_address", "merchant_id"],
    },
  },
  {
    name: "lookup_merchant_by_wallet",
    description: "Find a merchant's ID and details using their wallet address.",
    input_schema: {
      type: "object" as const,
      properties: {
        wallet_address: { type: "string", description: "The merchant's Celo wallet address (0x...)" },
      },
      required: ["wallet_address"],
    },
  },
];

async function executeTool(name: string, input: Record<string, unknown>): Promise<string> {
  try {
    if (name === "get_platform_stats") {
      const [registered, payments] = await Promise.all([
        celoClient.getLogs({
          address: SOKO_SCAN_ADDRESS,
          event: parseAbiItem("event MerchantRegistered(uint256 indexed merchantId, address indexed wallet, string name)"),
          fromBlock: 0n, toBlock: "latest",
        }),
        celoClient.getLogs({
          address: SOKO_SCAN_ADDRESS,
          event: parseAbiItem("event PaymentReceived(uint256 indexed merchantId, address indexed customer, uint256 amount, uint256 pointsIssued)"),
          fromBlock: 0n, toBlock: "latest",
        }),
      ]);
      const totalVolume = payments.reduce((acc, log) => acc + ((log.args as { amount?: bigint }).amount ?? 0n), 0n);
      return JSON.stringify({
        total_merchants: registered.length,
        total_payments: payments.length,
        total_volume_cusd: Number(formatUnits(totalVolume, 18)).toFixed(2),
      });
    }

    if (name === "get_merchant_info") {
      const id = BigInt(input.merchant_id as number);
      const merchant = await celoClient.readContract({
        address: SOKO_SCAN_ADDRESS, abi: SOKO_SCAN_ABI, functionName: "getMerchant", args: [id],
      });
      const rules = await celoClient.readContract({
        address: SOKO_SCAN_ADDRESS, abi: SOKO_SCAN_ABI, functionName: "getLoyaltyRules", args: [id],
      });
      return JSON.stringify({
        id: input.merchant_id,
        name: merchant.name,
        category: merchant.category,
        wallet: merchant.wallet,
        active: merchant.active,
        total_earned_cusd: Number(formatUnits(merchant.totalReceived, 18)).toFixed(2),
        transaction_count: Number(merchant.txCount),
        points_per_cusd: Number(merchant.pointsPerCUSD),
        loyalty_rules: rules.map(r => ({
          points_required: Number(r.pointsRequired),
          discount_percent: (Number(r.discountBPS) / 100).toFixed(0),
        })),
      });
    }

    if (name === "get_customer_points") {
      const points = await celoClient.readContract({
        address: SOKO_SCAN_ADDRESS, abi: SOKO_SCAN_ABI, functionName: "getCustomerPoints",
        args: [input.customer_address as `0x${string}`, BigInt(input.merchant_id as number)],
      });
      return JSON.stringify({ customer: input.customer_address, merchant_id: input.merchant_id, points: Number(points) });
    }

    if (name === "lookup_merchant_by_wallet") {
      const wallet = input.wallet_address as `0x${string}`;
      const [isMerchant, merchantId] = await Promise.all([
        celoClient.readContract({ address: SOKO_SCAN_ADDRESS, abi: SOKO_SCAN_ABI, functionName: "isMerchant", args: [wallet] }),
        celoClient.readContract({ address: SOKO_SCAN_ADDRESS, abi: SOKO_SCAN_ABI, functionName: "merchantIdByWallet", args: [wallet] }),
      ]);
      if (!isMerchant) return JSON.stringify({ found: false, message: "This address is not a registered merchant." });
      const merchant = await celoClient.readContract({
        address: SOKO_SCAN_ADDRESS, abi: SOKO_SCAN_ABI, functionName: "getMerchant", args: [merchantId],
      });
      return JSON.stringify({
        found: true,
        id: Number(merchantId),
        name: merchant.name,
        category: merchant.category,
        active: merchant.active,
        total_earned_cusd: Number(formatUnits(merchant.totalReceived, 18)).toFixed(2),
        transaction_count: Number(merchant.txCount),
      });
    }

    return JSON.stringify({ error: "Unknown tool" });
  } catch (err) {
    return JSON.stringify({ error: String(err) });
  }
}

const SYSTEM_PROMPT = `You are SokoAgent, the AI assistant for SokoScan — a QR-based merchant payment and loyalty platform built on Celo for informal traders using MiniPay.

You help merchants understand their sales data, help customers check their loyalty points, and answer questions about the SokoScan platform.

You have live access to the SokoScan smart contract on Celo mainnet. Use your tools to fetch real data when answering questions.

Key facts:
- SokoScan contract: ${SOKO_SCAN_ADDRESS}
- Payments are made in cUSD (Celo Dollar)
- Customers earn SokoPoints on every payment; points can be redeemed for discounts
- 0.5% platform fee per transaction
- Built for MiniPay (mobile wallet)

Agent wallet: ${process.env.AGENT_WALLET_ADDRESS ?? "not configured"}

Be concise, friendly, and helpful. When you don't know something, say so rather than guessing.`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json() as { messages: Anthropic.MessageParam[] };

    let response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      tools,
      messages,
    });

    const toolResults: Anthropic.ToolResultBlockParam[] = [];

    while (response.stop_reason === "tool_use") {
      const toolUseBlocks = response.content.filter((b): b is Anthropic.ToolUseBlock => b.type === "tool_use");
      for (const block of toolUseBlocks) {
        const result = await executeTool(block.name, block.input as Record<string, unknown>);
        toolResults.push({ type: "tool_result", tool_use_id: block.id, content: result });
      }

      response = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        tools,
        messages: [
          ...messages,
          { role: "assistant", content: response.content },
          { role: "user", content: toolResults },
        ],
      });

      toolResults.length = 0;
    }

    const textBlock = response.content.find((b): b is Anthropic.TextBlock => b.type === "text");
    return NextResponse.json({ reply: textBlock?.text ?? "Sorry, I couldn't generate a response." });
  } catch (err) {
    console.error("Agent error:", err);
    return NextResponse.json({ error: "Agent unavailable" }, { status: 500 });
  }
}
