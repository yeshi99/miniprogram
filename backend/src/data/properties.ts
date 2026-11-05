import type { Agent, Property } from '../types/property.types.js'

const AGENTS: Agent[] = [
  { name: '陈思远', company: '链家地产 · 光谷店', phone: '138****6621', rating: 4.9, dealCount: 186, years: 7, avatarText: '陈' },
  { name: '李沐阳', company: '贝壳找房 · 徐东店', phone: '139****3308', rating: 4.8, dealCount: 142, years: 5, avatarText: '李' },
  { name: '王皎', company: '中原地产 · 江汉路店', phone: '137****9915', rating: 4.7, dealCount: 98, years: 4, avatarText: '王' },
  { name: '周子豪', company: '优家公寓 · 光谷中心城', phone: '135****4472', rating: 4.9, dealCount: 231, years: 6, avatarText: '周' },
  { name: '徐慧', company: '我爱我家 · 南湖店', phone: '158****2206', rating: 4.6, dealCount: 76, years: 3, avatarText: '徐' },
  { name: '刘振国', company: '德佑地产 · 王家湾店', phone: '136****7754', rating: 4.8, dealCount: 154, years: 8, avatarText: '刘' },
]

export const FACILITY_POOL = ['电梯', '燃气', '宽带', '洗衣机', '冰箱', '空调', '热水器', '衣柜', '床', '沙发', '电视', '阳台', '车位', '智能门锁']

interface SeedInput {
  community: string
  district: string
  businessArea: string
  metroLine: string
  metroStation: string
  lat: number
  lng: number
  salePrice: number // 元/㎡
  rent: number // 一居参考租金
  layout: [number, number, number][] // [室, 厅, 面积]
}

const SEEDS: SeedInput[] = [
  { community: '保利时代', district: '洪山区', businessArea: '光谷', metroLine: '2号线', metroStation: '光谷广场', lat: 30.505, lng: 114.402, salePrice: 23500, rent: 3200, layout: [[1, 1, 48], [2, 1, 78], [3, 2, 105]] },
  { community: '万科城市之光', district: '洪山区', businessArea: '光谷', metroLine: '11号线', metroStation: '光谷五路', lat: 30.474, lng: 114.446, salePrice: 21800, rent: 2800, layout: [[1, 1, 45], [2, 1, 76], [3, 2, 98]] },
  { community: '光谷新世界', district: '洪山区', businessArea: '关山', metroLine: '2号线', metroStation: '光谷广场', lat: 30.512, lng: 114.415, salePrice: 20600, rent: 2600, layout: [[1, 1, 43], [2, 1, 72], [3, 2, 96]] },
  { community: '金地格林小城', district: '洪山区', businessArea: '光谷', metroLine: '2号线', metroStation: '佳园路', lat: 30.498, lng: 114.436, salePrice: 19800, rent: 2500, layout: [[1, 1, 40], [2, 1, 68], [3, 1, 89]] },
  { community: '中建汤逊湖壹号', district: '江夏区', businessArea: '藏龙岛', metroLine: '2号线', metroStation: '藏龙东街', lat: 30.436, lng: 114.421, salePrice: 14200, rent: 1600, layout: [[1, 1, 42], [2, 1, 70], [3, 2, 92]] },
  { community: '南湖花园城', district: '武昌区', businessArea: '南湖', metroLine: '7号线', metroStation: '建安街', lat: 30.507, lng: 114.339, salePrice: 18900, rent: 2100, layout: [[1, 1, 44], [2, 1, 74], [3, 1, 95]] },
  { community: '徐东丽岛', district: '武昌区', businessArea: '徐东', metroLine: '4号线', metroStation: '罗家港', lat: 30.578, lng: 114.325, salePrice: 21200, rent: 2500, layout: [[1, 1, 46], [2, 1, 78], [3, 2, 102]] },
  { community: '水果湖省委大院', district: '武昌区', businessArea: '水果湖', metroLine: '2号线', metroStation: '螃蟹岬', lat: 30.556, lng: 114.306, salePrice: 29800, rent: 3600, layout: [[2, 1, 72], [3, 1, 96], [2, 1, 68]] },
  { community: '复地东湖国际', district: '武昌区', businessArea: '积玉桥', metroLine: '5号线', metroStation: '彭刘杨', lat: 30.552, lng: 114.318, salePrice: 25600, rent: 3200, layout: [[1, 1, 45], [2, 1, 76], [3, 2, 100]] },
  { community: '百步亭花园', district: '江岸区', businessArea: '百步亭', metroLine: '3号线', metroStation: '后湖大道', lat: 30.652, lng: 114.292, salePrice: 17900, rent: 2200, layout: [[1, 1, 42], [2, 1, 72], [3, 1, 91]] },
  { community: '后湖东方明珠', district: '江岸区', businessArea: '后湖', metroLine: '6号线', metroStation: '工业一路', lat: 30.668, lng: 114.276, salePrice: 16800, rent: 2000, layout: [[1, 1, 40], [2, 1, 68], [3, 2, 90]] },
  { community: '泛海国际居住区', district: '江汉区', businessArea: 'CBD西北湖', metroLine: '3号线', metroStation: '范湖', lat: 30.607, lng: 114.259, salePrice: 24800, rent: 2900, layout: [[1, 1, 48], [2, 1, 80], [3, 2, 110]] },
  { community: '万科金色家园', district: '江汉区', businessArea: '常青路', metroLine: '6号线', metroStation: '常青花园', lat: 30.641, lng: 114.229, salePrice: 18600, rent: 2350, layout: [[1, 1, 44], [2, 1, 74], [3, 2, 97]] },
  { community: '华发中城荟', district: '江汉区', businessArea: '常青路', metroLine: '2号线', metroStation: '青年路', lat: 30.594, lng: 114.273, salePrice: 21800, rent: 2650, layout: [[1, 1, 46], [2, 1, 78], [3, 2, 104]] },
  { community: '武汉天地', district: '江汉区', businessArea: '台北香港路', metroLine: '2号线', metroStation: '循礼门', lat: 30.6, lng: 114.288, salePrice: 26800, rent: 3100, layout: [[1, 1, 47], [2, 1, 82], [3, 2, 108]] },
  { community: '融创公园大观', district: '硚口区', businessArea: '古田', metroLine: '1号线', metroStation: '古田二路', lat: 30.612, lng: 114.203, salePrice: 15600, rent: 1900, layout: [[1, 1, 43], [2, 1, 73], [3, 2, 94]] },
  { community: '古田香江国际', district: '硚口区', businessArea: '宗关', metroLine: '3号线', metroStation: '宗关', lat: 30.588, lng: 114.219, salePrice: 14200, rent: 1850, layout: [[1, 1, 41], [2, 1, 70], [3, 1, 93]] },
  { community: '王家湾中央生活区', district: '汉阳区', businessArea: '王家湾', metroLine: '3号线', metroStation: '王家湾', lat: 30.558, lng: 114.236, salePrice: 15800, rent: 1900, layout: [[1, 1, 43], [2, 1, 72], [3, 2, 95]] },
  { community: '四新城市之光', district: '汉阳区', businessArea: '四新', metroLine: '6号线', metroStation: '前进村', lat: 30.532, lng: 114.244, salePrice: 13600, rent: 1700, layout: [[1, 1, 40], [2, 1, 66], [3, 2, 88]] },
  { community: '华润置地橡树湾', district: '汉阳区', businessArea: '钟家村', metroLine: '4号线', metroStation: '钟家村', lat: 30.571, lng: 114.262, salePrice: 17800, rent: 2200, layout: [[1, 1, 44], [2, 1, 74], [3, 1, 96]] },
  { community: '青山建二钢都花园', district: '青山区', businessArea: '青山建二', metroLine: '5号线', metroStation: '建二路', lat: 30.619, lng: 114.352, salePrice: 13800, rent: 1750, layout: [[1, 1, 42], [2, 1, 71], [3, 2, 93]] },
  { community: '中建锦程', district: '东湖高新区', businessArea: '光谷中心城', metroLine: '11号线', metroStation: '光谷四路', lat: 30.481, lng: 114.462, salePrice: 16200, rent: 1850, layout: [[1, 1, 45], [2, 1, 76], [3, 2, 98]] },
  { community: '光谷天地', district: '东湖高新区', businessArea: '光谷中心城', metroLine: '11号线', metroStation: '光谷五路', lat: 30.489, lng: 114.471, salePrice: 17400, rent: 2000, layout: [[1, 1, 46], [2, 1, 78], [3, 2, 101]] },
  { community: '花山碧桂园', district: '东湖高新区', businessArea: '花山', metroLine: '11号线', metroStation: '光谷七路', lat: 30.518, lng: 114.498, salePrice: 11800, rent: 1500, layout: [[1, 1, 41], [2, 1, 69], [3, 1, 90]] },
  { community: '金银湖恒大名都', district: '东西湖区', businessArea: '金银湖', metroLine: '6号线', metroStation: '金银湖', lat: 30.662, lng: 114.192, salePrice: 12200, rent: 1600, layout: [[1, 1, 42], [2, 1, 70], [3, 2, 92]] },
  { community: '常青花园一村', district: '东西湖区', businessArea: '常青花园', metroLine: '1号线', metroStation: '常青花园', lat: 30.653, lng: 114.221, salePrice: 14800, rent: 1850, layout: [[1, 1, 40], [2, 1, 68], [3, 1, 89]] },
  { community: '吴家山愿景城', district: '东西湖区', businessArea: '吴家山', metroLine: '1号线', metroStation: '五环大道', lat: 30.617, lng: 114.144, salePrice: 10600, rent: 1450, layout: [[1, 1, 39], [2, 1, 66], [3, 1, 86]] },
  { community: '中法生态城水岸华府', district: '蔡甸区', businessArea: '中法生态城', metroLine: '4号线', metroStation: '蔡甸广场', lat: 30.556, lng: 114.051, salePrice: 10400, rent: 1450, layout: [[1, 1, 40], [2, 1, 68], [3, 1, 88]] },
  { community: '蔡甸新天大道', district: '蔡甸区', businessArea: '蔡甸城关', metroLine: '3号线', metroStation: '蔡甸', lat: 30.556, lng: 114.012, salePrice: 9200, rent: 1350, layout: [[1, 1, 38], [2, 1, 64], [3, 1, 84]] },
  { community: '武汉恒大御景湾', district: '江夏区', businessArea: '纸坊', metroLine: '7号线', metroStation: '谭鑫培公园', lat: 30.33, lng: 114.322, salePrice: 11800, rent: 1520, layout: [[1, 1, 41], [2, 1, 68], [3, 2, 90]] },
  { community: '藏龙岛藏龙星城', district: '江夏区', businessArea: '庙山', metroLine: '2号线', metroStation: '佛祖岭', lat: 30.418, lng: 114.446, salePrice: 12800, rent: 1600, layout: [[1, 1, 40], [2, 1, 67], [3, 1, 88]] },
  { community: '盘龙城万达华府', district: '黄陂区', businessArea: '盘龙城', metroLine: '2号线', metroStation: '宏图大道', lat: 30.732, lng: 114.254, salePrice: 11400, rent: 1550, layout: [[1, 1, 40], [2, 1, 68], [3, 2, 89]] },
  { community: '汉口北汉江湾', district: '黄陂区', businessArea: '汉口北', metroLine: '1号线', metroStation: '汉口北', lat: 30.741, lng: 114.302, salePrice: 9800, rent: 1400, layout: [[1, 1, 38], [2, 1, 65], [3, 1, 85]] },
  { community: '阳逻金色港湾', district: '新洲区', businessArea: '阳逻', metroLine: '21号线', metroStation: '阳逻开发区', lat: 30.688, lng: 114.586, salePrice: 8800, rent: 1350, layout: [[1, 1, 39], [2, 1, 66], [3, 1, 87]] },
  { community: '中铁世纪山水', district: '江岸区', businessArea: '谌家矶', metroLine: '8号线', metroStation: '塔子湖', lat: 30.701, lng: 114.302, salePrice: 15800, rent: 1900, layout: [[1, 1, 42], [2, 1, 71], [3, 2, 93]] },
]

const TITLE_PATTERNS = {
  rent: [
    '{community} 精装{rooms}居 拎包入住 近{station}地铁',
    '首租！{businessArea}{rooms}居室 南北通透 采光好',
    '{community}整租{rooms}居 · {area}㎡ · 地铁{line}',
    '{businessArea}地铁{line}{station}站 精装{rooms}居 免中介费',
    '{community} 全屋新装 {rooms}室 家电齐全 随时看房',
  ],
  sale: [
    '{district}{community} {rooms}室满五唯一 学区房 诚意出售',
    '{businessArea}地铁口 {community} {rooms}室{area}㎡ 南北通透',
    '{community} 精装{rooms}居 满二年 业主置换急售',
    '{district}{community} 中间楼层 {rooms}室 带车位出售',
    '{community} {rooms}室{area}㎡ 采光极佳 近{station}地铁',
  ],
}

const ORIENTATIONS = ['南北通透', '朝南', '东南', '西南', '朝东南', '南北']
const DECORATIONS = ['精装', '精装', '简装', '豪装', '毛坯']

const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min

const pick = <T,>(arr: T[]) => arr[rand(0, arr.length - 1)]

const pad = (n: number, len = 3) => String(n).padStart(len, '0')

function buildProperty(seed: SeedInput, idx: number, dealType: 'rent' | 'sale', layout: [number, number, number]): Property {
  const [rooms, halls, baseArea] = layout
  const area = baseArea + rand(-2, 3)
  const totalFloors = pick([6, 11, 18, 26, 33])
  const floor = rand(2, Math.max(3, totalFloors - 1))
  const orientation = pick(ORIENTATIONS)
  const decoration = dealType === 'rent' ? pick(['精装', '精装', '简装']) : pick(DECORATIONS)

  // 租金 / 售价：以区域基准为锚，按面积与随机浮动
  const unitPrice = Math.round((seed.salePrice * (0.92 + Math.random() * 0.18)) / 100) * 100
  const price =
    dealType === 'sale'
      ? Math.round((unitPrice * area) / 10000)
      : Math.round((seed.rent * (area / (layout[0] === 1 ? 45 : layout[0] === 2 ? 75 : 100)) * (0.9 + Math.random() * 0.25)) / 50) * 50

  const metroDistance = pick([120, 180, 260, 380, 450, 620, 780, 950])
  const tags: string[] = []
  if (Math.random() > 0.25) tags.push('实勘')
  if (metroDistance <= 500) tags.push('近地铁')
  if (decoration.includes('精') || decoration.includes('豪')) tags.push('拎包入住')
  if (dealType === 'rent' && Math.random() > 0.55) tags.push('免中介费')
  if (dealType === 'sale' && Math.random() > 0.5) tags.push('满五唯一')
  if (Math.random() > 0.6) tags.push('随时看房')
  if (rooms >= 3 && Math.random() > 0.5) tags.push('南北通透')
  if (Math.random() > 0.75) tags.push('业主直租')
  if (dealType === 'sale' && Math.random() > 0.7) tags.push('学区房')

  const facilities = FACILITY_POOL.filter(() => Math.random() > 0.35).slice(0, 9)
  if (!facilities.includes('电梯') && totalFloors > 7) facilities.unshift('电梯')

  const publishOffsetDays = rand(0, 26)
  const publishDate = new Date(Date.now() - publishOffsetDays * 86400000).toISOString()

  const template = pick(TITLE_PATTERNS[dealType])
  const title = template
    .replace('{community}', seed.community)
    .replace('{businessArea}', seed.businessArea)
    .replace('{district}', seed.district)
    .replace('{rooms}', String(rooms))
    .replace('{area}', String(area))
    .replace('{station}', seed.metroStation)
    .replace('{line}', seed.metroLine)

  const rentType = dealType === 'rent' ? (Math.random() > 0.82 ? '合租' : '整租') : undefined

  return {
    id: `WH${dealType === 'rent' ? 'R' : 'S'}${pad(idx + 1)}`,
    title,
    dealType,
    district: seed.district,
    businessArea: seed.businessArea,
    community: seed.community,
    address: `${seed.district}${seed.businessArea} · ${seed.community}`,
    price,
    unitPrice: dealType === 'sale' ? unitPrice : undefined,
    layout: `${rooms}室${halls}厅1卫`,
    rooms,
    halls,
    area,
    floor,
    totalFloors,
    orientation,
    decoration,
    elevator: facilities.includes('电梯'),
    rentType,
    metroLine: seed.metroLine,
    metroStation: seed.metroStation,
    metroDistance,
    tags,
    facilities,
    images: [],
    description:
      dealType === 'rent'
        ? `${seed.community}位于${seed.district}${seed.businessArea}，距${seed.metroLine}${seed.metroStation}站约${metroDistance}米。本房源为${rooms}室${halls}厅1卫，建筑面积${area}㎡，${orientation}，${decoration}交付，${facilities.slice(0, 5).join('、')}齐全，可拎包入住。周边配套成熟，超市、菜市场、餐饮步行可达，适合${rooms <= 1 ? '单身或情侣' : rooms === 2 ? '小家庭' : '一家三口'}居住。看房请联系经纪人，工作日晚上与周末均可安排。`
        : `${seed.community}位于${seed.district}${seed.businessArea}核心位置，距${seed.metroLine}${seed.metroStation}站约${metroDistance}米。本房源${rooms}室${halls}厅1卫，建筑面积${area}㎡，${orientation}，${decoration}，所在楼层${floor}/${totalFloors}。小区物业管理规范，绿化率高，周边学校、商业、医疗配套完善。业主诚心出售，产权清晰，可随时预约看房。`,
    publishDate,
    viewCount: rand(46, 2360),
    coordinates: {
      lat: Number((seed.lat + (Math.random() - 0.5) * 0.006).toFixed(5)),
      lng: Number((seed.lng + (Math.random() - 0.5) * 0.006).toFixed(5)),
    },
    agent: AGENTS[idx % AGENTS.length],
    score: Math.round(Math.random() * 100),
  }
}

function buildAll(): Property[] {
  const list: Property[] = []
  let i = 0
  SEEDS.forEach((seed, sIdx) => {
    seed.layout.forEach((layout, lIdx) => {
      list.push(buildProperty(seed, i++, 'rent', layout))
      // 出售房源按 1.2 倍数量生成，保证售房列表也足够丰富
      list.push(buildProperty(seed, i++, 'sale', layout))
      if (lIdx < 2) list.push(buildProperty(seed, i++, 'sale', layout))
    })
    // 少量补充：每 3 个小区多加一套合租/大户型
    if (sIdx % 3 === 0) list.push(buildProperty(seed, i++, 'rent', [3, 2, 118]))
  })
  return list
}

export const PROPERTIES: Property[] = buildAll()
