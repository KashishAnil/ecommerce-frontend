import {
  Alert,
  Button,
  Form,
  InputNumber,
  Popconfirm,
  Spin,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
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

  const onAdd = async () => {
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

  if (loading) {
    return (
      <div className="py-10 text-center">
        <Spin />
      </div>
    );
  }

  return (
    <div>
      <Link to="/">← Back to categories</Link>

      {error && <Alert className="my-4" type="error" message={error} showIcon />}
      {success && (
        <Alert className="my-4" type="success" message={success} showIcon />
      )}

      {!product && !error && (
        <Typography.Paragraph>Product not found.</Typography.Paragraph>
      )}

      {product && (
        <div className="mt-4 bg-white border border-[#ddd4c8] p-6 rounded">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <Typography.Title level={2} className="mt-0!">
              {product.productName}
            </Typography.Title>
            {canDeleteProduct && (
              <Popconfirm
                title="Delete this product?"
                description="It will be soft-deleted (hidden from the store)."
                onConfirm={onDeleteProduct}
                okText="Delete"
                okButtonProps={{ danger: true }}
              >
                <Button danger loading={deleting}>
                  Delete product
                </Button>
              </Popconfirm>
            )}
          </div>

          {product.imageURL && (
            <img
              src={product.imageURL}
              alt={product.productName}
              className="max-w-xs w-full mb-4 bg-neutral-100"
            />
          )}
          <Typography.Text type="secondary">
            {formatMoney(product.price)} · Stock: {product.quantityAvailable ?? 0}
          </Typography.Text>
          <Typography.Paragraph className="mt-3 whitespace-pre-wrap">
            {product.description}
          </Typography.Paragraph>

          {canAdd ? (
            <Form layout="inline" onFinish={onAdd} className="mt-4 gap-2!">
              <Form.Item label="Quantity">
                <InputNumber
                  min={1}
                  max={product.quantityAvailable}
                  value={qty}
                  onChange={(v) => setQty(Number(v) || 1)}
                />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={adding}>
                  Add to cart
                </Button>
              </Form.Item>
            </Form>
          ) : token && role === "Customer" ? (
            <Typography.Paragraph type="secondary" className="mt-3">
              Out of stock. Manage quantities on your{" "}
              <Link to="/cart">cart</Link>.
            </Typography.Paragraph>
          ) : !token ? (
            <Typography.Paragraph type="secondary" className="mt-3">
              Log in as a Customer to add this to your cart.
            </Typography.Paragraph>
          ) : role === "Seller" && !canDeleteProduct ? (
            <Typography.Paragraph type="secondary" className="mt-3">
              You can only delete products you created.
            </Typography.Paragraph>
          ) : null}
        </div>
      )}
    </div>
  );
}
