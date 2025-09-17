require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 4005;
app.listen(PORT, () => {
  console.log(`Rides Service running on port ${PORT}`);
});
