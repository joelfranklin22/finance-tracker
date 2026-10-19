import mysql from "mysql2/promise";
import { randomUUID } from "node:crypto";

export const uuid = randomUUID;

export const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "ai_finance",
  decimalNumbers: true, // DECIMAL columns come back as numbers
  timezone: "Z",
  connectionLimit: 10,
});

// MySQL stores booleans as TINYINT(1)
const fix = (r) => {
  for (const k of ["isDefault", "isRecurring"]) if (k in r) r[k] = !!r[k];
  return r;
};

export async function query(sql, params = [], conn = pool) {
  const [rows] = await conn.query(sql, params);
  return Array.isArray(rows) ? rows.map(fix) : rows;
}

export async function one(sql, params = [], conn = pool) {
  return (await query(sql, params, conn))[0] ?? null;
}

export async function withTransaction(fn) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
