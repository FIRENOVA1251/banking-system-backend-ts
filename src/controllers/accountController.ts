import { Request, Response } from "express";
import { accountService } from "../services/accountService";
import { HttpError } from "../models/HttpError";

export const createAccount = (req: Request, res: Response) => {
  try {
    const { name, initialBalance } = req.body;
    const accountDetail = accountService.createAccount(name, initialBalance);

    // Status 201 indicates successful and new resources being created.
    res.status(201).json(accountDetail);
  } catch (error) {
    if (error instanceof HttpError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
};

export const deposit = (req: Request, res: Response) => {
  try {
    const { accountId, depositAmount } = req.body;
    accountService.deposit(accountId, depositAmount);

    // Status 200 indicates successful
    res.status(200).json({ message: "Deposit successful" });
  } catch (error) {
    if (error instanceof HttpError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
};

export const withdraw = (req: Request, res: Response) => {
  try {
    const { accountId, withdrawalAmount } = req.body;

    accountService.withdraw(accountId, withdrawalAmount);
    res.status(200).json({ message: "Withdraw successful" });
  } catch (error) {
    if (error instanceof HttpError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
};

export const transfer = (req: Request, res: Response) => {
  try {
    const { fromAccountId, toAccountId, transferAmount } = req.body;

    accountService.transfer(fromAccountId, toAccountId, transferAmount);
    res.status(200).json({ message: "Transfer successful" });
  } catch (error) {
    if (error instanceof HttpError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
};

export const getTransactionLogs = (req: Request, res: Response) => {
  try {
    const { accountId } = req.params;
    const transactions = accountService.getTransactionLogs(accountId);

    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
