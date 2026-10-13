import test from "node:test";
import assert from "node:assert/strict";

// Import built or source TS via tsx / node
test("Health endpoint returns status ok", async () => {
  const { default: handler } = await import("../netlify/functions/health.mts");
  const req = new Request("http://localhost/api/health");
  const res = await handler(req);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.status, "ok");
});

test("Translate endpoint rejects missing text", async () => {
  const { default: handler } = await import("../netlify/functions/translate.mts");
  const req = new Request("http://localhost/api/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  const res = await handler(req);
  assert.equal(res.status, 400);
  const data = await res.json();
  assert.ok(data.error);
});

test("Glossary search requires q parameter", async () => {
  const { default: handler } = await import("../netlify/functions/glossary-search.mts");
  const req = new Request("http://localhost/api/glossary/search");
  const res = await handler(req);
  assert.equal(res.status, 400);
});

test("Glossary search returns curated results for gravity", async () => {
  const { default: handler } = await import("../netlify/functions/glossary-search.mts");
  const req = new Request("http://localhost/api/glossary/search?q=gravity");
  const res = await handler(req);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.query, "gravity");
  assert.ok(Array.isArray(data.results));
  assert.ok(data.results.length > 0);
  assert.equal(data.results[0].english_term, "Artificial Gravity");
});

test("Glossary suggest validates required fields", async () => {
  const { default: handler } = await import("../netlify/functions/glossary-suggest.mts");
  const req = new Request("http://localhost/api/glossary/suggest", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reason: "just a comment" }),
  });
  const res = await handler(req);
  assert.equal(res.status, 400);
});

test("Explain endpoint requires term", async () => {
  const { default: handler } = await import("../netlify/functions/explain.mts");
  const req = new Request("http://localhost/api/explain", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  const res = await handler(req);
  assert.equal(res.status, 400);
});
