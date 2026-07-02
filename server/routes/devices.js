const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Device configuration loaded from env or config file
const DEVICE_CONFIG = {
  devices: process.env.DEVICES || '[]',
  primaryGpu: process.env.PRIMARY_GPU || 'NVIDIA RTX Pro 4000 Blackwell',
  vram: process.env.VRAM || '24576', // MB
  cudaVersion: process.env.CUDA_VERSION || '12.x',
  llamaVersion: process.env.LLAMA_VERSION || 'built-in'
};

// GET /api/devices - List all available devices
router.get('/', async (req, res) => {
  try {
    let devices = [];
    try {
      devices = JSON.parse(DEVICE_CONFIG.devices);
    } catch {
      devices = [];
    }

    // Build device list from config + detected info
    const deviceList = [
      {
        id: 0,
        name: DEVICE_CONFIG.primaryGpu,
        vendor: 'NVIDIA',
        vram: parseInt(DEVICE_CONFIG.vram, 10),
        vramUsed: 0,
        vramFree: parseInt(DEVICE_CONFIG.vram, 10),
        cudaVersion: DEVICE_CONFIG.cudaVersion,
        computeCapability: '5.2',
        status: 'available',
        type: 'GPU'
      }
    ];

    res.json({
      success: true,
      data: deviceList,
      config: {
        llamaVersion: DEVICE_CONFIG.llamaVersion,
        backend: 'CUDA',
        deviceCount: deviceList.length
      }
    });
  } catch (error) {
    res.json({
      success: true,
      data: [],
      config: { backend: 'CUDA', deviceCount: 0 }
    });
  }
});

// GET /api/devices/info - Detailed device information
router.get('/info', async (req, res) => {
  res.json({
    success: true,
    data: {
      primaryGpu: DEVICE_CONFIG.primaryGpu,
      vram: DEVICE_CONFIG.vram,
      cudaVersion: DEVICE_CONFIG.cudaVersion,
      llamaVersion: DEVICE_CONFIG.llamaVersion
    }
  });
});

module.exports = router;
