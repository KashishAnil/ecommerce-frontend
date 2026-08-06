import { Alert, Button, Form, Input, Typography } from "antd";
import { useState } from "react";
import type { Order } from "../../types";
import { apiFetch } from "../../utils/api";

/**
 * Checkout flow:
 * 1) POST /orders with shipping address (builds order from cart)
 * 2) POST /payments/checkout/:orderId → { checkoutUrl }
 * 3) Redirect browser to Stripe
 */
export default function CheckoutPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: {
    street: string;
    city: string;
    country: string;
  }) => {
    setError("");
    setLoading(true);
    try {
      const order = await apiFetch<Order>("/orders", {
        method: "POST",
        body: JSON.stringify({ shippingAddress: values }),
      });

      const payment = await apiFetch<{ checkoutUrl: string }>(
        `/payments/checkout/${order._id}`,
        { method: "POST" },
      );

      if (!payment.checkoutUrl) {
        throw new Error("No checkout URL returned from the server.");
      }

      window.location.href = payment.checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white border border-[#ddd4c8] p-6 rounded">
      <Typography.Title level={2}>Checkout</Typography.Title>
      <Typography.Paragraph type="secondary">
        We create an order from your cart, then send you to Stripe to pay.
      </Typography.Paragraph>

      {error && <Alert className="mb-4" type="error" message={error} showIcon />}

      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item name="street" label="Street" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="city" label="City" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="country" label="Country" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block>
          Place order &amp; pay
        </Button>
      </Form>
    </div>
  );
}
