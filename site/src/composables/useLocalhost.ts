export function useLocalhost() {
  return typeof window !== "undefined" &&
    window.location.hostname === "localhost";
}
