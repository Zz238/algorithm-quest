import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { CODING_TASKS } from '../src/data/coding-catalog.js';
import { buildLearnerProgram, buildSourceJudgingProgram } from '../src/java/coding-program.js';
import { parseCaseOutput } from '../src/java/feedback.js';
import { codingReviewTask, REVIEW_VARIANT_IDS } from '../src/data/coding-review.js';
const temporary = mkdtempSync(join(tmpdir(), 'quest-coding-'));
let total = 0;
let samplePrograms = 0;
const sampleIds = new Set([
  'code-greeting',
  'code-core-5-1',
  'code-core-6-2',
  'code-topic-big-add',
  'code-tree-size',
]);
try {
  assert.equal(new Set(CODING_TASKS.map((t) => t.id)).size, CODING_TASKS.length);
  const tasks = [
    ...CODING_TASKS,
    ...CODING_TASKS.filter((t) => REVIEW_VARIANT_IDS.includes(t.id)).map(codingReviewTask),
  ];
  for (const task of tasks) {
    assert(task.task && task.signature && task.cases.length >= 3 && task.hints.length >= 2, task.id);
    const file = join(temporary, 'Main.java');
    const program = buildSourceJudgingProgram(task, buildLearnerProgram(task, task.solution));
    writeFileSync(file, program.source);
    const run = JSON.parse(
      execFileSync(
        'java',
        [
          '-Dfile.encoding=UTF-8',
          '-Dsun.stdout.encoding=UTF-8',
          '-Dstdout.encoding=UTF-8',
          '-cp',
          'src/java/generated/runner.jar',
          'quest.runtime.Runner',
          file,
          '',
          program.entryClass,
        ],
        {
          encoding: 'utf8',
          timeout: 10000,
        },
      ),
    );
    assert.equal(run.state, 'finished', task.id + ': ' + JSON.stringify(run));
    const results = parseCaseOutput(run.stdout).cases;
    assert.equal(results.length, task.cases.length, task.id);
    assert(
      results.every((c) => c.ok),
      task.id + ': ' + JSON.stringify(results),
    );
    total += results.length;
    if (sampleIds.has(task.id)) {
      writeFileSync(file, buildLearnerProgram(task, task.solution));
      const sample = JSON.parse(
        execFileSync(
          'java',
          [
            '-Dfile.encoding=UTF-8',
            '-Dsun.stdout.encoding=UTF-8',
            '-Dstdout.encoding=UTF-8',
            '-cp',
            'src/java/generated/runner.jar',
            'quest.runtime.Runner',
            file,
          ],
          {
            encoding: 'utf8',
            timeout: 10000,
          },
        ),
      );
      assert.equal(sample.state, 'finished', task.id + ': Main example');
      const expected = task.cases[0][1];
      const output = typeof expected === 'string' ? sample.stdout.trimEnd() : JSON.parse(sample.stdout);
      assert.deepEqual(output, expected, task.id + ': visible Main output');
      samplePrograms++;
    }
  }
  console.log(
    `Validated ${CODING_TASKS.length} Java tasks, ${REVIEW_VARIANT_IDS.length} review variants, ${total} test cases and ${samplePrograms} visible Main examples with the real JDK.`,
  );
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
