import { View, Image } from '@tarojs/components'
import './index.scss'

export type IconName =
  | 'search'
  | 'location'
  | 'chevron-right'
  | 'chevron-down'
  | 'heart'
  | 'heart-fill'
  | 'calc'
  | 'trend'
  | 'filter'
  | 'sort'
  | 'phone'
  | 'message'
  | 'close'
  | 'check'
  | 'plus'
  | 'clock'
  | 'shield'
  | 'building'
  | 'train'
  | 'arrow-up'
  | 'arrow-down'
  | 'history'
  | 'list'
  | 'star'
  | 'bed'
  | 'area'
  | 'compass'
  | 'fire'
  | 'map'

const PATHS: Record<IconName, string> = {
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/>',
  location: '<path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z"/><circle cx="12" cy="10" r="2.6"/>',
  'chevron-right': '<path d="m9 5 7 7-7 7"/>',
  'chevron-down': '<path d="m5 9 7 7 7-7"/>',
  heart: '<path d="M12 20.5S4 15.6 4 10.3A4.3 4.3 0 0 1 12 8a4.3 4.3 0 0 1 8 2.3c0 5.3-8 10.2-8 10.2z"/>',
  'heart-fill': '<path d="M12 20.5S4 15.6 4 10.3A4.3 4.3 0 0 1 12 8a4.3 4.3 0 0 1 8 2.3c0 5.3-8 10.2-8 10.2z" fill="currentColor" stroke="none"/>',
  calc: '<rect x="4" y="3" width="16" height="18" rx="2.5"/><path d="M8 7.5h8M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 16h.01M12 16h.01M15.5 16h.01"/>',
  trend: '<path d="M4 16.5 9 11l3.5 3.5L20 7"/><path d="M15 7h5v5"/>',
  filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
  sort: '<path d="M7 4v16M7 20l-3-3M7 20l3-3"/><path d="M14 6h6M14 11h4M14 16h2"/>',
  phone: '<path d="M5 3.5h3.4l1.7 4.3-2.1 1.6a12.5 12.5 0 0 0 6.6 6.6l1.6-2.1 4.3 1.7V19a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 3 5.7 2 2 0 0 1 5 3.5z"/>',
  message: '<path d="M4 5.5h16v11H9l-5 4v-15z"/><path d="M8.5 10h7"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3.2 2"/>',
  shield: '<path d="M12 3.5 5 6.2v5.6c0 4.4 3 7.6 7 8.7 4-1.1 7-4.3 7-8.7V6.2z"/><path d="m9 12 2.2 2.2L15.4 10"/>',
  building: '<path d="M4 20V5.5l8-2.5v17M12 20h8V9l-8-3.5"/><path d="M7 8h2M7 11.5h2M7 15h2M15 11h2M15 14.5h2"/>',
  train: '<rect x="6" y="3.5" width="12" height="13" rx="3"/><path d="M6 10h12M9 20l1.5-3.5M15 20l-1.5-3.5M9.5 13.5h.01M14.5 13.5h.01"/>',
  'arrow-up': '<path d="M12 19V5M6 11l6-6 6 6"/>',
  'arrow-down': '<path d="M12 5v14M6 13l6 6 6-6"/>',
  history: '<path d="M4 12a8 8 0 1 0 2.6-5.9"/><path d="M4 4v4h4"/><path d="M12 8v4.3l3 1.8"/>',
  list: '<rect x="4" y="4" width="16" height="16" rx="2.5"/><path d="M8 9h8M8 13h8M8 17h5"/>',
  star: '<path d="m12 4 2.5 5.1 5.6.8-4 3.9 1 5.6-5.1-2.7L6.9 19.4l1-5.6-4-3.9 5.6-.8z"/>',
  bed: '<path d="M3 18v-7h13a4 4 0 0 1 4 4v3M3 11V7M3 18h18"/><path d="M7 11V9.5h4V11"/>',
  area: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 4v5H4M15 20v-5h5"/>',
  compass: '<circle cx="12" cy="12" r="8.5"/><path d="m15 9-2 4.5L8.5 15l2-4.5z"/>',
  fire: '<path d="M12 3s5 4.2 5 9a5 5 0 0 1-10 0c0-2 1-3.4 2-4.6 0 1.8 1 3 2 3.6 0-3 1-6 1-8z"/>',
  map: '<path d="m9 4 6 2.5L21 4v15l-6 2.5L9 19l-6 2.5V6.5z"/><path d="M9 4v15M15 6.5v15"/>',
}

interface Props {
  name: IconName
  size?: number
  color?: string
  className?: string
}

/**
 * 内联 SVG 线条图标（stroke 风格，24 网格）。
 * 小程序 WXSS 不能引用本地图片，因此以 data URI 的 Image 渲染，兼容 H5 与微信端。
 */
export default function Icon({ name, size = 32, color = '#46555a', className = '' }: Props) {
  const path = PATHS[name] || ''
  const filled = name === 'heart-fill'
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`
  const encoded = encodeURIComponent(svg)

  return (
    <View className={`icon-wrap ${className}`} style={{ width: `${size}px`, height: `${size}px` }}>
      <Image
        className='icon-img'
        style={{ width: `${size}px`, height: `${size}px`, color: filled ? color : 'inherit' }}
        src={`data:image/svg+xml;charset=utf8,${encoded}`}
        mode='aspectFit'
      />
    </View>
  )
}
