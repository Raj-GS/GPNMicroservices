const express = require('express');
const cors = require('cors');
const testimonyRoutes = require('./routes/testimonyRoutes');
const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/testimony', testimonyRoutes);

module.exports = app;
