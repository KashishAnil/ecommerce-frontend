import { Navigate, Outlet } from "react-router";
import { useAppSelector } from "../hooks/redux";
import type { UserRole } from "../redux/slices/authSlice";

/** Blocks the page unless the user is logged in. */
export function RequireAuth() {
  const token = useAppSelector((s) => s.auth.token);
  return token ? <Outlet /> : <Navigate to="/login" replace />;
}

/** Blocks the page unless the user has one of the allowed roles. */
export function RequireRole({ roles }: { roles: UserRole[] }) {
  const { token, role } = useAppSelector((s) => s.auth);
  if (!token) return <Navigate to="/login" replace />;
  if (!roles.includes(role)) return <Navigate to="/" replace />;
  return <Outlet />;
}
