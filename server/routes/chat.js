const express = require('express');
const router = express.Router();
const axios = require('axios');

const getLlamaClient = () => axios.create({
  baseURL: process.env.LLAMACPP_URL,
  timeout: 60000,
  headers: {
    'Authorization': `Bearer ${process.env.LLAMACPP_API_KEY || 'null'}`,
    'Content-Type': 'application/json'
  }
});

// Chat completions endpoint
router.post('/', async (req, res) => {
  try {
    const { model, messages, stream = false, ...params } = req.body;

    const client = getLlamaClient();
    const response = await client.post('/v1/chat/completions', {
      model: model || 'default',
      messages,
      stream,
      ...params
    });

    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      response.data.data.on_chunk?.(chunk => {
        res.write(`data: ${JSON.stringify(chunk)}\n\n`);
      });
      response.data.data.on_done?.(() => {
        res.write('data: [DONE]\n\n');
        res.end();
      });
    } else {
      res.json(response.data);
    }
  } catch (error) {
    console.error('Chat error:', error.message);
    res.status(502).json({
      success: false,
      error: `Chat failed: ${error.response?.data?.error || error.message}`
    });
  }
});

module.exports = router;
