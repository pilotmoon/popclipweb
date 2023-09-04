import { createGlobalState, useSessionStorage } from '@vueuse/core'

export const useDirectoryState = createGlobalState(
  () => {
    const defaultFilter = "";
    const filter = useSessionStorage('popclip-directory-filter', defaultFilter);
    const defaultArrange = "categories";
    const arrange = useSessionStorage('popclip-directory-arrange', defaultArrange);
    return { filter, defaultFilter, arrange, defaultArrange };
  }
)