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

class MemoryStore {
  favorites: FavoriteRecord[] = []
  demands: DemandRecord[] = []
  views: ViewRecord[] = []
  publishStatus: StatusRecord[] = []
}

export const store = new MemoryStore()
