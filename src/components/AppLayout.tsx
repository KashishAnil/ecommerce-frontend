import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router";
import { useShop } from "../context/ShopContext";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { logout } from "../redux/slices/authSlice";
import { cn } from "../utils/cn";
import CartDrawer from "./CartDrawer";
import { Button } from "./ui/Button";

function CartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M6 6h15l-1.5 9h-12z" />
      <path d="M6 6 5 3H2" />
      <circle cx="9" cy="20" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="18" cy="20" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function AppLayout() {
  const { token, role } = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [expanded, setExpanded] = useState(true);
  const { categories, cartCount, setCartOpen } = useShop();
  const isSeller = Boolean(token) && role === "Seller";

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setExpanded(false);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const closeMobile = () => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setExpanded(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {expanded && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-30 bg-ink/35 md:hidden"
          onClick={() => setExpanded(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col bg-forest text-cream transition-all duration-300",
          expanded ? "w-72 translate-x-0" : "w-16",
          !expanded && "max-md:-translate-x-full max-md:w-72",
        )}
      >
        <div className={cn("flex h-16 shrink-0 items-center border-b border-white/15 px-3", expanded ? "justify-end" : "justify-center")}>
          <button
            type="button"
            aria-expanded={expanded}
            aria-label={expanded ? "Collapse menu" : "Expand menu"}
            onClick={() => setExpanded((v) => !v)}
            className="grid h-9 w-9 place-items-center rounded-xl bg-white/15 text-cream hover:bg-white/25"
          >
            <span className="flex flex-col gap-1" aria-hidden>
              <span className={cn("block h-0.5 w-4 rounded-full bg-current transition", expanded && "translate-y-1.5 rotate-45")} />
              <span className={cn("block h-0.5 w-4 rounded-full bg-current transition", expanded && "opacity-0")} />
              <span className={cn("block h-0.5 w-4 rounded-full bg-current transition", expanded && "-translate-y-1.5 -rotate-45")} />
            </span>
          </button>
        </div>

        <nav className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto px-2 py-3">
            {expanded && (
              <div className="mb-2 flex items-center justify-between gap-2 px-2">
                <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.16em] text-cream/70">
                  Categories
                </p>
                {isSeller && (
                  <Link
                    to="/seller/category"
                    onClick={closeMobile}
                    className="shrink-0 rounded-full bg-cream px-2.5 py-1 text-[11px] font-semibold text-forest no-underline hover:bg-white"
                  >
                    Add Category
                  </Link>
                )}
              </div>
            )}
            {!expanded && isSeller && (
              <Link
                to="/seller/category"
                title="Add Category"
                className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-xl bg-cream text-sm font-bold text-forest no-underline"
              >
                +
              </Link>
            )}
            {categories.length === 0 && expanded && (
              <p className="px-3 text-sm text-cream/70">No categories yet</p>
            )}
            {categories.map((c) => {
              const active =
                location.pathname === "/" && location.hash === `#cat-${c._id}`;
              return (
                <div key={c._id} className="mb-1 flex items-center gap-1">
                  <Link
                    to={{ pathname: "/", hash: `cat-${c._id}` }}
                    title={c.categoryName}
                    onClick={closeMobile}
                    className={cn(
                      "min-w-0 flex-1 truncate rounded-xl px-3 py-2.5 text-sm font-semibold no-underline",
                      !expanded && "px-0 text-center",
                    )}
                    style={{
                      background: active ? "#fffcf7" : "transparent",
                      color: active ? "#1a4738" : "#fffcf7",
                    }}
                  >
                    {expanded ? c.categoryName : c.categoryName.slice(0, 1)}
                  </Link>
                  {isSeller && expanded && (
                    <Link
                      to={`/seller/products?category=${c._id}`}
                      title={`Add product to ${c.categoryName}`}
                      onClick={closeMobile}
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/15 text-lg font-semibold leading-none text-cream no-underline hover:bg-cream hover:text-forest"
                    >
                      +
                    </Link>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-auto space-y-1 border-t border-white/15 px-2 py-3">
            {token && role === "Customer" && (
              <NavLink
                to="/orders"
                onClick={closeMobile}
                className={({ isActive }) =>
                  cn(
                    "flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-semibold no-underline",
                    !expanded && "justify-center px-0",
                    isActive ? "bg-cream" : "hover:bg-white/15",
                  )
                }
                style={({ isActive }) => ({
                  color: isActive ? "#1a4738" : "#fffcf7",
                })}
              >
                {expanded ? "Orders" : "O"}
              </NavLink>
            )}
            {token && (
              <button
                type="button"
                onClick={handleLogout}
                className={cn(
                  "flex w-full items-center rounded-xl py-2.5 text-sm font-semibold text-cream hover:bg-white/15",
                  expanded ? "px-3 text-left" : "justify-center px-0",
                )}
              >
                {expanded ? "Logout" : "⎋"}
              </button>
            )}
          </div>
        </nav>
      </aside>

      <div
        className={cn("hidden shrink-0 transition-all duration-300 md:block", expanded ? "w-72" : "w-16")}
        aria-hidden
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-line/80 bg-cream/85 backdrop-blur-xl">
          <div className="relative flex h-16 items-center px-4 sm:px-6">
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setExpanded(true)}
              className="grid h-9 w-9 place-items-center rounded-xl border border-line bg-cream text-ink md:hidden"
            >
              <span className="flex flex-col gap-1" aria-hidden>
                <span className="block h-0.5 w-4 rounded-full bg-current" />
                <span className="block h-0.5 w-4 rounded-full bg-current" />
                <span className="block h-0.5 w-4 rounded-full bg-current" />
              </span>
            </button>

            <Link
              to="/"
              className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2 text-ink no-underline hover:text-forest"
            >
              <span className="grid h-8 w-8 place-items-center rounded-full bg-forest text-cream">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M12 2c.4 4.2-2 7-5.2 8.4C10.4 12 12 15.2 12 22c0-6.8 1.6-10 5.2-11.6C14 9 11.6 6.2 12 2Z" />
                </svg>
              </span>
              <span className="font-display text-2xl tracking-tight">Grove</span>
            </Link>

            <div className="ml-auto flex items-center gap-2">
              {!token && (
                <Link to="/login" className="no-underline">
                  <Button size="sm" variant="secondary">
                    Login
                  </Button>
                </Link>
              )}
              {role !== "Seller" && (
                <button
                  type="button"
                  aria-label="Open cart"
                  onClick={() => setCartOpen(true)}
                  className="relative grid h-10 w-10 place-items-center rounded-full border border-line bg-cream text-ink hover:bg-paper"
                >
                  <CartIcon />
                  {cartCount > 0 && (
                    <span className="absolute -right-1 -top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-forest px-1 text-[10px] font-bold text-cream">
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>
        </header>

        <main className="w-full flex-1 px-4 py-6 sm:px-6 lg:px-8 animate-fade-up">
          <Outlet />
        </main>
      </div>

      <CartDrawer />
    </div>
  );
}
