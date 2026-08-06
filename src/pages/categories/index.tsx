import { Alert, Empty, Spin, Typography } from "antd";
import { useEffect, useState } from "react";
import type { Category } from "../../types";
import { apiFetch } from "../../utils/api";

/** Public list of all categories from GET /categories. */
export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await apiFetch<Category[]>("/categories");
        if (!cancelled) setCategories(data || []);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load categories",
          );
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
      <Typography.Title level={2}>Categories</Typography.Title>
      <Typography.Paragraph type="secondary">
        All product categories from the store.
      </Typography.Paragraph>

      {error && <Alert className="mb-4" type="error" message={error} showIcon />}
      {loading && (
        <div className="py-10 text-center">
          <Spin />
        </div>
      )}
      {!loading && !error && categories.length === 0 && (
        <Empty description="No categories yet. Sellers can create them when adding a product." />
      )}

      <ul className="list-none p-0 m-0 grid gap-3">
        {categories.map((c) => (
          <li
            key={c._id}
            className="bg-white border border-[#ddd4c8] rounded px-4 py-3"
          >
            <Typography.Text strong>{c.categoryName}</Typography.Text>
          </li>
        ))}
      </ul>
    </div>
  );
}
