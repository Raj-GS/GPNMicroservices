const express = require('express');
const cors = require('cors');
const specialPrayerRoutes = require('./routes/specialPrayerRoutes');
const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/special-prayer', specialPrayerRoutes);

module.exports = app;
