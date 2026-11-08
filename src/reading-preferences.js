import { reactive, watch } from 'vue';
import { browserStorage } from './study-drafts.js';
export function useReadingPreferences() {
  const storage = browserStorage();
  let value;
  try {
    value = JSON.parse(storage?.getItem('algo-quest-reading-preferences-v1') || 'null');
  } catch {
    /* Defaults remain usable. */
  }
  const prefs = reactive({
    notesPinned: value?.notesPinned === true,
    fontSize: [16, 18, 20].includes(value?.fontSize) ? value.fontSize : 16,
  });
  watch(
    prefs,
    () => {
      try {
        storage?.setItem('algo-quest-reading-preferences-v1', JSON.stringify(prefs));
      } catch {
        /* Session preference still works. */
      }
    },
    { deep: true },
  );
  return prefs;
}
