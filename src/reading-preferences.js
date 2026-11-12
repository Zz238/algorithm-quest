import { reactive, watch, onUnmounted } from 'vue';
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
    theme: ['light', 'dark', 'system'].includes(value?.theme) ? value.theme : 'system',
    fontSize: [16, 18, 20].includes(value?.fontSize) ? value.fontSize : 16,
  });
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const applyTheme = () => {
    document.documentElement.dataset.theme =
      prefs.theme === 'system' ? (media.matches ? 'dark' : 'light') : prefs.theme;
  };
  watch(() => prefs.theme, applyTheme, { immediate: true });
  media.addEventListener('change', applyTheme);
  onUnmounted(() => media.removeEventListener('change', applyTheme));
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
