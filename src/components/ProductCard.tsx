import { useState } from "react";
import { Link } from "react-router";
import { useAppSelector } from "../hooks/redux";
import type { Product } from "../types";
import { apiFetch, formatMoney } from "../utils/api";
import { normalizeId } from "../utils/ids";
import { Alert } from "./ui/Alert";
import { Button } from "./ui/Button";
import { ConfirmDialog } from "./ui/ConfirmDialog";
import { QuantityInput } from "./ui/QuantityInput";

type Props = {
  product: Product;
  onDeleted?: (productId: string) => void;
};

export default function ProductCard({ product, onDeleted }: Props) {
  const { token, role, userId } = useAppSelector((s) => s.auth);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const stock = product.quantityAvailable || 0;
  const canAdd = Boolean(token) && role === "Customer" && stock > 0;
  const canDelete =
    Boolean(token) &&
    role === "Seller" &&
    product.isActive !== false &&
    normalizeId(product.seller) === normalizeId(userId);

  const onAdd = async () => {
    setError("");
    setSuccess("");
    setAdding(true);
    try {
      await apiFetch("/cart", {
        method: "POST",
        body: JSON.stringify({ productId: product._id, quantity: qty }),
      });
      setSuccess("Added to cart.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add to cart");
    } finally {
      setAdding(false);
    }
  };

  const onDelete = async () => {
    setError("");
    setDeleting(true);
    try {
      await apiFetch(`/products/${product._id}`, { method: "DELETE" });
      setSuccess("Product deleted.");
      setConfirmOpen(false);
      onDeleted?.(product._id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete product");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-cream shadow-card transition duration-300 hover:-translate-y-0.5 hover:shadow-lift">
      <Link to={`/products/${product._id}`} className="relative block overflow-hidden bg-paper">
        {product.imageURL ? (
          <img
            src={product.imageURL}
            alt={product.productName}
            className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="grid aspect-[4/3] place-items-center text-sm text-muted">No image</div>
        )}
        {stock <= 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-ink/80 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-cream">
            Sold out
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-lg leading-snug text-ink">
            <Link to={`/products/${product._id}`} className="text-ink no-underline hover:text-forest">
              {product.productName}
            </Link>
          </h3>
          {canDelete && (
            <Button size="sm" variant="danger-ghost" onClick={() => setConfirmOpen(true)}>
              Delete
            </Button>
          )}
        </div>

        <p className="mt-1 text-sm font-medium text-brass">{formatMoney(product.price)}</p>
        <p className="mt-0.5 text-xs text-muted">Stock: {stock}</p>
        <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-muted">
          {product.description}
        </p>

        {error && <Alert className="mt-3" type="error">{error}</Alert>}
        {success && <Alert className="mt-3" type="success">{success}</Alert>}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Link
            to={`/products/${product._id}`}
            className="text-sm font-medium text-forest no-underline hover:underline"
          >
            Details
          </Link>

          {canAdd && (
            <div className="ml-auto flex flex-wrap items-center gap-2">
              <QuantityInput value={qty} min={1} max={stock} onChange={setQty} />
              <Button loading={adding} onClick={onAdd}>
                Add to cart
              </Button>
            </div>
          )}

          {token && role === "Customer" && stock <= 0 && (
            <span className="ml-auto text-sm text-muted">Out of stock</span>
          )}

          {!token && (
            <span className="ml-auto text-sm text-muted">
              <Link to="/login">Log in</Link> to add to cart
            </span>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete this product?"
        description="It will be soft-deleted and hidden from the store."
        loading={deleting}
        onConfirm={onDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </article>
  );
}
