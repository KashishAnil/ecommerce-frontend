import { Alert, Button, Card, Empty, Spin, Typography } from "antd";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import type { Product } from "../../types";
import { apiFetch, formatMoney } from "../../utils/api";

/** Public product listing — no login required. */
export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await apiFetch<Product[]>("/products");
        if (!cancelled) {
          setProducts((data || []).filter((p) => p.isActive !== false));
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load products");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <Typography.Title level={2}>Products</Typography.Title>
      <Typography.Paragraph type="secondary">
        Browse without logging in. Log in as a Customer to add items to your cart.
      </Typography.Paragraph>

      {error && <Alert type="error" message={error} showIcon className="mb-4" />}
      {loading && (
        <div className="py-10 text-center">
          <Spin />
        </div>
      )}
      {!loading && !error && products.length === 0 && (
        <Empty description="No products yet" />
      )}

      <div className="grid gap-4">
        {products.map((p) => (
          <Card key={p._id} size="small">
            <Typography.Title level={4} className="mt-0!">
              {p.productName}
            </Typography.Title>
            <Typography.Text type="secondary">
              {formatMoney(p.price)} · Stock: {p.quantityAvailable ?? 0}
            </Typography.Text>
            <Typography.Paragraph className="mt-2 mb-3!">
              {(p.description || "").slice(0, 140)}
              {(p.description || "").length > 140 ? "…" : ""}
            </Typography.Paragraph>
            <Link to={`/products/${p._id}`}>
              <Button type="link" className="px-0!">
                View details
              </Button>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
