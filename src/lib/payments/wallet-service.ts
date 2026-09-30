import mongoose from "mongoose";
import { Wallet, IWallet } from "../db/models/Wallet";
import {
  WalletTransaction,
  WalletTransactionType,
} from "../db/models/WalletTransaction";

export async function getOrCreateWallet(
  userId: string | mongoose.Types.ObjectId
): Promise<IWallet> {
  let wallet = await Wallet.findOne({ userId });
  if (!wallet) {
    wallet = await Wallet.create({
      userId,
      balance: 0,
      lockedBalance: 0,
      currency: "INR",
    });
  }
  return wallet;
}

export async function creditWallet(params: {
  userId: string | mongoose.Types.ObjectId;
  amount: number;
  type: WalletTransactionType;
  referenceId?: string;
  description: string;
}): Promise<{ success: boolean; newBalance: number }> {
  const wallet = await getOrCreateWallet(params.userId);
  const balanceBefore = wallet.balance;
  const balanceAfter = balanceBefore + params.amount;

  wallet.balance = balanceAfter;
  if (params.type === "DEPOSIT") {
    wallet.totalDeposited += params.amount;
  } else if (params.type === "PRIZE_CREDIT") {
    wallet.totalWon += params.amount;
  }
  await wallet.save();

  await WalletTransaction.create({
    walletId: wallet._id,
    userId: params.userId,
    type: params.type,
    amount: params.amount,
    balanceBefore,
    balanceAfter,
    referenceId: params.referenceId,
    description: params.description,
    status: "COMPLETED",
  });

  return { success: true, newBalance: balanceAfter };
}

export async function debitWallet(params: {
  userId: string | mongoose.Types.ObjectId;
  amount: number;
  type: WalletTransactionType;
  referenceId?: string;
  description: string;
}): Promise<{ success: boolean; newBalance: number; error?: string }> {
  const wallet = await getOrCreateWallet(params.userId);

  if (wallet.balance < params.amount) {
    return {
      success: false,
      newBalance: wallet.balance,
      error: `Insufficient wallet balance. Available: ₹${wallet.balance}, required: ₹${params.amount}`,
    };
  }

  const balanceBefore = wallet.balance;
  const balanceAfter = balanceBefore - params.amount;

  wallet.balance = balanceAfter;
  await wallet.save();

  await WalletTransaction.create({
    walletId: wallet._id,
    userId: params.userId,
    type: params.type,
    amount: params.amount,
    balanceBefore,
    balanceAfter,
    referenceId: params.referenceId,
    description: params.description,
    status: "COMPLETED",
  });

  return { success: true, newBalance: balanceAfter };
}

export async function lockBalanceForWithdrawal(params: {
  userId: string | mongoose.Types.ObjectId;
  amount: number;
}): Promise<{ success: boolean; error?: string }> {
  const wallet = await getOrCreateWallet(params.userId);

  if (wallet.balance < params.amount) {
    return { success: false, error: "Insufficient balance for withdrawal request." };
  }

  wallet.balance -= params.amount;
  wallet.lockedBalance += params.amount;
  await wallet.save();

  await WalletTransaction.create({
    walletId: wallet._id,
    userId: params.userId,
    type: "WITHDRAWAL_REQUEST",
    amount: params.amount,
    balanceBefore: wallet.balance + params.amount,
    balanceAfter: wallet.balance,
    description: `Withdrawal request submitted for ₹${params.amount}`,
    status: "PENDING",
  });

  return { success: true };
}

export async function finalizeWithdrawal(params: {
  userId: string | mongoose.Types.ObjectId;
  amount: number;
  approved: boolean;
  referenceId?: string;
}): Promise<void> {
  const wallet = await getOrCreateWallet(params.userId);

  if (params.approved) {
    wallet.lockedBalance = Math.max(0, wallet.lockedBalance - params.amount);
    wallet.totalWithdrawn += params.amount;
    await wallet.save();

    await WalletTransaction.create({
      walletId: wallet._id,
      userId: params.userId,
      type: "WITHDRAWAL_COMPLETED",
      amount: params.amount,
      balanceBefore: wallet.balance,
      balanceAfter: wallet.balance,
      referenceId: params.referenceId,
      description: `Withdrawal of ₹${params.amount} processed successfully`,
      status: "COMPLETED",
    });
  } else {
    // Refund locked balance back to active balance
    wallet.lockedBalance = Math.max(0, wallet.lockedBalance - params.amount);
    wallet.balance += params.amount;
    await wallet.save();

    await WalletTransaction.create({
      walletId: wallet._id,
      userId: params.userId,
      type: "WITHDRAWAL_REJECTED",
      amount: params.amount,
      balanceBefore: wallet.balance - params.amount,
      balanceAfter: wallet.balance,
      referenceId: params.referenceId,
      description: `Withdrawal request for ₹${params.amount} rejected. Funds restored to wallet.`,
      status: "COMPLETED",
    });
  }
}
