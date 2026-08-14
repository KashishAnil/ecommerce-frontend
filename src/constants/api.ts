// API base URL for your Express backend.
// In development we always talk to localhost:3000.

const { hostname } = window.location;

const servers = {
  local: "http://localhost:3000",
  customDev: "https://react.customdev.solutions:3032",
  live: "https://api.realmoneydragon.io",
  live_test: "https://api.test.realmoneydragon.io",
  testing: "https://ldn26m62-3032.inc1.devtunnels.ms",
};

let URL: string;
let basename = "/";

type Environment =
  | "development"
  | "customdev"
  | "live"
  | "testing"
  | "live_test";
let enviroment: Environment = "development";

if (hostname.includes("react.customdev.solutions")) {
  URL = servers.customDev;
  enviroment = "customdev";
  basename = "/ecommerce-frontend";
} else if (hostname.includes("app.realmoneydragon.io")) {
  URL = servers.live_test;
  enviroment = "live_test";
} else if (hostname.includes("realmoneydragon.io")) {
  URL = servers.live;
  enviroment = "live";
} else if (hostname.includes("devtunnels.ms")) {
  URL = servers.testing;
  enviroment = "testing";
} else {
  // Local Vite app → your ecommerce Express server
  URL = servers.local;
  enviroment = "development";
}

export const SOCKET_URL = URL;
export const STATIC_URL = servers.live + "/Uploads/static/";
export const UPLOADS_URL = `${URL}/`;
/** Backend root — routes are /auth, /products, etc. (no /api prefix) */
export const BASE_URL = URL;
export const ENV = enviroment;
export const BASE_NAME = basename;
