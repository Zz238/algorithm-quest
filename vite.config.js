import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
export default defineConfig(({ mode }) => ({
  plugins: [vue()],
  server: { allowedHosts: ['terminal.local'] },
  base: './',
  build: {
    manifest: true,
    cssCodeSplit: mode !== 'offline',
    rollupOptions: {
      output:
        mode === 'offline'
          ? { inlineDynamicImports: true }
          : {
              manualChunks(id) {
                if (id.includes('node_modules/@supabase/')) return 'supabase';
                if (id.includes('node_modules/@vue/') || id.includes('node_modules/vue/')) return 'vue';
              },
            },
    },
  },
}));
