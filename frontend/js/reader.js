// Upload flow, language columns and term highlights (Phases 2-4).
const form = document.getElementById("translate-form");
const uploadBtn = document.getElementById("upload-btn");
const fileInput = document.getElementById("file-upload");
const errorEl = document.getElementById("translate-error");
const resultContainer = document.getElementById("translate-result");
const originalEl = document.getElementById("original-output");
const translatedEl = document.getElementById("translated-output");
const headingEl = document.getElementById("translated-heading");
const explanationBox = document.getElementById("ai-explanation-box");

async function explainTerm(term) {
  if (!term || !explanationBox) return;
  try {
    explanationBox.style.display = "block";
    document.getElementById("term-name").textContent = term;
    document.getElementById("explain-definition").textContent = "Consulting AI tutor for explanation and analogy...";
    document.getElementById("explain-analogy").textContent = "";
    document.getElementById("explain-notes").textContent = "";

    const res = await fetch(`${API_BASE}/api/explain`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ term }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to fetch explanation");

    document.getElementById("explain-definition").textContent = data.explanation || "";
    document.getElementById("explain-analogy").textContent = data.analogy || "";
    
    let notes = "";
    if (data.isizulu_note) notes += `isiZulu Context: ${data.isizulu_note}\n`;
    if (data.afrikaans_note) notes += `Afrikaans Context: ${data.afrikaans_note}`;
    document.getElementById("explain-notes").textContent = notes;
  } catch (err) {
    document.getElementById("explain-definition").textContent = "Could not generate explanation right now.";
  }
}

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const text = document.getElementById("source-text").value.trim();
    const targetLang = document.getElementById("target-lang").value;
    const submitBtn = document.getElementById("translate-btn");
    if (errorEl) errorEl.textContent = "";

    if (!text) {
      if (fileInput && fileInput.files.length > 0) {
        uploadFile();
        return;
      }
      if (errorEl) errorEl.textContent = "Please enter text or select a file to translate.";
      return;
    }

    try {
      submitBtn.disabled = true;
      submitBtn.textContent = "Translating...";

      const res = await fetch(`${API_BASE}/api/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input_text: text,
          source_lang: "english",
          target_lang: targetLang,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Translation failed.");

      if (resultContainer) resultContainer.style.display = "grid";
      if (originalEl) originalEl.textContent = text;
      if (headingEl) headingEl.textContent = targetLang === "zulu" ? "isiZulu" : "Afrikaans";
      if (translatedEl) translatedEl.textContent = data.translation || data.translated_text;
    } catch (err) {
      if (errorEl) errorEl.textContent = err.message;
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Translate Text";
    }
  });
}

async function uploadFile() {
  if (!fileInput || fileInput.files.length === 0) {
    if (errorEl) errorEl.textContent = "Please select a file to upload (.txt, .pdf, .docx).";
    return;
  }

  const file = fileInput.files[0];
  const targetLang = document.getElementById("target-lang").value;
  const languageMode = targetLang === "afrikaans" ? "en-af" : "en-zu";
  if (errorEl) errorEl.textContent = "";

  const formData = new FormData();
  formData.append("file", file);
  formData.append("language_mode", languageMode);

  try {
    if (uploadBtn) {
      uploadBtn.disabled = true;
      uploadBtn.textContent = "Extracting & Translating...";
    }

    const res = await fetch(`${API_BASE}/api/upload-translate`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "File translation failed.");

    if (resultContainer) resultContainer.style.display = "grid";
    if (originalEl) originalEl.textContent = data.extracted_text;
    if (headingEl) headingEl.textContent = targetLang === "zulu" ? "isiZulu" : "Afrikaans";
    if (translatedEl) translatedEl.textContent = data.translation || data.translated_text;
  } catch (err) {
    if (errorEl) errorEl.textContent = err.message;
  } finally {
    if (uploadBtn) {
      uploadBtn.disabled = false;
      uploadBtn.textContent = "Upload & Translate";
    }
  }
}

if (uploadBtn) {
  uploadBtn.addEventListener("click", uploadFile);
}
