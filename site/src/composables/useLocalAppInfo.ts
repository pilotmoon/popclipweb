import { createGlobalState, useFetch, useSessionStorage } from "@vueuse/core";
import config from "../config/config.json";

interface HealthInfo {
    releaseEdition: string;
}

export const useLocalAppInfo = createGlobalState(() => {
  const health = useSessionStorage<HealthInfo | null>("popclip-local-app-health", null);  
  return { health }
});

export async function loadLocalAppInfo() {
    // popclip serves basic info at /health
    const { data } = await useFetch<{releaseEdition: string}>(`${config.pilotmoon.localAppRoot}/health`).json()
    if (data.value) {
        useLocalAppInfo().health.value = data.value;
    } else {
        useLocalAppInfo().health.value = null;
    }
}
