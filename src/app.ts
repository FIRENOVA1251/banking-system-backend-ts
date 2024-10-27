import express from "express";
import {
  createAccount,
  deposit,
  withdraw,
  transfer,
  getTransactionLogs,
} from "./controllers/accountController";

const app = express();
// Handle JSON request.
app.use(express.json());

app.post("/accounts", createAccount);
app.post("/accounts/deposit", deposit);
app.post("/accounts/withdraw", withdraw);
app.post("/accounts/transfer", transfer);
//:accountId indicates actual account ID.
app.get("/accounts/:accountId/transactions", getTransactionLogs);

app.listen(3000, () => {
  console.log("Banking system API is running on port 3000");
});

// http://localhost:3000

export default app;
