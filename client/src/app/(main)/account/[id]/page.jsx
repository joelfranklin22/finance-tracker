import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { BarLoader } from "react-spinners";

import { getAccountWithTransactions } from "@/actions/account";
import NotFound from "@/app/not-found";
import { TransactionTable } from "./_components/transaction-table";
import { AccountChart } from "./_components/account-chart";

// Replaces app/(main)/account/[id]/page.jsx
export default function AccountPage() {
  const { id } = useParams();

  const { data: accountData, isPending, error } = useQuery({
    queryKey: ["account", id],
    queryFn: () => getAccountWithTransactions(id),
  });

  if (isPending) {
    return (
      <div className="px-5">
        <BarLoader className="mt-4" width={"100%"} color="#9333ea" />
      </div>
    );
  }

  if (error) {
    return <p className="px-5 text-red-500">{error.message}</p>;
  }

  // API answered 404 -> same as Next's notFound()
  if (!accountData) return <NotFound />;

  const { transactions, ...account } = accountData;

  return (
    <div className="space-y-8 px-5">
      <div className="flex gap-4 items-end justify-between">
        <div>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight gradient-title capitalize">
            {account.name}
          </h1>
          <p className="text-muted-foreground">
            {account.type.charAt(0) + account.type.slice(1).toLowerCase()}{" "}
            Account
          </p>
        </div>

        <div className="text-right pb-2">
          <div className="text-xl sm:text-2xl font-bold">
            ${parseFloat(account.balance).toFixed(2)}
          </div>
          <p className="text-sm text-muted-foreground">
            {account._count.transactions} Transactions
          </p>
        </div>
      </div>

      {/* Chart Section */}
      <AccountChart transactions={transactions} />

      {/* Transactions Table */}
      <TransactionTable transactions={transactions} />
    </div>
  );
}
