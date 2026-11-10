import { mkdtempSync, mkdirSync, rmSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
const directory = mkdtempSync(join(tmpdir(), 'quest-runner-'));
try {
  const compiler = ['-m', 'jdk.compiler/com.sun.tools.javac.Main'];
  const output = ['-d', directory, 'src/java/Runner.java'];
  try {
    execFileSync('java', [...compiler, '--release', '8', ...output], {
      encoding: 'utf8',
      stdio: 'pipe',
    });
  } catch (error) {
    // Some slim JDK images omit ct.sym; retain Java-8 bytecode for the Java-17 browser VM.
    if (!/release version 8 not supported/.test(String(error.stderr))) throw error;
    execFileSync('java', [...compiler, '-source', '8', '-target', '8', '-Xlint:-options', ...output], {
      stdio: 'inherit',
    });
  }
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
