import { Provider } from "react-redux";
import { BrowserRouter, Route, Routes } from "react-router";
import AppLayout from "./components/AppLayout";
import { RequireRole } from "./components/RequireAuth";
import { BASE_NAME } from "./constants/api";
import CartPage from "./pages/cart";
import CheckoutPage from "./pages/checkout";
import ProductsPage from "./pages/home";
import LoginPage from "./pages/login";
import OrdersPage from "./pages/orders";
import ProductDetailPage from "./pages/product";
import RegisterPage from "./pages/register";
import SellerProductPage from "./pages/seller";
import SuccessPage from "./pages/success";
import { store } from "./redux/store";

function AppRoutes() {
  return (
    <Provider store={store}>
      <BrowserRouter basename={BASE_NAME}>
        <Routes>
          <Route element={<AppLayout />}>
            {/* Public — home is categories with expandable products */}
            <Route path="/" element={<ProductsPage />} />
            <Route path="/categories" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/success" element={<SuccessPage />} />

            {/* Customer only */}
            <Route element={<RequireRole roles={["Customer"]} />}>
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/orders" element={<OrdersPage />} />
            </Route>

            {/* Seller only */}
            <Route element={<RequireRole roles={["Seller"]} />}>
              <Route path="/seller/products" element={<SellerProductPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default AppRoutes;
