document.getElementById('dictionary-search').addEventListener('submit', async (event) => {
  event.preventDefault();
  const status = document.getElementById('dictionary-status');
  const results = document.getElementById('dictionary-results');
  results.replaceChildren();
  status.textContent = 'Searching…';
  try {
    const query = document.getElementById('term-query').value;
    const response = await fetch(`${API_BASE}/api/glossary/search?q=${encodeURIComponent(query)}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Search failed.');
    status.textContent = data.results.length ? `${data.results.length} reviewed terms found.` : 'No reviewed terms found. You can suggest a translation below.';
    for (const term of data.results) {
      const article = document.createElement('article');
      const heading = document.createElement('h3');
      heading.textContent = term.english_term;
      article.append(heading);
      for (const [label, value] of [['isiZulu', term.isizulu_wording], ['Afrikaans', term.afrikaans_wording], ['Definition', term.definition], ['Example', term.example]]) {
        if (!value) continue;
        const p = document.createElement('p');
        p.textContent = `${label}: ${value}`;
        article.append(p);
      }
      results.append(article);
    }
  } catch (error) { status.textContent = error.message; }
});

document.getElementById('suggestion-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const button = form.querySelector('button');
  const status = document.getElementById('suggestion-status');
  button.disabled = true;
  status.textContent = 'Submitting…';
  try {
    const response = await fetch(`${API_BASE}/api/glossary/suggest`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        suggested_equivalent: document.getElementById('equivalent').value,
        language: document.getElementById('suggestion-language').value,
        reason_or_example: document.getElementById('suggestion-reason').value,
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Submission failed.');
    status.textContent = data.message;
    form.reset();
  } catch (error) { status.textContent = error.message; }
  finally { button.disabled = false; }
});
