import { NavLink, Outlet, useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { logout } from "../redux/slices/authSlice";
import { cn } from "../utils/cn";
import { Button } from "./ui/Button";

function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        cn(
          "rounded-full px-3 py-1.5 text-sm transition-colors",
          isActive
            ? "bg-forest/10 font-medium text-forest"
            : "text-muted hover:bg-forest/10 hover:text-ink",
        )
      }
    >
      {label}
    </NavLink>
  );
}

export default function AppLayout() {
  const { token, role } = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-line/80 bg-cream/80 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <NavLink to="/" className="group flex items-center gap-2 no-underline">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-forest text-cream">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M12 2c.4 4.2-2 7-5.2 8.4C10.4 12 12 15.2 12 22c0-6.8 1.6-10 5.2-11.6C14 9 11.6 6.2 12 2Z" />
              </svg>
            </span>
            <span className="font-display text-xl tracking-tight text-ink group-hover:text-forest">
              Grove
            </span>
          </NavLink>

          <nav className="flex flex-wrap items-center gap-1">
            <NavItem to="/" label="Shop" />

            {!token && (
              <>
                <NavItem to="/login" label="Login" />
                <NavLink
                  to="/register"
                  className="ml-1 inline-flex h-9 items-center rounded-full bg-forest px-4 text-sm font-medium text-cream no-underline transition hover:bg-forest-hover"
                >
                  Join
                </NavLink>
              </>
            )}

            {token && role === "Customer" && (
              <>
                <NavItem to="/cart" label="Cart" />
                <NavItem to="/checkout" label="Checkout" />
                <NavItem to="/orders" label="Orders" />
              </>
            )}

            {token && role === "Seller" && (
              <NavItem to="/seller/products" label="Add product" />
            )}

            {token && (
              <div className="ml-2 flex items-center gap-2 border-l border-line pl-3">
                <span className="hidden text-xs text-muted sm:inline">
                  {role || "Account"}
                </span>
                <Button size="sm" variant="secondary" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <Outlet />
      </main>

      <footer className="border-t border-line/70 px-4 py-6 text-center text-xs text-muted">
        Grove · curated goods for everyday living
      </footer>
    </div>
  );
}
