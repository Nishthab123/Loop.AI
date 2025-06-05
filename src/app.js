const express = require('express');
const cors = require('cors');
const { ingestRouter } = require('./routes/ingest');
const { statusRouter } = require('./routes/status');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/', ingestRouter);
app.use('/', statusRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});