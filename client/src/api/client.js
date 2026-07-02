const API_BASE = '/api';

export async function fetchModels() {
  const res = await fetch(`${API_BASE}/models`);
  return res.json();
}

export async function fetchModel(modelId) {
  const res = await fetch(`${API_BASE}/models/${modelId}`);
  return res.json();
}

export async function loadModel(model, params = {}) {
  const res = await fetch(`${API_BASE}/models/load`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, params }),
  });
  return res.json();
}

export async function unloadModel(model) {
  const res = await fetch(`${API_BASE}/models/unload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model }),
  });
  return res.json();
}

export async function fetchStats() {
  const res = await fetch(`${API_BASE}/stats`);
  return res.json();
}

export async function fetchMetrics() {
  const res = await fetch(`${API_BASE}/stats/metrics`);
  return res.json();
}

export async function fetchDevices() {
  const res = await fetch(`${API_BASE}/devices`);
  return res.json();
}

export async function fetchConfig() {
  const res = await fetch(`${API_BASE}/config`);
  return res.json();
}

export async function checkHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

export async function sendChat(messages, model, onChunk, params = {}) {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, model, stream: true, ...params }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Chat request failed');
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') continue;
        try {
          const parsed = JSON.parse(data);
          onChunk(parsed);
        } catch {}
      }
    }
  }
}
