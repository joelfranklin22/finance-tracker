import "dotenv/config";
import express from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import { requireUser } from "./auth.js";
import { errorHandler } from "./lib/http.js";
import accounts from "./routes/accounts.js";
import transactions from "./routes/transactions.js";
import budget from "./routes/budget.js";

const app = express();
const origins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((s) => s.trim());

app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true);
      const allowed =
        origins.includes(origin) ||
        /^https:\/\/finance-tracker-ouwg[a-z0-9-]*\.vercel\.app$/.test(origin);
      cb(null, allowed);
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "5mb" }));
app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use(clerkMiddleware());
app.use("/api/accounts", requireUser, accounts);
app.use("/api/transactions", requireUser, transactions);
app.use("/api/budget", requireUser, budget);
app.use((req, res) =>
  res.status(404).json({ success: false, error: "Not found" }),
);
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () =>
  console.log(`API server running on http://localhost:${PORT}`),
);
