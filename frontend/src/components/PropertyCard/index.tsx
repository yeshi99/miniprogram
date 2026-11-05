import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import PropertyCover from '../PropertyCover'
import type { PropertyListItem } from '@/types/property'
import './index.scss'

interface Props {
  item: PropertyListItem
  variant?: 'grid' | 'list'
  showFavorite?: boolean
  favorited?: boolean
  onToggleFavorite?: (id: string) => void
  onClick?: (id: string) => void
}

const formatPrice = (item: PropertyListItem) => {
  if (item.dealType === 'rent') {
    return { value: item.price.toLocaleString(), unit: '元/月' }
  }
  return { value: String(item.price), unit: '万' }
}

const formatDate = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime()
  const day = Math.floor(diff / 86400000)
  if (day <= 0) return '今天'
  if (day === 1) return '昨天'
  if (day < 30) return `${day}天前`
  return `${Math.floor(day / 30)}个月前`
}

export default function PropertyCard({
  item,
  variant = 'list',
  showFavorite = false,
  favorited = false,
  onToggleFavorite,
  onClick,
}: Props) {
  const price = formatPrice(item)

  const handleOpen = () => {
    if (onClick) onClick(item.id)
    else Taro.navigateTo({ url: `/pages/detail/index?id=${item.id}` })
  }

  const handleFav = (e: any) => {
    e.stopPropagation?.()
    onToggleFavorite?.(item.id)
  }

  if (variant === 'grid') {
    return (
      <View className='pcard-grid tap' onClick={handleOpen}>
        <View className='pcard-grid__media'>
          <PropertyCover seed={item.imageSeed} ratio='square' />
          {item.tags.includes('实勘') && (
            <View className='pcard-grid__badge'>
              <Text className='pcard-grid__badge-text'>实勘</Text>
            </View>
          )}
        </View>
        <View className='pcard-grid__body'>
          <Text className='pcard-grid__title ellipsis'>{item.title}</Text>
          <Text className='pcard-grid__meta ellipsis'>
            {item.businessArea} · {item.layout} · {item.area}㎡
          </Text>
          <View className='pcard-grid__foot'>
            <View className='pcard-grid__price'>
              <Text className='pcard-grid__price-num price-num'>{price.value}</Text>
              <Text className='pcard-grid__price-unit'>{price.unit}</Text>
            </View>
            <Text className='pcard-grid__station'>{item.metroDistance}m</Text>
          </View>
        </View>
      </View>
    )
  }

  return (
    <View className='pcard tap' onClick={handleOpen}>
      <View className='pcard__media'>
        <PropertyCover seed={item.imageSeed} ratio='wide' />
        <View className='pcard__tags'>
          {item.tags.slice(0, 2).map((t) => (
            <View key={t} className='pcard__tag'>
              <Text className='pcard__tag-text'>{t}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className='pcard__body'>
        <Text className='pcard__title ellipsis-2'>{item.title}</Text>

        <Text className='pcard__spec'>
          {item.layout} · {item.area}㎡ · {item.orientation} · {item.decoration}
        </Text>

        <View className='pcard__location'>
          <Text className='pcard__location-text ellipsis'>
            {item.district}·{item.businessArea} | {item.metroLine}{item.metroStation}
          </Text>
          <Text className='pcard__distance'>{item.metroDistance}m</Text>
        </View>

        <View className='pcard__foot'>
          <View className='pcard__price'>
            <Text className='pcard__price-num price-num'>{price.value}</Text>
            <Text className='pcard__price-unit'>{price.unit}</Text>
            {item.unitPrice ? <Text className='pcard__unit-price'>{item.unitPrice}元/㎡</Text> : null}
          </View>
          <View className='pcard__foot-right'>
            <Text className='pcard__date'>{formatDate(item.publishDate)}</Text>
            {showFavorite && (
              <View className={`pcard__fav ${favorited ? 'is-on' : ''}`} onClick={handleFav}>
                <Image
                  className='pcard__fav-icon'
                  src={
                    favorited
                      ? 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23e07b00"><path d="M12 21s-7.5-4.7-9.3-9.1C1.2 8.4 3.1 5 6.6 5c2 0 3.6 1.1 4.4 2.6h2C13.8 6.1 15.4 5 17.4 5c3.5 0 5.4 3.4 3.9 6.9C19.5 16.3 12 21 12 21z"/></svg>'
                      : 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%237a8a8f" stroke-width="1.8"><path d="M12 20.5s-7-4.4-8.7-8.5C1.9 8.6 3.7 5.5 6.9 5.5c2 0 3.6 1.1 4.4 2.7l.7 1.4.7-1.4c.8-1.6 2.4-2.7 4.4-2.7 3.2 0 5 3.1 3.6 6.5-1.7 4.1-8.7 8.5-8.7 8.5z"/></svg>'
                  }
                />
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  )
}
