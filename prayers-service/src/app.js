const express = require('express');
const cors = require('cors');
const prayerRoutes = require('./routes/prayerRoutes');
const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/prayer', prayerRoutes);

module.exports = app;
