-- =====================================================================
--  AI Finance Platform - MySQL schema
--  Run this whole file in MySQL Workbench (File > Open SQL Script > Run)
--  Column names are camelCase on purpose: Prisma uses them as they are.
-- =====================================================================

CREATE DATABASE IF NOT EXISTS ai_finance
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE ai_finance;

-- ---------------------------------------------------------------------
-- users  (created automatically on the first login with Clerk)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id            VARCHAR(191) NOT NULL,
  clerkUserId   VARCHAR(191) NOT NULL,
  email         VARCHAR(191) NOT NULL,
  name          VARCHAR(191) NULL,
  imageUrl      TEXT         NULL,
  createdAt     DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt     DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY users_clerkUserId_key (clerkUserId),
  UNIQUE KEY users_email_key (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- accounts  (Savings / Current accounts of a user)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS accounts (
  id         VARCHAR(191)  NOT NULL,
  name       VARCHAR(191)  NOT NULL,
  type       ENUM('CURRENT','SAVINGS') NOT NULL,
  balance    DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  isDefault  TINYINT(1)    NOT NULL DEFAULT 0,
  userId     VARCHAR(191)  NOT NULL,
  createdAt  DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt  DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY accounts_userId_idx (userId),
  CONSTRAINT accounts_userId_fkey FOREIGN KEY (userId)
    REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- transactions  (income / expense, manual or scanned with Gemini)
-- ---------------------------------------------------------------------
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
  createdAt          DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt          DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY transactions_userId_idx (userId),
  KEY transactions_accountId_idx (accountId),
  CONSTRAINT transactions_userId_fkey FOREIGN KEY (userId)
    REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT transactions_accountId_fkey FOREIGN KEY (accountId)
    REFERENCES accounts (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- budgets  (one monthly budget per user)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS budgets (
  id             VARCHAR(191)  NOT NULL,
  amount         DECIMAL(15,2) NOT NULL,
  lastAlertSent  DATETIME(3)   NULL,
  userId         VARCHAR(191)  NOT NULL,
  createdAt      DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt      DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY budgets_userId_key (userId),
  KEY budgets_userId_idx (userId),
  CONSTRAINT budgets_userId_fkey FOREIGN KEY (userId)
    REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Check
SHOW TABLES;
