import { useEffect, useMemo, useState } from "react";
import ProductCard from "../../components/ProductCard";
import Alert from "../../components/ui/Alert";
import Empty from "../../components/ui/Empty";
import Spinner from "../../components/ui/Spinner";
import { BRAND_NAME, BRAND_TAGLINE } from "../../constants/brand";
import type { Category, Product } from "../../types";
import { apiFetch } from "../../utils/api";
import { normalizeId } from "../../utils/ids";

/**
 * Home browse: categories first; expand a category to see its products.
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
        label: c.categoryName,
        count: list.length,
        children:
          list.length === 0 ? (
            <Empty description="No products in this category yet" />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
        key: "uncategorized",
        label: "Other / uncategorized",
        count: uniqueExtra.length,
        children: (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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

  const toggle = (key: string) => {
    setActiveKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  return (
    <div>
      <section className="mb-8 rounded-3xl border border-[var(--line)] bg-gradient-to-br from-white via-[var(--brand-soft)]/40 to-white px-6 py-8 sm:px-8 sm:py-10">
        <h1 className="font-display m-0 text-5xl font-semibold tracking-tight sm:text-6xl">
          {BRAND_NAME}
        </h1>
        <p className="mt-3 max-w-2xl text-base text-[var(--ink-soft)] sm:text-lg">
          {BRAND_TAGLINE}. Expand a category to browse products, open any item
          for details, or add to cart when signed in as a customer.
        </p>
      </section>

      {error && <Alert type="error" message={error} className="mb-4" />}
      {loading && <Spinner />}
      {!loading && !error && categories.length === 0 && products.length === 0 && (
        <Empty description="No categories or products yet" />
      )}

      {!loading && panels.length > 0 && (
        <div className="space-y-3">
          {panels.map((panel) => {
            const open = activeKeys.includes(panel.key);
            return (
              <div
                key={panel.key}
                className="overflow-hidden rounded-2xl border border-[var(--line)] bg-white/80 backdrop-blur-sm"
              >
                <button
                  type="button"
                  onClick={() => toggle(panel.key)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left transition hover:bg-[var(--brand-soft)]/50 sm:px-5"
                >
                  <span className="font-display text-lg font-semibold">
                    {panel.label}
                    <span className="ml-2 text-sm font-normal text-[var(--muted)]">
                      ({panel.count})
                    </span>
                  </span>
                  <span
                    className={`text-[var(--brand)] transition ${open ? "rotate-45" : ""}`}
                  >
                    +
                  </span>
                </button>
                {open && (
                  <div className="border-t border-[var(--line)] px-4 py-4 sm:px-5 animate-fade-up">
                    {panel.children}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
