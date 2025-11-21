const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { name, username, email, phone, password } = req.body;

    if (!name || !username || !email || !phone || !password) {
      return res.status(400).json({ message: '모든 필드를 입력해주세요.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      username,
      email,
      phone,
      password: hashedPassword,
    });

    res.status(201).json({
      id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      phone: user.phone,
      createdAt: user.createdAt,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: '이미 사용 중인 아이디 또는 이메일입니다.',
      });
    }

    res.status(500).json({ message: '회원 생성 중 오류가 발생했습니다.' });
  }
});

module.exports = router;

