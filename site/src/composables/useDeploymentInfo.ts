export function useDeploymentInfo() {
  let origin = "";
  let hostname = "";
  if (
    typeof window !== "undefined" &&
    typeof window?.location?.hostname === "string"
  ) {
    origin = window.location.origin;
    hostname = window.location.hostname;
  }
  return {
    origin,
    isLocalhost: hostname === "localhost",
    isPreview: hostname.endsWith(".vercel.app"),
    isProduction: hostname === "www.popclip.app",
  };
}
