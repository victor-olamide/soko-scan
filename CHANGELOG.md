# Changelog

## [Unreleased]

### Added
- PlatformStats component: live on-chain totals (merchants, payments, cUSD volume)
- Branded Landing page for visitors outside MiniPay
- PWA manifest.json and apple-web-app meta tags
- Open Graph and Twitter Card metadata
- NetworkGuard: warns when connected to unsupported chain
- AppFooter with Celoscan links to deployed contracts
- TxPending spinner component with Celoscan tx link
- Category emoji icons for all merchant types
- Web Share API share button on PaymentQR
- Loyalty rules section with add-rule form in MerchantDashboard
- Update merchant name/category form
- truncateAddress and formatCUSD utility helpers
- Minimum payment validation (0.01 cUSD)
- robots.txt, .env.example

### Fixed
- tsconfig target set to ES2020 for BigInt literal support
- next.config.ts renamed to next.config.js for Next.js 14 compatibility
- CustomerView now pre-fills merchantId from URL ?merchant= param
- Payment success screen now shows merchant name and points value

### Contracts
- Full natspec documentation on SokoScan.sol and SokoPoints.sol
- Added totalMerchants() view function
- Added MerchantUpdated and MerchantDeactivated events

## [1.0.0] — 2026-05-19

- Initial mainnet deployment on Celo
- SokoPoints ERC-20 loyalty token
- SokoScan merchant registry and payment processor
- QR code generation via qrserver.com
- cUSD payments with 0.5% platform fee
- Points redemption for discounts (1 pt = 0.001 cUSD)
