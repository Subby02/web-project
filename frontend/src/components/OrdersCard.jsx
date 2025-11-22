function OrdersCard({ orders = [], loading = false }) {
  const formatCurrency = (value) => `₩${value.toLocaleString('ko-KR')}`
  
  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="orders-card">
        <div className="orders-header">
          <div>
            <h2>지난 주문내역</h2>
          </div>
        </div>
        <div style={{ textAlign: 'center', padding: '48px' }}>로딩 중...</div>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="orders-card">
        <div className="orders-header">
          <div>
            <h2>지난 주문내역</h2>
          </div>
        </div>
        <div style={{ textAlign: 'center', padding: '48px', color: '#666' }}>
          주문 내역이 없습니다.
        </div>
      </div>
    )
  }

  return (
    <div className="orders-card">
      <div className="orders-header">
        <div>
          <h2>지난 주문내역</h2>
          <p>총 {orders.length}건</p>
        </div>
      </div>

      <div className="orders-table">
        <div className="orders-table-head">
          <span>제품명</span>
          <span>수량</span>
          <span>결제금액</span>
          <span>결제일</span>
          <span />
        </div>
        {orders.map((order) => (
          <div key={order.id} className="orders-table-row">
            <span className="product">{order.productName}</span>
            <span>{order.quantity}개</span>
            <span>{formatCurrency(order.totalPrice || order.price * order.quantity)}</span>
            <span>{formatDate(order.date)}</span>
            <span>
              <button className="review-button">후기 작성</button>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default OrdersCard

