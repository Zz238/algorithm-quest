import fs from 'node:fs';
let html=fs.readFileSync('dist/index.html','utf8');
html=html.replace(/<script[^>]*src="([^"]+)"[^>]*><\/script>/g,(_,p)=>'<script type="module">'+fs.readFileSync('dist/'+p.replace(/^\.\//,''),'utf8').replace(/<\/script/gi,'<\\/script')+'</script>');
html=html.replace(/<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g,(_,p)=>'<style>'+fs.readFileSync('dist/'+p.replace(/^\.\//,''),'utf8')+'</style>');
html=html.replace(/<link[^>]*rel="modulepreload"[^>]*>/g,'');
fs.writeFileSync('offline.html',html);console.log('Generated offline.html (double-click to open).');
