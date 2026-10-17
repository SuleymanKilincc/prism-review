import {validateAnalysis} from './logic.js';

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
