import { Router } from 'express'
import { validate } from '../middleware/validation.js'
import { payConfirmSchema, payOrderSchema } from '../types/api.types.js'
import { store } from '../data/store.js'
import { AppError } from '../middleware/errorHandler.js'

export const payRouter = Router()

/** 付费套餐（演示环境固定，生产环境应由数据库/后台配置） */
export const PAY_PACKAGES = [
  {
    id: 'single',
    name: '单次发布',
    price: 9.9,
    type: 'quota' as const,
    quota: 1,
    validityDays: null,
    desc: '可发布 1 条房源信息',
    highlights: ['适合偶尔出租/出售', '发布后长期展示'],
  },
  {
    id: 'monthly',
    name: '月卡会员',
    price: 29.9,
    type: 'membership' as const,
    quota: null,
    validityDays: 30,
    desc: '30 天内不限次发布',
    highlights: ['不限次发布房源', '房源带「会员」标识', '优先展示排序加权'],
  },
  {
    id: 'quarterly',
    name: '季卡会员',
    price: 69.0,
    type: 'membership' as const,
    quota: null,
    validityDays: 90,
    desc: '90 天内不限次发布',
    highlights: ['不限次发布房源', '房源带「会员」标识', '免费刷新置顶 3 次'],
    best: true,
  },
]

const getUserId = (req: { headers: Record<string, unknown> }): string =>
  (req.headers['x-user-id'] as string) || 'guest'

const isEntitlementValid = (e: { expiresAt: string | null }): boolean =>
  e.expiresAt === null || new Date(e.expiresAt).getTime() > Date.now()

/** 计算用户当前发布权益 */
export const getPublishEntitlement = (userId: string) => {
  const memberships = store.entitlements.filter(
    (e) => e.userId === userId && e.type === 'membership' && isEntitlementValid(e)
  )
  if (memberships.length > 0) {
    const latest = memberships.sort((a, b) => (a.expiresAt! < b.expiresAt! ? 1 : -1))[0]
    const remainDays = Math.max(1, Math.ceil((new Date(latest.expiresAt!).getTime() - Date.now()) / 86400000))
    return { allowed: true, kind: 'membership' as const, remainDays, packageId: latest.packageId }
  }

  const quota = store.entitlements.find(
    (e) => e.userId === userId && e.type === 'quota' && (e.remaining ?? 0) > 0
  )
  if (quota) {
    return { allowed: true, kind: 'quota' as const, remaining: quota.remaining, packageId: quota.packageId }
  }

  return { allowed: false, kind: null as null, remaining: 0, packageId: null }
}

/** 消耗一次发布权益（会员不限次，次数包扣 1） */
export const consumePublishEntitlement = (userId: string) => {
  const ent = getPublishEntitlement(userId)
  if (!ent.allowed) return ent
  if (ent.kind === 'quota') {
    const quota = store.entitlements.find((e) => e.userId === userId && e.type === 'quota' && (e.remaining ?? 0) > 0)!
    quota.remaining = (quota.remaining ?? 1) - 1
    return { ...ent, remaining: quota.remaining }
  }
  return ent
}

/** 套餐列表 */
payRouter.post('/packages', (_req, res) => {
  res.json({ success: true, data: { list: PAY_PACKAGES } })
})

/** 当前用户的付费 / 发布权益状态 */
payRouter.post('/status', (req, res) => {
  const userId = getUserId(req)
  const ent = getPublishEntitlement(userId)
  const orders = store.payOrders
    .filter((o) => o.userId === userId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 20)

  res.json({
    success: true,
    data: {
      entitled: ent.allowed,
      kind: ent.kind,
      remainDays: ent.kind === 'membership' ? ent.remainDays : null,
      remaining: ent.kind === 'quota' ? ent.remaining : null,
      packageId: ent.packageId,
      orders,
    },
  })
})

/** 创建订单（模拟微信支付下单） */
payRouter.post('/order', validate(payOrderSchema), (req, res) => {
  const userId = getUserId(req)
  const pkg = PAY_PACKAGES.find((p) => p.id === req.body.packageId)
  if (!pkg) throw new AppError(404, '套餐不存在')

  const order = {
    id: `PO${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 1000)}`,
    userId,
    packageId: pkg.id,
    packageName: pkg.name,
    amount: pkg.price,
    status: 'pending' as const,
    createdAt: new Date().toISOString(),
    paidAt: null,
  }
  store.payOrders.unshift(order)

  res.status(201).json({
    success: true,
    data: { orderId: order.id, amount: order.amount, packageName: pkg.name, status: order.status },
  })
})

/** 确认支付（演示环境模拟支付成功回调） */
payRouter.post('/confirm', validate(payConfirmSchema), (req, res) => {
  const userId = getUserId(req)
  const order = store.payOrders.find((o) => o.id === req.body.orderId && o.userId === userId)
  if (!order) throw new AppError(404, '订单不存在')
  if (order.status === 'paid') throw new AppError(400, '订单已支付，请勿重复支付')

  const pkg = PAY_PACKAGES.find((p) => p.id === order.packageId)!
  order.status = 'paid'
  order.paidAt = new Date().toISOString()

  const expiresAt =
    pkg.validityDays ? new Date(Date.now() + pkg.validityDays * 86400000).toISOString() : null

  // 同类权益叠加：次数累加 / 会员到期日顺延
  if (pkg.type === 'quota') {
    const exist = store.entitlements.find((e) => e.userId === userId && e.packageId === pkg.id)
    if (exist) {
      exist.remaining = (exist.remaining ?? 0) + (pkg.quota ?? 1)
    } else {
      store.entitlements.push({
        id: `E${Date.now().toString(36).toUpperCase()}`,
        userId,
        packageId: pkg.id,
        type: 'quota',
        remaining: pkg.quota ?? 1,
        expiresAt: null,
        createdAt: new Date().toISOString(),
      })
    }
  } else {
    const exist = store.entitlements.find(
      (e) => e.userId === userId && e.packageId === pkg.id && isEntitlementValid(e)
    )
    if (exist && exist.expiresAt) {
      exist.expiresAt = new Date(new Date(exist.expiresAt).getTime() + pkg.validityDays! * 86400000).toISOString()
    } else {
      store.entitlements.push({
        id: `E${Date.now().toString(36).toUpperCase()}`,
        userId,
        packageId: pkg.id,
        type: 'membership',
        remaining: null,
        expiresAt,
        createdAt: new Date().toISOString(),
      })
    }
  }

  const ent = getPublishEntitlement(userId)
  res.json({
    success: true,
    data: {
      orderId: order.id,
      status: 'paid',
      message: '支付成功，发布服务已开通',
      entitled: ent.allowed,
      remainDays: ent.kind === 'membership' ? ent.remainDays : null,
      remaining: ent.kind === 'quota' ? ent.remaining : null,
    },
  })
})
