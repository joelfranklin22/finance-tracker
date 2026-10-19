import { clerkClient, getAuth } from "@clerk/express";
import { one, query, uuid } from "./db.js";
import { HttpError } from "./lib/http.js";

// Verifies the Clerk token and creates the user row in MySQL on the first login.
export async function requireUser(req, res, next) {
  const { userId } = getAuth(req);
  if (!userId) throw new HttpError(401, "Unauthorized");

  let user = await one("SELECT * FROM users WHERE clerkUserId = ?", [userId]);
  if (!user) {
    const c = await clerkClient.users.getUser(userId);
    const name = [c.firstName, c.lastName].filter(Boolean).join(" ") || null;
    await query(
      "INSERT IGNORE INTO users (id, clerkUserId, email, name, imageUrl) VALUES (?, ?, ?, ?, ?)",
      [uuid(), userId, c.emailAddresses[0].emailAddress, name, c.imageUrl]
    );
    user = await one("SELECT * FROM users WHERE clerkUserId = ?", [userId]);
  }
  req.user = user;
  next();
}
