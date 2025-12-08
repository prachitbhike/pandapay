# Panda - Event Ticketing with Bonding Curves

An event ticketing platform that uses AMM-style bonding curves for dynamic pricing. Early supporters pay less, with prices increasing as tickets sell.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Frontend (Next.js)                 │
│  - Event discovery                                      │
│  - Ticket purchase flow                                 │
│  - User profile / ticket collection                     │
│  - Manager dashboard (create events, set curves)        │
│  - QR code display for tickets                          │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    Privy (Auth + Wallet)                │
│  - Email/social login                                   │
│  - Embedded wallet creation                             │
│  - Transaction signing                                  │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                  Smart Contracts (Base)                 │
│                                                         │
│  EventFactory.sol                                       │
│  - createEvent(params) → deploys new Event contract     │
│                                                         │
│  Event.sol                                              │
│  - Bonding curve logic (linear & exponential)           │
│  - buyTicket() → calculates price, mints NFT            │
│                                                         │
│  TicketNFT.sol (ERC-721)                                │
│  - Minted on purchase                                   │
│  - On-chain metadata & SVG image generation             │
└─────────────────────────────────────────────────────────┘
```

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Auth/Wallet**: Privy for authentication and embedded wallets
- **Blockchain**: Base Sepolia (Ethereum L2) testnet
- **Smart Contracts**: Solidity 0.8.20, Hardhat
- **Contract Interaction**: viem + wagmi

## Project Structure

```
panda/
├── contracts/               # Smart contracts (Hardhat)
│   ├── contracts/
│   │   ├── EventFactory.sol # Factory for deploying events
│   │   ├── Event.sol        # Bonding curve + ticket sales
│   │   └── TicketNFT.sol    # ERC-721 ticket NFTs
│   ├── test/                # Contract tests
│   └── scripts/             # Deployment scripts
│
└── frontend/                # Next.js frontend
    └── src/
        ├── app/             # Next.js pages
        │   ├── page.tsx         # Event discovery
        │   ├── event/[address]/ # Event detail + buy
        │   ├── create/          # Create event
        │   ├── profile/         # My tickets
        │   └── ticket/[id]/     # Ticket detail + QR
        ├── components/      # React components
        ├── hooks/           # Custom hooks for contracts
        ├── lib/             # Utils, contracts, config
        └── providers/       # Privy + wagmi providers
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Smart Contracts Setup

```bash
# Navigate to contracts directory
cd contracts

# Install dependencies
npm install

# Compile contracts
npm run compile

# Run tests
npm run test

# Start local Hardhat node (optional)
npm run node

# Deploy to local network
npm run deploy:local

# Deploy to Base Sepolia (requires .env configuration)
npm run deploy:base-sepolia
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Edit .env.local with your values:
# - NEXT_PUBLIC_PRIVY_APP_ID (get from https://dashboard.privy.io)
# - NEXT_PUBLIC_FACTORY_ADDRESS (from deployment)
# - NEXT_PUBLIC_TICKET_NFT_ADDRESS (from deployment)

# Start development server
npm run dev
```

### Environment Variables

#### Contracts (.env)
```
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
PRIVATE_KEY=your_private_key_here
BASESCAN_API_KEY=your_basescan_api_key
```

#### Frontend (.env.local)
```
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
NEXT_PUBLIC_FACTORY_ADDRESS=0x...
NEXT_PUBLIC_TICKET_NFT_ADDRESS=0x...
NEXT_PUBLIC_CHAIN_ID=84532
```

## Bonding Curves

The platform supports two types of bonding curves:

### Linear Curve
```
price = basePrice + (slope × ticketsSold)
```
Example: Base price 0.01 ETH, slope 0.001 ETH
- Ticket #1: 0.01 ETH
- Ticket #10: 0.019 ETH
- Ticket #100: 0.109 ETH

### Exponential Curve
```
price = basePrice × (1 + rate)^ticketsSold
```
Example: Base price 0.01 ETH, rate 5%
- Ticket #1: 0.01 ETH
- Ticket #10: 0.0163 ETH
- Ticket #50: 0.1147 ETH

## Features

- **Dynamic Pricing**: Bonding curves reward early buyers
- **NFT Tickets**: Each ticket is a unique ERC-721 token
- **On-Chain Metadata**: SVG images generated on-chain
- **QR Code Entry**: Tickets include QR codes for venue entry
- **Multi-Buy**: Purchase up to 10 tickets in one transaction
- **Memory Collection**: Past tickets become collectible memories

## Contract Functions

### EventFactory
- `createEvent()`: Deploy a new event with bonding curve
- `getAllEvents()`: Get all event addresses
- `getEventsByManager()`: Get events by creator

### Event
- `buyTicket()`: Purchase a ticket at current price
- `buyTickets(count)`: Purchase multiple tickets
- `getCurrentPrice()`: Get current ticket price
- `getPriceAtSupply(supply)`: Preview price at any supply
- `getPriceRange(start, count)`: Get prices for curve visualization

### TicketNFT
- `getTicketData(tokenId)`: Get ticket metadata
- `getTicketsByOwner(address)`: Get all tickets owned by address
- `tokenURI(tokenId)`: Get on-chain metadata with SVG image

## Development

```bash
# Run contract tests
cd contracts && npm run test

# Build frontend
cd frontend && npm run build

# Lint frontend
cd frontend && npm run lint
```

## Deployment to Base Sepolia

1. Get Base Sepolia ETH from a faucet
2. Configure your `.env` with private key
3. Run deployment:
   ```bash
   cd contracts
   npm run deploy:base-sepolia
   ```
4. Copy contract addresses to frontend `.env.local`
5. Deploy frontend to Vercel or similar

## License

MIT
