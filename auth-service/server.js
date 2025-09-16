const express = require('express');
const cors = require('cors');
const os = require('os');

const app = express();
app.use(cors());
app.use(express.json());

// Get local IP address function
function getLocalIp() {
  const nets = os.networkInterfaces();
  let localIp = '127.0.0.1'; // fallback

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip internal (i.e., 127.0.0.1) and non-IPv4 addresses
      if (net.family === 'IPv4' && !net.internal) {
        localIp = net.address;
        return localIp;
      }
    }
  }
  return localIp;
}

const PORT = 4001;
app.listen(PORT, () => {
  const ip = getLocalIp();
  console.log(`Auth Service running on http://${ip}:${PORT}`);
});
