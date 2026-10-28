// Shared interface behaviour. Use the same-origin Netlify API by default.
const API_BASE = window.ZASDC_API_BASE || "";

async function checkApi() {
  const el = document.getElementById("api-status");
  if (!el) return;
  try {
    const res = await fetch(`${API_BASE}/api/health`);
    if (!res.ok) throw new Error();
    el.textContent = "Service status: connected.";
  } catch {
    el.textContent = "Service status: the translation service is not reachable right now.";
  }
}
document.addEventListener("DOMContentLoaded", checkApi);
