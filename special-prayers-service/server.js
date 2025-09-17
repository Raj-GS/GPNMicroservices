require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 4007;
app.listen(PORT, () => {
  console.log(`Special Prayers Service running on port ${PORT}`);
});
