// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PaymentEscrow
 * @notice A secure escrow contract for P2P payments with ETH and ERC20 tokens
 * @dev Implements pull payment pattern with time-locked escrow
 *
 * Security Features:
 * - ReentrancyGuard on all state-changing functions
 * - Pull payment pattern (recipient withdraws)
 * - 7-day claim window with sender cancellation after expiry
 * - Pausable for emergencies
 * - SafeERC20 for token interactions
 *
 * Supported Tokens: ETH, USDC, USDT, and any ERC20
 */
contract PaymentEscrow is ReentrancyGuard, Pausable, Ownable {
    using SafeERC20 for IERC20;

    // Constants
    uint256 public constant ESCROW_PERIOD = 7 days;
    address public constant ETH_ADDRESS = address(0);

    // State variables
    uint256 private _paymentIdCounter;

    struct Payment {
        uint256 id;
        address sender;
        address recipient;
        address token; // ETH_ADDRESS for native ETH
        uint256 amount;
        uint256 createdAt;
        bool claimed;
        bool cancelled;
    }

    // Mappings
    mapping(uint256 => Payment) public payments;
    mapping(address => uint256[]) public sentPayments;
    mapping(address => uint256[]) public receivedPayments;

    // Events
    event PaymentCreated(
        uint256 indexed paymentId,
        address indexed sender,
        address indexed recipient,
        address token,
        uint256 amount,
        uint256 timestamp
    );

    event PaymentClaimed(
        uint256 indexed paymentId,
        address indexed recipient,
        uint256 timestamp
    );

    event PaymentCancelled(
        uint256 indexed paymentId,
        address indexed sender,
        uint256 timestamp
    );

    // Errors
    error InvalidRecipient();
    error InvalidAmount();
    error PaymentNotFound();
    error Unauthorized();
    error PaymentAlreadyClaimed();
    error PaymentAlreadyCancelled();
    error EscrowPeriodActive();
    error InsufficientValue();
    error TransferFailed();

    constructor() Ownable(msg.sender) {}

    /**
     * @notice Create a new payment in escrow
     * @param recipient Address that can claim the payment
     * @param token Token address (use ETH_ADDRESS for native ETH)
     * @param amount Amount to escrow (must send exact amount for ETH)
     */
    function createPayment(
        address recipient,
        address token,
        uint256 amount
    ) external payable nonReentrant whenNotPaused returns (uint256) {
        if (recipient == address(0) || recipient == msg.sender) {
            revert InvalidRecipient();
        }
        if (amount == 0) {
            revert InvalidAmount();
        }

        uint256 paymentId = _paymentIdCounter++;

        // Handle ETH vs ERC20
        if (token == ETH_ADDRESS) {
            if (msg.value != amount) {
                revert InsufficientValue();
            }
        } else {
            if (msg.value != 0) {
                revert InsufficientValue();
            }
            // Transfer tokens to contract
            IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        }

        // Create payment record
        payments[paymentId] = Payment({
            id: paymentId,
            sender: msg.sender,
            recipient: recipient,
            token: token,
            amount: amount,
            createdAt: block.timestamp,
            claimed: false,
            cancelled: false
        });

        // Track payment IDs
        sentPayments[msg.sender].push(paymentId);
        receivedPayments[recipient].push(paymentId);

        emit PaymentCreated(
            paymentId,
            msg.sender,
            recipient,
            token,
            amount,
            block.timestamp
        );

        return paymentId;
    }

    /**
     * @notice Claim a payment (recipient only)
     * @param paymentId ID of the payment to claim
     */
    function claimPayment(uint256 paymentId) external nonReentrant whenNotPaused {
        Payment storage payment = payments[paymentId];

        if (payment.sender == address(0)) {
            revert PaymentNotFound();
        }
        if (msg.sender != payment.recipient) {
            revert Unauthorized();
        }
        if (payment.claimed) {
            revert PaymentAlreadyClaimed();
        }
        if (payment.cancelled) {
            revert PaymentAlreadyCancelled();
        }

        payment.claimed = true;

        // Transfer funds to recipient
        if (payment.token == ETH_ADDRESS) {
            (bool success, ) = payment.recipient.call{value: payment.amount}("");
            if (!success) {
                revert TransferFailed();
            }
        } else {
            IERC20(payment.token).safeTransfer(payment.recipient, payment.amount);
        }

        emit PaymentClaimed(paymentId, payment.recipient, block.timestamp);
    }

    /**
     * @notice Cancel a payment and refund sender (only after escrow period)
     * @param paymentId ID of the payment to cancel
     */
    function cancelPayment(uint256 paymentId) external nonReentrant whenNotPaused {
        Payment storage payment = payments[paymentId];

        if (payment.sender == address(0)) {
            revert PaymentNotFound();
        }
        if (msg.sender != payment.sender) {
            revert Unauthorized();
        }
        if (payment.claimed) {
            revert PaymentAlreadyClaimed();
        }
        if (payment.cancelled) {
            revert PaymentAlreadyCancelled();
        }
        if (block.timestamp < payment.createdAt + ESCROW_PERIOD) {
            revert EscrowPeriodActive();
        }

        payment.cancelled = true;

        // Refund sender
        if (payment.token == ETH_ADDRESS) {
            (bool success, ) = payment.sender.call{value: payment.amount}("");
            if (!success) {
                revert TransferFailed();
            }
        } else {
            IERC20(payment.token).safeTransfer(payment.sender, payment.amount);
        }

        emit PaymentCancelled(paymentId, payment.sender, block.timestamp);
    }

    /**
     * @notice Get payment details
     * @param paymentId ID of the payment
     */
    function getPayment(uint256 paymentId) external view returns (Payment memory) {
        return payments[paymentId];
    }

    /**
     * @notice Get all payment IDs sent by an address
     * @param sender Address of the sender
     */
    function getSentPayments(address sender) external view returns (uint256[] memory) {
        return sentPayments[sender];
    }

    /**
     * @notice Get all payment IDs received by an address
     * @param recipient Address of the recipient
     */
    function getReceivedPayments(address recipient) external view returns (uint256[] memory) {
        return receivedPayments[recipient];
    }

    /**
     * @notice Get total number of payments created
     */
    function getTotalPayments() external view returns (uint256) {
        return _paymentIdCounter;
    }

    /**
     * @notice Check if a payment can be cancelled
     * @param paymentId ID of the payment
     */
    function canCancelPayment(uint256 paymentId) external view returns (bool) {
        Payment memory payment = payments[paymentId];

        if (payment.sender == address(0) || payment.claimed || payment.cancelled) {
            return false;
        }

        return block.timestamp >= payment.createdAt + ESCROW_PERIOD;
    }

    /**
     * @notice Emergency pause (owner only)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause contract (owner only)
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @notice Prevent accidental ETH sends
     */
    receive() external payable {
        revert("Use createPayment function");
    }
}
