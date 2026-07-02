const express = require('express');
const router = express.Router();
const axios = require('axios');

function getClient(baseUrl) {
  const url = (baseUrl || process.env.LLAMACPP_URL).replace(/\/+$/, '');
  const isV1 = url.endsWith('/v1');
  return axios.create({
    baseURL: isV1 ? url.slice(0, -3) : url,
    timeout: 30000,
    headers: {
      'Authorization': `Bearer ${process.env.LLAMACPP_API_KEY || 'null'}`,
      'Content-Type': 'application/json'
    }
  });
}

// List all available models
router.get('/', async (req, res) => {
  try {
    const baseUrl = req.query.baseUrl || process.env.LLAMACPP_URL;
    const client = getClient(baseUrl);
    const response = await client.get('/v1/models');

    // Normalize response to consistent format
    const raw = response.data;
    const data = raw.data || raw.models || [];

    // Mark models as loaded based on status.value field
    const enrichedData = data.map(model => ({
      ...model,
      loaded: model.status?.value === 'loaded'
    }));

    res.json({
      success: true,
      data: enrichedData,
      raw
    });
  } catch (error) {
    console.error('Error fetching models:', error.message);
    res.json({
      success: true,
      data: [],
      raw: {},
      warning: 'Could not connect to llama.cpp server: ' + error.message
    });
  }
});

// Get currently loaded models
router.get('/loaded', async (req, res) => {
  try {
    const baseUrl = req.query.baseUrl || process.env.LLAMACPP_URL;
    const client = getClient(baseUrl);
    const response = await client.get('/v1/models');
    
    const data = response.data?.data || response.data?.models || [];
    const loadedModels = data.filter(m => m.loaded);

    res.json({
      success: true,
      data: loadedModels,
      count: loadedModels.length
    });
  } catch (error) {
    console.error('Error fetching loaded models:', error.message);
    res.json({
      success: true,
      data: [],
      count: 0
    });
  }
});

// Get specific model info
router.get('/:modelId', async (req, res) => {
  try {
    const baseUrl = req.query.baseUrl || process.env.LLAMACPP_URL;
    const client = getClient(baseUrl);
    const response = await client.get(`/v1/models/${req.params.modelId}`);
    res.json({
      success: true,
      data: response.data,
      raw: response.data
    });
  } catch (error) {
    console.error(`Error fetching model ${req.params.modelId}:`, error.message);
    res.status(502).json({
      success: false,
      error: `Failed to fetch model: ${error.message}`
    });
  }
});

// Load a model
router.post('/load', async (req, res) => {
  try {
    const { model, params = {} } = req.body;
    const baseUrl = req.body.baseUrl || process.env.LLAMACPP_URL;

    if (!model) {
      return res.status(400).json({ success: false, error: 'Model name is required' });
    }

    const client = getClient(baseUrl);
    
    // Try different endpoint formats for llama.cpp
    let response;
    try {
      response = await client.post('/v1/models/load', {
        model,
        ...params
      });
    } catch {
      // Fallback to /load endpoint
      response = await client.post('/load', {
        model,
        ...params
      });
    }

    res.json({
      success: true,
      data: response.data,
      message: `Model ${model} is being loaded`
    });
  } catch (error) {
    console.error('Error loading model:', error.message);
    res.status(502).json({
      success: false,
      error: `Failed to load model: ${error.response?.data?.error || error.message}`
    });
  }
});

// Unload a model
router.post('/unload', async (req, res) => {
  try {
    const { model } = req.body;
    const baseUrl = req.body.baseUrl || process.env.LLAMACPP_URL;

    const client = getClient(baseUrl);
    const response = await client.post('/v1/models/unload', model ? { model } : {});

    res.json({
      success: true,
      data: response.data,
      message: 'Model unloaded successfully'
    });
  } catch (error) {
    console.error('Error unloading model:', error.message);
    res.status(502).json({
      success: false,
      error: `Failed to unload model: ${error.response?.data?.error || error.message}`
    });
  }
});

// Check model status
router.get('/:modelId/status', async (req, res) => {
  try {
    const baseUrl = req.query.baseUrl || process.env.LLAMACPP_URL;
    const client = getClient(baseUrl);
    const response = await client.get(`/v1/models/${req.params.modelId}/status`);
    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    res.json({
      success: true,
      data: { status: 'unknown', error: error.message }
    });
  }
});

module.exports = router;
