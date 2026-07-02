const express = require('express');
const router = express.Router();
const axios = require('axios');

// Health check endpoint
router.get('/', async (req, res) => {
  try {
    const client = axios.create({
      baseURL: process.env.LLAMACPP_URL,
      timeout: 5000,
      headers: {
        'Authorization': `Bearer ${process.env.LLAMACPP_API_KEY || 'null'}`
      }
    });

    const response = await client.get('/health');
    res.json({
      success: true,
      llamaCpp: 'healthy',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.json({
      success: false,
      llamaCpp: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
