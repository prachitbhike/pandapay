import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { arbitrum, arbitrumSepolia, optimism, optimismSepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Panda Pay',
  projectId: import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: [arbitrumSepolia, optimismSepolia, arbitrum, optimism],
  ssr: false,
});
