import { useEffect } from "react";
import { useNavigate } from "react-router";
import Button from "../../components/ui/Button";

/** After Stripe (or direct success), show confirmation then go to Orders. */
export default function SuccessPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate("/orders"), 2000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-[var(--line)] bg-white px-6 py-12 text-center shadow-[var(--shadow)] animate-fade-up">
      <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-[var(--success-soft)] text-2xl text-[var(--success)]">
        ✓
      </div>
      <h1 className="font-display m-0 text-3xl font-semibold">Order successful</h1>
      <p className="mt-2 text-[var(--muted)]">
        Payment received. Taking you to your orders…
      </p>
      <div className="mt-6">
        <Button onClick={() => navigate("/orders")}>Go to orders now</Button>
      </div>
    </div>
  );
}
