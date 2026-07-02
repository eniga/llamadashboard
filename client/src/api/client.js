const API_BASE = '/api';

function url(path, baseUrl) {
  return baseUrl ? `${API_BASE}${path}?baseUrl=${encodeURIComponent(baseUrl)}` : `${API_BASE}${path}`;
}

export async function fetchModels(baseUrl) {
  const res = await fetch(url('/models', baseUrl));
  return res.json();
}

export async function fetchModel(modelId, baseUrl) {
  const res = await fetch(url(`/models/${modelId}`, baseUrl));
  return res.json();
}

export async function loadModel(model, params = {}, baseUrl) {
  const res = await fetch(url('/models/load', baseUrl), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, params, baseUrl }),
  });
  return res.json();
}

export async function unloadModel(model, baseUrl) {
  const res = await fetch(url('/models/unload', baseUrl), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, baseUrl }),
  });
  return res.json();
}

export async function fetchStats(baseUrl) {
  const res = await fetch(url('/stats', baseUrl));
  return res.json();
}

export async function fetchMetrics(baseUrl) {
  const res = await fetch(url('/stats/metrics', baseUrl));
  return res.json();
}

export async function fetchDevices(baseUrl) {
  const res = await fetch(url('/devices', baseUrl));
  return res.json();
}

export async function fetchConfig() {
  const res = await fetch(`${API_BASE}/config`);
  return res.json();
}

export async function saveConfig(data) {
  const res = await fetch(`${API_BASE}/config`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function testConnection(baseUrl, apiKey) {
  const body = {};
  if (baseUrl) body.llamaCppUrl = baseUrl;
  if (apiKey) body.llamaCppApiKey = apiKey;
  const res = await fetch(`${API_BASE}/config/test`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function checkHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

export async function sendChat(messages, model, params = {}) {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, model, ...params }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Chat request failed');
  }

  const data = await res.json();
  return data;
}
