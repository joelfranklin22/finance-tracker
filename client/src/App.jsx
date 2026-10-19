import { Route, Routes, useNavigate } from "react-router";
import { ClerkProvider } from "@clerk/clerk-react";

import RootLayout from "@/app/layout";
import AuthLayout from "@/app/(auth)/layout";
import MainLayout from "@/app/(main)/layout";
import ProtectedRoute from "@/components/protected-route";

import LandingPage from "@/app/page";
import SignInPage from "@/app/(auth)/sign-in/page";
import SignUpPage from "@/app/(auth)/sign-up/page";
import DashboardPage from "@/app/(main)/dashboard/page";
import AccountPage from "@/app/(main)/account/[id]/page";
import AddTransactionPage from "@/app/(main)/transaction/create/page";
import NotFound from "@/app/not-found";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Placeholder from client/.env.example (or nothing at all) -> show instructions instead of a blank page
const isKeyMissing = !PUBLISHABLE_KEY || PUBLISHABLE_KEY.startsWith("YOUR_");

export default function App() {
  const navigate = useNavigate();

  if (isKeyMissing) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 text-center">
        <div className="max-w-md space-y-2">
          <h1 className="text-2xl font-semibold">Clerk key missing</h1>
          <p className="text-gray-600">
            Set <code>VITE_CLERK_PUBLISHABLE_KEY</code> in{" "}
            <code>client/.env</code> to your Clerk publishable key, then restart{" "}
            <code>npm run dev</code>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      afterSignOutUrl="/"
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      routerPush={(to) => navigate(to)}
      routerReplace={(to) => navigate(to, { replace: true })}
    >
      <Routes>
        <Route element={<RootLayout />}>
          <Route index element={<LandingPage />} />

          {/* (auth) group */}
          <Route element={<AuthLayout />}>
            <Route path="/sign-in/*" element={<SignInPage />} />
            <Route path="/sign-up/*" element={<SignUpPage />} />
          </Route>

          {/* (main) group - requires a signed-in user */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/account/:id" element={<AccountPage />} />
              <Route
                path="/transaction/create"
                element={<AddTransactionPage />}
              />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </ClerkProvider>
  );
}
