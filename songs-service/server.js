require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 4006;
app.listen(PORT, () => {
  console.log(`Songs Service running on port ${PORT}`);
});
