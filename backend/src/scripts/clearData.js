require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Review = require('../models/Review');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/your-database';

async function clearData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB 연결 성공');

    // Product 삭제
    const productResult = await Product.deleteMany({});
    console.log(`✅ ${productResult.deletedCount}개의 상품 데이터 삭제 완료`);

    // Order 삭제
    const orderResult = await Order.deleteMany({});
    console.log(`✅ ${orderResult.deletedCount}개의 주문 데이터 삭제 완료`);

    // Review 삭제
    const reviewResult = await Review.deleteMany({});
    console.log(`✅ ${reviewResult.deletedCount}개의 리뷰 데이터 삭제 완료`);

    console.log('\n모든 데이터 삭제가 완료되었습니다.');
    process.exit(0);
  } catch (error) {
    console.error('데이터 삭제 중 오류 발생:', error);
    process.exit(1);
  }
}

clearData();

