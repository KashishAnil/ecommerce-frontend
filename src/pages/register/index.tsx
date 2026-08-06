import { Alert, Button, Form, Input, InputNumber, Select, Typography } from "antd";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { apiFetch } from "../../utils/api";

type RegisterValues = {
  fName: string;
  lName: string;
  email: string;
  password: string;
  phone: number;
  area: string;
  city: string;
  country: string;
  role: "Customer" | "Seller";
};

export default function RegisterPage() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: RegisterValues) => {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          fName: values.fName,
          lName: values.lName,
          email: values.email,
          password: values.password,
          phone: values.phone,
          address: {
            area: values.area,
            city: values.city,
            country: values.country,
          },
          role: values.role,
        }),
      });
      setSuccess("Account created! Redirecting to login…");
      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white border border-[#ddd4c8] p-6 rounded">
      <Typography.Title level={2}>Create an account</Typography.Title>
      <Typography.Paragraph type="secondary">
        Choose Customer (shop &amp; order) or Seller (list products).
      </Typography.Paragraph>

      {error && (
        <Alert className="mb-4" type="error" message={error} showIcon />
      )}
      {success && (
        <Alert className="mb-4" type="success" message={success} showIcon />
      )}

      <Form layout="vertical" onFinish={onFinish} initialValues={{ role: "Customer" }}>
        <Form.Item name="fName" label="First name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="lName" label="Last name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item
          name="email"
          label="Email"
          rules={[{ required: true, type: "email" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="password"
          label="Password (min 8 characters)"
          rules={[{ required: true, min: 8 }]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item name="phone" label="Phone" rules={[{ required: true }]}>
          <InputNumber className="w-full!" />
        </Form.Item>
        <Form.Item name="area" label="Area / street" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="city" label="City" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="country" label="Country" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="role" label="Role" rules={[{ required: true }]}>
          <Select
            options={[
              { value: "Customer", label: "Customer" },
              { value: "Seller", label: "Seller" },
            ]}
          />
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block>
          Register
        </Button>
      </Form>

      <Typography.Paragraph className="mt-4 mb-0!" type="secondary">
        Already have an account? <Link to="/login">Log in</Link>
      </Typography.Paragraph>
    </div>
  );
}
