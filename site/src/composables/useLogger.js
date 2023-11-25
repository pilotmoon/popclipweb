export function useLogger() {
  if (import.meta.env.DEV) {
    return console.log;
  } else {
    return () => {};
  }
}
