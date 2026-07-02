const express = require('express');
const router = express.Router();
const axios = require('axios');

// In-memory config store (survives restarts when backed by file)
let configStore = {
  llamaCppUrl: process.env.LLAMACPP_URL || 'https://llm.aradhel.dev/v1',
  llamaCppApiKey: process.env.LLAMACPP_API_KEY || '',
  dashboardName: process.env.DASHBOARD_NAME || 'Llama Dashboard',
  refreshInterval: parseInt(process.env.REFRESH_INTERVAL || '10000', 10),
  theme: process.env.THEME || 'dark',
  maxTokens: parseInt(process.env.MAX_TOKENS || '4096', 10),
  primaryGpu: process.env.PRIMARY_GPU || 'NVIDIA RTX Pro 4000 Blackwell',
  vram: process.env.VRAM || '24576',
  cudaVersion: process.env.CUDA_VERSION || '12.x',
  llamaVersion: process.env.LLAMA_VERSION || 'built-in'
};

// GET /api/config - Get dashboard configuration
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: { ...configStore }
  });
});

// POST /api/config - Update configuration
router.post('/', (req, res) => {
  const updates = req.body;

  // Validate and sanitize
  if (updates.llamaCppUrl && typeof updates.llamaCppUrl === 'string') {
    configStore.llamaCppUrl = updates.llamaCppUrl.replace(/\/+$/, '');
  }
  if (updates.llamaCppApiKey !== undefined) {
    configStore.llamaCppApiKey = updates.llamaCppApiKey;
  }
  if (updates.dashboardName && typeof updates.dashboardName === 'string') {
    configStore.dashboardName = updates.dashboardName;
  }
  if (updates.refreshInterval && !isNaN(updates.refreshInterval)) {
    configStore.refreshInterval = Math.max(1000, parseInt(updates.refreshInterval, 10));
  }
  if (updates.theme) {
    configStore.theme = updates.theme;
  }
  if (updates.maxTokens && !isNaN(updates.maxTokens)) {
    configStore.maxTokens = parseInt(updates.maxTokens, 10);
  }
  if (updates.primaryGpu && typeof updates.primaryGpu === 'string') {
    configStore.primaryGpu = updates.primaryGpu;
  }
  if (updates.vram && !isNaN(updates.vram)) {
    configStore.vram = parseInt(updates.vram, 10);
  }

  res.json({
    success: true,
    data: { ...configStore },
    message: 'Configuration saved successfully'
  });
});

// POST /api/config/test - Test connection to llama.cpp server
router.post('/test', async (req, res) => {
  const url = req.body?.llamaCppUrl || configStore.llamaCppUrl;
  try {
    const client = axios.create({
      baseURL: url.replace(/\/v1$/, ''),
      url: '/v1/health',
      timeout: 10000,
      headers: {
        'Authorization': `Bearer ${req.body?.llamaCppApiKey || configStore.llamaCppApiKey || 'null'}`
      }
    });
    const response = await client.get('/health');
    res.json({
      success: true,
      message: 'Connected successfully',
      data: response.data
    });
  } catch (error) {
    res.status(502).json({
      success: false,
      message: 'Connection failed',
      error: error.message
    });
  }
});

module.exports = router;
