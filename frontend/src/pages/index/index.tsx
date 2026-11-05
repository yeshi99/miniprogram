import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useEffect, useState } from 'react'
import Icon from '@/components/Icon'
import PropertyCard from '@/components/PropertyCard'
import PropertyCover from '@/components/PropertyCover'
import { fetchDistricts, fetchRecommend, toggleFavorite } from '@/services/property'
import { getStatusBarHeight } from '@/utils/layout'
import type { DealType, DistrictStat, PropertyListItem } from '@/types/property'
import './index.scss'

const QUICK_ENTRIES = [
  { key: 'nearby', label: '附近房源', icon: 'location' as const },
  { key: 'metro', label: '地铁找房', icon: 'train' as const },
  { key: 'school', label: '学区房', icon: 'building' as const },
  { key: 'new', label: '最新上架', icon: 'fire' as const },
]

const HOT_AREAS = ['光谷', '徐东', '后湖', '南湖', '王家湾', '盘龙城', '光谷中心城', '钟家村']

export default function Index() {
  const [dealType, setDealType] = useState<DealType>('rent')
  const [districts, setDistricts] = useState<DistrictStat[]>([])
  const [recommend, setRecommend] = useState<PropertyListItem[]>([])
  const [newest, setNewest] = useState<PropertyListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState<string[]>([])
  const [statusBarHeight, setStatusBarHeight] = useState(0)

  useEffect(() => {
    setStatusBarHeight(getStatusBarHeight())
  }, [])

  const loadData = async (type: DealType) => {
    setLoading(true)
    try {
      const [d, rec, nw] = await Promise.all([
        fetchDistricts(),
        fetchRecommend({ dealType: type, limit: 4 }),
        fetchRecommend({ dealType: type, limit: 4, onlyNewest: true }),
      ])
      setDistricts(d.list)
      setRecommend(rec.list)
      setNewest(nw.list)
    } catch {
      Taro.showToast({ title: '加载失败，请稍后重试', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData(dealType)
  }, [dealType])

  useDidShow(() => {
    const saved = Taro.getStorageSync('favorites') || []
    setFavorites(saved)
  })

  const goList = (params: Record<string, string> = {}) => {
    const query = Object.entries({ dealType, ...params })
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join('&')
    Taro.setStorageSync('list-entry-params', query)
    Taro.switchTab({ url: '/pages/list/index' })
  }

  const handleQuickEntry = (key: string) => {
    if (key === 'nearby') return goList({ sort: 'default' })
    if (key === 'metro') return goList({ maxMetroDistance: '500' })
    if (key === 'school') return goList({ keyword: '学区' })
    return goList({ sort: 'newest' })
  }

  const handleToggleFavorite = async (id: string) => {
    try {
      const res = await toggleFavorite(id)
      const next = res.favorited ? [...favorites, id] : favorites.filter((x) => x !== id)
      setFavorites(next)
      Taro.setStorageSync('favorites', next)
      Taro.showToast({ title: res.message, icon: 'none' })
    } catch {
      Taro.showToast({ title: '操作失败', icon: 'none' })
    }
  }

  return (
    <View className='home'>
      {/* 顶部品牌与搜索区 */}
      <View className='hero' style={{ paddingTop: statusBarHeight ? `${statusBarHeight + 12}px` : '24px' }}>
        <View className='hero__brand'>
          <View className='hero__logo'>
            <Text className='hero__logo-text'>武</Text>
          </View>
          <View className='hero__brand-text'>
            <Text className='hero__title'>武汉租售</Text>
            <Text className='hero__subtitle'>江城房源 · 一站直达</Text>
          </View>
          <View className='hero__city'>
            <Icon name='location' size={24} color='#ffffff' />
            <Text className='hero__city-text'>武汉</Text>
          </View>
        </View>

        <View className='segmented'>
          <View
            className={`segmented__item ${dealType === 'rent' ? 'is-active' : ''}`}
            onClick={() => setDealType('rent')}
          >
            <Text className='segmented__text'>租房</Text>
          </View>
          <View
            className={`segmented__item ${dealType === 'sale' ? 'is-active' : ''}`}
            onClick={() => setDealType('sale')}
          >
            <Text className='segmented__text'>买房</Text>
          </View>
        </View>

        <View
          className='searchbar tap'
          onClick={() => Taro.navigateTo({ url: `/pages/search/index?dealType=${dealType}` })}
        >
          <Icon name='search' size={32} color='#7a8a8f' />
          <Text className='searchbar__placeholder'>
            {dealType === 'rent' ? '小区 / 商圈 / 地铁站，如「光谷」' : '小区 / 学区 / 地铁站，如「徐东」'}
          </Text>
          <View className='searchbar__btn'>
            <Text className='searchbar__btn-text'>搜索</Text>
          </View>
        </View>

        <View className='hero__stat'>
          <View className='hero__stat-main'>
            <Text className='hero__stat-label'>武汉 {dealType === 'rent' ? '平均租金' : '参考均价'}</Text>
            <View className='hero__stat-value-row'>
              <Text className='hero__stat-value'>{dealType === 'rent' ? '2,049' : '16,669'}</Text>
              <Text className='hero__stat-unit'>{dealType === 'rent' ? '元/月' : '元/㎡'}</Text>
            </View>
          </View>
          <View className='hero__stat-change'>
            <Icon name='trend' size={22} color='#ffffff' />
            <Text className='hero__stat-change-text'>近半年 +0.26%</Text>
          </View>
        </View>
      </View>

      <ScrollView scrollY className='home__scroll'>
        <View className='home__content'>
          <View className='quick'>
            {QUICK_ENTRIES.map((q) => (
              <View key={q.key} className='quick__item tap' onClick={() => handleQuickEntry(q.key)}>
                <View className='quick__icon'>
                  <Icon name={q.icon} size={40} color='#0F766E' />
                </View>
                <Text className='quick__label'>{q.label}</Text>
              </View>
            ))}
          </View>

          {/* 热门片区 */}
          <View className='section'>
            <View className='section__head'>
              <Text className='section__title'>热门片区</Text>
              <View className='section__more tap' onClick={() => goList()}>
                <Text className='section__more-text'>全部房源</Text>
                <Icon name='chevron-right' size={22} color='#7a8a8f' />
              </View>
            </View>
            <View className='hotarea'>
              {HOT_AREAS.map((area, i) => (
                <View key={area} className='hotarea__item tap' onClick={() => goList({ businessArea: area })}>
                  <View className={`hotarea__rank ${i < 3 ? 'is-top' : ''}`}>
                    <Text className='hotarea__rank-text'>{i + 1}</Text>
                  </View>
                  <Text className='hotarea__name'>{area}</Text>
                  <Text className='hotarea__count'>{`${18 + ((i * 37) % 90)} 套`}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* 区域均价 */}
          <View className='section'>
            <View className='section__head'>
              <Text className='section__title'>区域均价</Text>
              <View className='section__more tap' onClick={() => Taro.switchTab({ url: '/pages/market/index' })}>
                <Text className='section__more-text'>看行情</Text>
                <Icon name='chevron-right' size={22} color='#7a8a8f' />
              </View>
            </View>
            <ScrollView scrollX className='district-scroll'>
              <View className='district-row'>
                {districts.slice(0, 8).map((d) => (
                  <View
                    key={d.name}
                    className='district-card tap'
                    onClick={() =>
                      Taro.navigateTo({ url: `/pages/district/index?name=${encodeURIComponent(d.name)}` })
                    }
                  >
                    <Text className='district-card__name'>{d.name}</Text>
                    <View className='district-card__price'>
                      <Text className='district-card__num price-num'>{(d.avgSalePrice / 10000).toFixed(2)}</Text>
                      <Text className='district-card__unit'>万/㎡</Text>
                    </View>
                    <View className={`district-card__change ${d.changeRate >= 0 ? 'is-up' : 'is-down'}`}>
                      <Icon
                        name={d.changeRate >= 0 ? 'arrow-up' : 'arrow-down'}
                        size={18}
                        color={d.changeRate >= 0 ? '#e04f3d' : '#12a67a'}
                      />
                      <Text className='district-card__change-text'>{Math.abs(d.changeRate)}%</Text>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* 推荐房源 */}
          <View className='section'>
            <View className='section__head'>
              <Text className='section__title'>{dealType === 'rent' ? '严选好房' : '优选好房'}</Text>
              <View className='section__badge'>
                <Icon name='shield' size={20} color='#0F766E' />
                <Text className='section__badge-text'>实勘核验</Text>
              </View>
            </View>

            {loading ? (
              <View>
                {[1, 2].map((i) => (
                  <View key={i} className='skeleton-card'>
                    <View className='skeleton skeleton-card__img' />
                    <View className='skeleton-card__body'>
                      <View className='skeleton skeleton-card__line' style={{ width: '70%' }} />
                      <View className='skeleton skeleton-card__line' style={{ width: '45%' }} />
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              recommend.map((item) => (
                <PropertyCard
                  key={item.id}
                  item={item}
                  showFavorite
                  favorited={favorites.includes(item.id)}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))
            )}
          </View>

          {/* 最新上架 */}
          <View className='section'>
            <View className='section__head'>
              <Text className='section__title'>最新上架</Text>
              <View className='section__more tap' onClick={() => goList({ sort: 'newest' })}>
                <Text className='section__more-text'>查看更多</Text>
                <Icon name='chevron-right' size={22} color='#7a8a8f' />
              </View>
            </View>
            <View className='grid2'>
              {newest.map((item) => (
                <PropertyCard key={item.id} item={item} variant='grid' />
              ))}
            </View>
          </View>

          {/* 学区专题 */}
          <View className='banner tap' onClick={() => goList({ keyword: '学区' })}>
            <PropertyCover seed={3} ratio='wide' className='banner__cover' />
            <View className='banner__mask'>
              <View className='banner__tag'>
                <Text className='banner__tag-text'>武汉学区指南</Text>
              </View>
              <Text className='banner__title'>武昌 / 江岸优质学区房合集</Text>
              <Text className='banner__desc'>对口小学 + 初中双学区，47 个小区成交参考</Text>
              <View className='banner__action'>
                <Text className='banner__action-text'>立即查看</Text>
                <Icon name='chevron-right' size={20} color='#0F766E' />
              </View>
            </View>
          </View>

          <View className='home__footer'>
            <Text className='home__footer-text'>房源信息仅供参考，以实际看房与产权核验为准</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}
