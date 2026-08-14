import { useState, type FormEvent } from "react";
import { Link } from "react-router";
import { asProduct, useShop } from "../context/ShopContext";
import { useAppSelector } from "../hooks/redux";
import type { Order } from "../types";
import { apiFetch, appUrl, formatMoney } from "../utils/api";
import { Alert } from "./ui/Alert";
import { Button } from "./ui/Button";
import { Field, Input } from "./ui/Field";
import { PageSpinner } from "./ui/Spinner";

export default function CartDrawer() {
  const { token, role } = useAppSelector((s) => s.auth);
  const {
    cartOpen,
    setCartOpen,
    cartItems,
    cartTotal,
    cartLoading,
    refreshCart,
  } = useShop();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [checkingOut, setCheckingOut] = useState(false);
  const [showShip, setShowShip] = useState(false);

  const canUseCart = Boolean(token) && role === "Customer";

  const removeItem = async (productId: string) => {
    setBusyId(productId);
    setError("");
    try {
      await apiFetch(`/cart/${productId}`, { method: "DELETE" });
      await refreshCart();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Remove failed");
    } finally {
      setBusyId(null);
    }
  };

  const payWithStripe = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setError("");
    setCheckingOut(true);
    try {
      const order = await apiFetch<Order>("/orders", {
        method: "POST",
        body: JSON.stringify({
          shippingAddress: {
            street: String(form.get("street") || ""),
            city: String(form.get("city") || ""),
            country: String(form.get("country") || ""),
          },
        }),
      });
      const payment = await apiFetch<{ checkoutUrl: string }>(
        `/payments/checkout/${order._id}`,
        {
          method: "POST",
          body: JSON.stringify({
            successUrl: appUrl("/success"),
            cancelUrl: appUrl("/"),
          }),
        },
      );
      if (!payment.checkoutUrl) {
        throw new Error("No checkout URL returned from the server.");
      }
      window.location.href = payment.checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
      setCheckingOut(false);
    }
  };

  if (!cartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Close cart"
        className="absolute inset-0 bg-ink/40"
        onClick={() => setCartOpen(false)}
      />
      <aside className="relative flex h-full w-full max-w-md flex-col bg-cream shadow-lift animate-fade-up">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-display m-0 text-2xl text-ink">Your cart</h2>
          <button
            type="button"
            onClick={() => setCartOpen(false)}
            className="grid h-9 w-9 place-items-center rounded-full text-ink hover:bg-paper"
            aria-label="Close cart"
          >
            ×
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {!canUseCart && (
            <div className="rounded-2xl border border-dashed border-line bg-paper px-4 py-10 text-center">
              <p className="m-0 text-sm text-muted">Log in as a customer to view your cart.</p>
              <Link to="/login" className="mt-4 inline-block no-underline" onClick={() => setCartOpen(false)}>
                <Button>Log in</Button>
              </Link>
            </div>
          )}

          {canUseCart && cartLoading && <PageSpinner />}

          {canUseCart && !cartLoading && cartItems.length === 0 && (
            <p className="py-10 text-center text-sm text-muted">Your cart is empty.</p>
          )}

          {canUseCart &&
            cartItems.map((item) => {
              const p = asProduct(item);
              const id = p?._id || String(item.product);
              return (
                <div key={id} className="flex gap-3 border-b border-line py-4 last:border-0">
                  {p?.imageURL ? (
                    <img src={p.imageURL} alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover bg-paper" />
                  ) : (
                    <div className="h-16 w-16 shrink-0 rounded-xl bg-paper" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-ink">{p?.productName || "Product"}</p>
                    <p className="mt-1 text-sm text-muted">
                      {formatMoney(p?.price)} × {item.quantity}
                    </p>
                    <p className="mt-0.5 text-sm font-medium text-brass">
                      {formatMoney((p?.price ?? 0) * (item.quantity ?? 0))}
                    </p>
                  </div>
                  <Button
                    variant="danger-ghost"
                    size="sm"
                    loading={busyId === id}
                    onClick={() => removeItem(id)}
                  >
                    Remove
                  </Button>
                </div>
              );
            })}

          {error && <Alert className="mt-3" type="error">{error}</Alert>}
        </div>

        {canUseCart && cartItems.length > 0 && (
          <div className="border-t border-line bg-paper/80 px-5 py-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-muted">Total</span>
              <span className="font-display text-xl text-ink">{formatMoney(cartTotal)}</span>
            </div>
            {!showShip ? (
              <Button block onClick={() => setShowShip(true)}>
                Checkout
              </Button>
            ) : (
              <form onSubmit={payWithStripe} className="space-y-3">
                <Field label="Street" htmlFor="ship-street">
                  <Input id="ship-street" name="street" required />
                </Field>
                <Field label="City" htmlFor="ship-city">
                  <Input id="ship-city" name="city" required />
                </Field>
                <Field label="Country" htmlFor="ship-country">
                  <Input id="ship-country" name="country" required />
                </Field>
                <Button type="submit" loading={checkingOut} block>
                  {checkingOut ? "Redirecting to Stripe…" : "Pay with Stripe"}
                </Button>
              </form>
            )}
          </div>
        )}
      </aside>
    </div>
  );
}
