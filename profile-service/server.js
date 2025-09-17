require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 4004;
app.listen(PORT, () => {
  console.log(`Profile Service running on port ${PORT}`);
});
