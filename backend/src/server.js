const env = require('./config/env');
const connectDB = require('./config/db');
const app = require('./app');

const PORT = env.port;

if (env.nodeEnv !== 'test') {
  connectDB();
  app.listen(PORT, () => {
    console.log(`[DEWECS Backend] Server running on port ${PORT} (${env.nodeEnv} mode)`);
  });
}
