import test from 'node:test';
import assert from 'node:assert/strict';
import api from '../netlify/functions/api.mjs';

function request(path: string, data?: unknown) {
  return new Request(`http://localhost${path}`, data === undefined ? undefined : {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
  });
}

test('health endpoint and routing', async () => {
  assert.deepEqual(await (await api(request('/api/health'))).json(), { status: 'ok' });
  assert.equal((await api(request('/api/missing'))).status, 404);
  const response = await api(request('/api/translate'));
  assert.equal(response.status, 405);
  assert.equal(response.headers.get('allow'), 'POST');
});

test('translation accepts the frontend contract and returns both response formats', async () => {
  const response = await api(request('/api/translate', { input_text: 'Space settlement', source_lang: 'english', target_lang: 'english' }));
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.translation, 'Space settlement');
  assert.equal(data.translated_text, data.translation);
});

test('translation rejects invalid JSON, languages and oversized text before inference', async () => {
  for (const data of [{}, [], null, { text: ' ' }, { text: 'hello', target_lang: 'invalid' }, { text: 'a'.repeat(12001) }]) {
    assert.equal((await api(request('/api/translate', data))).status, 400);
  }
  const response = await api(new Request('http://localhost/api/translate', { method: 'POST', body: '{' }));
  assert.equal(response.status, 400);
});

test('legacy language mode remains compatible', async () => {
  const response = await api(request('/api/translate', { text: 'Habitat', language_mode: 'en' }));
  assert.equal(response.status, 200);
  assert.equal((await response.json()).translated_text, 'Habitat');
});

test('TXT upload extracts text and uses the translation response contract', async () => {
  const form = new FormData();
  form.append('file', new File(['Space habitat'], 'rfp.txt'));
  form.append('target_lang', 'english');
  const response = await api(new Request('http://localhost/api/upload-translate', { method: 'POST', body: form }));
  assert.equal(response.status, 200);
  assert.equal((await response.json()).extracted_text, 'Space habitat');
});

test('upload rejects unsupported, oversized and missing files', async () => {
  for (const file of [new File(['x'], 'rfp.exe'), new File(['a'.repeat(4000001)], 'rfp.txt'), null]) {
    const form = new FormData();
    if (file) form.append('file', file);
    const response = await api(new Request('http://localhost/api/upload-translate', { method: 'POST', body: form }));
    assert.equal(response.status, file?.size === 4000001 ? 413 : 400);
  }
});

test('glossary validates inputs before accessing storage', async () => {
  assert.equal((await api(request('/api/glossary/search?q='))).status, 400);
  assert.equal((await api(request('/api/glossary/suggest', { suggested_equivalent: 'word', language: 'invalid' }))).status, 400);
  assert.equal((await api(request('/api/glossary/suggest', {}))).status, 400);
});
