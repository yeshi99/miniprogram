import { View, Text, Swiper, SwiperItem, ScrollView } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useEffect, useState } from 'react'
import Icon from '@/components/Icon'
import PropertyCover from '@/components/PropertyCover'
import PropertyCard from '@/components/PropertyCard'
import { fetchFavoriteStatus, fetchPropertyDetail, fetchSimilar, recordView, toggleFavorite } from '@/services/property'
import { relativeTime } from '@/utils/layout'
import type { PropertyDetail, PropertyListItem } from '@/types/property'
import './index.scss'

const TABS = [
  { key: 'info', label: '房源信息' },
  { key: 'facility', label: '配套' },
  { key: 'location', label: '位置' },
]

export default function Detail() {
  const router = useRouter()
  const id = router.params.id || ''

  const [detail, setDetail] = useState<PropertyDetail | null>(null)
  const [similar, setSimilar] = useState<PropertyListItem[]>([])
  const [favorited, setFavorited] = useState(false)
  const [loading, setLoading] = useState(true)
  const [current, setCurrent] = useState(0)
  const [tab, setTab] = useState('info')

  useEffect(() => {
    if (!id) return
    const load = async () => {
      setLoading(true)
      try {
        const [d, s] = await Promise.all([fetchPropertyDetail(id), fetchSimilar(id, 4)])
        setDetail(d)
        setSimilar(s.list)
        recordView(id)
        const fs = await fetchFavoriteStatus(id)
        setFavorited(fs.favorited)
      } catch {
        Taro.showToast({ title: '房源不存在或已下架', icon: 'none' })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const handleFavorite = async () => {
    try {
      const res = await toggleFavorite(id)
      setFavorited(res.favorited)
      const saved: string[] = Taro.getStorageSync('favorites') || []
      const next = res.favorited ? [...saved.filter((x) => x !== id), id] : saved.filter((x) => x !== id)
      Taro.setStorageSync('favorites', next)
      Taro.showToast({ title: res.message, icon: 'none' })
    } catch {
      Taro.showToast({ title: '操作失败', icon: 'none' })
    }
  }

  const handleCall = () => {
    if (!detail) return
    const phone = detail.agent.phone
    Taro.showModal({
      title: '联系经纪人',
      content: `${detail.agent.name} · ${detail.agent.company}\n电话：${phone}\n\n演示环境不发起真实通话`,
      confirmText: '复制号码',
      cancelText: '关闭',
      success: (res) => {
        if (res.confirm) {
          Taro.setClipboardData({ data: phone })
        }
      },
    })
  }

  const handleConsult = () => {
    if (!detail) return
    Taro.showModal({
      title: '在线咨询',
      content: `已向 ${detail.agent.name} 发起咨询，经纪人将尽快回复。演示环境不提供实时聊天。`,
      showCancel: false,
      confirmText: '知道了',
    })
  }

  if (loading) {
    return (
      <View className='detail detail--loading'>
        <View className='skeleton skeleton-gallery' />
        <View className='detail__body'>
          <View className='skeleton' style={{ height: '48px', width: '70%', marginBottom: '20px' }} />
          <View className='skeleton' style={{ height: '32px', width: '45%', marginBottom: '16px' }} />
          <View className='skeleton' style={{ height: '32px', width: '60%' }} />
        </View>
      </View>
    )
  }

  if (!detail) {
    return (
      <View className='detail__empty'>
        <Text className='detail__empty-text'>房源不存在或已下架</Text>
        <View className='detail__empty-btn' onClick={() => Taro.navigateBack()}>
          <Text className='detail__empty-btn-text'>返回</Text>
        </View>
      </View>
    )
  }

  const isRent = detail.dealType === 'rent'
  const priceLabel = isRent ? `${detail.price.toLocaleString()}` : `${detail.price}`
  const priceUnit = isRent ? '元/月' : '万'

  return (
    <View className='detail'>
      {/* 图集 */}
      <View className='gallery'>
        <Swiper
          className='gallery__swiper'
          circular
          indicatorDots={false}
          onChange={(e) => setCurrent(e.detail.current)}
        >
          {detail.gallery.map((g) => (
            <SwiperItem key={g.seed}>
              <View className='gallery__slide'>
                <PropertyCover seed={g.seed} ratio='tall' />
                <View className='gallery__type'>
                  <Text className='gallery__type-text'>{g.type}</Text>
                </View>
              </View>
            </SwiperItem>
          ))}
        </Swiper>
        <View className='gallery__counter'>
          <Text className='gallery__counter-text'>{current + 1} / {detail.gallery.length}</Text>
        </View>
        <View className='gallery__back tap' onClick={() => Taro.navigateBack()}>
          <Icon name='chevron-right' size={34} color='#ffffff' className='gallery__back-icon' />
        </View>
      </View>

      <ScrollView scrollY className='detail__scroll'>
        <View className='detail__body'>
          {/* 价格与标题 */}
          <View className='pricebox'>
            <View className='pricebox__row'>
              <View className='pricebox__main'>
                <Text className='pricebox__num price-num'>{priceLabel}</Text>
                <Text className='pricebox__unit'>{priceUnit}</Text>
                {detail.unitPrice ? <Text className='pricebox__unit-price'>{detail.unitPrice} 元/㎡</Text> : null}
              </View>
              <View className='pricebox__badge'>
                <Icon name='shield' size={22} color='#0F766E' />
                <Text className='pricebox__badge-text'>已实勘</Text>
              </View>
            </View>
            <Text className='pricebox__title'>{detail.title}</Text>

            <View className='pricebox__specs'>
              <View className='pricebox__spec'>
                <Text className='pricebox__spec-num'>{detail.rooms}</Text>
                <Text className='pricebox__spec-label'>室</Text>
              </View>
              <View className='pricebox__spec-divider' />
              <View className='pricebox__spec'>
                <Text className='pricebox__spec-num'>{detail.halls}</Text>
                <Text className='pricebox__spec-label'>厅</Text>
              </View>
              <View className='pricebox__spec-divider' />
              <View className='pricebox__spec'>
                <Text className='pricebox__spec-num'>{detail.area}</Text>
                <Text className='pricebox__spec-label'>㎡</Text>
              </View>
              <View className='pricebox__spec-divider' />
              <View className='pricebox__spec'>
                <Text className='pricebox__spec-num'>{detail.floor}</Text>
                <Text className='pricebox__spec-label'>/{detail.totalFloors}层</Text>
              </View>
              <View className='pricebox__spec-divider' />
              <View className='pricebox__spec'>
                <Text className='pricebox__spec-num-small'>{detail.orientation}</Text>
              </View>
            </View>

            <View className='pricebox__tags'>
              {detail.tags.map((t) => (
                <View key={t} className='tag tag--primary'>
                  <Text className='tag__text tag__text--primary'>{t}</Text>
                </View>
              ))}
              <View className='tag'>
                <Text className='tag__text'>{detail.decoration}</Text>
              </View>
              {detail.elevator && (
                <View className='tag'>
                  <Text className='tag__text'>电梯</Text>
                </View>
              )}
              {detail.rentType && (
                <View className='tag'>
                  <Text className='tag__text'>{detail.rentType}</Text>
                </View>
              )}
            </View>
          </View>

          {/* 费用 */}
          {isRent && (
            <View className='card fee'>
              <View className='card__head'>
                <Text className='card__title'>费用明细</Text>
              </View>
              <View className='fee__rows'>
                <View className='fee__row'>
                  <Text className='fee__label'>月租金</Text>
                  <Text className='fee__value'>¥{detail.price.toLocaleString()}</Text>
                </View>
                <View className='fee__row'>
                  <Text className='fee__label'>押金</Text>
                  <Text className='fee__value'>¥{detail.deposit.toLocaleString()}</Text>
                </View>
                <View className='fee__row'>
                  <Text className='fee__label'>服务费</Text>
                  <Text className='fee__value'>
                    {detail.tags.includes('免中介费') ? '免中介费' : `¥${detail.serviceFee.toLocaleString()}`}
                  </Text>
                </View>
                <View className='fee__row'>
                  <Text className='fee__label'>付款方式</Text>
                  <Text className='fee__value'>押一付三</Text>
                </View>
              </View>
            </View>
          )}

          {/* 租售对比 */}
          <View className='card compare'>
            <View className='card__head'>
              <Text className='card__title'>同小区租售参考</Text>
              <Text className='card__sub'>{detail.community}</Text>
            </View>
            <View className='compare__row'>
              <View className='compare__item'>
                <Text className='compare__label'>二手房参考单价</Text>
                <Text className='compare__value'>
                  {detail.communityCompare.salePrice ? `${detail.communityCompare.salePrice} 元/㎡` : '暂无成交'}
                </Text>
              </View>
              <View className='compare__divider' />
              <View className='compare__item'>
                <Text className='compare__label'>同户型月租金</Text>
                <Text className='compare__value'>
                  {detail.communityCompare.rentPrice ? `${detail.communityCompare.rentPrice} 元/月` : '暂无在租'}
                </Text>
              </View>
            </View>
            {detail.communityCompare.salePrice && detail.communityCompare.rentPrice ? (
              <View className='compare__note'>
                <Text className='compare__note-text'>
                  按 90㎡ 估算，该小区年租金回报约{' '}
                  {(
                    ((detail.communityCompare.rentPrice * 12) / (detail.communityCompare.salePrice * 90)) *
                    100
                  ).toFixed(2)}
                  %，低于武汉平均水平，更适合自住需求。
                </Text>
              </View>
            ) : null}
          </View>

          {/* Tab 区块 */}
          <View className='card tabcard'>
            <View className='tabs'>
              {TABS.map((t) => (
                <View
                  key={t.key}
                  className={`tabs__item ${tab === t.key ? 'is-active' : ''}`}
                  onClick={() => setTab(t.key)}
                >
                  <Text className='tabs__text'>{t.label}</Text>
                </View>
              ))}
            </View>

            {tab === 'info' && (
              <View className='info'>
                <View className='info__grid'>
                  {[
                    { label: '建筑面积', value: `${detail.area} ㎡` },
                    { label: '户型', value: detail.layout },
                    { label: '楼层', value: `${detail.floor}/${detail.totalFloors} 层` },
                    { label: '朝向', value: detail.orientation },
                    { label: '装修', value: detail.decoration },
                    { label: '电梯', value: detail.elevator ? '有' : '无' },
                    { label: '挂牌时间', value: relativeTime(detail.publishDate) },
                    { label: '浏览', value: `${detail.viewCount} 次` },
                  ].map((row) => (
                    <View key={row.label} className='info__cell'>
                      <Text className='info__cell-label'>{row.label}</Text>
                      <Text className='info__cell-value'>{row.value}</Text>
                    </View>
                  ))}
                </View>
                <View className='info__desc'>
                  <Text className='info__desc-title'>房源描述</Text>
                  <Text className='info__desc-text'>{detail.description}</Text>
                </View>
              </View>
            )}

            {tab === 'facility' && (
              <View className='facility'>
                <View className='facility__grid'>
                  {detail.facilities.map((f) => (
                    <View key={f} className='facility__item'>
                      <View className='facility__icon'>
                        <Icon name='check' size={22} color='#0F766E' />
                      </View>
                      <Text className='facility__text'>{f}</Text>
                    </View>
                  ))}
                </View>
                <View className='facility__nearby'>
                  <Text className='facility__nearby-title'>周边配套</Text>
                  {[
                    { name: '地铁站', desc: `${detail.metroLine} ${detail.metroStation}，步行约 ${Math.round(detail.metroDistance / 70)} 分钟`, icon: 'train' as const },
                    { name: '商业', desc: '大型商超 800m，社区菜场 300m', icon: 'building' as const },
                    { name: '教育', desc: '对口小学 1.2km，幼儿园 400m', icon: 'star' as const },
                    { name: '医疗', desc: '社区卫生服务中心 900m，三甲医院 3.5km', icon: 'shield' as const },
                  ].map((n) => (
                    <View key={n.name} className='facility__nearby-row'>
                      <View className='facility__nearby-icon'>
                        <Icon name={n.icon} size={30} color='#0F766E' />
                      </View>
                      <View className='facility__nearby-body'>
                        <Text className='facility__nearby-name'>{n.name}</Text>
                        <Text className='facility__nearby-desc'>{n.desc}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {tab === 'location' && (
              <View className='location'>
                <View className='map'>
                  <View className='map__grid' />
                  <View className='map__road map__road--h' />
                  <View className='map__road map__road--v' />
                  <View className='map__river' />
                  <View className='map__pin'>
                    <View className='map__pin-dot' />
                    <View className='map__pin-label'>
                      <Text className='map__pin-text'>{detail.community}</Text>
                    </View>
                  </View>
                  <View className='map__metro'>
                    <Icon name='train' size={26} color='#0F766E' />
                    <Text className='map__metro-text'>{detail.metroStation}</Text>
                  </View>
                </View>
                <View className='location__rows'>
                  <View className='location__row'>
                    <Icon name='location' size={30} color='#7a8a8f' />
                    <Text className='location__text'>{detail.address}</Text>
                  </View>
                  <View className='location__row'>
                    <Icon name='train' size={30} color='#7a8a8f' />
                    <Text className='location__text'>
                      {detail.metroLine} · {detail.metroStation}，直线距离 {detail.metroDistance}m
                    </Text>
                  </View>
                  <View className='location__row'>
                    <Icon name='compass' size={30} color='#7a8a8f' />
                    <Text className='location__text'>
                      坐标 {detail.coordinates.lat}, {detail.coordinates.lng}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* 经纪人 */}
          <View className='card agent'>
            <View className='agent__head'>
              <View className='agent__avatar'>
                <Text className='agent__avatar-text'>{detail.agent.avatarText}</Text>
              </View>
              <View className='agent__info'>
                <View className='agent__name-row'>
                  <Text className='agent__name'>{detail.agent.name}</Text>
                  <View className='agent__rating'>
                    <Icon name='star' size={20} color='#e07b00' />
                    <Text className='agent__rating-text'>{detail.agent.rating}</Text>
                  </View>
                </View>
                <Text className='agent__company'>{detail.agent.company}</Text>
                <Text className='agent__stat'>
                  从业 {detail.agent.years} 年 · 成交 {detail.agent.dealCount} 套
                </Text>
              </View>
            </View>
            <View className='agent__actions'>
              <View className='agent__btn agent__btn--ghost' onClick={handleConsult}>
                <Icon name='message' size={30} color='#0F766E' />
                <Text className='agent__btn-text'>在线咨询</Text>
              </View>
              <View className='agent__btn agent__btn--primary' onClick={handleCall}>
                <Icon name='phone' size={30} color='#ffffff' />
                <Text className='agent__btn-text agent__btn-text--light'>电话联系</Text>
              </View>
            </View>
          </View>

          {/* 相似房源 */}
          {similar.length > 0 && (
            <View className='similar'>
              <View className='card__head'>
                <Text className='card__title'>相似房源</Text>
                <Text className='card__sub'>同片区 · 同价位</Text>
              </View>
              {similar.map((item) => (
                <PropertyCard key={item.id} item={item} />
              ))}
            </View>
          )}

          <View className='detail__footer-note'>
            <Text className='detail__footer-text'>
              房源信息由发布者提供，平台已做基础核验。请勿在签约前支付任何费用。
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* 底部操作栏 */}
      <View className='actionbar'>
        <View className='actionbar__icon-btn' onClick={handleFavorite}>
          <Icon name={favorited ? 'heart-fill' : 'heart'} size={40} color={favorited ? '#e07b00' : '#7a8a8f'} />
          <Text className='actionbar__icon-text'>{favorited ? '已收藏' : '收藏'}</Text>
        </View>
        <View
          className='actionbar__icon-btn'
          onClick={() => Taro.navigateTo({ url: `/pages/calculator/index?price=${detail.price}&dealType=${detail.dealType}` })}
        >
          <Icon name='calc' size={40} color='#7a8a8f' />
          <Text className='actionbar__icon-text'>算月供</Text>
        </View>
        <View className='actionbar__main'>
          <View className='actionbar__main-btn' onClick={handleConsult}>
            <Text className='actionbar__main-text'>在线咨询</Text>
          </View>
          <View className='actionbar__main-btn actionbar__main-btn--primary' onClick={handleCall}>
            <Text className='actionbar__main-text actionbar__main-text--light'>电话联系</Text>
          </View>
        </View>
      </View>
    </View>
  )
}
