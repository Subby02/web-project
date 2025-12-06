const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, username, email, phone, password } = req.body;

    if (!name || !username || !email || !phone || !password) {
      return res.status(400).json({ message: '모든 필드를 입력해주세요.' });
    }

    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });
    if (existingUser) {
      return res.status(409).json({ message: '이미 사용 중인 아이디 또는 이메일입니다.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      username,
      email,
      phone,
      password: hashedPassword,
    });

    req.session.userId = user._id.toString();

    res.status(201).json({
      id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      phone: user.phone,
      createdAt: user.createdAt,
    });
  } catch (error) {
    res.status(500).json({ message: '회원가입 중 오류가 발생했습니다.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;

    if (!usernameOrEmail || !password) {
      return res.status(400).json({ message: '아이디/이메일과 비밀번호를 입력해주세요.' });
    }

    const user = await User.findOne({
      $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
    });

    if (!user) {
      return res.status(401).json({ message: '존재하지 않는 계정입니다.' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: '비밀번호가 올바르지 않습니다.' });
    }

    req.session.userId = user._id.toString();

    res.json({
      id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      phone: user.phone,
      isAdmin: user.isAdmin || false,
    });
  } catch (error) {
    res.status(500).json({ message: '로그인 중 오류가 발생했습니다.' });
  }
});

router.post('/logout', (req, res) => {
  if (!req.session.userId) {
    return res.status(200).json({ message: '이미 로그아웃 상태입니다.' });
  }

  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: '로그아웃 중 오류가 발생했습니다.' });
    }

    res.clearCookie('connect.sid');
    res.json({ message: '로그아웃되었습니다.' });
  });
});

router.get('/me', async (req, res) => {
  if (!req.session.userId) {
    return res.status(200).json({ authenticated: false });
  }

  try {
    const user = await User.findById(req.session.userId).select(
      'name username email phone createdAt isAdmin'
    );

    if (!user) {
      return res.status(200).json({ authenticated: false });
    }

    // 사용자 정보와 authenticated 필드 함께 반환
    res.status(200).json({
      authenticated: true,
      ...user.toObject(),
    });
  } catch (error) {
    res.status(200).json({ authenticated: false });
  }
});

module.exports = router;

