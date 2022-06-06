export const landingPageAuthHandle = (history: any) => {
  const href = window.location.href;
  if (href.includes("com/auth?code") && href.slice(-2) === "#/") {
    const code = href.slice(href.indexOf("code=") + 5, href.indexOf("#/"));
    history.push(`/auth?code=${code}`);
  }
};
