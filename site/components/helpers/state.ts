import { createGlobalState, useStorage } from '@vueuse/core'
export const useGlobalState = createGlobalState(
  () => {
    const edition = useStorage('popclip-edition', 'base');
    return { edition };
  }
)