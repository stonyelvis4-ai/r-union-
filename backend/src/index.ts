/** Backend entry point for local development. */
import app from './app.js';

const PORT = Number(process.env.PORT) || 4000;
const HOST = process.env.HOST || '0.0.0.0';
app.listen(PORT, HOST, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
  if (HOST === '0.0.0.0') {
    console.log('  (accessible depuis le réseau local sur le port', PORT + ')');
  }
});
