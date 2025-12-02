import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi';
import { parseEther, parseUnits, isAddress } from 'viem';
import { PAYMENT_ESCROW_ABI, ERC20_ABI } from '../lib/abi';
import { PAYMENT_ESCROW_ADDRESSES, ETH_ADDRESS, getSupportedTokens } from '../lib/constants';

export function CreatePayment() {
  const { address } = useAccount();
  const chainId = useChainId();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState(ETH_ADDRESS);

  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const supportedTokens = getSupportedTokens(chainId);
  const contractAddress = PAYMENT_ESCROW_ADDRESSES[chainId];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAddress(recipient)) {
      alert('Invalid recipient address');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      alert('Invalid amount');
      return;
    }

    try {
      const token = supportedTokens.find((t) => t.address === selectedToken);
      if (!token) return;

      const parsedAmount =
        token.symbol === 'ETH' ? parseEther(amount) : parseUnits(amount, token.decimals);

      writeContract({
        address: contractAddress,
        abi: PAYMENT_ESCROW_ABI,
        functionName: 'createPayment',
        args: [recipient as `0x${string}`, selectedToken as `0x${string}`, parsedAmount],
        value: token.symbol === 'ETH' ? parsedAmount : BigInt(0),
      });
    } catch (err) {
      console.error('Error creating payment:', err);
    }
  };

  if (isSuccess) {
    setTimeout(() => {
      setRecipient('');
      setAmount('');
      setSelectedToken(ETH_ADDRESS);
    }, 2000);
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Send Payment</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Recipient Address
          </label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="0x..."
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Token</label>
          <select
            value={selectedToken}
            onChange={(e) => setSelectedToken(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {supportedTokens.map((token) => (
              <option key={token.address} value={token.address}>
                {token.symbol}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            step="any"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            required
          />
        </div>

        {error && (
          <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-red-800 dark:text-red-300 text-sm">
            Error: {error.message}
          </div>
        )}

        {isSuccess && (
          <div className="p-3 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg text-green-800 dark:text-green-300 text-sm">
            Payment created successfully!
          </div>
        )}

        <button
          type="submit"
          disabled={isPending || isConfirming}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
        >
          {isPending || isConfirming ? 'Creating Payment...' : 'Create Payment'}
        </button>
      </form>
    </div>
  );
}
