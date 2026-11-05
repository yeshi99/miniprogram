import { View, Text } from '@tarojs/components'
import './index.scss'

interface Props {
  seed?: number
  label?: string
  ratio?: 'wide' | 'square' | 'tall'
  radius?: number
  className?: string
  showLabel?: boolean
}

// 一组沉稳的建筑/室内色板，保证任何 seed 都落在协调区间
const PALETTES: [string, string, string][] = [
  ['#dbeae6', '#b7d6cf', '#0f766e'],
  ['#e7e2d6', '#cfc6b3', '#8a7a55'],
  ['#dde7ef', '#bccfdd', '#3e6a88'],
  ['#eae3e7', '#d1c2ca', '#7d4f63'],
  ['#e3e8dc', '#c6d2ba', '#5c7047'],
  ['#e8e4ef', '#cbc3d9', '#5d4d7c'],
  ['#efe6db', '#d8c6ad', '#8a6236'],
  ['#dce8e8', '#b9d2d3', '#2f6a6d'],
]

/**
 * 房源封面图占位：用渐变 + SVG 线条构成建筑意象，避免依赖外网图片资源。
 * 微信小程序限制 WXSS 使用本地 url()，这里改用内联样式渐变，完全兼容。
 */
export default function PropertyCover({ seed = 0, label, ratio = 'wide', className = '', showLabel = false }: Props) {
  const palette = PALETTES[Math.abs(seed) % PALETTES.length]
  const [c1, c2, ink] = palette
  const angle = 120 + (Math.abs(seed) % 6) * 18
  const t1 = 18 + (Math.abs(seed) % 5) * 9
  const t2 = 52 + (Math.abs(seed * 3) % 6) * 6

  const heightMap = { wide: '340px', square: '420px', tall: '480px' }

  return (
    <View
      className={`cover ${className}`}
      style={{
        height: heightMap[ratio],
        backgroundImage: `linear-gradient(${angle}deg, ${c1} 0%, ${c2} 58%, ${c1} 100%)`,
      }}
    >
      {/* 建筑剪影：用绝对定位色块模拟楼群，制造空间纵深 */}
      <View className="cover__skyline" style={{ backgroundColor: `${ink}0d` }}>
        <View className="cover__tower cover__tower--a" style={{ backgroundColor: `${ink}1a`, height: '58%' }} />
        <View className="cover__tower cover__tower--b" style={{ backgroundColor: `${ink}26`, height: '78%' }} />
        <View className="cover__tower cover__tower--c" style={{ backgroundColor: `${ink}14`, height: '46%' }} />
        <View className="cover__tower cover__tower--d" style={{ backgroundColor: `${ink}22`, height: '66%' }} />
      </View>
      {/* 光晕 */}
      <View
        className="cover__glow"
        style={{
          backgroundImage: `radial-gradient(circle at ${t1}% ${t2}%, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0) 55%)`,
        }}
      />
      {showLabel && label ? (
        <View className="cover__label">
          <Text className="cover__label-text">{label}</Text>
        </View>
      ) : null}
    </View>
  )
}
