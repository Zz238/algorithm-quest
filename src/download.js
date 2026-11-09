export function downloadText(filename, text, type = 'text/plain;charset=utf-8') {
  downloadBlob(filename,new Blob([text], { type }));
}
export function downloadBlob(filename, blob) {
  const url = URL.createObjectURL(blob),
    link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
