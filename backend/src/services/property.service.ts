import type { Property } from '../types/property.types.js'

export interface FilterInput {
  dealType?: 'rent' | 'sale'
  district?: string
  businessArea?: string
  priceRange?: { min?: number; max?: number }
  rooms?: number[]
  areaRange?: { min?: number; max?: number }
  orientation?: string
  rentType?: '整租' | '合租'
  maxMetroDistance?: number
  keyword?: string
  facilities?: string[]
}

const matchKeyword = (p: Property, keyword: string): boolean => {
  const kw = keyword.trim().toLowerCase()
  if (!kw) return true
  const haystack = [p.title, p.community, p.district, p.businessArea, p.address, p.metroLine, p.metroStation, p.layout, p.description]
    .join(' ')
    .toLowerCase()
  // 关键词按空格拆分，全部命中才算匹配
  return kw.split(/\s+/).every((token) => haystack.includes(token))
}

export function filterProperties(list: Property[], filters: FilterInput): Property[] {
  return list.filter((p) => {
    if (filters.dealType && p.dealType !== filters.dealType) return false
    if (filters.district && p.district !== filters.district) return false
    if (filters.businessArea && p.businessArea !== filters.businessArea) return false
    if (filters.rentType && p.rentType !== filters.rentType) return false
    if (filters.orientation && !p.orientation.includes(filters.orientation)) return false
    if (filters.maxMetroDistance && p.metroDistance > filters.maxMetroDistance) return false
    if (filters.rooms && filters.rooms.length > 0) {
      const bucket = filters.rooms.includes(4) ? (r: number) => r >= 4 : null
      const hit = filters.rooms.some((r) => (r >= 4 && bucket ? p.rooms >= 4 : p.rooms === r))
      if (!hit) return false
    }
    if (filters.priceRange) {
      const { min, max } = filters.priceRange
      if (typeof min === 'number' && p.price < min) return false
      if (typeof max === 'number' && p.price > max) return false
    }
    if (filters.areaRange) {
      const { min, max } = filters.areaRange
      if (typeof min === 'number' && p.area < min) return false
      if (typeof max === 'number' && p.area > max) return false
    }
    if (filters.facilities && filters.facilities.length > 0) {
      if (!filters.facilities.every((f) => p.facilities.includes(f) || p.tags.includes(f))) return false
    }
    if (filters.keyword && !matchKeyword(p, filters.keyword)) return false
    return true
  })
}

export function sortProperties(list: Property[], sort: string): Property[] {
  const arr = [...list]
  switch (sort) {
    case 'priceAsc':
      return arr.sort((a, b) => a.price - b.price)
    case 'priceDesc':
      return arr.sort((a, b) => b.price - a.price)
    case 'newest':
      return arr.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime())
    case 'areaDesc':
      return arr.sort((a, b) => b.area - a.area)
    default:
      // 默认：推荐分 + 新鲜度加权
      return arr.sort((a, b) => {
        const scoreA = a.score + (a.tags.includes('实勘') ? 12 : 0) + (a.metroDistance < 500 ? 8 : 0)
        const scoreB = b.score + (b.tags.includes('实勘') ? 12 : 0) + (b.metroDistance < 500 ? 8 : 0)
        return scoreB - scoreA
      })
  }
}

export function paginate<T>(list: T[], page: number, limit: number) {
  const total = list.length
  const start = (page - 1) * limit
  return {
    items: list.slice(start, start + limit),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: start + limit < total,
    },
  }
}

/** 列表页仅返回轻量字段，减少小程序数据传输 */
export function toListItem(p: Property) {
  return {
    id: p.id,
    title: p.title,
    dealType: p.dealType,
    district: p.district,
    businessArea: p.businessArea,
    community: p.community,
    price: p.price,
    unitPrice: p.unitPrice,
    layout: p.layout,
    area: p.area,
    floor: p.floor,
    totalFloors: p.totalFloors,
    orientation: p.orientation,
    decoration: p.decoration,
    rentType: p.rentType,
    metroLine: p.metroLine,
    metroStation: p.metroStation,
    metroDistance: p.metroDistance,
    tags: p.tags.slice(0, 3),
    imageSeed: getImageSeed(p),
    publishDate: p.publishDate,
  }
}

/** 按小区名生成稳定的图片风格种子，前端据此渲染占位图 */
export function getImageSeed(p: Property): number {
  let hash = 0
  for (let i = 0; i < p.community.length; i++) {
    hash = (hash * 31 + p.community.charCodeAt(i)) % 997
  }
  return hash
}
