import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi';
import { formatEther, formatUnits } from 'viem';
import { PAYMENT_ESCROW_ABI } from '../lib/abi';
import { PAYMENT_ESCROW_ADDRESSES, ETH_ADDRESS, ESCROW_PERIOD } from '../lib/constants';

interface PaymentCardProps {
  paymentId: bigint;
  isSender: boolean;
}

export function PaymentCard({ paymentId, isSender }: PaymentCardProps) {
  const chainId = useChainId();
  const contractAddress = PAYMENT_ESCROW_ADDRESSES[chainId];

  const { data: payment } = useReadContract({
    address: contractAddress,
    abi: PAYMENT_ESCROW_ABI,
    functionName: 'getPayment',
    args: [paymentId],
  });

  const { data: canCancel } = useReadContract({
    address: contractAddress,
    abi: PAYMENT_ESCROW_ABI,
    functionName: 'canCancelPayment',
    args: [paymentId],
  });

  const { writeContract: claimPayment, data: claimHash, isPending: isClaimPending } = useWriteContract();
  const { writeContract: cancelPayment, data: cancelHash, isPending: isCancelPending } = useWriteContract();

  const { isLoading: isClaimConfirming } = useWaitForTransactionReceipt({ hash: claimHash });
  const { isLoading: isCancelConfirming } = useWaitForTransactionReceipt({ hash: cancelHash });

  if (!payment) return null;

  const isETH = payment.token === ETH_ADDRESS;
  const formattedAmount = isETH
    ? formatEther(payment.amount)
    : formatUnits(payment.amount, 6);

  const createdDate = new Date(Number(payment.createdAt) * 1000);
  const expiryDate = new Date((Number(payment.createdAt) + ESCROW_PERIOD) * 1000);
  const now = new Date();
  const isExpired = now > expiryDate;

  const handleClaim = () => {
    claimPayment({
      address: contractAddress,
      abi: PAYMENT_ESCROW_ABI,
      functionName: 'claimPayment',
      args: [paymentId],
    });
  };

  const handleCancel = () => {
    cancelPayment({
      address: contractAddress,
      abi: PAYMENT_ESCROW_ABI,
      functionName: 'cancelPayment',
      args: [paymentId],
    });
  };

  const getStatusBadge = () => {
    if (payment.claimed) {
      return <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm font-medium">Claimed</span>;
    }
    if (payment.cancelled) {
      return <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-full text-sm font-medium">Cancelled</span>;
    }
    if (isExpired) {
      return <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-full text-sm font-medium">Expired</span>;
    }
    return <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm font-medium">Pending</span>;
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {formattedAmount} {isETH ? 'ETH' : 'USDC'}
            </span>
            {getStatusBadge()}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {isSender ? 'To' : 'From'}: {isSender ? payment.recipient : payment.sender}
          </p>
        </div>
      </div>

      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1 mb-3">
        <p>Created: {createdDate.toLocaleString()}</p>
        {!payment.claimed && !payment.cancelled && (
          <p>Expires: {expiryDate.toLocaleString()}</p>
        )}
      </div>

      {!payment.claimed && !payment.cancelled && (
        <div className="flex gap-2">
          {!isSender && (
            <button
              onClick={handleClaim}
              disabled={isClaimPending || isClaimConfirming}
              className="flex-1 py-2 px-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors text-sm"
            >
              {isClaimPending || isClaimConfirming ? 'Claiming...' : 'Claim Payment'}
            </button>
          )}
          {isSender && canCancel && (
            <button
              onClick={handleCancel}
              disabled={isCancelPending || isCancelConfirming}
              className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors text-sm"
            >
              {isCancelPending || isCancelConfirming ? 'Cancelling...' : 'Cancel Payment'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
