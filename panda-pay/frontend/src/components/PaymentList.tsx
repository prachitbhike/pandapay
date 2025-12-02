import { useState } from 'react';
import { useAccount, useReadContract, useChainId } from 'wagmi';
import { PAYMENT_ESCROW_ABI } from '../lib/abi';
import { PAYMENT_ESCROW_ADDRESSES } from '../lib/constants';
import { PaymentCard } from './PaymentCard';

export function PaymentList() {
  const { address } = useAccount();
  const chainId = useChainId();
  const [activeTab, setActiveTab] = useState<'sent' | 'received'>('received');
  const contractAddress = PAYMENT_ESCROW_ADDRESSES[chainId];

  const { data: sentPaymentIds } = useReadContract({
    address: contractAddress,
    abi: PAYMENT_ESCROW_ABI,
    functionName: 'getSentPayments',
    args: address ? [address] : undefined,
  });

  const { data: receivedPaymentIds } = useReadContract({
    address: contractAddress,
    abi: PAYMENT_ESCROW_ABI,
    functionName: 'getReceivedPayments',
    args: address ? [address] : undefined,
  });

  const paymentIds = activeTab === 'sent' ? sentPaymentIds : receivedPaymentIds;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex space-x-4 mb-6 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('received')}
          className={`pb-3 px-4 font-semibold transition-colors ${
            activeTab === 'received'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          Received ({receivedPaymentIds?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('sent')}
          className={`pb-3 px-4 font-semibold transition-colors ${
            activeTab === 'sent'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          Sent ({sentPaymentIds?.length || 0})
        </button>
      </div>

      <div className="space-y-4">
        {!paymentIds || paymentIds.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-3">📭</div>
            <p className="text-gray-600 dark:text-gray-400">
              No {activeTab} payments yet
            </p>
          </div>
        ) : (
          paymentIds.map((paymentId) => (
            <PaymentCard
              key={paymentId.toString()}
              paymentId={paymentId}
              isSender={activeTab === 'sent'}
            />
          ))
        )}
      </div>
    </div>
  );
}
