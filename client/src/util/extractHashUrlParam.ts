export const extractParamFromHashUrl = (param: string) => {
  const hash = window.location.hash;
  const result = hash
    .slice(hash.indexOf("?") + 1)
    .split("&")
    .find((par) => par.includes(`${param}=`))
    ?.slice(param.length + 1);
  return result;
};
