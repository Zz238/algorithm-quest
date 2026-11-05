import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {codes} from '../src/data/course.js';
import {CODE_GUIDES} from '../src/data/code-guides.js';
import {JAVA_SAMPLE_CALLS,runnableExample} from '../src/data/java-samples.js';
const examples=JAVA_SAMPLE_CALLS;
assert.deepEqual(Object.keys(examples).sort(),Object.keys(CODE_GUIDES).sort());
const fallback='/usr/lib/jvm/java-17-openjdk-amd64/bin/java';
const java=process.env.ALGO_JAVA||(fs.existsSync(fallback)?fallback:'java');
const probe=spawnSync(java,['--list-modules'],{encoding:'utf8'});
if(!probe.stdout?.includes('jdk.compiler')){console.log('JDK compiler unavailable: guide example execution skipped.');process.exit(0);}
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'algo-guide-check-'));
try{
 for(const [key,[call,expected]] of Object.entries(examples)){
  const dir=path.join(tmp,key);fs.mkdirSync(dir);
  const example=runnableExample(key,codes[key]);
  fs.writeFileSync(path.join(dir,'Main.java'),example.source);
  const compile=spawnSync(java,['com.sun.tools.javac.Main','-encoding','UTF-8','Main.java'],{cwd:dir,encoding:'utf8',timeout:20000});
  assert.equal(compile.status,0,`${key}: ${compile.stderr}`);
  const run=spawnSync(java,['-cp',dir,'Main'],{encoding:'utf8',timeout:5000});
  assert.equal(run.status,0,`${key}: ${run.stderr}`);
  assert.equal(run.stdout.trim(),expected,`${key}: result differs from guide example`);
 }
 console.log(`All ${Object.keys(examples).length} Java guide examples compiled and matched their stated results.`);
}finally{fs.rmSync(tmp,{recursive:true,force:true});}
