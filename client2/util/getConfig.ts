import prodConfig from "./config.prod.json";
import localConfig from "./config.local.json";
console.log(process.env);
export default /*window.location.href.includes("localhost")*/ true
  ? localConfig
  : prodConfig;
