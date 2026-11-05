import { Router } from 'express'
import { validate } from '../middleware/validation.js'
import { districtDetailSchema, emptyListSchema, mortgageSchema } from '../types/api.types.js'
import { DISTRICT_STATS, getDistrictByName, getMarketOverview } from '../services/market.service.js'
import { AppError } from '../middleware/errorHandler.js'

export const marketRouter = Router()

/**
 * 全市行情概览
 * POST /api/market/overview
 */
marketRouter.post('/overview', validate(emptyListSchema), (_req, res) => {
  res.json({ success: true, data: getMarketOverview() })
})

/**
 * 区域行情列表（可按均价/租金排序）
 * POST /api/market/districts
 */
marketRouter.post('/districts', validate(emptyListSchema), (_req, res) => {
  const sorted = [...DISTRICT_STATS].sort((a, b) => b.avgSalePrice - a.avgSalePrice)
  res.json({
    success: true,
    data: {
      list: sorted.map((d, i) => ({ ...d, rank: i + 1 })),
      total: sorted.length,
    },
  })
})

/**
 * 单区域详情
 * POST /api/market/district
 */
marketRouter.post('/district', validate(districtDetailSchema), (req, res) => {
  const detail = getDistrictByName(req.body.name)
  if (!detail) throw new AppError(404, '该区域暂无数据')
  res.json({ success: true, data: detail })
})

/**
 * 房贷计算器：等额本息 / 等额本金
 * POST /api/market/mortgage
 */
marketRouter.post('/mortgage', validate(mortgageSchema), (req, res) => {
  const { totalPrice, downPaymentRatio, years, loanType, commercialRate, fundRate, fundAmount } = req.body

  const totalPriceYuan = totalPrice * 10000
  const downPayment = Math.round(totalPriceYuan * downPaymentRatio)
  const loanAmount = totalPriceYuan - downPayment
  const months = years * 12

  // 拆分商贷 / 公积金部分
  let commercialLoan = loanAmount
  let fundLoan = 0
  if (loanType === 'fund') {
    commercialLoan = 0
    fundLoan = Math.min(loanAmount, 700000)
  } else if (loanType === 'mixed') {
    fundLoan = Math.min(fundAmount ?? 700000, loanAmount)
    commercialLoan = loanAmount - fundLoan
  }

  const monthlyRate = (rate: number) => rate / 12

  // 等额本息
  const equalInstallment = (principal: number, rate: number) => {
    const r = monthlyRate(rate)
    if (principal <= 0) return { monthly: 0, totalInterest: 0, total: 0 }
    const monthly = (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1)
    const total = monthly * months
    return { monthly: Math.round(monthly), totalInterest: Math.round(total - principal), total: Math.round(total) }
  }

  // 等额本金
  const equalPrincipal = (principal: number, rate: number) => {
    const r = monthlyRate(rate)
    if (principal <= 0) return { firstMonth: 0, lastMonth: 0, totalInterest: 0, decrease: 0 }
    const principalPerMonth = principal / months
    const firstMonth = principalPerMonth + principal * r
    const lastMonth = principalPerMonth + principalPerMonth * r
    const totalInterest = ((months + 1) * principal * r) / 2
    return {
      firstMonth: Math.round(firstMonth),
      lastMonth: Math.round(lastMonth),
      totalInterest: Math.round(totalInterest),
      decrease: Math.round(principalPerMonth * r),
    }
  }

  const commercial = equalInstallment(commercialLoan, commercialRate)
  const fund = equalInstallment(fundLoan, fundRate)
  const commercialEP = equalPrincipal(commercialLoan, commercialRate)
  const fundEP = equalPrincipal(fundLoan, fundRate)

  res.json({
    success: true,
    data: {
      totalPrice: totalPriceYuan,
      downPayment,
      loanAmount,
      months,
      // 等额本息
      equalInstallment: {
        monthly: commercial.monthly + fund.monthly,
        totalInterest: commercial.totalInterest + fund.totalInterest,
        totalPayment: commercial.total + fund.total,
        breakdown: { commercial: commercial.monthly, fund: fund.monthly },
      },
      // 等额本金
      equalPrincipal: {
        firstMonth: commercialEP.firstMonth + fundEP.firstMonth,
        lastMonth: commercialEP.lastMonth + fundEP.lastMonth,
        monthlyDecrease: commercialEP.decrease + fundEP.decrease,
        totalInterest: commercialEP.totalInterest + fundEP.totalInterest,
        totalPayment: Math.round(loanAmount + commercialEP.totalInterest + fundEP.totalInterest),
      },
      loanSplit: {
        commercial: commercialLoan,
        fund: fundLoan,
        rates: { commercial: commercialRate, fund: fundRate },
      },
    },
  })
})
