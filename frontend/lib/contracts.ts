export const CUSD_ADDRESS = {
  42220: "0x765DE816845861e75A25fCA122bb6898B8B1282a",
  44787: "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1",
} as const;

export const SOKO_SCAN_ADDRESS = {
  42220: "" as `0x${string}`,
  44787: "" as `0x${string}`,
} as const;

export const SOKO_POINTS_ADDRESS = {
  42220: "" as `0x${string}`,
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
] as const;
