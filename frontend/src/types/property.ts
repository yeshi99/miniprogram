export type DealType = 'rent' | 'sale'

export interface PropertyListItem {
  id: string
  title: string
  dealType: DealType
  district: string
  businessArea: string
  community: string
  price: number
  unitPrice?: number
  layout: string
  area: number
  floor: number
  totalFloors: number
  orientation: string
  decoration: string
  rentType?: '整租' | '合租'
  metroLine: string
  metroStation: string
  metroDistance: number
  tags: string[]
  imageSeed: number
  publishDate: string
  favoriteAt?: string
  viewedAt?: string
}

export interface Agent {
  name: string
  company: string
  phone: string
  rating: number
  dealCount: number
  years: number
  avatarText: string
}

export interface GalleryItem {
  seed: number
  type: string
}

export interface PropertyDetail extends PropertyListItem {
  address: string
  rooms: number
  halls: number
  elevator: boolean
  facilities: string[]
  description: string
  viewCount: number
  coordinates: { lat: number; lng: number }
  agent: Agent
  gallery: GalleryItem[]
  communityCompare: {
    salePrice: number | null
    rentPrice: number | null
    communitySaleTotal: number | null
  }
  serviceFee: number
  deposit: number
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasMore: boolean
}

export interface ListResponse {
  list: PropertyListItem[]
  pagination: Pagination
}

export interface DistrictStat {
  name: string
  avgSalePrice: number
  avgRent: number
  saleCount: number
  rentCount: number
  trend: number[]
  changeRate: number
  rank: number
}

export interface MarketOverview {
  city: string
  avgSalePrice: number
  avgRent: number
  saleCount: number
  rentCount: number
  cityTrend: number[]
  cityChangeRate: number
  districts: DistrictStat[]
  updatedAt: string
}

export interface DistrictDetail extends DistrictStat {
  businessAreas: string[]
  metroLines: string[]
  rentToSaleRatio: number
  yieldRate: number
}

export interface MortgageResult {
  totalPrice: number
  downPayment: number
  loanAmount: number
  months: number
  equalInstallment: {
    monthly: number
    totalInterest: number
    totalPayment: number
    breakdown: { commercial: number; fund: number }
  }
  equalPrincipal: {
    firstMonth: number
    lastMonth: number
    monthlyDecrease: number
    totalInterest: number
    totalPayment: number
  }
  loanSplit: {
    commercial: number
    fund: number
    rates: { commercial: number; fund: number }
  }
}

export interface SearchSuggestion {
  type: 'community' | 'business' | 'metro' | 'district'
  name: string
  desc: string
}

export interface UserOverview {
  nickname: string
  avatarText: string
  city: string
  favoriteCount: number
  listingCount: number
  historyCount: number
  demandCount: number
  memberLevel: string
}

export interface MyListing extends PropertyListItem {
  description: string
  status: 'online' | 'offline'
}

export interface ApiResponse<T> {
  success: boolean
  data: T
}
