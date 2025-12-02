# Panda Pay - Smart Contracts

Secure escrow-based payment system for ETH and ERC20 tokens (USDC/USDT) on Arbitrum and Optimism L2 networks.

## Features

- **Escrow Pattern**: Secure funds until recipient claims or sender cancels after 7 days
- **Multi-Asset Support**: ETH and ERC20 tokens (USDC, USDT, or any ERC20)
- **Security First**: ReentrancyGuard, pull payments, pausable emergency stop
- **L2 Optimized**: Designed for low-cost transactions on Arbitrum/Optimism
- **Comprehensive Tests**: 32 test cases covering all scenarios and edge cases

## Smart Contract Architecture

### PaymentEscrow.sol
Main contract implementing escrow functionality with:
- `createPayment()` - Lock funds in escrow
- `claimPayment()` - Recipient withdraws payment
- `cancelPayment()` - Sender reclaims funds after 7 days
- 7-day escrow period for dispute resolution
- Emergency pause mechanism (owner only)

### Security Features
- ✅ OpenZeppelin ReentrancyGuard
- ✅ Pull payment pattern (no push)
- ✅ SafeERC20 for token interactions
- ✅ Pausable for emergencies
- ✅ Access control per payment
- ✅ No upgrade mechanisms (immutable)

## Setup

```bash
npm install
```

## Development

### Compile Contracts
```bash
npm run compile
```

### Run Tests
```bash
npm test                # Run all tests
npm run test:gas        # With gas reporting
npm run coverage        # Test coverage
```

### Deploy

#### Local (Hardhat Network)
```bash
npm run deploy:local
```

#### Arbitrum Sepolia (Testnet)
```bash
# Set up .env first (copy from .env.example)
npm run deploy:arbitrum-sepolia
```

#### Optimism Sepolia (Testnet)
```bash
npm run deploy:optimism-sepolia
```

### Verify Contract
After deployment, verify on block explorer:
```bash
npx hardhat verify --network arbitrumSepolia <CONTRACT_ADDRESS>
npx hardhat verify --network optimismSepolia <CONTRACT_ADDRESS>
```

## Environment Variables

Copy `.env.example` to `.env` and fill in:

```env
PRIVATE_KEY=your_private_key_here
ARBISCAN_API_KEY=your_arbiscan_api_key
OPTIMISM_API_KEY=your_optimism_api_key
REPORT_GAS=true
```

## Test Results

All 32 tests passing with comprehensive coverage:
- ✅ ETH payments (create, claim, cancel)
- ✅ ERC20 payments (USDC/USDT)
- ✅ Access control and authorization
- ✅ Escrow period enforcement
- ✅ Pausable functionality
- ✅ Edge cases and security

### Gas Usage (Estimated)
- Create payment: ~197,000 gas (~$0.10-0.50 on L2)
- Claim payment: ~66,000 gas (~$0.05-0.20 on L2)

## Supported Networks

### Testnets
- Arbitrum Sepolia (Chain ID: 421614)
- Optimism Sepolia (Chain ID: 11155420)

### Mainnets (Production)
- Arbitrum One (Chain ID: 42161)
- Optimism (Chain ID: 10)

## Contract Addresses

Will be populated after deployment:

```json
{
  "arbitrumSepolia": "TBD",
  "optimismSepolia": "TBD",
  "arbitrum": "TBD",
  "optimism": "TBD"
}
```

## Security Considerations

### Auditing
- Self-audit completed with security checklist
- Consider professional audit before mainnet deployment
- Bug bounty program recommended for production

### Best Practices
- Never commit private keys
- Use hardware wallet for mainnet deployments
- Test thoroughly on testnet first
- Start with small amounts

## License

MIT
