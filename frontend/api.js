import {validateAnalysis} from './logic.js';

// A missing model field is unknown, never evidence that the server uses a fake model.
export async function readHealth({baseUrl, fetchImpl = fetch} = {}) {
  try {
    const response = await fetchImpl(`${baseUrl.replace(/\/$/, '')}/health`, {
      signal: AbortSignal.timeout(4000), cache: 'no-store'
    });
    if (!response.ok) return {status: 'unavailable', model: null};
    const health = await response.json();
    if (health?.status !== 'ok') return {status: 'unavailable', model: null};
    return {status: 'ok', model: typeof health.model === 'string' && health.model.trim() ? health.model.trim() : null};
  } catch {
    return {status: 'unavailable', model: null};
  }
}

// Keep the wire format aligned with docs/api.md. UI language is not sent to the model.
export async function analyzePR(input, {baseUrl, fetchImpl = fetch} = {}) {
  let response;
  try {
    response = await fetchImpl(`${baseUrl.replace(/\/$/, '')}/analyze`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({title: input.title, description: input.description, diff: input.diff}),
      signal: AbortSignal.timeout(120000)
    });
  } catch (cause) {
    throw Object.assign(new Error('Analysis connection failed', {cause}), {
      code: cause.name === 'TimeoutError' ? 'timeout' : 'network'
    });
  }
  if (!response.ok) {
    throw Object.assign(new Error('Analysis request failed'), {
      code: response.status === 503 ? 'modelUnavailable' : 'requestError',
      status: response.status
    });
  }
  try {
    return validateAnalysis(await response.json());
  } catch (cause) {
    throw Object.assign(new Error('Invalid analysis response', {cause}), {code: 'invalidResponse'});
  }
}
