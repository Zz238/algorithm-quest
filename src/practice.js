import {equalOutput} from './logic.js';

// Only unordered result arrays use a problem-specific comparison. Counts remain numbers.
export function checkLessonAnswer(question,value,codeKey){
 const arrayAnswer=Array.isArray(question.answer)&&Array.isArray(value);
 const problem=arrayAnswer?(codeKey==='subsets'?78:codeKey==='hash'?1:undefined):undefined;
 return equalOutput(value,question.answer,problem);
}
