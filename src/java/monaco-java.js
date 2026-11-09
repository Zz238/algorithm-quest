import * as monaco from 'monaco-editor/editor/editor.api.js';
import 'monaco-editor/languages/definitions/java/register.js';
import 'monaco-editor/editor/browser/coreCommands.js';
import 'monaco-editor/editor/contrib/clipboard/browser/clipboard.js';
import 'monaco-editor/editor/contrib/bracketMatching/browser/bracketMatching.js';
import 'monaco-editor/editor/contrib/comment/browser/comment.js';
import 'monaco-editor/editor/contrib/find/browser/findController.js';
import 'monaco-editor/editor/contrib/folding/browser/folding.js';
import 'monaco-editor/editor/contrib/linesOperations/browser/linesOperations.js';
import 'monaco-editor/editor/contrib/wordOperations/browser/wordOperations.js';
import 'monaco-editor/editor/contrib/snippet/browser/snippetController2.js';
import 'monaco-editor/editor/contrib/suggest/browser/suggestController.js';
import 'monaco-editor/editor/contrib/hover/browser/hoverContribution.js';
import 'monaco-editor/editor/contrib/parameterHints/browser/parameterHints.js';
import 'monaco-editor/editor/contrib/toggleTabFocusMode/browser/toggleTabFocusMode.js';
import 'monaco-editor/features/codicon/register.js';
import EditorWorker from 'monaco-editor/editor/editor.worker.js?worker';
import { JAVA_WORD_HELP, javaSuggestions } from './editor-support.js';

self.MonacoEnvironment = {
  getWorker() {
    return new EditorWorker();
  },
};
const contexts = new WeakMap();
const kinds = {
  keyword: monaco.languages.CompletionItemKind.Keyword,
  snippet: monaco.languages.CompletionItemKind.Snippet,
  variable: monaco.languages.CompletionItemKind.Variable,
  method: monaco.languages.CompletionItemKind.Method,
  field: monaco.languages.CompletionItemKind.Field,
};
const completionProvider = monaco.languages.registerCompletionItemProvider('java', {
  triggerCharacters: ['.'],
  provideCompletionItems(model, position) {
    const word = model.getWordUntilPosition(position);
    const range = {
      startLineNumber: position.lineNumber,
      endLineNumber: position.lineNumber,
      startColumn: word.startColumn,
      endColumn: word.endColumn,
    };
    const before = model.getLineContent(position.lineNumber).slice(0, position.column - 1);
    return {
      suggestions: javaSuggestions(model.getValue(), before, contexts.get(model) || '').map((item) => ({
        ...item,
        kind: kinds[item.kind],
        range,
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      })),
    };
  },
});
const hoverProvider = monaco.languages.registerHoverProvider('java', {
  provideHover(model, position) {
    const word = model.getWordAtPosition(position);
    if (!word || !JAVA_WORD_HELP[word.word]) return null;
    return {
      range: new monaco.Range(
        position.lineNumber,
        word.startColumn,
        position.lineNumber,
        word.endColumn,
      ),
      contents: [{ value: '**' + word.word + '**' }, { value: JAVA_WORD_HELP[word.word] }],
    };
  },
});
const signatures = {
  'System.out.println': ['System.out.println(value)', ['value：要显示的值，显示后换行']],
  'System.out.print': ['System.out.print(value)', ['value：要显示的值，不自动换行']],
  'Math.max': ['Math.max(a, b)', ['a：第一个候选', 'b：第二个候选']],
  'Math.min': ['Math.min(a, b)', ['a：第一个候选', 'b：第二个候选']],
  'Arrays.sort': ['Arrays.sort(array)', ['array：需要原地升序排列的数组；需要导入 java.util.Arrays']],
};
const signatureProvider = monaco.languages.registerSignatureHelpProvider('java', {
  signatureHelpTriggerCharacters: ['(', ','],
  provideSignatureHelp(model, position) {
    const text = model.getLineContent(position.lineNumber).slice(0, position.column - 1);
    const match = /(System\.out\.(?:println|print)|Math\.(?:max|min)|Arrays\.sort)\(([^()]*)$/.exec(
      text,
    );
    if (!match) return null;
    const [label, params] = signatures[match[1]];
    return {
      value: {
        signatures: [
          {
            label,
            documentation: 'Java 常用方法提示',
            parameters: params.map((p) => ({ label: p.split('：')[0], documentation: p })),
          },
        ],
        activeSignature: 0,
        activeParameter: Math.min(params.length - 1, match[2].split(',').length - 1),
      },
      dispose() {},
    };
  },
});
export function createJavaEditor(host, options, context) {
  const model = monaco.editor.createModel(options.value, 'java');
  contexts.set(model, context || '');
  const editor = monaco.editor.create(host, {
    ...options,
    model,
    value: undefined,
    language: undefined,
  });
  return { editor, model, monaco };
}
if (import.meta.hot)
  import.meta.hot.dispose(() => {
    completionProvider.dispose();
    hoverProvider.dispose();
    signatureProvider.dispose();
  });
