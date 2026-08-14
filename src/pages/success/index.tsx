import { useNavigate } from "react-router";
import { Button } from "../../components/ui/Button";

export default function SuccessPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[70vh] flex-col">
      <button
        type="button"
        onClick={() => navigate("/")}
        className="mb-6 inline-flex w-fit items-center gap-2 rounded-full px-2 py-1.5 text-sm font-medium text-ink hover:bg-cream"
        aria-label="Back to home"
      >
        ← Back
      </button>

      <div className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-line bg-cream shadow-card">
          <div className="bg-forest px-8 py-12 text-center">
            <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-cream text-forest">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <h1 className="font-display m-0 text-3xl text-cream sm:text-4xl">Order successful</h1>
          </div>
          <div className="px-8 py-8 text-center">
            <p className="m-0 text-muted">Payment received. Your order is confirmed.</p>
            <div className="mt-6">
              <Button onClick={() => navigate("/")}>Continue shopping</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
