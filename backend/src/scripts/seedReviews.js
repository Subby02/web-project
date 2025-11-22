require('dotenv').config();
const mongoose = require('mongoose');
const Review = require('../models/Review');
const Product = require('../models/Product');
const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/your-database';

// 후기 템플릿 데이터
const reviewTemplates = [
  {
    titles: [
      '정말 만족합니다!',
      '너무 편해요',
      '생각보다 좋아요',
      '추천합니다',
      '가격 대비 최고',
      '디자인이 예뻐요',
      '착화감이 좋아요',
      '사이즈가 딱 맞아요',
      '품질이 좋습니다',
      '재구매 의사 있어요',
    ],
    comments: [
      '정말 편하고 좋아요! 매일 신고 다니는데 발이 편해요.',
      '생각보다 가볍고 편안합니다. 추천드려요!',
      '디자인도 예쁘고 착화감도 좋아요. 만족합니다.',
      '사이즈가 딱 맞고 발이 편해요. 좋은 구매였어요.',
      '가격 대비 품질이 정말 좋아요. 만족합니다!',
      '처음엔 걱정했는데 신고 보니 정말 편해요.',
      '소재가 부드럽고 통기성이 좋아요. 여름에도 좋을 것 같아요.',
      '발목 부분이 편안하고 디자인도 깔끔해요.',
      '친구들한테도 추천했어요. 모두 만족하더라고요.',
      '재구매 의사 있어요. 정말 좋아요!',
      '배송도 빠르고 상품도 만족스러워요.',
      '사이즈 선택이 중요해요. 정사이즈로 주문하시면 될 것 같아요.',
      '가격이 좀 비싸긴 하지만 품질이 좋아서 만족해요.',
      '색상이 사진보다 더 예뻐요. 만족합니다!',
      '발이 넓은 편인데도 편하게 신을 수 있어요.',
    ],
  },
];

// 랜덤 정수 생성 함수
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// 랜덤 배열 요소 선택
const randomElement = (array) => array[Math.floor(Math.random() * array.length)];

// 랜덤 날짜 생성 (최근 90일 내)
const randomDate = () => {
  const now = new Date();
  const daysAgo = randomInt(0, 90);
  const date = new Date(now);
  date.setDate(date.getDate() - daysAgo);
  return date;
};

async function seedReviews() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB 연결 성공');

    // 기존 후기 삭제
    await Review.deleteMany({});
    console.log('기존 후기 데이터 삭제 완료');

    // 모든 상품 가져오기
    const products = await Product.find();
    console.log(`총 ${products.length}개의 상품을 찾았습니다.`);

    // 사용자 가져오기 (없으면 더미 사용자 생성)
    let users = await User.find();
    
    if (users.length === 0) {
      console.log('사용자가 없어서 더미 사용자를 생성합니다...');
      const bcrypt = require('bcrypt');
      const dummyUsers = [];
      
      for (let i = 1; i <= 20; i++) {
        const hashedPassword = await bcrypt.hash('password123', 10);
        dummyUsers.push({
          name: `사용자${i}`,
          username: `user${i}`,
          email: `user${i}@example.com`,
          phone: `010-0000-${String(i).padStart(4, '0')}`,
          password: hashedPassword,
        });
      }
      
      users = await User.insertMany(dummyUsers);
      console.log(`${users.length}개의 더미 사용자를 생성했습니다.`);
    }

    console.log(`총 ${users.length}명의 사용자를 사용합니다.`);

    // 각 상품마다 랜덤한 개수의 후기 생성
    let totalReviews = 0;
    const template = reviewTemplates[0];

    for (const product of products) {
      // 각 상품마다 0~15개의 후기 생성
      const reviewCount = randomInt(0, 15);
      
      const reviews = [];
      
      for (let i = 0; i < reviewCount; i++) {
        const randomUser = randomElement(users);
        const score = randomInt(3, 5); // 3~5점 (대부분 긍정적)
        const title = randomElement(template.titles);
        const comment = randomElement(template.comments);
        const date = randomDate();

        reviews.push({
          userId: randomUser._id,
          productId: product._id,
          score: score,
          title: title,
          comment: comment,
          date: date,
        });
      }

      if (reviews.length > 0) {
        await Review.insertMany(reviews);
        totalReviews += reviews.length;
        console.log(`${product.name}: ${reviews.length}개의 후기 생성`);
      } else {
        console.log(`${product.name}: 후기 없음`);
      }
    }

    console.log(`\n총 ${totalReviews}개의 후기가 성공적으로 생성되었습니다.`);
    process.exit(0);
  } catch (error) {
    console.error('후기 생성 중 오류 발생:', error);
    process.exit(1);
  }
}

seedReviews();

