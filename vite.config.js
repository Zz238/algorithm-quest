import {defineConfig} from 'vite';import vue from '@vitejs/plugin-vue';
export default defineConfig({plugins:[vue()],server:{allowedHosts:['terminal.local']},base:'./',build:{cssCodeSplit:false,rollupOptions:{output:{inlineDynamicImports:true}}}});
