import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useEffect, useState } from 'react'
import Icon, { IconName } from '@/components/Icon'
import { fetchUserOverview } from '@/services/property'
import { getStatusBarHeight } from '@/utils/layout'
import type { UserOverview } from '@/types/property'
import './index.scss'

interface MenuItem {
  key: string
  label: string
  desc?: string
  icon: IconName
  url?: string
  badgeKey?: 'favoriteCount' | 'listingCount' | 'historyCount' | 'demandCount'
}

const MENU_GROUPS: { title: string; items: MenuItem[] }[] = [
  {
    title: '我的房产',
    items: [
      { key: 'favorites', label: '我的收藏', icon: 'heart', url: '/pages/favorites/index', badgeKey: 'favoriteCount' },
      { key: 'listings', label: '我的发布', icon: 'list', url: '/pages/my-listings/index', badgeKey: 'listingCount' },
      { key: 'history', label: '浏览历史', icon: 'history', url: '/pages/favorites/index?tab=history', badgeKey: 'historyCount' },
      { key: 'demands', label: '我的需求', icon: 'message', url: '/pages/demand/index?tab=my', badgeKey: 'demandCount' },
    ],
  },
  {
    title: '常用工具',
    items: [
      { key: 'publish', label: '发布房源', desc: '房东 / 经纪人免费发布', icon: 'plus', url: '/pages/publish/index' },
      { key: 'calc', label: '房贷计算器', desc: '月供、首付、税费估算', icon: 'calc', url: '/pages/calculator/index' },
      { key: 'market', label: '武汉行情', desc: '13 个区域价格走势', icon: 'trend', url: '/pages/market/index' },
    ],
  },
  {
    title: '服务与帮助',
    items: [
      { key: 'service', label: '联系客服', icon: 'phone' },
      { key: 'about', label: '关于武汉租售', icon: 'shield' },
    ],
  },
]

export default function Mine() {
  const [overview, setOverview] = useState<UserOverview | null>(null)
  const [statusBarHeight, setStatusBarHeight] = useState(0)

  useEffect(() => {
    setStatusBarHeight(getStatusBarHeight())
  }, [])

  const load = async () => {
    try {
      const res = await fetchUserOverview()
      setOverview(res)
    } catch {
      // 静默失败，页面仍可用
    }
  }

  useDidShow(() => {
    load()
  })

  const handleMenu = (item: MenuItem) => {
    if (item.url) {
      const tabPages = ['/pages/market/index']
      if (tabPages.includes(item.url.split('?')[0])) {
        Taro.switchTab({ url: item.url.split('?')[0] })
      } else {
        Taro.navigateTo({ url: item.url })
      }
      return
    }
    if (item.key === 'service') {
      Taro.showModal({
        title: '联系客服',
        content: '客服热线：400-027-1000\n服务时间：每日 09:00 - 21:00\n\n演示环境不发起真实呼叫',
        showCancel: false,
        confirmText: '知道了',
      })
    }
    if (item.key === 'about') {
      Taro.showModal({
        title: '关于武汉租售',
        content: '武汉租售是一个聚焦武汉本地的租房与买房信息平台，房源覆盖 13 个行政区。所有房源信息仅供决策参考，实际签约前请核验产权与合同。',
        showCancel: false,
        confirmText: '了解',
      })
    }
  }

  const badgeValue = (key?: MenuItem['badgeKey']) => {
    if (!key || !overview) return 0
    return overview[key] || 0
  }

  return (
    <View className='mine'>
      <View className='mine__header' style={{ paddingTop: statusBarHeight ? `${statusBarHeight + 20}px` : '36px' }}>
        <View className='profile'>
          <View className='profile__avatar'>
            <Text className='profile__avatar-text'>{overview?.avatarText || '武'}</Text>
          </View>
          <View className='profile__body'>
            <Text className='profile__name'>{overview?.nickname || '看房小助手'}</Text>
            <View className='profile__level'>
              <Icon name='star' size={20} color='#e07b00' />
              <Text className='profile__level-text'>{overview?.memberLevel || '看房会员 · 体验版'}</Text>
            </View>
          </View>
          <View className='profile__city'>
            <Icon name='location' size={22} color='#ffffff' />
            <Text className='profile__city-text'>{overview?.city || '武汉'}</Text>
          </View>
        </View>

        <View className='stats'>
          <View className='stats__item tap' onClick={() => Taro.navigateTo({ url: '/pages/favorites/index' })}>
            <Text className='stats__num'>{overview?.favoriteCount ?? 0}</Text>
            <Text className='stats__label'>收藏</Text>
          </View>
          <View className='stats__divider' />
          <View className='stats__item tap' onClick={() => Taro.navigateTo({ url: '/pages/my-listings/index' })}>
            <Text className='stats__num'>{overview?.listingCount ?? 0}</Text>
            <Text className='stats__label'>发布</Text>
          </View>
          <View className='stats__divider' />
          <View className='stats__item tap' onClick={() => Taro.navigateTo({ url: '/pages/favorites/index?tab=history' })}>
            <Text className='stats__num'>{overview?.historyCount ?? 0}</Text>
            <Text className='stats__label'>浏览</Text>
          </View>
          <View className='stats__divider' />
          <View className='stats__item tap' onClick={() => Taro.navigateTo({ url: '/pages/demand/index?tab=my' })}>
            <Text className='stats__num'>{overview?.demandCount ?? 0}</Text>
            <Text className='stats__label'>需求</Text>
          </View>
        </View>
      </View>

      <ScrollView scrollY className='mine__scroll'>
        <View className='mine__content'>
          {/* 主 CTA */}
          <View className='cta tap' onClick={() => Taro.navigateTo({ url: '/pages/publish/index' })}>
            <View className='cta__left'>
              <Text className='cta__title'>有房源要出租或出售？</Text>
              <Text className='cta__desc'>免费发布，最快 1 小时获得曝光</Text>
            </View>
            <View className='cta__btn'>
              <Text className='cta__btn-text'>立刻发布</Text>
            </View>
          </View>

          {MENU_GROUPS.map((group) => (
            <View key={group.title} className='menu'>
              <Text className='menu__title'>{group.title}</Text>
              <View className='menu__card'>
                {group.items.map((item, idx) => (
                  <View
                    key={item.key}
                    className={`menu__row tap ${idx === group.items.length - 1 ? 'is-last' : ''}`}
                    onClick={() => handleMenu(item)}
                  >
                    <View className='menu__icon'>
                      <Icon name={item.icon} size={32} color='#0F766E' />
                    </View>
                    <View className='menu__body'>
                      <Text className='menu__label'>{item.label}</Text>
                      {item.desc ? <Text className='menu__desc'>{item.desc}</Text> : null}
                    </View>
                    {badgeValue(item.badgeKey) > 0 && (
                      <View className='menu__badge'>
                        <Text className='menu__badge-text'>{badgeValue(item.badgeKey)}</Text>
                      </View>
                    )}
                    <Icon name='chevron-right' size={24} color='#c2cfcc' />
                  </View>
                ))}
              </View>
            </View>
          ))}

          <View className='mine__footer'>
            <Text className='mine__footer-text'>武汉租售 v1.0.0</Text>
            <Text className='mine__footer-sub'>房源信息由发布者提供，平台已做基础核验</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}
