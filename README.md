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
npm run deploy:alfajores
cd frontend && npm install && npm run dev
```
