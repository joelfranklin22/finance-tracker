import { request } from "@/lib/api-client";
import { queryClient } from "@/lib/query-client";

// Equivalent of revalidatePath(): refetch everything that is on screen.
const refresh = () => queryClient.invalidateQueries();

export async function getCurrentBudget(accountId) {
  return (await request(`/budget?accountId=${encodeURIComponent(accountId)}`))
    .data; // { budget, currentExpenses }
}

export async function updateBudget(amount) {
  const result = await request("/budget", { method: "PUT", body: { amount } });
  refresh();
  return result; // { success: true, data }
}
