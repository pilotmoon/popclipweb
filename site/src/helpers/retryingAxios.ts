import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";

// Retries a request up to this many times total on transient network
// failures (no response received, or a 5xx) -- the kind of TLS/connection
// blip that occasionally hits the build and resolves itself on a retry.
// Client errors (4xx) and non-network failures (e.g. Zod validation) are
// not retried, since retrying won't help and they should fail loudly.
const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 500;

interface RetryConfig extends InternalAxiosRequestConfig {
  __retriesSoFar?: number;
}

export function withRetries(instance: AxiosInstance): AxiosInstance {
  instance.interceptors.response.use(undefined, async (error) => {
    if (!axios.isAxiosError(error) || !error.config) {
      throw error;
    }
    const config = error.config as RetryConfig;
    const retriesSoFar = config.__retriesSoFar ?? 0;
    const retryable = !error.response || error.response.status >= 500;
    if (!retryable || retriesSoFar >= MAX_ATTEMPTS - 1) {
      throw error;
    }
    config.__retriesSoFar = retriesSoFar + 1;
    await new Promise((resolve) =>
      setTimeout(resolve, RETRY_DELAY_MS * config.__retriesSoFar!),
    );
    return instance(config);
  });
  return instance;
}

// A plain axios instance (no baseURL) with retries applied, for the
// build-time fetches that hit external hosts directly.
export default withRetries(axios.create());
