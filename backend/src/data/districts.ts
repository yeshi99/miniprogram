// 武汉行政区与片区基础数据
export interface DistrictMeta {
  name: string
  businessAreas: string[]
  metroLines: string[]
  avgSalePrice: number // 元/㎡ 二手参考均价
  avgRent: number // 元/月 整租一居参考
}

export const WUHAN_DISTRICTS: DistrictMeta[] = [
  {
    name: '江岸区',
    businessAreas: ['后湖', '二七路', '台北香港路', '百步亭', '谌家矶'],
    metroLines: ['1号线', '3号线', '6号线', '8号线'],
    avgSalePrice: 18600,
    avgRent: 2400,
  },
  {
    name: '江汉区',
    businessAreas: ['CBD西北湖', '唐家墩', '万松园', '常青路', '新华路'],
    metroLines: ['2号线', '3号线', '6号线', '7号线'],
    avgSalePrice: 19800,
    avgRent: 2600,
  },
  {
    name: '硚口区',
    businessAreas: ['古田', '宗关', '汉正街', '宝丰', '长丰'],
    metroLines: ['1号线', '3号线', '6号线'],
    avgSalePrice: 16500,
    avgRent: 2100,
  },
  {
    name: '汉阳区',
    businessAreas: ['王家湾', '钟家村', '四新', '沌口', '鹦鹉洲'],
    metroLines: ['3号线', '4号线', '6号线', '11号线'],
    avgSalePrice: 15200,
    avgRent: 2000,
  },
  {
    name: '武昌区',
    businessAreas: ['中南丁字桥', '徐东', '积玉桥', '水果湖', '南湖'],
    metroLines: ['2号线', '4号线', '5号线', '7号线'],
    avgSalePrice: 22400,
    avgRent: 2800,
  },
  {
    name: '洪山区',
    businessAreas: ['光谷', '关山', '街道口', '珞狮南路', '白沙洲'],
    metroLines: ['2号线', '11号线', '4号线', '6号线'],
    avgSalePrice: 17300,
    avgRent: 2200,
  },
  {
    name: '青山区',
    businessAreas: ['青山建二', '红卫路', '工人村', '武东'],
    metroLines: ['4号线', '5号线'],
    avgSalePrice: 13800,
    avgRent: 1800,
  },
  {
    name: '东湖高新区',
    businessAreas: ['光谷中心城', '花山', '左岭', '光谷东'],
    metroLines: ['11号线', '19号线'],
    avgSalePrice: 15600,
    avgRent: 1900,
  },
  {
    name: '东西湖区',
    businessAreas: ['金银湖', '吴家山', '常青花园', '径河'],
    metroLines: ['1号线', '6号线'],
    avgSalePrice: 11800,
    avgRent: 1600,
  },
  {
    name: '蔡甸区',
    businessAreas: ['蔡甸城关', '中法生态城', '奓山'],
    metroLines: ['3号线', '4号线'],
    avgSalePrice: 9600,
    avgRent: 1400,
  },
  {
    name: '江夏区',
    businessAreas: ['纸坊', '藏龙岛', '庙山', '大桥新区'],
    metroLines: ['2号线', '7号线', '8号线'],
    avgSalePrice: 11500,
    avgRent: 1500,
  },
  {
    name: '黄陂区',
    businessAreas: ['前川', '盘龙城', '汉口北', '武湖'],
    metroLines: ['1号线', '2号线'],
    avgSalePrice: 10200,
    avgRent: 1450,
  },
  {
    name: '新洲区',
    businessAreas: ['阳逻', '邾城', '双柳'],
    metroLines: ['21号线'],
    avgSalePrice: 8600,
    avgRent: 1300,
  },
]

export const HOT_KEYWORDS = [
  '光谷租房',
  '徐东二手房',
  '武昌学区房',
  '地铁2号线',
  '光谷中心城',
  '南湖花园',
  '精装一居',
  '免中介费',
  '江汉路商圈',
  '首付50万',
]

export const SEARCH_SUGGESTIONS: { type: 'community' | 'business' | 'metro' | 'district'; name: string; desc: string }[] = [
  { type: 'business', name: '光谷', desc: '洪山区 · 房源 386 套' },
  { type: 'business', name: '徐东', desc: '武昌区 · 房源 214 套' },
  { type: 'district', name: '洪山区', desc: '在售 1280 套 / 在租 960 套' },
  { type: 'district', name: '武昌区', desc: '在售 1642 套 / 在租 1120 套' },
  { type: 'metro', name: '地铁2号线', desc: '贯穿 江汉 - 洪山 - 东湖高新' },
  { type: 'metro', name: '地铁11号线', desc: '光谷东 - 左岭' },
  { type: 'community', name: '保利时代', desc: '洪山区 光谷 · 均价 23500 元/㎡' },
  { type: 'community', name: '万科城市之光', desc: '洪山区 光谷 · 均价 21800 元/㎡' },
  { type: 'community', name: '百步亭花园', desc: '江岸区 百步亭 · 均价 17900 元/㎡' },
  { type: 'community', name: '中建汤逊湖壹号', desc: '江夏区 藏龙岛 · 均价 14200 元/㎡' },
]
