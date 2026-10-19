import { request } from "@/lib/api-client";
import { queryClient } from "@/lib/query-client";

// Equivalent of revalidatePath(): refetch everything that is on screen.
const refresh = () => queryClient.invalidateQueries();

export async function getUserAccounts() {
  return (await request("/accounts")).data;
}

export async function createAccount(data) {
  const result = await request("/accounts", { method: "POST", body: data });
  refresh();
  return result; // { success: true, data }
}

export async function getAccountWithTransactions(accountId) {
  try {
    return (await request(`/accounts/${accountId}`)).data;
  } catch (error) {
    if (error.status === 404) return null; // page shows "Not Found"
    throw error;
  }
}

export async function updateDefaultAccount(accountId) {
  const result = await request(`/accounts/${accountId}/default`, {
    method: "PATCH",
  });
  refresh();
  return result; // { success: true, data }
}
