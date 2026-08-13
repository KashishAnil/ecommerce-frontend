import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { Alert } from "../../components/ui/Alert";
import { Button } from "../../components/ui/Button";
import { Field, Input } from "../../components/ui/Field";
import { useAppDispatch } from "../../hooks/redux";
import { setCredentials } from "../../redux/slices/authSlice";
import { apiFetch } from "../../utils/api";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");

    setError("");
    setLoading(true);
    try {
      const data = await apiFetch<{ token: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      dispatch(setCredentials({ token: data.token }));

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
    <div className="mx-auto max-w-md animate-fade-up">
      <div className="rounded-3xl border border-line bg-cream p-7 shadow-card sm:p-8">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-brass">Welcome back</p>
        <h1 className="mt-2 font-display text-3xl text-ink">Log in</h1>
        <p className="mt-2 text-sm text-muted">Sign in to shop, checkout, or manage listings.</p>

        {error && <Alert className="mt-5" type="error">{error}</Alert>}

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <Field label="Email" htmlFor="email">
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </Field>
          <Field label="Password" htmlFor="password">
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
            />
          </Field>
          <Button type="submit" loading={loading} block className="mt-2">
            Log in
          </Button>
        </form>

        <p className="mt-5 text-sm text-muted">
          No account yet? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}
