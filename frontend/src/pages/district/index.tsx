import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useEffect, useState } from 'react'
import Icon from '@/components/Icon'
import PropertyCard from '@/components/PropertyCard'
import { fetchDistrictDetail, fetchPropertyList } from '@/services/property'
import type { DistrictDetail, PropertyListItem } from '@/types/property'
import './index.scss'

const MONTH_LABELS = ['6月', '7月', '8月', '9月', '10月', '11月']

export default function District() {
  const router = useRouter()
  const name = decodeURIComponent(router.params.name || '')

  const [detail, setDetail] = useState<DistrictDetail | null>(null)
  const [list, setList] = useState<PropertyListItem[]>([])
  const [dealType, setDealType] = useState<'sale' | 'rent'>('sale')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!name) return
    setLoading(true)
    Promise.all([fetchDistrictDetail(name), fetchPropertyList({ district: name, dealType: 'sale', limit: 6 })])
      .then(([d, l]) => {
        setDetail(d)
        setList(l.list)
      })
      .catch(() => Taro.showToast({ title: '区域数据加载失败', icon: 'none' }))
      .finally(() => setLoading(false))
  }, [name])

  const switchType = async (type: 'sale' | 'rent') => {
    if (type === dealType) return
    setDealType(type)
    try {
      const l = await fetchPropertyList({ district: name, dealType: type, limit: 6 })
      setList(l.list)
    } catch {
      Taro.showToast({ title: '加载失败', icon: 'none' })
    }
  }

  if (loading && !detail) {
    return (
      <View className='district-page'>
        <View className='skeleton' style={{ height: '320px', borderRadius: 0 }} />
        <View className='district-page__content'>
          <View className='skeleton' style={{ height: '200px', marginBottom: '20px' }} />
          <View className='skeleton' style={{ height: '400px' }} />
        </View>
      </View>
    )
  }

  if (!detail) {
    return (
      <View className='district-page__empty'>
        <Text className='district-page__empty-text'>暂无该区域数据</Text>
      </View>
    )
  }

  const trend = detail.trend
  const min = Math.min(...trend)
  const max = Math.max(...trend)
  const range = max - min || 1

  return (
    <View className='district-page'>
      <View className='dhead'>
        <View className='dhead__top'>
          <View>
            <Text className='dhead__name'>{detail.name}</Text>
            <Text className='dhead__sub'>武汉 · 均价排行第 {detail.rank} 名</Text>
          </View>
          <View className={`dhead__change ${detail.changeRate >= 0 ? 'is-up' : 'is-down'}`}>
            <Icon
              name={detail.changeRate >= 0 ? 'arrow-up' : 'arrow-down'}
              size={20}
              color='#ffffff'
            />
            <Text className='dhead__change-text'>{Math.abs(detail.changeRate)}%</Text>
          </View>
        </View>

        <View className='dhead__prices'>
          <View className='dhead__price-item'>
            <Text className='dhead__price-label'>二手均价</Text>
            <View className='dhead__price-row'>
              <Text className='dhead__price-num'>{detail.avgSalePrice.toLocaleString()}</Text>
              <Text className='dhead__price-unit'>元/㎡</Text>
            </View>
          </View>
          <View className='dhead__divider' />
          <View className='dhead__price-item'>
            <Text className='dhead__price-label'>平均租金</Text>
            <View className='dhead__price-row'>
              <Text className='dhead__price-num'>{detail.avgRent.toLocaleString()}</Text>
              <Text className='dhead__price-unit'>元/月</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView scrollY className='district-page__scroll'>
        <View className='district-page__content'>
          {/* 关键指标 */}
          <View className='metrics'>
            <View className='metrics__item'>
              <Text className='metrics__value'>{detail.saleCount.toLocaleString()}</Text>
              <Text className='metrics__label'>在售房源</Text>
            </View>
            <View className='metrics__item'>
              <Text className='metrics__value'>{detail.rentCount.toLocaleString()}</Text>
              <Text className='metrics__label'>在租房源</Text>
            </View>
            <View className='metrics__item'>
              <Text className='metrics__value'>{detail.yieldRate}%</Text>
              <Text className='metrics__label'>租金回报</Text>
            </View>
            <View className='metrics__item'>
              <Text className='metrics__value'>{detail.metroLines.length}</Text>
              <Text className='metrics__label'>地铁线路</Text>
            </View>
          </View>

          {/* 走势 */}
          <View className='card'>
            <View className='card__head'>
              <Text className='card__title'>近 6 个月走势</Text>
              <Text className='card__sub'>元/㎡</Text>
            </View>
            <View className='bars'>
              {trend.map((v, i) => {
                const h = 40 + ((v - min) / range) * 140
                return (
                  <View key={i} className='bars__col'>
                    <Text className='bars__value'>{(v / 1000).toFixed(1)}</Text>
                    <View className='bars__bar-wrap'>
                      <View
                        className={`bars__bar ${i === trend.length - 1 ? 'is-last' : ''}`}
                        style={{ height: `${h}px` }}
                      />
                    </View>
                    <Text className='bars__label'>{MONTH_LABELS[i]}</Text>
                  </View>
                )
              })}
            </View>
          </View>

          {/* 板块与地铁 */}
          <View className='card'>
            <Text className='card__title'>热门板块</Text>
            <View className='chips'>
              {detail.businessAreas.map((a) => (
                <View
                  key={a}
                  className='chips__item tap'
                  onClick={() => {
                    Taro.setStorageSync('list-entry-params', `dealType=sale&district=${encodeURIComponent(detail.name)}&businessArea=${encodeURIComponent(a)}`)
                    Taro.switchTab({ url: '/pages/list/index' })
                  }}
                >
                  <Text className='chips__text'>{a}</Text>
                  <Icon name='chevron-right' size={20} color='#a5b2b7' />
                </View>
              ))}
            </View>
            <Text className='card__title card__title--gap'>经过地铁</Text>
            <View className='metro-row'>
              {detail.metroLines.map((m) => (
                <View key={m} className='metro-row__item'>
                  <Icon name='train' size={26} color='#0F766E' />
                  <Text className='metro-row__text'>{m}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* 房源列表 */}
          <View className='card card--plain'>
            <View className='card__head'>
              <Text className='card__title'>该区域房源</Text>
              <View className='seg'>
                <View
                  className={`seg__item ${dealType === 'sale' ? 'is-active' : ''}`}
                  onClick={() => switchType('sale')}
                >
                  <Text className='seg__text'>在售</Text>
                </View>
                <View
                  className={`seg__item ${dealType === 'rent' ? 'is-active' : ''}`}
                  onClick={() => switchType('rent')}
                >
                  <Text className='seg__text'>在租</Text>
                </View>
              </View>
            </View>
            {list.map((item) => (
              <PropertyCard key={item.id} item={item} />
            ))}
            <View
              className='card__more tap'
              onClick={() => {
                Taro.setStorageSync(
                  'list-entry-params',
                  `dealType=${dealType}&district=${encodeURIComponent(detail.name)}`
                )
                Taro.switchTab({ url: '/pages/list/index' })
              }}
            >
              <Text className='card__more-text'>查看全部 {detail.name} 房源</Text>
              <Icon name='chevron-right' size={22} color='#0F766E' />
            </View>
          </View>

          <View className='district-page__footer'>
            <Text className='district-page__footer-text'>数据为平台成交与服务参考价，不构成投资建议</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}
