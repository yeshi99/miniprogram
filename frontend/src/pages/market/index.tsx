import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useState } from 'react'
import Icon from '@/components/Icon'
import { fetchMarketOverview } from '@/services/property'
import type { MarketOverview } from '@/types/property'
import './index.scss'

const MONTH_LABELS = ['6月', '7月', '8月', '9月', '10月', '11月']

/** 纯 CSS 折线图：根据数值序列计算 SVG path，避免引入图表库增加包体积 */
function TrendChart({ data, color = '#0F766E' }: { data: number[]; color?: string }) {
  if (!data || data.length < 2) return null
  const w = 620
  const h = 200
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const stepX = w / (data.length - 1)

  const points = data.map((v, i) => {
    const x = i * stepX
    const y = h - ((v - min) / range) * (h - 30) - 15
    return { x, y, v }
  })

  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const area = `${line} L${w},${h} L0,${h} Z`

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${color}" stop-opacity="0.24"/>
        <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <path d="${area}" fill="url(#g)"/>
    <path d="${line}" fill="none" stroke="${color}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
    ${points.map((p) => `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="6" fill="#fff" stroke="${color}" stroke-width="3"/>`).join('')}
  </svg>`

  return (
    <View className='chart'>
      <View className='chart__canvas'>
        <View
          className='chart__svg'
          style={{
            backgroundImage: `url("data:image/svg+xml;charset=utf8,${encodeURIComponent(svg)}")`,
            backgroundSize: '100% 100%',
            backgroundRepeat: 'no-repeat',
          }}
        />
      </View>
      <View className='chart__labels'>
        {MONTH_LABELS.map((m) => (
          <Text key={m} className='chart__label'>{m}</Text>
        ))}
      </View>
      <View className='chart__stats'>
        <Text className='chart__stat'>最低 {min.toLocaleString()}</Text>
        <Text className='chart__stat'>最高 {max.toLocaleString()}</Text>
      </View>
    </View>
  )
}

export default function Market() {
  const [data, setData] = useState<MarketOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'sale' | 'rent'>('sale')

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetchMarketOverview()
      setData(res)
    } catch {
      Taro.showToast({ title: '行情加载失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  useDidShow(() => {
    if (!data) load()
  })

  const maxSale = data ? Math.max(...data.districts.map((d) => d.avgSalePrice)) : 1

  return (
    <View className='market'>
      <View className='market__hero'>
        <View className='market__hero-top'>
          <View>
            <Text className='market__hero-label'>武汉全市 {tab === 'sale' ? '二手均价' : '平均租金'}</Text>
            <View className='market__hero-value-row'>
              <Text className='market__hero-value'>
                {data ? (tab === 'sale' ? data.avgSalePrice.toLocaleString() : data.avgRent.toLocaleString()) : '—'}
              </Text>
              <Text className='market__hero-unit'>{tab === 'sale' ? '元/㎡' : '元/月'}</Text>
            </View>
          </View>
          <View className='market__tabs'>
            <View
              className={`market__tab ${tab === 'sale' ? 'is-active' : ''}`}
              onClick={() => setTab('sale')}
            >
              <Text className='market__tab-text'>售价</Text>
            </View>
            <View
              className={`market__tab ${tab === 'rent' ? 'is-active' : ''}`}
              onClick={() => setTab('rent')}
            >
              <Text className='market__tab-text'>租金</Text>
            </View>
          </View>
        </View>

        <View className='market__hero-meta'>
          <View className='market__meta-item'>
            <Text className='market__meta-label'>在售房源</Text>
            <Text className='market__meta-value'>{data ? data.saleCount.toLocaleString() : '—'}</Text>
          </View>
          <View className='market__meta-divider' />
          <View className='market__meta-item'>
            <Text className='market__meta-label'>在租房源</Text>
            <Text className='market__meta-value'>{data ? data.rentCount.toLocaleString() : '—'}</Text>
          </View>
          <View className='market__meta-divider' />
          <View className='market__meta-item'>
            <Text className='market__meta-label'>近半年</Text>
            <Text className='market__meta-value market__meta-value--up'>
              {data ? `+${data.cityChangeRate}%` : '—'}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView scrollY className='market__scroll'>
        <View className='market__content'>
          {/* 趋势 */}
          <View className='card'>
            <View className='card__head'>
              <View>
                <Text className='card__title'>全市价格走势</Text>
                <Text className='card__sub'>近 6 个月 · 加权均价</Text>
              </View>
              <View className='card__badge'>
                <Icon name='trend' size={22} color='#0F766E' />
                <Text className='card__badge-text'>平稳微升</Text>
              </View>
            </View>
            {data ? <TrendChart data={data.cityTrend} /> : <View className='skeleton' style={{ height: '240px' }} />}
          </View>

          {/* 工具入口 */}
          <View className='tools'>
            <View
              className='tools__item tap'
              onClick={() => Taro.navigateTo({ url: '/pages/calculator/index' })}
            >
              <View className='tools__icon'>
                <Icon name='calc' size={38} color='#0F766E' />
              </View>
              <View className='tools__body'>
                <Text className='tools__title'>房贷计算器</Text>
                <Text className='tools__desc'>月供 / 首付 / 利息</Text>
              </View>
              <Icon name='chevron-right' size={24} color='#a5b2b7' />
            </View>
            <View className='tools__item tap' onClick={() => Taro.navigateTo({ url: '/pages/demand/index' })}>
              <View className='tools__icon tools__icon--accent'>
                <Icon name='message' size={38} color='#e07b00' />
              </View>
              <View className='tools__body'>
                <Text className='tools__title'>发布找房需求</Text>
                <Text className='tools__desc'>经纪人主动匹配</Text>
              </View>
              <Icon name='chevron-right' size={24} color='#a5b2b7' />
            </View>
          </View>

          {/* 区域排行 */}
          <View className='card'>
            <View className='card__head'>
              <Text className='card__title'>区域{tab === 'sale' ? '均价' : '租金'}排行</Text>
              <Text className='card__sub'>共 {data?.districts.length ?? 0} 个区域</Text>
            </View>

            {loading && !data
              ? [1, 2, 3, 4].map((i) => <View key={i} className='skeleton' style={{ height: '72px', marginBottom: '16px' }} />)
              : data?.districts
                  .slice()
                  .sort((a, b) => (tab === 'sale' ? b.avgSalePrice - a.avgSalePrice : b.avgRent - a.avgRent))
                  .map((d, i) => {
                    const value = tab === 'sale' ? d.avgSalePrice : d.avgRent
                    const ratio = tab === 'sale' ? (value / maxSale) * 100 : (value / 3600) * 100
                    return (
                      <View
                        key={d.name}
                        className='rank tap'
                        onClick={() => Taro.navigateTo({ url: `/pages/district/index?name=${encodeURIComponent(d.name)}` })}
                      >
                        <View className={`rank__no ${i < 3 ? 'is-top' : ''}`}>
                          <Text className='rank__no-text'>{i + 1}</Text>
                        </View>
                        <View className='rank__body'>
                          <View className='rank__title-row'>
                            <Text className='rank__name'>{d.name}</Text>
                            <View className='rank__value-row'>
                              <Text className='rank__value'>{value.toLocaleString()}</Text>
                              <Text className='rank__unit'>{tab === 'sale' ? '元/㎡' : '元/月'}</Text>
                            </View>
                          </View>
                          <View className='rank__bar'>
                            <View className='rank__bar-fill' style={{ width: `${Math.max(12, ratio)}%` }} />
                          </View>
                          <View className='rank__meta'>
                            <Text className='rank__meta-text'>
                              在售 {d.saleCount} · 在租 {d.rentCount}
                            </Text>
                            <Text className={`rank__change ${d.changeRate >= 0 ? 'is-up' : 'is-down'}`}>
                              {d.changeRate >= 0 ? '+' : ''}
                              {d.changeRate}%
                            </Text>
                          </View>
                        </View>
                      </View>
                    )
                  })}
          </View>

          {/* 租售比说明 */}
          <View className='insight'>
            <View className='insight__head'>
              <Icon name='compass' size={30} color='#0F766E' />
              <Text className='insight__title'>怎么理解这些数字</Text>
            </View>
            <Text className='insight__text'>
              均价以各区域在售房源成交参考价加权计算，租金以整租一居为基准。
              若某区域年租金回报率高于 2%，说明租售比更健康；低于 1.5% 的区域多为改善型或学区板块，更适合长期持有自住。
            </Text>
          </View>

          <View className='market__footer'>
            <Text className='market__footer-text'>数据更新时间：{data ? new Date(data.updatedAt).toLocaleDateString('zh-CN') : '—'}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}
