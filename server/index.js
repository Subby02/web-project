import express from 'express'
import cors from 'cors'
import { randomUUID } from 'node:crypto'

import {
  CATEGORY_FILTERS,
  MATERIAL_OPTIONS,
  PRODUCTS,
  SALES_RECORDS,
  SIZE_OPTIONS,
} from './data/products.js'
import { attachAutoCategories, filterProducts, sortProducts } from './utils/catalog.js'

const PORT = Number(process.env.PORT || 5174)
const SORT_KEYS = ['recommended', 'sales', 'priceLow', 'priceHigh', 'newest']

const app = express()

app.use(cors())
app.use(express.json())

const productsStore = PRODUCTS.map((product) => ({ ...product }))
const salesRecords = [...SALES_RECORDS]

const catalogWithComputed = () => attachAutoCategories(productsStore)

const toArray = (value) => {
  if (Array.isArray(value)) return value
  if (typeof value === 'string' && value.length > 0) return [value]
  return []
}

const findProductIndex = (productId) => productsStore.findIndex((product) => product.id === productId)

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.get('/api/products', (req, res) => {
  const filterQuery = toArray(req.query.filters)
  const sizeQuery = toArray(req.query.sizes)
  const materialQuery = toArray(req.query.materials)
  const sortKey = SORT_KEYS.includes(req.query.sort) ? req.query.sort : 'recommended'

  const categoryFilters = filterQuery.filter((value) => CATEGORY_FILTERS.includes(value))
  const sizeFilters = sizeQuery.filter((value) => SIZE_OPTIONS.includes(Number(value)))
  const allowedMaterialValues = MATERIAL_OPTIONS.map((option) => option.value)
  const materialFilters = materialQuery.filter((value) => allowedMaterialValues.includes(value))

  const list = filterProducts(catalogWithComputed(), {
    categories: categoryFilters,
    sizes: sizeFilters,
    materials: materialFilters,
  })
  const sorted = sortProducts(list, sortKey)
  res.json({ items: sorted })
})

// --- Admin APIs ---

app.get('/api/admin/products', (_req, res) => {
  res.json({ items: productsStore })
})

app.patch('/api/admin/products/:id/sizes', (req, res) => {
  const index = findProductIndex(req.params.id)
  if (index === -1) {
    res.status(404).json({ error: 'Product not found' })
    return
  }

  const sizes = Array.isArray(req.body.sizes) ? req.body.sizes.map((value) => Number(value)) : []
  const validSizes = sizes.filter((size) => SIZE_OPTIONS.includes(size))

  if (!validSizes.length) {
    res.status(400).json({ error: '빈 배열이 아닌 유효한 사이즈를 제공해야 합니다.' })
    return
  }

  productsStore[index] = {
    ...productsStore[index],
    sizes: Array.from(new Set(validSizes)).sort((a, b) => a - b),
  }

  res.json({ item: productsStore[index] })
})

app.patch('/api/admin/products/:id/discount', (req, res) => {
  const index = findProductIndex(req.params.id)
  if (index === -1) {
    res.status(404).json({ error: 'Product not found' })
    return
  }

  const discountRate = Number(req.body.discountRate)
  if (Number.isNaN(discountRate) || discountRate < 0 || discountRate > 100) {
    res.status(400).json({ error: '할인율은 0~100 사이의 숫자여야 합니다.' })
    return
  }

  const saleStart = req.body.saleStart ?? null
  const saleEnd = req.body.saleEnd ?? null

  if ((saleStart && !saleEnd) || (!saleStart && saleEnd)) {
    res.status(400).json({ error: '세일 시작일과 종료일을 모두 입력하거나 비워두세요.' })
    return
  }

  if (saleStart && saleEnd && new Date(saleStart) > new Date(saleEnd)) {
    res.status(400).json({ error: '세일 시작일은 종료일보다 이전이어야 합니다.' })
    return
  }

  productsStore[index] = {
    ...productsStore[index],
    discountRate: discountRate / 100,
    saleStart,
    saleEnd,
  }

  res.json({ item: productsStore[index] })
})

app.post('/api/admin/products', (req, res) => {
  const {
    name,
    description,
    price,
    releaseDate,
    categories,
    sizes,
    materials,
    image,
  } = req.body ?? {}

  if (!name || !price || !releaseDate || !image) {
    res.status(400).json({ error: '이름, 가격, 출시일, 이미지 URL은 필수입니다.' })
    return
  }

  const parsedPrice = Number(price)
  if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
    res.status(400).json({ error: '가격은 0보다 큰 숫자여야 합니다.' })
    return
  }

  const parsedSizes = (Array.isArray(sizes) ? sizes : [])
    .map((value) => Number(value))
    .filter((size) => SIZE_OPTIONS.includes(size))
  const parsedMaterials = (Array.isArray(materials) ? materials : []).filter((value) =>
    MATERIAL_OPTIONS.some((option) => option.value === value),
  )
  const parsedCategories = Array.isArray(categories) ? categories : []

  if (!parsedSizes.length) {
    res.status(400).json({ error: '가용 사이즈를 한 개 이상 선택하세요.' })
    return
  }
  if (!parsedMaterials.length) {
    res.status(400).json({ error: '소재를 한 개 이상 선택하세요.' })
    return
  }

  const newProduct = {
    id: randomUUID(),
    gender: '남성',
    name,
    description: description ?? '',
    price: parsedPrice,
    releaseDate,
    saleStart: null,
    saleEnd: null,
    categories: parsedCategories.length ? parsedCategories : ['신발', '라이프스타일'],
    sizes: parsedSizes.sort((a, b) => a - b),
    materials: parsedMaterials,
    discountRate: 0,
    recommendationScore: 0,
    salesVolume: 0,
    image,
  }

  productsStore.push(newProduct)

  res.status(201).json({ item: newProduct })
})

app.get('/api/admin/sales', (req, res) => {
  const start = req.query.start ? new Date(req.query.start) : null
  const end = req.query.end ? new Date(req.query.end) : null

  if (!start || !end || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    res.status(400).json({ error: '시작일과 종료일을 모두 YYYY-MM-DD 형식으로 제공해야 합니다.' })
    return
  }

  if (start > end) {
    res.status(400).json({ error: '시작일은 종료일보다 이전이어야 합니다.' })
    return
  }

  const productMap = new Map(productsStore.map((product) => [product.id, product]))
  const summary = {}

  salesRecords.forEach((record) => {
    const recordDate = new Date(record.date)
    if (recordDate < start || recordDate > end) {
      return
    }
    const product = productMap.get(record.productId)
    if (!product) {
      return
    }

    const discountRate = product.discountRate ?? 0
    const effectivePrice = product.price * (1 - discountRate)
    const revenue = record.units * effectivePrice

    if (!summary[record.productId]) {
      summary[record.productId] = {
        productId: record.productId,
        name: product.name,
        units: 0,
        revenue: 0,
      }
    }

    summary[record.productId].units += record.units
    summary[record.productId].revenue += revenue
  })

  const items = Object.values(summary).sort((a, b) => b.units - a.units)
  const totals = items.reduce(
    (acc, item) => {
      acc.units += item.units
      acc.revenue += item.revenue
      return acc
    },
    { units: 0, revenue: 0 },
  )

  res.json({
    range: { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) },
    items,
    totals,
  })
})

app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', path: req.path })
})

app.listen(PORT, () => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`API server listening on http://localhost:${PORT}`)
  }
})
