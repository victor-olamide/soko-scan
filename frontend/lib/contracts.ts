export const CUSD_ADDRESS = {
  42220: "0x765DE816845861e75A25fCA122bb6898B8B1282a",
  44787: "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1",
} as const;

export const SOKO_SCAN_ADDRESS = {
  42220: "0x95F3d1fd127813109db55a1ca547e2823406ea94" as `0x${string}`,
  44787: "" as `0x${string}`,
} as const;

export const SOKO_POINTS_ADDRESS = {
  42220: "0xc6bC20a3f5a14B3F46dCDbFEb44296693110f97d" as `0x${string}`,
  44787: "" as `0x${string}`,
} as const;

export const SOKO_SCAN_ABI = [
  {
    name: "registerMerchant", type: "function", stateMutability: "nonpayable",
    inputs: [{ name: "name", type: "string" },{ name: "category", type: "string" },{ name: "pointsPerCUSD", type: "uint256" }],
    outputs: [{ name: "merchantId", type: "uint256" }],
  },
  {
    name: "pay", type: "function", stateMutability: "nonpayable",
    inputs: [{ name: "merchantId", type: "uint256" },{ name: "amount", type: "uint256" },{ name: "pointsToRedeem", type: "uint256" }],
    outputs: [],
  },
  {
    name: "getMerchant", type: "function", stateMutability: "view",
    inputs: [{ name: "merchantId", type: "uint256" }],
    outputs: [{ name: "", type: "tuple", components: [
      { name: "wallet", type: "address" },{ name: "name", type: "string" },
      { name: "category", type: "string" },{ name: "active", type: "bool" },
      { name: "totalReceived", type: "uint256" },{ name: "txCount", type: "uint256" },
      { name: "pointsPerCUSD", type: "uint256" }
    ]}],
  },
  { name: "merchantIdByWallet", type: "function", stateMutability: "view", inputs: [{ name: "", type: "address" }], outputs: [{ name: "", type: "uint256" }] },
  { name: "isMerchant", type: "function", stateMutability: "view", inputs: [{ name: "", type: "address" }], outputs: [{ name: "", type: "bool" }] },
  { name: "getCustomerPoints", type: "function", stateMutability: "view", inputs: [{ name: "customer", type: "address" },{ name: "merchantId", type: "uint256" }], outputs: [{ name: "", type: "uint256" }] },
  { name: "updateMerchant", type: "function", stateMutability: "nonpayable", inputs: [{ name: "name", type: "string" },{ name: "category", type: "string" }], outputs: [] },
  { name: "deactivateMerchant", type: "function", stateMutability: "nonpayable", inputs: [], outputs: [] },
  { name: "getLoyaltyRules", type: "function", stateMutability: "view", inputs: [{ name: "merchantId", type: "uint256" }], outputs: [{ name: "", type: "tuple[]", components: [{ name: "pointsRequired", type: "uint256" },{ name: "discountBPS", type: "uint256" }] }] },
  { name: "PaymentReceived", type: "event", inputs: [{ name: "merchantId", type: "uint256", indexed: true },{ name: "customer", type: "address", indexed: true },{ name: "amount", type: "uint256", indexed: false },{ name: "pointsIssued", type: "uint256", indexed: false }] },
  { name: "addLoyaltyRule", type: "function", stateMutability: "nonpayable", inputs: [{ name: "pointsRequired", type: "uint256" },{ name: "discountBPS", type: "uint256" }], outputs: [] },
  { name: "MerchantRegistered", type: "event", inputs: [{ name: "merchantId", type: "uint256", indexed: true },{ name: "wallet", type: "address", indexed: true },{ name: "name", type: "string", indexed: false }] },
] as const;

export const ERC20_ABI = [
  { name: "approve", type: "function", stateMutability: "nonpayable", inputs: [{ name: "spender", type: "address" },{ name: "amount", type: "uint256" }], outputs: [{ name: "", type: "bool" }] },
  { name: "allowance", type: "function", stateMutability: "view", inputs: [{ name: "owner", type: "address" },{ name: "spender", type: "address" }], outputs: [{ name: "", type: "uint256" }] },
  { name: "balanceOf", type: "function", stateMutability: "view", inputs: [{ name: "account", type: "address" }], outputs: [{ name: "", type: "uint256" }] },
] as const;
