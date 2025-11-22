const express = require('express');
const Product = require('../models/Product');

const router = express.Router();

// 인기 상품 목록
router.get('/popular', async (req, res) => {
  try {
    const products = await Product.find()
      .sort({ salesVolume: -1, recommendationScore: -1 })
      .limit(20)
      .select('name color price discountRate sizes image salesVolume');

    const formattedProducts = products.map((product) => {
      const isOnSale =
        product.discountRate > 0 &&
        (!product.saleStart || new Date() >= product.saleStart) &&
        (!product.saleEnd || new Date() <= product.saleEnd);

      const originalPrice = isOnSale
        ? Math.round(product.price / (1 - product.discountRate / 100))
        : null;

      return {
        id: product._id.toString(),
        name: product.name,
        color: product.color || '',
        price: isOnSale
          ? product.price
          : originalPrice || product.price,
        originalPrice: isOnSale ? originalPrice : null,
        sizes: product.sizes || [],
        image: product.image || '',
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

    const isOnSale =
      product.discountRate > 0 &&
      (!product.saleStart || new Date() >= product.saleStart) &&
      (!product.saleEnd || new Date() <= product.saleEnd);

    const originalPrice = isOnSale
      ? Math.round(product.price / (1 - product.discountRate / 100))
      : null;

    // 이미지 처리 (image가 문자열이면 배열로 변환, 이미 배열이면 그대로 사용)
    let images = [];
    if (Array.isArray(product.image)) {
      images = product.image;
    } else if (product.image) {
      images = [product.image];
    }

    // 색상 처리 (color가 문자열이면 배열로 변환)
    let colors = [];
    if (Array.isArray(product.color)) {
      colors = product.color;
    } else if (product.color) {
      colors = [product.color];
    }

    // sizes를 숫자 배열로 변환 (문자열 배열인 경우)
    let sizes = [];
    if (Array.isArray(product.sizes)) {
      sizes = product.sizes.map((size) => {
        const numSize = Number(size);
        return isNaN(numSize) ? size : numSize;
      });
    }

    // colorVariants 생성 (현재는 단일 색상만 지원, 나중에 확장 가능)
    const colorVariants = colors.length > 0
      ? [
          {
            name: colors[0],
            images: images,
            thumbnail: images[0] || '',
          },
        ]
      : [];

    const response = {
      id: product._id.toString(),
      name: product.name,
      description: product.description,
      price: isOnSale ? product.price : originalPrice || product.price,
      originalPrice: isOnSale ? originalPrice : null,
      colors: colors,
      sizes: sizes,
      images: images.length > 0 ? images : null,
      image: images.length > 0 ? images[0] : null,
      colorVariants: colorVariants.length > 0 ? colorVariants : null,
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

