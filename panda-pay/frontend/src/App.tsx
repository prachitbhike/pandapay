import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { CreatePayment } from './components/CreatePayment';
import { PaymentList } from './components/PaymentList';

function App() {
  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">🐼</div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Panda Pay</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Secure P2P Crypto Payments</p>
            </div>
          </div>
          <ConnectButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {!isConnected ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔐</div>
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Welcome to Panda Pay</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              Connect your wallet to send and receive secure payments on Arbitrum and Optimism L2 networks.
            </p>
            <div className="flex justify-center">
              <ConnectButton />
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <div className="text-3xl mb-3">🔒</div>
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Secure Escrow</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Funds held safely for 7 days with option to cancel
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <div className="text-3xl mb-3">⚡</div>
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Low Fees</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  L2 optimized for minimal transaction costs
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <div className="text-3xl mb-3">💰</div>
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Multi-Asset</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Support for ETH and USDC stablecoin
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Create Payment Form */}
            <CreatePayment />

            {/* Payment Lists */}
            <PaymentList />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700 mt-16 py-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>Built with ❤️ using Hardhat, React, wagmi, and RainbowKit</p>
          <p className="mt-2">Deployed on Arbitrum & Optimism L2 Networks</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
