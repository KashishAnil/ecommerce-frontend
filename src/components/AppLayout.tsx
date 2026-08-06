import { Button, Layout, Typography } from "antd";
import { Link, Outlet, useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { logout } from "../redux/slices/authSlice";

const { Header, Content, Footer } = Layout;

/**
 * Shared shell: green header + links that change based on login/role.
 * Every page renders inside <Outlet />.
 */
export default function AppLayout() {
  const { token, role } = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <Layout className="min-h-screen bg-[#f7f3ee]">
      <Header className="flex flex-wrap items-center justify-between gap-3 bg-[#1f4d3a] px-4! h-auto! py-3">
        <Link to="/" className="text-white! text-lg font-semibold no-underline!">
          Shop
        </Link>

        <nav className="flex flex-wrap items-center gap-3 text-sm">
          <Link to="/" className="text-white!">
            Products
          </Link>
          <Link to="/categories" className="text-white!">
            Categories
          </Link>

          {!token && (
            <>
              <Link to="/login" className="text-white!">
                Login
              </Link>
              <Link to="/register" className="text-white!">
                Register
              </Link>
              <Typography.Text className="text-white/80! text-xs">
                Not logged in
              </Typography.Text>
            </>
          )}

          {token && role === "Customer" && (
            <>
              <Link to="/cart" className="text-white!">
                Cart
              </Link>
              <Link to="/checkout" className="text-white!">
                Checkout
              </Link>
              <Link to="/orders" className="text-white!">
                Orders
              </Link>
              <Typography.Text className="text-white/80! text-xs">
                Logged in as Customer
              </Typography.Text>
              <Button size="small" onClick={handleLogout}>
                Logout
              </Button>
            </>
          )}

          {token && role === "Seller" && (
            <>
              <Link to="/seller/products" className="text-white!">
                Add product
              </Link>
              <Typography.Text className="text-white/80! text-xs">
                Logged in as Seller
              </Typography.Text>
              <Button size="small" onClick={handleLogout}>
                Logout
              </Button>
            </>
          )}

          {token && role !== "Customer" && role !== "Seller" && (
            <>
              <Typography.Text className="text-white/80! text-xs">
                Logged in ({role || "unknown"})
              </Typography.Text>
              <Button size="small" onClick={handleLogout}>
                Logout
              </Button>
            </>
          )}
        </nav>
      </Header>

      <Content className="mx-auto w-full max-w-3xl px-4 py-6">
        <Outlet />
      </Content>

      <Footer className="text-center text-xs text-neutral-500 bg-transparent!">
        Simple ecommerce MVP · React + Vite + Redux + Tailwind
      </Footer>
    </Layout>
  );
}
