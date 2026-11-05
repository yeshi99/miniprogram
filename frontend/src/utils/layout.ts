import Taro from '@tarojs/taro'

/** 获取状态栏高度（px，H5 返回 0） */
export function getStatusBarHeight(): number {
  try {
    const info = Taro.getWindowInfo ? Taro.getWindowInfo() : Taro.getSystemInfoSync()
    return info.statusBarHeight || 0
  } catch {
    return 0
  }
}

/** 获取胶囊按钮位置信息，用于自定义导航栏对齐 */
export function getMenuButtonRect(): { top: number; height: number } | null {
  try {
    const rect = Taro.getMenuButtonBoundingClientRect?.()
    if (!rect || !rect.height) return null
    return { top: rect.top, height: rect.height }
  } catch {
    return null
  }
}

/**
 * 计算自定义导航栏总高度（状态栏 + 导航内容）
 * H5 下返回 0，由 CSS 提供默认内边距
 */
export function getNavBarHeight(): number {
  const statusBar = getStatusBarHeight()
  const menu = getMenuButtonRect()
  if (!statusBar) return 0
  if (menu) return menu.top + menu.height + (menu.top - statusBar)
  return statusBar + 44
}

/** 价格格式化 */
export function formatPrice(price: number, dealType: 'rent' | 'sale'): string {
  return dealType === 'rent' ? `${price.toLocaleString()} 元/月` : `${price} 万`
}

/** 面积格式化 */
export function formatArea(area: number): string {
  return `${area} ㎡`
}

/** 相对时间 */
export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) return `${Math.max(1, minutes)} 分钟前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} 小时前`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} 天前`
  return `${Math.floor(days / 30)} 个月前`
}
