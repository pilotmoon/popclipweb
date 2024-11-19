import { createGlobalState, useSessionStorage } from "@vueuse/core";

export const usePurchaseInfo = createGlobalState(() => {
  const flowId = useSessionStorage<string | null>("popclip-purchase-flow-id", null);  
  const userEmail = useSessionStorage<string | null>("popclip-purchase-user-email", null);   
  const userCountry = useSessionStorage<string | null>("popclip-purchase-user-country", null);
  return { flowId, userEmail, userCountry }
});

