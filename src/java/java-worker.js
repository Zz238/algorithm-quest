/* Classic worker, loaded only inside an opaque-origin sandbox frame. */
/* global importScripts, cheerpjInit, cheerpOSAddStringFile, cheerpjRunLibrary */
let runner;
self.onmessage = async ({ data }) => {
  try {
    if (data.type === 'init') {
      self.postMessage({ type: 'status', phase: 'loading' });
      importScripts('https://cjrtnc.leaningtech.com/5.0/loader.js');
      await cheerpjInit({
        version: 17,
        status: 'none',
        clipboardMode: 'java',
        overrideDocumentBase: 'https://quest-sandbox.invalid/',
        natives: {
          Java_quest_runtime_Runner_phase: async (_lib, phase) =>
            self.postMessage({ type: 'status', phase: String(phase) }),
        },
      });
      cheerpOSAddStringFile('/str/quest-runner.jar', new Uint8Array(data.jar));
      const lib = await cheerpjRunLibrary('/str/quest-runner.jar');
      runner = await lib.quest.runtime.Runner;
      self.postMessage({ type: 'ready' });
    } else if (data.type === 'run' && runner) {
      const raw = await runner.run(data.source, data.stdin || '');
      self.postMessage({ type: 'result', result: JSON.parse(String(raw)) });
    }
  } catch (error) {
    self.postMessage({ type: 'error', message: String(error?.message || error).slice(0, 1200) });
  }
};
