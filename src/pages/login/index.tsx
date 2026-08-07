import { Alert, Button, Form, Input, Typography } from "antd";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAppDispatch } from "../../hooks/redux";
import { setCredentials } from "../../redux/slices/authSlice";
import { apiFetch } from "../../utils/api";

type LoginValues = { email: string; password: string };

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const onFinish = async (values: LoginValues) => {
    setError("");
    setLoading(true);
    try {
      const data = await apiFetch<{ token: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(values),
      });

      // Save token in Redux + localStorage; role comes from JWT payload
      dispatch(setCredentials({ token: data.token }));

      // Read role from localStorage decode via Redux — check JWT quickly
      const payload = JSON.parse(
        atob(data.token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
      );
      if (payload.role === "Seller") {
        navigate("/seller/products");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white border border-[#ddd4c8] p-6 rounded">
      <Typography.Title level={2}>Log in</Typography.Title>

      {error && (
        <Alert className="mb-4" type="error" message={error} showIcon />
      )}

      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="email"
          label="Email"
          rules={[{ required: true, type: "email" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true }]}
        >
          <Input.Password />
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block>
          Log in
        </Button>
      </Form>

      <Typography.Paragraph className="mt-4 mb-0!" type="secondary">
        No account yet? <Link to="/register">Register</Link>
      </Typography.Paragraph>
    </div>
  );
}
