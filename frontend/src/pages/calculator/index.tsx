import { View, Text, Input, Slider, ScrollView } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useEffect, useState } from 'react'
import Icon from '@/components/Icon'
import { calcMortgage } from '@/services/property'
import type { MortgageResult } from '@/types/property'
import './index.scss'

type LoanType = 'commercial' | 'fund' | 'mixed'
type RepayType = 'equalInstallment' | 'equalPrincipal'

const LOAN_TYPES: { key: LoanType; label: string; desc: string }[] = [
  { key: 'commercial', label: '商业贷款', desc: 'LPR 基准，当前约 3.10%' },
  { key: 'fund', label: '公积金', desc: '首套 2.85%，最高 70 万' },
  { key: 'mixed', label: '组合贷', desc: '公积金 + 商贷组合' },
]

export default function Calculator() {
  const router = useRouter()
  const [totalPrice, setTotalPrice] = useState(Number(router.params.price) || 180)
  const [downRatio, setDownRatio] = useState(30)
  const [years, setYears] = useState(30)
  const [loanType, setLoanType] = useState<LoanType>('commercial')
  const [commercialRate, setCommercialRate] = useState(3.1)
  const [fundRate, setFundRate] = useState(2.85)
  const [fundAmount, setFundAmount] = useState(70)
  const [repayType, setRepayType] = useState<RepayType>('equalInstallment')
  const [result, setResult] = useState<MortgageResult | null>(null)
  const [loading, setLoading] = useState(false)

  const calculate = async () => {
    setLoading(true)
    try {
      const res = await calcMortgage({
        totalPrice,
        downPaymentRatio: downRatio / 100,
        years,
        loanType,
        commercialRate: commercialRate / 100,
        fundRate: fundRate / 100,
        fundAmount: fundAmount * 10000,
      })
      setResult(res)
    } catch {
      Taro.showToast({ title: '计算失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    calculate()
  }, [totalPrice, downRatio, years, loanType, commercialRate, fundRate, fundAmount])

  const downPayment = Math.round(totalPrice * 10000 * (downRatio / 100))
  const principal = totalPrice * 10000 - downPayment

  const monthlyDisplay =
    result &&
    (repayType === 'equalInstallment'
      ? result.equalInstallment.monthly
      : result.equalPrincipal.firstMonth)

  const totalInterest =
    result && (repayType === 'equalInstallment' ? result.equalInstallment.totalInterest : result.equalPrincipal.totalInterest)

  return (
    <View className='calc'>
      <ScrollView scrollY className='calc__scroll'>
        <View className='calc__content'>
          {/* 结果卡片 */}
          <View className='result'>
            <Text className='result__label'>
              {repayType === 'equalInstallment' ? '每月月供（等额本息）' : '首月月供（等额本金）'}
            </Text>
            <View className='result__value-row'>
              <Text className='result__currency'>¥</Text>
              <Text className='result__value'>{monthlyDisplay ? monthlyDisplay.toLocaleString() : '—'}</Text>
            </View>

            <View className='result__split'>
              <View className='result__split-item'>
                <Text className='result__split-label'>贷款总额</Text>
                <Text className='result__split-value'>{(principal / 10000).toFixed(1)} 万</Text>
              </View>
              <View className='result__split-divider' />
              <View className='result__split-item'>
                <Text className='result__split-label'>首付</Text>
                <Text className='result__split-value'>{(downPayment / 10000).toFixed(1)} 万</Text>
              </View>
              <View className='result__split-divider' />
              <View className='result__split-item'>
                <Text className='result__split-label'>总利息</Text>
                <Text className='result__split-value'>
                  {totalInterest ? (totalInterest / 10000).toFixed(1) : '—'} 万
                </Text>
              </View>
            </View>
          </View>

          {/* 还款方式 */}
          <View className='card'>
            <Text className='card__title'>还款方式</Text>
            <View className='seg'>
              <View
                className={`seg__item ${repayType === 'equalInstallment' ? 'is-active' : ''}`}
                onClick={() => setRepayType('equalInstallment')}
              >
                <Text className='seg__text'>等额本息</Text>
              </View>
              <View
                className={`seg__item ${repayType === 'equalPrincipal' ? 'is-active' : ''}`}
                onClick={() => setRepayType('equalPrincipal')}
              >
                <Text className='seg__text'>等额本金</Text>
              </View>
            </View>
            {result && (
              <Text className='card__hint'>
                {repayType === 'equalInstallment'
                  ? `每月固定还款，总利息约 ${(result.equalInstallment.totalInterest / 10000).toFixed(1)} 万元`
                  : `首月 ${result.equalPrincipal.firstMonth.toLocaleString()} 元，每月递减约 ${result.equalPrincipal.monthlyDecrease} 元，总利息更省 ${((result.equalInstallment.totalInterest - result.equalPrincipal.totalInterest) / 10000).toFixed(1)} 万元`}
              </Text>
            )}
          </View>

          {/* 房屋总价 */}
          <View className='card'>
            <View className='card__head'>
              <Text className='card__title'>房屋总价</Text>
              <View className='card__value-box'>
                <Input
                  className='card__value-input'
                  type='digit'
                  value={String(totalPrice)}
                  onInput={(e) => setTotalPrice(Number(e.detail.value) || 0)}
                />
                <Text className='card__value-unit'>万元</Text>
              </View>
            </View>
            <Slider
              min={30}
              max={800}
              step={5}
              value={totalPrice}
              activeColor='#0F766E'
              backgroundColor='#E8EFED'
              blockSize={26}
              blockColor='#0F766E'
              onChange={(e) => setTotalPrice(e.detail.value)}
            />
            <View className='slider-labels'>
              <Text className='slider-labels__text'>30 万</Text>
              <Text className='slider-labels__text'>800 万</Text>
            </View>
          </View>

          {/* 首付比例 */}
          <View className='card'>
            <View className='card__head'>
              <Text className='card__title'>首付比例</Text>
              <View className='card__value-box'>
                <Text className='card__value-num'>{downRatio}</Text>
                <Text className='card__value-unit'>%</Text>
              </View>
            </View>
            <View className='chip-row'>
              {[20, 30, 40, 50].map((r) => (
                <View
                  key={r}
                  className={`chip ${downRatio === r ? 'is-active' : ''}`}
                  onClick={() => setDownRatio(r)}
                >
                  <Text className='chip__text'>{r}%</Text>
                </View>
              ))}
            </View>
            <Text className='card__hint'>首付款约 {(downPayment / 10000).toFixed(1)} 万元</Text>
          </View>

          {/* 贷款年限 */}
          <View className='card'>
            <View className='card__head'>
              <Text className='card__title'>贷款年限</Text>
              <View className='card__value-box'>
                <Text className='card__value-num'>{years}</Text>
                <Text className='card__value-unit'>年</Text>
              </View>
            </View>
            <View className='chip-row'>
              {[10, 15, 20, 25, 30].map((y) => (
                <View key={y} className={`chip ${years === y ? 'is-active' : ''}`} onClick={() => setYears(y)}>
                  <Text className='chip__text'>{y}年</Text>
                </View>
              ))}
            </View>
          </View>

          {/* 贷款类型 */}
          <View className='card'>
            <Text className='card__title'>贷款类型</Text>
            <View className='loantypes'>
              {LOAN_TYPES.map((t) => (
                <View
                  key={t.key}
                  className={`loantype ${loanType === t.key ? 'is-active' : ''}`}
                  onClick={() => setLoanType(t.key)}
                >
                  <View className='loantype__body'>
                    <Text className='loantype__label'>{t.label}</Text>
                    <Text className='loantype__desc'>{t.desc}</Text>
                  </View>
                  <View className={`loantype__radio ${loanType === t.key ? 'is-active' : ''}`}>
                    {loanType === t.key && <Icon name='check' size={18} color='#ffffff' />}
                  </View>
                </View>
              ))}
            </View>

            {loanType === 'mixed' && (
              <View className='rate-row'>
                <View className='rate-row__item'>
                  <Text className='rate-row__label'>公积金贷款额度（万）</Text>
                  <Input
                    className='rate-row__input'
                    type='digit'
                    value={String(fundAmount)}
                    onInput={(e) => setFundAmount(Number(e.detail.value) || 0)}
                  />
                </View>
              </View>
            )}

            {(loanType === 'commercial' || loanType === 'mixed') && (
              <View className='rate-row'>
                <View className='rate-row__item'>
                  <Text className='rate-row__label'>商贷利率（%）</Text>
                  <Input
                    className='rate-row__input'
                    type='digit'
                    value={String(commercialRate)}
                    onInput={(e) => setCommercialRate(Number(e.detail.value) || 0)}
                  />
                </View>
              </View>
            )}

            {(loanType === 'fund' || loanType === 'mixed') && (
              <View className='rate-row'>
                <View className='rate-row__item'>
                  <Text className='rate-row__label'>公积金利率（%）</Text>
                  <Input
                    className='rate-row__input'
                    type='digit'
                    value={String(fundRate)}
                    onInput={(e) => setFundRate(Number(e.detail.value) || 0)}
                  />
                </View>
              </View>
            )}
          </View>

          {/* 明细 */}
          {result && (
            <View className='card'>
              <Text className='card__title'>还款明细</Text>
              <View className='detail'>
                <View className='detail__row'>
                  <Text className='detail__label'>房屋总价</Text>
                  <Text className='detail__value'>{(result.totalPrice / 10000).toFixed(1)} 万元</Text>
                </View>
                <View className='detail__row'>
                  <Text className='detail__label'>首付款</Text>
                  <Text className='detail__value'>{(result.downPayment / 10000).toFixed(1)} 万元</Text>
                </View>
                <View className='detail__row'>
                  <Text className='detail__label'>贷款金额</Text>
                  <Text className='detail__value'>{(result.loanAmount / 10000).toFixed(1)} 万元</Text>
                </View>
                {result.loanSplit.fund > 0 && (
                  <View className='detail__row'>
                    <Text className='detail__label'>其中公积金贷款</Text>
                    <Text className='detail__value'>{(result.loanSplit.fund / 10000).toFixed(1)} 万元</Text>
                  </View>
                )}
                {result.loanSplit.commercial > 0 && (
                  <View className='detail__row'>
                    <Text className='detail__label'>其中商业贷款</Text>
                    <Text className='detail__value'>{(result.loanSplit.commercial / 10000).toFixed(1)} 万元</Text>
                  </View>
                )}
                <View className='detail__row'>
                  <Text className='detail__label'>还款期数</Text>
                  <Text className='detail__value'>{result.months} 期</Text>
                </View>
                <View className='detail__divider' />
                <View className='detail__row'>
                  <Text className='detail__label detail__label--strong'>累计支付利息</Text>
                  <Text className='detail__value detail__value--price'>
                    {(totalInterest! / 10000).toFixed(2)} 万元
                  </Text>
                </View>
                <View className='detail__row'>
                  <Text className='detail__label detail__label--strong'>还款总额</Text>
                  <Text className='detail__value detail__value--price'>
                    {(
                      (repayType === 'equalInstallment'
                        ? result.equalInstallment.totalPayment
                        : result.equalPrincipal.totalPayment) / 10000
                    ).toFixed(2)}{' '}
                    万元
                  </Text>
                </View>
              </View>
            </View>
          )}

          <View className='disclaimer'>
            <Text className='disclaimer__text'>
              计算结果仅供参考，实际月供以银行审批为准。武汉首套首付最低 20%，二套 30%（具体以最新政策为准）。
            </Text>
          </View>
        </View>
      </ScrollView>

      <View className='calc__bar'>
        <View className='calc__bar-info'>
          <Text className='calc__bar-label'>预估首付</Text>
          <Text className='calc__bar-value'>{(downPayment / 10000).toFixed(1)} 万</Text>
        </View>
        <View className='calc__bar-btn' onClick={calculate}>
          <Text className='calc__bar-btn-text'>{loading ? '计算中...' : '重新计算'}</Text>
        </View>
      </View>
    </View>
  )
}
