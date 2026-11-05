import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useState } from 'react'
import Icon from '@/components/Icon'
import PropertyCover from '@/components/PropertyCover'
import { fetchMyListings, updatePublishStatus } from '@/services/property'
import { relativeTime } from '@/utils/layout'
import type { MyListing } from '@/types/property'
import './index.scss'

export default function MyListings() {
  const [list, setList] = useState<MyListing[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetchMyListings()
      setList(res.list)
    } catch {
      Taro.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  useDidShow(() => {
    load()
  })

  const toggleStatus = async (item: MyListing) => {
    const next = item.status === 'online' ? 'offline' : 'online'
    Taro.showModal({
      title: next === 'online' ? '重新上架' : '下架房源',
      content: next === 'online' ? '上架后房源将重新展示给用户' : '下架后房源将不再展示，可随时重新上架',
      success: async (res) => {
        if (!res.confirm) return
        try {
          const r = await updatePublishStatus(item.id, next)
          setList((prev) => prev.map((x) => (x.id === item.id ? { ...x, status: next } : x)))
          Taro.showToast({ title: r.message, icon: 'none' })
        } catch {
          Taro.showToast({ title: '操作失败', icon: 'none' })
        }
      },
    })
  }

  return (
    <View className='mylist'>
      <ScrollView scrollY className='mylist__scroll'>
        <View className='mylist__content'>
          {loading ? (
            [1, 2].map((i) => <View key={i} className='skeleton' style={{ height: '300px', marginBottom: '16px' }} />)
          ) : list.length === 0 ? (
            <View className='mylist__empty'>
              <View className='mylist__empty-circle'>
                <Icon name='list' size={56} color='#c3d2cf' />
              </View>
              <Text className='mylist__empty-title'>还没有发布房源</Text>
              <Text className='mylist__empty-desc'>发布房源后可在这里管理上下架</Text>
              <View className='mylist__empty-btn tap' onClick={() => Taro.navigateTo({ url: '/pages/publish/index' })}>
                <Text className='mylist__empty-btn-text'>去发布</Text>
              </View>
            </View>
          ) : (
            list.map((item) => (
              <View key={item.id} className='item'>
                <View className='item__head'>
                  <View className='item__media'>
                    <PropertyCover seed={item.imageSeed} ratio='square' />
                  </View>
                  <View className='item__body'>
                    <View className='item__title-row'>
                      <Text className='item__title ellipsis-2'>{item.title}</Text>
                      <View className={`item__status ${item.status === 'online' ? 'is-online' : 'is-offline'}`}>
                        <Text className='item__status-text'>
                          {item.status === 'online' ? '展示中' : '已下架'}
                        </Text>
                      </View>
                    </View>
                    <Text className='item__meta'>
                      {item.layout} · {item.area}㎡ · {item.district}{item.businessArea}
                    </Text>
                    <View className='item__price-row'>
                      <Text className='item__price'>
                        {item.dealType === 'rent' ? `${item.price} 元/月` : `${item.price} 万`}
                      </Text>
                      <Text className='item__date'>{relativeTime(item.publishDate)}</Text>
                    </View>
                  </View>
                </View>

                <View className='item__actions'>
                  <View className='item__id'>
                    <Text className='item__id-text'>编号 {item.id}</Text>
                  </View>
                  <View className='item__btns'>
                    <View
                      className='item__btn item__btn--ghost tap'
                      onClick={() => Taro.navigateTo({ url: `/pages/detail/index?id=${item.id}` })}
                    >
                      <Text className='item__btn-text'>查看</Text>
                    </View>
                    <View
                      className={`item__btn tap ${item.status === 'online' ? 'item__btn--warn' : 'item__btn--primary'}`}
                      onClick={() => toggleStatus(item)}
                    >
                      <Text
                        className={`item__btn-text ${item.status === 'online' ? 'item__btn-text--warn' : 'item__btn-text--light'}`}
                      >
                        {item.status === 'online' ? '下架' : '上架'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  )
}
