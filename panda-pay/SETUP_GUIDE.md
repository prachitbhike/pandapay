# 🚀 Panda Pay - Complete Setup Guide

This guide walks you through deploying and hosting your Panda Pay application from start to finish.

## 📋 Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] MetaMask wallet installed
- [ ] Git installed (for deployment)

---

## Step 1: Get WalletConnect Project ID

**Why:** Required for wallet connection functionality in your frontend.

1. Go to [https://cloud.walletconnect.com/](https://cloud.walletconnect.com/)
2. Sign up or log in
3. Click "Create New Project"
4. Enter project name: "Panda Pay"
5. Copy your **Project ID**
6. Save it for later (you'll add it to frontend `.env`)

**Time:** 5 minutes
**Cost:** Free

---

## Step 2: Set Up MetaMask with Testnet

**Why:** You need testnet ETH to deploy contracts and test transactions.

### Add Arbitrum Sepolia Network

1. Open MetaMask
2. Click network dropdown (top left)
3. Click "Add network" → "Add network manually"
4. Enter these details:
   - **Network Name:** Arbitrum Sepolia
   - **RPC URL:** `https://sepolia-rollup.arbitrum.io/rpc`
   - **Chain ID:** `421614`
   - **Currency Symbol:** ETH
   - **Block Explorer:** `https://sepolia.arbiscan.io`
5. Click "Save"

### Alternative: Add via Chainlist
1. Go to [https://chainlist.org/](https://chainlist.org/)
2. Search "Arbitrum Sepolia"
3. Connect wallet and click "Add to MetaMask"

**Time:** 3 minutes

---

## Step 3: Get Testnet ETH

**Why:** You need testnet ETH to deploy contracts and pay gas fees.

### Arbitrum Sepolia Faucets

**Option 1: Alchemy Faucet (Recommended)**
1. Go to [https://www.alchemy.com/faucets/arbitrum-sepolia](https://www.alchemy.com/faucets/arbitrum-sepolia)
2. Sign in with Alchemy account (free)
3. Paste your MetaMask address
4. Receive 0.1 testnet ETH

**Option 2: QuickNode Faucet**
1. Go to [https://faucet.quicknode.com/arbitrum/sepolia](https://faucet.quicknode.com/arbitrum/sepolia)
2. Connect wallet or paste address
3. Complete CAPTCHA
4. Receive testnet ETH

**Option 3: Chainlink Faucet**
1. Go to [https://faucets.chain.link/arbitrum-sepolia](https://faucets.chain.link/arbitrum-sepolia)
2. Connect wallet
3. Request testnet ETH

**How much do you need?**
- Contract deployment: ~0.01 ETH
- Testing transactions: ~0.005 ETH each
- **Recommended:** Get 0.1 ETH to be safe

**Time:** 5 minutes
**Cost:** Free

---

## Step 4: Get Arbiscan API Key

**Why:** Required to verify your contract on the block explorer (makes it trusted and readable).

1. Go to [https://arbiscan.io/](https://arbiscan.io/)
2. Click "Sign In" (top right)
3. Create account if needed
4. Go to "API-KEYs" section in your profile
5. Click "Add" to create new API key
6. Name it "Panda Pay"
7. Copy the API key
8. Save it for contracts `.env` file

**Time:** 5 minutes
**Cost:** Free

---

## Step 5: Configure Smart Contracts Environment

**Why:** Contracts need your private key to deploy and API keys to verify.

1. Navigate to contracts directory:
   ```bash
   cd /Users/prachitbhike/Code/panda/panda-pay/contracts
   ```

2. Create `.env` file:
   ```bash
   cp .env.example .env
   ```

3. Edit `.env` and add:
   ```env
   # Your MetaMask private key (keep this SECRET!)
   PRIVATE_KEY=your_metamask_private_key_here

   # Arbiscan API key for verification
   ARBISCAN_API_KEY=your_arbiscan_api_key_here

   # Optional: Gas reporting
   REPORT_GAS=true
   ```

4. **Get your private key from MetaMask:**
   - Open MetaMask
   - Click three dots → Account details
   - Click "Show private key"
   - Enter password
   - Copy private key
   - ⚠️ **NEVER commit this to Git or share it!**

**Time:** 3 minutes

---

## Step 6: Deploy Contract to Testnet

**Why:** Deploy your smart contract so the frontend can interact with it.

1. Make sure you're in contracts directory:
   ```bash
   cd /Users/prachitbhike/Code/panda/panda-pay/contracts
   ```

2. Compile contracts (verify everything works):
   ```bash
   npm run compile
   ```

3. Run tests (should see 32 passing):
   ```bash
   npm test
   ```

4. Deploy to Arbitrum Sepolia:
   ```bash
   npm run deploy:arbitrum-sepolia
   ```

5. **Save the contract address!** You'll see output like:
   ```
   ✅ PaymentEscrow deployed to: 0x1234567890abcdef...
   ```

6. Copy this address - you'll need it for the frontend!

**Time:** 10 minutes
**Cost:** ~0.01 testnet ETH

---

## Step 7: Verify Contract on Block Explorer

**Why:** Makes your contract source code publicly visible and trusted.

After deployment, run:
```bash
npx hardhat verify --network arbitrumSepolia <YOUR_CONTRACT_ADDRESS>
```

Replace `<YOUR_CONTRACT_ADDRESS>` with the address from Step 6.

**Success looks like:**
```
Successfully verified contract PaymentEscrow on Arbiscan.
https://sepolia.arbiscan.io/address/0x...#code
```

**Time:** 3 minutes

---

## Step 8: Configure Frontend Environment

**Why:** Frontend needs to know your contract address and WalletConnect ID.

1. Navigate to frontend directory:
   ```bash
   cd /Users/prachitbhike/Code/panda/panda-pay/frontend
   ```

2. Create `.env` file:
   ```bash
   cp .env.example .env
   ```

3. Edit `.env` and add your WalletConnect Project ID from Step 1:
   ```env
   VITE_WALLET_CONNECT_PROJECT_ID=your_walletconnect_project_id
   ```

**Time:** 2 minutes

---

## Step 9: Update Contract Address in Frontend

**Why:** Tell the frontend where your deployed contract lives.

1. Open `src/lib/constants.ts`

2. Update the contract address for Arbitrum Sepolia:
   ```typescript
   export const PAYMENT_ESCROW_ADDRESSES: Record<number, `0x${string}`> = {
     421614: '0xYOUR_CONTRACT_ADDRESS_HERE', // Arbitrum Sepolia
     11155420: '0x0000000000000000000000000000000000000000', // Optimism Sepolia
     42161: '0x0000000000000000000000000000000000000000', // Arbitrum
     10: '0x0000000000000000000000000000000000000000', // Optimism
   };
   ```

3. Replace `0xYOUR_CONTRACT_ADDRESS_HERE` with your contract address from Step 6

**Time:** 2 minutes

---

## Step 10: Test Frontend Locally

**Why:** Make sure everything works before deploying.

1. Start development server:
   ```bash
   npm run dev
   ```

2. Open [http://localhost:5173](http://localhost:5173)

3. Test the following:
   - [ ] Wallet connects successfully
   - [ ] Network switches to Arbitrum Sepolia
   - [ ] Create Payment form appears
   - [ ] Can create a test payment
   - [ ] Payment appears in "Sent" tab
   - [ ] Can switch to another account and claim it

**Time:** 15 minutes

---

## Step 11: Create Vercel Account

**Why:** Vercel provides free hosting for React apps with automatic deployments.

1. Go to [https://vercel.com/](https://vercel.com/)
2. Click "Sign Up"
3. Choose "Hobby" (Free) plan
4. Sign up with GitHub, GitLab, or email
5. Verify your email

**Time:** 3 minutes
**Cost:** Free

---

## Step 12: Deploy Frontend to Vercel

**Why:** Make your app publicly accessible on the internet.

### Option A: Deploy via Vercel Dashboard (Easiest)

1. Go to [https://vercel.com/new](https://vercel.com/new)

2. Import your project:
   - If on GitHub: Connect GitHub and select repository
   - If local only: Use Vercel CLI (see Option B)

3. Configure project:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

4. Add environment variables:
   - Click "Environment Variables"
   - Add: `VITE_WALLET_CONNECT_PROJECT_ID`
   - Value: Your WalletConnect Project ID
   - Click "Add"

5. Click "Deploy"

6. Wait 2-3 minutes for deployment

7. You'll get a URL like: `https://panda-pay.vercel.app`

### Option B: Deploy via CLI

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Navigate to frontend:
   ```bash
   cd /Users/prachitbhike/Code/panda/panda-pay/frontend
   ```

3. Run deployment:
   ```bash
   vercel
   ```

4. Follow prompts:
   - Login to Vercel
   - Set up new project: Yes
   - Link to existing project: No
   - Project name: panda-pay
   - Directory: ./
   - Build settings: Auto-detected

5. Add environment variable:
   ```bash
   vercel env add VITE_WALLET_CONNECT_PROJECT_ID
   ```
   - Paste your WalletConnect Project ID
   - Select all environments

6. Redeploy:
   ```bash
   vercel --prod
   ```

**Time:** 10 minutes
**Cost:** Free

---

## Step 13: Test Production Deployment

**Why:** Ensure your live app works correctly.

1. Open your Vercel URL (e.g., `https://panda-pay.vercel.app`)

2. Complete full test flow:
   - [ ] Connect MetaMask wallet
   - [ ] Switch to Arbitrum Sepolia
   - [ ] Create a payment (send to another address you control)
   - [ ] Switch to recipient account
   - [ ] Claim the payment
   - [ ] Verify tokens received
   - [ ] (Optional) Test cancellation after 7 days

3. Check mobile responsiveness:
   - [ ] Open on phone
   - [ ] Test wallet connection
   - [ ] Create payment works
   - [ ] UI looks good

**Time:** 20 minutes

---

## Step 14: Optional - Custom Domain

**Why:** Use your own domain instead of `.vercel.app`

1. In Vercel Dashboard, go to your project
2. Click "Settings" → "Domains"
3. Add your domain (e.g., `pandapay.io`)
4. Follow DNS configuration instructions
5. Wait for DNS propagation (5-30 minutes)

**Time:** 30 minutes
**Cost:** Domain registration fee (~$10-15/year)

---

## Step 15: Optional - Push to GitHub

**Why:** Version control, backups, and easy updates.

1. Create new repository on GitHub:
   - Go to [https://github.com/new](https://github.com/new)
   - Name: "panda-pay"
   - Visibility: Public or Private
   - Don't initialize with README

2. Create `.gitignore` in root:
   ```bash
   cd /Users/prachitbhike/Code/panda/panda-pay
   ```

3. Create `.gitignore` file:
   ```gitignore
   # Dependencies
   node_modules/

   # Environment files (NEVER COMMIT THESE!)
   .env
   .env.local
   .env*.local

   # Build outputs
   dist/
   build/

   # Cache
   .cache/
   cache/
   artifacts/
   typechain-types/

   # IDE
   .vscode/
   .idea/
   *.swp

   # OS
   .DS_Store

   # Hardhat
   coverage/
   coverage.json
   ```

4. Initialize and push:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Panda Pay P2P payment app"
   git branch -M main
   git remote add origin https://github.com/yourusername/panda-pay.git
   git push -u origin main
   ```

5. Connect Vercel to GitHub (for auto-deploys):
   - Go to Vercel project settings
   - Connect Git repository
   - Enable automatic deployments

**Time:** 10 minutes

---

## 🎉 You're Done!

Your Panda Pay app is now live! Here's what you've accomplished:

✅ Smart contract deployed to Arbitrum Sepolia
✅ Contract verified on block explorer
✅ Frontend deployed to Vercel
✅ Fully functional P2P payment system

### Your Live URLs:
- **Frontend:** https://your-project.vercel.app
- **Contract:** https://sepolia.arbiscan.io/address/YOUR_CONTRACT_ADDRESS

---

## 🔧 Troubleshooting

### "Transaction Failed" Error
- Check you have enough testnet ETH for gas
- Verify contract address is correct in `constants.ts`
- Check you're on Arbitrum Sepolia network

### "Cannot connect wallet"
- Verify WalletConnect Project ID in `.env`
- Try different wallet (MetaMask, Rainbow, etc.)
- Clear browser cache

### Vercel Build Failed
- Check all environment variables are set
- Verify `package.json` scripts are correct
- Check build logs in Vercel dashboard

### Contract Not Found
- Verify contract address in `constants.ts`
- Ensure you're on correct network (Arbitrum Sepolia)
- Check contract was deployed successfully

---

## 📚 Next Steps

1. **Deploy to Mainnet** (when ready):
   - Get real ETH on Arbitrum
   - Deploy with `npm run deploy:arbitrum`
   - Update contract address for mainnet
   - **Get security audit first!**

2. **Enhance Features**:
   - Add email notifications
   - Implement payment requests
   - Add multi-signature support

3. **Marketing**:
   - Share on Twitter/X
   - Post on Reddit r/ethdev
   - Demo on Product Hunt

---

## 💰 Cost Summary

- **Development:** Free
- **Testnet Deployment:** Free (testnet ETH)
- **Frontend Hosting (Vercel):** Free
- **WalletConnect:** Free
- **Domain (Optional):** ~$10-15/year

**Mainnet Deployment (Future):**
- Contract deployment: ~$20-50 (depending on gas)
- Security audit: $5,000-50,000 (highly recommended)

---

## 🆘 Need Help?

- Check contract tests: `cd contracts && npm test`
- View Hardhat docs: [https://hardhat.org/docs](https://hardhat.org/docs)
- View wagmi docs: [https://wagmi.sh](https://wagmi.sh)
- View Vercel docs: [https://vercel.com/docs](https://vercel.com/docs)

Good luck! 🐼
