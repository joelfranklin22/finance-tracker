import { request } from "@/lib/api-client";

export async function getDashboardData() {
  return (await request("/transactions")).data;
}
