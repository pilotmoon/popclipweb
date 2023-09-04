import { createGlobalState, useStorage } from '@vueuse/core'

export const useEditionSwitcherState = createGlobalState(
  () => {
    const defaultEdition = "base";
    const edition = useStorage("popclip-edition", defaultEdition);
    return { edition, defaultEdition };
  }
)