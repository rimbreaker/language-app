import prodConfig from "./config.prod.json";
import localConfig from "./config.local.json";

export default window.location.href.includes("localhost")
  ? localConfig
  : prodConfig;
