import { WUHAN_DISTRICTS } from '../data/districts.js'
import { PROPERTIES } from '../data/properties.js'
import type { DistrictStat } from '../types/property.types.js'

/** 简单的确定性伪随机，保证趋势曲线每次一致 */
function seededNoise(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

export function buildDistrictStats(): DistrictStat[] {
  return WUHAN_DISTRICTS.map((d, idx) => {
    const saleList = PROPERTIES.filter((p) => p.district === d.name && p.dealType === 'sale')
    const rentList = PROPERTIES.filter((p) => p.district === d.name && p.dealType === 'rent')

    const avgSalePrice =
      saleList.length > 0
        ? Math.round(saleList.reduce((s, p) => s + (p.unitPrice || 0), 0) / saleList.length)
        : d.avgSalePrice
    const avgRent =
      rentList.length > 0 ? Math.round(rentList.reduce((s, p) => s + p.price, 0) / rentList.length) : d.avgRent

    // 近 6 个月趋势：以当前均价为终点回溯
    const trend: number[] = []
    let cursor = avgSalePrice
    for (let m = 5; m >= 0; m--) {
      trend.unshift(Math.round(cursor))
      const delta = (seededNoise(idx * 10 + m) - 0.45) * 0.012
      cursor = cursor / (1 + delta)
    }
    const changeRate = Number((((avgSalePrice - trend[0]) / trend[0]) * 100).toFixed(2))

    return {
      name: d.name,
      avgSalePrice,
      avgRent,
      saleCount: saleList.length * 37 + 128,
      rentCount: rentList.length * 42 + 96,
      trend,
      changeRate,
    }
  })
}

export const DISTRICT_STATS = buildDistrictStats()

export function getDistrictByName(name: string) {
  const stat = DISTRICT_STATS.find((d) => d.name === name)
  if (!stat) return null
  const meta = WUHAN_DISTRICTS.find((d) => d.name === name)!
  const rentToSaleRatio = Number(((stat.avgRent * 12 * 100) / stat.avgSalePrice).toFixed(2))
  return {
    ...stat,
    businessAreas: meta.businessAreas,
    metroLines: meta.metroLines,
    rentToSaleRatio,
    // 租金回报率 = 年租金 / 总房价
    yieldRate: Number(((stat.avgRent * 12) / (stat.avgSalePrice * 60) * 100).toFixed(2)),
  }
}

export function getMarketOverview() {
  const totalSale = DISTRICT_STATS.reduce((s, d) => s + d.saleCount, 0)
  const totalRent = DISTRICT_STATS.reduce((s, d) => s + d.rentCount, 0)
  const avgSale = Math.round(
    DISTRICT_STATS.reduce((s, d) => s + d.avgSalePrice * d.saleCount, 0) / totalSale
  )
  const avgRent = Math.round(DISTRICT_STATS.reduce((s, d) => s + d.avgRent * d.rentCount, 0) / totalRent)

  // 全市均价趋势（加权）
  const cityTrend: number[] = []
  for (let m = 0; m < 6; m++) {
    const value = Math.round(
      DISTRICT_STATS.reduce((s, d) => s + d.trend[m] * d.saleCount, 0) / totalSale
    )
    cityTrend.push(value)
  }

  return {
    city: '武汉',
    avgSalePrice: avgSale,
    avgRent,
    saleCount: totalSale,
    rentCount: totalRent,
    cityTrend,
    cityChangeRate: Number((((cityTrend[5] - cityTrend[0]) / cityTrend[0]) * 100).toFixed(2)),
    districts: DISTRICT_STATS,
    updatedAt: new Date().toISOString(),
  }
}
