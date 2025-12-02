# ⚡ Panda Pay - Quick Start (15 Minutes)

Get your app running in 15 minutes or less!

## 🎯 What You'll Need

1. MetaMask wallet
2. WalletConnect Project ID (free)
3. Testnet ETH (free)
4. 15 minutes

---

## 📝 Step-by-Step

### 1️⃣ Get WalletConnect ID (2 min)
1. Visit: https://cloud.walletconnect.com/
2. Sign up → Create project → Copy Project ID
3. Save it somewhere

### 2️⃣ Get Testnet ETH (3 min)
1. Add Arbitrum Sepolia to MetaMask:
   - Network: Arbitrum Sepolia
   - RPC: `https://sepolia-rollup.arbitrum.io/rpc`
   - Chain ID: `421614`

2. Get free testnet ETH:
   - Visit: https://www.alchemy.com/faucets/arbitrum-sepolia
   - Paste your address → Get 0.1 ETH

### 3️⃣ Deploy Contract (5 min)
```bash
# Navigate to contracts
cd /Users/prachitbhike/Code/panda/panda-pay/contracts

# Create .env file
cp .env.example .env

# Edit .env and add your MetaMask private key:
# PRIVATE_KEY=your_private_key_here

# Deploy
npm run compile
npm run deploy:arbitrum-sepolia

# SAVE THE CONTRACT ADDRESS SHOWN!
```

### 4️⃣ Configure Frontend (3 min)
```bash
# Navigate to frontend
cd ../frontend

# Create .env file
cp .env.example .env

# Edit .env and add:
# VITE_WALLET_CONNECT_PROJECT_ID=your_project_id_from_step1

# Update contract address in src/lib/constants.ts
# Line ~8: Replace 0x000... with your contract address from step 3
```

### 5️⃣ Test Locally (2 min)
```bash
# Start dev server
npm run dev

# Open http://localhost:5173
# Connect wallet → Create test payment!
```

---

## 🚀 Deploy to Vercel (Optional)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from frontend directory
cd /Users/prachitbhike/Code/panda/panda-pay/frontend
vercel

# Add environment variable when prompted:
# VITE_WALLET_CONNECT_PROJECT_ID = your_project_id

# Deploy to production
vercel --prod
```

---

## ✅ You're Done!

Your app is now running! Test it:
1. Connect MetaMask
2. Create a payment
3. Claim it from another account

---

## 🆘 Something Wrong?

**Contract deployment failed?**
- Check you have testnet ETH
- Verify private key in `.env`

**Frontend not working?**
- Check WalletConnect ID in `.env`
- Verify contract address in `constants.ts`

**Wallet won't connect?**
- Make sure you're on Arbitrum Sepolia network
- Try refreshing the page

---

## 📚 Full Documentation

- [Complete Setup Guide](./SETUP_GUIDE.md) - Detailed instructions
- [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md) - Track your progress
- [README](./README.md) - Project overview

---

Need help? Check the [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed troubleshooting!
