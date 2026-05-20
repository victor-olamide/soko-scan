export function truncateAddress(address: string, chars = 4): string {
  if (!address || address.length < chars * 2 + 2) return address;
  return `${address.slice(0, chars + 2)}…${address.slice(-chars)}`;
}

export function formatCUSD(wei: bigint): string {
  return (Number(wei) / 1e18).toFixed(2);
}
