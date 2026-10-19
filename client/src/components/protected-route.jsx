import { Outlet } from "react-router";
import { RedirectToSignIn, useAuth } from "@clerk/clerk-react";
import { BarLoader } from "react-spinners";

// Replaces the Clerk middleware that protected /dashboard, /account and /transaction.
export default function ProtectedRoute() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <div className="pt-32 px-5">
        <BarLoader width={"100%"} color="#9333ea" />
      </div>
    );
  }

  if (!isSignedIn) return <RedirectToSignIn />;

  return <Outlet />;
}
