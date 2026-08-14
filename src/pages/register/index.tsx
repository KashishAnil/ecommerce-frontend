import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { Alert } from "../../components/ui/Alert";
import { Button } from "../../components/ui/Button";
import { Field, Input, Select } from "../../components/ui/Field";
import { apiFetch } from "../../utils/api";

export default function RegisterPage() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const values = {
      fName: String(form.get("fName") || ""),
      lName: String(form.get("lName") || ""),
      email: String(form.get("email") || ""),
      password: String(form.get("password") || ""),
      phone: Number(form.get("phone")),
      area: String(form.get("area") || ""),
      city: String(form.get("city") || ""),
      country: String(form.get("country") || ""),
      role: String(form.get("role") || "Customer") as "Customer" | "Seller",
    };

    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          fName: values.fName,
          lName: values.lName,
          email: values.email,
          password: values.password,
          phone: values.phone,
          address: {
            area: values.area,
            city: values.city,
            country: values.country,
          },
          role: values.role,
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
    <div className="mx-auto max-w-lg animate-fade-up">
      <div className="overflow-hidden rounded-3xl border border-line bg-cream shadow-card">
        <div className="bg-forest px-7 py-7 sm:px-8">
          <h1 className="font-display m-0 text-3xl text-cream">Create an account</h1>
        </div>
        <div className="p-7 sm:p-8">

        {error && <Alert className="mb-5" type="error">{error}</Alert>}
        {success && <Alert className="mb-5" type="success">{success}</Alert>}

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="First name" htmlFor="fName">
              <Input id="fName" name="fName" required autoComplete="given-name" />
            </Field>
            <Field label="Last name" htmlFor="lName">
              <Input id="lName" name="lName" required autoComplete="family-name" />
            </Field>
          </div>
          <Field label="Email" htmlFor="reg-email">
            <Input id="reg-email" name="email" type="email" required autoComplete="email" />
          </Field>
          <Field label="Password" htmlFor="reg-password" hint="Minimum 8 characters">
            <Input
              id="reg-password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </Field>
          <Field label="Phone" htmlFor="phone">
            <Input id="phone" name="phone" type="number" required autoComplete="tel" />
          </Field>
          <Field label="Area / street" htmlFor="area">
            <Input id="area" name="area" required autoComplete="address-line1" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="City" htmlFor="city">
              <Input id="city" name="city" required autoComplete="address-level2" />
            </Field>
            <Field label="Country" htmlFor="country">
              <Input id="country" name="country" required autoComplete="country-name" />
            </Field>
          </div>
          <Field label="Role" htmlFor="role">
            <Select id="role" name="role" defaultValue="Customer" required>
              <option value="Customer">Customer</option>
              <option value="Seller">Seller</option>
            </Select>
          </Field>
          <Button type="submit" loading={loading} block className="mt-2">
            Register
          </Button>
        </form>

        <p className="mt-5 text-sm text-muted">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
        </div>
      </div>
    </div>
  );
}
