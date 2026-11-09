import { mkdtempSync, mkdirSync, rmSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
const directory = mkdtempSync(join(tmpdir(), 'quest-runner-'));
try {
  execFileSync(
    'java',
    [
      '-m',
      'jdk.compiler/com.sun.tools.javac.Main',
      '--release',
      '8',
      '-d',
      directory,
      'src/java/Runner.java',
    ],
    { stdio: 'inherit' },
  );
  mkdirSync('src/java/generated', { recursive: true });
  const jar = join(directory, 'runner.jar');
  execFileSync(
    'java',
    [
      '-m',
      'jdk.jartool/sun.tools.jar.Main',
      '--create',
      '--file',
      jar,
      '--date=2026-01-01T00:00:00Z',
      '-C',
      directory,
      'quest',
    ],
    { stdio: 'inherit' },
  );
  writeFileSync('src/java/generated/runner.jar', readFileSync(jar));
  console.log('Built browser Java runner from reviewed Java source.');
} finally {
  rmSync(directory, { recursive: true, force: true });
}
