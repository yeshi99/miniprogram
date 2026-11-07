/**
 * 轻量内存存储：按用户 ID 隔离数据（演示环境使用，生产可替换为 TCB 数据库）
 */
export interface FavoriteRecord {
  userId: string
  propertyId: string
  createdAt: string
}

export interface DemandRecord {
  id: string
  userId: string
  type: 'rent' | 'buy'
  district: string
  budget: string
  layout: string
  contact: string
  remark: string
  createdAt: string
}

export interface ViewRecord {
  userId: string
  propertyId: string
  viewedAt: string
}

export interface StatusRecord {
  userId: string
  propertyId: string
  status: 'online' | 'offline'
}

export type PayOrderStatus = 'pending' | 'paid' | 'canceled'

export interface PayOrder {
  id: string
  userId: string
  packageId: string
  packageName: string
  amount: number
  status: PayOrderStatus
  createdAt: string
  paidAt: string | null
}

/** 用户权益：quota = 按次数（remaining 递减），membership = 期限内不限次 */
export interface Entitlement {
  id: string
  userId: string
  packageId: string
  type: 'quota' | 'membership'
  remaining: number | null
  expiresAt: string | null
  createdAt: string
}

class MemoryStore {
  favorites: FavoriteRecord[] = []
  demands: DemandRecord[] = []
  views: ViewRecord[] = []
  publishStatus: StatusRecord[] = []
  payOrders: PayOrder[] = []
  entitlements: Entitlement[] = []
}

export const store = new MemoryStore()
