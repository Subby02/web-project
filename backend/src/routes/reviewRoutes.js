const express = require('express');
const Review = require('../models/Review');
const User = require('../models/User');

const router = express.Router();

// 미들웨어: 로그인 확인
const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: '로그인이 필요합니다.' });
  }
  next();
};

// 후기 작성
router.post('/', requireAuth, async (req, res) => {
  try {
    const { productId, score, title, comment } = req.body;

    // 필수 필드 확인
    if (!productId || !score || !title || !comment) {
      return res.status(400).json({ message: '모든 필드를 입력해주세요.' });
    }

    // 점수 범위 확인
    if (score < 1 || score > 5) {
      return res.status(400).json({ message: '점수는 1~5 사이여야 합니다.' });
    }

    // 이미 해당 상품에 대한 리뷰를 작성했는지 확인
    const existingReview = await Review.findOne({
      userId: req.session.userId,
      productId: productId,
    });

    if (existingReview) {
      return res.status(400).json({ message: '이미 이 상품에 대한 리뷰를 작성하셨습니다.' });
    }

    // 후기 생성
    const review = await Review.create({
      userId: req.session.userId,
      productId: productId,
      score: score,
      title: title.trim(),
      comment: comment.trim(),
      date: new Date(),
    });

    // 작성된 후기 반환
    const populatedReview = await Review.findById(review._id)
      .populate('userId', 'name')
      .populate('productId', 'name');

    res.status(201).json({
      id: populatedReview._id.toString(),
      rating: populatedReview.score,
      author: populatedReview.userId?.name || '익명',
      title: populatedReview.title,
      text: populatedReview.comment,
      createdAt: populatedReview.date || populatedReview.createdAt,
      message: '후기가 작성되었습니다.',
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: '유효하지 않은 상품 ID입니다.' });
    }
    console.error('후기 작성 오류:', error);
    res.status(500).json({ message: '후기 작성 중 오류가 발생했습니다.' });
  }
});

// 상품별 리뷰 목록 (최대 3개)
router.get('/:id', async (req, res) => {
  try {
    const productId = req.params.id;

    const reviews = await Review.find({ productId })
      .populate('userId', 'name')
      .sort({ date: -1, createdAt: -1 })
      .limit(3)
      .select('score title comment date createdAt userId');

    const formattedReviews = reviews.map((review) => ({
      id: review._id.toString(),
      rating: review.score,
      author: review.userId?.name || '익명',
      title: review.title || null,
      text: review.comment,
      createdAt: review.date || review.createdAt,
    }));

    res.json(formattedReviews);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: '유효하지 않은 상품 ID입니다.' });
    }
    res.status(500).json({ message: '리뷰를 불러오는 중 오류가 발생했습니다.' });
  }
});

module.exports = router;

