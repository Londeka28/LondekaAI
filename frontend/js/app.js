// Shared interface behaviour. Set API_BASE to the Render API URL when deployed.
const API_BASE = window.ZASDC_API_BASE || "http://localhost:5000";

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
