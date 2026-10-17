import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {analyzePR} from '../api.js';
import {messages, translate, localeFor} from '../i18n.js';
import {demoPRs, englishDemoPRs} from '../data.js';
import {filterPRs} from '../logic.js';

const result = {category: 'typo', quality: 5, risk: 'low', summary: 'Typo fixed.', reasons: [], missing: [], needs_human: false, suggested_reply: 'Thank you!'};
const input = {title: 'Fix typo', description: '', diff: '-recieve\n+receive'};

test('API uses /analyze and exactly title, description and diff; description may be empty', async () => {
  let request;
  const actual = await analyzePR({...input, body: 'must not be sent'}, {
    baseUrl: 'http://127.0.0.1:8000/',
    fetchImpl: async (url, options) => {
      request = {url, options};
      return new Response(JSON.stringify(result));
    }
  });
  assert.equal(request.url, 'http://127.0.0.1:8000/analyze');
  assert.equal(request.options.method, 'POST');
  assert.deepEqual(JSON.parse(request.options.body), input);
  assert.deepEqual(actual, result);
});

test('503 is a localized model-unavailable error; other failures keep their HTTP status', async () => {
  for (const status of [503, 422, 500]) {
    await assert.rejects(analyzePR(input, {
      baseUrl: 'http://127.0.0.1:8000',
      fetchImpl: async () => new Response(JSON.stringify({detail: 'Model is not available'}), {status})
    }), error => {
      assert.equal(error.code, status === 503 ? 'modelUnavailable' : 'requestError');
      assert.equal(error.status, status);
      return true;
    });
  }
  for (const language of ['tr', 'en']) {
    const text = translate(language, 'modelUnavailable');
    assert.notEqual(text, 'modelUnavailable');
    assert.match(text, language === 'tr' ? /hazır değil/ : /not ready/);
  }
});

test('invalid JSON, invalid schema, network failure and timeout have distinct UI errors', async () => {
  for (const response of [new Response('invalid json'), new Response(JSON.stringify({...result, quality: 9}))]) {
    await assert.rejects(analyzePR(input, {baseUrl: 'http://localhost:8000', fetchImpl: async () => response}), {code: 'invalidResponse'});
  }
  for (const [cause, code] of [[new TypeError('offline'), 'network'], [new DOMException('timeout', 'TimeoutError'), 'timeout']]) {
    await assert.rejects(analyzePR(input, {baseUrl: 'http://localhost:8000', fetchImpl: async () => { throw cause; }}), {code});
  }
});

test('both languages have the same keys and preserve interpolation placeholders', () => {
  assert.deepEqual(Object.keys(messages.en).sort(), Object.keys(messages.tr).sort());
  for (const key of Object.keys(messages.en)) {
    const placeholders = text => [...text.matchAll(/\{\w+\}/g)].map(match => match[0]).sort();
    assert.deepEqual(placeholders(messages.en[key]), placeholders(messages.tr[key]), key);
  }
  assert.equal(translate('en', 'results', {total: 12, visible: 5}), 'Showing 5 of 12 matching PRs');
  assert.equal(localeFor('en'), 'en-GB');
  assert.equal(localeFor('tr'), 'tr-TR');
});

test('all static HTML translation keys exist and form fields match the API contract', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  for (const match of html.matchAll(/data-i18n(?:-[\w-]+)?="([^"]+)"/g)) {
    assert.ok(messages.en[match[1]], match[1]);
    assert.ok(messages.tr[match[1]], match[1]);
  }
  assert.match(html, /name="description"/);
  assert.doesNotMatch(html, /name="body"|\/triage/);
  assert.doesNotMatch(html, /name="description" required/);
});

test('English demo fixtures retain original IDs, categories, scores and risk; search matches displayed content', () => {
  assert.equal(englishDemoPRs.length, demoPRs.length);
  englishDemoPRs.forEach((p, i) => {
    for (const key of ['id', 'category', 'quality', 'risk', 'needs_human']) assert.equal(p[key], demoPRs[i][key]);
    assert.doesNotMatch([p.title, p.summary, ...p.reasons, ...p.missing, p.suggested_reply, p.diff].join(' '), /[ğışçöüĞİŞÇÖÜ]/);
  });
  assert.equal(filterPRs(englishDemoPRs, {search: 'permission', risk: 'high'})[0].id, 141);
  assert.equal(filterPRs(demoPRs, {search: 'YETKİ', category: 'feature', risk: 'high'})[0].id, 141);
  for (const sort of ['newest', 'oldest', 'quality-desc', 'quality-asc', 'risk-desc']) {
    assert.deepEqual(filterPRs(englishDemoPRs, {sort}).map(p => p.id), filterPRs(demoPRs, {sort}).map(p => p.id));
  }
});

test('optional integration check against a running fake-model backend', {skip: !process.env.PRISM_TEST_URL}, async () => {
  const output = await analyzePR({...input, title: 'Fix typo in README'}, {baseUrl: process.env.PRISM_TEST_URL});
  assert.equal(output.category, 'typo');
  assert.equal(output.quality, 5);
  assert.equal(output.risk, 'low');
});
