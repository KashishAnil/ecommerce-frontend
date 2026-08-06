import { Button, Result } from "antd";
import { useEffect } from "react";
import { useNavigate } from "react-router";

/** After Stripe (or direct success), show confirmation then go to Orders. */
export default function SuccessPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate("/orders"), 2000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <Result
      status="success"
      title="Order successful"
      subTitle="Payment received. Taking you to your orders…"
      extra={
        <Button type="primary" onClick={() => navigate("/orders")}>
          Go to orders now
        </Button>
      }
    />
  );
}
