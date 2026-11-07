import { Router } from 'express'
import { PROPERTIES } from '../data/properties.js'
import { AppError } from '../middleware/errorHandler.js'
import { validate } from '../middleware/validation.js'
import {
  listPropertiesSchema,
  publishPropertySchema,
  recommendPropertiesSchema,
  searchPropertiesSchema,
  similarPropertiesSchema,
} from '../types/api.types.js'
import { filterProperties, paginate, sortProperties, toListItem, getImageSeed } from '../services/property.service.js'
import { SEARCH_SUGGESTIONS } from '../data/districts.js'
import { consumePublishEntitlement } from './pay.js'
import type { Property } from '../types/property.types.js'

export const propertyRouter = Router()

/** 用户新发布的房源挂在内存数组前部（演示环境持久化到进程生命周期） */
const userListings: Property[] = []

const allProperties = (): Property[] => [...userListings, ...PROPERTIES]

/**
 * 房源列表：分页 + 筛选 + 排序
 * POST /api/properties/list
 */
propertyRouter.post('/list', validate(listPropertiesSchema), (req, res) => {
  const input = req.body
  const filtered = filterProperties(allProperties(), input)
  const sorted = sortProperties(filtered, input.sort)
  const { items, pagination } = paginate(sorted, input.page, input.limit)

  res.json({
    success: true,
    data: {
      list: items.map(toListItem),
      pagination,
    },
  })
})

/**
 * 关键词搜索 + 联想建议
 * POST /api/properties/search
 */
propertyRouter.post('/search', validate(searchPropertiesSchema), (req, res) => {
  const { keyword, page, limit, dealType } = req.body

  const matched = filterProperties(allProperties(), { keyword, dealType })
  const sorted = sortProperties(matched, 'default')
  const { items, pagination } = paginate(sorted, page, limit)

  // 联想：优先匹配片区 / 小区 / 地铁
  const kw = keyword.trim()
  const suggestions = kw
    ? SEARCH_SUGGESTIONS.filter((s) => s.name.includes(kw) || s.desc.includes(kw)).slice(0, 6)
    : []

  const communities = [...new Set(matched.map((p) => p.community))].slice(0, 5)

  res.json({
    success: true,
    data: {
      keyword: kw,
      list: items.map(toListItem),
      communities: communities.map((c) => {
        const sample = matched.find((p) => p.community === c)!
        return {
          name: c,
          district: sample.district,
          businessArea: sample.businessArea,
          count: matched.filter((p) => p.community === c).length,
        }
      }),
      suggestions,
      pagination,
    },
  })
})

/**
 * 首页推荐 / 最新房源
 * POST /api/properties/recommend
 */
propertyRouter.post('/recommend', validate(recommendPropertiesSchema), (req, res) => {
  const { dealType, district, limit, onlyNewest } = req.body
  const filtered = filterProperties(allProperties(), { dealType, district })
  const sorted = sortProperties(filtered, onlyNewest ? 'newest' : 'default')
  res.json({
    success: true,
    data: {
      list: sorted.slice(0, limit).map(toListItem),
      total: filtered.length,
    },
  })
})

/**
 * 相似房源
 * POST /api/properties/similar
 */
propertyRouter.post('/similar', validate(similarPropertiesSchema), (req, res) => {
  const { id, limit } = req.body
  const target = allProperties().find((p) => p.id === id)
  if (!target) throw new AppError(404, '房源不存在')

  const similar = allProperties()
    .filter((p) => p.id !== id && p.dealType === target.dealType)
    .map((p) => {
      let score = 0
      if (p.district === target.district) score += 40
      if (p.businessArea === target.businessArea) score += 30
      if (p.rooms === target.rooms) score += 20
      const priceDiff = Math.abs(p.price - target.price) / target.price
      score += Math.max(0, 20 - priceDiff * 100)
      return { p, score }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => toListItem(x.p))

  res.json({ success: true, data: { list: similar } })
})

/**
 * 房源详情
 * GET /api/properties/:id
 */
propertyRouter.get('/:id', (req, res) => {
  const property = allProperties().find((p) => p.id === req.params.id)
  if (!property) throw new AppError(404, '房源不存在或已下架')

  const districtMeta = allProperties().filter((p) => p.district === property.district)

  // 同小区租售对比
  const sameCommunitySale = districtMeta.find((p) => p.community === property.community && p.dealType === 'sale')
  const sameCommunityRent = districtMeta.find((p) => p.community === property.community && p.dealType === 'rent')

  res.json({
    success: true,
    data: {
      ...property,
      imageSeed: getImageSeed(property),
      gallery: Array.from({ length: 6 }, (_, i) => ({
        seed: getImageSeed(property) + i * 17,
        type: i === 0 ? '客厅' : i === 1 ? '卧室' : i === 2 ? '厨房' : i === 3 ? '卫生间' : i === 4 ? '户型图' : '小区环境',
      })),
      communityCompare: {
        salePrice: sameCommunitySale?.unitPrice ?? null,
        rentPrice: sameCommunityRent?.price ?? null,
        communitySaleTotal: sameCommunitySale?.price ?? null,
      },
      serviceFee: property.dealType === 'rent' ? Math.round(property.price * 0.5) : 0,
      deposit: property.dealType === 'rent' ? property.price : 0,
    },
  })
})

/**
 * 发布房源
 * POST /api/properties
 */
propertyRouter.post('/', validate(publishPropertySchema), (req, res) => {
  const input = req.body
  const userId = (req.headers['x-user-id'] as string) || 'guest'

  // 付费校验：未开通发布服务的用户不能发布
  const ent = consumePublishEntitlement(userId)
  if (!ent.allowed) {
    throw new AppError(403, '请先购买发布服务后再发布房源')
  }

  const seq = userListings.length + 1
  const totalFloors = input.totalFloors || 18

  const property: Property = {
    id: `WHU${String(seq).padStart(3, '0')}`,
    title: input.title,
    dealType: input.dealType,
    district: input.district,
    businessArea: input.businessArea,
    community: input.community,
    address: input.address || `${input.district}${input.businessArea}`,
    price: input.price,
    unitPrice: input.dealType === 'sale' ? Math.round((input.price * 10000) / input.area) : undefined,
    layout: `${input.rooms}室${input.halls}厅1卫`,
    rooms: input.rooms,
    halls: input.halls,
    area: input.area,
    floor: input.floor,
    totalFloors,
    orientation: input.orientation,
    decoration: input.decoration,
    elevator: input.floor > 6 || input.facilities.includes('电梯'),
    rentType: input.dealType === 'rent' ? input.rentType || '整租' : undefined,
    metroLine: input.metroLine,
    metroStation: input.metroStation,
    metroDistance: 500,
    tags: ['新发布', ...(input.dealType === 'rent' ? ['业主直租'] : [])],
    facilities: input.facilities,
    images: [],
    description: input.description || '业主发布房源，详细信息可电话咨询。',
    publishDate: new Date().toISOString(),
    viewCount: 0,
    coordinates: { lat: 30.55, lng: 114.3 },
    agent: {
      name: input.contactName,
      company: input.dealType === 'rent' ? '个人房东' : '个人业主',
      phone: `${input.contactPhone.slice(0, 3)}****${input.contactPhone.slice(-4)}`,
      rating: 5,
      dealCount: 0,
      years: 1,
      avatarText: input.contactName.slice(0, 1),
    },
    score: 100,
  }

  userListings.unshift(property)

  res.status(201).json({
    success: true,
    data: {
      id: property.id,
      message: '发布成功，房源将在审核通过后展示',
      remaining: ent.kind === 'quota' ? ent.remaining : null,
      remainDays: ent.kind === 'membership' ? ent.remainDays : null,
    },
  })
})

/** 供其他模块读取用户发布的房源 */
export const getUserListings = () => userListings

/** 供收藏等模块按 id 查询 */
export const findPropertyById = (id: string) => allProperties().find((p) => p.id === id)
