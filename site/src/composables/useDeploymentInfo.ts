export function useDeploymentInfo() {
  let hostname = "";
  if (
    typeof window !== "undefined" &&
    typeof window?.location?.hostname === "string"
  ) {
    hostname = window.location.hostname;
  }
  return {
    isLocalhost: hostname === "localhost",
    isPreview: hostname.endsWith(".vercel.app"),
    isProduction: hostname === "www.popclip.app",
  };
}
