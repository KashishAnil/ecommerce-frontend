import { useState } from "react";
import { Link, useNavigate } from "react-router";
import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { BRAND_NAME } from "../../constants/brand";
import { useAppDispatch } from "../../hooks/redux";
import { setCredentials } from "../../redux/slices/authSlice";
import { apiFetch } from "../../utils/api";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    <div className="mx-auto w-full max-w-xl rounded-2xl border border-[var(--line)] bg-white p-6 shadow-[var(--shadow)] sm:p-8">
      <p className="m-0 font-display text-sm font-semibold tracking-wide text-[var(--brand)]">
        {BRAND_NAME}
      </p>
      <h1 className="font-display m-0 mt-1 text-3xl font-semibold">Welcome back</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Sign in to continue shopping or manage your store.
      </p>

      {error && <Alert className="mt-4" type="error" message={error} />}

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <Input
          label="Email"
          name="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        <Input
          label="Password"
          name="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
        <Button type="submit" loading={loading} block>
          Log in
        </Button>
      </form>

      <p className="mt-5 mb-0 text-sm text-[var(--muted)]">
        No account yet? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}
