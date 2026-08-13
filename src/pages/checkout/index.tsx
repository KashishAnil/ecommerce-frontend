import { useState } from "react";
import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import type { Order } from "../../types";
import { apiFetch } from "../../utils/api";

/**
 * Checkout flow:
 * 1) POST /orders with shipping address
 * 2) POST /payments/checkout/:orderId → { checkoutUrl }
 * 3) Redirect to Stripe immediately
 */
export default function CheckoutPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const order = await apiFetch<Order>("/orders", {
        method: "POST",
        body: JSON.stringify({
          shippingAddress: { street, city, country },
        }),
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
    <div className="mx-auto w-full max-w-2xl rounded-2xl border border-[var(--line)] bg-white p-6 shadow-[var(--shadow)] sm:p-8">
      <h1 className="font-display m-0 text-3xl font-semibold">Checkout</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Enter your shipping details. You&apos;ll be redirected to Stripe to pay.
        The order is confirmed only after payment succeeds.
      </p>

      {error && <Alert className="mt-4" type="error" message={error} />}

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <Input
          label="Street"
          name="street"
          required
          value={street}
          onChange={(e) => setStreet(e.target.value)}
        />
        <Input
          label="City"
          name="city"
          required
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <Input
          label="Country"
          name="country"
          required
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        />
        <Button type="submit" loading={loading} block>
          {loading ? "Redirecting to payment…" : "Place order & pay"}
        </Button>
      </form>
    </div>
  );
}
