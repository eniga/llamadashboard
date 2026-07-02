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

// Get server statistics
router.get('/', async (req, res) => {
  try {
    const client = getLlamaClient();
    const response = await client.get('/stats');
    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('Error fetching stats:', error.message);
    // Return empty stats structure if server is not available
    res.json({
      success: true,
      data: {
        t_token_count: 0,
        t_prompt_count: 0,
        t_eval_count: 0,
        t_token_time: 0,
        t_prompt_time: 0,
        n_tokens: 0,
        prompt_processing: 0,
        evaluation: 0
      },
      warning: 'Stats unavailable - llama.cpp server may not be running'
    });
  }
});

// Get server metrics (prometheus-style)
router.get('/metrics', async (req, res) => {
  try {
    const client = getLlamaClient();
    const response = await client.get('/metrics');
    // Parse metrics into a usable format
    const metrics = {};
    if (response.data) {
      const lines = response.data.split('\n').filter(l => l && !l.startsWith('#'));
      lines.forEach(line => {
        const [key, value] = line.trim().split(/\s+/);
        if (key && value) {
          metrics[key] = parseFloat(value) || value;
        }
      });
    }
    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error('Error fetching metrics:', error.message);
    res.json({
      success: true,
      data: {},
      warning: 'Metrics endpoint not available'
    });
  }
});

module.exports = router;
