import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Alert } from "../../components/ui/Alert";
import { EmptyState } from "../../components/ui/EmptyState";
import { PageSpinner } from "../../components/ui/Spinner";
import type { Order } from "../../types";
import { apiFetch, formatMoney } from "../../utils/api";

function statusTone(status?: string) {
  const value = (status || "unknown").toLowerCase();
  if (value.includes("paid") || value.includes("success")) {
    return "bg-success-bg text-success";
  }
  if (value.includes("fail") || value.includes("cancel")) {
    return "bg-error-bg text-error";
  }
  return "bg-paper text-muted";
}

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

  if (loading) return <PageSpinner />;

  return (
    <div className="animate-fade-up">
      <h1 className="font-display text-4xl tracking-tight text-ink">Your orders</h1>
      {error && <Alert className="mt-4" type="error">{error}</Alert>}

      {!error && orders.length === 0 && (
        <div className="mt-8">
          <EmptyState>
            No orders yet. <Link to="/">Start shopping</Link>
          </EmptyState>
        </div>
      )}

      <div className="mt-8 grid gap-4">
        {orders.map((o) => (
          <article
            key={o._id}
            className="rounded-2xl border border-line bg-cream p-5 shadow-card"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted">Order</p>
                <p className="mt-0.5 font-medium text-ink break-all">{o._id}</p>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusTone(o.paymentStatus)}`}
              >
                {o.paymentStatus || "unknown"}
              </span>
            </div>
            <p className="mt-2 text-sm text-muted">
              {o.createdAt ? new Date(o.createdAt).toLocaleString() : ""}
            </p>
            <p className="mt-3 font-display text-xl text-ink">{formatMoney(o.totalPrice)}</p>
            <p className="mt-1 text-sm text-muted">
              Ship to: {o.shippingAddress?.street}, {o.shippingAddress?.city},{" "}
              {o.shippingAddress?.country}
            </p>
            <ul className="mt-4 space-y-1 border-t border-line pt-3 text-sm text-ink">
              {(o.items || []).map((i, idx) => (
                <li key={idx} className="flex justify-between gap-3">
                  <span>
                    {i.name} × {i.quantity}
                  </span>
                  <span className="text-muted">{formatMoney(i.priceAtPurchase)}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  );
}
