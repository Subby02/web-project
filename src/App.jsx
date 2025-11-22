import { useState } from 'react'
import StoreFront from './pages/StoreFront.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import './App.css'

function App() {
  const [view, setView] = useState('store')

  return (
    <div className="app-shell">
      <header className="top-nav">
        <div className="top-nav__brand">
          <span role="img" aria-hidden="true">
            👟
          </span>
          <strong>라이프스타일 슈즈</strong>
        </div>
        <div className="top-nav__actions" role="tablist" aria-label="페이지 선택">
          <button
            className={`top-nav__button ${view === 'store' ? 'is-active' : ''}`}
            type="button"
            onClick={() => setView('store')}
            role="tab"
            aria-selected={view === 'store'}
          >
            상품 목록
          </button>
          <button
            className={`top-nav__button ${view === 'admin' ? 'is-active' : ''}`}
            type="button"
            onClick={() => setView('admin')}
            role="tab"
            aria-selected={view === 'admin'}
          >
            관리자 페이지
          </button>
        </div>
      </header>

      {view === 'store' ? <StoreFront /> : <AdminDashboard />}
    </div>
  )
}

export default App
