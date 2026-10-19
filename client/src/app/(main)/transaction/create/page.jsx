import { useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { BarLoader } from "react-spinners";

import { getTransaction } from "@/actions/transaction";
import { getUserAccounts } from "@/actions/account";
import { defaultCategories } from "@/data/categories";
import { AddTransactionForm } from "./_components/transaction-form";

// Replaces app/(main)/transaction/create/page.jsx
export default function AddTransactionPage() {
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");

  const accountsQuery = useQuery({
    queryKey: ["accounts"],
    queryFn: getUserAccounts,
  });

  const transactionQuery = useQuery({
    queryKey: ["transaction", editId],
    queryFn: () => getTransaction(editId),
    enabled: !!editId,
  });

  const isLoading =
    accountsQuery.isPending || (!!editId && transactionQuery.isPending);
  const error = accountsQuery.error || transactionQuery.error;

  return (
    <div className="max-w-3xl mx-auto px-5">
      <div className="flex justify-center md:justify-normal mb-8">
        <h1 className="text-5xl gradient-title ">Add Transaction</h1>
      </div>

      {isLoading ? (
        <BarLoader className="mt-4" width={"100%"} color="#9333ea" />
      ) : error ? (
        <p className="text-red-500">{error.message}</p>
      ) : (
        // key: the form reads its defaultValues once, so remount when switching between add / edit
        <AddTransactionForm
          key={editId || "new"}
          accounts={accountsQuery.data}
          categories={defaultCategories}
          editMode={!!editId}
          initialData={editId ? transactionQuery.data : null}
        />
      )}
    </div>
  );
}
