// Upload flow, language columns and term highlights (Phases 2-4).
const form = document.getElementById("translate-form");

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const text = document.getElementById("source-text").value;
    const targetLang = document.getElementById("target-lang").value;
    const errorEl = document.getElementById("translate-error");
    const originalEl = document.getElementById("original-output");
    const translatedEl = document.getElementById("translated-output");
    const headingEl = document.getElementById("translated-heading");
    errorEl.textContent = "";

    try {
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

      originalEl.textContent = text;
      headingEl.textContent = targetLang === "zulu" ? "isiZulu" : "Afrikaans";
      translatedEl.textContent = data.translation;
    } catch (err) {
      errorEl.textContent = err.message;
    }
  });
}