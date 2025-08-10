const express = require('express');
const router = express.Router();

// Root endpoint
router.get('/', (req, res) => {
  res.json({ root: true });
});

module.exports = router;
