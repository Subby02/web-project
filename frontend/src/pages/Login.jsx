import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API_BASE_URL from '../config/api';
import { getLocalCart, clearLocalCart } from '../utils/cartStorage';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loginForm, setLoginForm] = useState({
    usernameOrEmail: '',
    password: '',
  });
  const [registerForm, setRegisterForm] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    password: '',
  });
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // 로그인 상태 확인
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          credentials: 'include',
        });
        const data = await response.json();
        // /api/auth/me는 항상 200을 반환하고 authenticated 필드로 로그인 상태 확인
        if (data?.authenticated === true) {
          // 이미 로그인되어 있으면 마이페이지로 리다이렉트
          const from = location.state?.from?.pathname || '/mypage';
          navigate(from, { replace: true });
        }
      } catch (error) {
        // 에러 발생 시 무시
      }
    };
    checkAuth();
  }, [navigate, location]);

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginForm((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterForm((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(loginForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '로그인에 실패했습니다.');
      }

      setSuccess('로그인되었습니다.');
      
      // 로컬 스토리지 장바구니를 서버로 동기화
      const localCart = getLocalCart();
      if (localCart.length > 0) {
        try {
          // 각 아이템을 서버 장바구니에 추가
          for (const item of localCart) {
            await fetch(`${API_BASE_URL}/api/cart`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify({
                productId: item.productId,
                size: item.size,
                quantity: item.quantity,
              }),
            });
          }
          // 동기화 완료 후 로컬 스토리지 비우기
          clearLocalCart();
        } catch (syncError) {
          // 동기화 실패해도 로그인은 계속 진행
        }
      }
      
      // 로그인 상태 변경 이벤트 발생 (Header에서 로그인 상태 업데이트)
      window.dispatchEvent(new CustomEvent('authChanged'));
      
      // 리다이렉트할 경로 (이전 페이지 또는 마이페이지)
      const from = location.state?.from?.pathname || '/mypage';
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 500);
    } catch (err) {
      setError(err.message || '로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(registerForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '회원가입에 실패했습니다.');
      }

      setSuccess('회원가입이 완료되었습니다. 로그인해주세요.');
      setMode('login');
      setLoginForm({
        usernameOrEmail: registerForm.username,
        password: '',
      });
    } catch (err) {
      setError(err.message || '회원가입 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <h1 className="login-title">올버즈</h1>
        
        <div className="login-tabs">
          <button
            className={`login-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => {
              setMode('login');
              setError(null);
            }}
          >
            로그인
          </button>
          <button
            className={`login-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => {
              setMode('register');
              setError(null);
            }}
          >
            회원가입
          </button>
        </div>

        {error && <div className="login-error">{error}</div>}
        {success && <div className="login-success">{success}</div>}

        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="usernameOrEmail">아이디 또는 이메일</label>
              <input
                id="usernameOrEmail"
                name="usernameOrEmail"
                type="text"
                value={loginForm.usernameOrEmail}
                onChange={handleLoginChange}
                placeholder="아이디 또는 이메일을 입력하세요"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">비밀번호</label>
              <input
                id="password"
                name="password"
                type="password"
                value={loginForm.password}
                onChange={handleLoginChange}
                placeholder="비밀번호를 입력하세요"
                required
              />
            </div>
            <button type="submit" className="login-button" disabled={loading}>
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="login-form">
            <div className="form-group">
              <label htmlFor="name">이름</label>
              <input
                id="name"
                name="name"
                type="text"
                value={registerForm.name}
                onChange={handleRegisterChange}
                placeholder="이름을 입력하세요"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="username">아이디</label>
              <input
                id="username"
                name="username"
                type="text"
                value={registerForm.username}
                onChange={handleRegisterChange}
                placeholder="아이디를 입력하세요"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">이메일</label>
              <input
                id="email"
                name="email"
                type="email"
                value={registerForm.email}
                onChange={handleRegisterChange}
                placeholder="이메일을 입력하세요"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">전화번호</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={registerForm.phone}
                onChange={handleRegisterChange}
                placeholder="전화번호를 입력하세요"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="registerPassword">비밀번호</label>
              <input
                id="registerPassword"
                name="password"
                type="password"
                value={registerForm.password}
                onChange={handleRegisterChange}
                placeholder="6자 이상"
                minLength={6}
                required
              />
            </div>
            <button type="submit" className="login-button" disabled={loading}>
              {loading ? '회원가입 중...' : '회원가입'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

