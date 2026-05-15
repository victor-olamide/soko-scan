# SokoScan Contracts

Solidity contracts for the SokoScan payment + loyalty system.

## Contracts
- `SokoPoints.sol` — ERC-20 loyalty token, minted/burned by SokoScan
- `SokoScan.sol` — merchant registry and payment processor

## Deploy
```bash
npm install
cp .env.example .env  # add your PRIVATE_KEY
npm run deploy:alfajores
```
