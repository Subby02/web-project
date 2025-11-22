import { useCallback, useEffect, useMemo, useState } from 'react'
import './AdminDashboard.css'

const SIZE_OPTIONS = [260, 265, 270, 275, 280, 285, 290, 295, 300]
const MATERIAL_OPTIONS = [
  { value: 'tree', label: '가볍고 시원한 Tree' },
  { value: 'wool', label: '부드럽고 따뜻한 Wool' },
]

const currency = (value) =>
  value.toLocaleString('ko-KR', { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 })

const emptyProduct = {
  name: '',
  description: '',
  price: '',
  releaseDate: '',
  categories: '',
  image: '',
  sizes: [],
  materials: [],
}

function AdminDashboard() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sizeDrafts, setSizeDrafts] = useState({})
  const [discountDrafts, setDiscountDrafts] = useState({})
  const [savingTarget, setSavingTarget] = useState(null)
  const [newProduct, setNewProduct] = useState(emptyProduct)
  const [creating, setCreating] = useState(false)
  const [salesFilters, setSalesFilters] = useState({ start: '', end: '' })
  const [salesResult, setSalesResult] = useState(null)
  const [salesLoading, setSalesLoading] = useState(false)
  const [salesError, setSalesError] = useState(null)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/admin/products')
      if (!response.ok) {
        throw new Error('상품 목록을 불러오지 못했습니다.')
      }
      const data = await response.json()
      setProducts(data.items ?? [])
      initializeDrafts(data.items ?? [])
    } catch (err) {
      console.error(err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const initializeDrafts = (items) => {
    const sizeState = {}
    const discountState = {}

    items.forEach((product) => {
      sizeState[product.id] = product.sizes?.map((size) => String(size)) ?? []
      discountState[product.id] = {
        rate: String(Math.round((product.discountRate ?? 0) * 100)),
        saleStart: product.saleStart ?? '',
        saleEnd: product.saleEnd ?? '',
      }
    })

    setSizeDrafts(sizeState)
    setDiscountDrafts(discountState)
  }

  const toggleSizeDraft = (productId, size) => {
    setSizeDrafts((prev) => {
      const next = new Set(prev[productId] ?? [])
      if (next.has(size)) next.delete(size)
      else next.add(size)
      return { ...prev, [productId]: Array.from(next).sort((a, b) => Number(a) - Number(b)) }
    })
  }

  const saveSizes = async (productId) => {
    setSavingTarget(productId)
    try {
      const response = await fetch(`/api/admin/products/${productId}/sizes`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sizes: sizeDrafts[productId]?.map((value) => Number(value)) ?? [] }),
      })
      if (!response.ok) {
        const { error: message } = await response.json()
        throw new Error(message ?? '사이즈 업데이트에 실패했습니다.')
      }
      const { item } = await response.json()
      setProducts((prev) => prev.map((product) => (product.id === item.id ? item : product)))
      window.alert('가용 사이즈가 저장되었습니다.')
    } catch (err) {
      window.alert(err.message)
    } finally {
      setSavingTarget(null)
    }
  }

  const updateDiscountDraft = (productId, field, value) => {
    setDiscountDrafts((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value,
      },
    }))
  }

  const saveDiscount = async (productId) => {
    setSavingTarget(productId)
    const draft = discountDrafts[productId] ?? { rate: '0', saleStart: '', saleEnd: '' }
    try {
      const response = await fetch(`/api/admin/products/${productId}/discount`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          discountRate: Number(draft.rate),
          saleStart: draft.saleStart || null,
          saleEnd: draft.saleEnd || null,
        }),
      })
      if (!response.ok) {
        const { error: message } = await response.json()
        throw new Error(message ?? '할인 정책 저장에 실패했습니다.')
      }
      const { item } = await response.json()
      setProducts((prev) => prev.map((product) => (product.id === item.id ? item : product)))
      window.alert('할인 정책이 저장되었습니다.')
    } catch (err) {
      window.alert(err.message)
    } finally {
      setSavingTarget(null)
    }
  }

  const handleNewProductChange = (field, value) => {
    setNewProduct((prev) => ({ ...prev, [field]: value }))
  }

  const toggleNewProductSize = (size) => {
    setNewProduct((prev) => {
      const next = new Set(prev.sizes)
      if (next.has(size)) next.delete(size)
      else next.add(size)
      return { ...prev, sizes: Array.from(next) }
    })
  }

  const toggleNewProductMaterial = (material) => {
    setNewProduct((prev) => {
      const next = new Set(prev.materials)
      if (next.has(material)) next.delete(material)
      else next.add(material)
      return { ...prev, materials: Array.from(next) }
    })
  }

  const createProduct = async (event) => {
    event.preventDefault()
    setCreating(true)
    try {
      const payload = {
        name: newProduct.name.trim(),
        description: newProduct.description.trim(),
        price: Number(newProduct.price),
        releaseDate: newProduct.releaseDate,
        categories: newProduct.categories
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean),
        sizes: newProduct.sizes,
        materials: newProduct.materials,
        image: newProduct.image.trim(),
      }

      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error ?? '상품 등록에 실패했습니다.')
      }

      setProducts((prev) => {
        const next = [...prev, data.item]
        initializeDrafts(next)
        return next
      })
      setNewProduct(emptyProduct)
      window.alert('새로운 상품이 등록되었습니다.')
    } catch (err) {
      window.alert(err.message)
    } finally {
      setCreating(false)
    }
  }

  const fetchSales = async () => {
    setSalesLoading(true)
    setSalesError(null)
    setSalesResult(null)

    try {
      const params = new URLSearchParams()
      params.append('start', salesFilters.start)
      params.append('end', salesFilters.end)

      const response = await fetch(`/api/admin/sales?${params.toString()}`)
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error ?? '판매 현황을 불러오지 못했습니다.')
      }
      setSalesResult(data)
    } catch (err) {
      setSalesError(err.message)
    } finally {
      setSalesLoading(false)
    }
  }

  const productSummary = useMemo(() => {
    if (!salesResult) return null
    return {
      totalUnits: salesResult.totals?.units ?? 0,
      totalRevenue: currency(Math.round(salesResult.totals?.revenue ?? 0)),
    }
  }, [salesResult])

  return (
    <div className="admin-page">
      <section className="admin-card">
        <header className="admin-card__header">
          <div>
            <h2>상품 관리</h2>
            <p>가용 사이즈와 할인 정책을 빠르게 조정할 수 있습니다.</p>
          </div>
        </header>
        {loading && <p>상품 정보를 불러오는 중...</p>}
        {error && <p className="error-state">{error}</p>}
        {!loading && !error && (
          <div className="admin-product-list">
            {products.map((product) => (
              <article key={product.id} className="admin-product">
                <div className="admin-product__info">
                  <h3>{product.name}</h3>
                  <p>{product.description || '설명이 없습니다.'}</p>
                  <p className="admin-product__meta">
                    가격 {currency(product.price)} · 출시일 {product.releaseDate}
                  </p>
                </div>
                <div className="admin-product__controls">
                  <div className="admin-form-group">
                    <p className="admin-form-group__label">가용 사이즈</p>
                    <div className="size-grid size-grid--compact">
                      {SIZE_OPTIONS.map((size) => (
                        <button
                          key={size}
                          type="button"
                          className={`size-grid__button ${
                            sizeDrafts[product.id]?.includes(String(size)) ? 'is-selected' : ''
                          }`}
                          onClick={() => toggleSizeDraft(product.id, String(size))}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                    <button
                      className="admin-button"
                      type="button"
                      onClick={() => saveSizes(product.id)}
                      disabled={!sizeDrafts[product.id]?.length || savingTarget === product.id}
                    >
                      {savingTarget === product.id ? '저장 중...' : '사이즈 저장'}
                    </button>
                  </div>

                  <div className="admin-form-group">
                    <p className="admin-form-group__label">할인 정책</p>
                    <div className="discount-form">
                      <label>
                        할인율(%)
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={discountDrafts[product.id]?.rate ?? '0'}
                          onChange={(event) => updateDiscountDraft(product.id, 'rate', event.target.value)}
                        />
                      </label>
                      <label>
                        시작일
                        <input
                          type="date"
                          value={discountDrafts[product.id]?.saleStart ?? ''}
                          onChange={(event) => updateDiscountDraft(product.id, 'saleStart', event.target.value)}
                        />
                      </label>
                      <label>
                        종료일
                        <input
                          type="date"
                          value={discountDrafts[product.id]?.saleEnd ?? ''}
                          onChange={(event) => updateDiscountDraft(product.id, 'saleEnd', event.target.value)}
                        />
                      </label>
                    </div>
                    <button
                      className="admin-button"
                      type="button"
                      onClick={() => saveDiscount(product.id)}
                      disabled={savingTarget === product.id}
                    >
                      {savingTarget === product.id ? '저장 중...' : '할인 저장'}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="admin-card">
        <header className="admin-card__header">
          <div>
            <h2>상품 등록</h2>
            <p>이미지 URL을 포함한 모든 필수 정보를 입력해야 합니다.</p>
          </div>
        </header>
        <form className="admin-form" onSubmit={createProduct}>
          <label>
            상품명 *
            <input
              type="text"
              value={newProduct.name}
              onChange={(event) => handleNewProductChange('name', event.target.value)}
              required
            />
          </label>
          <label>
            설명
            <textarea
              value={newProduct.description}
              onChange={(event) => handleNewProductChange('description', event.target.value)}
              rows={3}
            />
          </label>
          <div className="admin-form__row">
            <label>
              가격(원) *
              <input
                type="number"
                min="0"
                value={newProduct.price}
                onChange={(event) => handleNewProductChange('price', event.target.value)}
                required
              />
            </label>
            <label>
              출시일 *
              <input
                type="date"
                value={newProduct.releaseDate}
                onChange={(event) => handleNewProductChange('releaseDate', event.target.value)}
                required
              />
            </label>
          </div>
          <label>
            카테고리(쉼표 구분)
            <input
              type="text"
              placeholder="예: 신발, 라이프스타일"
              value={newProduct.categories}
              onChange={(event) => handleNewProductChange('categories', event.target.value)}
            />
          </label>
          <label>
            이미지 URL *
            <input
              type="url"
              value={newProduct.image}
              onChange={(event) => handleNewProductChange('image', event.target.value)}
              required
            />
          </label>
          <div className="admin-form__row">
            <div className="admin-form__column">
              <p className="admin-form-group__label">가용 사이즈 *</p>
              <div className="size-grid size-grid--compact">
                {SIZE_OPTIONS.map((size) => (
                  <button
                    key={size}
                    type="button"
                    className={`size-grid__button ${newProduct.sizes.includes(String(size)) ? 'is-selected' : ''}`}
                    onClick={() => toggleNewProductSize(String(size))}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
            <div className="admin-form__column">
              <p className="admin-form-group__label">소재 *</p>
              <div className="material-list material-list--horizontal">
                {MATERIAL_OPTIONS.map((option) => (
                  <label key={option.value} className="material-list__item">
                    <input
                      type="checkbox"
                      checked={newProduct.materials.includes(option.value)}
                      onChange={() => toggleNewProductMaterial(option.value)}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <button className="admin-button admin-button--primary" type="submit" disabled={creating}>
            {creating ? '등록 중...' : '상품 등록'}
          </button>
        </form>
      </section>

      <section className="admin-card">
        <header className="admin-card__header">
          <div>
            <h2>판매 현황</h2>
            <p>기간을 지정해 판매량과 매출을 확인하세요.</p>
          </div>
        </header>

        <div className="sales-filter">
          <label>
            시작일
            <input
              type="date"
              value={salesFilters.start}
              onChange={(event) => setSalesFilters((prev) => ({ ...prev, start: event.target.value }))}
            />
          </label>
          <label>
            종료일
            <input
              type="date"
              value={salesFilters.end}
              onChange={(event) => setSalesFilters((prev) => ({ ...prev, end: event.target.value }))}
            />
          </label>
          <button
            className="admin-button admin-button--primary"
            type="button"
            onClick={fetchSales}
            disabled={!salesFilters.start || !salesFilters.end || salesLoading}
          >
            {salesLoading ? '조회 중...' : '판매현황 조회'}
          </button>
        </div>

        {salesError && <p className="error-state">{salesError}</p>}

        {salesResult && (
          <>
            <div className="sales-summary">
              <p>
                기간: {salesResult.range?.start} ~ {salesResult.range?.end}
              </p>
              <p>
                총 판매수량 {productSummary?.totalUnits ?? 0} · 총 매출 {productSummary?.totalRevenue ?? '₩0'}
              </p>
            </div>
            <div className="sales-table-wrapper">
              <table className="sales-table">
                <thead>
                  <tr>
                    <th>제품명</th>
                    <th>판매수량</th>
                    <th>매출</th>
                  </tr>
                </thead>
                <tbody>
                  {salesResult.items?.map((item) => (
                    <tr key={item.productId}>
                      <td>{item.name}</td>
                      <td>{item.units.toLocaleString('ko-KR')}</td>
                      <td>{currency(Math.round(item.revenue))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </div>
  )
}

export default AdminDashboard

