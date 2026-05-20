# SokoScan

QR-based merchant payment + loyalty system for informal traders on MiniPay.

> **Live on Celo Mainnet** — [Open in MiniPay](https://sokoscan.vercel.app)

## Features

- Merchant onboards in 60 seconds — no bank account needed
- Auto-generates a scannable QR code and shareable payment link
- Customers pay in cUSD; funds arrive in the merchant wallet instantly
- Automatic SokoPoints loyalty tokens issued per payment
- Points redeemable for discounts (1 point = 0.001 cUSD)
- Sales dashboard: total revenue, transaction count, avg transaction value
- Loyalty rules: set custom point thresholds for percentage discounts
- Platform stats: live on-chain totals visible to all users

## Deployed Contracts (Celo Mainnet)

| Contract | Address |
|---|---|
| SokoScan | [`0x95F3d1fd127813109db55a1ca547e2823406ea94`](https://celoscan.io/address/0x95F3d1fd127813109db55a1ca547e2823406ea94) |
| SokoPoints (SOKO) | [`0xc6bC20a3f5a14B3F46dCDbFEb44296693110f97d`](https://celoscan.io/address/0xc6bC20a3f5a14B3F46dCDbFEb44296693110f97d) |

## Contracts

- `SokoPoints.sol` — ERC-20 loyalty token; minted/burned exclusively by SokoScan
- `SokoScan.sol` — merchant registry, cUSD payment processor, points issuance engine

## Setup

```bash
# 1. Deploy contracts (optional — already live on mainnet)
cd contracts && npm install
cp .env.example .env  # add PRIVATE_KEY
npm run deploy:celo       # mainnet
npm run deploy:alfajores  # testnet
# Update addresses in frontend/lib/contracts.ts

# 2. Run frontend
cd frontend && npm install && npm run dev
```

## Architecture

- **Celo** (L2) — low gas fees, fast finality, cUSD stablecoin
- **MiniPay** — mobile wallet for the next billion users
- **No backend** — all state lives on-chain; frontend is a static Next.js app
- **0.5% platform fee** per transaction, collected in the contract, withdrawable by owner

## How It Works

1. **Merchant** registers on-chain with a business name, category, and points rate
2. SokoScan generates a QR code encoding the merchant's payment URL
3. **Customer** scans the QR, enters an amount, and pays in cUSD
4. Smart contract routes funds to the merchant (minus 0.5% fee) and mints SokoPoints to the customer
5. Customer redeems accumulated points for a discount on future payments

## Tech Stack

- Next.js 14 (App Router, static export)
- wagmi v2 + viem for wallet and contract interactions
- Tailwind CSS
- Hardhat + OpenZeppelin for contracts

## License

MIT
