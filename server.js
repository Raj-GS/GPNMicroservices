require('express').config();
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Auth Service running on port ${PORT}`);
});
