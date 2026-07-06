const express = require('express');
const path = require('path');
const railFenceRoutes = require('./routes/railFence');
const rsaRoutes = require('./routes/rsa');
const authRoutes = require('./routes/auth');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/railfence', railFenceRoutes);
app.use('/rsa', rsaRoutes);
app.use('/auth', authRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((req, res) => {
  if (req.method === 'GET') {
    return res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }

  res.status(404).json({ error: 'Route not found' });
});

app.listen(port, () => {
  console.log(`Cryptography Web App running on http://localhost:${port}`);
});
