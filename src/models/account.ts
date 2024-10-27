export interface AccountDetail {
  id: string;
  name: string;
  balance: number;
  transactions: Transaction[];
}

export interface Transaction {
  date: Date;
  amount: number;
  type: string;
  targetAccountId?: string;
}
