import { AccountDetail, Transaction } from "../models/account";
import { HttpError } from "../models/HttpError";

// Process Account Actions.
class AccountService {
  private accounts: Map<string, AccountDetail> = new Map();

  createAccount(name: string, initialBalance: number): AccountDetail {
    if (initialBalance < 0) {
      throw new HttpError("Initial balance cannot be negative", 400);
    }

    const id = `${Date.now()}-${Math.random()}`;
    const accountDetail: AccountDetail = {
      id,
      name,
      balance: initialBalance,
      transactions: [],
    };
    this.accounts.set(id, accountDetail);
    return accountDetail;
  }

  getAccount(id: string): AccountDetail {
    const accountDetail = this.accounts.get(id);
    if (!accountDetail) {
      throw new HttpError("Account not found", 400);
    }
    return accountDetail;
  }

  deposit(accountId: string, amount: number): void {
    const accountDetail = this.getAccount(accountId);
    if (amount <= 0) {
      throw new HttpError("Deposit Amount must be positive", 400);
    }

    accountDetail.balance += amount;
    accountDetail.transactions.push({
      date: new Date(),
      amount,
      type: "deposit",
    });

    const originalBalance = accountDetail.balance;
    const originalTransactions = [...accountDetail.transactions];

    try {
      // Atomic transaction
      accountDetail.balance += amount;
      accountDetail.transactions.push({
        date: new Date(),
        amount,
        type: "deposit",
      });
    } catch (error) {
      // Roll back if there's any issue.
      accountDetail.balance = originalBalance;
      accountDetail.transactions = originalTransactions;
      throw error;
    }
  }

  withdraw(accountId: string, amount: number): void {
    const accountDetail = this.getAccount(accountId);
    if (amount <= 0) {
      throw new HttpError("Withdrawal Amount must be positive", 400);
    }
    if (accountDetail.balance < amount) {
      throw new HttpError("Insufficient balance", 400);
    }

    const originalBalance = accountDetail.balance;
    const originalTransactions = [...accountDetail.transactions];

    try {
      // Atomic transaction
      accountDetail.balance -= amount;
      accountDetail.transactions.push({
        date: new Date(),
        amount,
        type: "withdraw",
      });
    } catch (error) {
      accountDetail.balance = originalBalance;
      accountDetail.transactions = originalTransactions;
      throw error;
    }
  }

  transfer(fromAccountId: string, toAccountId: string, amount: number): void {
    const fromAccount = this.getAccount(fromAccountId);
    const toAccount = this.getAccount(toAccountId);
    if (amount <= 0) {
      throw new HttpError("Amount must be positive", 400);
    }

    if (fromAccount.balance < amount) {
      throw new HttpError("Insufficient balance", 400);
    }

    const originalFromBalance = fromAccount.balance;
    const originalToBalance = toAccount.balance;
    const originalFromTransactions = [...fromAccount.transactions];
    const originalToTransactions = [...toAccount.transactions];

    try {
      // Atomic transaction
      fromAccount.balance -= amount;
      toAccount.balance += amount;

      const transactionDate = new Date();
      fromAccount.transactions.push({
        date: transactionDate,
        amount,
        type: "transfer",
        targetAccountId: toAccountId,
      });
      toAccount.transactions.push({
        date: transactionDate,
        amount,
        type: "receive",
        targetAccountId: fromAccountId,
      });
    } catch (error) {
      // Roll back
      fromAccount.balance = originalFromBalance;
      toAccount.balance = originalToBalance;
      fromAccount.transactions = originalFromTransactions;
      toAccount.transactions = originalToTransactions;
      throw error;
    }
  }

  getTransactionLogs(accountId: string): Transaction[] {
    const account = this.getAccount(accountId);
    return account.transactions;
  }
}

export const accountService = new AccountService();
