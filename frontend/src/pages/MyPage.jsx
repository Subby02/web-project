import { useEffect, useMemo, useState } from 'react'
import SidebarMenu from '../components/SidebarMenu'
import ProfileCard from '../components/ProfileCard'
import OrdersCard from '../components/OrdersCard'
import './MyPage.css'

const defaultProfile = {
  name: '김메서브',
  username: 'mesub01',
  email: 'mesub@example.com',
  phone: '010-1234-5678',
}

const orders = [
  {
    id: '2024-001',
    productName: '프리미엄 원두 세트',
    quantity: 2,
    amount: 36000,
    paidAt: '2024-10-02',
  },
  {
    id: '2024-002',
    productName: '더치 커피 세트',
    quantity: 1,
    amount: 28000,
    paidAt: '2024-10-15',
  },
  {
    id: '2024-003',
    productName: '머그컵 & 드립백 구성',
    quantity: 3,
    amount: 54000,
    paidAt: '2024-11-05',
  },
]

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

async function apiRequest(path, { method = 'GET', body, headers } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.message || '요청을 처리할 수 없습니다.')
  }
  return data
}

function MyPage() {
  const [activeSection, setActiveSection] = useState('profile')
  const [user, setUser] = useState(null)
  const [authMode, setAuthMode] = useState(null)
  const [authLoading, setAuthLoading] = useState(false)
  const [authFeedback, setAuthFeedback] = useState(null)
  const [registerForm, setRegisterForm] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    password: '',
  })
  const [loginForm, setLoginForm] = useState({
    usernameOrEmail: '',
    password: '',
  })

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const profile = await apiRequest('/api/auth/me')
        setUser(profile)
      } catch {
        setUser(null)
      }
    }

    fetchCurrentUser()
  }, [])

  const isLoggedIn = Boolean(user)
  const profileData = useMemo(() => user || defaultProfile, [user])

  const toggleAuthMode = (mode) => {
    setAuthFeedback(null)
    setAuthMode((prev) => (prev === mode ? null : mode))
  }

  const handleRegisterChange = (event) => {
    const { name, value } = event.target
    setRegisterForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleLoginChange = (event) => {
    const { name, value } = event.target
    setLoginForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleRegisterSubmit = async (event) => {
    event.preventDefault()
    setAuthLoading(true)
    setAuthFeedback(null)

    try {
      const profile = await apiRequest('/api/auth/register', {
        method: 'POST',
        body: registerForm,
      })
      setUser(profile)
      setAuthMode(null)
      setAuthFeedback({ type: 'success', message: '회원가입이 완료되었습니다.' })
    } catch (error) {
      setAuthFeedback({ type: 'error', message: error.message })
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLoginSubmit = async (event) => {
    event.preventDefault()
    setAuthLoading(true)
    setAuthFeedback(null)

    try {
      const profile = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: loginForm,
      })
      setUser(profile)
      setAuthMode(null)
      setAuthFeedback({ type: 'success', message: '로그인되었습니다.' })
    } catch (error) {
      setAuthFeedback({ type: 'error', message: error.message })
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLogout = async () => {
    setAuthLoading(true)
    setAuthFeedback(null)
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' })
      setUser(null)
      setAuthFeedback({ type: 'success', message: '로그아웃되었습니다.' })
    } catch (error) {
      setAuthFeedback({ type: 'error', message: error.message })
    } finally {
      setAuthLoading(false)
    }
  }

  return (
    <div className="mypage-wrapper">
      <header className="mypage-topbar">
        <div className="topbar-title">
          <h1>마이페이지</h1>
          <p>회원 정보와 주문을 한곳에서 확인하세요.</p>
        </div>
        <div className="topbar-actions">
          {isLoggedIn ? (
            <>
              <span className="welcome-text">{user.name}님 환영합니다.</span>
              <button className="ghost-button" onClick={handleLogout} disabled={authLoading}>
                로그아웃
              </button>
            </>
          ) : (
            <>
              <button
                className={`ghost-button ${authMode === 'login' ? 'active' : ''}`}
                onClick={() => toggleAuthMode('login')}
              >
                로그인
              </button>
              <button
                className={`primary-button ${authMode === 'register' ? 'active' : ''}`}
                onClick={() => toggleAuthMode('register')}
              >
                회원가입
              </button>
            </>
          )}
        </div>
      </header>

      {!isLoggedIn && authMode && (
        <div className="auth-panel">
          <form onSubmit={authMode === 'login' ? handleLoginSubmit : handleRegisterSubmit}>
            {authMode === 'login' ? (
              <>
                <div className="form-row">
                  <label htmlFor="usernameOrEmail">아이디 또는 이메일</label>
                  <input
                    id="usernameOrEmail"
                    name="usernameOrEmail"
                    value={loginForm.usernameOrEmail}
                    onChange={handleLoginChange}
                    placeholder="아이디 또는 이메일을 입력하세요"
                    required
                  />
                </div>
                <div className="form-row">
                  <label htmlFor="loginPassword">비밀번호</label>
                  <input
                    id="loginPassword"
                    name="password"
                    type="password"
                    value={loginForm.password}
                    onChange={handleLoginChange}
                    placeholder="비밀번호"
                    required
                  />
                </div>
              </>
            ) : (
              <>
                <div className="form-grid">
                  <div className="form-row">
                    <label htmlFor="name">이름</label>
                    <input
                      id="name"
                      name="name"
                      value={registerForm.name}
                      onChange={handleRegisterChange}
                      placeholder="홍길동"
                      required
                    />
                  </div>
                  <div className="form-row">
                    <label htmlFor="username">아이디</label>
                    <input
                      id="username"
                      name="username"
                      value={registerForm.username}
                      onChange={handleRegisterChange}
                      placeholder="아이디 입력"
                      required
                    />
                  </div>
                  <div className="form-row">
                    <label htmlFor="email">이메일</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={registerForm.email}
                      onChange={handleRegisterChange}
                      placeholder="example@email.com"
                      required
                    />
                  </div>
                  <div className="form-row">
                    <label htmlFor="phone">전화번호</label>
                    <input
                      id="phone"
                      name="phone"
                      value={registerForm.phone}
                      onChange={handleRegisterChange}
                      placeholder="010-0000-0000"
                      required
                    />
                  </div>
                  <div className="form-row">
                    <label htmlFor="password">비밀번호</label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      value={registerForm.password}
                      onChange={handleRegisterChange}
                      placeholder="6자 이상"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <div className="form-actions">
              <button type="button" className="ghost-button" onClick={() => setAuthMode(null)}>
                닫기
              </button>
              <button type="submit" className="primary-button" disabled={authLoading}>
                {authLoading ? '처리 중...' : authMode === 'login' ? '로그인' : '회원가입'}
              </button>
            </div>
          </form>
        </div>
      )}

      {authFeedback && (
        <p className={`auth-feedback ${authFeedback.type}`}>{authFeedback.message}</p>
      )}

      <div className="mypage">
        <SidebarMenu activeSection={activeSection} onChange={setActiveSection} />

        <section className="mypage-content">
          {activeSection === 'profile' ? (
            <ProfileCard profile={profileData} />
          ) : (
            <OrdersCard orders={orders} />
          )}
        </section>
      </div>
    </div>
  )
}

export default MyPage

