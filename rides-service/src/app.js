const express = require('express');
const cors = require('cors');
const rideRoutes = require('./routes/rideRoutes');
const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/ride', rideRoutes);

module.exports = app;
