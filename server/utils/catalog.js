const MONTH_IN_MS = 1000 * 60 * 60 * 24 * 30

const normalizeDate = (value) => (value ? new Date(value) : null)

const isWithinLastMonth = (releaseDate, now) => {
  if (!releaseDate) return false
  const releasedAt = normalizeDate(releaseDate)
  if (Number.isNaN(releasedAt?.getTime())) return false
  return now - releasedAt <= MONTH_IN_MS
}

const isWithinSalePeriod = (saleStart, saleEnd, now) => {
  const start = normalizeDate(saleStart)
  const end = normalizeDate(saleEnd)
  if (!start || !end) return false
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return false
  return now >= start && now <= end
}

export const attachAutoCategories = (products, now = new Date()) =>
  products.map((product) => {
    const computed = new Set(product.categories)

    if (isWithinLastMonth(product.releaseDate, now)) {
      computed.add('신제품')
    }

    if (isWithinSalePeriod(product.saleStart, product.saleEnd, now)) {
      computed.add('세일')
    }

    return {
      ...product,
      computedCategories: Array.from(computed),
    }
  })

const normalizeNumberArray = (values = []) =>
  values
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value))

export const filterProducts = (products, { categories = [], sizes = [], materials = [] } = {}) => {
  const normalizedSizes = normalizeNumberArray(sizes)
  const normalizedMaterials = materials.map((value) => String(value).toLowerCase())

  return products.filter((product) => {
    if (product.gender !== '남성') {
      return false
    }

    if (categories.length && !categories.every((filter) => product.computedCategories.includes(filter))) {
      return false
    }

    if (normalizedSizes.length && !product.sizes?.some((size) => normalizedSizes.includes(Number(size)))) {
      return false
    }

    if (
      normalizedMaterials.length &&
      !product.materials?.some((material) => normalizedMaterials.includes(String(material).toLowerCase()))
    ) {
      return false
    }

    return true
  })
}

const toDateValue = (value) => {
  const date = value ? new Date(value) : null
  const timestamp = date?.getTime()
  return Number.isFinite(timestamp) ? timestamp : 0
}

export const sortProducts = (products, sortKey = 'recommended') => {
  const cloned = [...products]

  switch (sortKey) {
    case 'sales':
      return cloned.sort((a, b) => (b.salesVolume ?? 0) - (a.salesVolume ?? 0))
    case 'priceLow':
      return cloned.sort((a, b) => (a.price ?? 0) - (b.price ?? 0))
    case 'priceHigh':
      return cloned.sort((a, b) => (b.price ?? 0) - (a.price ?? 0))
    case 'newest':
      return cloned.sort((a, b) => toDateValue(b.releaseDate) - toDateValue(a.releaseDate))
    case 'recommended':
    default:
      return cloned.sort((a, b) => {
        const diff = (b.recommendationScore ?? 0) - (a.recommendationScore ?? 0)
        if (diff !== 0) {
          return diff
        }
        return toDateValue(b.releaseDate) - toDateValue(a.releaseDate)
      })
  }
}
