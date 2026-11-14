import workerSource from './java-worker.js?raw';
import runnerUrl from './generated/runner.jar?url';
import { isReadingDevice } from './device-policy.js';

const frameDocument = `<!doctype html><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval' blob: https://cjrtnc.leaningtech.com; worker-src blob:; connect-src https://cjrtnc.leaningtech.com; child-src blob:"><script>
addEventListener('message', function boot(event) {
  if (event.source !== parent || !event.ports[0] || event.data.type !== 'quest-init') return;
  removeEventListener('message', boot);
  const port = event.ports[0];
  const url = URL.createObjectURL(new Blob([event.data.worker], {type:'text/javascript'}));
  let worker;
  function start(nextRun) {
    worker = new Worker(url);
    worker.onmessage = e => {
      if(e.data.type === 'ready' && nextRun) { worker.postMessage(nextRun); nextRun = null; return; }
      port.postMessage(e.data);
    };
    worker.onerror = e => port.postMessage({type:'error', message:e.message || 'Java worker could not start'});
    worker.postMessage({type:'init', jar:event.data.jar});
  }
  port.onmessage = e => { if(!worker && e.data.type === 'run')start(e.data);else worker?.postMessage(e.data); };
  start(null);
});<\/script>`;

export function createJavaSandbox({
  onStatus = () => {},
  loadingMs = 120000,
  compileMs = 45000,
  executionMs = 5000,
} = {}) {
  let frame,
    port,
    loading,
    pending,
    timer,
    generation = 0;
  function reset(message = '已停止运行。') {
    generation++;
    clearTimeout(timer);
    const reject = pending?.reject;
    pending = null;
    reject?.(new Error(message));
    loading?.reject(new Error(message));
    loading = null;
    port?.close();
    port = null;
    frame?.remove();
    frame = null;
  }
  function timeout(ms, message) {
    clearTimeout(timer);
    timer = setTimeout(() => reset(message), ms);
  }
  async function initialize() {
    if (frame && !loading) return;
    if (loading) return loading.promise;
    if (location.protocol === 'file:')
      throw new Error('在线 Java 需要通过 Vite 的 http/https 地址访问。');
    let resolve, reject;
    const promise = new Promise((yes, no) => {
      resolve = yes;
      reject = no;
    });
    loading = { promise, resolve, reject };
    const started = generation;
    onStatus('loading');
    timeout(loadingMs, 'Java 环境加载超时。请检查网络后重试，代码草稿已保留。');
    try {
      const response = await fetch(runnerUrl);
      if (!response.ok) throw new Error('无法加载课程运行器。');
      const jar = await response.arrayBuffer();
      if (started !== generation) return promise;
      frame = document.createElement('iframe');
      frame.hidden = true;
      frame.title = '隔离的 Java 教学运行环境';
      frame.setAttribute('sandbox', 'allow-scripts');
      frame.referrerPolicy = 'no-referrer';
      const channel = new MessageChannel();
      port = channel.port1;
      port.onmessage = ({ data }) => {
        if (started !== generation) return;
        if (data.type === 'ready') {
          clearTimeout(timer);
          const done = loading?.resolve;
          loading = null;
          done?.();
        } else if (data.type === 'status') {
          onStatus(data.phase);
          if (pending)
            timeout(
              data.phase === 'loading' ? loadingMs : data.phase === 'running' ? executionMs : compileMs,
              data.phase === 'running'
                ? '运行超时：请检查循环能否结束，或递归是否有停止条件。'
                : data.phase === 'loading'
                  ? 'Java 环境加载超时，请检查网络后重试。'
                  : '编译超时：代码草稿已保留，可停止后重试。',
            );
        } else if (data.type === 'result' && pending) {
          clearTimeout(timer);
          const done = pending.resolve;
          pending = null;
          done(data.result);
        } else if (data.type === 'error') reset('Java 环境未能运行：' + data.message);
      };
      frame.onload = () =>
        frame?.contentWindow?.postMessage({ type: 'quest-init', worker: workerSource, jar }, '*', [
          channel.port2,
        ]);
      frame.srcdoc = frameDocument;
      document.body.append(frame);
    } catch (error) {
      if (started === generation) reset(error.message);
    }
    return promise;
  }
  async function run({ source, stdin = '', entryClass = 'Main' }) {
    if (isReadingDevice()) throw new Error('触屏或小屏设备使用阅读与手算模式，不加载 Java 运行环境。');
    if (pending || loading) throw new Error('上一项任务仍在运行，请先停止。');
    await initialize();
    return new Promise((resolve, reject) => {
      pending = { resolve, reject };
      onStatus('compiling');
      timeout(compileMs, '编译超时，代码草稿已保留。');
      port.postMessage({ type: 'run', source, stdin, entryClass });
    });
  }
  return { run, stop: reset, dispose: reset };
}
