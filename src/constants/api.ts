const { hostname, origin, href } = window.location;

const servers = {
  local: "http://localhost:3032",
  customDev: "https://react.customdev.solutions:3032",
  live: "https://api.realmoneydragon.io",
  live_test: "https://api.test.realmoneydragon.io",
  testing: "https://ldn26m62-3032.inc1.devtunnels.ms",
};

var URL;
// var publicUrl = "/";
var basename = "/";

type Environment =
  | "development"
  | "customdev"
  | "live"
  | "testing"
  | "live_test";
let enviroment: Environment = "development";

if (hostname.includes("react.customdev.solutions")) {
  URL = servers.customDev;
  // publicUrl = "/real-money-dragon/v2";
  enviroment = "customdev";
  basename = basename + href.replace(origin, "").split("/")[1];

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
  URL = servers.local;
  enviroment = "development";
}

export const SOCKET_URL = URL;
export const STATIC_URL = servers.live + "/Uploads/static/";
export const UPLOADS_URL = `${URL}/`;
export const BASE_URL = `${URL}/api`;
// export const PUBLIC_URL = publicUrl;
export const ENV = enviroment;
export const BASE_NAME = basename;

