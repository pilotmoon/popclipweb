export function useLogger(): (...args: unknown[]) => void {
  if (import.meta.env.DEV) {
    return console.log;
  }
  return () => {};
}
