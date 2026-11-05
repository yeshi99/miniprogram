import { View, Text, Input, Textarea, ScrollView } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useEffect, useState } from 'react'
import Icon from '@/components/Icon'
import { submitDemand } from '@/services/property'
import './index.scss'

const DISTRICTS = ['江岸区', '江汉区', '硚口区', '汉阳区', '武昌区', '洪山区', '青山区', '东湖高新区', '东西湖区', '蔡甸区', '江夏区', '黄陂区', '新洲区']
const RENT_BUDGETS = ['1500以下', '1500-2500', '2500-4000', '4000-6000', '6000以上']
const BUY_BUDGETS = ['100万以下', '100-150万', '150-200万', '200-300万', '300万以上']
const LAYOUTS = ['1室', '2室', '3室', '4室及以上']

export default function Demand() {
  const router = useRouter()
  const [tab, setTab] = useState<'form' | 'my'>(router.params.tab === 'my' ? 'my' : 'form')

  const [type, setType] = useState<'rent' | 'buy'>('rent')
  const [district, setDistrict] = useState('洪山区')
  const [budget, setBudget] = useState('1500-2500')
  const [layout, setLayout] = useState('2室')
  const [contact, setContact] = useState('')
  const [remark, setRemark] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (type === 'rent') setBudget('1500-2500')
    else setBudget('100-150万')
  }, [type])

  const handleSubmit = async () => {
    if (!/^1[3-9]\d{9}$/.test(contact)) {
      Taro.showToast({ title: '请填写正确的手机号', icon: 'none' })
      return
    }
    setSubmitting(true)
    try {
      const res = await submitDemand({ type, district, budget, layout, contact, remark })
      Taro.showModal({
        title: '提交成功',
        content: `${res.message}\n需求编号：${res.id}`,
        showCancel: false,
        confirmText: '好的',
        success: () => {
          setContact('')
          setRemark('')
        },
      })
    } catch (e: any) {
      Taro.showToast({ title: e?.message || '提交失败', icon: 'none' })
    } finally {
      setSubmitting(false)
    }
  }

  const budgets = type === 'rent' ? RENT_BUDGETS : BUY_BUDGETS

  return (
    <View className='demand'>
      <View className='demand__tabs'>
        <View className={`demand__tab ${tab === 'form' ? 'is-active' : ''}`} onClick={() => setTab('form')}>
          <Text className='demand__tab-text'>发布需求</Text>
        </View>
        <View className={`demand__tab ${tab === 'my' ? 'is-active' : ''}`} onClick={() => setTab('my')}>
          <Text className='demand__tab-text'>我的需求</Text>
        </View>
      </View>

      <ScrollView scrollY className='demand__scroll'>
        <View className='demand__content'>
          {tab === 'form' ? (
            <View>
              <View className='intro'>
                <View className='intro__icon'>
                  <Icon name='message' size={40} color='#0F766E' />
                </View>
                <View className='intro__body'>
                  <Text className='intro__title'>让房源来找你</Text>
                  <Text className='intro__desc'>填写需求后，武汉本地经纪人将在 24 小时内为你匹配房源</Text>
                </View>
              </View>

              <View className='card'>
                <Text className='card__title'>需求类型</Text>
                <View className='seg'>
                  <View className={`seg__item ${type === 'rent' ? 'is-active' : ''}`} onClick={() => setType('rent')}>
                    <Text className='seg__text'>我要租房</Text>
                  </View>
                  <View className={`seg__item ${type === 'buy' ? 'is-active' : ''}`} onClick={() => setType('buy')}>
                    <Text className='seg__text'>我要买房</Text>
                  </View>
                </View>
              </View>

              <View className='card'>
                <Text className='card__title'>意向区域</Text>
                <View className='selector'>
                  {DISTRICTS.map((d) => (
                    <View
                      key={d}
                      className={`selector__chip ${district === d ? 'is-active' : ''}`}
                      onClick={() => setDistrict(d)}
                    >
                      <Text className='selector__chip-text'>{d}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View className='card'>
                <Text className='card__title'>预算范围</Text>
                <View className='selector'>
                  {budgets.map((b) => (
                    <View
                      key={b}
                      className={`selector__chip ${budget === b ? 'is-active' : ''}`}
                      onClick={() => setBudget(b)}
                    >
                      <Text className='selector__chip-text'>{b}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View className='card'>
                <Text className='card__title'>期望户型</Text>
                <View className='selector'>
                  {LAYOUTS.map((l) => (
                    <View
                      key={l}
                      className={`selector__chip ${layout === l ? 'is-active' : ''}`}
                      onClick={() => setLayout(l)}
                    >
                      <Text className='selector__chip-text'>{l}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View className='card'>
                <Text className='card__title'>联系方式</Text>
                <View className='field'>
                  <Text className='field__label'>手机号</Text>
                  <Input
                    className='field__input'
                    type='number'
                    maxlength={11}
                    value={contact}
                    placeholder='经纪人将与你联系'
                    placeholderClass='field__placeholder'
                    onInput={(e) => setContact(e.detail.value)}
                  />
                </View>
                <View className='field'>
                  <Text className='field__label'>补充说明（选填）</Text>
                  <Textarea
                    className='field__textarea'
                    value={remark}
                    maxlength={200}
                    placeholder='如：地铁 2 号线沿线，希望带阳台，可接受合租'
                    placeholderClass='field__placeholder'
                    onInput={(e) => setRemark(e.detail.value)}
                  />
                </View>
              </View>

              <View
                className={`submit ${submitting ? 'is-disabled' : ''}`}
                onClick={() => !submitting && handleSubmit()}
              >
                <Text className='submit__text'>{submitting ? '提交中...' : '提交需求'}</Text>
              </View>
            </View>
          ) : (
            <View className='myempty'>
              <View className='myempty__circle'>
                <Icon name='message' size={52} color='#c3d2cf' />
              </View>
              <Text className='myempty__title'>需求已记录</Text>
              <Text className='myempty__desc'>
                你提交的找房需求会被推送给匹配的经纪人，请保持手机畅通。演示环境不持久化历史数据。
              </Text>
              <View className='myempty__btn tap' onClick={() => setTab('form')}>
                <Text className='myempty__btn-text'>再发布一条</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  )
}
