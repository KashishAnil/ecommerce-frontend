import { useEffect, useState } from "react";
import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import { Input, NumberInput, Select, TextArea } from "../../components/ui/Input";
import { useAppSelector } from "../../hooks/redux";
import type { Category, Product } from "../../types";
import { apiFetch } from "../../utils/api";

/** Seller-only: create categories and products. */
export default function SellerProductPage() {
  const userId = useAppSelector((s) => s.auth.userId);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [loadingCategory, setLoadingCategory] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [product, setProduct] = useState({
    productName: "",
    description: "",
    price: "",
    quantityAvailable: "",
    imageURL: "",
    category: "",
  });

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

  const onCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoadingProduct(true);
    try {
      const created = await apiFetch<Product>("/products", {
        method: "POST",
        body: JSON.stringify({
          productName: product.productName,
          description: product.description,
          price: Number(product.price),
          quantityAvailable: Number(product.quantityAvailable),
          imageURL: product.imageURL,
          category: product.category,
        }),
      });
      setSuccess(`Product created: ${created.productName}`);
      setProduct({
        productName: "",
        description: "",
        price: "",
        quantityAvailable: "",
        imageURL: "",
        category: "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create product");
    } finally {
      setLoadingProduct(false);
    }
  };

  const onCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
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
      setCategoryName("");
      await loadCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create category");
    } finally {
      setLoadingCategory(false);
    }
  };

  return (
    <div className="rounded-2xl border border-[var(--line)] bg-white p-6 shadow-[var(--shadow)] sm:p-8">
      <h1 className="font-display m-0 text-3xl font-semibold">Add a new product</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Sellers only. Your user id is attached automatically by the backend when
        creating a product.
      </p>

      {error && <Alert className="mt-4" type="error" message={error} />}
      {success && <Alert className="mt-4" type="success" message={success} />}

      <form onSubmit={onCreateProduct} className="mt-6 max-w-3xl space-y-4">
        <Input
          label="Product name"
          name="productName"
          required
          value={product.productName}
          onChange={(e) =>
            setProduct((p) => ({ ...p, productName: e.target.value }))
          }
        />
        <TextArea
          label="Description"
          name="description"
          required
          rows={3}
          value={product.description}
          onChange={(e) =>
            setProduct((p) => ({ ...p, description: e.target.value }))
          }
        />
        <NumberInput
          label="Price"
          name="price"
          required
          min={0}
          step={0.01}
          value={product.price}
          onChange={(e) => setProduct((p) => ({ ...p, price: e.target.value }))}
        />
        <NumberInput
          label="Quantity available"
          name="quantityAvailable"
          required
          min={0}
          step={1}
          value={product.quantityAvailable}
          onChange={(e) =>
            setProduct((p) => ({ ...p, quantityAvailable: e.target.value }))
          }
        />
        <Input
          label="Image URL"
          name="imageURL"
          type="url"
          required
          placeholder="https://…"
          value={product.imageURL}
          onChange={(e) =>
            setProduct((p) => ({ ...p, imageURL: e.target.value }))
          }
        />
        <Select
          label="Category"
          name="category"
          required
          placeholder={
            categories.length ? "Select a category" : "No categories yet"
          }
          value={product.category}
          onChange={(e) =>
            setProduct((p) => ({ ...p, category: e.target.value }))
          }
          options={categories.map((c) => ({
            value: c._id,
            label: c.categoryName,
          }))}
        />
        <Button type="submit" loading={loadingProduct}>
          Create product
        </Button>
      </form>

      <hr className="my-8 border-[var(--line)]" />

      <h2 className="font-display m-0 text-xl font-semibold">
        Create a category (optional)
      </h2>
      <p className="mt-2 text-sm text-[var(--muted)]">
        If the list above is empty, create a category first.
      </p>
      <form
        onSubmit={onCreateCategory}
        className="mt-4 flex max-w-3xl flex-wrap items-end gap-2"
      >
        <div className="min-w-[200px] flex-1">
          <Input
            label="Category name"
            name="categoryName"
            required
            placeholder="Category name"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
          />
        </div>
        <Button type="submit" variant="secondary" loading={loadingCategory}>
          Create category
        </Button>
      </form>
    </div>
  );
}
