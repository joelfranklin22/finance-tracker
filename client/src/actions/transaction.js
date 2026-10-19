import { request } from "@/lib/api-client";
import { queryClient } from "@/lib/query-client";

// Equivalent of revalidatePath(): refetch everything that is on screen.
const refresh = () => queryClient.invalidateQueries();

export async function createTransaction(data) {
  const result = await request("/transactions", { method: "POST", body: data });
  refresh();
  return result; // { success: true, data }
}

export async function getTransaction(id) {
  return (await request(`/transactions/${id}`)).data;
}

export async function updateTransaction(id, data) {
  const result = await request(`/transactions/${id}`, {
    method: "PUT",
    body: data,
  });
  refresh();
  return result; // { success: true, data }
}

export async function bulkDeleteTransactions(transactionIds) {
  const result = await request("/transactions/bulk-delete", {
    method: "POST",
    body: { ids: transactionIds },
  });
  refresh();
  return result; // { success: true }
}

export async function scanReceipt(file) {
  const formData = new FormData();
  formData.append("receipt", file);
  return (await request("/transactions/scan-receipt", { method: "POST", formData }))
    .data; // { amount, date, description, category, merchantName }
}
