const express = require('express');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

const router = express.Router();

// 미들웨어: 로그인 확인
const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: '로그인이 필요합니다.' });
  }
  next();
};

// 장바구니 조회
router.get('/', requireAuth, async (req, res) => {
  try {
    const cartItems = await Cart.find({ userId: req.session.userId })
      .populate('productId', 'name price colorVariants')
      .sort({ createdAt: -1 });

    const formattedCart = cartItems.map((item) => {
      // 저장된 색상이 있으면 해당 색상의 이미지, 없으면 첫 번째 색상의 이미지
      let selectedVariant = null;
      if (item.color && item.productId.colorVariants) {
        selectedVariant = item.productId.colorVariants.find(
          variant => variant.name === item.color
        );
      }
      
      // 선택된 색상의 이미지 또는 첫 번째 색상의 이미지
      const variant = selectedVariant || item.productId.colorVariants?.[0];
      const defaultImage = variant?.thumbnail || variant?.images?.[0] || null;

      return {
        id: item._id.toString(),
        productId: item.productId._id.toString(),
        productName: item.productId.name,
        price: item.productId.price,
        image: defaultImage,
        color: item.color || variant?.name || null,
        size: item.size,
        quantity: item.quantity,
      };
    });

    res.json(formattedCart);
  } catch (error) {
    res.status(500).json({ message: '장바구니를 불러오는 중 오류가 발생했습니다.' });
  }
});

// 장바구니에 추가
router.post('/', requireAuth, async (req, res) => {
  try {
    const { productId, size, color, quantity = 1 } = req.body;

    if (!productId || !size) {
      return res.status(400).json({ message: '상품 ID와 사이즈는 필수입니다.' });
    }

    // 상품 존재 확인
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: '상품을 찾을 수 없습니다.' });
    }

    // 색상이 제공되지 않았으면 첫 번째 색상을 기본값으로 사용
    let finalColor = color;
    if (!finalColor && product.colorVariants && product.colorVariants.length > 0) {
      finalColor = product.colorVariants[0].name;
    }

    // 동일한 상품, 사이즈, 색상이 이미 장바구니에 있는지 확인
    const existingCartItem = await Cart.findOne({
      userId: req.session.userId,
      productId: productId,
      size: size,
      color: finalColor || null,
    });

    if (existingCartItem) {
      // 이미 있으면 수량만 증가
      existingCartItem.quantity += quantity;
      await existingCartItem.save();
      return res.json({
        id: existingCartItem._id.toString(),
        productId: productId,
        size: size,
        color: existingCartItem.color || finalColor || null,
        quantity: existingCartItem.quantity,
        message: '장바구니에 추가되었습니다.',
      });
    }

    // 새로 추가
    const cartItem = await Cart.create({
      userId: req.session.userId,
      productId: productId,
      size: size,
      color: finalColor || null,
      quantity: quantity,
    });

    res.status(201).json({
      id: cartItem._id.toString(),
      productId: productId,
      size: size,
      color: cartItem.color || finalColor || null,
      quantity: quantity,
      message: '장바구니에 추가되었습니다.',
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: '유효하지 않은 상품 ID입니다.' });
    }
    res.status(500).json({ message: '장바구니에 추가하는 중 오류가 발생했습니다.' });
  }
});

// 장바구니 수량 수정
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { quantity } = req.body;
    const cartItem = await Cart.findOne({
      _id: req.params.id,
      userId: req.session.userId,
    });

    if (!cartItem) {
      return res.status(404).json({ message: '장바구니 항목을 찾을 수 없습니다.' });
    }

    if (quantity < 1) {
      return res.status(400).json({ message: '수량은 1개 이상이어야 합니다.' });
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    res.json({
      id: cartItem._id.toString(),
      quantity: cartItem.quantity,
      message: '수량이 업데이트되었습니다.',
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: '유효하지 않은 장바구니 ID입니다.' });
    }
    res.status(500).json({ message: '수량을 업데이트하는 중 오류가 발생했습니다.' });
  }
});

// 장바구니에서 삭제
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const cartItem = await Cart.findOneAndDelete({
      _id: req.params.id,
      userId: req.session.userId,
    });

    if (!cartItem) {
      return res.status(404).json({ message: '장바구니 항목을 찾을 수 없습니다.' });
    }

    res.json({ message: '장바구니에서 삭제되었습니다.' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: '유효하지 않은 장바구니 ID입니다.' });
    }
    res.status(500).json({ message: '장바구니에서 삭제하는 중 오류가 발생했습니다.' });
  }
});

// 장바구니 전체 비우기
router.delete('/', requireAuth, async (req, res) => {
  try {
    await Cart.deleteMany({ userId: req.session.userId });
    res.json({ message: '장바구니가 비워졌습니다.' });
  } catch (error) {
    res.status(500).json({ message: '장바구니를 비우는 중 오류가 발생했습니다.' });
  }
});

module.exports = router;

