import { useState, type FormEvent } from "react";
import { Alert } from "../../components/ui/Alert";
import { Button } from "../../components/ui/Button";
import { Field, Input } from "../../components/ui/Field";
import type { Order } from "../../types";
import { apiFetch, appUrl } from "../../utils/api";

export default function CheckoutPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const values = {
      street: String(form.get("street") || ""),
      city: String(form.get("city") || ""),
      country: String(form.get("country") || ""),
    };

    setError("");
    setLoading(true);
    try {
      const order = await apiFetch<Order>("/orders", {
        method: "POST",
        body: JSON.stringify({ shippingAddress: values }),
      });

      const payment = await apiFetch<{ checkoutUrl: string }>(
        `/payments/checkout/${order._id}`,
        {
          method: "POST",
          body: JSON.stringify({
            successUrl: appUrl("/success"),
            cancelUrl: appUrl("/"),
          }),
        },
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
    <div className="mx-auto max-w-md animate-fade-up">
      <div className="rounded-3xl border border-line bg-cream p-7 shadow-card sm:p-8">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-brass">Almost there</p>
        <h1 className="mt-2 font-display text-3xl text-ink">Checkout</h1>
        <p className="mt-2 text-sm text-muted">
          Enter your shipping details. You’ll be redirected to Stripe to pay. The order is
          confirmed only after payment succeeds.
        </p>

        {error && <Alert className="mt-5" type="error">{error}</Alert>}

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <Field label="Street" htmlFor="street">
            <Input id="street" name="street" required autoComplete="address-line1" />
          </Field>
          <Field label="City" htmlFor="city">
            <Input id="city" name="city" required autoComplete="address-level2" />
          </Field>
          <Field label="Country" htmlFor="country">
            <Input id="country" name="country" required autoComplete="country-name" />
          </Field>
          <Button type="submit" loading={loading} block className="mt-2">
            {loading ? "Redirecting to payment…" : "Place order & pay"}
          </Button>
        </form>
      </div>
    </div>
  );
}
