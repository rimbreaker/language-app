export const landingPageAuthHandle = (history: any) => {
  const href = window.location.href;
  const code = href.slice(href.indexOf("code=") + 5, href.indexOf("#/"));

  if (!code.includes("/")) {
    history.push(`/auth?code=${code}`);
  }
};
