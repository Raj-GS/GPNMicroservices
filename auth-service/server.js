require('dotenv').config();
const app = require('./src/app');

const PORT = 4001;
app.listen(PORT, () => {
  console.log(`Auth Service running on port ${PORT}`);
});
