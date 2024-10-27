import request from "supertest";
import app from "../app";

describe("Banking System API", () => {
  let accountId1: string;
  let accountId2: string;

  beforeEach(async () => {
    // Create two accounts before each test.
    const res1 = await request(app)
      .post("/accounts")
      .send({ name: "William 1", initialBalance: 1000 });
    accountId1 = res1.body.id;

    const res2 = await request(app)
      .post("/accounts")
      .send({ name: "William 2", initialBalance: 500 });
    accountId2 = res2.body.id;
  });

  afterEach(async () => {
    // Clear and reset testing account
    await request(app).delete(`/accounts/${accountId1}`);
    await request(app).delete(`/accounts/${accountId2}`);
  });

  it("should create an account with an initial balance", async () => {
    const res = await request(app)
      .post("/accounts")
      .send({ name: "Alice", initialBalance: 1500 });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.balance).toBe(1500);
    expect(res.body.name).toBe("Alice");
    // Initial account should have 0 record.
    expect(res.body.transactions.length).toBe(0);
  });

  it("should deposit money into the account and verify balance", async () => {
    const depositAmount = 500;
    const res = await request(app)
      .post("/accounts/deposit")
      .send({ accountId: accountId1, amount: depositAmount });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Deposit successful");
    expect(res.body.balance).toBe(500);

    // Update account detail
    const accountRes = await request(app).get(
      `/accounts/${accountId1}/transactions`
    );
    const transactions = accountRes.body;
    expect(transactions.length).toBe(1);
    expect(transactions[0].amount).toBe(depositAmount);
    expect(transactions[0].type).toBe("deposit");
    expect(transactions[0]).toHaveProperty("date");
  });

  it("should not allow deposit with zero or negative amount", async () => {
    // deposit 0
    const res = await request(app)
      .post("/accounts/deposit")
      .send({ accountId: accountId1, amount: 0 });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Deposit Amount must be positive");

    // deposit -100
    const resNegative = await request(app)
      .post("/accounts/deposit")
      .send({ accountId: accountId1, amount: -100 });

    expect(resNegative.status).toBe(400);
    expect(resNegative.body.error).toBe("Deposit Amount must be positive");
  });

  it("should withdraw money and verify balance", async () => {
    const withdrawAmount = 300;
    const res = await request(app)
      .post("/accounts/withdraw")
      .send({ accountId: accountId1, amount: withdrawAmount });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Withdraw successful");

    const accountRes = await request(app).get(
      `/accounts/${accountId1}/transactions`
    );
    const transactions = accountRes.body;
    expect(transactions.length).toBe(1);
    expect(transactions[0].amount).toBe(withdrawAmount);
    expect(transactions[0].type).toBe("withdraw");
  });

  it("should not allow withdrawal exceeding balance", async () => {
    const withdrawAmount = 2000;
    const res = await request(app)
      .post("/accounts/withdraw")
      .send({ accountId: accountId1, amount: withdrawAmount });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Insufficient balance");
  });

  it("should transfer money between accounts and verify balances", async () => {
    const transferAmount = 300;
    const res = await request(app).post("/accounts/transfer").send({
      fromAccountId: accountId1,
      toAccountId: accountId2,
      amount: transferAmount,
    });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Transfer successful");

    // Check "from" account
    const account1Res = await request(app).get(
      `/accounts/${accountId1}/transactions`
    );
    const lastTransactionAccount1 =
      account1Res.body[account1Res.body.length - 1];
    expect(lastTransactionAccount1.amount).toBe(transferAmount);
    expect(lastTransactionAccount1.type).toBe("transfer");

    // Check "to" account
    const account2Res = await request(app).get(
      `/accounts/${accountId2}/transactions`
    );
    const lastTransactionAccount2 =
      account2Res.body[account2Res.body.length - 1];
    expect(lastTransactionAccount2.amount).toBe(transferAmount);
    expect(lastTransactionAccount2.type).toBe("receive");
  });

  it("should not allow transfer with insufficient balance", async () => {
    const transferAmount = 1500; // More than the current balance.
    const res = await request(app).post("/accounts/transfer").send({
      fromAccountId: accountId1,
      toAccountId: accountId2,
      amount: transferAmount,
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Insufficient balance");
  });

  it("should return transaction logs", async () => {
    const res = await request(app).get(`/accounts/${accountId1}/transactions`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0); // Check transaction record.
    expect(res.body[0]).toHaveProperty("amount");
    expect(res.body[0]).toHaveProperty("type");
    expect(res.body[0]).toHaveProperty("date");
  });

  it("should return 404 when accessing non-existent account", async () => {
    const res = await request(app).get(
      "/accounts/non-existent-id/transactions"
    );
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Account not found");
  });
});
