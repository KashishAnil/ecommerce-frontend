import { Provider } from "react-redux";
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router";
import { BASE_NAME } from "./constants/api";
import Home from "./pages/home";
import { store } from "./redux/store";

const PrivateRoute = () => {
  // const { token } = useSelector((state) => state.auth);
  const token = "a";

  return token ? <Outlet /> : <Navigate to="/login" />;
};

function AppRoutes() {
  return (
    <>
      <Provider store={store}>
        <BrowserRouter basename={BASE_NAME}>
          <Routes>
            {/* <Route path="/login" element={<Login />} /> */}

            <Route element={<PrivateRoute />}>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Home />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </Provider>
    </>
  );
}

export default AppRoutes;