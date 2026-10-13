// Dictionary search, term details, AI explanation and learner suggestions (Phase 4).
const searchForm = document.getElementById("glossary-search-form");
const searchInput = document.getElementById("glossary-search-input");
const searchStatus = document.getElementById("search-status");
const resultsContainer = document.getElementById("glossary-results");

const suggestForm = document.getElementById("suggest-form");
const suggestStatus = document.getElementById("suggest-status");

const modalCard = document.getElementById("ai-modal-card");
const closeModalBtn = document.getElementById("close-modal-btn");

if (closeModalBtn && modalCard) {
  closeModalBtn.addEventListener("click", () => {
    modalCard.style.display = "none";
  });
}

async function fetchExplanation(term, context) {
  if (!modalCard) return;
  modalCard.style.display = "block";
  modalCard.scrollIntoView({ behavior: "smooth" });

  document.getElementById("modal-term-name").textContent = term;
  document.getElementById("modal-term-explanation").textContent = "Consulting AI space science tutor...";
  document.getElementById("modal-term-analogy").textContent = "";
  document.getElementById("modal-language-notes").textContent = "";

  try {
    const res = await fetch(`${API_BASE}/api/explain`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ term, context: context || "" }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to generate explanation");

    document.getElementById("modal-term-explanation").textContent = data.explanation || "";
    document.getElementById("modal-term-analogy").textContent = data.analogy || "";

    let notes = "";
    if (data.isizulu_note) notes += `isiZulu Context: ${data.isizulu_note}\n`;
    if (data.afrikaans_note) notes += `Afrikaans Context: ${data.afrikaans_note}`;
    document.getElementById("modal-language-notes").textContent = notes;
  } catch (err) {
    document.getElementById("modal-term-explanation").textContent =
      "Unable to fetch AI explanation right now. Please try again shortly.";
  }
}

function renderResults(terms) {
  if (!resultsContainer) return;
  resultsContainer.innerHTML = "";

  if (!terms || terms.length === 0) {
    resultsContainer.innerHTML = `<p class="notice">No matching terms found. Try a different keyword or suggest a new term below!</p>`;
    return;
  }

  terms.forEach((item) => {
    const card = document.createElement("article");
    card.className = "term-card";

    const title = document.createElement("h3");
    title.className = "term-title";
    title.textContent = item.english_term;
    card.appendChild(title);

    const langGrid = document.createElement("div");
    langGrid.className = "term-translations";
    langGrid.innerHTML = `
      <div class="lang-row">
        <span class="lang-tag">isiZulu</span>
        <span class="lang-text">${item.isizulu_wording || "—"}</span>
      </div>
      <div class="lang-row">
        <span class="lang-tag">Afrikaans</span>
        <span class="lang-text">${item.afrikaans_wording || "—"}</span>
      </div>
    `;
    card.appendChild(langGrid);

    if (item.definition) {
      const def = document.createElement("p");
      def.className = "term-definition";
      def.innerHTML = `<strong>Definition:</strong> ${item.definition}`;
      card.appendChild(def);
    }

    if (item.example) {
      const ex = document.createElement("p");
      ex.className = "term-example";
      ex.innerHTML = `<strong>RFP Example:</strong> <em>"${item.example}"</em>`;
      card.appendChild(ex);
    }

    const explainBtn = document.createElement("button");
    explainBtn.type = "button";
    explainBtn.className = "button button-small";
    explainBtn.textContent = "Explain with AI & Analogy";
    explainBtn.addEventListener("click", () => {
      fetchExplanation(item.english_term, item.definition || item.example || "");
    });
    card.appendChild(explainBtn);

    resultsContainer.appendChild(card);
  });
}

async function performSearch(query) {
  if (!query) return;
  if (searchStatus) searchStatus.textContent = "Searching glossary...";

  try {
    const res = await fetch(`${API_BASE}/api/glossary/search?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.error || "Search failed");

    if (searchStatus) {
      searchStatus.textContent = `Found ${data.results.length} term(s) matching "${query}".`;
    }
    renderResults(data.results);
  } catch (err) {
    if (searchStatus) searchStatus.textContent = err.message;
  }
}

if (searchForm) {
  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    performSearch(query);
  });
}

if (suggestForm) {
  suggestForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const suggestedEquivalent = document.getElementById("suggest-term").value.trim();
    const language = document.getElementById("suggest-lang").value;
    const reason = document.getElementById("suggest-reason").value.trim();
    const submitBtn = document.getElementById("suggest-btn");

    if (!suggestedEquivalent) return;

    try {
      submitBtn.disabled = true;
      submitBtn.textContent = "Submitting...";
      if (suggestStatus) suggestStatus.textContent = "";

      const res = await fetch(`${API_BASE}/api/glossary/suggest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          suggested_equivalent: suggestedEquivalent,
          language,
          reason_or_example: reason,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");

      if (suggestStatus) {
        suggestStatus.textContent = "Thank you! Your term suggestion was submitted for mentor review.";
      }
      suggestForm.reset();
    } catch (err) {
      if (suggestStatus) suggestStatus.textContent = err.message;
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit for Review";
    }
  });
}

// Automatically load popular terms on page open
document.addEventListener("DOMContentLoaded", () => {
  performSearch("gravity");
});
