import { z } from 'zod'

export const dealTypeEnum = z.enum(['rent', 'sale'])

export const listPropertiesSchema = z.object({
  body: z.object({
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(50).default(10),
    dealType: dealTypeEnum.optional(),
    district: z.string().optional(),
    businessArea: z.string().optional(),
    priceRange: z
      .object({
        min: z.number().optional(),
        max: z.number().optional(),
      })
      .optional(),
    rooms: z.array(z.number().int()).optional(),
    areaRange: z
      .object({
        min: z.number().optional(),
        max: z.number().optional(),
      })
      .optional(),
    orientation: z.string().optional(),
    rentType: z.enum(['整租', '合租']).optional(),
    maxMetroDistance: z.number().optional(),
    keyword: z.string().optional(),
    facilities: z.array(z.string()).optional(),
    sort: z.enum(['default', 'priceAsc', 'priceDesc', 'newest', 'areaDesc']).default('default'),
  }),
})

export const searchPropertiesSchema = z.object({
  body: z.object({
    keyword: z.string().default(''),
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(50).default(10),
    dealType: dealTypeEnum.optional(),
  }),
})

export const similarPropertiesSchema = z.object({
  body: z.object({
    id: z.string(),
    limit: z.number().int().min(1).max(12).default(4),
  }),
})

export const recommendPropertiesSchema = z.object({
  body: z.object({
    dealType: dealTypeEnum.default('rent'),
    district: z.string().optional(),
    limit: z.number().int().min(1).max(20).default(6),
    onlyNewest: z.boolean().default(false),
  }),
})

const publishPropertySchema = z.object({
  body: z.object({
    title: z.string().min(4, '标题至少 4 个字').max(60),
    dealType: dealTypeEnum,
    district: z.string().min(2),
    businessArea: z.string().min(1),
    community: z.string().min(2),
    address: z.string().optional().default(''),
    price: z.number().positive('价格需大于 0'),
    area: z.number().positive('面积需大于 0'),
    rooms: z.number().int().min(1).max(9),
    halls: z.number().int().min(0).max(5),
    floor: z.number().int().min(1).max(99),
    totalFloors: z.number().int().min(1).max(99),
    orientation: z.string().min(1),
    decoration: z.string().min(1),
    rentType: z.enum(['整租', '合租']).optional(),
    metroLine: z.string().optional().default(''),
    metroStation: z.string().optional().default(''),
    facilities: z.array(z.string()).optional().default([]),
    description: z.string().max(1000).optional().default(''),
    contactName: z.string().min(1, '请填写联系人'),
    contactPhone: z.string().regex(/^1[3-9]\d{9}$/, '请填写正确的手机号'),
  }),
})

export type ListPropertiesInput = z.infer<typeof listPropertiesSchema>['body']
export type PublishPropertyInput = z.infer<typeof publishPropertySchema>['body']

export { publishPropertySchema }

export const toggleFavoriteSchema = z.object({
  body: z.object({
    propertyId: z.string().min(1),
  }),
})

export const emptyListSchema = z.object({
  body: z.object({}).optional().default({}),
})

export const publishStatusSchema = z.object({
  body: z.object({
    id: z.string().min(1),
    status: z.enum(['online', 'offline']),
  }),
})

export const demandSchema = z.object({
  body: z.object({
    type: z.enum(['rent', 'buy']),
    district: z.string().min(2),
    budget: z.string().min(1),
    layout: z.string().min(1),
    contact: z.string().regex(/^1[3-9]\d{9}$/, '请填写正确的手机号'),
    remark: z.string().max(200).optional().default(''),
  }),
})

export const districtDetailSchema = z.object({
  body: z.object({
    name: z.string().min(2),
  }),
})

export const mortgageSchema = z.object({
  body: z.object({
    totalPrice: z.number().positive('总价需大于 0'),
    downPaymentRatio: z.number().min(0.1).max(0.9).default(0.3),
    years: z.number().int().min(1).max(30).default(30),
    loanType: z.enum(['commercial', 'fund', 'mixed']).default('commercial'),
    commercialRate: z.number().min(0.01).max(0.2).default(0.031),
    fundRate: z.number().min(0.01).max(0.2).default(0.0285),
    fundAmount: z.number().min(0).optional(),
  }),
})
