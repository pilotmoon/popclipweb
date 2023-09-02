import { createGlobalState, useStorage } from '@vueuse/core'

export const useEditionSwitcherState = createGlobalState(
  () => {
    const edition = useStorage('popclip-edition', 'base');
    return { edition };
  }
)