import prodConfig from "./config.prod.json";
import localConfig from "./config.local.json";
console.log();
export default window.location.href.includes("localhost")
  ? localConfig
  : prodConfig;
