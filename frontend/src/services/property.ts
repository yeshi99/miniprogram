import { apiClient } from './api-client'
import type {
  ApiResponse,
  DealType,
  DistrictDetail,
  DistrictStat,
  ListResponse,
  MarketOverview,
  MortgageResult,
  MyListing,
  PayConfirmResult,
  PayPackage,
  PayStatus,
  PropertyDetail,
  SearchSuggestion,
  UserOverview,
} from '@/types/property'

const unwrap = <T>(res: ApiResponse<T>): T => res.data

/** 列表筛选条件 */
export interface PropertyFilters {
  dealType?: DealType
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
  sort?: 'default' | 'priceAsc' | 'priceDesc' | 'newest' | 'areaDesc'
}

export async function fetchPropertyList(params: PropertyFilters & { page?: number; limit?: number }) {
  const res = await apiClient.post<ApiResponse<ListResponse>>('/api/properties/list', {
    page: 1,
    limit: 10,
    sort: 'default',
    ...params,
  })
  return unwrap(res)
}

export async function fetchRecommend(params: { dealType: DealType; district?: string; limit?: number; onlyNewest?: boolean }) {
  const res = await apiClient.post<ApiResponse<{ list: ListResponse['list']; total: number }>>(
    '/api/properties/recommend',
    { limit: 6, onlyNewest: false, ...params }
  )
  return unwrap(res)
}

export async function fetchPropertyDetail(id: string) {
  const res = await apiClient.get<ApiResponse<PropertyDetail>>(`/api/properties/${id}`)
  return unwrap(res)
}

export async function fetchSimilar(id: string, limit = 4) {
  const res = await apiClient.post<ApiResponse<{ list: ListResponse['list'] }>>('/api/properties/similar', { id, limit })
  return unwrap(res)
}

export async function searchProperties(params: { keyword: string; page?: number; limit?: number; dealType?: DealType }) {
  const res = await apiClient.post<
    ApiResponse<
      ListResponse & {
        keyword: string
        communities: { name: string; district: string; businessArea: string; count: number }[]
        suggestions: SearchSuggestion[]
      }
    >
  >('/api/properties/search', { page: 1, limit: 10, ...params })
  return unwrap(res)
}

export interface PublishPayload {
  title: string
  dealType: DealType
  district: string
  businessArea: string
  community: string
  address?: string
  price: number
  area: number
  rooms: number
  halls: number
  floor: number
  totalFloors: number
  orientation: string
  decoration: string
  rentType?: '整租' | '合租'
  metroLine?: string
  metroStation?: string
  facilities?: string[]
  description?: string
  contactName: string
  contactPhone: string
}

export async function publishProperty(payload: PublishPayload) {
  const res = await apiClient.post<ApiResponse<{ id: string; message: string }>>('/api/properties', payload)
  return unwrap(res)
}

export async function fetchFavorites() {
  const res = await apiClient.post<ApiResponse<{ list: ListResponse['list']; total: number }>>('/api/favorites/list', {})
  return unwrap(res)
}

export async function toggleFavorite(propertyId: string) {
  const res = await apiClient.post<ApiResponse<{ favorited: boolean; message: string }>>('/api/favorites/toggle', {
    propertyId,
  })
  return unwrap(res)
}

export async function fetchFavoriteStatus(propertyId: string) {
  const res = await apiClient.post<ApiResponse<{ favorited: boolean }>>('/api/favorites/status', { propertyId })
  return unwrap(res)
}

export async function fetchMarketOverview() {
  const res = await apiClient.post<ApiResponse<MarketOverview>>('/api/market/overview', {})
  return unwrap(res)
}

export async function fetchDistricts() {
  const res = await apiClient.post<ApiResponse<{ list: DistrictStat[]; total: number }>>('/api/market/districts', {})
  return unwrap(res)
}

export async function fetchDistrictDetail(name: string) {
  const res = await apiClient.post<ApiResponse<DistrictDetail>>('/api/market/district', { name })
  return unwrap(res)
}

export async function calcMortgage(payload: {
  totalPrice: number
  downPaymentRatio: number
  years: number
  loanType: 'commercial' | 'fund' | 'mixed'
  commercialRate?: number
  fundRate?: number
  fundAmount?: number
}) {
  const res = await apiClient.post<ApiResponse<MortgageResult>>('/api/market/mortgage', payload)
  return unwrap(res)
}

export async function fetchUserOverview() {
  const res = await apiClient.post<ApiResponse<UserOverview>>('/api/user/overview', {})
  return unwrap(res)
}

export async function fetchMyListings() {
  const res = await apiClient.post<ApiResponse<{ list: MyListing[]; total: number }>>('/api/user/listings', {})
  return unwrap(res)
}

export async function updatePublishStatus(id: string, status: 'online' | 'offline') {
  const res = await apiClient.post<ApiResponse<{ id: string; status: string; message: string }>>(
    '/api/user/publish-status',
    { id, status }
  )
  return unwrap(res)
}

export async function fetchHistory() {
  const res = await apiClient.post<ApiResponse<{ list: ListResponse['list']; total: number }>>('/api/user/history', {})
  return unwrap(res)
}

export async function recordView(propertyId: string) {
  try {
    await apiClient.post('/api/user/view', { propertyId })
  } catch {
    // 浏览记录失败不影响主流程
  }
}

export async function submitDemand(payload: {
  type: 'rent' | 'buy'
  district: string
  budget: string
  layout: string
  contact: string
  remark?: string
}) {
  const res = await apiClient.post<ApiResponse<{ id: string; message: string }>>('/api/user/demands', payload)
  return unwrap(res)
}

// ============ 付费发布 ============

export async function fetchPayPackages() {
  const res = await apiClient.post<ApiResponse<{ list: PayPackage[] }>>('/api/pay/packages', {})
  return unwrap(res)
}

export async function fetchPayStatus() {
  const res = await apiClient.post<ApiResponse<PayStatus>>('/api/pay/status', {})
  return unwrap(res)
}

export async function createPayOrder(packageId: string) {
  const res = await apiClient.post<ApiResponse<{ orderId: string; amount: number; packageName: string; status: string }>>(
    '/api/pay/order',
    { packageId }
  )
  return unwrap(res)
}

export async function confirmPayOrder(orderId: string) {
  const res = await apiClient.post<ApiResponse<PayConfirmResult>>('/api/pay/confirm', { orderId })
  return unwrap(res)
}
