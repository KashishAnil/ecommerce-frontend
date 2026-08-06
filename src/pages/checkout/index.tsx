import { Alert, Button, Form, Input, Result, Typography } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router";
import type { Order } from "../../types";
import { apiFetch } from "../../utils/api";

/**
 * Checkout flow:
 * 1) POST /orders with shipping address
 * 2) Show "Order successful"
 * 3) Try Stripe checkout; if that works, redirect to pay
 * 4) Otherwise (or after payment return) go to the Orders page
 */
export default function CheckoutPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const navigate = useNavigate();

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

      // Order exists in the database — show success immediately
      setOrderSuccess(true);

      // Try to start Stripe payment (optional if Stripe fails)
      try {
        const payment = await apiFetch<{ checkoutUrl: string }>(
          `/payments/checkout/${order._id}`,
          { method: "POST" },
        );
        if (payment.checkoutUrl) {
          window.location.href = payment.checkoutUrl;
          return;
        }
      } catch {
        // Payment session failed, but the order was still placed
      }

      // No Stripe redirect → go to Orders after a short pause so the user sees success
      setTimeout(() => navigate("/orders"), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
      setLoading(false);
    }
  };

  if (orderSuccess) {
    return (
      <Result
        status="success"
        title="Order successful"
        subTitle="Taking you to your orders…"
        extra={
          <Button type="primary" onClick={() => navigate("/orders")}>
            Go to orders now
          </Button>
        }
      />
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white border border-[#ddd4c8] p-6 rounded">
      <Typography.Title level={2}>Checkout</Typography.Title>
      <Typography.Paragraph type="secondary">
        Enter your shipping details to place the order. You may be sent to Stripe
        to pay.
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
          Place order
        </Button>
      </Form>
    </div>
  );
}
