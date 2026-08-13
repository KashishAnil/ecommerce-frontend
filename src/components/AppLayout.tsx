import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router";
import { BRAND_NAME, BRAND_TAGLINE } from "../constants/brand";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { logout } from "../redux/slices/authSlice";
import Button from "./ui/Button";

type NavItem = {
  to: string;
  label: string;
  end?: boolean;
};

/**
 * Shared shell: collapsible left menu + main content.
 * Expand the sidebar to switch between Browse, Cart, Orders, etc.
 */
export default function AppLayout() {
  const { token, role } = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setExpanded(false);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const items: NavItem[] = [{ to: "/", label: "Browse", end: true }];

  if (!token) {
    items.push({ to: "/login", label: "Login" }, { to: "/register", label: "Register" });
  }

  if (token && role === "Customer") {
    items.push(
      { to: "/cart", label: "Cart" },
      { to: "/checkout", label: "Checkout" },
      { to: "/orders", label: "Orders" },
    );
  }

  if (token && role === "Seller") {
    items.push({ to: "/seller/products", label: "Add product" });
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    [
      "flex items-center rounded-xl px-3 py-2.5 text-sm font-medium no-underline transition-colors",
      isActive
        ? "bg-white/15 text-white"
        : "text-white/75 hover:bg-white/10 hover:text-white",
    ].join(" ");

  return (
    <div className="min-h-screen flex">
      {expanded && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-30 bg-[var(--ink)]/35 md:hidden"
          onClick={() => setExpanded(false)}
        />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-40 flex flex-col border-r border-white/10",
          "bg-[var(--brand-deep)] text-white transition-all duration-300 ease-out",
          expanded ? "w-64 translate-x-0" : "w-16",
          !expanded ? "max-md:-translate-x-full max-md:w-64" : "",
        ].join(" ")}
      >
        <div
          className={[
            "flex min-h-16 items-center gap-2 border-b border-white/10 px-3 py-3",
            expanded ? "justify-between" : "justify-center",
          ].join(" ")}
        >
          {expanded && (
            <Link
              to="/"
              className="min-w-0 no-underline hover:text-white"
            >
              <span className="font-display block text-2xl font-semibold leading-none tracking-tight text-white">
                {BRAND_NAME}
              </span>
              <span className="mt-1 block text-[11px] font-medium text-white/55 truncate">
                {BRAND_TAGLINE}
              </span>
            </Link>
          )}
          <button
            type="button"
            aria-expanded={expanded}
            aria-label={expanded ? "Collapse menu" : "Expand menu"}
            onClick={() => setExpanded((v) => !v)}
            className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20"
          >
            <span className="flex flex-col gap-1" aria-hidden>
              <span
                className={[
                  "block h-0.5 w-4 rounded-full bg-current transition",
                  expanded ? "translate-y-1.5 rotate-45" : "",
                ].join(" ")}
              />
              <span
                className={[
                  "block h-0.5 w-4 rounded-full bg-current transition",
                  expanded ? "opacity-0" : "",
                ].join(" ")}
              />
              <span
                className={[
                  "block h-0.5 w-4 rounded-full bg-current transition",
                  expanded ? "-translate-y-1.5 -rotate-45" : "",
                ].join(" ")}
              />
            </span>
          </button>
        </div>

        {!expanded && (
          <Link
            to="/"
            title={BRAND_NAME}
            className="mx-auto mt-3 hidden size-10 items-center justify-center rounded-xl bg-white/10 font-display text-sm font-semibold text-white no-underline md:flex"
          >
            N
          </Link>
        )}

        <nav
          className={[
            "flex-1 space-y-1 overflow-y-auto px-2 py-4",
            expanded
              ? "opacity-100"
              : "opacity-0 pointer-events-none md:opacity-100 md:pointer-events-auto",
          ].join(" ")}
        >
          {expanded ? (
            items.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
                {item.label}
              </NavLink>
            ))
          ) : (
            <div className="hidden md:flex flex-col items-center gap-2">
              {items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  title={item.label}
                  className={({ isActive }) =>
                    [
                      "flex size-10 items-center justify-center rounded-xl text-xs font-semibold no-underline transition",
                      isActive
                        ? "bg-white/15 text-white"
                        : "text-white/70 hover:bg-white/10 hover:text-white",
                    ].join(" ")
                  }
                >
                  {item.label.slice(0, 1)}
                </NavLink>
              ))}
            </div>
          )}
        </nav>

        <div className="border-t border-white/10 p-3">
          {expanded && (
            <div className="space-y-3 animate-fade-up">
              {token ? (
                <>
                  <p className="m-0 px-1 text-xs text-white/55">
                    {role === "Customer" || role === "Seller"
                      ? `Signed in as ${role}`
                      : `Signed in (${role || "unknown"})`}
                  </p>
                  <Button
                    size="sm"
                    variant="secondary"
                    block
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <p className="m-0 px-1 text-xs text-white/55">Not logged in</p>
              )}
            </div>
          )}
          {!expanded && token && (
            <button
              type="button"
              title="Logout"
              onClick={handleLogout}
              className="mx-auto hidden size-10 items-center justify-center rounded-xl bg-white/10 text-xs font-semibold text-white transition hover:bg-white/20 md:flex"
            >
              ⎋
            </button>
          )}
        </div>
      </aside>

      <div
        className={[
          "hidden shrink-0 transition-all duration-300 md:block",
          expanded ? "w-64" : "w-16",
        ].join(" ")}
        aria-hidden
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-[var(--line)]/70 bg-white/80 px-4 backdrop-blur-md md:hidden">
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setExpanded(true)}
            className="flex size-9 items-center justify-center rounded-xl border border-[var(--line)] bg-white text-[var(--ink)]"
          >
            <span className="flex flex-col gap-1" aria-hidden>
              <span className="block h-0.5 w-4 rounded-full bg-current" />
              <span className="block h-0.5 w-4 rounded-full bg-current" />
              <span className="block h-0.5 w-4 rounded-full bg-current" />
            </span>
          </button>
          <span className="font-display text-xl font-semibold tracking-tight">
            {BRAND_NAME}
          </span>
        </div>

        <main className="w-full flex-1 px-4 py-6 sm:px-6 lg:px-8 xl:px-10 animate-fade-up">
          <Outlet />
        </main>

        <footer className="border-t border-[var(--line)]/70 px-4 py-6 text-center text-xs text-[var(--muted)] sm:px-6">
          <span className="font-display text-sm font-semibold text-[var(--ink)]">
            {BRAND_NAME}
          </span>
          <span className="mx-2 text-[var(--line)]">·</span>
          {BRAND_TAGLINE}
        </footer>
      </div>
    </div>
  );
}
