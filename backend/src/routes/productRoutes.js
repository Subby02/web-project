const express = require('express');
const Product = require('../models/Product');

const router = express.Router();

// 상품 목록 조회 (필터링, 정렬)
router.get('/', async (req, res) => {
  try {
    const { filters, sizes, materials, sort } = req.query;

    // 기본 조건들
    const baseConditions = [];

    // 기본 쿼리: 남성 상품만 (gender가 없거나 '남성'인 상품 포함)
    // $and 안에 $or를 넣지 않고 직접 조건으로 추가
    baseConditions.push({
      $or: [
        { gender: '남성' },
        { gender: { $exists: false } }, // gender 필드가 없는 기존 상품도 포함
      ],
    });

    // 필터 처리 (AND 조건)
    if (filters) {
      const filterArray = Array.isArray(filters) ? filters : [filters];
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      filterArray.forEach((filter) => {
        switch (filter) {
          case '신제품':
            baseConditions.push({ releaseDate: { $gte: thirtyDaysAgo } });
            break;
          case '라이프스타일':
            // categories 배열에 '라이프스타일'이 포함되어 있는지 확인
            baseConditions.push({ categories: '라이프스타일' });
            break;
          case '세일':
            baseConditions.push({ discountRate: { $gt: 0 } });
            baseConditions.push({
              $or: [
                { saleStart: { $exists: false } },
                { saleStart: { $lte: now } },
              ],
            });
            baseConditions.push({
              $or: [
                { saleEnd: { $exists: false } },
                { saleEnd: { $gte: now } },
              ],
            });
            break;
          case '슬립온':
            // categories 배열에 '슬립온'이 포함되어 있는지 확인
            baseConditions.push({ categories: '슬립온' });
            break;
        }
      });
    }

    // 사이즈 필터 (OR 조건) - 데이터베이스에 문자열 배열로 저장되어 있음
    if (sizes) {
      const sizeArray = Array.isArray(sizes)
        ? sizes.map((s) => String(s).trim()).filter((s) => s !== '')
        : [String(sizes).trim()].filter((s) => s !== '');
      
      if (sizeArray.length > 0) {
        // sizes 배열의 요소 중 하나라도 매칭되면 됨
        // 데이터베이스에 문자열 배열로 저장되어 있으므로 문자열로 검색
        console.log('Size filter:', sizeArray);
        baseConditions.push({ sizes: { $in: sizeArray } });
      }
    }

    // 소재 필터 (OR 조건)
    if (materials) {
      const materialArray = Array.isArray(materials)
        ? materials
        : [materials];
      baseConditions.push({ materials: { $in: materialArray } });
    }

    // 모든 조건을 $and로 묶기
    const query = baseConditions.length > 0 ? { $and: baseConditions } : {};

    // 정렬 처리
    let sortOption = {};
    switch (sort) {
      case 'sales':
        sortOption = { salesVolume: -1 };
        break;
      case 'priceLow':
        sortOption = { price: 1 };
        break;
      case 'priceHigh':
        sortOption = { price: -1 };
        break;
      case 'newest':
        sortOption = { releaseDate: -1 };
        break;
      case 'recommended':
      default:
        sortOption = { recommendationScore: -1, salesVolume: -1 };
        break;
    }

    // 디버깅: 쿼리 로그 출력
    console.log('Query params:', { filters, sizes, materials, sort });
    console.log('Query:', JSON.stringify(query, null, 2));
    
    const products = await Product.find(query).sort(sortOption);
    
    console.log('Found products:', products.length);
    if (products.length === 0 && sizes) {
      // 사이즈 필터만 있을 때 결과가 없으면 샘플 상품 확인
      const sampleProduct = await Product.findOne();
      if (sampleProduct) {
        console.log('Sample product sizes:', sampleProduct.sizes, 'Type:', typeof sampleProduct.sizes?.[0]);
      }
    }

    // 응답 포맷팅
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const items = products.map((product) => {
      // 세일 조건: saleStart와 saleEnd가 모두 있고, 현재 세일 기간인 경우
      const hasSalePeriod = product.saleStart && product.saleEnd;
      const isOnSale =
        hasSalePeriod &&
        product.discountRate > 0 &&
        now >= product.saleStart &&
        now <= product.saleEnd;

      // computedCategories 계산
      // categories는 슬립온, 라이프스타일만 허용
      const validCategories = ['슬립온', '라이프스타일'];
      const filteredCategories = (product.categories || []).filter(cat => 
        validCategories.includes(cat)
      );
      const computedCategories = [...filteredCategories];
      
      // 신제품: 출시일이 최근 30일 이내
      if (product.releaseDate && product.releaseDate >= thirtyDaysAgo) {
        computedCategories.push('신제품');
      }

      // 세일: saleStart와 saleEnd가 모두 있고 현재 세일 기간인 경우만
      if (isOnSale) {
        computedCategories.push('세일');
      }

      // sizes를 숫자 배열로 변환
      const sizesArray = (product.sizes || []).map((size) => Number(size));

      // 첫 번째 색상의 첫 번째 이미지를 기본 이미지로 사용
      const defaultImage = product.colorVariants?.[0]?.images?.[0] || product.colorVariants?.[0]?.thumbnail || '';

      // colorVariants 포맷팅 (이미지 URL 처리)
      const formattedColorVariants = (product.colorVariants || []).map((variant) => ({
        name: variant.name,
        images: variant.images || [],
        thumbnail: variant.thumbnail || variant.images?.[0] || '',
      }));

      return {
        id: product._id.toString(),
        gender: product.gender || '남성',
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
        computedCategories: computedCategories,
        sizes: sizesArray,
        materials: product.materials || [],
        recommendationScore: product.recommendationScore || 0,
        salesVolume: product.salesVolume || 0,
        image: defaultImage,
        colorVariants: formattedColorVariants,
      };
    });

    res.json({ items });
  } catch (error) {
    console.error('상품 목록 조회 오류:', error);
    res.status(500).json({ message: '상품 목록을 불러오는 중 오류가 발생했습니다.' });
  }
});

// 인기 상품 목록
router.get('/popular', async (req, res) => {
  try {
    const products = await Product.find()
      .sort({ salesVolume: -1, recommendationScore: -1 })
      .limit(20)
      .select('name colorVariants price discountRate sizes salesVolume saleStart saleEnd');

    const formattedProducts = products.map((product) => {
      const now = new Date();
      const hasSalePeriod = product.saleStart && product.saleEnd;
      const isOnSale =
        hasSalePeriod &&
        product.discountRate > 0 &&
        now >= product.saleStart &&
        now <= product.saleEnd;

      // product.price는 원가로 저장되어 있음
      // 할인이 적용되면 할인된 가격을 계산
      let salePrice = product.price;
      let originalPrice = null;

      if (isOnSale && product.discountRate > 0) {
        // 할인된 가격 = 원가 * (1 - 할인율 / 100)
        salePrice = Math.round(product.price * (1 - product.discountRate / 100));
        originalPrice = product.price; // 원가는 저장된 price
      }

      // 첫 번째 색상의 이름과 첫 번째 이미지 사용
      const firstColor = product.colorVariants?.[0];
      const defaultImage = firstColor?.images?.[0] || firstColor?.thumbnail || '';

      return {
        id: product._id.toString(),
        name: product.name,
        color: firstColor?.name || '',
        price: salePrice,
        originalPrice: originalPrice,
        sizes: product.sizes || [],
        image: defaultImage,
      };
    });

    res.json(formattedProducts);
  } catch (error) {
    res.status(500).json({ message: '인기 상품을 불러오는 중 오류가 발생했습니다.' });
  }
});

// 상품 상세 정보
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: '상품을 찾을 수 없습니다.' });
    }

    // 세일 조건: saleStart와 saleEnd가 모두 있고, 현재 세일 기간인 경우
    const now = new Date();
    const hasSalePeriod = product.saleStart && product.saleEnd;
    const isOnSale =
      hasSalePeriod &&
      product.discountRate > 0 &&
      now >= product.saleStart &&
      now <= product.saleEnd;

    // product.price는 원가로 저장되어 있음
    // 할인이 적용되면 할인된 가격을 계산
    let salePrice = product.price;
    let originalPrice = null;

    if (isOnSale && product.discountRate > 0) {
      // 할인된 가격 = 원가 * (1 - 할인율 / 100)
      salePrice = Math.round(product.price * (1 - product.discountRate / 100));
      originalPrice = product.price; // 원가는 저장된 price
    }

    // sizes를 숫자 배열로 변환 (문자열 배열인 경우)
    let sizes = [];
    if (Array.isArray(product.sizes)) {
      sizes = product.sizes.map((size) => {
        const numSize = Number(size);
        return isNaN(numSize) ? size : numSize;
      });
    }

    // colorVariants에서 색상 목록 추출
    const colors = (product.colorVariants || []).map((variant) => variant.name);
    
    // 첫 번째 색상의 이미지를 기본 이미지로 사용
    const firstVariant = product.colorVariants?.[0];
    const defaultImages = firstVariant?.images || [];
    const defaultImage = firstVariant?.images?.[0] || firstVariant?.thumbnail || null;

    const response = {
      id: product._id.toString(),
      name: product.name,
      description: product.description,
      price: salePrice,
      originalPrice: originalPrice,
      colors: colors,
      sizes: sizes,
      images: defaultImages.length > 0 ? defaultImages : null,
      image: defaultImage,
      colorVariants: product.colorVariants && product.colorVariants.length > 0 ? product.colorVariants : null,
    };

    res.json(response);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: '유효하지 않은 상품 ID입니다.' });
    }
    res.status(500).json({ message: '상품 정보를 불러오는 중 오류가 발생했습니다.' });
  }
});

module.exports = router;

