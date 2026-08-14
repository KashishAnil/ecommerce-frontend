import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { Alert } from "../../components/ui/Alert";
import { Button } from "../../components/ui/Button";
import { Field, Input } from "../../components/ui/Field";
import { useShop } from "../../context/ShopContext";
import { useAppSelector } from "../../hooks/redux";
import { apiFetch } from "../../utils/api";

export default function SellerCategoryPage() {
  const userId = useAppSelector((s) => s.auth.userId);
  const { refreshCategories } = useShop();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const categoryName = String(new FormData(e.currentTarget).get("categoryName") || "");
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await apiFetch("/categories", {
        method: "POST",
        body: JSON.stringify({ categoryName, createdBy: userId }),
      });
      setSuccess("Category created.");
      await refreshCategories();
      setTimeout(() => navigate("/"), 700);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg animate-fade-up">
      <div className="overflow-hidden rounded-3xl border border-line bg-cream shadow-card">
        <div className="bg-forest px-6 py-6 sm:px-8">
          <Link to="/" className="text-sm font-medium text-cream/80 no-underline hover:text-cream">
            ← Back
          </Link>
          <h1 className="mt-3 font-display text-3xl text-cream">Add a category</h1>
        </div>
        <div className="p-6 sm:p-8">
          {error && <Alert className="mb-5" type="error">{error}</Alert>}
          {success && <Alert className="mb-5" type="success">{success}</Alert>}
          <form onSubmit={onSubmit} className="space-y-4">
            <Field label="Category name" htmlFor="categoryName">
              <Input id="categoryName" name="categoryName" required placeholder="e.g. Ceramics" />
            </Field>
            <Button type="submit" loading={loading} block>
              Create category
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
