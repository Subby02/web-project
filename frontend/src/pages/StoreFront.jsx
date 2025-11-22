import { useEffect, useMemo, useRef, useState } from 'react'
import './StoreFront.css'

const HIGHLIGHT_FILTERS = ['신제품', '라이프스타일', '세일', '슬립온']
const SIZE_OPTIONS = [260, 265, 270, 275, 280, 285, 290, 295, 300, 305, 310]
const MATERIAL_OPTIONS = [
  { value: 'tree', label: '가볍고 시원한 tree' },
  { value: 'wool', label: '부드럽고 따뜻한 wool' },
]
const SORT_OPTIONS = [
  { value: 'recommended', label: '추천순' },
  { value: 'sales', label: '판매순' },
  { value: 'priceLow', label: '가격 낮은 순' },
  { value: 'priceHigh', label: '가격 높은 순' },
  { value: 'newest', label: '최신 등록 순' },
]

const currency = (value) =>
  value.toLocaleString('ko-KR', { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 })

const buildEndpoint = (path, params = {}) => {
  const search = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return
    if (Array.isArray(value)) {
      if (!value.length) return
      value.forEach((entry) => search.append(key, entry))
    } else if (value !== '') {
      search.append(key, value)
    }
  })

  const query = search.toString()
  return query ? `${path}?${query}` : path
}

const toggleFilter = (currentFilters, target) =>
  currentFilters.includes(target) ? currentFilters.filter((filter) => filter !== target) : [...currentFilters, target]

const findMaterialLabel = (value) => MATERIAL_OPTIONS.find((option) => option.value === value)?.label ?? value

const discountPercent = (product) => Math.round((product.discountRate ?? 0) * 100)

const discountedPrice = (product) => {
  if (!product.discountRate) return product.price
  return Math.round(product.price * (1 - product.discountRate))
}

function StoreFront() {
  const [selectedHighlights, setSelectedHighlights] = useState([])
  const [selectedSizes, setSelectedSizes] = useState([])
  const [selectedMaterials, setSelectedMaterials] = useState([])
  const [selectedSort, setSelectedSort] = useState('recommended')
  const [sortMenuOpen, setSortMenuOpen] = useState(false)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const sortMenuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!sortMenuRef.current || !sortMenuOpen) return
      if (!sortMenuRef.current.contains(event.target)) {
        setSortMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [sortMenuOpen])

  useEffect(() => {
    const controller = new AbortController()
    const fetchProducts = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(
          buildEndpoint('/api/products', {
            filters: selectedHighlights,
            sizes: selectedSizes,
            materials: selectedMaterials,
            sort: selectedSort,
          }),
          {
            signal: controller.signal,
          },
        )

        if (!response.ok) {
          throw new Error('상품 데이터를 가져오지 못했습니다.')
        }

        const data = await response.json()
        setProducts(data.items ?? [])
      } catch (fetchError) {
        if (fetchError.name === 'AbortError') {
          return
        }
        console.error(fetchError)
        setError('상품을 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.')
        setProducts([])
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    fetchProducts()
    return () => controller.abort()
  }, [selectedHighlights, selectedSizes, selectedMaterials, selectedSort])

  const subtitle = useMemo(() => {
    if (!selectedHighlights.length) return '라이프스타일, 캐주얼 등 다양한 카테고리를 만나보세요.'
    return `${selectedHighlights.join(', ')} 컬렉션`
  }, [selectedHighlights])

  const appliedFilters = useMemo(
    () => [
      ...selectedHighlights.map((value) => ({ type: 'highlight', label: value, value })),
      ...selectedSizes.map((value) => ({ type: 'size', label: `${value}`, value })),
      ...selectedMaterials.map((value) => ({ type: 'material', label: findMaterialLabel(value), value })),
    ],
    [selectedHighlights, selectedSizes, selectedMaterials],
  )

  const handleRemoveFilter = (filter) => {
    if (filter.type === 'highlight') {
      setSelectedHighlights((current) => current.filter((value) => value !== filter.value))
    } else if (filter.type === 'size') {
      setSelectedSizes((current) => current.filter((value) => value !== filter.value))
    } else if (filter.type === 'material') {
      setSelectedMaterials((current) => current.filter((value) => value !== filter.value))
    }
  }

  const resetFilters = () => {
    setSelectedHighlights([])
    setSelectedSizes([])
    setSelectedMaterials([])
    setSelectedSort('recommended')
  }

  const productCountLabel = useMemo(() => {
    if (loading) return '상품을 불러오는 중...'
    return `${products.length}개 제품`
  }, [loading, products.length])

  const currentSortLabel = useMemo(
    () => SORT_OPTIONS.find((option) => option.value === selectedSort)?.label ?? '추천순',
    [selectedSort],
  )

  return (
    <div className="storefront">
      <header className="page-header">
        <nav className="breadcrumb">
          <span className="breadcrumb__home" aria-label="홈">
            <span role="img" aria-hidden="true">
              🏠
            </span>{' '}
            Home
          </span>
          <span className="breadcrumb__arrow">›</span>
          <span>남성 전체 제품</span>
        </nav>

        <div className="gender-toggle" role="tablist" aria-label="성별">
          <button className="gender-toggle__button is-active" type="button" role="tab" aria-selected="true">
            남성
          </button>
          <button className="gender-toggle__button" type="button" role="tab" aria-selected="false" disabled>
            여성
          </button>
        </div>

        <div className="hero">
          <h1>남성 라이프스타일 신발</h1>
          <p className="hero__description">
            당신의 하루를 함께하는 라이프스타일 신발 컬렉션. 편안한 착화감과 세련된 디자인으로 언제 어디에서나 활용할 수
            있습니다.
          </p>
          <p className="hero__selection">{subtitle}</p>
        </div>

        <div className="chip-row" role="tablist" aria-label="하이라이트 카테고리">
          {HIGHLIGHT_FILTERS.map((category) => (
            <button
              key={category}
              className={`chip ${selectedHighlights.includes(category) ? 'is-selected' : ''}`}
              onClick={() => setSelectedHighlights((current) => toggleFilter(current, category))}
              type="button"
              role="tab"
              aria-selected={selectedHighlights.includes(category)}
            >
              <span>{category}</span>
            </button>
          ))}
        </div>
      </header>

      <div className="filters-layout">
        <aside className="filters-panel">
          <p className="filters-applied__title">적용된 필터</p>
          <div className="applied-filter-tags applied-filter-tags--stacked">
            {appliedFilters.length === 0 && <span className="applied-filter-tags__empty">필터가 없습니다.</span>}
            {appliedFilters.map((filter) => (
              <button
                key={`${filter.type}-${filter.value}`}
                className="applied-filter-tags__chip"
                type="button"
                onClick={() => handleRemoveFilter(filter)}
              >
                {filter.label} <span aria-hidden="true">×</span>
              </button>
            ))}
          </div>
          <button className="filters-reset-link" type="button" onClick={resetFilters} disabled={!appliedFilters.length}>
            초기화
          </button>

          <div className="filter-section">
            <p className="filter-section__title">사이즈</p>
            <div className="size-grid size-grid--full">
              {SIZE_OPTIONS.map((size) => (
                <button
                  key={size}
                  type="button"
                  className={`size-grid__button ${selectedSizes.includes(String(size)) ? 'is-selected' : ''}`}
                  onClick={() => setSelectedSizes((current) => toggleFilter(current, String(size)))}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <p className="filter-section__title">소재</p>
            <div className="material-list material-list--solid">
              {MATERIAL_OPTIONS.map((option) => (
                <label key={option.value} className="material-list__item material-list__item--solid">
                  <input
                    type="checkbox"
                    checked={selectedMaterials.includes(option.value)}
                    onChange={() => setSelectedMaterials((current) => toggleFilter(current, option.value))}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        <section className="product-section" aria-live="polite">
          <div className="product-toolbar">
            <span className="product-toolbar__count">{productCountLabel}</span>
            <div className={`sort-menu ${sortMenuOpen ? 'is-open' : ''}`} ref={sortMenuRef}>
              <button
                type="button"
                className="sort-menu__trigger"
                onClick={() => setSortMenuOpen((open) => !open)}
                aria-expanded={sortMenuOpen}
              >
                <span>{currentSortLabel}</span>
                <span className="sort-menu__icon" aria-hidden="true">
                  ☰
                </span>
              </button>
              {sortMenuOpen && (
                <div className="sort-menu__dropdown" role="menu">
                  {SORT_OPTIONS.map((option) => (
                    <label key={option.value} className="sort-menu__option">
                      <input
                        type="radio"
                        name="product-sort"
                        value={option.value}
                        checked={selectedSort === option.value}
                        onChange={() => {
                          setSelectedSort(option.value)
                          setSortMenuOpen(false)
                        }}
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {loading && <p className="loading-state">상품 정보를 불러오고 있습니다...</p>}

          {error && !loading && <p className="error-state">{error}</p>}

          {!loading && !error && products.length === 0 && (
            <p className="empty-state">조건에 맞는 제품이 없습니다. 다른 필터를 선택해 보세요.</p>
          )}

          {!loading && !error && (
            <div className="product-grid">
              {products.map((product) => {
                const percent = discountPercent(product)
                return (
                  <article key={product.id} className="product-card product-card--minimal">
                    <div className="product-card__image product-card__image--minimal">
                      {product.image ? <img src={product.image} alt={product.name} loading="lazy" /> : null}
                      {percent > 0 && <span className="product-card__discount-chip">~ {percent}%</span>}
                    </div>

                    <div className="product-card__body product-card__body--minimal">
                      <div className="product-card__thumbnails">
                        {[...Array(5)].map((_, index) => (
                          <span key={index} className="product-card__thumbnail" aria-hidden="true" />
                        ))}
                      </div>
                      <h3>{product.name}</h3>
                      <p>{product.description}</p>
                      <div className="product-card__price-row">
                        {percent > 0 ? (
                          <>
                            <span className="product-card__price-rate">{percent}%</span>
                            <span className="product-card__price-final">{currency(discountedPrice(product))}</span>
                            <span className="product-card__price-original">{currency(product.price)}</span>
                          </>
                        ) : (
                          <span className="product-card__price-final">{currency(product.price)}</span>
                        )}
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default StoreFront

