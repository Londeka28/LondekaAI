const form = document.getElementById('translate-form');
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const text = document.getElementById('source-text').value;
  const file = document.getElementById('source-file').files[0];
  const targetLang = document.getElementById('target-lang').value;
  const errorEl = document.getElementById('translate-error');
  const button = form.querySelector('button');
  errorEl.textContent = '';
  if (file && text.trim()) { errorEl.textContent = 'Use pasted text or a file, one at a time.'; return; }
  if (!file && !text.trim()) { errorEl.textContent = 'Paste text or select a file.'; return; }
  if (file && file.size > 4000000) { errorEl.textContent = 'Upload limit is 4 MB.'; return; }
  button.disabled = true;
  button.textContent = 'Translating…';
  try {
    let body;
    let headers;
    if (file) {
      body = new FormData();
      body.append('file', file);
      body.append('target_lang', targetLang);
    } else {
      body = JSON.stringify({ input_text: text, source_lang: 'english', target_lang: targetLang });
      headers = { 'Content-Type': 'application/json' };
    }
    const res = await fetch(`${API_BASE}/api/${file ? 'upload-translate' : 'translate'}`, { method: 'POST', headers, body });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Translation failed.');
    document.getElementById('original-output').textContent = file ? data.extracted_text : text;
    document.getElementById('translated-heading').textContent = targetLang === 'zulu' ? 'isiZulu' : 'Afrikaans';
    document.getElementById('translated-output').textContent = data.translation;
  } catch (err) {
    errorEl.textContent = err.message || 'Translation failed. Please try again.';
  } finally {
    button.disabled = false;
    button.textContent = 'Translate';
  }
});
