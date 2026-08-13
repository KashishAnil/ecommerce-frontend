import { useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "../../components/ui/Button";

export default function SuccessPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate("/orders"), 2000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="mx-auto max-w-lg animate-fade-up py-10 text-center">
      <div className="rounded-3xl border border-line bg-cream px-8 py-12 shadow-card">
        <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-success-bg text-success">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <h1 className="font-display text-3xl text-ink">Order successful</h1>
        <p className="mt-2 text-muted">Payment received. Taking you to your orders…</p>
        <div className="mt-6 flex justify-center">
          <Button onClick={() => navigate("/orders")}>Go to orders now</Button>
        </div>
      </div>
    </div>
  );
}
