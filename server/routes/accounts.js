import { Router } from "express";
import { one, query, uuid, withTransaction } from "../db.js";
import { HttpError } from "../lib/http.js";
import { accountInput } from "../lib/schemas.js";

const router = Router();
const COUNT = "(SELECT COUNT(*) FROM transactions t WHERE t.accountId = a.id) AS txCount";
const shape = ({ txCount, ...a }) => ({ ...a, _count: { transactions: Number(txCount) } });

router.get("/", async (req, res) => {
  const rows = await query(
    `SELECT a.*, ${COUNT} FROM accounts a WHERE a.userId = ? ORDER BY a.createdAt DESC`,
    [req.user.id]
  );
  res.json({ success: true, data: rows.map(shape) });
});

router.post("/", async (req, res) => {
  const data = accountInput.parse(req.body);
  const [{ n }] = await query("SELECT COUNT(*) AS n FROM accounts WHERE userId = ?", [req.user.id]);
  const isDefault = n === 0 ? true : data.isDefault;
  const id = uuid();

  await withTransaction(async (c) => {
    if (isDefault) await query("UPDATE accounts SET isDefault = 0 WHERE userId = ?", [req.user.id], c);
    await query(
      "INSERT INTO accounts (id, name, type, balance, isDefault, userId) VALUES (?, ?, ?, ?, ?, ?)",
      [id, data.name, data.type, data.balance, isDefault ? 1 : 0, req.user.id],
      c
    );
  });

  res.status(201).json({ success: true, data: await one("SELECT * FROM accounts WHERE id = ?", [id]) });
});

router.get("/:id", async (req, res) => {
  const account = await one(
    `SELECT a.*, ${COUNT} FROM accounts a WHERE a.id = ? AND a.userId = ?`,
    [req.params.id, req.user.id]
  );
  if (!account) throw new HttpError(404, "Account not found");

  const transactions = await query(
    "SELECT * FROM transactions WHERE accountId = ? ORDER BY date DESC",
    [account.id]
  );
  res.json({ success: true, data: { ...shape(account), transactions } });
});

router.patch("/:id/default", async (req, res) => {
  const target = await one("SELECT id FROM accounts WHERE id = ? AND userId = ?", [req.params.id, req.user.id]);
  if (!target) throw new HttpError(404, "Account not found");

  await withTransaction(async (c) => {
    await query("UPDATE accounts SET isDefault = 0 WHERE userId = ?", [req.user.id], c);
    await query("UPDATE accounts SET isDefault = 1 WHERE id = ?", [target.id], c);
  });
  res.json({ success: true, data: await one("SELECT * FROM accounts WHERE id = ?", [target.id]) });
});

export default router;
