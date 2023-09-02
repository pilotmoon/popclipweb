import { createGlobalState, useStorage } from '@vueuse/core'
import { ref } from 'vue';

export const useGlobalState = createGlobalState(
  () => {
    const edition = useStorage('popclip-edition', 'base');
    return { edition };
  }
)

export const useState = createGlobalState(
  () => {
    const filter = ref("");
    const arrange = ref("categories");
    return { filter, arrange };
  }
)