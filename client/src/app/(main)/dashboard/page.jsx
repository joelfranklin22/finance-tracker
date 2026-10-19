import { useQuery } from "@tanstack/react-query";
import { BarLoader } from "react-spinners";
import { Plus } from "lucide-react";

import { getCurrentBudget } from "@/actions/budget";
import { getDashboardData } from "@/actions/dashboard";
import { getUserAccounts } from "@/actions/account";
import { CreateAccountDrawer } from "@/components/create-account-drawer";
import { Card, CardContent } from "@/components/ui/card";
import { AccountCard } from "./_components/account-card";
import { BudgetProgress } from "./_components/budget-progress";
import { DashboardOverview } from "./_components/transaction-overview";

// Replaces app/(main)/dashboard/layout.js + page.jsx
export default function DashboardPage() {
  const accountsQuery = useQuery({
    queryKey: ["accounts"],
    queryFn: getUserAccounts,
  });
  const transactionsQuery = useQuery({
    queryKey: ["dashboard-transactions"],
    queryFn: getDashboardData,
  });

  const accounts = accountsQuery.data;
  const defaultAccount = accounts?.find((account) => account.isDefault);

  // Budget for the default account
  const budgetQuery = useQuery({
    queryKey: ["budget", defaultAccount?.id],
    queryFn: () => getCurrentBudget(defaultAccount.id),
    enabled: !!defaultAccount,
  });

  const isLoading =
    accountsQuery.isPending ||
    transactionsQuery.isPending ||
    (!!defaultAccount && budgetQuery.isPending);
  const error =
    accountsQuery.error || transactionsQuery.error || budgetQuery.error;

  const budgetData = budgetQuery.data;

  return (
    <div className="px-5">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-6xl font-bold tracking-tight gradient-title">
          Dashboard
        </h1>
      </div>

      {isLoading ? (
        <BarLoader className="mt-4" width={"100%"} color="#9333ea" />
      ) : error ? (
        <p className="text-red-500">{error.message}</p>
      ) : (
        <div className="space-y-8">
          {/* Budget Progress */}
          <BudgetProgress
            initialBudget={budgetData?.budget}
            currentExpenses={budgetData?.currentExpenses || 0}
          />

          {/* Dashboard Overview */}
          <DashboardOverview
            accounts={accounts}
            transactions={transactionsQuery.data || []}
          />

          {/* Accounts Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <CreateAccountDrawer>
              <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed">
                <CardContent className="flex flex-col items-center justify-center text-muted-foreground h-full pt-5">
                  <Plus className="h-10 w-10 mb-2" />
                  <p className="text-sm font-medium">Add New Account</p>
                </CardContent>
              </Card>
            </CreateAccountDrawer>
            {accounts.length > 0 &&
              accounts.map((account) => (
                <AccountCard key={account.id} account={account} />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
