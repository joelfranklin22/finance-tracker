import { z } from "zod";

// Server-side validation (the client has its own copy for form UX).

export const accountInput = z.object({
  name: z.string().trim().min(1, "Name is required"),
  type: z.enum(["CURRENT", "SAVINGS"]),
  balance: z.coerce
    .number({ invalid_type_error: "Invalid balance amount" })
    .finite("Invalid balance amount"),
  isDefault: z.boolean().optional().default(false),
});

export const transactionInput = z
  .object({
    type: z.enum(["INCOME", "EXPENSE"]),
    amount: z
      .number({ invalid_type_error: "Amount must be a number" })
      .positive("Amount must be greater than 0"),
    description: z.string().nullish(),
    date: z.coerce.date({ invalid_type_error: "Invalid date" }),
    accountId: z.string().min(1, "Account is required"),
    category: z.string().min(1, "Category is required"),
    isRecurring: z.boolean().optional().default(false),
    recurringInterval: z
      .enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"])
      .nullish(),
  })
  .superRefine((data, ctx) => {
    if (data.isRecurring && !data.recurringInterval) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Recurring interval is required for recurring transactions",
        path: ["recurringInterval"],
      });
    }
  });

export const bulkDeleteInput = z.object({
  ids: z.array(z.string().min(1)).min(1, "No transactions selected"),
});

export const budgetInput = z.object({
  amount: z
    .number({ invalid_type_error: "Please enter a valid amount" })
    .positive("Please enter a valid amount"),
});
