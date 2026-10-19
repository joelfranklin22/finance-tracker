import { Router } from "express";
import { one, query, uuid } from "../db.js";
import { budgetInput } from "../lib/schemas.js";

const router = Router();

router.get("/", async (req, res) => {
  const accountId = typeof req.query.accountId === "string" ? req.query.accountId : null;
  const budget = await one("SELECT * FROM budgets WHERE userId = ?", [req.user.id]);

  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const [row] = await query(
    `SELECT COALESCE(SUM(amount), 0) AS total FROM transactions
     WHERE userId = ? AND type = 'EXPENSE' AND date >= ? AND date < ? ${accountId ? "AND accountId = ?" : ""}`,
    accountId ? [req.user.id, start, end, accountId] : [req.user.id, start, end]
  );
  res.json({ success: true, data: { budget, currentExpenses: Number(row.total) } });
});

router.put("/", async (req, res) => {
  const { amount } = budgetInput.parse(req.body);
  await query(
    "INSERT INTO budgets (id, amount, userId) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE amount = VALUES(amount)",
    [uuid(), amount, req.user.id]
  );
  res.json({ success: true, data: await one("SELECT * FROM budgets WHERE userId = ?", [req.user.id]) });
});

export default router;
