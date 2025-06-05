const express = require('express');
const dataStore = require('../services/dataStore');

const router = express.Router();

router.get('/status/:ingestionId', (req, res) => {
    const { ingestionId } = req.params;
    const status = dataStore.getStatus(ingestionId);

    if (!status) {
        return res.status(404).json({ error: 'Ingestion not found' });
    }

    res.json(status);
});

module.exports = { statusRouter: router };