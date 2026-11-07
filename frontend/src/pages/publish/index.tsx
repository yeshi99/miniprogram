import { View, Text, Input, Textarea, ScrollView } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useState } from 'react'
import Icon from '@/components/Icon'
import { publishProperty, fetchPayStatus } from '@/services/property'
import type { DealType, PayStatus } from '@/types/property'
import './index.scss'

const DISTRICT_AREAS: Record<string, string[]> = {
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

const ORIENTATIONS = ['南北通透', '朝南', '朝东南', '朝西南', '朝东', '朝西', '朝北']
const DECORATIONS = ['精装', '简装', '豪装', '毛坯']
const FACILITIES = ['电梯', '燃气', '宽带', '洗衣机', '冰箱', '空调', '热水器', '衣柜', '床', '沙发', '电视', '阳台', '车位', '智能门锁']

export default function Publish() {
  const [step, setStep] = useState(1)
  const [dealType, setDealType] = useState<DealType>('rent')

  // 表单字段
  const [title, setTitle] = useState('')
  const [district, setDistrict] = useState('')
  const [businessArea, setBusinessArea] = useState('')
  const [community, setCommunity] = useState('')
  const [address, setAddress] = useState('')
  const [price, setPrice] = useState('')
  const [area, setArea] = useState('')
  const [rooms, setRooms] = useState(2)
  const [halls, setHalls] = useState(1)
  const [floor, setFloor] = useState('')
  const [totalFloors, setTotalFloors] = useState('')
  const [orientation, setOrientation] = useState('南北通透')
  const [decoration, setDecoration] = useState('精装')
  const [rentType, setRentType] = useState<'整租' | '合租'>('整租')
  const [metroLine, setMetroLine] = useState('')
  const [metroStation, setMetroStation] = useState('')
  const [facilities, setFacilities] = useState<string[]>(['电梯', '燃气', '空调'])
  const [description, setDescription] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [payStatus, setPayStatus] = useState<PayStatus | null>(null)

  useDidShow(() => {
    fetchPayStatus()
      .then(setPayStatus)
      .catch(() => setPayStatus(null))
  })

  /** 权益描述文案 */
  const entitlementText = () => {
    if (!payStatus) return ''
    if (payStatus.kind === 'membership') return `会员生效中 · 剩余 ${payStatus.remainDays} 天`
    if (payStatus.kind === 'quota') return `次数包 · 剩余 ${payStatus.remaining} 次`
    return ''
  }

  /** 未开通发布服务时引导去付费页 */
  const guideToPay = () => {
    Taro.showModal({
      title: '需要开通发布服务',
      content: '平台实行付费发布：开通会员或购买次数包后即可发布房源信息。\n\n是否前往开通？',
      confirmText: '去开通',
      cancelText: '暂不开通',
    })
      .then((m) => {
        if (m.confirm) Taro.navigateTo({ url: '/pages/pay/index' }).catch(() => {})
      })
      .catch(() => {})
  }

  const validateStep1 = () => {
    if (!title.trim() || title.trim().length < 4) {
      Taro.showToast({ title: '标题至少 4 个字', icon: 'none' })
      return false
    }
    if (!district || !businessArea) {
      Taro.showToast({ title: '请选择行政区与片区', icon: 'none' })
      return false
    }
    if (!community.trim()) {
      Taro.showToast({ title: '请填写小区名称', icon: 'none' })
      return false
    }
    if (!price || Number(price) <= 0) {
      Taro.showToast({ title: '请填写有效价格', icon: 'none' })
      return false
    }
    if (!area || Number(area) <= 0) {
      Taro.showToast({ title: '请填写建筑面积', icon: 'none' })
      return false
    }
    return true
  }

  const handleNext = () => {
    if (!validateStep1()) return
    setStep(2)
  }

  const handleSubmit = async () => {
    if (payStatus && !payStatus.entitled) {
      guideToPay()
      return
    }
    if (!contactName.trim()) {
      Taro.showToast({ title: '请填写联系人', icon: 'none' })
      return
    }
    if (!/^1[3-9]\d{9}$/.test(contactPhone)) {
      Taro.showToast({ title: '请填写正确的手机号', icon: 'none' })
      return
    }

    setSubmitting(true)
    try {
      const res = await publishProperty({
        title: title.trim(),
        dealType,
        district,
        businessArea,
        community: community.trim(),
        address: address.trim(),
        price: Number(price),
        area: Number(area),
        rooms,
        halls,
        floor: Number(floor) || 1,
        totalFloors: Number(totalFloors) || 18,
        orientation,
        decoration,
        rentType: dealType === 'rent' ? rentType : undefined,
        metroLine,
        metroStation,
        facilities,
        description: description.trim(),
        contactName: contactName.trim(),
        contactPhone,
      })
      // 注意：showModal 的 confirmText 不能超过 4 个字，且需捕获异常避免未处理 Promise 拒绝
      const modal = await Taro.showModal({
        title: '发布成功',
        content: `${res.message}\n房源编号：${res.id}`,
        showCancel: false,
        confirmText: '查看',
        cancelText: '留着',
      }).catch(() => ({ confirm: true, cancel: false }) as { confirm: boolean; cancel: boolean })

      if (modal.confirm) {
        try {
          await Taro.redirectTo({ url: '/pages/my-listings/index' })
        } catch {
          // 跳转失败不影响发布结果
        }
      }
    } catch (e: any) {
      if (e?.statusCode === 403) {
        guideToPay()
      } else {
        Taro.showToast({ title: e?.message || '发布失败，请检查表单', icon: 'none' })
      }
    } finally {
      setSubmitting(false)
    }
  }

  const toggleFacility = (f: string) => {
    setFacilities((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]))
  }

  const areas = district ? DISTRICT_AREAS[district] || [] : []

  return (
    <View className='publish'>
      {/* 付费权益提示 */}
      {payStatus && !payStatus.entitled && (
        <View className='pay-banner pay-banner--warn' onClick={guideToPay}>
          <Icon name='shield' size={30} color='#E07B00' />
          <Text className='pay-banner__text'>发布房源需先开通发布服务（会员 / 次数包）</Text>
          <Text className='pay-banner__btn'>去开通</Text>
        </View>
      )}
      {payStatus?.entitled && (
        <View className='pay-banner pay-banner--ok'>
          <Icon name='check' size={30} color='#0F766E' />
          <Text className='pay-banner__text'>{entitlementText()}，可直接发布</Text>
        </View>
      )}

      {/* 步骤条 */}
      <View className='steps'>
        <View className='steps__row'>
          <View className={`steps__dot ${step >= 1 ? 'is-active' : ''}`}>
            <Text className='steps__dot-text'>1</Text>
          </View>
          <View className={`steps__line ${step >= 2 ? 'is-active' : ''}`} />
          <View className={`steps__dot ${step >= 2 ? 'is-active' : ''}`}>
            <Text className='steps__dot-text'>2</Text>
          </View>
        </View>
        <View className='steps__labels'>
          <Text className='steps__label'>房源信息</Text>
          <Text className='steps__label'>联系人</Text>
        </View>
      </View>

      <ScrollView scrollY className='publish__scroll'>
        <View className='publish__content'>
          {step === 1 ? (
            <View>
              <View className='card'>
                <Text className='card__title'>基本类型</Text>
                <View className='seg'>
                  <View
                    className={`seg__item ${dealType === 'rent' ? 'is-active' : ''}`}
                    onClick={() => setDealType('rent')}
                  >
                    <Text className='seg__text'>出租</Text>
                  </View>
                  <View
                    className={`seg__item ${dealType === 'sale' ? 'is-active' : ''}`}
                    onClick={() => setDealType('sale')}
                  >
                    <Text className='seg__text'>出售</Text>
                  </View>
                </View>
              </View>

              <View className='card'>
                <Text className='card__title'>房源标题</Text>
                <Input
                  className='field__input'
                  value={title}
                  placeholder='如：光谷保利时代 精装2居 近地铁2号线'
                  placeholderClass='field__placeholder'
                  maxlength={60}
                  onInput={(e) => setTitle(e.detail.value)}
                />
                <Text className='field__hint'>{title.length}/60，建议包含小区、户型、核心卖点</Text>
              </View>

              <View className='card'>
                <Text className='card__title'>位置</Text>

                <View className='field'>
                  <Text className='field__label'>行政区</Text>
                  <View className='selector'>
                    {Object.keys(DISTRICT_AREAS).map((d) => (
                      <View
                        key={d}
                        className={`selector__chip ${district === d ? 'is-active' : ''}`}
                        onClick={() => {
                          setDistrict(d)
                          setBusinessArea('')
                        }}
                      >
                        <Text className='selector__chip-text'>{d}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {areas.length > 0 && (
                  <View className='field'>
                    <Text className='field__label'>片区 / 商圈</Text>
                    <View className='selector'>
                      {areas.map((a) => (
                        <View
                          key={a}
                          className={`selector__chip ${businessArea === a ? 'is-active' : ''}`}
                          onClick={() => setBusinessArea(a)}
                        >
                          <Text className='selector__chip-text'>{a}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                <View className='field'>
                  <Text className='field__label'>小区名称</Text>
                  <Input
                    className='field__input'
                    value={community}
                    placeholder='如：保利时代'
                    placeholderClass='field__placeholder'
                    onInput={(e) => setCommunity(e.detail.value)}
                  />
                </View>

                <View className='field'>
                  <Text className='field__label'>详细地址（选填）</Text>
                  <Input
                    className='field__input'
                    value={address}
                    placeholder='楼栋单元门牌，仅自己与经纪人可见'
                    placeholderClass='field__placeholder'
                    onInput={(e) => setAddress(e.detail.value)}
                  />
                </View>
              </View>

              <View className='card'>
                <Text className='card__title'>价格与面积</Text>
                <View className='field-row'>
                  <View className='field-row__item'>
                    <Text className='field__label'>{dealType === 'rent' ? '月租金（元）' : '总价（万元）'}</Text>
                    <Input
                      className='field__input'
                      type='digit'
                      value={price}
                      placeholder={dealType === 'rent' ? '如 2800' : '如 168'}
                      placeholderClass='field__placeholder'
                      onInput={(e) => setPrice(e.detail.value)}
                    />
                  </View>
                  <View className='field-row__item'>
                    <Text className='field__label'>建筑面积（㎡）</Text>
                    <Input
                      className='field__input'
                      type='digit'
                      value={area}
                      placeholder='如 88'
                      placeholderClass='field__placeholder'
                      onInput={(e) => setArea(e.detail.value)}
                    />
                  </View>
                </View>

                <View className='field'>
                  <Text className='field__label'>户型</Text>
                  <View className='counter-row'>
                    <View className='counter'>
                      <View className='counter__btn' onClick={() => setRooms(Math.max(1, rooms - 1))}>
                        <Text className='counter__btn-text'>−</Text>
                      </View>
                      <Text className='counter__value'>{rooms} 室</Text>
                      <View className='counter__btn' onClick={() => setRooms(Math.min(9, rooms + 1))}>
                        <Text className='counter__btn-text'>+</Text>
                      </View>
                    </View>
                    <View className='counter'>
                      <View className='counter__btn' onClick={() => setHalls(Math.max(0, halls - 1))}>
                        <Text className='counter__btn-text'>−</Text>
                      </View>
                      <Text className='counter__value'>{halls} 厅</Text>
                      <View className='counter__btn' onClick={() => setHalls(Math.min(5, halls + 1))}>
                        <Text className='counter__btn-text'>+</Text>
                      </View>
                    </View>
                  </View>
                </View>

                <View className='field-row'>
                  <View className='field-row__item'>
                    <Text className='field__label'>所在楼层</Text>
                    <Input
                      className='field__input'
                      type='number'
                      value={floor}
                      placeholder='如 12'
                      placeholderClass='field__placeholder'
                      onInput={(e) => setFloor(e.detail.value)}
                    />
                  </View>
                  <View className='field-row__item'>
                    <Text className='field__label'>总楼层</Text>
                    <Input
                      className='field__input'
                      type='number'
                      value={totalFloors}
                      placeholder='如 26'
                      placeholderClass='field__placeholder'
                      onInput={(e) => setTotalFloors(e.detail.value)}
                    />
                  </View>
                </View>
              </View>

              <View className='card'>
                <Text className='card__title'>朝向与装修</Text>
                <View className='field'>
                  <Text className='field__label'>朝向</Text>
                  <View className='selector'>
                    {ORIENTATIONS.map((o) => (
                      <View
                        key={o}
                        className={`selector__chip ${orientation === o ? 'is-active' : ''}`}
                        onClick={() => setOrientation(o)}
                      >
                        <Text className='selector__chip-text'>{o}</Text>
                      </View>
                    ))}
                  </View>
                </View>
                <View className='field'>
                  <Text className='field__label'>装修</Text>
                  <View className='selector'>
                    {DECORATIONS.map((d) => (
                      <View
                        key={d}
                        className={`selector__chip ${decoration === d ? 'is-active' : ''}`}
                        onClick={() => setDecoration(d)}
                      >
                        <Text className='selector__chip-text'>{d}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {dealType === 'rent' && (
                  <View className='field'>
                    <Text className='field__label'>租赁方式</Text>
                    <View className='selector'>
                      {(['整租', '合租'] as const).map((rt) => (
                        <View
                          key={rt}
                          className={`selector__chip ${rentType === rt ? 'is-active' : ''}`}
                          onClick={() => setRentType(rt)}
                        >
                          <Text className='selector__chip-text'>{rt}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>

              <View className='card'>
                <Text className='card__title'>交通与配套</Text>
                <View className='field-row'>
                  <View className='field-row__item'>
                    <Text className='field__label'>地铁线路</Text>
                    <Input
                      className='field__input'
                      value={metroLine}
                      placeholder='如 2号线'
                      placeholderClass='field__placeholder'
                      onInput={(e) => setMetroLine(e.detail.value)}
                    />
                  </View>
                  <View className='field-row__item'>
                    <Text className='field__label'>地铁站</Text>
                    <Input
                      className='field__input'
                      value={metroStation}
                      placeholder='如 光谷广场'
                      placeholderClass='field__placeholder'
                      onInput={(e) => setMetroStation(e.detail.value)}
                    />
                  </View>
                </View>
                <View className='field'>
                  <Text className='field__label'>房屋配套</Text>
                  <View className='selector'>
                    {FACILITIES.map((f) => (
                      <View
                        key={f}
                        className={`selector__chip ${facilities.includes(f) ? 'is-active' : ''}`}
                        onClick={() => toggleFacility(f)}
                      >
                        <Text className='selector__chip-text'>{f}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>

              <View className='card'>
                <Text className='card__title'>房源描述</Text>
                <Textarea
                  className='field__textarea'
                  value={description}
                  placeholder='介绍房源亮点、周边配套、看房时间等'
                  placeholderClass='field__placeholder'
                  maxlength={1000}
                  onInput={(e) => setDescription(e.detail.value)}
                />
                <Text className='field__hint'>{description.length}/1000</Text>
              </View>

              <View className='publish__actions'>
                <View className='publish__btn publish__btn--primary' onClick={handleNext}>
                  <Text className='publish__btn-text publish__btn-text--light'>下一步</Text>
                </View>
              </View>
            </View>
          ) : (
            <View>
              <View className='card'>
                <Text className='card__title'>联系人信息</Text>
                <View className='field'>
                  <Text className='field__label'>联系人姓名</Text>
                  <Input
                    className='field__input'
                    value={contactName}
                    placeholder='请输入真实姓名'
                    placeholderClass='field__placeholder'
                    onInput={(e) => setContactName(e.detail.value)}
                  />
                </View>
                <View className='field'>
                  <Text className='field__label'>手机号</Text>
                  <Input
                    className='field__input'
                    type='number'
                    value={contactPhone}
                    placeholder='用于接收带看通知'
                    placeholderClass='field__placeholder'
                    maxlength={11}
                    onInput={(e) => setContactPhone(e.detail.value)}
                  />
                </View>
              </View>

              <View className='card summary'>
                <Text className='card__title'>发布预览</Text>
                <View className='summary__rows'>
                  <View className='summary__row'>
                    <Text className='summary__label'>类型</Text>
                    <Text className='summary__value'>{dealType === 'rent' ? '出租' : '出售'}</Text>
                  </View>
                  <View className='summary__row'>
                    <Text className='summary__label'>标题</Text>
                    <Text className='summary__value summary__value--wrap'>{title}</Text>
                  </View>
                  <View className='summary__row'>
                    <Text className='summary__label'>位置</Text>
                    <Text className='summary__value'>{district} · {businessArea} · {community}</Text>
                  </View>
                  <View className='summary__row'>
                    <Text className='summary__label'>户型面积</Text>
                    <Text className='summary__value'>{rooms}室{halls}厅 · {area}㎡ · {orientation} · {decoration}</Text>
                  </View>
                  <View className='summary__row'>
                    <Text className='summary__label'>价格</Text>
                    <Text className='summary__value summary__value--price'>
                      {dealType === 'rent' ? `${price} 元/月` : `${price} 万`}
                    </Text>
                  </View>
                </View>
              </View>

              <View className='notice'>
                <Icon name='shield' size={28} color='#0F766E' />
                <Text className='notice__text'>
                  发布即表示你同意房源信息真实有效。平台将在审核后展示，虚假房源将被下架。
                </Text>
              </View>

              <View className='publish__actions'>
                <View className='publish__btn publish__btn--ghost' onClick={() => setStep(1)}>
                  <Text className='publish__btn-text'>上一步</Text>
                </View>
                <View
                  className={`publish__btn publish__btn--primary ${submitting ? 'is-disabled' : ''}`}
                  onClick={() => !submitting && handleSubmit()}
                >
                  <Text className='publish__btn-text publish__btn-text--light'>
                    {submitting ? '提交中...' : '提交发布'}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  )
}
