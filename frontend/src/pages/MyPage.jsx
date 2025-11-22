import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SidebarMenu from '../components/SidebarMenu'
import ProfileCard from '../components/ProfileCard'
import OrdersCard from '../components/OrdersCard'
import API_BASE_URL from '../config/api'
import './MyPage.css'

const defaultProfile = {
  name: '김메서브',
  username: 'mesub01',
  email: 'mesub@example.com',
  phone: '010-1234-5678',
}

function MyPage() {
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState('profile')
  const [user, setUser] = useState(null)
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          credentials: 'include',
        })
        
        if (!response.ok) {
          navigate('/login', { state: { from: { pathname: '/mypage' } } })
          return
        }
        
        const data = await response.json()
        
        // 인증 확인
        if (data?.authenticated === true) {
          // authenticated 필드 제거하고 사용자 정보만 저장
          const { authenticated, ...userData } = data
          setUser(userData)
        } else {
          // 로그인 안되어 있으면 로그인 페이지로 리다이렉트
          navigate('/login', { state: { from: { pathname: '/mypage' } } })
          return
        }
      } catch (error) {
        navigate('/login', { state: { from: { pathname: '/mypage' } } })
      } finally {
        setLoading(false)
      }
    }

    fetchCurrentUser()

    // 로그인 상태 변경 이벤트 리스너
    const handleAuthChange = () => {
      fetchCurrentUser()
    }

    window.addEventListener('authChanged', handleAuthChange)
    return () => window.removeEventListener('authChanged', handleAuthChange)
  }, [navigate])

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        setOrders([])
        return
      }

      try {
        setOrdersLoading(true)
        const response = await fetch(`${API_BASE_URL}/api/orders`, {
          credentials: 'include',
        })
        
        if (response.ok) {
          const data = await response.json()
          setOrders(data)
        } else {
          setOrders([])
        }
      } catch (error) {
        setOrders([])
      } finally {
        setOrdersLoading(false)
      }
    }

    fetchOrders()
  }, [user])

  const profileData = useMemo(() => user || defaultProfile, [user])

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })
      setUser(null)
      window.dispatchEvent(new CustomEvent('authChanged'))
      navigate('/')
    } catch (error) {
      setUser(null)
      window.dispatchEvent(new CustomEvent('authChanged'))
      navigate('/')
    }
  }

  if (loading) {
    return (
      <div className="mypage-wrapper">
        <div className="mypage-login-required">
          <h2>로딩 중...</h2>
          <p>사용자 정보를 불러오는 중입니다.</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="mypage-wrapper">
      <div className="mypage">
        <SidebarMenu 
          activeSection={activeSection} 
          onChange={setActiveSection}
          onLogout={handleLogout}
        />

        <section className="mypage-content">
          {activeSection === 'profile' ? (
            <ProfileCard profile={profileData} />
          ) : (
            <OrdersCard orders={orders} loading={ordersLoading} />
          )}
        </section>
      </div>
    </div>
  )
}

export default MyPage


