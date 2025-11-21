const mongoose = require('mongoose');

const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];

async function connectDB(uri) {
  if (!uri) {
    throw new Error('MONGODB_URI가 설정되어 있지 않습니다.');
  }

  await mongoose.connect(uri);
  return mongoose.connection;
}

async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
}

function getDbState() {
  return states[mongoose.connection.readyState] || 'unknown';
}

module.exports = {
  connectDB,
  disconnectDB,
  getDbState,
};

