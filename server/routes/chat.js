const express = require('express');
const router = express.Router();
const axios = require('axios');

function getLlamaClient(baseUrl) {
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

// Chat completions endpoint
router.post('/', async (req, res) => {
  try {
    const { model, messages, ...params } = req.body;
    const baseUrl = req.body.baseUrl || process.env.LLAMACPP_URL;

    if (!messages || messages.length === 0) {
      return res.status(400).json({ success: false, error: 'Messages are required' });
    }

    const client = getLlamaClient(baseUrl);
    const response = await client.post('/v1/chat/completions', {
      model: model || 'default',
      messages,
      ...params
    });

    res.json({
      success: true,
      data: response.data,
      choices: response.data.choices || []
    });
  } catch (error) {
    console.error('Chat error:', error.message);
    res.status(502).json({
      success: false,
      error: `Chat failed: ${error.response?.data?.error || error.message}`
    });
  }
});

module.exports = router;
