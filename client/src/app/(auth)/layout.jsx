import { Outlet } from "react-router";

// Replaces app/(auth)/layout.js
export default function AuthLayout() {
  return (
    <div className="flex justify-center pt-40">
      <Outlet />
    </div>
  );
}
