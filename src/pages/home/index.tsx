import { Alert, Collapse, Empty, Spin, Typography } from "antd";
import { useEffect, useMemo, useState } from "react";
import ProductCard from "../../components/ProductCard";
import type { Category, Product } from "../../types";
import { apiFetch } from "../../utils/api";
import { normalizeId } from "../../utils/ids";

/**
 * Home browse: categories first; expand a category to see its products.
 * Product actions (details, cart qty, seller delete) live on each card.
 */
export default function ProductsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeKeys, setActiveKeys] = useState<string[]>([]);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [cats, prods] = await Promise.all([
        apiFetch<Category[]>("/categories"),
        apiFetch<Product[]>("/products"),
      ]);
      setCategories(cats || []);
      setProducts((prods || []).filter((p) => p.isActive !== false));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load shop data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const productsByCategory = useMemo(() => {
    const map = new Map<string, Product[]>();
    for (const p of products) {
      const catId = normalizeId(p.category) || "uncategorized";
      const list = map.get(catId) || [];
      list.push(p);
      map.set(catId, list);
    }
    return map;
  }, [products]);

  const panels = useMemo(() => {
    const items = categories.map((c) => {
      const list = productsByCategory.get(c._id) || [];
      return {
        key: c._id,
        label: `${c.categoryName} (${list.length})`,
        children:
          list.length === 0 ? (
            <Empty description="No products in this category yet" />
          ) : (
            <div className="grid gap-3">
              {list.map((p) => (
                <ProductCard
                  key={p._id}
                  product={p}
                  onDeleted={(id) =>
                    setProducts((prev) => prev.filter((x) => x._id !== id))
                  }
                />
              ))}
            </div>
          ),
      };
    });

    const orphan = productsByCategory.get("uncategorized") || [];
    // Also catch products whose category id is not in the categories list
    const knownIds = new Set(categories.map((c) => c._id));
    const unmatched = products.filter((p) => {
      const id = normalizeId(p.category);
      return id && !knownIds.has(id) && id !== "uncategorized";
    });
    const extra = [...orphan, ...unmatched];
    // dedupe
    const seen = new Set<string>();
    const uniqueExtra = extra.filter((p) => {
      if (seen.has(p._id)) return false;
      seen.add(p._id);
      return true;
    });

    if (uniqueExtra.length > 0) {
      items.push({
        key: "uncategorized",
        label: `Other / uncategorized (${uniqueExtra.length})`,
        children: (
          <div className="grid gap-3">
            {uniqueExtra.map((p) => (
              <ProductCard
                key={p._id}
                product={p}
                onDeleted={(id) =>
                  setProducts((prev) => prev.filter((x) => x._id !== id))
                }
              />
            ))}
          </div>
        ),
      });
    }

    return items;
  }, [categories, productsByCategory, products]);

  return (
    <div>
      <Typography.Title level={2}>Shop by category</Typography.Title>
      <Typography.Paragraph type="secondary">
        Expand a category to see its products. Open a product for full details,
        or add to cart / delete right here when you have permission.
      </Typography.Paragraph>

      {error && <Alert type="error" message={error} showIcon className="mb-4" />}
      {loading && (
        <div className="py-10 text-center">
          <Spin />
        </div>
      )}
      {!loading && !error && categories.length === 0 && products.length === 0 && (
        <Empty description="No categories or products yet" />
      )}

      {!loading && panels.length > 0 && (
        <Collapse
          accordion={false}
          activeKey={activeKeys}
          onChange={(keys) =>
            setActiveKeys(Array.isArray(keys) ? keys : [keys])
          }
          items={panels}
        />
      )}
    </div>
  );
}
