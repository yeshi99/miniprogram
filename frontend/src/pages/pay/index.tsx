import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useState } from 'react'
import Icon from '@/components/Icon'
import { fetchPayPackages, fetchPayStatus, createPayOrder, confirmPayOrder } from '@/services/property'
import { getStatusBarHeight } from '@/utils/layout'
import type { PayPackage, PayStatus } from '@/types/property'
import './index.scss'

export default function Pay() {
  const [statusBarHeight, setStatusBarHeight] = useState(0)
  const [status, setStatus] = useState<PayStatus | null>(null)
  const [packages, setPackages] = useState<PayPackage[]>([])
  const [selected, setSelected] = useState<string>('quarterly')
  const [paying, setPaying] = useState(false)

  useDidShow(() => {
    setStatusBarHeight(getStatusBarHeight())
    load()
  })

  const load = async () => {
    try {
      const [s, p] = await Promise.all([fetchPayStatus(), fetchPayPackages()])
      setStatus(s)
      setPackages(p.list)
      if (!p.list.some((x) => x.id === selected)) {
        setSelected(p.list.find((x) => x.best)?.id || p.list[0]?.id || '')
      }
    } catch {
      Taro.showToast({ title: '加载失败，请重试', icon: 'none' })
    }
  }

  const handlePay = async () => {
    const pkg = packages.find((p) => p.id === selected)
    if (!pkg || paying) return

    setPaying(true)
    try {
      // 模拟微信支付：确认 → 下单 → 支付回调
      const modal = await Taro.showModal({
        title: '确认支付',
        content: `开通「${pkg.name}」\n支付金额：¥${pkg.price.toFixed(2)}\n\n演示环境为模拟支付，不产生真实扣款`,
        confirmText: '确认支付',
        cancelText: '暂不开通',
      }).catch(() => ({ confirm: false, cancel: true }) as { confirm: boolean; cancel: boolean })

      if (!modal.confirm) return

      Taro.showLoading({ title: '拉起支付...', mask: true })
      const order = await createPayOrder(pkg.id)
      const result = await confirmPayOrder(order.orderId)
      Taro.hideLoading()

      await Taro.showModal({
        title: '支付成功',
        content: result.message + (result.remainDays ? `\n会员有效期剩余 ${result.remainDays} 天` : result.remaining != null ? `\n剩余可发布 ${result.remaining} 次` : ''),
        showCancel: false,
        confirmText: '知道了',
      }).catch(() => null)

      await load()
    } catch (e: any) {
      Taro.hideLoading()
      Taro.showToast({ title: e?.message || '支付失败，请重试', icon: 'none' })
    } finally {
      setPaying(false)
    }
  }

  const entLabel = () => {
    if (!status) return '加载中...'
    if (status.kind === 'membership') return `会员生效中 · 剩余 ${status.remainDays} 天，不限次发布`
    if (status.kind === 'quota') return `发布次数包 · 剩余 ${status.remaining} 次`
    return '尚未开通发布服务，付费后即可发布房源'
  }

  return (
    <View className='pay'>
      <View className='pay__navbar' style={{ paddingTop: `${statusBarHeight}px` }}>
        <Text className='pay__navbar-title'>发布服务</Text>
      </View>

      <ScrollView scrollY className='pay__scroll'>
        <View className='pay__content'>
          {/* 当前权益 */}
          <View className={`ent ${status?.entitled ? 'ent--ok' : ''}`}>
            <View className='ent__icon'>
              <Icon name={status?.entitled ? 'check' : 'shield'} size={44} color={status?.entitled ? '#0F766E' : '#94A3B8'} />
            </View>
            <View className='ent__info'>
              <Text className='ent__title'>{status?.entitled ? '已开通发布服务' : '未开通发布服务'}</Text>
              <Text className='ent__desc'>{entLabel()}</Text>
            </View>
          </View>

          {/* 套餐列表 */}
          <View className='pay__section'>
            <Text className='pay__section-title'>选择套餐</Text>
            {packages.map((pkg) => {
              const isSel = selected === pkg.id
              return (
                <View
                  key={pkg.id}
                  className={`pkg ${isSel ? 'is-selected' : ''}`}
                  onClick={() => setSelected(pkg.id)}
                >
                  <View className='pkg__radio'>{isSel && <View className='pkg__radio-inner' />}</View>
                  <View className='pkg__main'>
                    <View className='pkg__head'>
                      <View className='pkg__name-wrap'>
                        <Text className='pkg__name'>{pkg.name}</Text>
                        {pkg.best && <View className='pkg__badge'><Text className='pkg__badge-text'>超值推荐</Text></View>}
                      </View>
                      <View className='pkg__price'>
                        <Text className='pkg__price-symbol'>¥</Text>
                        <Text className='pkg__price-num'>{pkg.price.toFixed(2)}</Text>
                      </View>
                    </View>
                    <Text className='pkg__desc'>{pkg.desc}</Text>
                    <View className='pkg__highlights'>
                      {pkg.highlights.map((h) => (
                        <View key={h} className='pkg__highlight'>
                          <Icon name='check' size={20} color='#0F766E' />
                          <Text className='pkg__highlight-text'>{h}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              )
            })}
          </View>

          {/* 支付按钮 */}
          <View className={`pay__btn ${paying ? 'is-disabled' : ''}`} onClick={handlePay}>
            <Text className='pay__btn-text'>{paying ? '支付中...' : '立即开通'}</Text>
          </View>

          <View className='pay__tips'>
            <Icon name='shield' size={24} color='#A5B2B7' />
            <Text className='pay__tips-text'>
              支付后权益即时生效。会员期内不限次发布；次数包按条扣减。演示环境为模拟支付，不产生真实扣款。
            </Text>
          </View>

          {/* 交易记录 */}
          {status && status.orders.length > 0 && (
            <View className='pay__section'>
              <Text className='pay__section-title'>交易记录</Text>
              <View className='orders'>
                {status.orders.map((o) => (
                  <View key={o.id} className='orders__item'>
                    <View className='orders__info'>
                      <Text className='orders__name'>{o.packageName}</Text>
                      <Text className='orders__time'>{o.createdAt.slice(0, 19).replace('T', ' ')} · 单号 {o.id}</Text>
                    </View>
                    <View className='orders__right'>
                      <Text className='orders__amount'>¥{o.amount.toFixed(2)}</Text>
                      <Text className={`orders__status ${o.status === 'paid' ? 'is-paid' : ''}`}>
                        {o.status === 'paid' ? '已支付' : o.status === 'pending' ? '待支付' : '已取消'}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View className='pay__bottom-space' />
        </View>
      </ScrollView>
    </View>
  )
}
