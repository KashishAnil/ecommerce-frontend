import { Alert, Button, Empty, InputNumber, Spin, Typography } from "antd";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
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
      // Backend returns an error when no cart exists yet
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

  if (loading) {
    return (
      <div className="py-10 text-center">
        <Spin />
      </div>
    );
  }

  return (
    <div>
      <Typography.Title level={2}>Your cart</Typography.Title>
      {error && <Alert className="mb-4" type="error" message={error} showIcon />}

      {items.length === 0 ? (
        <Empty
          description={
            <span>
              Your cart is empty. <Link to="/">Browse products</Link>
            </span>
          }
        />
      ) : (
        <div className="bg-white border border-[#ddd4c8] p-4 rounded">
          {items.map((item) => {
            const p = asProduct(item);
            const id = p?._id || String(item.product);
            return (
              <div
                key={id}
                className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eee] py-4 last:border-0"
              >
                <div>
                  <Typography.Text strong>
                    {p?.productName || "Product"}
                  </Typography.Text>
                  <div>
                    <Typography.Text type="secondary">
                      {formatMoney(p?.price)} each · Line:{" "}
                      {formatMoney(lineTotal(item))}
                    </Typography.Text>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <InputNumber
                    min={1}
                    value={item.quantity}
                    disabled={busyId === id}
                    onChange={(v) => {
                      if (v != null) {
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
                    loading={busyId === id}
                    onClick={() => updateQty(id, item.quantity)}
                  >
                    Update
                  </Button>
                  <Button
                    danger
                    loading={busyId === id}
                    onClick={() => removeItem(id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            );
          })}

          <Typography.Title level={4} className="mt-4">
            Cart total: {formatMoney(total)}
          </Typography.Title>
          <Link to="/checkout">
            <Button type="primary">Go to checkout</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
