import {
  Alert,
  Button,
  Form,
  InputNumber,
  Popconfirm,
  Typography,
} from "antd";
import { useState } from "react";
import { Link } from "react-router";
import { useAppSelector } from "../hooks/redux";
import type { Product } from "../types";
import { apiFetch, formatMoney } from "../utils/api";
import { normalizeId } from "../utils/ids";

type Props = {
  product: Product;
  /** Called after a seller soft-deletes this product so the list can refresh. */
  onDeleted?: (productId: string) => void;
};

/**
 * One product row: full description, add-to-cart (Customer), delete (owning Seller).
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
      onDeleted?.(product._id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete product");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-white border border-[#ddd4c8] rounded p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <Typography.Title level={4} className="mt-0! mb-1!">
          {product.productName}
        </Typography.Title>
        {canDelete && (
          <Popconfirm
            title="Delete this product?"
            description="It will be soft-deleted (hidden from the store)."
            onConfirm={onDelete}
            okText="Delete"
            okButtonProps={{ danger: true }}
          >
            <Button danger size="small" loading={deleting}>
              Delete
            </Button>
          </Popconfirm>
        )}
      </div>

      {product.imageURL && (
        <img
          src={product.imageURL}
          alt={product.productName}
          className="max-w-[200px] w-full mb-3 bg-neutral-100"
        />
      )}

      <Typography.Text type="secondary">
        {formatMoney(product.price)} · Stock: {product.quantityAvailable ?? 0}
      </Typography.Text>

      <Typography.Paragraph className="mt-2 mb-3! whitespace-pre-wrap">
        {product.description}
      </Typography.Paragraph>

      {error && <Alert className="mb-2" type="error" message={error} showIcon />}
      {success && (
        <Alert className="mb-2" type="success" message={success} showIcon />
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Link to={`/products/${product._id}`}>
          <Button type="link" className="px-0!">
            View full details
          </Button>
        </Link>

        {canAdd && (
          <Form layout="inline" className="gap-2!" onFinish={onAdd}>
            <Form.Item className="mb-0!" label="Qty">
              <InputNumber
                min={1}
                max={product.quantityAvailable}
                value={qty}
                onChange={(v) => setQty(Number(v) || 1)}
              />
            </Form.Item>
            <Form.Item className="mb-0!">
              <Button type="primary" htmlType="submit" loading={adding}>
                Add to cart
              </Button>
            </Form.Item>
          </Form>
        )}

        {token && role === "Customer" && (product.quantityAvailable || 0) <= 0 && (
          <Typography.Text type="secondary">Out of stock</Typography.Text>
        )}

        {!token && (
          <Typography.Text type="secondary">
            <Link to="/login">Log in</Link> as a Customer to add to cart
          </Typography.Text>
        )}
      </div>
    </div>
  );
}
