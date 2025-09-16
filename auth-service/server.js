const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/test', (req, res) => {
  res.status(200).json({ message: 'Test route working!' });
});

const PORT = 4001;
app.listen(PORT, () => {
  console.log(`Auth Service running on port ${PORT}`);
});
