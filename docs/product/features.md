# 武汉租售房产小程序 · 产品需求文档

## 一、产品概述

**产品名称**：武汉租售（Wuhan House）

**一句话定位**：面向武汉本地的租房、买房一站式信息平台，帮租客/买家快速找到真实的房源，帮房东/经纪人高效发布与带看。

**目标用户**：
| 角色 | 核心诉求 | 典型场景 |
| --- | --- | --- |
| 租客 | 预算内通勤方便的房子，怕中介费与假房源 | 光谷上班，找 2 号线沿线 2500 元以内的一居 |
| 买家 | 学区、地铁、总价匹配，需了解小区行情 | 关注武昌区学区房，对比近半年成交价 |
| 房东/经纪人 | 快速发布、房源被更多人看到 | 手上 8 套房源需要批量维护与推荐位 |

**核心差异点**：
- 只做武汉，覆盖 13 个行政区/片区，房源按地铁线、商圈、学区分类，而非全国泛化列表。
- 房源真实性标识（实勘、产权核验、机构认证），降低用户决策成本。
- 租转购联动：同一小区同时呈现租金水平与售价水平，帮用户做长期决策。

## 二、核心功能

### P0（本期必须实现）
1. **房源浏览与筛选**：按租/售、区域、价格、户型、面积、朝向、地铁距离、关键词筛选，支持排序。
2. **房源详情**：图集轮播、价格与费用明细、楼层户型信息、配套设施、位置地图、房源标签、经纪人信息、相似房源推荐。
3. **搜索**：关键词 + 热搜词 + 搜索历史，支持小区、商圈、地铁站联想。
4. **收藏**：收藏/取消收藏，收藏列表页。
5. **房源发布**：房东/经纪人填写表单发布（标题、租售类型、区域商圈、小区、价格、户型、面积、楼层、朝向、配套、图片、描述）。
6. **个人中心**：我的发布、我的收藏、浏览历史、我的需求（求租/求购登记）。

### P1（本期实现核心分析能力）
7. **区域行情**：按行政区看均价、租金、在售/在租房源量、价格趋势。
8. **房价计算器**：商贷/公积金贷款月供、首付、税费估算。
9. **地图找房**：按片区聚合展示房源数量与最低价。

### 不做（本期范围外）
- 在线支付、电子签约、IM 即时聊天（仅留联系方式与电话咨询）。
- 真实地图 SDK 接入（以片区聚合视图 + 外部地图唤起替代）。

## 三、用户故事

- 作为**租客**，我想按"地铁 2 号线 + 2000-3000 元 + 一居"筛选，这样我能只看到通勤可接受的房子。
- 作为**租客**，我想看到房源是否"实勘"和"免中介费"，这样我不用一个个打电话确认。
- 作为**买家**，我想在房源详情页看到同小区租金与售价对比，这样我能判断租还是买更划算。
- 作为**买家**，我想用房价计算器算月供，这样我知道自己能不能负担。
- 作为**房东**，我想 3 分钟内发布一套房源，并能随时下架。
- 作为**用户**，我想收藏心仪房源稍后对比。

## 四、页面结构

TabBar 4 个：**首页 / 找房 / 行情 / 我的**

| # | 页面 | 路径 | 说明 |
| --- | --- | --- | --- |
| 1 | 首页 | `pages/index/index` | 搜索框、租/售切换、快捷入口、热门区域、推荐房源、最新房源 |
| 2 | 找房 | `pages/list/index` | 筛选栏（类型/区域/价格/更多）、排序、房源列表、地图模式切换 |
| 3 | 行情 | `pages/market/index` | 区域均价榜、租售对比、价格趋势、房价计算器入口 |
| 4 | 我的 | `pages/mine/index` | 用户信息、我的收藏/发布/浏览历史/需求、功能入口 |
| 5 | 房源详情 | `pages/detail/index` | 图集、价格、参数、配套、位置、经纪人、相似房源 |
| 6 | 搜索 | `pages/search/index` | 搜索输入、热搜、历史、联想结果 |
| 7 | 收藏 | `pages/favorites/index` | 收藏列表 |
| 8 | 我的发布 | `pages/my-listings/index` | 发布记录、上下架 |
| 9 | 发布房源 | `pages/publish/index` | 房源发布表单 |
| 10 | 房价计算器 | `pages/calculator/index` | 贷款月供/首付/税费计算 |
| 11 | 区域行情详情 | `pages/district/index` | 单区域均价、趋势、房源列表 |

## 五、数据模型

### Property（房源）
```ts
{
  id: string                 // 房源编号 如 WH2024001
  title: string              // 标题
  dealType: 'rent' | 'sale'  // 租 / 售
  district: string           // 行政区 如 洪山区
  businessArea: string       // 商圈 如 光谷
  community: string          // 小区名
  address: string            // 详细地址
  price: number              // 租金(元/月) 或 总价(万元)
  unitPrice?: number         // 单价(元/㎡)，出售时
  layout: string             // 户型 2室1厅1卫
  rooms: number              // 室
  halls: number              // 厅
  area: number               // 建筑面积 ㎡
  floor: number              // 所在楼层
  totalFloors: number        // 总楼层
  orientation: string        // 朝向
  decoration: string         // 装修 精装/简装/毛坯
  elevator: boolean          // 电梯
  rentType?: string          // 整租/合租
  metroLine?: string         // 地铁线路
  metroStation?: string      // 地铁站
  metroDistance?: number     // 距地铁米数
  tags: string[]             // 标签 实勘/近地铁/精装/免中介费
  facilities: string[]       // 配套
  images: string[]           // 图片
  description: string
  publishDate: string
  viewCount: number
  isFavorite?: boolean
  agent: { name, avatar, company, phone, rating, dealCount }
  coordinates?: { lat, lng }
}
```

### District（区域行情）
```ts
{
  name: string            // 洪山区
  avgSalePrice: number    // 二手均价 元/㎡
  avgRent: number         // 平均租金 元/月
  saleCount: number
  rentCount: number
  trend: number[]         // 近 6 个月均价
  changeRate: number      // 环比涨跌 %
}
```

### Favorite / Listing（用户侧）
```ts
Favorite { id, propertyId, createdAt }
Listing  { id, propertyId, status: 'online' | 'offline', createdAt }
Demand   { id, type: 'rent' | 'buy', district, budget, layout, contact, createdAt }
```

## 六、API 设计（JSON 协议，POST 传参）

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/health` | 健康检查 |
| POST | `/api/properties/list` | 房源列表（分页 + 筛选 + 排序） |
| POST | `/api/properties/search` | 关键词搜索 + 联想 |
| GET | `/api/properties/:id` | 房源详情 |
| POST | `/api/properties/recommend` | 首页推荐/最新房源 |
| POST | `/api/properties` | 发布房源 |
| POST | `/api/properties/similar` | 相似房源 |
| POST | `/api/favorites/list` | 收藏列表 |
| POST | `/api/favorites/toggle` | 收藏/取消收藏 |
| POST | `/api/districts/list` | 区域行情列表 |
| POST | `/api/districts/detail` | 单区域行情与趋势 |
| POST | `/api/publish/list` | 我的发布 |
| POST | `/api/publish/status` | 上架/下架 |
| POST | `/api/demands` | 提交求租/求购需求 |
| POST | `/api/calculator/mortgage` | 房贷计算（商贷/公积金/组合） |

**响应约定**：`{ success: true, data: ... }`，错误 `{ status: 'error', message }`。
用户身份用请求头 `x-user-id` 标识（演示环境默认 `guest`）。

## 七、非功能要求
- 小程序首屏可交互 < 2s，列表分页每页 10 条。
- 所有用户可见文案为简体中文，价格格式 `¥` / `x 元/月` / `x 万`。
- 触控目标 ≥ 88px（750 设计稿），主色 #0F766E 信任青绿 + 辅助 #F59E0B。
- 图片使用占位纹理/渐变，不依赖外网 CDN（保证离线可预览）。
