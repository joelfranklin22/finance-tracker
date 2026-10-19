import { Outlet } from "react-router";

// Replaces app/(main)/layout.js
export default function MainLayout() {
  return (
    <div className="container mx-auto my-32">
      <Outlet />
    </div>
  );
}
