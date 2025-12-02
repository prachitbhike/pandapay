import { expect } from "chai";
import { ethers } from "hardhat";
import { PaymentEscrow, MockUSDC } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("PaymentEscrow", function () {
  let escrow: PaymentEscrow;
  let usdc: MockUSDC;
  let owner: SignerWithAddress;
  let sender: SignerWithAddress;
  let recipient: SignerWithAddress;
  let other: SignerWithAddress;

  const ETH_ADDRESS = "0x0000000000000000000000000000000000000000";
  const ESCROW_PERIOD = 7 * 24 * 60 * 60; // 7 days in seconds

  beforeEach(async function () {
    [owner, sender, recipient, other] = await ethers.getSigners();

    // Deploy mock USDC
    const MockUSDCFactory = await ethers.getContractFactory("MockUSDC");
    usdc = await MockUSDCFactory.deploy();

    // Deploy PaymentEscrow
    const PaymentEscrowFactory = await ethers.getContractFactory("PaymentEscrow");
    escrow = await PaymentEscrowFactory.deploy();

    // Fund sender with USDC
    await usdc.mint(sender.address, ethers.parseUnits("10000", 6));
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await escrow.owner()).to.equal(owner.address);
    });

    it("Should have zero payments initially", async function () {
      expect(await escrow.getTotalPayments()).to.equal(0);
    });

    it("Should not be paused initially", async function () {
      expect(await escrow.paused()).to.equal(false);
    });
  });

  describe("ETH Payments", function () {
    const paymentAmount = ethers.parseEther("1.0");

    it("Should create ETH payment successfully", async function () {
      const tx = await escrow.connect(sender).createPayment(recipient.address, ETH_ADDRESS, paymentAmount, {
        value: paymentAmount,
      });

      await expect(tx)
        .to.emit(escrow, "PaymentCreated")
        .withArgs(0, sender.address, recipient.address, ETH_ADDRESS, paymentAmount, await time.latest());

      const payment = await escrow.getPayment(0);
      expect(payment.sender).to.equal(sender.address);
      expect(payment.recipient).to.equal(recipient.address);
      expect(payment.token).to.equal(ETH_ADDRESS);
      expect(payment.amount).to.equal(paymentAmount);
      expect(payment.claimed).to.equal(false);
      expect(payment.cancelled).to.equal(false);
    });

    it("Should track sent and received payments", async function () {
      await escrow.connect(sender).createPayment(recipient.address, ETH_ADDRESS, paymentAmount, {
        value: paymentAmount,
      });

      const sentPayments = await escrow.getSentPayments(sender.address);
      const receivedPayments = await escrow.getReceivedPayments(recipient.address);

      expect(sentPayments).to.deep.equal([0n]);
      expect(receivedPayments).to.deep.equal([0n]);
    });

    it("Should revert if recipient is zero address", async function () {
      await expect(
        escrow.connect(sender).createPayment(ethers.ZeroAddress, ETH_ADDRESS, paymentAmount, {
          value: paymentAmount,
        })
      ).to.be.revertedWithCustomError(escrow, "InvalidRecipient");
    });

    it("Should revert if recipient is sender", async function () {
      await expect(
        escrow.connect(sender).createPayment(sender.address, ETH_ADDRESS, paymentAmount, {
          value: paymentAmount,
        })
      ).to.be.revertedWithCustomError(escrow, "InvalidRecipient");
    });

    it("Should revert if amount is zero", async function () {
      await expect(
        escrow.connect(sender).createPayment(recipient.address, ETH_ADDRESS, 0, {
          value: 0,
        })
      ).to.be.revertedWithCustomError(escrow, "InvalidAmount");
    });

    it("Should revert if sent value doesn't match amount", async function () {
      await expect(
        escrow.connect(sender).createPayment(recipient.address, ETH_ADDRESS, paymentAmount, {
          value: ethers.parseEther("0.5"),
        })
      ).to.be.revertedWithCustomError(escrow, "InsufficientValue");
    });

    it("Should allow recipient to claim payment", async function () {
      await escrow.connect(sender).createPayment(recipient.address, ETH_ADDRESS, paymentAmount, {
        value: paymentAmount,
      });

      const balanceBefore = await ethers.provider.getBalance(recipient.address);

      const claimTx = await escrow.connect(recipient).claimPayment(0);

      await expect(claimTx)
        .to.emit(escrow, "PaymentClaimed")
        .withArgs(0, recipient.address, await time.latest());

      const balanceAfter = await ethers.provider.getBalance(recipient.address);
      const payment = await escrow.getPayment(0);

      expect(payment.claimed).to.equal(true);
      expect(balanceAfter - balanceBefore).to.be.closeTo(paymentAmount, ethers.parseEther("0.01")); // Account for gas
    });

    it("Should revert if non-recipient tries to claim", async function () {
      await escrow.connect(sender).createPayment(recipient.address, ETH_ADDRESS, paymentAmount, {
        value: paymentAmount,
      });

      await expect(escrow.connect(other).claimPayment(0)).to.be.revertedWithCustomError(escrow, "Unauthorized");
    });

    it("Should revert if payment already claimed", async function () {
      await escrow.connect(sender).createPayment(recipient.address, ETH_ADDRESS, paymentAmount, {
        value: paymentAmount,
      });

      await escrow.connect(recipient).claimPayment(0);

      await expect(escrow.connect(recipient).claimPayment(0)).to.be.revertedWithCustomError(
        escrow,
        "PaymentAlreadyClaimed"
      );
    });

    it("Should allow sender to cancel after escrow period", async function () {
      await escrow.connect(sender).createPayment(recipient.address, ETH_ADDRESS, paymentAmount, {
        value: paymentAmount,
      });

      // Fast forward past escrow period
      await time.increase(ESCROW_PERIOD + 1);

      const balanceBefore = await ethers.provider.getBalance(sender.address);

      const cancelTx = await escrow.connect(sender).cancelPayment(0);

      await expect(cancelTx)
        .to.emit(escrow, "PaymentCancelled")
        .withArgs(0, sender.address, await time.latest());

      const balanceAfter = await ethers.provider.getBalance(sender.address);
      const payment = await escrow.getPayment(0);

      expect(payment.cancelled).to.equal(true);
      expect(balanceAfter - balanceBefore).to.be.closeTo(paymentAmount, ethers.parseEther("0.01")); // Account for gas
    });

    it("Should revert if trying to cancel before escrow period ends", async function () {
      await escrow.connect(sender).createPayment(recipient.address, ETH_ADDRESS, paymentAmount, {
        value: paymentAmount,
      });

      await expect(escrow.connect(sender).cancelPayment(0)).to.be.revertedWithCustomError(
        escrow,
        "EscrowPeriodActive"
      );
    });

    it("Should revert if non-sender tries to cancel", async function () {
      await escrow.connect(sender).createPayment(recipient.address, ETH_ADDRESS, paymentAmount, {
        value: paymentAmount,
      });

      await time.increase(ESCROW_PERIOD + 1);

      await expect(escrow.connect(other).cancelPayment(0)).to.be.revertedWithCustomError(escrow, "Unauthorized");
    });

    it("Should check canCancelPayment correctly", async function () {
      await escrow.connect(sender).createPayment(recipient.address, ETH_ADDRESS, paymentAmount, {
        value: paymentAmount,
      });

      expect(await escrow.canCancelPayment(0)).to.equal(false);

      await time.increase(ESCROW_PERIOD + 1);

      expect(await escrow.canCancelPayment(0)).to.equal(true);
    });
  });

  describe("ERC20 Payments", function () {
    const paymentAmount = ethers.parseUnits("100", 6); // 100 USDC

    beforeEach(async function () {
      // Approve escrow to spend USDC
      await usdc.connect(sender).approve(await escrow.getAddress(), ethers.parseUnits("10000", 6));
    });

    it("Should create ERC20 payment successfully", async function () {
      const tx = await escrow.connect(sender).createPayment(recipient.address, await usdc.getAddress(), paymentAmount);

      await expect(tx)
        .to.emit(escrow, "PaymentCreated")
        .withArgs(
          0,
          sender.address,
          recipient.address,
          await usdc.getAddress(),
          paymentAmount,
          await time.latest()
        );

      const payment = await escrow.getPayment(0);
      expect(payment.token).to.equal(await usdc.getAddress());
      expect(payment.amount).to.equal(paymentAmount);
    });

    it("Should revert if ETH sent with ERC20 payment", async function () {
      await expect(
        escrow.connect(sender).createPayment(recipient.address, await usdc.getAddress(), paymentAmount, {
          value: ethers.parseEther("1"),
        })
      ).to.be.revertedWithCustomError(escrow, "InsufficientValue");
    });

    it("Should allow recipient to claim ERC20 payment", async function () {
      await escrow.connect(sender).createPayment(recipient.address, await usdc.getAddress(), paymentAmount);

      const balanceBefore = await usdc.balanceOf(recipient.address);

      await escrow.connect(recipient).claimPayment(0);

      const balanceAfter = await usdc.balanceOf(recipient.address);

      expect(balanceAfter - balanceBefore).to.equal(paymentAmount);
    });

    it("Should allow sender to cancel ERC20 payment after escrow period", async function () {
      await escrow.connect(sender).createPayment(recipient.address, await usdc.getAddress(), paymentAmount);

      const balanceBefore = await usdc.balanceOf(sender.address);

      await time.increase(ESCROW_PERIOD + 1);

      await escrow.connect(sender).cancelPayment(0);

      const balanceAfter = await usdc.balanceOf(sender.address);

      expect(balanceAfter - balanceBefore).to.equal(paymentAmount);
    });

    it("Should revert if insufficient ERC20 allowance", async function () {
      const newSender = other;
      await usdc.mint(newSender.address, paymentAmount);

      await expect(
        escrow.connect(newSender).createPayment(recipient.address, await usdc.getAddress(), paymentAmount)
      ).to.be.reverted;
    });
  });

  describe("Multiple Payments", function () {
    it("Should handle multiple payments correctly", async function () {
      const amount1 = ethers.parseEther("1.0");
      const amount2 = ethers.parseEther("2.0");

      await escrow.connect(sender).createPayment(recipient.address, ETH_ADDRESS, amount1, {
        value: amount1,
      });

      await escrow.connect(sender).createPayment(other.address, ETH_ADDRESS, amount2, {
        value: amount2,
      });

      expect(await escrow.getTotalPayments()).to.equal(2);

      const sentPayments = await escrow.getSentPayments(sender.address);
      expect(sentPayments.length).to.equal(2);

      const payment0 = await escrow.getPayment(0);
      const payment1 = await escrow.getPayment(1);

      expect(payment0.recipient).to.equal(recipient.address);
      expect(payment1.recipient).to.equal(other.address);
    });
  });

  describe("Pausable", function () {
    it("Should allow owner to pause", async function () {
      await escrow.connect(owner).pause();
      expect(await escrow.paused()).to.equal(true);
    });

    it("Should allow owner to unpause", async function () {
      await escrow.connect(owner).pause();
      await escrow.connect(owner).unpause();
      expect(await escrow.paused()).to.equal(false);
    });

    it("Should revert if non-owner tries to pause", async function () {
      await expect(escrow.connect(sender).pause()).to.be.revertedWithCustomError(
        escrow,
        "OwnableUnauthorizedAccount"
      );
    });

    it("Should prevent operations when paused", async function () {
      await escrow.connect(owner).pause();

      await expect(
        escrow.connect(sender).createPayment(recipient.address, ETH_ADDRESS, ethers.parseEther("1"), {
          value: ethers.parseEther("1"),
        })
      ).to.be.revertedWithCustomError(escrow, "EnforcedPause");
    });
  });

  describe("Edge Cases", function () {
    it("Should revert when querying non-existent payment", async function () {
      const payment = await escrow.getPayment(999);
      expect(payment.sender).to.equal(ethers.ZeroAddress);
    });

    it("Should handle receive function correctly", async function () {
      await expect(
        sender.sendTransaction({
          to: await escrow.getAddress(),
          value: ethers.parseEther("1"),
        })
      ).to.be.revertedWith("Use createPayment function");
    });

    it("Should prevent claiming cancelled payment", async function () {
      await escrow.connect(sender).createPayment(recipient.address, ETH_ADDRESS, ethers.parseEther("1"), {
        value: ethers.parseEther("1"),
      });

      await time.increase(ESCROW_PERIOD + 1);
      await escrow.connect(sender).cancelPayment(0);

      await expect(escrow.connect(recipient).claimPayment(0)).to.be.revertedWithCustomError(
        escrow,
        "PaymentAlreadyCancelled"
      );
    });

    it("Should prevent double cancellation", async function () {
      await escrow.connect(sender).createPayment(recipient.address, ETH_ADDRESS, ethers.parseEther("1"), {
        value: ethers.parseEther("1"),
      });

      await time.increase(ESCROW_PERIOD + 1);
      await escrow.connect(sender).cancelPayment(0);

      await expect(escrow.connect(sender).cancelPayment(0)).to.be.revertedWithCustomError(
        escrow,
        "PaymentAlreadyCancelled"
      );
    });
  });

  describe("Gas Usage", function () {
    it("Should report gas usage for ETH payment creation", async function () {
      const tx = await escrow.connect(sender).createPayment(recipient.address, ETH_ADDRESS, ethers.parseEther("1"), {
        value: ethers.parseEther("1"),
      });
      const receipt = await tx.wait();
      console.log("Gas used for ETH payment creation:", receipt?.gasUsed.toString());
    });

    it("Should report gas usage for payment claim", async function () {
      await escrow.connect(sender).createPayment(recipient.address, ETH_ADDRESS, ethers.parseEther("1"), {
        value: ethers.parseEther("1"),
      });

      const tx = await escrow.connect(recipient).claimPayment(0);
      const receipt = await tx.wait();
      console.log("Gas used for payment claim:", receipt?.gasUsed.toString());
    });
  });
});
