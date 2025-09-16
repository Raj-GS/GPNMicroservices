const express = require('express');
const cors = require('cors');
const songRoutes = require('./routes/songRoutes');
const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/song', songRoutes);

module.exports = app;
