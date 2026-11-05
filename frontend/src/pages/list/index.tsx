import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useDidShow, useReachBottom } from '@tarojs/taro'
import { useCallback, useEffect, useState } from 'react'
import Icon from '@/components/Icon'
import PropertyCard from '@/components/PropertyCard'
import { fetchDistricts, fetchPropertyList, toggleFavorite } from '@/services/property'
import type { DealType, DistrictStat, PropertyListItem } from '@/types/property'
import './index.scss'

type SortKey = 'default' | 'priceAsc' | 'priceDesc' | 'newest'

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'default', label: '综合排序' },
  { key: 'newest', label: '最新发布' },
  { key: 'priceAsc', label: '价格从低到高' },
  { key: 'priceDesc', label: '价格从高到低' },
]

const RENT_PRICE_STEPS = [
  { min: 0, max: 1500, label: '1500以下' },
  { min: 1500, max: 2500, label: '1500-2500' },
  { min: 2500, max: 4000, label: '2500-4000' },
  { min: 4000, max: 6000, label: '4000-6000' },
  { min: 6000, max: undefined, label: '6000以上' },
]

const SALE_PRICE_STEPS = [
  { min: 0, max: 100, label: '100万以下' },
  { min: 100, max: 150, label: '100-150万' },
  { min: 150, max: 200, label: '150-200万' },
  { min: 200, max: 300, label: '200-300万' },
  { min: 300, max: undefined, label: '300万以上' },
]

const ROOM_OPTIONS = [
  { value: 1, label: '1室' },
  { value: 2, label: '2室' },
  { value: 3, label: '3室' },
  { value: 4, label: '4室+' },
]

const AREA_OPTIONS = [
  { min: 0, max: 50, label: '50㎡以下' },
  { min: 50, max: 70, label: '50-70㎡' },
  { min: 70, max: 90, label: '70-90㎡' },
  { min: 90, max: 120, label: '90-120㎡' },
  { min: 120, max: undefined, label: '120㎡以上' },
]

const ORIENTATION_OPTIONS = ['朝南', '南北通透', '东南', '西南']
const FACILITY_OPTIONS = ['电梯', '近地铁', '精装', '拎包入住', '免中介费', '实勘']

interface FilterPanel {
  district?: string
  businessArea?: string
  priceIdx?: number
  rooms: number[]
  areaIdx?: number
  orientation?: string
  rentType?: '整租' | '合租'
  maxMetroDistance?: number
  facilities: string[]
}

export default function List() {
  const [dealType, setDealType] = useState<DealType>('rent')
  const [sort, setSort] = useState<SortKey>('default')
  const [showSort, setShowSort] = useState(false)
  const [activePanel, setActivePanel] = useState<'district' | 'price' | 'more' | null>(null)
  const [districts, setDistricts] = useState<DistrictStat[]>([])
  const [selectedDistrict, setSelectedDistrict] = useState<string>()
  const [selectedArea, setSelectedArea] = useState<string>()

  const [filter, setFilter] = useState<FilterPanel>({ rooms: [], facilities: [] })
  const [draft, setDraft] = useState<FilterPanel>({ rooms: [], facilities: [] })

  const [list, setList] = useState<PropertyListItem[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState<string[]>([])

  const priceSteps = dealType === 'rent' ? RENT_PRICE_STEPS : SALE_PRICE_STEPS

  useEffect(() => {
    fetchDistricts()
      .then((d) => setDistricts(d.list))
      .catch(() => {})
  }, [])

  // 从首页/搜索页带参进入
  useDidShow(() => {
    const saved = Taro.getStorageSync('favorites') || []
    setFavorites(saved)

    const entry = Taro.getStorageSync('list-entry-params')
    if (entry) {
      Taro.removeStorageSync('list-entry-params')
      const params = new URLSearchParams(entry)
      const type = (params.get('dealType') as DealType) || 'rent'
      setDealType(type)
      setSelectedDistrict(params.get('district') || undefined)
      setSelectedArea(params.get('businessArea') || undefined)
      setSort((params.get('sort') as SortKey) || 'default')

      const nextFilter: FilterPanel = { rooms: [], facilities: [] }
      const kw = params.get('keyword') || undefined
      const districtParam = params.get('district') || undefined
      const areaParam = params.get('businessArea') || undefined
      const sortParam = (params.get('sort') as SortKey) || 'default'
      const metroParam = params.get('maxMetroDistance')
      if (metroParam) nextFilter.maxMetroDistance = Number(metroParam)
      setFilter(nextFilter)
      setPage(1)
      loadList(1, nextFilter, {
        type,
        district: districtParam,
        area: areaParam,
        sort: sortParam,
        keyword: kw,
      })
      return
    }

    if (list.length === 0) loadList(1, filter, { type: dealType, district: selectedDistrict, area: selectedArea, sort })
  })

  const buildQuery = (f: FilterPanel, opts: { type: DealType; district?: string; area?: string; sort: SortKey; keyword?: string }) => {
    const steps = opts.type === 'rent' ? RENT_PRICE_STEPS : SALE_PRICE_STEPS
    const priceStep = f.priceIdx !== undefined ? steps[f.priceIdx] : undefined
    const areaStep = f.areaIdx !== undefined ? AREA_OPTIONS[f.areaIdx] : undefined

    return {
      page: 1,
      limit: 10,
      dealType: opts.type,
      district: opts.district,
      businessArea: opts.area,
      rooms: f.rooms.length > 0 ? f.rooms : undefined,
      priceRange: priceStep ? { min: priceStep.min, max: priceStep.max } : undefined,
      areaRange: areaStep ? { min: areaStep.min, max: areaStep.max } : undefined,
      orientation: f.orientation,
      rentType: opts.type === 'rent' ? f.rentType : undefined,
      maxMetroDistance: f.maxMetroDistance,
      facilities: f.facilities.length > 0 ? f.facilities : undefined,
      sort: opts.sort,
      keyword: opts.keyword,
    }
  }

  const loadList = useCallback(
    async (
      targetPage: number,
      f: FilterPanel,
      opts: { type: DealType; district?: string; area?: string; sort: SortKey; keyword?: string }
    ) => {
      setLoading(true)
      try {
        const query = buildQuery(f, opts)
        const res = await fetchPropertyList({ ...query, page: targetPage })
        setList((prev) => (targetPage === 1 ? res.list : [...prev, ...res.list]))
        setHasMore(res.pagination.hasMore)
        setTotal(res.pagination.total)
        setPage(targetPage)
      } catch {
        Taro.showToast({ title: '加载失败', icon: 'none' })
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const refresh = (nextFilter: FilterPanel, opts?: Partial<{ type: DealType; district?: string; area?: string; sort: SortKey }>) => {
    loadList(1, nextFilter, {
      type: opts?.type ?? dealType,
      district: opts && 'district' in opts ? opts.district : selectedDistrict,
      area: opts && 'area' in opts ? opts.area : selectedArea,
      sort: opts?.sort ?? sort,
    })
  }

  useReachBottom(() => {
    if (!hasMore || loading) return
    loadList(page + 1, filter, { type: dealType, district: selectedDistrict, area: selectedArea, sort })
  })

  const switchDealType = (type: DealType) => {
    if (type === dealType) return
    setDealType(type)
    setFilter({ rooms: [], facilities: [] })
    setDraft({ rooms: [], facilities: [] })
    refresh({ rooms: [], facilities: [] }, { type })
  }

  const openPanel = (panel: 'district' | 'price' | 'more') => {
    if (activePanel === panel) {
      setActivePanel(null)
      return
    }
    setDraft({ ...filter })
    setActivePanel(panel)
    setShowSort(false)
  }

  const selectDistrict = (name?: string) => {
    setSelectedDistrict(name)
    setSelectedArea(undefined)
    refresh(filter, { district: name, area: undefined })
  }

  const confirmPanel = () => {
    setFilter(draft)
    setActivePanel(null)
    refresh(draft)
  }

  const resetDraft = () => setDraft({ rooms: [], facilities: [] })

  const toggleSort = (key: SortKey) => {
    setSort(key)
    setShowSort(false)
    refresh(filter, { sort: key })
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

  const activePriceLabel =
    filter.priceIdx !== undefined ? priceSteps[filter.priceIdx].label : undefined
  const moreCount = filter.rooms.length + (filter.areaIdx !== undefined ? 1 : 0) + (filter.orientation ? 1 : 0) + (filter.facilities.length ? 1 : 0) + (filter.maxMetroDistance ? 1 : 0)

  return (
    <View className='list-page'>
      {/* 顶部类型切换 */}
      <View className='list-top'>
        <View className='list-top__types'>
          <View
            className={`list-top__type ${dealType === 'rent' ? 'is-active' : ''}`}
            onClick={() => switchDealType('rent')}
          >
            <Text className='list-top__type-text'>租房</Text>
          </View>
          <View
            className={`list-top__type ${dealType === 'sale' ? 'is-active' : ''}`}
            onClick={() => switchDealType('sale')}
          >
            <Text className='list-top__type-text'>买房</Text>
          </View>
        </View>
        <View className='list-top__search tap' onClick={() => Taro.navigateTo({ url: `/pages/search/index?dealType=${dealType}` })}>
          <Icon name='search' size={28} color='#7a8a8f' />
          <Text className='list-top__search-text'>搜索小区 / 地铁</Text>
        </View>
      </View>

      {/* 筛选栏 */}
      <View className='filterbar'>
        <View
          className={`filterbar__item ${activePanel === 'district' ? 'is-open' : ''} ${selectedDistrict ? 'is-active' : ''}`}
          onClick={() => openPanel('district')}
        >
          <Text className='filterbar__text'>{selectedArea || selectedDistrict || '区域'}</Text>
          <Icon name='chevron-down' size={20} color={selectedDistrict ? '#0F766E' : '#7a8a8f'} />
        </View>
        <View
          className={`filterbar__item ${activePanel === 'price' ? 'is-open' : ''} ${activePriceLabel ? 'is-active' : ''}`}
          onClick={() => openPanel('price')}
        >
          <Text className='filterbar__text'>{activePriceLabel || '价格'}</Text>
          <Icon name='chevron-down' size={20} color={activePriceLabel ? '#0F766E' : '#7a8a8f'} />
        </View>
        <View
          className={`filterbar__item ${activePanel === 'more' ? 'is-open' : ''} ${moreCount > 0 ? 'is-active' : ''}`}
          onClick={() => openPanel('more')}
        >
          <Text className='filterbar__text'>{moreCount > 0 ? `更多(${moreCount})` : '更多'}</Text>
          <Icon name='chevron-down' size={20} color={moreCount > 0 ? '#0F766E' : '#7a8a8f'} />
        </View>
        <View className='filterbar__item' onClick={() => { setShowSort(!showSort); setActivePanel(null) }}>
          <Icon name='sort' size={24} color={sort !== 'default' ? '#0F766E' : '#7a8a8f'} />
          <Text className='filterbar__text'>{SORTS.find((s) => s.key === sort)?.label.replace('价格从低到高', '低到高').replace('价格从高到低', '高到低')}</Text>
        </View>
      </View>

      {/* 结果统计 */}
      <View className='result-bar'>
        <Text className='result-bar__count'>
          共 <Text className='result-bar__num'>{total}</Text> 套房源
        </Text>
        <Text className='result-bar__hint'>武汉 · {dealType === 'rent' ? '整租/合租' : '二手房'}</Text>
      </View>

      {/* 列表 */}
      <ScrollView scrollY className='list-scroll'>
        <View className='list-content'>
          {loading && page === 1 ? (
            [1, 2, 3].map((i) => (
              <View key={i} className='skeleton-card'>
                <View className='skeleton skeleton-card__img' />
                <View className='skeleton-card__body'>
                  <View className='skeleton skeleton-card__line' style={{ width: '80%' }} />
                  <View className='skeleton skeleton-card__line' style={{ width: '55%' }} />
                  <View className='skeleton skeleton-card__line' style={{ width: '35%' }} />
                </View>
              </View>
            ))
          ) : list.length === 0 ? (
            <View className='empty'>
              <View className='empty__circle'>
                <Icon name='search' size={56} color='#c3d2cf' />
              </View>
              <Text className='empty__title'>没有找到符合条件的房源</Text>
              <Text className='empty__desc'>试试放宽价格或减少筛选条件</Text>
            </View>
          ) : (
            list.map((item) => (
              <PropertyCard
                key={item.id}
                item={item}
                showFavorite
                favorited={favorites.includes(item.id)}
                onToggleFavorite={handleToggleFavorite}
              />
            ))
          )}

          {!loading && list.length > 0 && (
            <View className='load-more'>
              <Text className='load-more__text'>{hasMore ? '上拉加载更多' : '已经到底了'}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* 遮罩 */}
      {(activePanel || showSort) && <View className='mask' onClick={() => { setActivePanel(null); setShowSort(false) }} />}

      {/* 排序面板 */}
      {showSort && (
        <View className='panel panel--sort'>
          {SORTS.map((s) => (
            <View key={s.key} className={`panel__sort-item ${sort === s.key ? 'is-active' : ''}`} onClick={() => toggleSort(s.key)}>
              <Text className='panel__sort-text'>{s.label}</Text>
              {sort === s.key && <Icon name='check' size={28} color='#0F766E' />}
            </View>
          ))}
        </View>
      )}

      {/* 区域面板 */}
      {activePanel === 'district' && (
        <View className='panel'>
          <ScrollView scrollY className='panel__scroll'>
            <View className='panel__body'>
              <View className='district-picker'>
                <ScrollView scrollY className='district-picker__left'>
                  <View className='district-picker__left-inner'>
                    <View
                      className={`district-picker__tab ${!selectedDistrict ? 'is-active' : ''}`}
                      onClick={() => selectDistrict(undefined)}
                    >
                      <Text className='district-picker__tab-text'>不限</Text>
                    </View>
                    {districts.map((d) => (
                      <View
                        key={d.name}
                        className={`district-picker__tab ${selectedDistrict === d.name ? 'is-active' : ''}`}
                        onClick={() => {
                          setSelectedDistrict(d.name)
                          setSelectedArea(undefined)
                        }}
                      >
                        <Text className='district-picker__tab-text'>{d.name}</Text>
                      </View>
                    ))}
                  </View>
                </ScrollView>
                <ScrollView scrollY className='district-picker__right'>
                  <View className='district-picker__right-inner'>
                    <View className='district-picker__option' onClick={() => {
                      setSelectedArea(undefined)
                      refresh(filter, { district: selectedDistrict, area: undefined })
                      setActivePanel(null)
                    }}>
                      <Text className='district-picker__option-text'>全区</Text>
                    </View>
                    {(selectedDistrict ? AREA_MAP[selectedDistrict] || [] : []).map((area) => (
                      <View
                        key={area}
                        className={`district-picker__option ${selectedArea === area ? 'is-active' : ''}`}
                        onClick={() => {
                          setSelectedArea(area)
                          refresh(filter, { district: selectedDistrict, area })
                          setActivePanel(null)
                        }}
                      >
                        <Text className='district-picker__option-text'>{area}</Text>
                      </View>
                    ))}
                    {!selectedDistrict && (
                      <View className='district-picker__tip'>
                        <Text className='district-picker__tip-text'>请选择左侧行政区查看片区</Text>
                      </View>
                    )}
                  </View>
                </ScrollView>
              </View>
            </View>
          </ScrollView>
        </View>
      )}

      {/* 价格面板 */}
      {activePanel === 'price' && (
        <View className='panel'>
          <View className='panel__body'>
            <Text className='panel__label'>价格区间（{dealType === 'rent' ? '元/月' : '万元'}）</Text>
            <View className='chip-grid'>
              {priceSteps.map((step, idx) => (
                <View
                  key={step.label}
                  className={`chip ${draft.priceIdx === idx ? 'is-active' : ''}`}
                  onClick={() => setDraft({ ...draft, priceIdx: draft.priceIdx === idx ? undefined : idx })}
                >
                  <Text className='chip__text'>{step.label}</Text>
                </View>
              ))}
            </View>
            <View className='panel__actions'>
              <View className='panel__btn panel__btn--ghost' onClick={resetDraft}>
                <Text className='panel__btn-text'>重置</Text>
              </View>
              <View className='panel__btn panel__btn--primary' onClick={confirmPanel}>
                <Text className='panel__btn-text panel__btn-text--light'>确定</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* 更多筛选 */}
      {activePanel === 'more' && (
        <View className='panel'>
          <ScrollView scrollY className='panel__scroll'>
            <View className='panel__body'>
              <Text className='panel__label'>户型</Text>
              <View className='chip-grid'>
                {ROOM_OPTIONS.map((r) => (
                  <View
                    key={r.value}
                    className={`chip ${draft.rooms.includes(r.value) ? 'is-active' : ''}`}
                    onClick={() =>
                      setDraft({
                        ...draft,
                        rooms: draft.rooms.includes(r.value)
                          ? draft.rooms.filter((x) => x !== r.value)
                          : [...draft.rooms, r.value],
                      })
                    }
                  >
                    <Text className='chip__text'>{r.label}</Text>
                  </View>
                ))}
              </View>

              <Text className='panel__label'>面积</Text>
              <View className='chip-grid'>
                {AREA_OPTIONS.map((a, idx) => (
                  <View
                    key={a.label}
                    className={`chip ${draft.areaIdx === idx ? 'is-active' : ''}`}
                    onClick={() => setDraft({ ...draft, areaIdx: draft.areaIdx === idx ? undefined : idx })}
                  >
                    <Text className='chip__text'>{a.label}</Text>
                  </View>
                ))}
              </View>

              <Text className='panel__label'>朝向</Text>
              <View className='chip-grid'>
                {ORIENTATION_OPTIONS.map((o) => (
                  <View
                    key={o}
                    className={`chip ${draft.orientation === o ? 'is-active' : ''}`}
                    onClick={() => setDraft({ ...draft, orientation: draft.orientation === o ? undefined : o })}
                  >
                    <Text className='chip__text'>{o}</Text>
                  </View>
                ))}
              </View>

              {dealType === 'rent' && (
                <>
                  <Text className='panel__label'>租赁方式</Text>
                  <View className='chip-grid'>
                    {(['整租', '合租'] as const).map((rt) => (
                      <View
                        key={rt}
                        className={`chip ${draft.rentType === rt ? 'is-active' : ''}`}
                        onClick={() => setDraft({ ...draft, rentType: draft.rentType === rt ? undefined : rt })}
                      >
                        <Text className='chip__text'>{rt}</Text>
                      </View>
                    ))}
                  </View>
                </>
              )}

              <Text className='panel__label'>特色</Text>
              <View className='chip-grid'>
                {FACILITY_OPTIONS.map((f) => (
                  <View
                    key={f}
                    className={`chip ${draft.facilities.includes(f) ? 'is-active' : ''}`}
                    onClick={() =>
                      setDraft({
                        ...draft,
                        facilities: draft.facilities.includes(f)
                          ? draft.facilities.filter((x) => x !== f)
                          : [...draft.facilities, f],
                      })
                    }
                  >
                    <Text className='chip__text'>{f}</Text>
                  </View>
                ))}
              </View>

              <Text className='panel__label'>距地铁</Text>
              <View className='chip-grid'>
                {[
                  { label: '500米内', value: 500 },
                  { label: '1公里内', value: 1000 },
                  { label: '2公里内', value: 2000 },
                ].map((m) => (
                  <View
                    key={m.value}
                    className={`chip ${draft.maxMetroDistance === m.value ? 'is-active' : ''}`}
                    onClick={() =>
                      setDraft({ ...draft, maxMetroDistance: draft.maxMetroDistance === m.value ? undefined : m.value })
                    }
                  >
                    <Text className='chip__text'>{m.label}</Text>
                  </View>
                ))}
              </View>

              <View className='panel__actions'>
                <View className='panel__btn panel__btn--ghost' onClick={resetDraft}>
                  <Text className='panel__btn-text'>重置</Text>
                </View>
                <View className='panel__btn panel__btn--primary' onClick={confirmPanel}>
                  <Text className='panel__btn-text panel__btn-text--light'>确定</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      )}
    </View>
  )
}

const AREA_MAP: Record<string, string[]> = {
  江岸区: ['后湖', '二七路', '台北香港路', '百步亭', '谌家矶'],
  江汉区: ['CBD西北湖', '唐家墩', '万松园', '常青路', '新华路'],
  硚口区: ['古田', '宗关', '汉正街', '宝丰', '长丰'],
  汉阳区: ['王家湾', '钟家村', '四新', '沌口', '鹦鹉洲'],
  武昌区: ['中南丁字桥', '徐东', '积玉桥', '水果湖', '南湖'],
  洪山区: ['光谷', '关山', '街道口', '珞狮南路', '白沙洲'],
  青山区: ['青山建二', '红卫路', '工人村', '武东'],
  东湖高新区: ['光谷中心城', '花山', '左岭', '光谷东'],
  东西湖区: ['金银湖', '吴家山', '常青花园', '径河'],
  蔡甸区: ['蔡甸城关', '中法生态城', '奓山'],
  江夏区: ['纸坊', '藏龙岛', '庙山', '大桥新区'],
  黄陂区: ['前川', '盘龙城', '汉口北', '武湖'],
  新洲区: ['阳逻', '邾城', '双柳'],
}
