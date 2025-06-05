const express = require('express');
const dataStore = require('../services/dataStore');

const router = express.Router();

router.post('/ingest', (req, res) => {
    const { ids, priority = 'LOW' } = req.body;

    if (!ids || !Array.isArray(ids)) {
        return res.status(400).json({ error: 'Invalid ids format' });
    }

    if (!['HIGH', 'MEDIUM', 'LOW'].includes(priority)) {
        return res.status(400).json({ error: 'Invalid priority' });
    }

    const ingestionId = dataStore.createIngestion(ids, priority);
    res.json({ ingestion_id: ingestionId });
});

module.exports = { ingestRouter: router };