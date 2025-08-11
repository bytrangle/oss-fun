const express = require('express');

// Force Redis connection to be established at server startup.
// It's not strictly required, but it's helpful to know immediately
// if Redis is down, not when a user hits an endpoint.
require('./redis-client');

const app = express();
const PORT = process.env.PORT || 4000;

// Import route modules
const indexRoutes = require('./routes/index');
const eventRoutes = require('./routes/handler');

// Middleware
app.use(express.json());

// Use route modules
app.use('/', indexRoutes);
app.use('/', eventRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});

module.exports = app;