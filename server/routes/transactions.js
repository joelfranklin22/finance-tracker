import { Router } from "express";
import multer from "multer";
import { one, query, uuid, withTransaction } from "../db.js";
import { HttpError } from "../lib/http.js";
import { bulkDeleteInput, transactionInput } from "../lib/schemas.js";
import { calculateNextRecurringDate } from "../lib/recurring.js";
import { scanReceiptImage } from "../lib/receipt.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
const change = (type, amount) => (type === "EXPENSE" ? -amount : amount);
const addBalance = (c, accountId, amount) =>
  query("UPDATE accounts SET balance = balance + ? WHERE id = ?", [amount, accountId], c);

const nextDate = (d) =>
  d.isRecurring && d.recurringInterval ? calculateNextRecurringDate(d.date, d.recurringInterval) : null;

async function ownAccount(id, userId) {
  const acc = await one("SELECT id FROM accounts WHERE id = ? AND userId = ?", [id, userId]);
  if (!acc) throw new HttpError(404, "Account not found");
}

router.get("/", async (req, res) => {
  const data = await query("SELECT * FROM transactions WHERE userId = ? ORDER BY date DESC", [req.user.id]);
  res.json({ success: true, data });
});

// Gemini receipt scanner
router.post("/scan-receipt", upload.single("receipt"), async (req, res) => {
  if (!req.file) throw new HttpError(400, "No receipt image uploaded");
  if (!req.file.mimetype.startsWith("image/")) throw new HttpError(400, "Only image files can be scanned");
  res.json({ success: true, data: await scanReceiptImage(req.file) });
});

router.post("/bulk-delete", async (req, res) => {
  const { ids } = bulkDeleteInput.parse(req.body);
  const rows = await query("SELECT * FROM transactions WHERE id IN (?) AND userId = ?", [ids, req.user.id]);

  const byAccount = {};
  for (const t of rows) byAccount[t.accountId] = (byAccount[t.accountId] || 0) - change(t.type, t.amount);

  await withTransaction(async (c) => {
    await query("DELETE FROM transactions WHERE id IN (?) AND userId = ?", [ids, req.user.id], c);
    for (const [accountId, amount] of Object.entries(byAccount)) await addBalance(c, accountId, amount);
  });
  res.json({ success: true });
});

router.post("/", async (req, res) => {
  const d = transactionInput.parse(req.body);
  await ownAccount(d.accountId, req.user.id);
  const id = uuid();

  await withTransaction(async (c) => {
    await query(
      `INSERT INTO transactions (id, type, amount, description, date, category, isRecurring,
         recurringInterval, nextRecurringDate, userId, accountId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, d.type, d.amount, d.description ?? null, d.date, d.category, d.isRecurring ? 1 : 0,
       d.recurringInterval ?? null, nextDate(d), req.user.id, d.accountId],
      c
    );
    await addBalance(c, d.accountId, change(d.type, d.amount));
  });
  res.status(201).json({ success: true, data: await one("SELECT * FROM transactions WHERE id = ?", [id]) });
});

router.get("/:id", async (req, res) => {
  const t = await one("SELECT * FROM transactions WHERE id = ? AND userId = ?", [req.params.id, req.user.id]);
  if (!t) throw new HttpError(404, "Transaction not found");
  res.json({ success: true, data: t });
});

router.put("/:id", async (req, res) => {
  const d = transactionInput.parse(req.body);
  const old = await one("SELECT * FROM transactions WHERE id = ? AND userId = ?", [req.params.id, req.user.id]);
  if (!old) throw new HttpError(404, "Transaction not found");
  await ownAccount(d.accountId, req.user.id);

  const oldChange = change(old.type, old.amount);
  const newChange = change(d.type, d.amount);

  await withTransaction(async (c) => {
    await query(
      `UPDATE transactions SET type = ?, amount = ?, description = ?, date = ?, category = ?, accountId = ?,
         isRecurring = ?, recurringInterval = ?, nextRecurringDate = ? WHERE id = ?`,
      [d.type, d.amount, d.description ?? null, d.date, d.category, d.accountId,
       d.isRecurring ? 1 : 0, d.recurringInterval ?? null, nextDate(d), old.id],
      c
    );
    if (old.accountId === d.accountId) {
      await addBalance(c, d.accountId, newChange - oldChange);
    } else {
      await addBalance(c, old.accountId, -oldChange);
      await addBalance(c, d.accountId, newChange);
    }
  });
  res.json({ success: true, data: await one("SELECT * FROM transactions WHERE id = ?", [old.id]) });
});

export default router;
