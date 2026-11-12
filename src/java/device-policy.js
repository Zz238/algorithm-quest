import { onMounted, onUnmounted, ref } from 'vue';
export const READING_DEVICE_QUERY = '(max-width: 760px), (pointer: coarse)';
export const runtimeConsent = { accepted: false };
export function isReadingDevice() {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia(READING_DEVICE_QUERY).matches
  );
}
export function useReadingDevice() {
  const reading = ref(isReadingDevice());
  let media;
  const update = () => {
    reading.value = media.matches;
  };
  onMounted(() => {
    if (typeof window.matchMedia !== 'function') return;
    media = window.matchMedia(READING_DEVICE_QUERY);
    update();
    media.addEventListener('change', update);
  });
  onUnmounted(() => media?.removeEventListener('change', update));
  return reading;
}
