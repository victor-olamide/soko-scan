# SokoScan

QR-based merchant payment + loyalty system for informal traders on MiniPay.

## Features
- Merchant onboards in 60s — no bank account needed
- Auto-generates payment QR code + shareable link
- Customers pay in cUSD, earn SokoPoints loyalty tokens
- Sales dashboard with cumulative revenue + transaction count
- Points redeemable for discounts (1 point = 0.001 cUSD)

## Contracts
- `SokoPoints.sol` — ERC-20 loyalty token
- `SokoScan.sol` — merchant registry, payment processing, points issuance

## Setup
```bash
cd contracts && npm install
cp .env.example .env  # add PRIVATE_KEY
npm run deploy:alfajores
# Note both addresses → paste into frontend/lib/contracts.ts

cd frontend && npm install && npm run dev
```

## Architecture
- Celo blockchain (L2) for low gas fees
- MiniPay wallet for seamless mobile UX
- On-chain loyalty points via ERC-20 (no backend needed)
- Platform takes 0.5% fee on each transaction
