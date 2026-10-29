# FinSight: Finance Tracker

A full-stack personal finance tracker built with **React, Node.js (Express) and MySQL**.
Manage multiple accounts, record income and expenses, set a monthly budget and see where
your money goes on a clean dashboard. Login is handled by **Clerk**, and all data is stored
per user in MySQL, so everything is there again the next time you sign in.

**Live demo:** [finance-tracker-ouwg-hvoytduq1-joel-franklins-projects.vercel.app](https://finance-tracker-ouwg-hvoytduq1-joel-franklins-projects.vercel.app/)
**API:** [finance-tracker-ozbb.onrender.com](https://finance-tracker-ozbb.onrender.com/)

---

## Features

- **Authentication:** Sign up and sign in with Clerk. The user is saved in MySQL on the first login.
- **Multiple accounts:** Create Current and Savings accounts and choose a default account.
- **Dashboard:** Account cards with balances, monthly budget progress, recent transactions
  and a monthly expense breakdown chart.
- **Transactions:** Add, edit, delete and bulk delete. The account balance is updated
  automatically on every change.
- **Account page:** Per-account transaction table and an income vs expense chart.
- **Monthly budget:** Set a budget and track this month's expenses against it.
- **Secure API:** Every request is verified with the Clerk token, and every query is limited
  to the logged-in user's own data.
- **Receipt scanner (optional):** Upload a receipt photo and Google Gemini fills in the
  amount, date and category. It needs a `GEMINI_API_KEY` and is not required to run the app.

## Tech Stack

| Layer         | Technologies                                               |
| ------------- | ---------------------------------------------------------- |
| Frontend      | React, Vite, React Router, React Hook Form, Zod, Recharts |
| Backend       | Node.js, Express,                                          |
| Database      | MySQL (plain SQL with `mysql2`)                          |
| Auth          | Clerk                                                      |
| AI (optional) | Google Gemini API                                          |
| Hosting       | Vercel (frontend), Render (backend), Clever Cloud (MySQL)  |

## Project Structure

```
finance-tracker/
├── client/                         React app (Vite)
│   ├── public/                     Logo and banner images
│   ├── src/
│   │   ├── app/                    Pages and layouts (Next.js style folders)
│   │   │   ├── (auth)/             sign-in, sign-up
│   │   │   ├── (main)/
│   │   │   │   ├── dashboard/      page + _components
│   │   │   │   ├── account/[id]/   page + _components
│   │   │   │   └── transaction/create/   page + _components
│   │   │   ├── layout.jsx
│   │   │   ├── page.jsx            Landing page
│   │   │   └── not-found.jsx
│   │   ├── actions/                API calls (account, budget, dashboard, transaction)
│   │   ├── components/             Header, hero, drawer, shadcn/ui components
│   │   ├── data/                   Categories and landing page data
│   │   ├── hooks/                  use-fetch
│   │   ├── lib/                    API client, query client, form schema, utils
│   │   ├── App.jsx                 Routes
│   │   └── main.jsx                Clerk + React Query setup
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── vercel.json                 SPA rewrite for Vercel
│
├── server/                         Express API
│   ├── routes/                     accounts.js, transactions.js, budget.js
│   ├── lib/                        gemini.js, receipt.js, schemas.js, recurring.js, http.js
│   ├── auth.js                     Clerk token check + user creation in MySQL
│   ├── db.js                       MySQL connection pool and query helpers
│   ├── createScheme.js             Creates all tables in a cloud MySQL database
│   ├── index.js                    App entry, CORS, routes
│   └── .env.example
│
├── database/
│   └── schema.sql                  Tables for MySQL Workbench
│
├── package.json                    Root scripts (setup, dev)
└── README.md
```

## Database

Four tables: `users`, `accounts`, `transactions`, `budgets`.

- One user has many accounts and transactions, and one budget
- Foreign keys with `ON DELETE CASCADE`
- Money is stored as `DECIMAL(15,2)`
- Balance updates and transaction writes run inside SQL transactions, so they stay consistent

## API Endpoints

All routes need a valid Clerk token.

| Method     | Endpoint                           | Purpose                               |
| ---------- | ---------------------------------- | ------------------------------------- |
| GET        | `/api/health`                    | Health check (public)                 |
| GET / POST | `/api/accounts`                  | List or create accounts               |
| GET        | `/api/accounts/:id`              | Account with its transactions         |
| PATCH      | `/api/accounts/:id/default`      | Set the default account               |
| GET / POST | `/api/transactions`              | List or create transactions           |
| GET / PUT  | `/api/transactions/:id`          | Read or update a transaction          |
| POST       | `/api/transactions/bulk-delete`  | Delete many transactions              |
| POST       | `/api/transactions/scan-receipt` | Scan a receipt with Gemini (optional) |
| GET / PUT  | `/api/budget`                    | Read or update the monthly budget     |

## Getting Started

### Prerequisites

- Node.js 18 or newer
- MySQL (MySQL Workbench locally, or a cloud MySQL such as Clever Cloud)
- A free [Clerk](https://clerk.com) application

### 1. Clone and install

```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>
npm run setup
```

### 2. Create the database tables

Pick one:

- **MySQL Workbench:** open `database/schema.sql` and run it.
- **Cloud MySQL:** fill in the `DB_*` values in `server/.env`, then run
  ```bash
  cd server
  node createScheme.js
  ```

### 3. Environment variables

**`server/.env`**

```env
PORT=3001
CLIENT_URL=http://localhost:5173

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=ai_finance

CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Optional: receipt scanner
GEMINI_API_KEY=your_gemini_key
```

**`client/.env`**

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
# Only needed when the API is on another domain (production)
VITE_API_URL=
```

### 4. Run

```bash
npm run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:3001

## Deployment

| Part     | Platform           | Settings                                                                                                            |
| -------- | ------------------ | ------------------------------------------------------------------------------------------------------------------- |
| Frontend | Vercel             | Root directory `client`, env `VITE_CLERK_PUBLISHABLE_KEY` and `VITE_API_URL` (backend URL, no trailing slash) |
| Backend  | Render             | Root directory `server`, build `npm install`, start `npm start`, add all `server/.env` variables            |
| Database | Clever Cloud MySQL | Run `node createScheme.js` once                                                                                   |

Set `CLIENT_URL` on the backend to the Vercel URL, otherwise the browser blocks requests (CORS).
Use the same Clerk instance keys (`pk_test` / `sk_test`) on both the frontend and the backend.

## Roadmap

- Gemini receipt scanner in production
- Automatic recurring transactions (the flag is stored, the scheduler is not built yet)
- Budget alert emails
- Export transactions to CSV

## What I Learned

- Building a REST API with Express and plain SQL
- Designing a relational schema and using SQL transactions for money data
- Integrating Clerk authentication with a custom backend
- Deploying a frontend, an API and a database separately, and fixing CORS and environment variable issues
