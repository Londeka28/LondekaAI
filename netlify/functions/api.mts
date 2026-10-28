import type { Config } from '@netlify/functions';
import { and, eq, ilike, or } from 'drizzle-orm';
import { getDb } from '../../db/index.js';
import { glossaryTerms, termSuggestions } from '../../db/schema.js';
import { InputError, translate, translationInput } from '../lib/translation.mjs';

export default async (req: Request) => {
  const url = new URL(req.url);
  const path = url.pathname;
  const routes: Record<string, string> = {
    '/api/health': 'GET', '/api/translate': 'POST', '/api/upload-translate': 'POST',
    '/api/glossary/search': 'GET', '/api/glossary/suggest': 'POST',
  };
  const method = routes[path];
  if (!method) return Response.json({ error: 'Not found.' }, { status: 404 });
  if (req.method !== method) return Response.json({ error: 'Method not allowed.' }, { status: 405, headers: { Allow: method } });
  try {
    if (path === '/api/health') return Response.json({ status: 'ok' });
    if (Number(req.headers.get('content-length')) > 4_000_000) return Response.json({ error: 'Upload limit is 4 MB.' }, { status: 413 });
    if (path === '/api/translate') {
      const data = await readJson(req);
      const input = translationInput(data);
      const translation = await translate(data);
      return Response.json({ translation, translated_text: translation, original_text: input.text, language_mode: data.language_mode });
    }
    if (path === '/api/upload-translate') {
      let form: FormData;
      try { form = await req.formData(); } catch { throw new InputError('Upload a TXT, PDF, or DOCX file.'); }
      const file = form.get('file');
      if (!(file instanceof File) || !file.size) throw new InputError('Choose a non-empty file.');
      if (file.size > 4_000_000) return Response.json({ error: 'Upload limit is 4 MB.' }, { status: 413 });
      const buffer = Buffer.from(await file.arrayBuffer());
      let text: string;
      try {
        if (/\.txt$/i.test(file.name)) text = buffer.toString('utf8');
        else if (/\.docx$/i.test(file.name)) {
          const mammoth = await import('mammoth');
          text = (await mammoth.extractRawText({ buffer })).value;
        } else if (/\.pdf$/i.test(file.name)) {
          const pdf = (await import('pdf-parse/lib/pdf-parse.js')).default;
          text = (await pdf(buffer)).text;
        } else throw new InputError('Supported formats: TXT, text-based PDF, and DOCX.');
      } catch (error) {
        if (error instanceof InputError) throw error;
        throw new InputError('Unable to read this document. Try a text-based PDF, DOCX, or TXT file.');
      }
      const translation = await translate({ input_text: text, target_lang: form.get('target_lang') ?? undefined, language_mode: form.get('language_mode') ?? 'en-zu' });
      return Response.json({ filename: file.name, extracted_text: text, translated_text: translation, translation });
    }
    if (path === '/api/glossary/search') {
      const query = url.searchParams.get('q')?.trim();
      if (!query || query.length > 200) throw new InputError('Enter a search term of up to 200 characters.');
      const pattern = `%${query.replace(/[\\%_]/g, '\\$&')}%`;
      const results = await getDb().select().from(glossaryTerms).where(and(
        eq(glossaryTerms.status, 'approved'),
        or(ilike(glossaryTerms.english_term, pattern), ilike(glossaryTerms.isizulu_wording, pattern), ilike(glossaryTerms.afrikaans_wording, pattern)),
      )).limit(50);
      return Response.json({ query, results });
    }
    const data = await readJson(req);
    if (typeof data.suggested_equivalent !== 'string' || !data.suggested_equivalent.trim() || data.suggested_equivalent.length > 500) throw new InputError('Enter a suggested equivalent of up to 500 characters.');
    if (!['english', 'zulu', 'afrikaans'].includes(String(data.language))) throw new InputError('Choose a supported language.');
    if (data.reason_or_example !== undefined && (typeof data.reason_or_example !== 'string' || data.reason_or_example.length > 2000)) throw new InputError('Keep the explanation under 2,000 characters.');
    await getDb().insert(termSuggestions).values({ suggested_equivalent: data.suggested_equivalent.trim(), language: String(data.language), reason_or_example: String(data.reason_or_example ?? '') });
    return Response.json({ message: 'Term suggestion submitted for review.' }, { status: 201 });
  } catch (error) {
    if (error instanceof InputError) return Response.json({ error: error.message }, { status: 400 });
    return Response.json({ error: 'The service is temporarily unavailable. Please try again shortly.' }, { status: 503 });
  }
};

async function readJson(req: Request): Promise<Record<string, unknown>> {
  try {
    const data = await req.json();
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error();
    return data;
  } catch { throw new InputError('Send a valid JSON object.'); }
}

export const config: Config = { path: '/api/*' };
