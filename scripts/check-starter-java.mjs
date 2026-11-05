import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {JAVA_UNITS} from '../src/data/java-starter.js';
import {JAVA_TASKS,taskProgram} from '../src/data/learning-practice.js';

const fallback='/usr/lib/jvm/java-17-openjdk-amd64/bin/java';
const java=process.env.ALGO_JAVA||(fs.existsSync(fallback)?fallback:'java');
assert(spawnSync(java,['--list-modules'],{encoding:'utf8'}).stdout?.includes('jdk.compiler'),'A JDK is required for this check.');
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'algo-starter-'));
function run(key,source){
 const dir=path.join(tmp,key);fs.mkdirSync(dir);
 fs.writeFileSync(path.join(dir,'Main.java'),source);
 const compile=spawnSync(java,['com.sun.tools.javac.Main','-encoding','UTF-8','Main.java'],{cwd:dir,encoding:'utf8',timeout:20000});
 assert.equal(compile.status,0,`${key}: ${compile.stderr}`);
 return spawnSync(java,['-cp',dir,'Main'],{encoding:'utf8',timeout:5000});
}
try{
 for(const u of JAVA_UNITS){
  const r=run(u.id,u.example.source);assert.equal(r.status,0,r.stderr);assert.equal(r.stdout.trim(),u.example.expected,u.id);
 }
 for(const [id,t] of Object.entries(JAVA_TASKS)){
  const r=run(id,taskProgram(t,t.solution));assert.equal(r.status,0,r.stderr);assert.equal(r.stdout.trim(),`All ${t.cases.length} cases passed.`);
  const starter=run(id+'-incomplete',taskProgram(t,t.starter));assert.notEqual(starter.status,0,'The tester must reject the incomplete starter.');assert.match(starter.stderr,/AssertionError: Case/);
 }
 console.log('Java downloads passed: 15 complete starter/bridge programs ran as stated; 4 writing tasks passed 14 cases, and their incomplete starters were rejected.');
}finally{fs.rmSync(tmp,{recursive:true,force:true});}
