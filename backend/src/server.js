require('dotenv').config();
const app = require('./app');
const { connectDB, disconnectDB } = require('./config/database');

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await connectDB(process.env.MONGODB_URI);
    console.log('MongoDB 연결 성공');

    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('MongoDB 연결 실패:', error);
    process.exit(1);
  }
}

start();

process.on('SIGINT', async () => {
  await disconnectDB();
  process.exit(0);
});
