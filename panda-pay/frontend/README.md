# Panda Pay - Frontend

Modern React web application for secure P2P crypto payments with escrow functionality.

## Features

- **Wallet Connection**: RainbowKit integration with MetaMask, WalletConnect, and more
- **Multi-Chain Support**: Arbitrum & Optimism (testnets and mainnets)
- **Escrow Payments**: Secure 7-day escrow period for all payments
- **Multi-Asset**: Support for ETH and USDC stablecoin
- **Real-time Updates**: Automatic payment status tracking
- **Responsive Design**: Beautiful UI with Tailwind CSS and dark mode support

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **wagmi** - Ethereum interactions
- **viem** - Ethereum utilities
- **RainbowKit** - Wallet connection UI
- **TanStack Query** - Data fetching

## Setup

### Prerequisites

- Node.js 18+
- MetaMask or compatible wallet

### Installation

```bash
npm install
```

### Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Get a WalletConnect Project ID from [https://cloud.walletconnect.com/](https://cloud.walletconnect.com/)

3. Update `.env`:
```env
VITE_WALLET_CONNECT_PROJECT_ID=your_project_id_here
```

4. Update contract addresses in `src/lib/constants.ts` after deployment

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Build

```bash
npm run build
npm run preview
```

## Contract Integration

### Updating Contract Addresses

After deploying the smart contracts, update the addresses in `src/lib/constants.ts`:

```typescript
export const PAYMENT_ESCROW_ADDRESSES: Record<number, `0x${string}`> = {
  421614: '0xYourArbitrumSepoliaAddress', // Arbitrum Sepolia
  11155420: '0xYourOptimismSepoliaAddress', // Optimism Sepolia
  42161: '0xYourArbitrumAddress', // Arbitrum
  10: '0xYourOptimismAddress', // Optimism
};
```

### Supported Networks

- **Arbitrum Sepolia** (testnet) - Chain ID: 421614
- **Optimism Sepolia** (testnet) - Chain ID: 11155420
- **Arbitrum** (mainnet) - Chain ID: 42161
- **Optimism** (mainnet) - Chain ID: 10

## Usage

### Sending a Payment

1. Connect your wallet
2. Enter recipient address
3. Select token (ETH or USDC)
4. Enter amount
5. Click "Create Payment"
6. Confirm transaction in wallet

### Receiving a Payment

1. Connect your wallet
2. View "Received" tab
3. Click "Claim Payment" on pending payment
4. Confirm transaction in wallet

### Cancelling a Payment

1. Connect your wallet
2. View "Sent" tab
3. Wait 7 days after payment creation
4. Click "Cancel Payment"
5. Confirm transaction in wallet

## Project Structure

```
src/
├── components/
│   ├── CreatePayment.tsx    # Payment creation form
│   ├── PaymentList.tsx       # List of sent/received payments
│   └── PaymentCard.tsx       # Individual payment display
├── lib/
│   ├── wagmi.ts             # Wagmi configuration
│   ├── abi.ts               # Contract ABIs
│   └── constants.ts         # Contract addresses & constants
├── App.tsx                  # Main app component
└── main.tsx                 # App entry point
```

## Security Considerations

- Never expose private keys
- Always verify transaction details before signing
- Use testnets for testing
- Double-check recipient addresses
- Understand escrow period before sending

## Deployment

### Vercel

```bash
vercel
```

### Netlify

```bash
npm run build
# Upload `dist` folder
```

### GitHub Pages

```bash
npm run build
# Deploy `dist` folder
```

## Troubleshooting

### "Invalid chain" error
- Make sure you're connected to a supported network (Arbitrum or Optimism)
- Switch networks in your wallet

### "Contract not deployed" error
- Verify contract addresses in `constants.ts`
- Ensure contracts are deployed on the current network

### Transaction fails
- Check you have enough ETH for gas
- For ERC20 payments, ensure you've approved the contract

## License

MIT
