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
] as const;
