import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import { Alert } from "../../components/ui/Alert";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { QuantityInput } from "../../components/ui/QuantityInput";
import { PageSpinner } from "../../components/ui/Spinner";
import type { CartItem, CartResponse, Product } from "../../types";
import { apiFetch, formatMoney } from "../../utils/api";

function asProduct(item: CartItem): Product | null {
  return typeof item.product === "object" && item.product ? item.product : null;
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadCart = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch<CartResponse>("/cart");
      setItems(data.cartExists?.items || []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load cart";
      if (/empty/i.test(msg)) {
        setItems([]);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const lineTotal = (item: CartItem) => {
    const p = asProduct(item);
    return (p?.price ?? 0) * (item.quantity ?? 0);
  };

  const total = items.reduce((sum, item) => sum + lineTotal(item), 0);

  const updateQty = async (productId: string, quantity: number) => {
    setBusyId(productId);
    setError("");
    try {
      await apiFetch(`/cart/${productId}`, {
        method: "PUT",
        body: JSON.stringify({ quantity }),
      });
      await loadCart();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusyId(null);
    }
  };

  const removeItem = async (productId: string) => {
    setBusyId(productId);
    setError("");
    try {
      await apiFetch(`/cart/${productId}`, { method: "DELETE" });
      await loadCart();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Remove failed");
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <PageSpinner />;

  return (
    <div className="animate-fade-up">
      <h1 className="font-display text-4xl tracking-tight text-ink">Your cart</h1>
      {error && <Alert className="mt-4" type="error">{error}</Alert>}

      {items.length === 0 ? (
        <div className="mt-8">
          <EmptyState>
            Your cart is empty. <Link to="/">Browse products</Link>
          </EmptyState>
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-3xl border border-line bg-cream shadow-card">
          {items.map((item) => {
            const p = asProduct(item);
            const id = p?._id || String(item.product);
            const busy = busyId === id;
            return (
              <div
                key={id}
                className="flex flex-wrap items-center gap-4 border-b border-line px-5 py-5 last:border-0"
              >
                {p?.imageURL ? (
                  <img
                    src={p.imageURL}
                    alt=""
                    className="h-16 w-16 rounded-xl object-cover bg-paper"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-xl bg-paper" />
                )}
                <div className="min-w-40 flex-1">
                  <p className="font-medium text-ink">{p?.productName || "Product"}</p>
                  <p className="text-sm text-muted">
                    {formatMoney(p?.price)} each · Line: {formatMoney(lineTotal(item))}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <QuantityInput
                    value={item.quantity}
                    min={1}
                    disabled={busy}
                    onChange={(v) => {
                      setItems((prev) =>
                        prev.map((it) =>
                          (asProduct(it)?._id || String(it.product)) === id
                            ? { ...it, quantity: v }
                            : it,
                        ),
                      );
                    }}
                  />
                  <Button variant="secondary" loading={busy} onClick={() => updateQty(id, item.quantity)}>
                    Update
                  </Button>
                  <Button variant="danger-ghost" loading={busy} onClick={() => removeItem(id)}>
                    Remove
                  </Button>
                </div>
              </div>
            );
          })}

          <div className="flex flex-wrap items-center justify-between gap-4 bg-paper/70 px-5 py-5">
            <p className="font-display text-2xl text-ink">Total {formatMoney(total)}</p>
            <Link to="/checkout" className="no-underline">
              <Button size="lg">Go to checkout</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
