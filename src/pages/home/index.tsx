import { useEffect, useMemo, useState } from "react";
import ProductCard from "../../components/ProductCard";
import { Alert } from "../../components/ui/Alert";
import { EmptyState } from "../../components/ui/EmptyState";
import { PageSpinner } from "../../components/ui/Spinner";
import type { Category, Product } from "../../types";
import { apiFetch } from "../../utils/api";
import { cn } from "../../utils/cn";
import { normalizeId } from "../../utils/ids";

export default function ProductsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeKeys, setActiveKeys] = useState<string[]>([]);
  const [openedDefault, setOpenedDefault] = useState(false);

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

  const sections = useMemo(() => {
    const items = categories.map((c) => ({
      key: c._id,
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
        key: "uncategorized",
        label: "Other",
        products: uniqueExtra,
      });
    }

    return items;
  }, [categories, productsByCategory, products]);

  const toggle = (key: string) => {
    setActiveKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  useEffect(() => {
    if (!loading && sections.length > 0 && !openedDefault) {
      setActiveKeys([sections[0].key]);
      setOpenedDefault(true);
    }
  }, [loading, sections, openedDefault]);

  const removeProduct = (id: string) =>
    setProducts((prev) => prev.filter((x) => x._id !== id));

  return (
    <div className="animate-fade-up">
      <div className="mb-10 max-w-2xl">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-brass">Catalog</p>
        <h1 className="mt-2 font-display text-4xl tracking-tight text-ink sm:text-5xl">
          Shop by category
        </h1>
        <p className="mt-3 text-muted">
          Expand a category to browse pieces. Open a product for full details, or add to
          cart when you have permission.
        </p>
      </div>

      {error && <Alert type="error" className="mb-6">{error}</Alert>}
      {loading && <PageSpinner />}
      {!loading && !error && categories.length === 0 && products.length === 0 && (
        <EmptyState>No categories or products yet.</EmptyState>
      )}

      {!loading && sections.length > 0 && (
        <div className="space-y-4">
          {sections.map((section) => {
            const open = activeKeys.includes(section.key);
            return (
              <section
                key={section.key}
                className="overflow-hidden rounded-2xl border border-line bg-cream/70"
              >
                <button
                  type="button"
                  onClick={() => toggle(section.key)}
                  className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
                  aria-expanded={open}
                >
                  <span className="font-display text-xl text-ink">
                    {section.label}
                    <span className="ml-2 font-sans text-sm text-muted">
                      ({section.products.length})
                    </span>
                  </span>
                  <span
                    className={cn(
                      "grid h-8 w-8 place-items-center rounded-full border border-line text-muted transition-transform",
                      open && "rotate-180",
                    )}
                    aria-hidden
                  >
                    ⌄
                  </span>
                </button>
                {open && (
                  <div className="border-t border-line px-5 py-5">
                    {section.products.length === 0 ? (
                      <EmptyState>No products in this category yet.</EmptyState>
                    ) : (
                      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {section.products.map((p) => (
                          <ProductCard key={p._id} product={p} onDeleted={removeProduct} />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
