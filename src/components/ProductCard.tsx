import { useState } from "react";
import { Link } from "react-router";
import { useAppSelector } from "../hooks/redux";
import type { Product } from "../types";
import { apiFetch, formatMoney } from "../utils/api";
import { normalizeId } from "../utils/ids";
import Alert from "./ui/Alert";
import Button from "./ui/Button";
import ConfirmButton from "./ui/ConfirmButton";
import { NumberInput } from "./ui/Input";

type Props = {
  product: Product;
  /** Called after a seller soft-deletes this product so the list can refresh. */
  onDeleted?: (productId: string) => void;
};

/**
 * One product card: details, add-to-cart (Customer), delete (owning Seller).
 */
export default function ProductCard({ product, onDeleted }: Props) {
  const { token, role, userId } = useAppSelector((s) => s.auth);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const canAdd =
    Boolean(token) &&
    role === "Customer" &&
    (product.quantityAvailable || 0) > 0;

  const canDelete =
    Boolean(token) &&
    role === "Seller" &&
    product.isActive !== false &&
    normalizeId(product.seller) === normalizeId(userId);

  const onAdd = async (e: React.FormEvent) => {
    e.preventDefault();
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
      onDeleted?.(product._id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete product");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <article className="group overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-[var(--shadow)] transition hover:-translate-y-0.5 hover:shadow-lg">
      {product.imageURL ? (
        <div className="aspect-[16/10] overflow-hidden bg-[var(--surface-2)]">
          <img
            src={product.imageURL}
            alt={product.productName}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        </div>
      ) : (
        <div className="aspect-[16/10] bg-gradient-to-br from-[var(--brand-soft)] to-[var(--surface-2)]" />
      )}

      <div className="p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="font-display text-xl font-semibold leading-snug m-0">
            {product.productName}
          </h3>
          {canDelete && (
            <ConfirmButton
              title="Delete this product?"
              description="It will be soft-deleted (hidden from the store)."
              confirmLabel="Delete"
              loading={deleting}
              onConfirm={onDelete}
            >
              <Button variant="danger" size="sm">
                Delete
              </Button>
            </ConfirmButton>
          )}
        </div>

        <p className="mt-1 text-sm font-medium text-[var(--brand)]">
          {formatMoney(product.price)}
          <span className="text-[var(--muted)] font-normal">
            {" "}
            · Stock: {product.quantityAvailable ?? 0}
          </span>
        </p>

        <p className="mt-2 mb-0 text-sm text-[var(--ink-soft)] whitespace-pre-wrap line-clamp-3">
          {product.description}
        </p>

        {error && <Alert className="mt-3" type="error" message={error} />}
        {success && <Alert className="mt-3" type="success" message={success} />}

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Link
            to={`/products/${product._id}`}
            className="text-sm font-semibold no-underline"
          >
            View details →
          </Link>

          {canAdd && (
            <form onSubmit={onAdd} className="ml-auto flex flex-wrap items-end gap-2">
              <NumberInput
                label="Qty"
                min={1}
                max={product.quantityAvailable}
                value={qty}
                onValueChange={(v) => setQty(Number(v) || 1)}
                className="w-20"
              />
              <Button type="submit" loading={adding}>
                Add to cart
              </Button>
            </form>
          )}

          {token &&
            role === "Customer" &&
            (product.quantityAvailable || 0) <= 0 && (
              <span className="text-sm text-[var(--muted)]">Out of stock</span>
            )}

          {!token && (
            <span className="text-sm text-[var(--muted)]">
              <Link to="/login">Log in</Link> as a Customer to add to cart
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
