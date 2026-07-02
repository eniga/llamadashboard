const express = require('express');
const router = express.Router();

// GET /api/config - Get dashboard configuration
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      llamaCppUrl: process.env.LLAMACPP_URL,
      dashboardName: process.env.DASHBOARD_NAME || 'Llama Dashboard',
      refreshInterval: parseInt(process.env.REFRESH_INTERVAL || '10000', 10),
      maxTokens: parseInt(process.env.MAX_TOKENS || '4096', 10),
      theme: process.env.THEME || 'dark',
      customModels: process.env.CUSTOM_MODELS || '[]'
    }
  });
});

// POST /api/config - Update configuration
router.post('/', (req, res) => {
  res.json({
    success: true,
    message: 'Configuration updated (runtime only)'
  });
});

module.exports = router;
