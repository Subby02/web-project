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

const CATEGORY_OPTIONS = ['슬립온', '라이프스타일']

const emptyProduct = {
  name: '',
  description: '',
  price: '',
  releaseDate: '',
  categories: [],
  colorVariants: [{ name: '', images: [], thumbnail: '', imageFiles: [] }],
  sizes: [],
  materials: [],
  discountRate: '',
  saleStart: '',
  saleEnd: '',
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

  const toggleNewProductCategory = (category) => {
    setNewProduct((prev) => {
      const next = new Set(prev.categories)
      if (next.has(category)) next.delete(category)
      else next.add(category)
      return { ...prev, categories: Array.from(next) }
    })
  }

  const addColorVariant = () => {
    setNewProduct((prev) => ({
      ...prev,
      colorVariants: [...prev.colorVariants, { name: '', images: [], thumbnail: '', imageFiles: [] }],
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
      return { ...prev, colorVariants: updated }
    })
  }

  const handleImageUpload = async (variantIndex, imageIndex, file) => {
    if (!file) return

    // 파일 크기 검증 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      window.alert('파일 크기는 5MB 이하여야 합니다.')
      return
    }

    // 파일 타입 검증
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/avif']
    if (!allowedTypes.includes(file.type)) {
      window.alert('이미지 파일만 업로드 가능합니다. (jpeg, jpg, png, gif, webp, avif)')
      return
    }

    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch(`${API_BASE_URL}/api/admin/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || '이미지 업로드에 실패했습니다.')
      }

      const data = await response.json()
      const imageUrl = `${API_BASE_URL}${data.url}`

      // 이미지 URL을 상태에 추가
      setNewProduct((prev) => {
        const updated = [...prev.colorVariants]
        const currentImages = [...(updated[variantIndex].images || [])]
        
        // 이미지 배열 크기 조정
        while (currentImages.length <= imageIndex) {
          currentImages.push('')
        }
        currentImages[imageIndex] = imageUrl

        updated[variantIndex] = {
          ...updated[variantIndex],
          images: currentImages,
        }

        // 첫 번째 이미지가 추가되고 thumbnail이 비어있으면 자동 설정
        if (imageIndex === 0 && !updated[variantIndex].thumbnail) {
          updated[variantIndex].thumbnail = imageUrl
        }

        return { ...prev, colorVariants: updated }
      })
    } catch (err) {
      window.alert(err.message || '이미지 업로드 중 오류가 발생했습니다.')
    }
  }

  const addImageToVariant = (variantIndex) => {
    setNewProduct((prev) => {
      const updated = [...prev.colorVariants]
      const currentImages = updated[variantIndex].images || []
      updated[variantIndex] = {
        ...updated[variantIndex],
        images: [...currentImages, ''],
      }
      return { ...prev, colorVariants: updated }
    })
  }

  const removeImageFromVariant = (variantIndex, imageIndex) => {
    setNewProduct((prev) => {
      const updated = [...prev.colorVariants]
      const newImages = updated[variantIndex].images.filter((_, i) => i !== imageIndex)
      
      // 첫 번째 이미지가 삭제되면 다음 이미지를 썸네일로 설정
      let newThumbnail = updated[variantIndex].thumbnail
      if (imageIndex === 0 && newImages.length > 0) {
        newThumbnail = newImages[0]
      } else if (newImages.length === 0) {
        newThumbnail = ''
      }
      
      updated[variantIndex] = {
        ...updated[variantIndex],
        images: newImages,
        thumbnail: newThumbnail,
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
        categories: newProduct.categories || [],
        sizes: newProduct.sizes.map(Number), // 숫자 배열로 전송 (백엔드에서 문자열로 변환)
        materials: newProduct.materials,
        colorVariants: validColorVariants,
        discountRate: newProduct.discountRate ? Number(newProduct.discountRate) : 0,
        saleStart: newProduct.saleStart || undefined,
        saleEnd: newProduct.saleEnd || undefined,
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
          <div className="admin-form-group">
            <p className="admin-form-group__label">카테고리</p>
            <div className="material-list material-list--horizontal">
              {CATEGORY_OPTIONS.map((category) => (
                <label key={category} className="material-list__item">
            <input
                    type="checkbox"
                    checked={newProduct.categories.includes(category)}
                    onChange={() => toggleNewProductCategory(category)}
            />
                  <span>{category}</span>
          </label>
              ))}
            </div>
          </div>
          
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

                <div className="color-variant-images">
                  <div className="color-variant-images-header">
                    <p className="admin-form-group__label">이미지 업로드 *</p>
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
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                      <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/avif"
                          onChange={(event) => {
                            const file = event.target.files?.[0]
                            if (file) {
                              handleImageUpload(variantIndex, imageIndex, file)
                            }
                          }}
                          required={imageIndex === 0}
                          style={{ flex: 1 }}
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
                      {image && (
                        <div className="image-preview">
                          <img src={image} alt={`미리보기 ${imageIndex + 1}`} />
                          {imageIndex === 0 && (
                            <span className="thumbnail-badge">썸네일</span>
                          )}
                        </div>
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
          
          <div className="admin-form-group">
            <p className="admin-form-group__label">할인 정책 (선택사항)</p>
            <div className="discount-form">
              <label>
                할인율(%)
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={newProduct.discountRate}
                  onChange={(event) => handleNewProductChange('discountRate', event.target.value)}
                  placeholder="0"
                />
              </label>
              <label>
                세일 시작일
                <input
                  type="date"
                  value={newProduct.saleStart}
                  onChange={(event) => handleNewProductChange('saleStart', event.target.value)}
                />
              </label>
              <label>
                세일 종료일
                <input
                  type="date"
                  value={newProduct.saleEnd}
                  onChange={(event) => handleNewProductChange('saleEnd', event.target.value)}
                />
              </label>
            </div>
            {newProduct.price && newProduct.discountRate && Number(newProduct.discountRate) > 0 && (
              <div className="discount-preview" style={{ marginTop: '12px', padding: '12px', backgroundColor: '#f0f9ff', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '0.9rem', color: '#6b7280' }}>할인 적용 가격</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontSize: '0.9rem', color: '#6b7280', textDecoration: 'line-through' }}>
                    {currency(Number(newProduct.price))}
                  </span>
                  <span style={{ fontSize: '1.25rem', fontWeight: '600', color: '#dc2626' }}>
                    {currency(Math.round(Number(newProduct.price) * (1 - Number(newProduct.discountRate) / 100)))}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: '#dc2626', fontWeight: '600' }}>
                    ({newProduct.discountRate}% 할인)
                  </span>
                </div>
              </div>
            )}
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

