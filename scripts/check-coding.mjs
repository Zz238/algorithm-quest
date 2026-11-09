import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { CODING_TASKS } from '../src/data/coding-catalog.js';
import { buildCodingProgram } from '../src/java/coding-program.js';
import { parseCaseOutput } from '../src/java/feedback.js';
import { codingReviewTask, REVIEW_VARIANT_IDS } from '../src/data/coding-review.js';
const temporary = mkdtempSync(join(tmpdir(), 'quest-coding-'));
let total = 0;
try {
  assert.equal(new Set(CODING_TASKS.map((t) => t.id)).size, CODING_TASKS.length);
  const tasks = [
    ...CODING_TASKS,
    ...CODING_TASKS.filter((t) => REVIEW_VARIANT_IDS.includes(t.id)).map(codingReviewTask),
  ];
  for (const task of tasks) {
    assert(task.task && task.signature && task.cases.length >= 3 && task.hints.length >= 2, task.id);
    const file = join(temporary, 'Main.java');
    writeFileSync(file, buildCodingProgram(task, task.solution).source);
    const run = JSON.parse(
      execFileSync('java', ['-cp', 'src/java/generated/runner.jar', 'quest.runtime.Runner', file], {
        encoding: 'utf8',
        timeout: 10000,
      }),
    );
    assert.equal(run.state, 'finished', task.id + ': ' + JSON.stringify(run));
    const results = parseCaseOutput(run.stdout).cases;
    assert.equal(results.length, task.cases.length, task.id);
    assert(
      results.every((c) => c.ok),
      task.id + ': ' + JSON.stringify(results),
    );
    total += results.length;
  }
  console.log(
    `Validated ${CODING_TASKS.length} Java tasks, ${REVIEW_VARIANT_IDS.length} review variants and ${total} test cases with the real JDK.`,
  );
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
