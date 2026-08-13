import { useState } from "react";
import { Link, useNavigate } from "react-router";
import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import { Input, NumberInput, Select } from "../../components/ui/Input";
import { BRAND_NAME } from "../../constants/brand";
import { apiFetch } from "../../utils/api";

export default function RegisterPage() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fName: "",
    lName: "",
    email: "",
    password: "",
    phone: "",
    area: "",
    city: "",
    country: "",
    role: "Customer" as "Customer" | "Seller",
  });

  const set =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          fName: form.fName,
          lName: form.lName,
          email: form.email,
          password: form.password,
          phone: Number(form.phone),
          address: {
            area: form.area,
            city: form.city,
            country: form.country,
          },
          role: form.role,
        }),
      });
      setSuccess("Account created! Redirecting to login…");
      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl rounded-2xl border border-[var(--line)] bg-white p-6 shadow-[var(--shadow)] sm:p-8">
      <p className="m-0 font-display text-sm font-semibold tracking-wide text-[var(--brand)]">
        {BRAND_NAME}
      </p>
      <h1 className="font-display m-0 mt-1 text-3xl font-semibold">Create an account</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Choose Customer (shop &amp; order) or Seller (list products).
      </p>

      {error && <Alert className="mt-4" type="error" message={error} />}
      {success && <Alert className="mt-4" type="success" message={success} />}

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="First name" name="fName" required value={form.fName} onChange={set("fName")} />
          <Input label="Last name" name="lName" required value={form.lName} onChange={set("lName")} />
        </div>
        <Input
          label="Email"
          name="email"
          type="email"
          required
          value={form.email}
          onChange={set("email")}
          autoComplete="email"
        />
        <Input
          label="Password (min 8 characters)"
          name="password"
          type="password"
          required
          minLength={8}
          value={form.password}
          onChange={set("password")}
          autoComplete="new-password"
        />
        <NumberInput
          label="Phone"
          name="phone"
          required
          value={form.phone}
          onChange={set("phone")}
        />
        <Input label="Area / street" name="area" required value={form.area} onChange={set("area")} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="City" name="city" required value={form.city} onChange={set("city")} />
          <Input label="Country" name="country" required value={form.country} onChange={set("country")} />
        </div>
        <Select
          label="Role"
          name="role"
          required
          value={form.role}
          onChange={set("role")}
          options={[
            { value: "Customer", label: "Customer" },
            { value: "Seller", label: "Seller" },
          ]}
        />
        <Button type="submit" loading={loading} block>
          Register
        </Button>
      </form>

      <p className="mt-5 mb-0 text-sm text-[var(--muted)]">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}
