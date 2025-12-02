# 🐼 Panda Pay - Secure P2P Crypto Payments

A simple, secure, and user-friendly escrow-based payment system for peer-to-peer cryptocurrency transactions on Arbitrum and Optimism L2 networks.

## 🚀 Features

### Smart Contract
- **Escrow Pattern**: Secure 7-day holding period before funds can be claimed
- **Multi-Asset Support**: ETH and ERC20 tokens (USDC/USDT)
- **Security First**: OpenZeppelin libraries, ReentrancyGuard, pull payments
- **Cancellation Option**: Sender can cancel after escrow period if unclaimed
- **Emergency Pause**: Owner can pause contract in emergencies
- **L2 Optimized**: Designed for low-cost transactions on Layer 2

### Frontend
- **Modern UI**: Beautiful, responsive design with Tailwind CSS
- **Wallet Integration**: RainbowKit with support for MetaMask, WalletConnect, etc.
- **Real-time Updates**: Automatic payment status tracking
- **Multi-Chain**: Support for Arbitrum & Optimism (testnets + mainnets)
- **Dark Mode**: Full dark mode support

## 📁 Project Structure

```
panda-pay/
├── contracts/          # Hardhat smart contracts
│   ├── contracts/
│   │   ├── PaymentEscrow.sol
│   │   └── MockUSDC.sol
│   ├── test/
│   ├── scripts/
│   └── README.md
└── frontend/           # React + Vite web app
    ├── src/
    │   ├── components/
    │   ├── lib/
    │   └── App.tsx
    └── README.md
```

## 🛠️ Tech Stack

### Smart Contracts
- Solidity 0.8.24
- Hardhat
- OpenZeppelin Contracts
- TypeScript
- Ethers.js v6

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- wagmi + viem
- RainbowKit
- TanStack Query

## 🏁 Quick Start

### 1. Clone and Install

```bash
cd panda-pay

# Install contract dependencies
cd contracts
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Smart Contracts

```bash
cd contracts

# Compile contracts
npm run compile

# Run tests (all 32 tests should pass)
npm test

# Deploy to local network
npm run deploy:local

# Deploy to Arbitrum Sepolia (testnet)
npm run deploy:arbitrum-sepolia

# Deploy to Optimism Sepolia (testnet)
npm run deploy:optimism-sepolia
```

### 3. Frontend

```bash
cd frontend

# Copy environment file
cp .env.example .env

# Edit .env and add your WalletConnect Project ID
# Get one at: https://cloud.walletconnect.com/

# Update contract addresses in src/lib/constants.ts

# Start development server
npm run dev
```

## 📝 Smart Contract Architecture

### PaymentEscrow.sol

```solidity
// Core Functions
createPayment(recipient, token, amount) → Creates escrowed payment
claimPayment(paymentId) → Recipient claims payment
cancelPayment(paymentId) → Sender cancels after 7 days

// View Functions
getPayment(paymentId) → Get payment details
getSentPayments(address) → Get all sent payment IDs
getReceivedPayments(address) → Get all received payment IDs
canCancelPayment(paymentId) → Check if payment can be cancelled
```

### Security Features
✅ ReentrancyGuard on all state-changing functions
✅ Pull payment pattern (no push)
✅ SafeERC20 for token interactions
✅ Access control per payment
✅ Pausable for emergencies
✅ 7-day escrow period
✅ No upgrade mechanisms (immutable)

### Test Coverage
- 32 comprehensive tests
- 100% pass rate
- Gas reporting included
- Edge cases covered

**Gas Usage:**
- Create Payment: ~197,000 gas (~$0.10-0.50 on L2)
- Claim Payment: ~66,000 gas (~$0.05-0.20 on L2)

## 🎨 Frontend Usage

### Sending a Payment
1. Connect wallet
2. Enter recipient address
3. Select token (ETH or USDC)
4. Enter amount
5. Confirm transaction

### Receiving a Payment
1. Connect wallet
2. View "Received" tab
3. Click "Claim Payment"
4. Confirm transaction

### Cancelling a Payment
1. Wait 7 days after creation
2. View "Sent" tab
3. Click "Cancel Payment"
4. Confirm transaction

## 🌐 Supported Networks

### Testnets
- **Arbitrum Sepolia** (Chain ID: 421614)
- **Optimism Sepolia** (Chain ID: 11155420)

### Mainnets
- **Arbitrum** (Chain ID: 42161)
- **Optimism** (Chain ID: 10)

## 🔐 Security Considerations

### Before Mainnet Deployment
- [ ] Complete professional security audit
- [ ] Run static analysis (Slither, Mythril)
- [ ] Test extensively on testnets
- [ ] Consider bug bounty program
- [ ] Review all contract interactions

### User Safety
- Always verify recipient addresses
- Start with small test amounts
- Understand escrow period
- Double-check transaction details
- Use hardware wallet for large amounts

## 🚢 Deployment Checklist

### Smart Contracts
1. Deploy to testnet (Arbitrum/Optimism Sepolia)
2. Verify contracts on block explorer
3. Test all functions thoroughly
4. Consider security audit
5. Deploy to mainnet
6. Verify on mainnet explorer

### Frontend
1. Update contract addresses in `constants.ts`
2. Set WalletConnect Project ID
3. Test on all supported networks
4. Build production version
5. Deploy to Vercel/Netlify
6. Monitor for issues

## 📚 Documentation

- [Smart Contracts README](./contracts/README.md)
- [Frontend README](./frontend/README.md)
- Smart Contract Tests: `contracts/test/PaymentEscrow.test.ts`
- Deployment Script: `contracts/scripts/deploy.ts`

## 🧪 Development Workflow

### Testing Smart Contracts
```bash
cd contracts
npm test                # Run all tests
npm run test:gas        # With gas reporting
npm run coverage        # Test coverage
```

### Frontend Development
```bash
cd frontend
npm run dev            # Start dev server
npm run build          # Production build
npm run preview        # Preview production build
```

## 🤝 Contributing

This is a learning/portfolio project. Feel free to fork and adapt for your needs.

## ⚠️ Disclaimer

This software is provided as-is for educational purposes. Use at your own risk. Always perform thorough testing and audits before deploying to mainnet with real funds.

## 📄 License

MIT

## 🎯 Next Steps

1. **Deploy to Testnet**: Test on Arbitrum Sepolia or Optimism Sepolia
2. **Get Test ETH**: Use faucets for testnet ETH
3. **Connect Wallet**: Set up MetaMask with test networks
4. **Create Test Payment**: Send a small test payment
5. **Iterate**: Improve based on testing feedback

## 💡 Future Enhancements

- Multi-signature support
- Dispute resolution mechanism
- Payment requests/invoices
- Email/SMS notifications
- Payment splitting
- Recurring payments
- Gas optimization
- Additional token support

---

Built with ❤️ using Hardhat, React, wagmi, and RainbowKit
