import "dotenv/config";
import { pool } from "./db.js";

const T = "ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
const NOW = "DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)";
const UPD =
  "DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)";

const createSqlTables = async () => {
  const tables = {
    users: `
    CREATE TABLE IF NOT EXISTS users (
      id            VARCHAR(191) NOT NULL,
      clerkUserId   VARCHAR(191) NOT NULL,
      email         VARCHAR(191) NOT NULL,
      name          VARCHAR(191) NULL,
      imageUrl      TEXT         NULL,
      createdAt     ${NOW},
      updatedAt     ${UPD},
      PRIMARY KEY (id),
      UNIQUE KEY users_clerkUserId_key (clerkUserId),
      UNIQUE KEY users_email_key (email)
    ) ${T}`,

    accounts: `
    CREATE TABLE IF NOT EXISTS accounts (
      id         VARCHAR(191)  NOT NULL,
      name       VARCHAR(191)  NOT NULL,
      type       ENUM('CURRENT','SAVINGS') NOT NULL,
      balance    DECIMAL(15,2) NOT NULL DEFAULT 0.00,
      isDefault  TINYINT(1)    NOT NULL DEFAULT 0,
      userId     VARCHAR(191)  NOT NULL,
      createdAt  ${NOW},
      updatedAt  ${UPD},
      PRIMARY KEY (id),
      KEY accounts_userId_idx (userId),
      CONSTRAINT accounts_userId_fkey FOREIGN KEY (userId)
        REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE
    ) ${T}`,

    transactions: `
    CREATE TABLE IF NOT EXISTS transactions (
      id                 VARCHAR(191)  NOT NULL,
      type               ENUM('INCOME','EXPENSE') NOT NULL,
      amount             DECIMAL(15,2) NOT NULL,
      description        TEXT          NULL,
      date               DATETIME(3)   NOT NULL,
      category           VARCHAR(191)  NOT NULL,
      receiptUrl         TEXT          NULL,
      isRecurring        TINYINT(1)    NOT NULL DEFAULT 0,
      recurringInterval  ENUM('DAILY','WEEKLY','MONTHLY','YEARLY') NULL,
      nextRecurringDate  DATETIME(3)   NULL,
      lastProcessed      DATETIME(3)   NULL,
      status             ENUM('PENDING','COMPLETED','FAILED') NOT NULL DEFAULT 'COMPLETED',
      userId             VARCHAR(191)  NOT NULL,
      accountId          VARCHAR(191)  NOT NULL,
      createdAt          ${NOW},
      updatedAt          ${UPD},
      PRIMARY KEY (id),
      KEY transactions_userId_idx (userId),
      KEY transactions_accountId_idx (accountId),
      CONSTRAINT transactions_userId_fkey FOREIGN KEY (userId)
        REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT transactions_accountId_fkey FOREIGN KEY (accountId)
        REFERENCES accounts (id) ON DELETE CASCADE ON UPDATE CASCADE
    ) ${T}`,

    budgets: `
    CREATE TABLE IF NOT EXISTS budgets (
      id             VARCHAR(191)  NOT NULL,
      amount         DECIMAL(15,2) NOT NULL,
      lastAlertSent  DATETIME(3)   NULL,
      userId         VARCHAR(191)  NOT NULL,
      createdAt      ${NOW},
      updatedAt      ${UPD},
      PRIMARY KEY (id),
      UNIQUE KEY budgets_userId_key (userId),
      KEY budgets_userId_idx (userId),
      CONSTRAINT budgets_userId_fkey FOREIGN KEY (userId)
        REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE
    ) ${T}`,
  };
  for (const [name, sql] of Object.entries(tables)) {
    await pool.query(sql);
    console.log(`Table "${name}" is ready.`);
  }
};

createSqlTables()
  .catch((err) => console.error("Error creating tables:", err.message))
  .finally(() => pool.end());
