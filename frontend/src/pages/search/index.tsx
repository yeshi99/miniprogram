import { View, Text, Input, ScrollView } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useState } from 'react'
import Icon from '@/components/Icon'
import PropertyCard from '@/components/PropertyCard'
import { searchProperties } from '@/services/property'
import type { PropertyListItem, SearchSuggestion } from '@/types/property'
import './index.scss'

const HOT_KEYWORDS = ['光谷租房', '徐东二手房', '武昌学区房', '地铁2号线', '光谷中心城', '免中介费', '首付50万', '精装一居']

const TYPE_LABELS: Record<SearchSuggestion['type'], string> = {
  community: '小区',
  business: '片区',
  metro: '地铁',
  district: '区域',
}

export default function Search() {
  const router = useRouter()
  const [keyword, setKeyword] = useState('')
  const [history, setHistory] = useState<string[]>(Taro.getStorageSync('search-history') || [])
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [result, setResult] = useState<PropertyListItem[]>([])
  const [total, setTotal] = useState(0)
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)

  const saveHistory = (kw: string) => {
    const next = [kw, ...history.filter((h) => h !== kw)].slice(0, 10)
    setHistory(next)
    Taro.setStorageSync('search-history', next)
  }

  const doSearch = async (kw: string) => {
    const query = kw.trim()
    if (!query) return
    setKeyword(query)
    setLoading(true)
    setSearched(true)
    try {
      const res = await searchProperties({ keyword: query, dealType: (router.params.dealType as any) || undefined, limit: 20 })
      setResult(res.list)
      setTotal(res.pagination.total)
      setSuggestions([])
      saveHistory(query)
    } catch {
      Taro.showToast({ title: '搜索失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const handleInput = async (value: string) => {
    setKeyword(value)
    if (!value.trim()) {
      setSearched(false)
      setSuggestions([])
      return
    }
    try {
      const res = await searchProperties({ keyword: value, limit: 1 })
      setSuggestions(res.suggestions)
    } catch {
      // 联想失败忽略
    }
  }

  const clearHistory = () => {
    Taro.showModal({
      title: '清空搜索历史',
      content: '确定要清空全部搜索记录吗？',
      success: (res) => {
        if (res.confirm) {
          setHistory([])
          Taro.removeStorageSync('search-history')
        }
      },
    })
  }

  return (
    <View className='search'>
      <View className='search__bar'>
        <View className='search__input-wrap'>
          <Icon name='search' size={30} color='#7a8a8f' />
          <Input
            className='search__input'
            value={keyword}
            placeholder='小区 / 商圈 / 地铁站 / 学区'
            placeholderClass='search__placeholder'
            confirmType='search'
            focus={!searched}
            onInput={(e) => handleInput(e.detail.value)}
            onConfirm={(e) => doSearch(e.detail.value)}
          />
          {keyword ? (
            <View
              className='search__clear'
              onClick={() => {
                setKeyword('')
                setSearched(false)
                setSuggestions([])
              }}
            >
              <Icon name='close' size={24} color='#a5b2b7' />
            </View>
          ) : null}
        </View>
        <View className='search__cancel tap' onClick={() => Taro.navigateBack()}>
          <Text className='search__cancel-text'>取消</Text>
        </View>
      </View>

      <ScrollView scrollY className='search__scroll'>
        <View className='search__content'>
          {/* 默认态：热搜 + 历史 */}
          {!searched && (
            <View>
              {history.length > 0 && (
                <View className='block'>
                  <View className='block__head'>
                    <Text className='block__title'>搜索历史</Text>
                    <View className='tap' onClick={clearHistory}>
                      <Text className='block__action'>清空</Text>
                    </View>
                  </View>
                  <View className='tags'>
                    {history.map((h) => (
                      <View key={h} className='tags__item tap' onClick={() => doSearch(h)}>
                        <Text className='tags__text'>{h}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              <View className='block'>
                <View className='block__head'>
                  <Text className='block__title'>热门搜索</Text>
                  <Icon name='fire' size={24} color='#e07b00' />
                </View>
                <View className='tags'>
                  {HOT_KEYWORDS.map((h, i) => (
                    <View
                      key={h}
                      className={`tags__item tap ${i < 3 ? 'tags__item--hot' : ''}`}
                      onClick={() => doSearch(h)}
                    >
                      <Text className='tags__text'>{h}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* 联想态 */}
          {keyword && !searched && suggestions.length > 0 && (
            <View className='block'>
              {suggestions.map((s) => (
                <View key={`${s.type}-${s.name}`} className='suggest tap' onClick={() => doSearch(s.name)}>
                  <View className='suggest__type'>
                    <Text className='suggest__type-text'>{TYPE_LABELS[s.type]}</Text>
                  </View>
                  <View className='suggest__body'>
                    <Text className='suggest__name'>{s.name}</Text>
                    <Text className='suggest__desc'>{s.desc}</Text>
                  </View>
                  <Icon name='chevron-right' size={24} color='#c2cfcc' />
                </View>
              ))}
            </View>
          )}

          {/* 结果 */}
          {searched && (
            <View>
              <View className='result-head'>
                <Text className='result-head__text'>
                  「{keyword}」找到 <Text className='result-head__num'>{total}</Text> 套房源
                </Text>
              </View>
              {loading ? (
                [1, 2].map((i) => (
                  <View key={i} className='skeleton' style={{ height: '420px', marginBottom: '16px' }} />
                ))
              ) : result.length === 0 ? (
                <View className='search__empty'>
                  <View className='search__empty-circle'>
                    <Icon name='search' size={52} color='#c3d2cf' />
                  </View>
                  <Text className='search__empty-title'>没有找到相关房源</Text>
                  <Text className='search__empty-desc'>换个关键词试试，或浏览热门片区</Text>
                  <View className='search__empty-tags'>
                    {HOT_KEYWORDS.slice(0, 4).map((h) => (
                      <View key={h} className='tags__item tap' onClick={() => doSearch(h)}>
                        <Text className='tags__text'>{h}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ) : (
                result.map((item) => <PropertyCard key={item.id} item={item} />)
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  )
}
