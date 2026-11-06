import fs from 'node:fs';
import path from 'node:path';
import { chapters, codes } from '../src/data/course.js';
import { caseProgram } from './java-programs.mjs';

const root = path.resolve('java-validation');
for (const { boss } of chapters) {
  const folder = path.join(root, 'LC' + boss.lc);
  fs.mkdirSync(folder, { recursive: true });
  fs.writeFileSync(path.join(folder, 'Main.java'), caseProgram(boss, codes[boss.codeKey]));
}
console.log('Generated 12 independent Main.java examples in java-validation/.');
