import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import ConfirmButton from "../../components/ui/ConfirmButton";
import { NumberInput } from "../../components/ui/Input";
import Spinner from "../../components/ui/Spinner";
import { useAppSelector } from "../../hooks/redux";
import type { Product } from "../../types";
import { apiFetch, formatMoney } from "../../utils/api";
import { normalizeId } from "../../utils/ids";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { token, role, userId } = useAppSelector((s) => s.auth);
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await apiFetch<Product>(`/products/${id}`);
        if (!cancelled) {
          setProduct(data);
          setQty(1);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load product");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const canAdd =
    Boolean(token) &&
    role === "Customer" &&
    product &&
    (product.quantityAvailable || 0) > 0;

  const canDeleteProduct =
    Boolean(token) &&
    role === "Seller" &&
    product != null &&
    product.isActive !== false &&
    normalizeId(product.seller) === normalizeId(userId);

  const onAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    setError("");
    setSuccess("");
    setAdding(true);
    try {
      await apiFetch("/cart", {
        method: "POST",
        body: JSON.stringify({
          productId: product._id,
          quantity: qty,
        }),
      });
      setSuccess("Added to cart.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add to cart");
    } finally {
      setAdding(false);
    }
  };

  const onDeleteProduct = async () => {
    if (!product) return;
    setError("");
    setDeleting(true);
    try {
      await apiFetch(`/products/${product._id}`, { method: "DELETE" });
      setSuccess("Product deleted.");
      setTimeout(() => navigate("/"), 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete product");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <Link to="/" className="text-sm font-medium no-underline">
        ← Back to categories
      </Link>

      {error && <Alert className="mt-4" type="error" message={error} />}
      {success && <Alert className="mt-4" type="success" message={success} />}

      {!product && !error && (
        <p className="mt-6 text-[var(--muted)]">Product not found.</p>
      )}

      {product && (
        <div className="mt-5 overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-[var(--shadow)]">
          {product.imageURL && (
            <div className="aspect-[21/9] max-h-80 overflow-hidden bg-[var(--surface-2)]">
              <img
                src={product.imageURL}
                alt={product.productName}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          <div className="p-5 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h1 className="font-display m-0 text-3xl font-semibold sm:text-4xl">
                {product.productName}
              </h1>
              {canDeleteProduct && (
                <ConfirmButton
                  title="Delete this product?"
                  description="It will be soft-deleted (hidden from the store)."
                  confirmLabel="Delete"
                  loading={deleting}
                  onConfirm={onDeleteProduct}
                >
                  <Button variant="danger">Delete product</Button>
                </ConfirmButton>
              )}
            </div>

            <p className="mt-2 text-lg font-semibold text-[var(--brand)]">
              {formatMoney(product.price)}
              <span className="ml-2 text-sm font-normal text-[var(--muted)]">
                Stock: {product.quantityAvailable ?? 0}
              </span>
            </p>

            <p className="mt-4 whitespace-pre-wrap text-[var(--ink-soft)]">
              {product.description}
            </p>

            {canAdd ? (
              <form onSubmit={onAdd} className="mt-6 flex flex-wrap items-end gap-3">
                <NumberInput
                  label="Quantity"
                  min={1}
                  max={product.quantityAvailable}
                  value={qty}
                  onValueChange={(v) => setQty(Number(v) || 1)}
                  className="w-24"
                />
                <Button type="submit" loading={adding}>
                  Add to cart
                </Button>
              </form>
            ) : token && role === "Customer" ? (
              <p className="mt-4 text-sm text-[var(--muted)]">
                Out of stock. Manage quantities on your{" "}
                <Link to="/cart">cart</Link>.
              </p>
            ) : !token ? (
              <p className="mt-4 text-sm text-[var(--muted)]">
                Log in as a Customer to add this to your cart.
              </p>
            ) : role === "Seller" && !canDeleteProduct ? (
              <p className="mt-4 text-sm text-[var(--muted)]">
                You can only delete products you created.
              </p>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
