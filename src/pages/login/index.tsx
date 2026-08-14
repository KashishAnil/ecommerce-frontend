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
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md animate-fade-up">
      <div className="overflow-hidden rounded-3xl border border-line bg-cream shadow-card">
        <div className="bg-forest px-7 py-7 sm:px-8">
          <h1 className="font-display m-0 text-3xl text-cream">Log in</h1>
        </div>
        <div className="p-7 sm:p-8">
        {error && <Alert className="mb-5" type="error">{error}</Alert>}

        <form onSubmit={onSubmit} className="space-y-4">
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
    </div>
  );
}
