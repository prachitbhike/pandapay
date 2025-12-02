# ✅ Panda Pay - Deployment Checklist

Quick reference checklist for deploying your app. Check off each item as you complete it.

## 🎯 Pre-Deployment

- [ ] All tests passing (`npm test` in contracts/)
- [ ] Frontend builds successfully (`npm run build` in frontend/)
- [ ] Code reviewed for security issues
- [ ] `.env` files created (NOT committed to Git)

## 🔑 API Keys & Credentials

- [ ] WalletConnect Project ID obtained from cloud.walletconnect.com
- [ ] Arbiscan API key obtained from arbiscan.io
- [ ] MetaMask wallet set up
- [ ] Testnet ETH obtained (0.1+ ETH recommended)

## 📱 Network Configuration

- [ ] Arbitrum Sepolia added to MetaMask (Chain ID: 421614)
- [ ] Verified testnet ETH balance in wallet
- [ ] Confirmed RPC endpoint working

## 🔒 Smart Contracts

- [ ] `.env` configured in contracts/ folder
- [ ] Private key added to `.env` (KEEP SECRET!)
- [ ] Contract compiled successfully
- [ ] All 32 tests passing
- [ ] Deployed to Arbitrum Sepolia testnet
- [ ] Contract address saved
- [ ] Contract verified on Arbiscan
- [ ] Verified contract appears on block explorer

## 🎨 Frontend Configuration

- [ ] `.env` configured in frontend/ folder
- [ ] WalletConnect Project ID added to frontend `.env`
- [ ] Contract address updated in `src/lib/constants.ts`
- [ ] Tested locally with `npm run dev`
- [ ] Wallet connects successfully
- [ ] Can create test payment
- [ ] Can claim test payment
- [ ] No console errors

## 🚀 Hosting (Vercel)

- [ ] Vercel account created
- [ ] Project imported to Vercel
- [ ] Environment variables added in Vercel:
  - [ ] `VITE_WALLET_CONNECT_PROJECT_ID`
- [ ] Build settings configured:
  - [ ] Framework: Vite
  - [ ] Root Directory: frontend
  - [ ] Build Command: npm run build
  - [ ] Output Directory: dist
- [ ] First deployment successful
- [ ] Production URL accessible

## 🧪 Production Testing

- [ ] Website loads correctly
- [ ] Wallet connection works
- [ ] Network switching works
- [ ] Create payment transaction succeeds
- [ ] Payment appears in sent list
- [ ] Claim payment transaction succeeds
- [ ] Payment status updates correctly
- [ ] Mobile responsive design works
- [ ] Dark mode works (if applicable)

## 📝 Optional Enhancements

- [ ] Custom domain configured
- [ ] GitHub repository created
- [ ] Code pushed to GitHub
- [ ] README updated with live URLs
- [ ] Automatic deployments enabled (GitHub + Vercel)
- [ ] Analytics added (Google Analytics, etc.)
- [ ] Error tracking added (Sentry, etc.)

## 🔐 Security Checklist

- [ ] Private keys never committed to Git
- [ ] `.env` files in `.gitignore`
- [ ] Contract ownership verified
- [ ] No hardcoded secrets in code
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] Dependencies up to date
- [ ] No known vulnerabilities (`npm audit`)

## 📊 Monitoring

- [ ] Contract address bookmarked on Arbiscan
- [ ] Vercel deployment logs accessible
- [ ] Wallet with deployment keys secured
- [ ] Contract events monitored
- [ ] Frontend error monitoring set up (optional)

## 🎉 Launch

- [ ] All above items completed
- [ ] Tested by at least 2 different users
- [ ] Documentation complete
- [ ] Ready to share!

---

## 📱 Quick Commands Reference

### Contracts
```bash
cd /Users/prachitbhike/Code/panda/panda-pay/contracts
npm test                              # Run tests
npm run compile                       # Compile contracts
npm run deploy:arbitrum-sepolia       # Deploy to testnet
npx hardhat verify --network arbitrumSepolia <ADDRESS>
```

### Frontend
```bash
cd /Users/prachitbhike/Code/panda/panda-pay/frontend
npm run dev                           # Local development
npm run build                         # Production build
npm run preview                       # Preview production build
vercel                                # Deploy to Vercel
```

---

## 🆘 Common Issues

| Issue | Solution |
|-------|----------|
| Tests failing | Run `npm install` in contracts/ |
| Build errors | Check Node.js version (need 18+) |
| Deployment fails | Verify `.env` has correct private key |
| Wallet won't connect | Check WalletConnect Project ID |
| Transactions fail | Ensure enough testnet ETH |
| Contract not found | Verify address in constants.ts |

---

## 📞 Support Resources

- **Hardhat Docs:** https://hardhat.org/docs
- **wagmi Docs:** https://wagmi.sh
- **Viem Docs:** https://viem.sh
- **RainbowKit Docs:** https://rainbowkit.com
- **Vercel Docs:** https://vercel.com/docs
- **Arbitrum Docs:** https://docs.arbitrum.io

---

**Estimated Total Time:** 2-3 hours
**Total Cost:** $0 (testnets and free hosting)

Good luck! 🐼
