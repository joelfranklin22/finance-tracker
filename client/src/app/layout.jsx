import { Outlet } from "react-router";
import { Toaster } from "sonner";

import Header from "@/components/header";
import ScrollToTop from "@/components/scroll-to-top";

// Replaces app/layout.js
export default function RootLayout() {
  return (
    <>
      <ScrollToTop />
      <Header />
      <main className="min-h-screen">
        <Outlet />
      </main>
      <Toaster richColors />
    </>
  );
}
