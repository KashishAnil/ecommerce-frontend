import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import Empty from "../../components/ui/Empty";
import { NumberInput } from "../../components/ui/Input";
import Spinner from "../../components/ui/Spinner";
import type { CartItem, CartResponse, Product } from "../../types";
import { apiFetch, formatMoney } from "../../utils/api";

function asProduct(item: CartItem): Product | null {
  return typeof item.product === "object" && item.product
    ? item.product
    : null;
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

  if (loading) return <Spinner />;

  return (
    <div>
      <h1 className="font-display m-0 text-3xl font-semibold sm:text-4xl">
        Your cart
      </h1>
      {error && <Alert className="mt-4" type="error" message={error} />}

      {items.length === 0 ? (
        <div className="mt-6">
          <Empty
            description={
              <span>
                Your cart is empty. <Link to="/">Browse products</Link>
              </span>
            }
          />
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-[var(--shadow)]">
          {items.map((item) => {
            const p = asProduct(item);
            const id = p?._id || String(item.product);
            return (
              <div
                key={id}
                className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] px-4 py-4 last:border-0 sm:px-5"
              >
                <div>
                  <p className="m-0 font-semibold text-[var(--ink)]">
                    {p?.productName || "Product"}
                  </p>
                  <p className="m-0 mt-1 text-sm text-[var(--muted)]">
                    {formatMoney(p?.price)} each · Line:{" "}
                    {formatMoney(lineTotal(item))}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <NumberInput
                    min={1}
                    value={item.quantity}
                    disabled={busyId === id}
                    className="w-20"
                    onValueChange={(v) => {
                      if (!Number.isNaN(v)) {
                        setItems((prev) =>
                          prev.map((it) =>
                            (asProduct(it)?._id || String(it.product)) === id
                              ? { ...it, quantity: v }
                              : it,
                          ),
                        );
                      }
                    }}
                  />
                  <Button
                    variant="secondary"
                    loading={busyId === id}
                    onClick={() => updateQty(id, item.quantity)}
                  >
                    Update
                  </Button>
                  <Button
                    variant="danger"
                    loading={busyId === id}
                    onClick={() => removeItem(id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            );
          })}

          <div className="bg-[var(--surface-2)] px-4 py-5 sm:px-5">
            <p className="font-display m-0 text-xl font-semibold">
              Cart total: {formatMoney(total)}
            </p>
            <Link to="/checkout" className="mt-3 inline-block no-underline">
              <Button>Go to checkout</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
