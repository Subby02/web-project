require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/your-database';

const popularProducts = [
  {
    name: '남성 울 러너 NZ',
    color: '내추럴 블랙 (내추럴 블랙)',
    price: 119000,
    discountRate: 30,
    originalPrice: 170000,
    sizes: ['260', '265', '270', '275', '280'],
    image: 'https://picsum.photos/seed/product1a/600/600',
    description: '포근한 ZQ 메리노 울과 SweetFoam® 쿠션으로 하루 종일 가볍고 편안한 착화감.',
    releaseDate: new Date('2024-01-15'),
    salesVolume: 150,
    recommendationScore: 4.8,
    categories: ['남성', '러너', '울'],
    materials: ['울'],
  },
  {
    name: '남성 울 크루저 슬립온',
    color: '내추럴 화이트 (내추럴 화이트)',
    price: 170000,
    discountRate: 0,
    sizes: ['260', '265', '270', '275'],
    image: 'https://picsum.photos/seed/product2a/600/600',
    description: '편안한 슬립온 디자인과 부드러운 울 소재의 완벽한 조합.',
    releaseDate: new Date('2024-02-01'),
    salesVolume: 120,
    recommendationScore: 4.6,
    categories: ['남성', '슬립온', '울'],
    materials: ['울'],
  },
  {
    name: '남성 트리 러너 NZ',
    color: '내추럴 그레이 (라이트 그레이)',
    price: 119000,
    discountRate: 30,
    originalPrice: 170000,
    sizes: ['270', '275', '280', '285'],
    image: 'https://picsum.photos/seed/product3a/600/600',
    description: '가볍고 시원한 트리 소재로 만든 러닝 슈즈.',
    releaseDate: new Date('2024-01-20'),
    salesVolume: 180,
    recommendationScore: 4.7,
    categories: ['남성', '러너', '트리'],
    materials: ['트리'],
  },
  {
    name: '남성 울 대셔 미즐',
    color: '스토니 크림 (내추럴 화이트)',
    price: 170000,
    discountRate: 0,
    sizes: ['270', '275', '280', '285'],
    image: 'https://picsum.photos/seed/product4a/600/600',
    description: '클래식한 디자인과 현대적인 편안함이 만난 대셔 미즐.',
    releaseDate: new Date('2024-02-10'),
    salesVolume: 95,
    recommendationScore: 4.5,
    categories: ['남성', '대셔', '울'],
    materials: ['울'],
  },
  {
    name: '남성 트리 러너',
    color: '제트 블랙 (블랙)',
    price: 119000,
    discountRate: 30,
    originalPrice: 170000,
    sizes: ['260', '270', '280'],
    image: 'https://picsum.photos/seed/product5a/600/600',
    description: '트리 소재의 가벼움과 블랙 컬러의 세련된 디자인.',
    releaseDate: new Date('2024-01-25'),
    salesVolume: 200,
    recommendationScore: 4.9,
    categories: ['남성', '러너', '트리'],
    materials: ['트리'],
  },
  {
    name: '여성 울 러너 NZ',
    color: '내추럴 블랙 (내추럴 블랙)',
    price: 119000,
    discountRate: 30,
    originalPrice: 170000,
    sizes: ['230', '235', '240', '245'],
    image: 'https://picsum.photos/seed/product6a/600/600',
    description: '여성을 위한 포근한 울 소재 러닝 슈즈.',
    releaseDate: new Date('2024-01-18'),
    salesVolume: 220,
    recommendationScore: 4.8,
    categories: ['여성', '러너', '울'],
    materials: ['울'],
  },
  {
    name: '여성 울 러너',
    color: '내추럴 화이트 (크림)',
    price: 170000,
    discountRate: 0,
    sizes: ['230', '240', '250'],
    image: 'https://picsum.photos/seed/product7a/600/600',
    description: '부드러운 크림 컬러의 여성용 울 러너.',
    releaseDate: new Date('2024-02-05'),
    salesVolume: 160,
    recommendationScore: 4.6,
    categories: ['여성', '러너', '울'],
    materials: ['울'],
  },
  {
    name: '여성 트리 러너',
    color: '제트 블랙 (블랙)',
    price: 119000,
    discountRate: 30,
    originalPrice: 170000,
    sizes: ['230', '240', '250'],
    image: 'https://picsum.photos/seed/product8a/600/600',
    description: '여성을 위한 가볍고 시원한 트리 러너.',
    releaseDate: new Date('2024-01-22'),
    salesVolume: 190,
    recommendationScore: 4.7,
    categories: ['여성', '러너', '트리'],
    materials: ['트리'],
  },
  {
    name: '남성 울 크루저',
    color: '내추럴 블랙 (내추럴 블랙)',
    price: 170000,
    discountRate: 0,
    sizes: ['260', '265', '270', '275', '280'],
    image: 'https://picsum.photos/seed/product9a/600/600',
    description: '클래식한 크루저 디자인과 울 소재의 편안함.',
    releaseDate: new Date('2024-02-15'),
    salesVolume: 110,
    recommendationScore: 4.5,
    categories: ['남성', '크루저', '울'],
    materials: ['울'],
  },
  {
    name: '여성 울 러너 고 플러프',
    color: '내추럴 화이트(내추럴 화이트)',
    price: 119000,
    discountRate: 30,
    originalPrice: 170000,
    sizes: ['235', '240', '245', '250'],
    image: 'https://picsum.photos/seed/product10a/600/600',
    description: '플러프한 디자인의 여성용 울 러너.',
    releaseDate: new Date('2024-01-30'),
    salesVolume: 175,
    recommendationScore: 4.8,
    categories: ['여성', '러너', '울'],
    materials: ['울'],
  },
];

async function seedProducts() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB 연결 성공');

    // 기존 상품 삭제 (선택사항)
    await Product.deleteMany({});
    console.log('기존 상품 데이터 삭제 완료');

    // 상품 데이터 삽입
    const insertedProducts = await Product.insertMany(popularProducts);
    console.log(`${insertedProducts.length}개의 상품이 성공적으로 추가되었습니다.`);

    // 할인 중인 상품에 saleStart와 saleEnd 설정
    const discountProducts = insertedProducts.filter(p => p.discountRate > 0);
    const now = new Date();
    const saleStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7일 전
    const saleEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30일 후

    for (const product of discountProducts) {
      product.saleStart = saleStart;
      product.saleEnd = saleEnd;
      await product.save();
    }
    console.log('할인 기간 설정 완료');

    process.exit(0);
  } catch (error) {
    console.error('데이터 삽입 중 오류 발생:', error);
    process.exit(1);
  }
}

seedProducts();

