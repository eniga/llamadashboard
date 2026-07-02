require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const modelsRouter = require('./routes/models');
const statsRouter = require('./routes/stats');
const devicesRouter = require('./routes/devices');
const chatRouter = require('./routes/chat');
const configRouter = require('./routes/config');
const healthRouter = require('./routes/health');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// API routes
app.use('/api/models', modelsRouter);
app.use('/api/stats', statsRouter);
app.use('/api/devices', devicesRouter);
app.use('/api/chat', chatRouter);
app.use('/api/config', configRouter);
app.use('/api/health', healthRouter);

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  const clientBuild = path.join(__dirname, '..', 'client', 'dist');
  app.use(express.static(clientBuild));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuild, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Llama Dashboard server running on port ${PORT}`);
  console.log(`Connected to llama.cpp at: ${process.env.LLAMACPP_URL}`);
});
