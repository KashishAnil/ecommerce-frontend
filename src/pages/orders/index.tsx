import { useEffect, useState } from "react";
import { Link } from "react-router";
import Alert from "../../components/ui/Alert";
import Empty from "../../components/ui/Empty";
import Spinner from "../../components/ui/Spinner";
import type { Order } from "../../types";
import { apiFetch, formatMoney } from "../../utils/api";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await apiFetch<Order[]>("/orders");
        if (!cancelled) {
          const sorted = [...(data || [])].sort(
            (a, b) =>
              new Date(b.createdAt || 0).getTime() -
              new Date(a.createdAt || 0).getTime(),
          );
          setOrders(sorted);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load orders");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <Spinner />;

  return (
    <div>
      <h1 className="font-display m-0 text-3xl font-semibold sm:text-4xl">
        Your orders
      </h1>
      {error && <Alert className="mt-4" type="error" message={error} />}

      {!error && orders.length === 0 && (
        <div className="mt-6">
          <Empty
            description={
              <span>
                No orders yet. <Link to="/">Start shopping</Link>
              </span>
            }
          />
        </div>
      )}

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {orders.map((o) => (
          <article
            key={o._id}
            className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-[var(--shadow)]"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <p className="m-0 font-semibold">Order {o._id}</p>
              <span className="rounded-full bg-[var(--brand-soft)] px-2.5 py-0.5 text-xs font-medium text-[var(--brand-deep)]">
                {o.paymentStatus || "unknown"}
              </span>
            </div>
            <p className="m-0 mt-1 text-sm text-[var(--muted)]">
              {o.createdAt ? new Date(o.createdAt).toLocaleString() : ""}
            </p>
            <p className="mt-3 mb-1 font-display text-lg font-semibold">
              Total: {formatMoney(o.totalPrice)}
            </p>
            <p className="m-0 text-sm text-[var(--muted)]">
              Ship to: {o.shippingAddress?.street}, {o.shippingAddress?.city},{" "}
              {o.shippingAddress?.country}
            </p>
            <ul className="mt-3 mb-0 space-y-1 pl-5 text-sm text-[var(--ink-soft)]">
              {(o.items || []).map((i, idx) => (
                <li key={idx}>
                  {i.name} × {i.quantity} — {formatMoney(i.priceAtPurchase)}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  );
}
