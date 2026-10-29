import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';

const source = await readFile(new URL('./evaluationRequest.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ES2022,
    target: ts.ScriptTarget.ES2022,
  },
});
const moduleUrl = `data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`;
const {
  createOnlineEvaluationMessage,
  createWhatsAppLink,
  validateEvaluationPreferences,
} = await import(moduleUrl);

const today = '2026-10-29';

test('trims a valid name and accepts today with a valid time', () => {
  assert.deepEqual(
    validateEvaluationPreferences({ name: '  Ana Silva  ', date: today, time: '09:30' }, today),
    { valid: true, name: 'Ana Silva' },
  );
});

test('rejects blank, too-short, and overlong names', () => {
  for (const name of [' ', 'A', 'A'.repeat(81)]) {
    assert.equal(validateEvaluationPreferences({ name, date: today, time: '09:30' }, today).valid, false);
  }
});

test('rejects malformed and past dates, and accepts a real leap day', () => {
  for (const date of ['2026-02-30', '29/10/2026', '2026-10-28']) {
    assert.equal(validateEvaluationPreferences({ name: 'Ana', date, time: '09:30' }, today).valid, false);
  }
  assert.equal(validateEvaluationPreferences({ name: 'Ana', date: '2028-02-29', time: '09:30' }, today).valid, true);
});

test('rejects malformed or out-of-range times', () => {
  for (const time of ['9:30', '24:00', '12:60', '09:30<script>']) {
    assert.equal(validateEvaluationPreferences({ name: 'Ana', date: today, time }, today).valid, false);
  }
});

test('encodes patient-provided text and restricts WhatsApp to the expected host', () => {
  const message = createOnlineEvaluationMessage('<img src=x onerror=alert(1)> & teste', today, '09:30');
  const link = createWhatsAppLink(message);
  const parsed = new URL(link);

  assert.equal(parsed.origin, 'https://wa.me');
  assert.equal(parsed.pathname, '/5561994443807');
  assert.equal(parsed.searchParams.get('text'), message);
  assert.equal(createWhatsAppLink('olá', 'https://example.invalid').startsWith('https://wa.me/5561994443807?'), true);
});
