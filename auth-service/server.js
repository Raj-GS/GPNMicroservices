require('dotenv').config();
const app = require('./src/app');
app.get('/test', (req, res) => {
  res.status(200).json({ message: 'Test route working!' });
});
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Auth Service running on port ${PORT}`);
});
