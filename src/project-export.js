import { downloadBlob } from './download.js';
const sourceFiles = import.meta.glob(
  ['./career-projects/**/*.{java,xml,sql,py,md,json,properties}', '!./career-projects/**/target/**'],
  { query: '?raw', import: 'default', eager: true },
);
const encoder = new TextEncoder();
function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
export function zipFiles(files) {
  const chunks = [],
    central = [];
  let offset = 0,
    size = 0;
  for (const [name, text] of Object.entries(files)) {
    const path = encoder.encode(name),
      body = encoder.encode(text),
      crc = crc32(body),
      header = new Uint8Array(30 + path.length),
      h = new DataView(header.buffer);
    h.setUint32(0, 0x04034b50, true);
    h.setUint16(4, 20, true);
    h.setUint16(6, 0x800, true);
    h.setUint16(12, 33, true);
    h.setUint32(14, crc, true);
    h.setUint32(18, body.length, true);
    h.setUint32(22, body.length, true);
    h.setUint16(26, path.length, true);
    header.set(path, 30);
    const entry = new Uint8Array(46 + path.length),
      v = new DataView(entry.buffer);
    v.setUint32(0, 0x02014b50, true);
    v.setUint16(4, 20, true);
    v.setUint16(6, 20, true);
    v.setUint16(8, 0x800, true);
    v.setUint16(14, 33, true);
    v.setUint32(16, crc, true);
    v.setUint32(20, body.length, true);
    v.setUint32(24, body.length, true);
    v.setUint16(28, path.length, true);
    v.setUint32(42, offset, true);
    entry.set(path, 46);
    chunks.push(header, body);
    central.push(entry);
    offset += header.length + body.length;
    size += entry.length;
  }
  const end = new Uint8Array(22),
    v = new DataView(end.buffer);
  v.setUint32(0, 0x06054b50, true);
  v.setUint16(8, central.length, true);
  v.setUint16(10, central.length, true);
  v.setUint32(12, size, true);
  v.setUint32(16, offset, true);
  return new Blob([...chunks, ...central, end], { type: 'application/zip' });
}
const javaStarter = `package quest;
import org.springframework.stereotype.Service;
@Service
public class LearningService {
    public record Progress(String lesson, boolean completed) {}
    // TODO: choose a collection for records, seed lesson "arrays" as incomplete.
    public Progress read(String lesson) {
        throw new UnsupportedOperationException("TODO: validate, find, or report missing");
    }
    public Progress save(Progress value) {
        throw new UnsupportedOperationException("TODO: validate and save");
    }
}
`;
const pythonSignatures = [
  'sum_values(values)',
  'word_counts(words)',
  'dot(a, b)',
  'mean(values)',
  'mse(actual, predicted)',
  'split_rows(rows, cut)',
  'fit_line(xs, ys)',
  'predict_line(model, xs)',
  'accuracy(actual, predicted)',
  'recall(actual, predicted)',
  'jaccard(a, b)',
  'recommend(courses, completed, top_k)',
];
const pythonStarter = pythonSignatures
  .map((s) => 'def ' + s + ':\n    raise NotImplementedError("先按课程讲解完成这个方法")\n')
  .join('\n');
function notebook(body, tests) {
  return JSON.stringify(
    {
      nbformat: 4,
      nbformat_minor: 5,
      metadata: { kernelspec: { display_name: 'Python 3', language: 'python', name: 'python3' } },
      cells: [
        {
          id: 'guide',
          cell_type: 'markdown',
          metadata: {},
          source: [
            '# 从编程到模型评估\n',
            '合成数据、Python标准库。先手算、补全方法，再运行测试；参照同目录README。\n',
            '累计与词频 → 点积与均方误差 → 数据划分 → 一元回归 → 指标 → 推荐。',
          ],
        },
        {
          id: 'exercise',
          cell_type: 'code',
          metadata: {},
          execution_count: null,
          outputs: [],
          source: body.split(/(?<=\n)/),
        },
        {
          id: 'tests',
          cell_type: 'code',
          metadata: {},
          execution_count: null,
          outputs: [],
          source: tests
            .replace('from exercises import *', '')
            .replace(
              "if __name__ == '__main__': unittest.main()",
              "unittest.main(argv=[''], exit=False)",
            )
            .split(/(?<=\n)/),
        },
      ],
    },
    null,
    2,
  );
}
export function careerProjectFiles(route) {
  const prefix = './career-projects/' + route + '/',
    files = {};
  const content = Object.fromEntries(
    Object.entries(sourceFiles)
      .filter(([key]) => key.startsWith(prefix) && !/(__pycache__|target\/)/.test(key))
      .map(([key, value]) => [key.slice(prefix.length), value]),
  );
  for (const [name, value] of Object.entries(content)) {
    files['reference/' + name] = value;
    files['starter/' + name] = value;
  }
  if (route === 'backend') files['starter/src/main/java/quest/LearningService.java'] = javaStarter;
  else {
    files['starter/exercises.py'] = pythonStarter;
    files['starter/practice.ipynb'] = notebook(pythonStarter, content['test_exercises.py']);
    files['reference/practice.ipynb'] = notebook(content['exercises.py'], content['test_exercises.py']);
  }
  files['experiment-report.md'] =
    '# 实践记录\n\n## 问题与输入输出\n\n## 处理办法与基线\n\n## 测试或数据划分\n\n## 实际结果\n\n## 失败样例及修正\n\n## 复现步骤与版本\n\n## 当前限制与下一步\n';
  return files;
}
export function downloadCareerProject(route) {
  downloadBlob('algo-quest-' + route + '-practice.zip', zipFiles(careerProjectFiles(route)));
}
