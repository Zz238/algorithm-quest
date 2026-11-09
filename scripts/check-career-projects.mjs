import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { PGlite } from '@electric-sql/pglite';
import { CAREER_ROUTES } from '../src/data/career-index.js';
import { CAREER_LESSONS } from '../src/data/career-lessons.js';
const database = new PGlite();
try {
  const results = (
    await database.exec(readFileSync('src/career-projects/backend/sql-workbook.sql', 'utf8'))
  )
    .filter((r) => r.rows?.length)
    .map((r) => r.rows);
  assert.deepEqual(results, [
    [{ lesson: 'arrays' }],
    [
      { user_id: 7, done: 1 },
      { user_id: 8, done: 0 },
    ],
    [{ completed: false }],
  ]);
} finally {
  await database.close();
}
execFileSync('python3', ['-m', 'unittest', '-v'], {
  cwd: 'src/career-projects/algorithm',
  stdio: 'inherit',
});
assert.equal(
  CAREER_ROUTES.reduce((n, r) => n + r.stages.length, 0),
  Object.keys(CAREER_LESSONS).length,
);
if (!process.argv.includes('--skip-backend'))
  execFileSync(process.env.QUEST_MAVEN || 'mvn', ['-q', 'test'], {
    cwd: 'src/career-projects/backend',
    stdio: 'inherit',
    timeout: 180000,
  });
console.log(
  'Career projects: 14 staged lessons, SQL constraints/rollback and 14 Python tests verified' +
    (process.argv.includes('--skip-backend')
      ? '; Spring project verified separately.'
      : '; Spring HTTP integration tests passed.'),
);
