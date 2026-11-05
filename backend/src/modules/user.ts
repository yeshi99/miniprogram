import { Router } from 'express'
import { validate } from '../middleware/validation.js'
import { demandSchema, emptyListSchema, publishStatusSchema, toggleFavoriteSchema } from '../types/api.types.js'
import { store } from '../data/store.js'
import { toListItem } from '../services/property.service.js'
import { getUserListings, findPropertyById } from './properties.js'
import { AppError } from '../middleware/errorHandler.js'

export const userRouter = Router()

const getUserId = (req: { headers: Record<string, unknown> }): string =>
  (req.headers['x-user-id'] as string) || 'guest'

/**
 * 我的发布列表
 * POST /api/user/listings
 */
userRouter.post('/listings', validate(emptyListSchema), (req, res) => {
  const userId = getUserId(req)
  // 演示环境：用户发布的房源（WHU 前缀）对所有用户可见
  const mine = getUserListings()

  const list = mine.map((p) => {
    const status = store.publishStatus.find((s) => s.userId === userId && s.propertyId === p.id)?.status
    return {
      ...toListItem(p),
      description: p.description,
      status: status || 'online',
    }
  })

  res.json({ success: true, data: { list, total: list.length } })
})

/**
 * 上架 / 下架
 * POST /api/user/publish-status
 */
userRouter.post('/publish-status', validate(publishStatusSchema), (req, res) => {
  const userId = getUserId(req)
  const { id, status } = req.body
  if (!findPropertyById(id)) throw new AppError(404, '房源不存在')

  const idx = store.publishStatus.findIndex((s) => s.userId === userId && s.propertyId === id)
  if (idx >= 0) store.publishStatus[idx].status = status
  else store.publishStatus.push({ userId, propertyId: id, status })

  res.json({ success: true, data: { id, status, message: status === 'online' ? '已上架' : '已下架' } })
})

/**
 * 提交求租 / 求购需求
 * POST /api/user/demands
 */
userRouter.post('/demands', validate(demandSchema), (req, res) => {
  const userId = getUserId(req)
  const input = req.body
  const record = {
    id: `DM${Date.now().toString().slice(-6)}`,
    userId,
    ...input,
    createdAt: new Date().toISOString(),
  }
  store.demands.unshift(record)
  res.status(201).json({
    success: true,
    data: { id: record.id, message: '需求已提交，经纪人将在 24 小时内联系您' },
  })
})

/**
 * 我的需求列表
 * POST /api/user/demands/list
 */
userRouter.post('/demands/list', validate(emptyListSchema), (req, res) => {
  const userId = getUserId(req)
  const list = store.demands.filter((d) => d.userId === userId)
  res.json({ success: true, data: { list, total: list.length } })
})

/**
 * 记录浏览历史
 * POST /api/user/view
 */
userRouter.post('/view', validate(toggleFavoriteSchema), (req, res) => {
  const userId = getUserId(req)
  const { propertyId } = req.body
  const existing = store.views.findIndex((v) => v.userId === userId && v.propertyId === propertyId)
  if (existing >= 0) store.views.splice(existing, 1)
  store.views.push({ userId, propertyId, viewedAt: new Date().toISOString() })
  // 最多保留 50 条
  const userViews = store.views.filter((v) => v.userId === userId)
  if (userViews.length > 50) {
    const oldest = userViews[0]
    store.views.splice(store.views.indexOf(oldest), 1)
  }
  res.json({ success: true, data: { message: 'ok' } })
})

/**
 * 浏览历史列表
 * POST /api/user/history
 */
userRouter.post('/history', validate(emptyListSchema), (req, res) => {
  const userId = getUserId(req)
  const records = store.views
    .filter((v) => v.userId === userId)
    .sort((a, b) => new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime())

  const list = records
    .map((r) => {
      const p = findPropertyById(r.propertyId)
      return p ? { ...toListItem(p), viewedAt: r.viewedAt } : null
    })
    .filter(Boolean)

  res.json({ success: true, data: { list, total: list.length } })
})

/**
 * 个人中心概览
 * POST /api/user/overview
 */
userRouter.post('/overview', validate(emptyListSchema), (req, res) => {
  const userId = getUserId(req)
  res.json({
    success: true,
    data: {
      nickname: '看房小助手',
      avatarText: '武',
      city: '武汉',
      favoriteCount: store.favorites.filter((f) => f.userId === userId).length,
      listingCount: getUserListings().length,
      historyCount: store.views.filter((v) => v.userId === userId).length,
      demandCount: store.demands.filter((d) => d.userId === userId).length,
      memberLevel: '看房会员 · 体验版',
    },
  })
})
