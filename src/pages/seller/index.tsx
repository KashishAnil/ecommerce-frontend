import { useEffect, useState, type FormEvent } from "react";
import { Alert } from "../../components/ui/Alert";
import { Button } from "../../components/ui/Button";
import { Field, Input, Select, Textarea } from "../../components/ui/Field";
import { useAppSelector } from "../../hooks/redux";
import type { Category, Product } from "../../types";
import { apiFetch } from "../../utils/api";

export default function SellerProductPage() {
  const userId = useAppSelector((s) => s.auth.userId);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [loadingCategory, setLoadingCategory] = useState(false);

  const loadCategories = async () => {
    try {
      const data = await apiFetch<Category[]>("/categories");
      setCategories(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load categories");
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const onCreateProduct = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const values = {
      productName: String(data.get("productName") || ""),
      description: String(data.get("description") || ""),
      price: Number(data.get("price")),
      quantityAvailable: Number(data.get("quantityAvailable")),
      imageURL: String(data.get("imageURL") || ""),
      category: String(data.get("category") || ""),
    };

    setError("");
    setSuccess("");
    setLoadingProduct(true);
    try {
      const created = await apiFetch<Product>("/products", {
        method: "POST",
        body: JSON.stringify(values),
      });
      setSuccess(`Product created: ${created.productName}`);
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create product");
    } finally {
      setLoadingProduct(false);
    }
  };

  const onCreateCategory = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const categoryName = String(new FormData(form).get("categoryName") || "");

    setError("");
    setSuccess("");
    setLoadingCategory(true);
    try {
      await apiFetch("/categories", {
        method: "POST",
        body: JSON.stringify({
          categoryName,
          createdBy: userId,
        }),
      });
      setSuccess("Category created. You can select it above.");
      form.reset();
      await loadCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create category");
    } finally {
      setLoadingCategory(false);
    }
  };

  return (
    <div className="animate-fade-up">
      <div className="mb-8 max-w-2xl">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-brass">Seller studio</p>
        <h1 className="mt-2 font-display text-4xl tracking-tight text-ink">Add a new product</h1>
        <p className="mt-2 text-muted">
          Sellers only. Your user id is attached automatically by the backend when creating a
          product.
        </p>
      </div>

      {error && <Alert className="mb-5" type="error">{error}</Alert>}
      {success && <Alert className="mb-5" type="success">{success}</Alert>}

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <form
          onSubmit={onCreateProduct}
          className="space-y-4 rounded-3xl border border-line bg-cream p-6 shadow-card sm:p-8"
        >
          <h2 className="font-display text-2xl text-ink">Product details</h2>
          <Field label="Product name" htmlFor="productName">
            <Input id="productName" name="productName" required />
          </Field>
          <Field label="Description" htmlFor="description">
            <Textarea id="description" name="description" required rows={4} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Price" htmlFor="price">
              <Input id="price" name="price" type="number" min={0} step="0.01" required />
            </Field>
            <Field label="Quantity available" htmlFor="quantityAvailable">
              <Input
                id="quantityAvailable"
                name="quantityAvailable"
                type="number"
                min={0}
                step={1}
                required
              />
            </Field>
          </div>
          <Field label="Image URL" htmlFor="imageURL">
            <Input
              id="imageURL"
              name="imageURL"
              type="url"
              required
              placeholder="https://…"
            />
          </Field>
          <Field label="Category" htmlFor="category">
            <Select id="category" name="category" required defaultValue="">
              <option value="" disabled>
                {categories.length ? "Select a category" : "No categories yet"}
              </option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.categoryName}
                </option>
              ))}
            </Select>
          </Field>
          <Button type="submit" loading={loadingProduct}>
            Create product
          </Button>
        </form>

        <form
          onSubmit={onCreateCategory}
          className="h-fit space-y-4 rounded-3xl border border-line bg-cream p-6 shadow-card sm:p-8"
        >
          <h2 className="font-display text-2xl text-ink">New category</h2>
          <p className="text-sm text-muted">
            If the list is empty, create a category first.
          </p>
          <Field label="Category name" htmlFor="categoryName">
            <Input id="categoryName" name="categoryName" required placeholder="e.g. Ceramics" />
          </Field>
          <Button type="submit" variant="secondary" loading={loadingCategory}>
            Create category
          </Button>
        </form>
      </div>
    </div>
  );
}
