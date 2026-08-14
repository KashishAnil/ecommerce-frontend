import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { Alert } from "../../components/ui/Alert";
import { Button } from "../../components/ui/Button";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { QuantityInput } from "../../components/ui/QuantityInput";
import { PageSpinner } from "../../components/ui/Spinner";
import { notifyCartUpdated, useShop } from "../../context/ShopContext";
import { useAppSelector } from "../../hooks/redux";
import type { Product } from "../../types";
import { apiFetch, formatMoney } from "../../utils/api";
import { normalizeId } from "../../utils/ids";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { token, role, userId } = useAppSelector((s) => s.auth);
  const { setCartOpen } = useShop();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [qty, setQty] = useState(1);
  const [confirmOpen, setConfirmOpen] = useState(false);

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

  const stock = product?.quantityAvailable || 0;
  const canAdd = Boolean(token) && role === "Customer" && product && stock > 0;
  const canDeleteProduct =
    Boolean(token) &&
    role === "Seller" &&
    product != null &&
    product.isActive !== false &&
    normalizeId(product.seller) === normalizeId(userId);

  const onAdd = async () => {
    if (!product) return;
    setError("");
    setSuccess("");
    setAdding(true);
    try {
      await apiFetch("/cart", {
        method: "POST",
        body: JSON.stringify({ productId: product._id, quantity: qty }),
      });
      setSuccess("Added to cart.");
      notifyCartUpdated();
      setCartOpen(true);
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
      setConfirmOpen(false);
      setTimeout(() => navigate("/"), 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete product");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <PageSpinner />;

  return (
    <div className="animate-fade-up">
      <Link to="/" className="text-sm font-medium text-ink no-underline hover:text-forest">
        ← Back
      </Link>

      {error && <Alert className="my-4" type="error">{error}</Alert>}
      {success && <Alert className="my-4" type="success">{success}</Alert>}

      {!product && !error && <p className="mt-6 text-muted">Product not found.</p>}

      {product && (
        <div className="mt-6 grid gap-8 overflow-hidden rounded-3xl border border-line bg-cream shadow-card lg:grid-cols-2">
          <div className="bg-paper">
            {product.imageURL ? (
              <img
                src={product.imageURL}
                alt={product.productName}
                className="h-full max-h-[520px] w-full object-cover"
              />
            ) : (
              <div className="grid min-h-72 place-items-center text-muted">No image</div>
            )}
          </div>

          <div className="flex flex-col p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h1 className="font-display text-4xl tracking-tight text-ink">
                {product.productName}
              </h1>
              {canDeleteProduct && (
                <Button variant="danger" size="sm" onClick={() => setConfirmOpen(true)}>
                  Delete
                </Button>
              )}
            </div>

            <p className="mt-3 font-display text-2xl text-brass">{formatMoney(product.price)}</p>
            <p className="mt-1 text-sm text-muted">Stock: {stock}</p>
            <p className="mt-5 whitespace-pre-wrap text-sm leading-relaxed text-muted">
              {product.description}
            </p>

            {canAdd ? (
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <QuantityInput value={qty} min={1} max={stock} onChange={setQty} />
                <Button size="lg" loading={adding} onClick={onAdd}>
                  Add to cart
                </Button>
              </div>
            ) : token && role === "Customer" ? (
              <p className="mt-6 text-sm text-muted">
                Out of stock. Manage quantities on your <Link to="/cart">cart</Link>.
              </p>
            ) : !token ? (
              <p className="mt-6 text-sm text-muted">
                Log in as a Customer to add this to your cart.
              </p>
            ) : role === "Seller" && !canDeleteProduct ? (
              <p className="mt-6 text-sm text-muted">
                You can only delete products you created.
              </p>
            ) : null}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Delete this product?"
        description="It will be soft-deleted and hidden from the store."
        loading={deleting}
        onConfirm={onDeleteProduct}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
