import { Button, Typography } from "antd";
import { Link } from "react-router";

/**
 * Shown after Stripe payment when success_url points here.
 * Note: backend currently hardcodes success_url to
 * http://localhost:3000/payments/success — update that to
 * http://localhost:5173/success (Vite default) when you're ready.
 */
export default function SuccessPage() {
  return (
    <div className="bg-white border border-[#ddd4c8] p-8 rounded text-center">
      <Typography.Title level={2}>Thank you — order placed</Typography.Title>
      <Typography.Paragraph>
        Your payment was successful. The backend will mark the order as{" "}
        <strong>paid</strong> via Stripe’s webhook automatically.
      </Typography.Paragraph>
      <div className="flex flex-wrap justify-center gap-3 mt-4">
        <Link to="/orders">
          <Button type="primary">View your orders</Button>
        </Link>
        <Link to="/">
          <Button>Back to products</Button>
        </Link>
      </div>
    </div>
  );
}
