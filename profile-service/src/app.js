const express = require('express');
const cors = require('cors');
const prayerRoutes = require('./routes/ProfileRoutes');
const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/profile', prayerRoutes);

module.exports = app;
