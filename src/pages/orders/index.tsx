import { Alert, Card, Empty, Spin, Typography } from "antd";
import { useEffect, useState } from "react";
import { Link } from "react-router";
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

  if (loading) {
    return (
      <div className="py-10 text-center">
        <Spin />
      </div>
    );
  }

  return (
    <div>
      <Typography.Title level={2}>Your orders</Typography.Title>
      {error && <Alert className="mb-4" type="error" message={error} showIcon />}

      {!error && orders.length === 0 && (
        <Empty
          description={
            <span>
              No orders yet. <Link to="/">Start shopping</Link>
            </span>
          }
        />
      )}

      <div className="grid gap-4">
        {orders.map((o) => (
          <Card key={o._id} size="small">
            <Typography.Text strong>Order {o._id}</Typography.Text>
            <div>
              <Typography.Text type="secondary">
                {o.createdAt ? new Date(o.createdAt).toLocaleString() : ""} ·
                Payment: {o.paymentStatus || "unknown"}
              </Typography.Text>
            </div>
            <Typography.Paragraph className="mb-2! mt-2">
              Total: {formatMoney(o.totalPrice)}
            </Typography.Paragraph>
            <Typography.Text type="secondary">
              Ship to: {o.shippingAddress?.street}, {o.shippingAddress?.city},{" "}
              {o.shippingAddress?.country}
            </Typography.Text>
            <ul className="mt-2 mb-0 pl-5">
              {(o.items || []).map((i, idx) => (
                <li key={idx}>
                  {i.name} × {i.quantity} — {formatMoney(i.priceAtPurchase)}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  );
}
