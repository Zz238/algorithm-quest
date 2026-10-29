export const C=(question,options,answer,explanation)=>({kind:'choice',question,options,answer,explanation});
export const N=(question,answer,explanation)=>({kind:'output',question,answer,explanation});
export const U=(title,goals,terms,sections,example,mistakes,practice,extra={})=>({title,goals,terms:terms.map(([term,meaning,example])=>({term,meaning,example})),sections:sections.map(([title,...paragraphs])=>({title,paragraphs})),example:{setup:example[0],steps:example.slice(1,-1),conclusion:example.at(-1)},mistakes:mistakes.map(([wrong,right])=>({wrong,right})),practice,...extra});
