function OrdersCard({ orders }) {
  const formatCurrency = (value) => `${value.toLocaleString('ko-KR')}원`

  return (
    <div className="orders-card">
      <div className="orders-header">
        <div>
          <h2>지난 주문내역</h2>
          <p>최근 3건</p>
        </div>
        <button className="ghost-button">전체 보기</button>
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
            <span>{formatCurrency(order.amount)}</span>
            <span>{order.paidAt}</span>
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

