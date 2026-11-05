import { Router } from 'express'
import { store } from '../data/store.js'
import { AppError } from '../middleware/errorHandler.js'
import { validate } from '../middleware/validation.js'
import { emptyListSchema, toggleFavoriteSchema } from '../types/api.types.js'
import { toListItem } from '../services/property.service.js'
import { findPropertyById } from './properties.js'

export const favoriteRouter = Router()

const getUserId = (req: { headers: Record<string, unknown> }): string =>
  (req.headers['x-user-id'] as string) || 'guest'

/**
 * 收藏列表
 * POST /api/favorites/list
 */
favoriteRouter.post('/list', validate(emptyListSchema), (req, res) => {
  const userId = getUserId(req)
  const records = store.favorites
    .filter((f) => f.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const list = records
    .map((r) => {
      const p = findPropertyById(r.propertyId)
      return p ? { ...toListItem(p), favoriteAt: r.createdAt } : null
    })
    .filter(Boolean)

  res.json({ success: true, data: { list, total: list.length } })
})

/**
 * 收藏 / 取消收藏
 * POST /api/favorites/toggle
 */
favoriteRouter.post('/toggle', validate(toggleFavoriteSchema), (req, res) => {
  const userId = getUserId(req)
  const { propertyId } = req.body

  if (!findPropertyById(propertyId)) throw new AppError(404, '房源不存在')

  const idx = store.favorites.findIndex((f) => f.userId === userId && f.propertyId === propertyId)
  if (idx >= 0) {
    store.favorites.splice(idx, 1)
    res.json({ success: true, data: { favorited: false, message: '已取消收藏' } })
    return
  }

  store.favorites.push({ userId, propertyId, createdAt: new Date().toISOString() })
  res.json({ success: true, data: { favorited: true, message: '收藏成功' } })
})

/**
 * 收藏状态查询（详情页进入时调用）
 * POST /api/favorites/status
 */
favoriteRouter.post('/status', validate(toggleFavoriteSchema), (req, res) => {
  const userId = getUserId(req)
  const { propertyId } = req.body
  const favorited = store.favorites.some((f) => f.userId === userId && f.propertyId === propertyId)
  res.json({ success: true, data: { favorited } })
})
