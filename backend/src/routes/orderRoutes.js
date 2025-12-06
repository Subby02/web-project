const express = require('express');
const Order = require('../models/Order');
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

// 주문 ID 생성 함수
const generateOrderId = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `ORD-${timestamp}-${random}`;
};

// 주문 생성 (결제하기)
router.post('/', requireAuth, async (req, res) => {
  try {
    const { items } = req.body; // [{ productId, quantity, size }] 또는 장바구니 전체 주문

    let orderItems = [];

    if (items && Array.isArray(items) && items.length > 0) {
      // 직접 주문 (상품 상세 페이지에서 바로 주문)
      orderItems = items;
    } else {
      // 장바구니에서 주문
      const cartItems = await Cart.find({ userId: req.session.userId });
      if (cartItems.length === 0) {
        return res.status(400).json({ message: '장바구니가 비어있습니다.' });
      }
      orderItems = cartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        size: item.size,
        color: item.color || null,
      }));
    }

    // 주문 생성
    const orders = [];
    const now = new Date();
    
    for (const item of orderItems) {
      const product = await Product.findById(item.productId);
      if (!product) {
        continue; // 상품이 없으면 스킵
      }

      // 주문 시점의 할인 가격 계산
      const hasSalePeriod = product.saleStart && product.saleEnd;
      const isOnSale =
        hasSalePeriod &&
        product.discountRate > 0 &&
        now >= product.saleStart &&
        now <= product.saleEnd;

      let paidAmount = product.price; // 기본값은 원가
      if (isOnSale && product.discountRate > 0) {
        // 할인된 가격 = 원가 * (1 - 할인율 / 100)
        paidAmount = Math.round(product.price * (1 - product.discountRate / 100));
      }

      const orderId = generateOrderId();
      const order = await Order.create({
        orderId: orderId,
        userId: req.session.userId,
        productId: item.productId,
        quantity: item.quantity,
        size: item.size || null,
        color: item.color || null,
        paidAmount: paidAmount, // 실제 결제 금액 저장
        date: new Date(),
      });
      orders.push(order);
    }

    if (orders.length === 0) {
      return res.status(400).json({ message: '주문할 상품이 없습니다.' });
    }

    // 장바구니 비우기 (장바구니에서 주문한 경우)
    if (!items || items.length === 0) {
      await Cart.deleteMany({ userId: req.session.userId });
    }

    const formattedOrders = await Promise.all(
      orders.map(async (order) => {
        const product = await Product.findById(order.productId);
        return {
          id: order._id.toString(),
          orderId: order.orderId,
          productId: order.productId.toString(),
          productName: product?.name || '알 수 없음',
          quantity: order.quantity,
          date: order.date,
          price: product?.price || 0,
        };
      })
    );

    res.status(201).json({
      message: '주문이 완료되었습니다.',
      orders: formattedOrders,
    });
  } catch (error) {
    console.error('주문 생성 오류:', error);
    res.status(500).json({ message: '주문을 생성하는 중 오류가 발생했습니다.' });
  }
});

// 주문 내역 조회
router.get('/', requireAuth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.session.userId })
      .populate('productId', 'name price image')
      .sort({ date: -1, createdAt: -1 });

    const formattedOrders = orders.map((order) => ({
      id: order._id.toString(),
      orderId: order.orderId,
      productId: order.productId._id.toString(),
      productName: order.productId.name,
      productImage: order.productId.image,
      price: order.productId.price,
      quantity: order.quantity,
      totalPrice: order.productId.price * order.quantity,
      date: order.date || order.createdAt,
    }));

    res.json(formattedOrders);
  } catch (error) {
    res.status(500).json({ message: '주문 내역을 불러오는 중 오류가 발생했습니다.' });
  }
});

// 특정 주문 조회
router.get('/:orderId', requireAuth, async (req, res) => {
  try {
    const order = await Order.findOne({
      orderId: req.params.orderId,
      userId: req.session.userId,
    }).populate('productId', 'name price image');

    if (!order) {
      return res.status(404).json({ message: '주문을 찾을 수 없습니다.' });
    }

    res.json({
      id: order._id.toString(),
      orderId: order.orderId,
      productId: order.productId._id.toString(),
      productName: order.productId.name,
      productImage: order.productId.image,
      price: order.productId.price,
      quantity: order.quantity,
      totalPrice: order.productId.price * order.quantity,
      date: order.date || order.createdAt,
    });
  } catch (error) {
    res.status(500).json({ message: '주문을 불러오는 중 오류가 발생했습니다.' });
  }
});

module.exports = router;

