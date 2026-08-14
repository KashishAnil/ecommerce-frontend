import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Alert } from "../../components/ui/Alert";
import { Button } from "../../components/ui/Button";
import { Field, Input, Textarea } from "../../components/ui/Field";
import { useShop } from "../../context/ShopContext";
import type { Product } from "../../types";
import { apiFetch } from "../../utils/api";

export default function SellerProductPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const categoryId = params.get("category") || "";
  const { categories } = useShop();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loadingProduct, setLoadingProduct] = useState(false);

  const categoryName = useMemo(
    () => categories.find((c) => c._id === categoryId)?.categoryName || "",
    [categories, categoryId],
  );

  useEffect(() => {
    if (!categoryId) {
      setError("Choose a category with + in the left panel.");
    }
  }, [categoryId]);

  const onCreateProduct = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!categoryId) {
      setError("Choose a category with + in the left panel.");
      return;
    }
    const form = e.currentTarget;
    const data = new FormData(form);
    const values = {
      productName: String(data.get("productName") || ""),
      description: String(data.get("description") || ""),
      price: Number(data.get("price")),
      quantityAvailable: Number(data.get("quantityAvailable")),
      imageURL: String(data.get("imageURL") || ""),
      category: categoryId,
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
      setTimeout(() => navigate("/"), 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create product");
    } finally {
      setLoadingProduct(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl animate-fade-up">
      <div className="overflow-hidden rounded-3xl border border-line bg-cream shadow-card">
        <div className="bg-forest px-6 py-6 sm:px-8">
          <Link to="/" className="text-sm font-medium text-cream/80 no-underline hover:text-cream">
            ← Back
          </Link>
          <h1 className="mt-3 font-display text-3xl text-cream">Add a product</h1>
          {categoryName && (
            <p className="mt-2 mb-0 text-sm text-cream/75">Category: {categoryName}</p>
          )}
        </div>
        <div className="p-6 sm:p-8">
          {error && <Alert className="mb-5" type="error">{error}</Alert>}
          {success && <Alert className="mb-5" type="success">{success}</Alert>}
          <form onSubmit={onCreateProduct} className="space-y-4">
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
              <Input id="imageURL" name="imageURL" type="url" required placeholder="https://…" />
            </Field>
            <Button type="submit" loading={loadingProduct} block>
              Create product
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
