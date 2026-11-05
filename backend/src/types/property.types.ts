export type DealType = 'rent' | 'sale'

export interface Agent {
  name: string
  company: string
  phone: string
  rating: number
  dealCount: number
  years: number
  avatarText: string
}

export interface Property {
  id: string
  title: string
  dealType: DealType
  district: string
  businessArea: string
  community: string
  address: string
  price: number // 租: 元/月；售: 万元
  unitPrice?: number // 元/㎡
  layout: string
  rooms: number
  halls: number
  area: number
  floor: number
  totalFloors: number
  orientation: string
  decoration: string
  elevator: boolean
  rentType?: '整租' | '合租'
  metroLine: string
  metroStation: string
  metroDistance: number
  tags: string[]
  facilities: string[]
  images: string[]
  description: string
  publishDate: string
  viewCount: number
  coordinates: { lat: number; lng: number }
  agent: Agent
  score: number // 推荐权重
}

export interface DistrictStat {
  name: string
  avgSalePrice: number
  avgRent: number
  saleCount: number
  rentCount: number
  trend: number[]
  changeRate: number
}
