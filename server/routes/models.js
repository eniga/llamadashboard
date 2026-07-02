const express = require('express');
const router = express.Router();
const axios = require('axios');

const getLlamaClient = () => axios.create({
  baseURL: process.env.LLAMACPP_URL,
  timeout: 30000,
  headers: {
    'Authorization': `Bearer ${process.env.LLAMACPP_API_KEY || 'null'}`,
    'Content-Type': 'application/json'
  }
});

// List all available models
router.get('/', async (req, res) => {
  try {
    const client = getLlamaClient();
    const response = await client.get('/v1/models');
    res.json({
      success: true,
      data: response.data.data || response.data,
      raw: response.data
    });
  } catch (error) {
    console.error('Error fetching models:', error.message);
    // Return fallback models if API is unavailable
    res.json({
      success: true,
      data: [],
      raw: {},
      warning: 'Could not connect to llama.cpp server. Displaying empty list.'
    });
  }
});

// Get specific model info
router.get('/:modelId', async (req, res) => {
  try {
    const client = getLlamaClient();
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
    if (!model) {
      return res.status(400).json({ success: false, error: 'Model name is required' });
    }

    const client = getLlamaClient();
    const response = await client.post('/v1/models/load', {
      model,
      ...params
    });

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

    const client = getLlamaClient();
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
    const client = getLlamaClient();
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
