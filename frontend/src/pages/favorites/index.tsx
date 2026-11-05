import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useDidShow, useRouter } from '@tarojs/taro'
import { useState } from 'react'
import Icon from '@/components/Icon'
import PropertyCard from '@/components/PropertyCard'
import { fetchFavorites, fetchHistory, toggleFavorite } from '@/services/property'
import type { PropertyListItem } from '@/types/property'
import './index.scss'

export default function Favorites() {
  const router = useRouter()
  const [tab, setTab] = useState<'favorite' | 'history'>(router.params.tab === 'history' ? 'history' : 'favorite')
  const [favorites, setFavorites] = useState<PropertyListItem[]>([])
  const [history, setHistory] = useState<PropertyListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [favIds, setFavIds] = useState<string[]>([])

  const load = async (current: 'favorite' | 'history') => {
    setLoading(true)
    try {
      if (current === 'favorite') {
        const res = await fetchFavorites()
        setFavorites(res.list)
        setFavIds(res.list.map((i) => i.id))
      } else {
        const res = await fetchHistory()
        setHistory(res.list)
      }
    } catch {
      Taro.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  useDidShow(() => {
    load(tab)
  })

  const switchTab = (next: 'favorite' | 'history') => {
    if (next === tab) return
    setTab(next)
    load(next)
  }

  const handleUnfavorite = async (id: string) => {
    try {
      const res = await toggleFavorite(id)
      setFavIds((prev) => (res.favorited ? [...prev, id] : prev.filter((x) => x !== id)))
      setFavorites((prev) => prev.filter((x) => x.id !== id))
      Taro.showToast({ title: res.message, icon: 'none' })
    } catch {
      Taro.showToast({ title: '操作失败', icon: 'none' })
    }
  }

  const currentList = tab === 'favorite' ? favorites : history

  return (
    <View className='fav'>
      <View className='fav__tabs'>
        <View className={`fav__tab ${tab === 'favorite' ? 'is-active' : ''}`} onClick={() => switchTab('favorite')}>
          <Text className='fav__tab-text'>我的收藏</Text>
          {favorites.length > 0 && (
            <View className='fav__tab-badge'>
              <Text className='fav__tab-badge-text'>{favorites.length}</Text>
            </View>
          )}
        </View>
        <View className={`fav__tab ${tab === 'history' ? 'is-active' : ''}`} onClick={() => switchTab('history')}>
          <Text className='fav__tab-text'>浏览历史</Text>
        </View>
      </View>

      <ScrollView scrollY className='fav__scroll'>
        <View className='fav__content'>
          {loading ? (
            [1, 2].map((i) => <View key={i} className='skeleton' style={{ height: '420px', marginBottom: '16px' }} />)
          ) : currentList.length === 0 ? (
            <View className='fav__empty'>
              <View className='fav__empty-circle'>
                <Icon name={tab === 'favorite' ? 'heart' : 'history'} size={56} color='#c3d2cf' />
              </View>
              <Text className='fav__empty-title'>{tab === 'favorite' ? '还没有收藏房源' : '还没有浏览记录'}</Text>
              <Text className='fav__empty-desc'>
                {tab === 'favorite' ? '看到心动的房子，点收藏方便对比' : '浏览过的房源会出现在这里'}
              </Text>
              <View
                className='fav__empty-btn tap'
                onClick={() => Taro.switchTab({ url: '/pages/list/index' })}
              >
                <Text className='fav__empty-btn-text'>去逛逛</Text>
              </View>
            </View>
          ) : (
            currentList.map((item) => (
              <PropertyCard
                key={item.id}
                item={item}
                showFavorite={tab === 'favorite'}
                favorited={favIds.includes(item.id)}
                onToggleFavorite={handleUnfavorite}
              />
            ))
          )}

          {!loading && currentList.length > 0 && (
            <View className='fav__tip'>
              <Text className='fav__tip-text'>
                {tab === 'favorite' ? '共 ' + currentList.length + ' 套收藏房源' : '仅保留最近 50 条浏览记录'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  )
}
