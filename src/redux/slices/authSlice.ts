import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type UserRole = "Customer" | "Seller" | "Admin" | "";

type AuthState = {
  token: string | null;
  role: UserRole;
  userId: string;
};

/** Decode the middle part of a JWT to read userId and role (no library needed). */
function decodeJwt(token: string): { userId?: string; role?: UserRole } {
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return {};
  }
}

function loadFromStorage(): AuthState {
  const token = localStorage.getItem("token");
  if (!token) {
    return { token: null, role: "", userId: "" };
  }
  const decoded = decodeJwt(token);
  return {
    token,
    role: (decoded.role as UserRole) || "",
    userId: decoded.userId || "",
  };
}

const initialState: AuthState = loadFromStorage();

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ token: string }>) {
      const { token } = action.payload;
      const decoded = decodeJwt(token);
      state.token = token;
      state.role = (decoded.role as UserRole) || "";
      state.userId = decoded.userId || "";
      localStorage.setItem("token", token);
    },
    logout(state) {
      state.token = null;
      state.role = "";
      state.userId = "";
      localStorage.removeItem("token");
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
