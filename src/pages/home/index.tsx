import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router";
import ProductCard from "../../components/ProductCard";
import { Alert } from "../../components/ui/Alert";
import { EmptyState } from "../../components/ui/EmptyState";
import { PageSpinner } from "../../components/ui/Spinner";
import { useShop } from "../../context/ShopContext";
import type { Product } from "../../types";
import { apiFetch } from "../../utils/api";
import { normalizeId } from "../../utils/ids";

export default function ProductsPage() {
  const { categories } = useShop();
  const location = useLocation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const prods = await apiFetch<Product[]>("/products");
        if (!cancelled) {
          setProducts((prods || []).filter((p) => p.isActive !== false));
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load shop data");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const id = location.hash.replace("#", "");
    if (!id || loading) return;
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [location.hash, loading, products, categories]);

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

  const sections = useMemo(() => {
    const items = categories.map((c) => ({
      key: `cat-${c._id}`,
      label: c.categoryName,
      products: productsByCategory.get(c._id) || [],
    }));

    const orphan = productsByCategory.get("uncategorized") || [];
    const knownIds = new Set(categories.map((c) => c._id));
    const unmatched = products.filter((p) => {
      const id = normalizeId(p.category);
      return id && !knownIds.has(id) && id !== "uncategorized";
    });
    const extra = [...orphan, ...unmatched];
    const seen = new Set<string>();
    const uniqueExtra = extra.filter((p) => {
      if (seen.has(p._id)) return false;
      seen.add(p._id);
      return true;
    });

    if (uniqueExtra.length > 0) {
      items.push({
        key: "cat-uncategorized",
        label: "Other",
        products: uniqueExtra,
      });
    }

    return items;
  }, [categories, productsByCategory, products]);

  const removeProduct = (id: string) =>
    setProducts((prev) => prev.filter((x) => x._id !== id));

  return (
    <div>
      {error && <Alert type="error" className="mb-6">{error}</Alert>}
      {loading && <PageSpinner />}
      {!loading && !error && categories.length === 0 && products.length === 0 && (
        <EmptyState>No categories or products yet.</EmptyState>
      )}

      {!loading &&
        sections.map((section) => (
          <section key={section.key} id={section.key} className="mb-10 scroll-mt-24">
            <h2 className="mb-4 font-display text-2xl tracking-tight text-ink sm:text-3xl">
              {section.label}
            </h2>
            {section.products.length === 0 ? (
              <EmptyState>No products in this category yet.</EmptyState>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {section.products.map((p) => (
                  <ProductCard key={p._id} product={p} onDeleted={removeProduct} />
                ))}
              </div>
            )}
          </section>
        ))}
    </div>
  );
}
