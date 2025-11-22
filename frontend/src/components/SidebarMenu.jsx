function SidebarMenu({ activeSection, onChange, onLogout }) {
  return (
    <aside className="mypage-sidebar">
      <div className="sidebar-header">
        <h1>마이페이지</h1>
        <p>내 계정 관리</p>
      </div>
      <nav className="sidebar-menu">
        <button
          className={activeSection === 'profile' ? 'active' : ''}
          onClick={() => onChange('profile')}
        >
          회원 정보
        </button>
        <button
          className={activeSection === 'orders' ? 'active' : ''}
          onClick={() => onChange('orders')}
        >
          지난 주문내역
        </button>
      </nav>
      <div className="sidebar-footer">
        <a href="#" className="sidebar-logout-link" onClick={(e) => {
          e.preventDefault()
          onLogout()
        }}>
          로그아웃
        </a>
      </div>
    </aside>
  )
}

export default SidebarMenu

