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

// GET /api/devices - List all available devices
router.get('/', async (req, res) => {
  const baseUrl = req.query.baseUrl || process.env.LLAMACPP_URL;
  const config = {
    primaryGpu: process.env.PRIMARY_GPU || 'NVIDIA RTX Pro 4000 Blackwell',
    vram: parseInt(process.env.VRAM || '24576', 10),
    cudaVersion: process.env.CUDA_VERSION || '12.x',
    llamaVersion: process.env.LLAMA_VERSION || 'built-in'
  };

  // Try to get real device info from llama.cpp server
  try {
    const client = getClient(baseUrl);
    const response = await client.get('/models');
    const models = response.data?.data || response.data?.models || [];

    // Check if any model is loaded to estimate VRAM usage
    const loadedModel = models.find(m => m.loaded);
    let vramUsed = 0;
    if (loadedModel && loadedModel.size) {
      vramUsed = loadedModel.size;
    }

    res.json({
      success: true,
      data: [{
        id: 0,
        name: config.primaryGpu,
        vendor: 'NVIDIA',
        vram: config.vram,
        vramUsed,
        vramFree: Math.max(0, config.vram - vramUsed),
        cudaVersion: config.cudaVersion,
        computeCapability: '5.2',
        status: 'available',
        type: 'GPU'
      }],
      config: {
        llamaVersion: config.llamaVersion,
        backend: 'CUDA',
        deviceCount: 1
      }
    });
  } catch {
    // Fallback to hardcoded config
    res.json({
      success: true,
      data: [{
        id: 0,
        name: config.primaryGpu,
        vendor: 'NVIDIA',
        vram: config.vram,
        vramUsed: 0,
        vramFree: config.vram,
        cudaVersion: config.cudaVersion,
        computeCapability: '5.2',
        status: 'available',
        type: 'GPU'
      }],
      config: {
        llamaVersion: config.llamaVersion,
        backend: 'CUDA',
        deviceCount: 1
      }
    });
  }
});

module.exports = router;
