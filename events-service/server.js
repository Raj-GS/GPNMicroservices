require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 4002;
app.listen(PORT, () => {
  console.log(`Events Service running on port ${PORT}`);
});
  