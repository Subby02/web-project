const express = require('express');
const Review = require('../models/Review');
const User = require('../models/User');

const router = express.Router();

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

