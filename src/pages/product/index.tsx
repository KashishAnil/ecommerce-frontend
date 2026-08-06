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

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await apiFetch<Product>(`/products/${id}`);
        if (!cancelled) setProduct(data);
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

  // Seller can soft-delete only products they own
  const sellerId =
    product && typeof product.seller === "object" && product.seller !== null
      ? String((product.seller as { _id?: string })._id || product.seller)
      : String(product?.seller || "");
  const canDeleteProduct =
    Boolean(token) &&
    role === "Seller" &&
    product &&
    product.isActive !== false &&
    sellerId === String(userId);

  const onAdd = async (values: { quantity: number }) => {
    if (!product) return;
    setError("");
    setSuccess("");
    setAdding(true);
    try {
      await apiFetch("/cart", {
        method: "POST",
        body: JSON.stringify({
          productId: product._id,
          quantity: values.quantity,
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
      <Link to="/">← Back to products</Link>

      {error && <Alert className="my-4" type="error" message={error} showIcon />}
      {success && (
        <Alert className="my-4" type="success" message={success} showIcon />
      )}

      {!product && !error && (
        <Typography.Paragraph>Product not found.</Typography.Paragraph>
      )}

      {product && (
        <div className="mt-4 bg-white border border-[#ddd4c8] p-6 rounded">
          <Typography.Title level={2}>{product.productName}</Typography.Title>
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
          <Typography.Paragraph className="mt-3">
            {product.description}
          </Typography.Paragraph>

          {canAdd ? (
            <Form
              layout="inline"
              onFinish={onAdd}
              initialValues={{ quantity: 1 }}
              className="mt-4 gap-2!"
            >
              <Form.Item
                name="quantity"
                label="Quantity"
                rules={[{ required: true }]}
              >
                <InputNumber min={1} max={product.quantityAvailable} />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={adding}>
                  Add to cart
                </Button>
              </Form.Item>
            </Form>
          ) : token && role === "Customer" ? (
            <Typography.Paragraph type="secondary" className="mt-3">
              Out of stock. You can delete items from your{" "}
              <Link to="/cart">cart</Link>.
            </Typography.Paragraph>
          ) : !token ? (
            <Typography.Paragraph type="secondary" className="mt-3">
              Log in as a Customer to add this to your cart.
            </Typography.Paragraph>
          ) : null}

          {canDeleteProduct && (
            <div className="mt-4">
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
            </div>
          )}
        </div>
      )}
    </div>
  );
}
