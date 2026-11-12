<script setup>
import { computed } from 'vue';
const props = defineProps({ source: String, label: String });
const lines = computed(() =>
  (props.source || '').split('\n').map((line) =>
    [
      ...line.matchAll(
        /(\/\/.*$|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\b(?:public|private|protected|static|class|void|int|long|boolean|String|return|if|else|for|while|new|null|true|false|this|import|double)\b|\b\d+\b|[^"'\w/]+|\w+|.)/g,
      ),
    ].map(([text]) => ({
      text,
      kind: text.startsWith('//')
        ? 'comment'
        : /^["']/.test(text)
          ? 'string'
          : /^\d+$/.test(text)
            ? 'number'
            : /^(public|private|protected|static|class|void|int|long|boolean|String|return|if|else|for|while|new|null|true|false|this|import|double)$/.test(
                  text,
                )
              ? 'keyword'
              : '',
    })),
  ),
);
</script>
<template>
  <details class="readonly-java">
    <summary>{{ label || '展开 Java 代码' }} · 只读高亮</summary>
    <pre
      class="study-code"
    ><code><span v-for="(tokens, i) in lines" :key="i" class="readonly-line"><span class="readonly-number" aria-hidden="true">{{ i + 1 }}</span><span><span v-for="(token, j) in tokens" :key="j" :class="'syntax-' + token.kind">{{ token.text }}</span></span>{{ '\n' }}</span></code></pre>
  </details>
</template>
