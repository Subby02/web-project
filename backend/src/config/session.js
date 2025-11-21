const session = require('express-session');
const MongoStore = require('connect-mongo');

function createSessionMiddleware() {
  if (!process.env.SESSION_SECRET) {
    throw new Error('SESSION_SECRET 환경 변수가 설정되어 있지 않습니다.');
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI 환경 변수가 설정되어 있지 않습니다.');
  }

  return session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 , // 1시간
    },
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      collectionName: 'sessions',
      ttl: 60 * 60 * 24,
    }),
  });
}

module.exports = createSessionMiddleware;

