const express = require('express');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const upload = require('../middleware/upload');

const router = express.Router();

// 미들웨어: 관리자 권한 확인
const requireAdmin = async (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: '로그인이 필요합니다.' });
  }

  try {
    const user = await User.findById(req.session.userId);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: '관리자 권한이 필요합니다.' });
    }
    next();
  } catch (error) {
    return res.status(500).json({ message: '권한 확인 중 오류가 발생했습니다.' });
  }
};

// 상품 전체 조회
router.get('/products', requireAdmin, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    const items = products.map((product) => {
      const sizesArray = (product.sizes || []).map((size) => Number(size));

      return {
        id: product._id.toString(),
        name: product.name,
        description: product.description,
        price: product.price,
        releaseDate: product.releaseDate
          ? product.releaseDate.toISOString().split('T')[0]
          : null,
        saleStart: product.saleStart
          ? product.saleStart.toISOString().split('T')[0]
          : null,
        saleEnd: product.saleEnd
          ? product.saleEnd.toISOString().split('T')[0]
          : null,
        discountRate: product.discountRate || 0,
        categories: product.categories || [],
        sizes: sizesArray,
        materials: product.materials || [],
        colorVariants: product.colorVariants || [],
        image: product.colorVariants?.[0]?.images?.[0] || product.colorVariants?.[0]?.thumbnail || '',
        salesVolume: product.salesVolume || 0,
        recommendationScore: product.recommendationScore || 0,
      };
    });

    res.json({ items });
  } catch (error) {
    console.error('상품 전체 조회 오류:', error);
    res.status(500).json({ message: '상품 목록을 불러오는 중 오류가 발생했습니다.' });
  }
});

// 가용 사이즈 수정
router.patch('/products/:id/sizes', requireAdmin, async (req, res) => {
  try {
    const { sizes } = req.body;

    if (!Array.isArray(sizes) || sizes.length === 0) {
      return res.status(400).json({ message: '사이즈 배열이 필요합니다.' });
    }

    // 사이즈 유효성 검사 (260~300) - 문자열로 저장
    const validSizes = sizes
      .map(Number)
      .filter((size) => !isNaN(size) && size >= 260 && size <= 300)
      .map(String); // 문자열로 변환

    if (validSizes.length === 0) {
      return res.status(400).json({ message: '유효한 사이즈(260~300)가 필요합니다.' });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { sizes: validSizes },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: '상품을 찾을 수 없습니다.' });
    }

    res.json({
      id: product._id.toString(),
      sizes: product.sizes.map(Number),
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: '유효하지 않은 상품 ID입니다.' });
    }
    console.error('사이즈 수정 오류:', error);
    res.status(500).json({ message: '사이즈 수정 중 오류가 발생했습니다.' });
  }
});

// 이미지 업로드
router.post('/upload', requireAdmin, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: '이미지 파일이 필요합니다.' });
    }

    // 업로드된 파일의 URL 반환
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ url: imageUrl });
  } catch (error) {
    console.error('이미지 업로드 오류:', error);
    res.status(500).json({ message: '이미지 업로드 중 오류가 발생했습니다.' });
  }
});

// 할인 정책 수정
router.patch('/products/:id/discount', requireAdmin, async (req, res) => {
  try {
    const { discountRate, saleStart, saleEnd } = req.body;

    if (discountRate !== undefined) {
      if (typeof discountRate !== 'number' || discountRate < 0 || discountRate > 100) {
        return res.status(400).json({ message: '할인율은 0~100 사이의 숫자여야 합니다.' });
      }
    }

    const updateData = {};
    if (discountRate !== undefined) {
      updateData.discountRate = discountRate;
    }
    if (saleStart !== undefined) {
      updateData.saleStart = new Date(saleStart);
    }
    if (saleEnd !== undefined) {
      updateData.saleEnd = new Date(saleEnd);
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: '상품을 찾을 수 없습니다.' });
    }

    res.json({
      id: product._id.toString(),
      discountRate: product.discountRate,
      saleStart: product.saleStart
        ? product.saleStart.toISOString().split('T')[0]
        : null,
      saleEnd: product.saleEnd
        ? product.saleEnd.toISOString().split('T')[0]
        : null,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: '유효하지 않은 상품 ID 또는 날짜 형식입니다.' });
    }
    console.error('할인 정책 수정 오류:', error);
    res.status(500).json({ message: '할인 정책 수정 중 오류가 발생했습니다.' });
  }
});

// 신규 상품 등록
router.post('/products', requireAdmin, async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      releaseDate,
      categories,
      sizes,
      materials,
      colorVariants,
      discountRate,
      saleStart,
      saleEnd,
    } = req.body;

    // 필수 필드 검증
    if (!name || !description || !price || !releaseDate) {
      return res.status(400).json({ message: '필수 필드가 누락되었습니다.' });
    }

    // 카테고리 유효성 검사: 슬립온, 라이프스타일만 허용
    const validCategories = ['슬립온', '라이프스타일'];
    let validCategoryArray = [];
    if (categories && Array.isArray(categories)) {
      validCategoryArray = categories.filter(cat => validCategories.includes(cat));
    } else if (categories && typeof categories === 'string') {
      const categoryList = categories.split(',').map(c => c.trim()).filter(Boolean);
      validCategoryArray = categoryList.filter(cat => validCategories.includes(cat));
    }

    // 사이즈 유효성 검사 - 문자열로 저장
    let validSizes = [];
    if (sizes && Array.isArray(sizes)) {
      validSizes = sizes
        .map(Number)
        .filter((size) => !isNaN(size) && size >= 260 && size <= 300)
        .map(String); // 문자열로 변환
      if (validSizes.length === 0) {
        return res.status(400).json({ message: '유효한 사이즈(260~300)가 필요합니다.' });
      }
    }

    // colorVariants 유효성 검사
    let validColorVariants = [];
    if (colorVariants && Array.isArray(colorVariants)) {
      validColorVariants = colorVariants
        .filter((variant) => variant.name && variant.name.trim())
        .map((variant) => ({
          name: variant.name.trim(),
          images: Array.isArray(variant.images) ? variant.images.filter((img) => img && img.trim()) : [],
          thumbnail: variant.thumbnail && variant.thumbnail.trim() ? variant.thumbnail.trim() : (variant.images?.[0] || ''),
        }));
      
      if (validColorVariants.length === 0) {
        return res.status(400).json({ message: '최소 1개 이상의 색상 변형이 필요합니다.' });
      }
    } else {
      return res.status(400).json({ message: '색상 변형(colorVariants)이 필요합니다.' });
    }

    // 할인 정보 유효성 검사
    let validDiscountRate = 0;
    if (discountRate !== undefined && discountRate !== null && discountRate !== '') {
      validDiscountRate = Number(discountRate);
      if (isNaN(validDiscountRate) || validDiscountRate < 0 || validDiscountRate > 100) {
        return res.status(400).json({ message: '할인율은 0~100 사이의 숫자여야 합니다.' });
      }
    }

    // 세일 기간 설정
    const productData = {
      name,
      description,
      price: Number(price),
      releaseDate: new Date(releaseDate),
      categories: validCategoryArray,
      sizes: validSizes,
      materials: materials || [],
      colorVariants: validColorVariants,
      gender: '남성', // 기본값
      discountRate: validDiscountRate,
    };

    // 할인율이 0보다 크면 세일 기간도 설정
    if (validDiscountRate > 0) {
      if (saleStart) {
        productData.saleStart = new Date(saleStart);
      }
      if (saleEnd) {
        productData.saleEnd = new Date(saleEnd);
      }
    }

    const product = await Product.create(productData);

    // 응답은 숫자 배열로 변환 (프론트엔드 호환성)
    const sizesArray = (product.sizes || []).map((size) => Number(size));

    res.status(201).json({
      id: product._id.toString(),
      name: product.name,
      description: product.description,
      price: product.price,
      releaseDate: product.releaseDate.toISOString().split('T')[0],
      categories: product.categories || [],
      sizes: sizesArray,
      materials: product.materials || [],
      colorVariants: product.colorVariants || [],
      image: product.colorVariants?.[0]?.images?.[0] || product.colorVariants?.[0]?.thumbnail || '',
      discountRate: product.discountRate || 0,
      saleStart: product.saleStart
        ? product.saleStart.toISOString().split('T')[0]
        : null,
      saleEnd: product.saleEnd
        ? product.saleEnd.toISOString().split('T')[0]
        : null,
    });
  } catch (error) {
    console.error('상품 등록 오류:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: '입력 데이터가 유효하지 않습니다.' });
    }
    res.status(500).json({ message: '상품 등록 중 오류가 발생했습니다.' });
  }
});

// 판매 현황 조회
router.get('/sales', requireAdmin, async (req, res) => {
  try {
    const { start, end } = req.query;

    if (!start || !end) {
      return res.status(400).json({ message: '시작일과 종료일이 필요합니다.' });
    }

    const startDate = new Date(start);
    const endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999); // 종료일 포함

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({ message: '유효하지 않은 날짜 형식입니다.' });
    }

    // 해당 기간의 주문 조회
    const orders = await Order.find({
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    }).populate('productId', 'name price');

    // 상품별 집계
    const salesMap = new Map();

    orders.forEach((order) => {
      if (!order.productId) return;

      const productId = order.productId._id.toString();
      const productName = order.productId.name;
      const unitPrice = order.productId.price || 0;

      if (salesMap.has(productId)) {
        const existing = salesMap.get(productId);
        existing.units += order.quantity;
        existing.revenue += unitPrice * order.quantity;
      } else {
        salesMap.set(productId, {
          productId,
          name: productName,
          units: order.quantity,
          revenue: unitPrice * order.quantity,
        });
      }
    });

    // 배열로 변환 및 정렬 (매출액 기준 내림차순)
    const items = Array.from(salesMap.values()).sort((a, b) => b.revenue - a.revenue);

    // 총계 계산
    const totals = items.reduce(
      (acc, item) => {
        acc.units += item.units;
        acc.revenue += item.revenue;
        return acc;
      },
      { units: 0, revenue: 0 }
    );

    res.json({
      range: {
        start: start,
        end: end,
      },
      items,
      totals,
    });
  } catch (error) {
    console.error('판매 현황 조회 오류:', error);
    res.status(500).json({ message: '판매 현황을 불러오는 중 오류가 발생했습니다.' });
  }
});

module.exports = router;

