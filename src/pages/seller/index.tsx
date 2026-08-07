import {
  Alert,
  Button,
  Divider,
  Form,
  Input,
  InputNumber,
  Select,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
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

  const onCreateProduct = async (values: {
    productName: string;
    description: string;
    price: number;
    quantityAvailable: number;
    imageURL: string;
    category: string;
  }) => {
    setError("");
    setSuccess("");
    setLoadingProduct(true);
    try {
      const created = await apiFetch<Product>("/products", {
        method: "POST",
        body: JSON.stringify(values),
      });
      setSuccess(`Product created: ${created.productName}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create product");
    } finally {
      setLoadingProduct(false);
    }
  };

  const onCreateCategory = async (values: { categoryName: string }) => {
    setError("");
    setSuccess("");
    setLoadingCategory(true);
    try {
      // Category model requires createdBy — send logged-in user id from JWT
      await apiFetch("/categories", {
        method: "POST",
        body: JSON.stringify({
          categoryName: values.categoryName,
          createdBy: userId,
        }),
      });
      setSuccess("Category created. You can select it above.");
      await loadCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create category");
    } finally {
      setLoadingCategory(false);
    }
  };

  return (
    <div className="bg-white border border-[#ddd4c8] p-6 rounded">
      <Typography.Title level={2}>Add a new product</Typography.Title>
      <Typography.Paragraph type="secondary">
        Sellers only. Your user id is attached automatically by the backend when
        creating a product.
      </Typography.Paragraph>

      {error && <Alert className="mb-4" type="error" message={error} showIcon />}
      {success && (
        <Alert className="mb-4" type="success" message={success} showIcon />
      )}

      <Form layout="vertical" onFinish={onCreateProduct} className="max-w-md">
        <Form.Item
          name="productName"
          label="Product name"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true }]}
        >
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item name="price" label="Price" rules={[{ required: true }]}>
          <InputNumber min={0} step={0.01} className="w-full!" />
        </Form.Item>
        <Form.Item
          name="quantityAvailable"
          label="Quantity available"
          rules={[{ required: true }]}
        >
          <InputNumber min={0} step={1} className="w-full!" />
        </Form.Item>
        <Form.Item
          name="imageURL"
          label="Image URL"
          rules={[{ required: true, type: "url" }]}
        >
          <Input placeholder="https://…" />
        </Form.Item>
        <Form.Item
          name="category"
          label="Category"
          rules={[{ required: true, message: "Select or create a category" }]}
        >
          <Select
            placeholder={
              categories.length ? "Select a category" : "No categories yet"
            }
            options={categories.map((c) => ({
              value: c._id,
              label: c.categoryName,
            }))}
          />
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={loadingProduct}>
          Create product
        </Button>
      </Form>

      <Divider />

      <Typography.Title level={4}>Create a category (optional)</Typography.Title>
      <Typography.Paragraph type="secondary">
        If the list above is empty, create a category first.
      </Typography.Paragraph>
      <Form layout="inline" onFinish={onCreateCategory}>
        <Form.Item
          name="categoryName"
          rules={[{ required: true, message: "Enter a name" }]}
        >
          <Input placeholder="Category name" />
        </Form.Item>
        <Form.Item>
          <Button htmlType="submit" loading={loadingCategory}>
            Create category
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
