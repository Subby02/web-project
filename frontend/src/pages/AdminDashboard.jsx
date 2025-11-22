import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API_BASE_URL from '../config/api'
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
  colorVariants: [{ name: '', images: [''], thumbnail: '' }],
  sizes: [],
  materials: [],
}

function AdminDashboard() {
  const navigate = useNavigate()
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
  const [checkingAuth, setCheckingAuth] = useState(true)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/products`, {
        credentials: 'include',
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || '상품 목록을 불러오지 못했습니다.')
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

  // 관리자 권한 확인
  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          credentials: 'include',
        })
        const data = await response.json()
        
        if (!data.authenticated || !data.isAdmin) {
          // 관리자 권한이 없으면 홈페이지로 리다이렉트
          navigate('/', { replace: true })
          return
        }
        
        // 관리자 권한이 있으면 상품 목록 로드
        setCheckingAuth(false)
      } catch (err) {
        console.error('관리자 권한 확인 오류:', err)
        navigate('/', { replace: true })
      }
    }
    
    checkAdminAuth()
  }, [navigate])

  // 권한 확인 후 상품 목록 로드
  useEffect(() => {
    if (!checkingAuth) {
      fetchProducts()
    }
  }, [checkingAuth, fetchProducts])

  const initializeDrafts = (items) => {
    const sizeState = {}
    const discountState = {}

    items.forEach((product) => {
      sizeState[product.id] = product.sizes?.map((size) => String(size)) ?? []
      // discountRate는 이미 0~100 사이의 백분율
      discountState[product.id] = {
        rate: String(Math.round(product.discountRate ?? 0)),
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
      const response = await fetch(`${API_BASE_URL}/api/admin/products/${productId}/sizes`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ sizes: sizeDrafts[productId]?.map((value) => Number(value)) ?? [] }),
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || '사이즈 업데이트에 실패했습니다.')
      }
      const data = await response.json()
      // 응답: { id, sizes }
      setProducts((prev) =>
        prev.map((product) =>
          product.id === data.id ? { ...product, sizes: data.sizes } : product
        )
      )
      // drafts도 업데이트
      setSizeDrafts((prev) => ({
        ...prev,
        [productId]: data.sizes.map(String),
      }))
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
      const response = await fetch(`${API_BASE_URL}/api/admin/products/${productId}/discount`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          discountRate: Number(draft.rate),
          saleStart: draft.saleStart || undefined,
          saleEnd: draft.saleEnd || undefined,
        }),
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || '할인 정책 저장에 실패했습니다.')
      }
      const data = await response.json()
      // 응답: { id, discountRate, saleStart, saleEnd }
      setProducts((prev) =>
        prev.map((product) =>
          product.id === data.id
            ? {
                ...product,
                discountRate: data.discountRate,
                saleStart: data.saleStart,
                saleEnd: data.saleEnd,
              }
            : product
        )
      )
      // drafts도 업데이트
      setDiscountDrafts((prev) => ({
        ...prev,
        [productId]: {
          rate: String(data.discountRate),
          saleStart: data.saleStart || '',
          saleEnd: data.saleEnd || '',
        },
      }))
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

  const addColorVariant = () => {
    setNewProduct((prev) => ({
      ...prev,
      colorVariants: [...prev.colorVariants, { name: '', images: [''], thumbnail: '' }],
    }))
  }

  const removeColorVariant = (index) => {
    setNewProduct((prev) => ({
      ...prev,
      colorVariants: prev.colorVariants.filter((_, i) => i !== index),
    }))
  }

  const updateColorVariant = (index, field, value) => {
    setNewProduct((prev) => {
      const updated = [...prev.colorVariants]
      updated[index] = { ...updated[index], [field]: value }
      // thumbnail이 비어있으면 첫 번째 이미지를 thumbnail로 사용
      if (field === 'images' && !updated[index].thumbnail && value.length > 0 && value[0]) {
        updated[index].thumbnail = value[0]
      }
      return { ...prev, colorVariants: updated }
    })
  }

  const addImageToVariant = (variantIndex) => {
    setNewProduct((prev) => {
      const updated = [...prev.colorVariants]
      updated[variantIndex] = {
        ...updated[variantIndex],
        images: [...updated[variantIndex].images, ''],
      }
      return { ...prev, colorVariants: updated }
    })
  }

  const removeImageFromVariant = (variantIndex, imageIndex) => {
    setNewProduct((prev) => {
      const updated = [...prev.colorVariants]
      updated[variantIndex] = {
        ...updated[variantIndex],
        images: updated[variantIndex].images.filter((_, i) => i !== imageIndex),
      }
      return { ...prev, colorVariants: updated }
    })
  }

  const updateImageInVariant = (variantIndex, imageIndex, value) => {
    setNewProduct((prev) => {
      const updated = [...prev.colorVariants]
      updated[variantIndex] = {
        ...updated[variantIndex],
        images: updated[variantIndex].images.map((img, i) => (i === imageIndex ? value : img)),
      }
      // 첫 번째 이미지가 추가되고 thumbnail이 비어있으면 자동 설정
      if (imageIndex === 0 && value && !updated[variantIndex].thumbnail) {
        updated[variantIndex].thumbnail = value
      }
      return { ...prev, colorVariants: updated }
    })
  }

  const createProduct = async (event) => {
    event.preventDefault()
    setCreating(true)
    try {
      // 필수 필드 검증
      if (!newProduct.name.trim() || !newProduct.description.trim() || !newProduct.price || !newProduct.releaseDate) {
        throw new Error('필수 필드를 모두 입력해주세요.')
      }

      // 사이즈가 최소 1개 이상 필요
      if (!newProduct.sizes || newProduct.sizes.length === 0) {
        throw new Error('가용 사이즈를 최소 1개 이상 선택해주세요.')
      }

      // 소재가 최소 1개 이상 필요
      if (!newProduct.materials || newProduct.materials.length === 0) {
        throw new Error('소재를 최소 1개 이상 선택해주세요.')
      }

      // colorVariants 유효성 검사
      const validColorVariants = newProduct.colorVariants
        .filter((variant) => variant.name && variant.name.trim())
        .map((variant) => ({
          name: variant.name.trim(),
          images: variant.images.filter((img) => img && img.trim()),
          thumbnail: variant.thumbnail && variant.thumbnail.trim() 
            ? variant.thumbnail.trim() 
            : (variant.images.filter((img) => img && img.trim())[0] || ''),
        }))

      if (validColorVariants.length === 0) {
        throw new Error('최소 1개 이상의 색상 변형이 필요합니다.')
      }

      // 각 색상 변형에 최소 1개 이상의 이미지가 필요
      for (const variant of validColorVariants) {
        if (variant.images.length === 0) {
          throw new Error(`"${variant.name}" 색상에 최소 1개 이상의 이미지가 필요합니다.`)
        }
      }

      const payload = {
        name: newProduct.name.trim(),
        description: newProduct.description.trim(),
        price: Number(newProduct.price),
        releaseDate: newProduct.releaseDate,
        categories: newProduct.categories
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean),
        sizes: newProduct.sizes.map(Number), // 숫자 배열로 전송 (백엔드에서 문자열로 변환)
        materials: newProduct.materials,
        colorVariants: validColorVariants,
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || '상품 등록에 실패했습니다.')
      }

      // 응답: 직접 객체 반환 { id, name, description, ... }
      setProducts((prev) => {
        const next = [...prev, data]
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

      const response = await fetch(`${API_BASE_URL}/api/admin/sales?${params.toString()}`, {
        credentials: 'include',
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || '판매 현황을 불러오지 못했습니다.')
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

  // 권한 확인 중이면 로딩 표시
  if (checkingAuth) {
    return (
      <div className="admin-page">
        <p>권한을 확인하는 중...</p>
      </div>
    )
  }

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
            설명 *
            <textarea
              value={newProduct.description}
              onChange={(event) => handleNewProductChange('description', event.target.value)}
              rows={3}
              required
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
          
          <div className="admin-form-group">
            <div className="admin-form-group__header">
              <p className="admin-form-group__label">색상 변형 *</p>
              <button type="button" className="admin-button admin-button--small" onClick={addColorVariant}>
                + 색상 추가
              </button>
            </div>
            {newProduct.colorVariants.map((variant, variantIndex) => (
              <div key={variantIndex} className="color-variant-group">
                <div className="color-variant-header">
                  <label className="color-variant-name">
                    색상명 *
                    <input
                      type="text"
                      placeholder="예: 내추럴 블랙"
                      value={variant.name}
                      onChange={(event) => updateColorVariant(variantIndex, 'name', event.target.value)}
                      required
                    />
                  </label>
                  {newProduct.colorVariants.length > 1 && (
                    <button
                      type="button"
                      className="admin-button admin-button--small admin-button--danger"
                      onClick={() => removeColorVariant(variantIndex)}
                    >
                      삭제
                    </button>
                  )}
                </div>
                
                <label className="color-variant-thumbnail">
                  썸네일 URL
                  <input
                    type="url"
                    placeholder="썸네일 이미지 URL (선택사항)"
                    value={variant.thumbnail}
                    onChange={(event) => updateColorVariant(variantIndex, 'thumbnail', event.target.value)}
                  />
                </label>

                <div className="color-variant-images">
                  <div className="color-variant-images-header">
                    <p className="admin-form-group__label">이미지 URL *</p>
                    <button
                      type="button"
                      className="admin-button admin-button--small"
                      onClick={() => addImageToVariant(variantIndex)}
                    >
                      + 이미지 추가
                    </button>
                  </div>
                  {variant.images.map((image, imageIndex) => (
                    <div key={imageIndex} className="image-input-row">
                      <input
                        type="url"
                        placeholder={`이미지 URL ${imageIndex + 1}`}
                        value={image}
                        onChange={(event) => updateImageInVariant(variantIndex, imageIndex, event.target.value)}
                        required
                      />
                      {variant.images.length > 1 && (
                        <button
                          type="button"
                          className="admin-button admin-button--small admin-button--danger"
                          onClick={() => removeImageFromVariant(variantIndex, imageIndex)}
                        >
                          삭제
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
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

