const ASSET = './assets/';
const icons = {
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-4-4"></path></svg>',
  cart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 4h2l2.2 11.1a2 2 0 0 0 2 1.6h7.5a2 2 0 0 0 1.9-1.5L20 8H6"></path><circle cx="10" cy="20" r="1"></circle><circle cx="18" cy="20" r="1"></circle></svg>',
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="3.5"></circle><path d="M4.5 20a7.5 7.5 0 0 1 15 0"></path></svg>',
  heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20.8 8.7c0 5.4-8.8 10.3-8.8 10.3S3.2 14.1 3.2 8.7A4.6 4.6 0 0 1 12 6.3a4.6 4.6 0 0 1 8.8 2.4Z"></path></svg>',
  eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6Z"></path><circle cx="12" cy="12" r="2.5"></circle></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m6 6 12 12M18 6 6 18"></path></svg>',
  chevron: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m6 9 6 6 6-6"></path></svg>',
  truck: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 6h11v10H3zM14 10h4l3 3v3h-7z"></path><circle cx="7" cy="19" r="1.8"></circle><circle cx="18" cy="19" r="1.8"></circle></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3 20 6v5c0 5-3.4 8.4-8 10-4.6-1.6-8-5-8-10V6l8-3Z"></path><path d="m8.5 12 2.2 2.2 4.8-5"></path></svg>',
  chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 18.5 3.5 21l4.2-1.9c1.3.6 2.8.9 4.3.9 4.7 0 8.5-3.1 8.5-7s-3.8-7-8.5-7S3.5 10.1 3.5 14c0 1.7.5 3.2 1.5 4.5Z"></path></svg>',
  bolt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m13 2-9 12h7l-1 8 9-12h-7l1-8Z"></path></svg>',
  spark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m12 2 1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Z"></path><path d="m19 16 .8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z"></path></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 7h16M4 12h16M4 17h16"></path></svg>'
};

const vehicleFamilies = {
  Audi: { A3: [2013, 2027, ['Premium', 'Premium Plus', 'S line']], A4: [2009, 2027, ['Premium', 'Premium Plus', 'Prestige']], Q3: [2015, 2027, ['Premium', 'Premium Plus', 'S line']], Q5: [2009, 2027, ['Premium', 'Premium Plus', 'Prestige']], A6: [2012, 2027, ['Premium Plus', 'Prestige']], Q7: [2007, 2027, ['Premium', 'Premium Plus', 'Prestige']] },
  BMW: { '3 Series': [2000, 2027, ['330i', 'M340i', 'M3']], '5 Series': [2000, 2027, ['530i', '540i', 'M550i']], M3: [2001, 2027, ['Base', 'Competition']], X3: [2004, 2027, ['xDrive30i', 'M40i']], X5: [2000, 2027, ['xDrive40i', 'M60i']] },
  'Mercedes-Benz': { 'C-Class': [2001, 2027, ['C300', 'AMG C43', 'AMG C63']], 'E-Class': [2000, 2027, ['E350', 'E450', 'AMG E53']], GLC: [2016, 2027, ['GLC300', 'AMG GLC43']], 'CLA-Class': [2014, 2027, ['CLA250', 'AMG CLA45']] },
  Volkswagen: { Golf: [1990, 2027, ['S', 'SE', 'GTI', 'R']], GTI: [2006, 2027, ['S', 'SE', 'Autobahn']], Jetta: [1990, 2027, ['S', 'SE', 'GLI']], Tiguan: [2009, 2027, ['S', 'SE', 'R-Line']] },
  Honda: { Civic: [1980, 2027, ['LX', 'Sport', 'Si', 'Type R', 'Touring']], Accord: [1980, 2027, ['LX', 'Sport', 'EX-L', 'Touring']], Integra: [1986, 2027, ['Base', 'A-Spec', 'Type S']], 'CR-V': [1997, 2027, ['LX', 'EX', 'Touring']], 'Civic Type R': [2017, 2027, ['Base', 'Limited Edition']] },
  Toyota: { Camry: [1983, 2027, ['LE', 'SE', 'XSE']], Corolla: [1980, 2027, ['LE', 'SE', 'XSE']], GR86: [2022, 2027, ['Base', 'Premium', 'Trueno']], Supra: [2020, 2027, ['3.0', '3.0 Premium']], '4Runner': [1984, 2027, ['SR5', 'TRD Sport', 'TRD Pro']] },
  Ford: { Mustang: [1980, 2027, ['EcoBoost', 'GT', 'Dark Horse']], Focus: [2000, 2018, ['SE', 'ST', 'RS']], 'F-150': [1980, 2027, ['XL', 'XLT', 'Lariat']], Bronco: [2021, 2027, ['Base', 'Big Bend', 'Badlands']], Explorer: [1991, 2027, ['Base', 'XLT', 'ST']] },
  Subaru: { WRX: [2002, 2027, ['Base', 'Premium', 'Limited', 'TR']], BRZ: [2013, 2027, ['Premium', 'Limited']], Outback: [1995, 2027, ['Base', 'Premium', 'Limited']], Forester: [1998, 2027, ['Base', 'Premium', 'Sport']] },
  Nissan: { '370Z': [2009, 2020, ['Sport', 'Nismo']], Z: [2023, 2027, ['Sport', 'Performance']], 'GT-R': [2009, 2027, ['Premium', 'Nismo']], Altima: [1993, 2027, ['S', 'SV', 'SR']], Sentra: [1983, 2027, ['S', 'SV', 'SR']] },
  Mazda: { 'MX-5 Miata': [1990, 2027, ['Sport', 'Club', 'Grand Touring']], Mazda3: [2004, 2027, ['2.5 S', 'Select', 'Turbo']], 'CX-5': [2013, 2027, ['Sport', 'Select', 'Turbo']], Mazda6: [2003, 2021, ['Sport', 'Touring', 'Grand Touring']] },
  Chevrolet: { Camaro: [1980, 2024, ['1LT', '2SS', 'ZL1']], Corvette: [1984, 2027, ['Stingray', 'Z06', 'E-Ray']], Silverado: [1980, 2027, ['WT', 'LT', 'LTZ']], Malibu: [1997, 2024, ['LS', 'LT', 'Premier']] },
  Hyundai: { Elantra: [1992, 2027, ['SE', 'SEL', 'N Line']], Veloster: [2012, 2022, ['Base', 'Turbo', 'N']], 'Ioniq 5': [2022, 2027, ['SE', 'SEL', 'Limited']], Sonata: [1989, 2027, ['SE', 'SEL', 'N Line']] },
  Kia: { Stinger: [2018, 2023, ['GT-Line', 'GT1', 'GT2']], Forte: [2010, 2027, ['FE', 'LXS', 'GT']], EV6: [2022, 2027, ['Light', 'Wind', 'GT-Line']], Sportage: [1995, 2027, ['LX', 'X-Line', 'X-Pro']] },
  Tesla: { 'Model 3': [2017, 2027, ['RWD', 'Long Range', 'Performance']], 'Model Y': [2020, 2027, ['RWD', 'Long Range', 'Performance']], 'Model S': [2012, 2027, ['Long Range', 'Plaid']], 'Model X': [2016, 2027, ['Long Range', 'Plaid']] },
  Volvo: { S60: [2001, 2027, ['Core', 'Plus', 'Ultimate']], XC60: [2009, 2027, ['Core', 'Plus', 'Ultimate']], XC90: [2003, 2027, ['Core', 'Plus', 'Ultimate']] },
  Lexus: { IS: [1999, 2027, ['300', '350', 'F Sport']], NX: [2015, 2027, ['250', '350h', '450h+']], RX: [1999, 2027, ['350', '350h', '500h']] },
  Porsche: { '911': [1980, 2027, ['Carrera', 'Carrera S', 'Turbo S']], Macan: [2015, 2027, ['Base', 'S', 'GTS']], Cayenne: [2003, 2027, ['Base', 'S', 'GTS']] },
  Jeep: { Wrangler: [1987, 2027, ['Sport', 'Sahara', 'Rubicon']], Gladiator: [2020, 2027, ['Sport', 'Mojave', 'Rubicon']], Cherokee: [1984, 2023, ['Latitude', 'Limited', 'Trailhawk']] },
  Mitsubishi: { Lancer: [1980, 2017, ['ES', 'GTS', 'Evolution']], Outlander: [2003, 2027, ['ES', 'SE', 'SEL']], Eclipse: [1990, 2012, ['GS', 'GT', 'GTS']] }
};

function buildVehicleCatalog() {
  const catalog = {};
  for (let year = 2027; year >= 1980; year -= 1) {
    catalog[year] = {};
    Object.entries(vehicleFamilies).forEach(([make, models]) => {
      const availableModels = Object.entries(models).filter(([, [from, to]]) => year >= from && year <= to);
      if (availableModels.length) catalog[year][make] = Object.fromEntries(availableModels.map(([model, [, , trims]]) => [model, trims]));
    });
  }
  return catalog;
}
const vehicles = buildVehicleCatalog();
const years = Object.keys(vehicles).sort((a, b) => b - a);
function driveOptions(make, model) {
  const defaultDrives = ['FWD', 'RWD', 'AWD'];
  if (['Audi', 'Volkswagen', 'Subaru', 'Volvo', 'Porsche', 'Lexus'].includes(make)) return ['FWD', 'AWD'];
  if (['Ford', 'Jeep', 'Chevrolet', 'Toyota'].includes(make) && ['F-150', 'Bronco', '4Runner', 'Silverado', 'Wrangler', 'Gladiator'].includes(model)) return ['RWD', '4WD'];
  if (['BMW', 'Mercedes-Benz', 'Nissan', 'Mazda', 'Honda', 'Hyundai', 'Kia'].includes(make)) return ['FWD', 'RWD', 'AWD'];
  if (make === 'Tesla') return ['RWD', 'AWD'];
  return defaultDrives;
}

let products = [
  { id: 'fbox-axis-19', category: 'Wheels', brand: 'F-Box', name: 'Axis 19', meta: '19x9.5 +35 · 5x114.3', price: 270, oldPrice: 300, rating: 0, reviews: 0, finish: 'Satin Black', diameter: 19, image: '9025362311e9a376.jpg', badge: 'Hot', deal: 'Availability managed by F-Box', material: 'Rotary Forged', color: 'Satin Black', part: 'FBX-AXI-1995-35', weight: '22.4 lb' },
  { id: 'fbox-velocity-18', category: 'Wheels', brand: 'F-Box', name: 'Velocity 18', meta: '18x8.5 +35 · 5x114.3', price: 230, oldPrice: 250, rating: 0, reviews: 0, finish: 'Bronze Machined', diameter: 18, image: '71118c6795a2a3a8.jpg', badge: 'Sale', deal: 'Availability managed by F-Box', material: 'Cast Aluminum', color: 'Bronze Machined', part: 'FBX-VEL-1885-35', weight: '20.8 lb' },
  { id: 'fbox-forge-20', category: 'Wheels', brand: 'F-Box', name: 'Forge 20', meta: '20x9 +35 · 5x114.3', price: 300, oldPrice: 340, rating: 0, reviews: 0, finish: 'Gloss Black', diameter: 20, image: 'a8d2e56e51bb2d69.jpg', badge: 'New', deal: 'Availability managed by F-Box', material: 'Rotary Forged', color: 'Gloss Black', part: 'FBX-FOR-2090-35', weight: '24.3 lb' },
  { id: 'fbox-drift-18', category: 'Wheels', brand: 'F-Box', name: 'Drift 18', meta: '18x9.5 +35 · 5x114.3', price: 216, oldPrice: 240, rating: 0, reviews: 0, finish: 'Matte Bronze', diameter: 18, image: 'a5816dd04dfd6ee0.jpg', badge: 'Sale', deal: 'Availability managed by F-Box', material: 'Cast Aluminum', color: 'Matte Bronze', part: 'FBX-DRI-1895-35', weight: '21.2 lb' },
  { id: 'fbox-lumen-19', category: 'Wheels', brand: 'F-Box', name: 'Lumen 19', meta: '19x8.5 +35 · 5x112', price: 260, oldPrice: null, rating: 0, reviews: 0, finish: 'Machined Silver', diameter: 19, image: 'fb1db723061ad6df.jpg', badge: '', deal: 'Availability managed by F-Box', material: 'Cast Aluminum', color: 'Machined Silver', part: 'FBX-LUM-1985-35', weight: '23.1 lb' },
  { id: 'fbox-track-17', category: 'Wheels', brand: 'F-Box', name: 'Track 17', meta: '17x8 +35 · 5x114.3', price: 198, oldPrice: null, rating: 0, reviews: 0, finish: 'Hyper Silver', diameter: 17, image: '0dccdbef8e429925.jpg', badge: '', deal: 'Availability managed by F-Box', material: 'Cast Aluminum', color: 'Hyper Silver', part: 'FBX-TRA-1780-35', weight: '18.6 lb' },
  { id: 'fbox-ceramic-pro', category: 'Calipers', brand: 'F-Box Braking', name: 'Ceramic Pro 6P', meta: '6 piston · front axle · 380 mm', price: 1240, oldPrice: 1390, rating: 0, reviews: 0, finish: 'Ceramic White', diameter: 380, image: 'fbox-ceramic-white-reference-pending.svg', badge: 'Sale', deal: 'Availability managed by F-Box', material: 'Forged Aluminum', color: 'Ceramic White', part: 'FBX-CP6-380-WH', weight: '11.8 lb' },
  { id: 'fbox-street-4p', category: 'Calipers', brand: 'F-Box Braking', name: 'Street 4P', meta: '4 piston · front axle · 330 mm', price: 880, oldPrice: null, rating: 0, reviews: 0, finish: 'Electric Blue', diameter: 330, image: 'f5effff1812a14eb.jpg', badge: 'New', deal: 'Availability managed by F-Box', material: 'Forged Aluminum', color: 'Electric Blue', part: 'FBX-ST4-330-BL', weight: '9.4 lb' },
  { id: 'fbox-slotted-380', category: 'Rotors', brand: 'F-Box Braking', name: 'Track Slotted 380', meta: '2-piece · slotted · 380 mm', price: 420, oldPrice: 480, rating: 0, reviews: 0, finish: 'Black Hat', diameter: 380, image: 'e78ac1cfdeae4727.jpg', badge: 'Sale', deal: 'Availability managed by F-Box', material: 'Iron + Aluminum', color: 'Black Hat', part: 'FBX-TS380-2P', weight: '21.3 lb' },
  { id: 'fbox-drilled-330', category: 'Rotors', brand: 'F-Box Braking', name: 'Street Drilled 330', meta: '1-piece · drilled & slotted · 330 mm', price: 278, oldPrice: null, rating: 0, reviews: 0, finish: 'Geomet Coat', diameter: 330, image: '07576b43c0712d61.jpg', badge: '', deal: 'Availability managed by F-Box', material: 'High Carbon Iron', color: 'Geomet Coat', part: 'FBX-SD330-1P', weight: '17.9 lb' },
  { id: 'fbox-race-pad', category: 'Brake Pads', brand: 'F-Box Braking', name: 'R-Compound Pads', meta: 'Low dust · high bite · front axle', price: 168, oldPrice: 190, rating: 0, reviews: 0, finish: 'Carbon Ceramic', diameter: 0, image: '746b0039a724a70a.jpg', badge: 'Sale', deal: 'Availability managed by F-Box', material: 'Carbon Ceramic', color: 'Carbon Ceramic', part: 'FBX-RCP-FR', weight: '4.1 lb' },
  { id: 'fbox-quiet-pad', category: 'Brake Pads', brand: 'F-Box Braking', name: 'Quiet Street Pads', meta: 'Low noise · low dust · front axle', price: 118, oldPrice: null, rating: 0, reviews: 0, finish: 'Ceramic', diameter: 0, image: '333cd3b0b1906049.jpg', badge: '', deal: 'Availability managed by F-Box', material: 'Ceramic', color: 'Ceramic', part: 'FBX-QSP-FR', weight: '3.7 lb' }
];

// Customer reviews and build cases are intentionally empty until verified
// orders are collected. The storefront must never present invented proof.
let reviews = [];
let fboxCases = [];

const categories = [
  ['Wheels', 'The right spoke, width and offset.', 'spark'], ['Calipers', 'Big brake color and control.', 'bolt'], ['Rotors', 'Track-ready bite and cooling.', 'disc'], ['Brake Pads', 'Quiet street to race compounds.', 'shield'], ['Wheel & Tire Packages', 'Mount, balance and save.', 'truck'], ['Suspension', 'Drop it. Dial it. Drive it.', 'arrow']
];
const guideCards = [];

const company = {
  legalName: 'Fanghe Overseas Intelligent Technology Co., Ltd.',
  phone: '+86 14726178447',
  tel: '+8614726178447'
};

// All storefront data and account actions go through the F-Box backend.
// There is no dependency on macrozheng/mall or a third-party mall service.
const mallConfig = {
  portalBase: '/api/fbox-store',
  adminBase: '/api/fbox-ops'
};

const localeOptions = [
  ['en', 'English'], ['zh-CN', '简体中文'], ['zh-TW', '繁體中文'], ['ja', '日本語'], ['ko', '한국어'],
  ['de', 'Deutsch'], ['fr', 'Français'], ['es', 'Español'], ['it', 'Italiano'], ['pt-BR', 'Português (Brasil)'],
  ['ru', 'Русский'], ['ar', 'العربية'], ['nl', 'Nederlands'], ['tr', 'Türkçe'], ['pl', 'Polski'],
  ['vi', 'Tiếng Việt'], ['th', 'ไทย'], ['id', 'Bahasa Indonesia'], ['hi', 'हिन्दी']
];

const localeDictionaries = {
  'zh-CN': {
    'My Account': '我的账户', Cart: '购物车', 'Browse all parts': '浏览全部配件', 'Add my car': '添加我的车辆', 'Search gallery': '搜索案例', Brands: '品牌', Resources: '资源', 'Need help?': '需要帮助？', Shop: '商城', 'Shop now': '立即选购', 'View all parts': '查看全部配件', 'Product reviews': '商品评价', 'Write a review': '写评价', 'Continue shopping': '继续购物', 'Order summary': '订单摘要', 'Continue to checkout': '进入结算', Dismiss: '关闭', 'Shopping cart': '购物车', 'Secure checkout': '安全结算', 'Finish your order.': '完成订单', Customer: '客户信息', Shipping: '配送信息', Payment: '支付信息', Continue: '继续', 'Place demo order': '提交演示订单', 'Buy it now': '立即购买', 'Add to cart': '加入购物车', Details: '详情', Home: '首页', 'All performance parts': '全部性能配件', 'All parts': '全部配件', 'Product type': '产品类型', 'Price range': '价格区间', 'Customer rating': '客户评分', 'Delivery estimate': '配送估算', 'Search by vehicle': '按车型搜索', 'Search products': '搜索商品', 'Search wheels, calipers, rotors, pads...': '搜索轮毂、卡钳、刹车盘、刹车片…'
  },
  'zh-TW': {
    'My Account': '我的帳戶', Cart: '購物車', 'Browse all parts': '瀏覽全部配件', 'Add my car': '加入我的車輛', 'Search gallery': '搜尋案例', Brands: '品牌', Resources: '資源', 'Need help?': '需要協助？', Shop: '商城', 'Shop now': '立即選購', 'View all parts': '查看全部配件', 'Product reviews': '商品評價', 'Write a review': '撰寫評價', 'Continue shopping': '繼續購物', 'Order summary': '訂單摘要', 'Continue to checkout': '前往結帳', Dismiss: '關閉', 'Shopping cart': '購物車', 'Secure checkout': '安全結帳', 'Finish your order.': '完成訂單', Customer: '客戶資訊', Shipping: '配送資訊', Payment: '付款資訊', Continue: '繼續', 'Place demo order': '提交示範訂單', 'Buy it now': '立即購買', 'Add to cart': '加入購物車', Details: '詳情', Home: '首頁', 'All performance parts': '全部性能配件', 'All parts': '全部配件', 'Product type': '產品類型', 'Price range': '價格區間', 'Customer rating': '客戶評分', 'Delivery estimate': '配送估算', 'Search by vehicle': '依車型搜尋', 'Search products': '搜尋商品', 'Search wheels, calipers, rotors, pads...': '搜尋輪圈、卡鉗、煞車碟、煞車片…'
  },
  ja: { 'My Account': 'アカウント', Cart: 'カート', 'Browse all parts': 'すべての商品', 'Add my car': '車両を追加', 'Search gallery': 'ギャラリー', Brands: 'ブランド', Resources: 'リソース', 'Need help?': 'ヘルプ', Shop: 'ショップ', 'Shop now': '今すぐ見る', 'View all parts': 'すべて見る', 'Product reviews': '商品レビュー', 'Write a review': 'レビューを書く', 'Continue shopping': '買い物を続ける', 'Order summary': '注文概要', 'Continue to checkout': 'チェックアウトへ', Dismiss: '閉じる', 'Shopping cart': 'ショッピングカート', 'Secure checkout': '安全なチェックアウト', 'Finish your order.': '注文を完了', Customer: 'お客様情報', Shipping: '配送', Payment: '支払い', Continue: '続ける', 'Place demo order': 'デモ注文を送信', 'Buy it now': '今すぐ購入', 'Add to cart': 'カートに追加', Details: '詳細', Home: 'ホーム', 'All performance parts': '全パフォーマンスパーツ', 'Product type': '商品タイプ', 'Price range': '価格帯', 'Customer rating': '評価', 'Search by vehicle': '車種から検索', 'Search products': '商品を検索' },
  ko: { 'My Account': '내 계정', Cart: '장바구니', 'Browse all parts': '전체 부품 보기', 'Add my car': '내 차량 추가', 'Search gallery': '갤러리 검색', Brands: '브랜드', Resources: '자료실', 'Need help?': '도움이 필요하신가요?', Shop: '쇼핑', 'Shop now': '지금 쇼핑하기', 'View all parts': '전체 부품 보기', 'Product reviews': '상품 리뷰', 'Write a review': '리뷰 작성', 'Continue shopping': '쇼핑 계속하기', 'Order summary': '주문 요약', 'Continue to checkout': '결제로 이동', Dismiss: '닫기', 'Shopping cart': '장바구니', 'Secure checkout': '안전한 결제', 'Finish your order.': '주문 완료', Customer: '고객 정보', Shipping: '배송', Payment: '결제', Continue: '계속', 'Place demo order': '데모 주문 제출', 'Buy it now': '지금 구매', 'Add to cart': '장바구니에 담기', Details: '상세 보기', Home: '홈', 'All performance parts': '전체 퍼포먼스 부품', 'Product type': '상품 유형', 'Price range': '가격 범위', 'Customer rating': '고객 평점', 'Search by vehicle': '차량으로 검색', 'Search products': '상품 검색' },
  de: { 'My Account': 'Mein Konto', Cart: 'Warenkorb', 'Browse all parts': 'Alle Teile', 'Add my car': 'Mein Auto hinzufügen', 'Search gallery': 'Galerie', Brands: 'Marken', Resources: 'Ressourcen', 'Need help?': 'Hilfe benötigt?', Shop: 'Shop', 'Shop now': 'Jetzt shoppen', 'View all parts': 'Alle Teile ansehen', 'Product reviews': 'Produktbewertungen', 'Write a review': 'Bewertung schreiben', 'Continue shopping': 'Weiter einkaufen', 'Order summary': 'Bestellübersicht', 'Continue to checkout': 'Zur Kasse', Dismiss: 'Schließen', 'Shopping cart': 'Warenkorb', 'Secure checkout': 'Sicherer Checkout', 'Finish your order.': 'Bestellung abschließen', Customer: 'Kunde', Shipping: 'Versand', Payment: 'Zahlung', Continue: 'Weiter', 'Place demo order': 'Demo-Bestellung senden', 'Buy it now': 'Jetzt kaufen', 'Add to cart': 'In den Warenkorb', Details: 'Details', Home: 'Startseite', 'All performance parts': 'Alle Performance-Teile', 'Product type': 'Produkttyp', 'Price range': 'Preisbereich', 'Customer rating': 'Kundenbewertung', 'Search by vehicle': 'Nach Fahrzeug suchen', 'Search products': 'Produkte suchen' },
  fr: { 'My Account': 'Mon compte', Cart: 'Panier', 'Browse all parts': 'Toutes les pièces', 'Add my car': 'Ajouter ma voiture', 'Search gallery': 'Galerie', Brands: 'Marques', Resources: 'Ressources', 'Need help?': 'Besoin d’aide ?', Shop: 'Boutique', 'Shop now': 'Acheter maintenant', 'View all parts': 'Voir toutes les pièces', 'Product reviews': 'Avis produits', 'Write a review': 'Écrire un avis', 'Continue shopping': 'Continuer les achats', 'Order summary': 'Récapitulatif', 'Continue to checkout': 'Passer au paiement', Dismiss: 'Fermer', 'Shopping cart': 'Panier', 'Secure checkout': 'Paiement sécurisé', 'Finish your order.': 'Finaliser la commande', Customer: 'Client', Shipping: 'Livraison', Payment: 'Paiement', Continue: 'Continuer', 'Place demo order': 'Envoyer la commande démo', 'Buy it now': 'Acheter maintenant', 'Add to cart': 'Ajouter au panier', Details: 'Détails', Home: 'Accueil', 'All performance parts': 'Toutes les pièces performance', 'Product type': 'Type de produit', 'Price range': 'Fourchette de prix', 'Customer rating': 'Note client', 'Search by vehicle': 'Rechercher par véhicule', 'Search products': 'Rechercher des produits' },
  es: { 'My Account': 'Mi cuenta', Cart: 'Carrito', 'Browse all parts': 'Todas las piezas', 'Add my car': 'Añadir mi coche', 'Search gallery': 'Galería', Brands: 'Marcas', Resources: 'Recursos', 'Need help?': '¿Necesitas ayuda?', Shop: 'Tienda', 'Shop now': 'Comprar ahora', 'View all parts': 'Ver todas las piezas', 'Product reviews': 'Opiniones', 'Write a review': 'Escribir opinión', 'Continue shopping': 'Seguir comprando', 'Order summary': 'Resumen del pedido', 'Continue to checkout': 'Ir al checkout', Dismiss: 'Cerrar', 'Shopping cart': 'Carrito', 'Secure checkout': 'Checkout seguro', 'Finish your order.': 'Finaliza tu pedido', Customer: 'Cliente', Shipping: 'Envío', Payment: 'Pago', Continue: 'Continuar', 'Place demo order': 'Enviar pedido demo', 'Buy it now': 'Comprar ahora', 'Add to cart': 'Añadir al carrito', Details: 'Detalles', Home: 'Inicio', 'All performance parts': 'Todas las piezas de rendimiento', 'Product type': 'Tipo de producto', 'Price range': 'Rango de precio', 'Customer rating': 'Valoración', 'Search by vehicle': 'Buscar por vehículo', 'Search products': 'Buscar productos' },
  'pt-BR': { 'My Account': 'Minha conta', Cart: 'Carrinho', 'Browse all parts': 'Todas as peças', 'Add my car': 'Adicionar meu carro', 'Search gallery': 'Galeria', Brands: 'Marcas', Resources: 'Recursos', 'Need help?': 'Precisa de ajuda?', Shop: 'Loja', 'Shop now': 'Comprar agora', 'View all parts': 'Ver todas as peças', 'Product reviews': 'Avaliações', 'Write a review': 'Escrever avaliação', 'Continue shopping': 'Continuar comprando', 'Order summary': 'Resumo do pedido', 'Continue to checkout': 'Ir para checkout', Dismiss: 'Fechar', 'Shopping cart': 'Carrinho', 'Secure checkout': 'Checkout seguro', 'Finish your order.': 'Finalize seu pedido', Customer: 'Cliente', Shipping: 'Entrega', Payment: 'Pagamento', Continue: 'Continuar', 'Place demo order': 'Enviar pedido de demonstração', 'Buy it now': 'Comprar agora', 'Add to cart': 'Adicionar ao carrinho', Details: 'Detalhes', Home: 'Início', 'All performance parts': 'Todas as peças de performance', 'Product type': 'Tipo de produto', 'Price range': 'Faixa de preço', 'Customer rating': 'Avaliação do cliente', 'Search by vehicle': 'Buscar por veículo', 'Search products': 'Buscar produtos' },
  ru: { 'My Account': 'Мой аккаунт', Cart: 'Корзина', 'Browse all parts': 'Все детали', 'Add my car': 'Добавить автомобиль', 'Search gallery': 'Галерея', Brands: 'Бренды', Resources: 'Ресурсы', 'Need help?': 'Нужна помощь?', Shop: 'Магазин', 'Shop now': 'Купить сейчас', 'View all parts': 'Все детали', 'Product reviews': 'Отзывы', 'Write a review': 'Оставить отзыв', 'Continue shopping': 'Продолжить покупки', 'Order summary': 'Сводка заказа', 'Continue to checkout': 'Перейти к оплате', Dismiss: 'Закрыть', 'Shopping cart': 'Корзина', 'Secure checkout': 'Безопасная оплата', 'Finish your order.': 'Завершите заказ', Customer: 'Покупатель', Shipping: 'Доставка', Payment: 'Оплата', Continue: 'Продолжить', 'Place demo order': 'Отправить демо-заказ', 'Buy it now': 'Купить сейчас', 'Add to cart': 'В корзину', Details: 'Подробнее', Home: 'Главная', 'All performance parts': 'Все спортивные детали', 'Product type': 'Тип товара', 'Price range': 'Диапазон цен', 'Customer rating': 'Рейтинг клиентов', 'Search by vehicle': 'Поиск по автомобилю', 'Search products': 'Поиск товаров' },
  ar: { 'My Account': 'حسابي', Cart: 'السلة', 'Browse all parts': 'كل القطع', 'Add my car': 'أضف سيارتي', 'Search gallery': 'المعرض', Brands: 'العلامات التجارية', Resources: 'المصادر', 'Need help?': 'هل تحتاج مساعدة؟', Shop: 'المتجر', 'Shop now': 'تسوق الآن', 'View all parts': 'عرض كل القطع', 'Product reviews': 'تقييمات المنتجات', 'Write a review': 'اكتب تقييمًا', 'Continue shopping': 'متابعة التسوق', 'Order summary': 'ملخص الطلب', 'Continue to checkout': 'المتابعة للدفع', Dismiss: 'إغلاق', 'Shopping cart': 'سلة التسوق', 'Secure checkout': 'دفع آمن', 'Finish your order.': 'أكمل طلبك', Customer: 'العميل', Shipping: 'الشحن', Payment: 'الدفع', Continue: 'متابعة', 'Place demo order': 'إرسال طلب تجريبي', 'Buy it now': 'اشتر الآن', 'Add to cart': 'أضف إلى السلة', Details: 'التفاصيل', Home: 'الرئيسية', 'All performance parts': 'كل قطع الأداء', 'Product type': 'نوع المنتج', 'Price range': 'نطاق السعر', 'Customer rating': 'تقييم العملاء', 'Search by vehicle': 'البحث حسب السيارة', 'Search products': 'البحث عن المنتجات' },
  it: { 'My Account': 'Il mio account', Cart: 'Carrello', 'Browse all parts': 'Tutti i componenti', 'Add my car': 'Aggiungi la mia auto', 'Search gallery': 'Galleria', Brands: 'Brand', Resources: 'Risorse', 'Need help?': 'Serve aiuto?', Shop: 'Shop', 'Shop now': 'Acquista ora', 'View all parts': 'Vedi tutti i componenti', 'Product reviews': 'Recensioni', 'Write a review': 'Scrivi una recensione', 'Continue shopping': 'Continua lo shopping', 'Order summary': 'Riepilogo ordine', 'Continue to checkout': 'Vai al checkout', Dismiss: 'Chiudi', 'Shopping cart': 'Carrello', 'Secure checkout': 'Checkout sicuro', 'Finish your order.': 'Completa il tuo ordine', Customer: 'Cliente', Shipping: 'Spedizione', Payment: 'Pagamento', Continue: 'Continua', 'Place demo order': 'Invia ordine demo', 'Buy it now': 'Acquista ora', 'Add to cart': 'Aggiungi al carrello', Details: 'Dettagli', Home: 'Home', 'Product type': 'Tipo di prodotto', 'Price range': 'Fascia di prezzo', 'Customer rating': 'Valutazione cliente', 'Search by vehicle': 'Cerca per veicolo', 'Search products': 'Cerca prodotti' },
  tr: { 'My Account': 'Hesabım', Cart: 'Sepet', 'Browse all parts': 'Tüm parçalar', 'Add my car': 'Aracımı ekle', 'Search gallery': 'Galeri', Brands: 'Markalar', Resources: 'Kaynaklar', 'Need help?': 'Yardıma mı ihtiyacınız var?', Shop: 'Mağaza', 'Shop now': 'Şimdi alışveriş yap', 'View all parts': 'Tüm parçaları gör', 'Product reviews': 'Ürün yorumları', 'Write a review': 'Yorum yaz', 'Continue shopping': 'Alışverişe devam et', 'Order summary': 'Sipariş özeti', 'Continue to checkout': 'Ödemeye geç', Dismiss: 'Kapat', 'Shopping cart': 'Sepet', 'Secure checkout': 'Güvenli ödeme', 'Finish your order.': 'Siparişinizi tamamlayın', Customer: 'Müşteri', Shipping: 'Kargo', Payment: 'Ödeme', Continue: 'Devam', 'Place demo order': 'Demo siparişi gönder', 'Buy it now': 'Şimdi satın al', 'Add to cart': 'Sepete ekle', Details: 'Detaylar', Home: 'Ana sayfa', 'Product type': 'Ürün türü', 'Price range': 'Fiyat aralığı', 'Customer rating': 'Müşteri puanı', 'Search by vehicle': 'Araca göre ara', 'Search products': 'Ürün ara' },
  vi: { 'My Account': 'Tài khoản', Cart: 'Giỏ hàng', 'Browse all parts': 'Tất cả phụ tùng', 'Add my car': 'Thêm xe của tôi', 'Search gallery': 'Thư viện xe', Brands: 'Thương hiệu', Resources: 'Tài nguyên', 'Need help?': 'Cần hỗ trợ?', Shop: 'Cửa hàng', 'Shop now': 'Mua ngay', 'View all parts': 'Xem tất cả phụ tùng', 'Product reviews': 'Đánh giá sản phẩm', 'Write a review': 'Viết đánh giá', 'Continue shopping': 'Tiếp tục mua sắm', 'Order summary': 'Tóm tắt đơn hàng', 'Continue to checkout': 'Đến thanh toán', Dismiss: 'Đóng', 'Shopping cart': 'Giỏ hàng', 'Secure checkout': 'Thanh toán an toàn', 'Finish your order.': 'Hoàn tất đơn hàng', Customer: 'Khách hàng', Shipping: 'Giao hàng', Payment: 'Thanh toán', Continue: 'Tiếp tục', 'Place demo order': 'Gửi đơn thử nghiệm', 'Buy it now': 'Mua ngay', 'Add to cart': 'Thêm vào giỏ', Details: 'Chi tiết', Home: 'Trang chủ', 'Product type': 'Loại sản phẩm', 'Price range': 'Khoảng giá', 'Customer rating': 'Đánh giá khách hàng', 'Search by vehicle': 'Tìm theo xe', 'Search products': 'Tìm sản phẩm' }
};

Object.assign(localeDictionaries, {
  nl: { 'My Account': 'Mijn account', Cart: 'Winkelwagen', 'Browse all parts': 'Alle onderdelen', 'Add my car': 'Mijn auto toevoegen', 'Search gallery': 'Galerij', Brands: 'Merken', Resources: 'Bronnen', Shop: 'Shop', 'Shop now': 'Nu shoppen', 'View all parts': 'Alle onderdelen bekijken', 'Product reviews': 'Productreviews', 'Write a review': 'Review schrijven', 'Continue shopping': 'Verder winkelen', 'Order summary': 'Besteloverzicht', 'Continue to checkout': 'Naar afrekenen', Dismiss: 'Sluiten', 'Shopping cart': 'Winkelwagen', 'Secure checkout': 'Veilig afrekenen', Continue: 'Doorgaan', 'Buy it now': 'Nu kopen', 'Add to cart': 'In winkelwagen', Details: 'Details', Home: 'Home', 'Product type': 'Producttype', 'Price range': 'Prijsbereik', 'Customer rating': 'Klantbeoordeling', 'Search by vehicle': 'Zoeken op voertuig', 'Search products': 'Producten zoeken' },
  pl: { 'My Account': 'Moje konto', Cart: 'Koszyk', 'Browse all parts': 'Wszystkie części', 'Add my car': 'Dodaj mój samochód', 'Search gallery': 'Galeria', Brands: 'Marki', Resources: 'Materiały', Shop: 'Sklep', 'Shop now': 'Kup teraz', 'View all parts': 'Zobacz wszystkie części', 'Product reviews': 'Opinie o produkcie', 'Write a review': 'Napisz opinię', 'Continue shopping': 'Kontynuuj zakupy', 'Order summary': 'Podsumowanie zamówienia', 'Continue to checkout': 'Przejdź do kasy', Dismiss: 'Zamknij', 'Shopping cart': 'Koszyk', 'Secure checkout': 'Bezpieczna płatność', Continue: 'Dalej', 'Buy it now': 'Kup teraz', 'Add to cart': 'Dodaj do koszyka', Details: 'Szczegóły', Home: 'Strona główna', 'Product type': 'Typ produktu', 'Price range': 'Zakres cen', 'Customer rating': 'Ocena klienta', 'Search by vehicle': 'Szukaj po pojeździe', 'Search products': 'Szukaj produktów' },
  th: { 'My Account': 'บัญชีของฉัน', Cart: 'รถเข็น', 'Browse all parts': 'ดูชิ้นส่วนทั้งหมด', 'Add my car': 'เพิ่มรถของฉัน', 'Search gallery': 'แกลเลอรี', Brands: 'แบรนด์', Resources: 'แหล่งข้อมูล', Shop: 'ร้านค้า', 'Shop now': 'เลือกซื้อเลย', 'View all parts': 'ดูชิ้นส่วนทั้งหมด', 'Product reviews': 'รีวิวสินค้า', 'Write a review': 'เขียนรีวิว', 'Continue shopping': 'ช้อปต่อ', 'Order summary': 'สรุปคำสั่งซื้อ', 'Continue to checkout': 'ไปชำระเงิน', Dismiss: 'ปิด', 'Shopping cart': 'รถเข็น', 'Secure checkout': 'ชำระเงินที่ปลอดภัย', Continue: 'ดำเนินการต่อ', 'Buy it now': 'ซื้อเลย', 'Add to cart': 'เพิ่มลงรถเข็น', Details: 'รายละเอียด', Home: 'หน้าแรก', 'Product type': 'ประเภทสินค้า', 'Price range': 'ช่วงราคา', 'Customer rating': 'คะแนนลูกค้า', 'Search by vehicle': 'ค้นหาตามรถ', 'Search products': 'ค้นหาสินค้า' },
  id: { 'My Account': 'Akun saya', Cart: 'Keranjang', 'Browse all parts': 'Semua suku cadang', 'Add my car': 'Tambah mobil saya', 'Search gallery': 'Galeri', Brands: 'Merek', Resources: 'Sumber daya', Shop: 'Toko', 'Shop now': 'Belanja sekarang', 'View all parts': 'Lihat semua suku cadang', 'Product reviews': 'Ulasan produk', 'Write a review': 'Tulis ulasan', 'Continue shopping': 'Lanjut belanja', 'Order summary': 'Ringkasan pesanan', 'Continue to checkout': 'Lanjut ke pembayaran', Dismiss: 'Tutup', 'Shopping cart': 'Keranjang', 'Secure checkout': 'Checkout aman', Continue: 'Lanjut', 'Buy it now': 'Beli sekarang', 'Add to cart': 'Tambah ke keranjang', Details: 'Detail', Home: 'Beranda', 'Product type': 'Jenis produk', 'Price range': 'Rentang harga', 'Customer rating': 'Penilaian pelanggan', 'Search by vehicle': 'Cari berdasarkan kendaraan', 'Search products': 'Cari produk' },
  hi: { 'My Account': 'मेरा खाता', Cart: 'कार्ट', 'Browse all parts': 'सभी पार्ट्स देखें', 'Add my car': 'मेरी कार जोड़ें', 'Search gallery': 'गैलरी', Brands: 'ब्रांड', Resources: 'संसाधन', Shop: 'शॉप', 'Shop now': 'अभी खरीदें', 'View all parts': 'सभी पार्ट्स देखें', 'Product reviews': 'उत्पाद समीक्षाएं', 'Write a review': 'समीक्षा लिखें', 'Continue shopping': 'खरीदारी जारी रखें', 'Order summary': 'ऑर्डर सारांश', 'Continue to checkout': 'चेकआउट पर जाएं', Dismiss: 'बंद करें', 'Shopping cart': 'शॉपिंग कार्ट', 'Secure checkout': 'सुरक्षित चेकआउट', Continue: 'जारी रखें', 'Buy it now': 'अभी खरीदें', 'Add to cart': 'कार्ट में जोड़ें', Details: 'विवरण', Home: 'होम', 'Product type': 'उत्पाद प्रकार', 'Price range': 'मूल्य सीमा', 'Customer rating': 'ग्राहक रेटिंग', 'Search by vehicle': 'वाहन से खोजें', 'Search products': 'उत्पाद खोजें' }
});

function localeLabel(code) { return localeOptions.find(([value]) => value === code)?.[1] || 'English'; }
function browserLocale() {
  const raw = String(navigator.language || 'en').toLowerCase();
  if (raw.startsWith('zh-tw') || raw.startsWith('zh-hk') || raw.startsWith('zh-mo')) return 'zh-TW';
  if (raw.startsWith('zh')) return 'zh-CN';
  const exact = localeOptions.find(([value]) => raw === value.toLowerCase() || raw.startsWith(`${value.toLowerCase()}-`));
  return exact?.[0] || 'en';
}
function countryLocale(countryCode = '') {
  const code = countryCode.toUpperCase();
  if (code === 'CN') return 'zh-CN';
  if (['TW', 'HK', 'MO'].includes(code)) return 'zh-TW';
  if (code === 'JP') return 'ja';
  if (code === 'KR') return 'ko';
  if (['DE', 'AT', 'CH', 'LI'].includes(code)) return 'de';
  if (['FR', 'BE', 'LU', 'MC'].includes(code)) return 'fr';
  if (['ES', 'MX', 'AR', 'CL', 'CO', 'PE', 'UY', 'EC', 'CR', 'PA'].includes(code)) return 'es';
  if (['IT', 'SM', 'VA'].includes(code)) return 'it';
  if (['BR', 'PT'].includes(code)) return 'pt-BR';
  if (['RU', 'KZ', 'BY', 'UA'].includes(code)) return 'ru';
  if (['SA', 'AE', 'QA', 'KW', 'BH', 'OM', 'EG', 'JO', 'MA'].includes(code)) return 'ar';
  if (code === 'TR') return 'tr';
  if (code === 'VN') return 'vi';
  if (code === 'TH') return 'th';
  if (['ID', 'MY'].includes(code)) return 'id';
  if (code === 'IN') return 'hi';
  if (code === 'PL') return 'pl';
  if (code === 'NL') return 'nl';
  return 'en';
}
function initialLocale() { return localStorage.getItem('fbox-locale') || browserLocale() || 'en'; }

const state = {
  route: getRoute(),
  menuOpen: false,
  mobileNav: false,
  chatOpen: false,
  chatSessionId: localStorage.getItem('fbox-chat-session') || '',
  chatMessages: [],
  chatSending: false,
  cookie: localStorage.getItem('fbox-cookie') !== 'dismissed',
  modal: null,
  toast: '',
  search: '',
  vehicle: JSON.parse(localStorage.getItem('fbox-vehicle') || 'null'),
  filters: { category: 'All', saleOnly: false, finish: 'All', diameter: 'All', minPrice: '', maxPrice: '', minRating: '0' },
  sort: 'latest',
  wishlist: JSON.parse(localStorage.getItem('fbox-wishlist') || '[]'),
  cart: JSON.parse(localStorage.getItem('fbox-cart') || '[]'),
  productImage: {},
  reviewLimit: 3,
  checkoutStep: 1,
  locale: initialLocale(),
  localeMode: localStorage.getItem('fbox-locale') ? 'manual' : 'auto',
  localeCountry: '',
  mallToken: localStorage.getItem('fbox-mall-token') || '',
  account: null,
  catalogLoaded: false,
  checkoutForm: JSON.parse(localStorage.getItem('fbox-checkout-form') || '{}'),
  lastOrder: null,
  backend: { portal: 'testing', admin: 'testing', checked: false, checking: false },
  fboxVehicleRecords: [],
  fboxVehicleLibrary: { ready: false, source: 'local-fallback', total: 0, officialSpecs: 0 },
  accountOrders: [],
  accountOrdersLoading: false,
  wheelVisualizer: null
};

function getRoute() {
  const raw = location.hash.replace(/^#/, '') || 'home';
  const [path] = raw.split('?');
  if (path.startsWith('product/')) return { name: 'product', id: path.split('/')[1] };
  if (path === 'store' || path === 'cart' || path === 'home') return { name: path };
  return { name: 'home' };
}
function esc(value = '') { return String(value).replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c])); }
function assetUrl(value = '') {
  const source = String(value || '');
  return /^(?:https?:|data:|\/|\.\.?\/)/i.test(source) ? source : `${ASSET}${source}`;
}
function money(value) { return `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; }
function stars(rating) { return Number(rating) > 0 ? `<span class="stars" aria-label="${rating} out of 5">★★★★★</span>` : '<span class="rating-empty">No verified reviews yet</span>'; }
function productGallery(item) {
  const stored = Array.isArray(item?.images) ? item.images.map(image => typeof image === 'string' ? image : image?.url).filter(Boolean) : [];
  const fallback = item?.image ? [item.image, 'a7dd472643daf9b4.jpg', 'ff2a26733252a2c8.jpg'] : [];
  return [...new Set((stored.length ? stored : fallback).filter(Boolean))];
}
function hasStartingPrice(item) { return item?.price_mode === 'from'; }
function productPriceText(item) { return hasStartingPrice(item) ? 'From US' + money(item.price) : money(item.price); }
function product(id) { return products.find(item => item.id === id) || products[0]; }
function persist() { localStorage.setItem('fbox-cart', JSON.stringify(state.cart)); localStorage.setItem('fbox-wishlist', JSON.stringify(state.wishlist)); if (state.vehicle) localStorage.setItem('fbox-vehicle', JSON.stringify(state.vehicle)); }
function setToast(message) { state.toast = message; render(); window.clearTimeout(setToast.timer); setToast.timer = window.setTimeout(() => { state.toast = ''; render(); }, 2800); }
function go(hash) { state.modal = null; location.hash = hash; }
function cartCount() { return state.cart.reduce((sum, item) => sum + item.qty, 0); }
function cartTotal() { return state.cart.reduce((sum, item) => sum + item.qty * product(item.id).price, 0); }
function currentVehicleLabel() { return state.vehicle ? [state.vehicle.year, state.vehicle.make, state.vehicle.model, state.vehicle.trim].filter(Boolean).join(' ') : 'Select your vehicle'; }
function currentVehicleRecord() {
  const selected = state.vehicle || {};
  const matches = state.fboxVehicleRecords.filter(record => Number(record.year) === Number(selected.year) && record.make === selected.make && record.model === selected.model && record.trim === selected.trim);
  return matches.find(record => !selected.drive || !record.drive || record.drive === selected.drive) || matches[0] || null;
}
function currentOfficialWheelSpecs() {
  const record = currentVehicleRecord();
  return record?.oem_wheel_specs || {};
}

const wheelVisualizerDefaults = () => ({
  open: false,
  productId: '',
  referenceImage: '',
  phase: 'upload',
  vehicleFile: null,
  vehicleUrl: '',
  vehicleName: '',
  crop: { zoom: 1, x: 50, y: 50 },
  jobId: '',
  results: [],
  error: '',
  errorCode: '',
  resultViewer: null,
  inquiry: null,
  mode: 'fbox-lingkeai'
});
state.wheelVisualizer = wheelVisualizerDefaults();

function wheelVisualizerState(productId = '', referenceImage = '') {
  const item = product(productId);
  return { ...wheelVisualizerDefaults(), open: true, productId, referenceImage: referenceImage || state.productImage[productId] || item.image };
}
function wheelVisualizerItem() {
  return product(state.wheelVisualizer?.productId || state.route.id);
}
function wheelVisualizerAngleLabel(angle) {
  return ({
    front_left: 'Front three-quarter',
    front_right: 'Front three-quarter',
    side_profile: 'Side profile'
  })[angle] || angle || 'Generated view';
}
function wheelVisualizerFormatBytes(bytes = 0) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
function wheelVisualizerCropStyle(crop = state.wheelVisualizer?.crop || {}) {
  const zoom = Number(crop.zoom || 1);
  const x = Number(crop.x ?? 50);
  const y = Number(crop.y ?? 50);
  const translateX = ((50 - x) * 0.75).toFixed(2);
  const translateY = ((50 - y) * 0.75).toFixed(2);
  return `transform:translate3d(${translateX}%,${translateY}%,0) scale(${zoom});transform-origin:center center;`;
}
function wheelVisualizerUpdateCropPreview() {
  const crop = state.wheelVisualizer?.crop;
  if (!crop) return;
  const image = document.querySelector('[data-wheel-crop-image]');
  if (image) image.setAttribute('style', wheelVisualizerCropStyle(crop));
  Object.entries(crop).forEach(([key, value]) => {
    const input = document.querySelector(`[data-wheel-crop="${key}"]`);
    if (input) input.value = value;
    const output = document.querySelector(`[data-wheel-crop-output="${key}"]`);
    if (output) output.textContent = key === 'zoom' ? `${Number(value).toFixed(2)}×` : `${value}%`;
  });
}
function wheelVisualizerClose() {
  const current = state.wheelVisualizer;
  if (current?.vehicleUrl?.startsWith('blob:')) URL.revokeObjectURL(current.vehicleUrl);
  state.wheelVisualizer = wheelVisualizerDefaults();
  render();
}
function wheelVisualizerReset(nextPhase = 'upload') {
  const current = state.wheelVisualizer || wheelVisualizerDefaults();
  if (current.vehicleUrl?.startsWith('blob:')) URL.revokeObjectURL(current.vehicleUrl);
  state.wheelVisualizer = { ...wheelVisualizerDefaults(), open: true, productId: current.productId, phase: nextPhase };
  render();
}
function wheelVisualizerHandleFile(file) {
  if (!file) return;
  const fileType = String(file.type || '').toLowerCase();
  const fileName = String(file.name || '').toLowerCase();
  const hasSupportedImageType = fileType.startsWith('image/') || /\.(?:jpe?g|png|webp|heic|heif)$/i.test(fileName);
  if (!hasSupportedImageType) {
    state.wheelVisualizer.error = 'Please choose a JPG, PNG, WEBP or HEIC image.';
    state.wheelVisualizer.phase = 'error';
    render();
    return;
  }
  if (file.size > 20 * 1024 * 1024) {
    state.wheelVisualizer.error = 'This image is larger than 20 MB. Please choose a smaller photo.';
    state.wheelVisualizer.phase = 'error';
    render();
    return;
  }
  const current = state.wheelVisualizer;
  if (current.vehicleUrl?.startsWith('blob:')) URL.revokeObjectURL(current.vehicleUrl);
  current.vehicleFile = file;
  current.vehicleUrl = URL.createObjectURL(file);
  current.vehicleName = file.name;
  current.crop = { zoom: 1, x: 50, y: 50 };
  current.phase = 'crop';
  current.error = '';
  render();
}
function wheelVisualizerPrepareImage(blob) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(blob);
    const image = new Image();
    image.onload = () => {
      try {
        const naturalWidth = image.naturalWidth || image.width;
        const naturalHeight = image.naturalHeight || image.height;
        if (!naturalWidth || !naturalHeight) throw new Error('The selected image has no readable dimensions.');
        let width = Math.min(naturalWidth, 2200);
        let height = Math.max(1, Math.round(naturalHeight * (width / naturalWidth)));
        let output = '';
        for (let attempt = 0; attempt < 6; attempt += 1) {
          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.round(width));
          canvas.height = Math.max(1, Math.round(height));
          const context = canvas.getContext('2d', { alpha: false });
          if (!context) throw new Error('This browser cannot prepare the selected image.');
          context.fillStyle = '#ffffff';
          context.fillRect(0, 0, canvas.width, canvas.height);
          context.drawImage(image, 0, 0, canvas.width, canvas.height);
          output = canvas.toDataURL('image/jpeg', Math.max(0.56, 0.84 - attempt * 0.05));
          if (output.length <= 5 * 1024 * 1024 || attempt === 5) break;
          width = Math.max(960, width * 0.82);
          height = Math.max(1, Math.round(naturalHeight * (width / naturalWidth)));
        }
        if (!output) throw new Error('The selected image could not be prepared.');
        resolve(output);
      } catch (error) {
        reject(error);
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      const name = String(blob?.name || '').toLowerCase();
      const type = String(blob?.type || '').toLowerCase();
      if (type.includes('heic') || type.includes('heif') || /\.(?:heic|heif)$/i.test(name)) {
        reject(new Error('This phone photo is HEIC/HEIF and cannot be converted by this browser. Export it as JPG from your photo app, then try again.'));
        return;
      }
      reject(new Error('The selected image could not be read. Please choose a JPG, PNG or WEBP photo.'));
    };
    image.src = objectUrl;
  });
}
async function wheelVisualizerRemoteJob(request) {
  const vehicleImage = await wheelVisualizerPrepareImage(request.file);
  let productImage = '';
  if (request.referenceImage || request.product.image) {
    const productResponse = await fetch(assetUrl(request.referenceImage || request.product.image));
    if (!productResponse.ok) throw new Error('The selected product reference could not be loaded.');
    productImage = await wheelVisualizerPrepareImage(await productResponse.blob());
  }
  const body = {
    vehicle_image: vehicleImage,
    product_image: productImage,
    product_id: request.product.id,
    product_name: request.product.name,
    product_category: request.product.category,
    product_finish: request.product.finish,
    product_fitment: request.product.meta,
    vehicle_name: currentVehicleLabel(),
    vehicle_file_name: request.file?.name || '',
    crop: request.crop,
    angles: 3
  };
  const response = await fetch('/api/wheel-visualizer/jobs', { method: 'POST', body: JSON.stringify(body), headers: { Accept: 'application/json', 'Content-Type': 'application/json' } });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) { const error = new Error(payload.message || payload.detail || payload.error?.message || 'The F-Box AI visualizer is unavailable.'); error.status = response.status; throw error; }
  return payload.data || payload;
}
async function createWheelVisualizerJob() {
  const current = state.wheelVisualizer;
  const item = wheelVisualizerItem();
  const request = { file: current.vehicleFile, vehicleUrl: current.vehicleUrl, crop: current.crop, referenceImage: current.referenceImage || item.image, product: item };
  if (window.FBOX_WHEEL_VISUALIZER_API?.create) return window.FBOX_WHEEL_VISUALIZER_API.create(request);
  return wheelVisualizerRemoteJob(request);
}
async function wheelVisualizerStart() {
  const current = state.wheelVisualizer;
  if (!current?.vehicleFile) return;
  current.phase = 'generating';
  current.error = '';
  current.errorCode = '';
  current.jobId = '';
  render();
  try {
    const result = await createWheelVisualizerJob();
    if (result?.status === 'queued' || result?.status === 'running') {
      current.jobId = result.jobId || result.job_id || '';
      current.phase = 'generating';
      render();
      await wheelVisualizerPoll(current.jobId);
      return;
    }
    current.jobId = result?.jobId || result?.job_id || '';
    current.results = (result?.results || []).slice(0, 3);
    current.mode = result?.mode || 'fbox-lingkeai';
    if (current.results.length !== 3) throw new Error('The preview service returned fewer than 3 angles.');
    current.phase = 'results';
    render();
  } catch (error) {
    current.phase = 'error';
    current.errorCode = error?.code || '';
    current.error = error?.message || 'We could not generate the visual preview.';
    render();
  }
}
async function wheelVisualizerResume() {
  const current = state.wheelVisualizer;
  if (!current?.vehicleFile || !current.jobId) return wheelVisualizerStart();
  current.phase = 'generating';
  current.error = '';
  current.errorCode = '';
  render();
  try {
    await wheelVisualizerPoll(current.jobId);
  } catch (error) {
    current.phase = 'error';
    current.errorCode = error?.code || '';
    current.error = error?.message || 'We could not resume the visual preview.';
    render();
  }
}
async function wheelVisualizerPoll(jobId) {
  if (!jobId) throw new Error('The preview job did not return an id.');
  const pollIntervalMs = 1500;
  const maxWaitMs = 360000;
  const maxAttempts = Math.ceil(maxWaitMs / pollIntervalMs);
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    await new Promise(resolve => window.setTimeout(resolve, pollIntervalMs));
    const response = await fetch(`/api/wheel-visualizer/jobs/${encodeURIComponent(jobId)}`, { headers: { Accept: 'application/json' } });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.message || payload.detail || payload.error?.message || 'The preview job could not be checked.');
    const result = payload.data || payload;
    if (result.status === 'failed') {
      const error = new Error(result.message || 'The preview job failed.');
      error.code = 'JOB_FAILED';
      throw error;
    }
    if (result.status === 'canceled') {
      const error = new Error('The preview job was canceled.');
      error.code = 'JOB_CANCELED';
      throw error;
    }
    if (result.status === 'succeeded' || result.status === 'completed') {
      const current = state.wheelVisualizer;
      current.results = (result.results || []).slice(0, 3);
      current.mode = result.mode || 'fbox-lingkeai';
      if (current.results.length !== 3) throw new Error('The preview service returned fewer than 3 angles.');
      current.phase = 'results';
      render();
      return;
    }
  }
  const timeout = new Error('This preview is still processing. Continue waiting to reuse this request; a new image task will not be created.');
  timeout.code = 'POLL_TIMEOUT';
  throw timeout;
}

async function mallRequest(base, endpoint, options = {}) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), options.timeout || 5000);
  const headers = { Accept: 'application/json', ...(options.headers || {}) };
  if (state.mallToken) headers.Authorization = state.mallToken;
  try {
    const response = await fetch(`${base}${endpoint}`, { ...options, headers, signal: controller.signal });
    const text = await response.text();
    let payload = null;
    try { payload = text ? JSON.parse(text) : null; } catch { payload = text; }
    if (!response.ok) throw new Error(`F-Box request failed: ${response.status}`);
    if (payload && typeof payload === 'object' && payload.code !== undefined && payload.code !== 200) {
      throw new Error(payload.message || 'F-Box request failed');
    }
    return payload?.data ?? payload;
  } finally {
    window.clearTimeout(timeout);
  }
}

function mallStatusLabel(status) {
  if (status === 'connected') return 'Connected';
  if (status === 'checking') return 'Checking';
  return 'Unavailable';
}
function mallStatusChip(kind = 'portal') {
  const status = state.backend[kind] || 'testing';
  return `<span class="integration-chip ${status === 'connected' ? 'is-live' : 'is-testing'}"><i></i>F-Box ${kind === 'portal' ? 'store' : 'admin'} API · ${mallStatusLabel(status)}</span>`;
}
async function checkMallBackend() {
  if (state.backend.checking) return;
  state.backend.checking = true;
  state.backend.portal = 'checking';
  state.backend.admin = 'checking';
  render();
  const [portal, admin] = await Promise.allSettled([
    fetch(`${mallConfig.portalBase}/products`, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(8000) }),
    fetch('/api/fbox-content/vehicles', { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(8000) })
  ]);
  state.backend.portal = portal.status === 'fulfilled' && portal.value.ok ? 'connected' : 'testing';
  state.backend.admin = admin.status === 'fulfilled' && admin.value.ok ? 'connected' : 'testing';
  state.backend.checked = true;
  state.backend.checking = false;
  render();
}

function applyProductReviewStats(catalog) {
  return catalog.map(item => {
    const productReviews = reviews.filter(review => review.product_id === item.id);
    if (!productReviews.length) return { ...item, rating: 0, reviews: 0 };
    const rating = productReviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / productReviews.length;
    return { ...item, rating: Number(rating.toFixed(1)), reviews: productReviews.length };
  });
}

async function loadFBoxContent() {
  try {
    const [vehicleResponse, reviewResponse, caseResponse] = await Promise.all([
      fetch('/api/fbox-content/vehicles', { headers: { Accept: 'application/json' } }),
      fetch('/api/fbox-content/reviews?status=approved', { headers: { Accept: 'application/json' } }),
      fetch('/api/fbox-content/cases?status=published', { headers: { Accept: 'application/json' } })
    ]);
    const vehiclePayload = await vehicleResponse.json().catch(() => ({}));
    const reviewPayload = await reviewResponse.json().catch(() => ({}));
    const casePayload = await caseResponse.json().catch(() => ({}));
    state.fboxVehicleRecords = Array.isArray(vehiclePayload.data) ? vehiclePayload.data.filter(record => record.status !== 'inactive') : [];
    const remoteYears = state.fboxVehicleRecords.map(record => Number(record.year)).filter(Boolean);
    years.splice(0, years.length, ...Array.from(new Set([...years, ...remoteYears])).sort((a, b) => Number(b) - Number(a)));
    state.fboxVehicleLibrary = {
      ready: vehicleResponse.ok,
      source: vehicleResponse.ok ? 'F-Box vehicle library' : 'local-fallback',
      total: Number(vehiclePayload.meta?.total || state.fboxVehicleRecords.length),
      officialSpecs: Number(vehiclePayload.meta?.verified_specs || 0),
    };
    state.fboxVehicleRecords.forEach(record => {
      vehicles[record.year] ||= {};
      vehicles[record.year][record.make] ||= {};
      vehicles[record.year][record.make][record.model] ||= [];
      if (record.trim && !vehicles[record.year][record.make][record.model].includes(record.trim)) vehicles[record.year][record.make][record.model].push(record.trim);
    });
    reviews = Array.isArray(reviewPayload.data) ? reviewPayload.data : [];
    fboxCases = Array.isArray(casePayload.data) ? casePayload.data : [];
    products = applyProductReviewStats(products);
    render();
  } catch {
    // The storefront keeps its local vehicle fallback when the content API is offline.
  }
}
async function mallLogin(username, password) {
  return mallRequest(mallConfig.portalBase, '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
}

async function mallRegister(values) {
  return mallRequest(mallConfig.portalBase, '/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
    username: String(values.username || ''), password: String(values.password || ''), telephone: String(values.telephone || ''), email: String(values.email || ''), company: String(values.company || '')
  }) });
}

async function loadAccountInfo() {
  if (!state.mallToken) { state.account = null; return; }
  try {
    const payload = await mallRequest(mallConfig.portalBase, '/auth/info', { timeout: 7000 });
    state.account = payload?.data?.member || payload?.member || null;
  } catch {
    // token expired or backend offline: drop the session so the UI falls back to sign-in
    state.mallToken = '';
    state.account = null;
    localStorage.removeItem('fbox-mall-token');
  }
}

async function mallLogout() {
  try { await mallRequest(mallConfig.portalBase, '/auth/logout', { method: 'POST', timeout: 5000 }); } catch { /* best-effort */ }
  state.mallToken = '';
  state.account = null;
  state.accountOrders = [];
  localStorage.removeItem('fbox-mall-token');
}

async function syncMallWishlist() {
  if (!state.mallToken) return;
  const remote = await mallRequest(mallConfig.portalBase, '/wishlist', { timeout: 7000 });
  const list = Array.isArray(remote?.data) ? remote.data : Array.isArray(remote) ? remote : [];
  state.wishlist = list.map(row => products.find(item => String(item.id) === String(row.product_id || row.productId || row.id))?.id).filter(Boolean);
  persist();
}

async function loadMemberOrders() {
  if (!state.mallToken) return;
  state.accountOrdersLoading = true;
  render();
  try {
    const remote = await mallRequest(mallConfig.portalBase, '/orders', { timeout: 7000 });
    state.accountOrders = Array.isArray(remote?.data) ? remote.data : Array.isArray(remote) ? remote : [];
  } catch (error) {
    state.accountOrders = [];
    setToast(error?.message || '订单查询失败，请重新登录后重试。');
  } finally {
    state.accountOrdersLoading = false;
    render();
  }
}

function productRatingMarkup(item) {
  return Number(item.rating) > 0 ? `${stars(item.rating)} <a href="#product/${item.id}">${item.rating} · ${item.reviews} reviews</a>` : stars(0);
}

function mallProductToFBox(raw) {
  const base = products.find(item => item.part === raw.productSn);
  if (!base) return null;
  const price = Number(raw.price || base.price || 0);
  const originalPrice = Number(raw.originalPrice || 0);
  return {
    ...base,
    backendId: Number(raw.id),
    name: raw.name || base.name,
    brand: raw.brandName || base.brand,
    category: raw.productCategoryName || base.category,
    price,
    oldPrice: originalPrice > price ? originalPrice : null,
    image: base.image,
    rating: 0,
    reviews: 0,
    deal: raw.deal || (Number(raw.stock || 0) > 0 ? 'In stock · live inventory' : 'Contact F-Box for availability'),
    stock: Number(raw.stock || 0),
    meta: base.meta,
    backendPic: raw.pic || ''
  };
}

async function loadMallCatalog() {
  try {
    const page = await mallRequest(mallConfig.portalBase, '/products', { timeout: 7000 });
    const rawProducts = Array.isArray(page?.data) ? page.data : Array.isArray(page) ? page : [];
    const mapped = rawProducts.map(raw => {
      const base = products.find(item => String(item.id) === String(raw.id));
      if (!base && !raw.id) return null;
      const rawImages = Array.isArray(raw.images) ? raw.images.map(imageEntry => typeof imageEntry === 'string' ? imageEntry : imageEntry?.url).filter(Boolean) : [];
      const images = rawImages.length ? rawImages : (Array.isArray(base?.images) ? base.images.map(imageEntry => typeof imageEntry === 'string' ? imageEntry : imageEntry?.url).filter(Boolean) : []);
      const image = images[0] || raw.image || raw.pic || base?.image || '';
      return {
        ...(base || {}),
        ...raw,
        id: String(raw.id ?? base?.id ?? ''),
        name: raw.name || base?.name || 'F-Box product',
        brand: raw.brand || raw.brandName || base?.brand || 'F-Box',
        category: raw.category || raw.productCategoryName || base?.category || 'Wheels',
        meta: raw.meta || base?.meta || '',
        price: Number(raw.price || base?.price || 0),
        oldPrice: raw.oldPrice ?? (raw.originalPrice || base?.oldPrice || null),
        image,
        images: images.length ? images : undefined,
        image_cutout: raw.image_cutout ?? base?.image_cutout ?? false,
        price_mode: raw.price_mode || base?.price_mode || 'fixed',
        finish: raw.finish || base?.finish || '',
        color: raw.color || raw.finish || base?.color || '',
        rating: Number(raw.rating || base?.rating || 0),
        reviews: Number(raw.reviews || base?.reviews || 0),
        stock: Number(raw.stock ?? base?.stock ?? 0)
      };
    }).filter(Boolean);
    if (!mapped.length) throw new Error('F-Box catalog is empty');
    const detailed = await Promise.all(mapped.map(async item => {
      try {
        return item;
      } catch {
        return item;
      }
    }));
    products = applyProductReviewStats(detailed);
    state.catalogLoaded = true;
    render();
    if (state.mallToken) await loadMallCart();
  } catch (error) {
    state.catalogLoaded = false;
    state.backend.portal = 'testing';
    render();
  }
}

async function loadMallCart() {
  if (!state.mallToken) return;
  const remote = await mallRequest(mallConfig.portalBase, '/cart', { timeout: 7000 });
  const next = (Array.isArray(remote?.items) ? remote.items : Array.isArray(remote) ? remote : []).map(row => {
    const item = products.find(productItem => String(productItem.id) === String(row.product_id || row.productId || row.id));
    return item ? { id: item.id, qty: Number(row.quantity || row.qty || 1), backendCartId: row.id } : null;
  }).filter(Boolean);
  state.cart = next;
  persist();
}

async function syncMallCart() {
  if (!state.mallToken) throw new Error('请先登录 F-Box 账户');
  for (const row of state.cart) {
    const item = product(row.id);
    if (!item) continue;
    await mallRequest(mallConfig.portalBase, '/cart/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: item.id, quantity: row.qty })
    });
  }
  await loadMallCart();
}

async function createMallOrder(values) {
  await syncMallCart();
  const result = await mallRequest(mallConfig.portalBase, '/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customer: { name: values.name, phone: values.phone, email: values.email },
      shipping: { address: values.address, city: values.city, province: values.province || '', region: values.region || '', postCode: values.postCode },
      items: state.cart.map(row => ({ product_id: row.id, quantity: row.qty }))
    })
  });
  return result?.order || result;
}

function decorateIntegrationState() {
  const headerActions = document.querySelector(".header-actions");
  if (headerActions && !headerActions.querySelector(".mall-status")) {
    headerActions.insertAdjacentHTML("afterbegin", `<div class="mall-status" title="F-Box store backend">${mallStatusChip("portal")}</div>`);
  }
  const storeHero = document.querySelector(".store-hero .container");
  if (storeHero && !storeHero.querySelector(".integration-strip")) {
    storeHero.insertAdjacentHTML("beforeend", `<div class="integration-strip"><div><strong>Live F-Box catalog</strong><span>Products, prices, stock and orders are served by the F-Box backend.</span></div><div class="integration-chips">${mallStatusChip("portal")}${mallStatusChip("admin")}<span class="integration-chip is-live"><i></i>Order API · Connected</span></div></div>`);
  }
  const accountForm = document.querySelector("[data-form=account]");
  if (accountForm && !accountForm.previousElementSibling?.classList.contains("integration-note")) {
    accountForm.insertAdjacentHTML("beforebegin", `<div class="integration-note">${mallStatusChip("portal")}<span>登录使用 F-Box 账户服务；购物车、收货地址和订单都保存到 F-Box 后端。</span></div>`);
  }
  const checkoutForm = document.querySelector("[data-form=checkout]");
  if (checkoutForm && !checkoutForm.previousElementSibling?.classList.contains("integration-note")) {
    checkoutForm.insertAdjacentHTML("beforebegin", `<div class="integration-note">${mallStatusChip("portal")}<span>订单会写入 F-Box 后台并默认为待付款；支付渠道由 PayPal 配置决定。</span></div>`);
  }
}

function selectOptions(values, selected = '', placeholder = 'Select') { return `<option value="">${placeholder}</option>${values.map(value => `<option value="${esc(value)}" ${String(value) === String(selected) ? 'selected' : ''}>${esc(value)}</option>`).join('')}`; }
function vehicleSelector(prefix = 'vehicle') {
  const v = state.vehicle || {};
  const makes = v.year && vehicles[v.year] ? Object.keys(vehicles[v.year]) : [];
  const models = v.year && v.make && vehicles[v.year]?.[v.make] ? Object.keys(vehicles[v.year][v.make]) : [];
  const trims = v.year && v.make && v.model && vehicles[v.year]?.[v.make]?.[v.model] ? vehicles[v.year][v.make][v.model] : [];
  return `<div class="fitment-selects" data-vehicle-prefix="${prefix}">
    <select class="fitment-select" data-field="year">${selectOptions(years, v.year, 'Year')}</select>
    <select class="fitment-select" data-field="make" ${makes.length ? '' : 'disabled'}>${selectOptions(makes, v.make, 'Make')}</select>
    <select class="fitment-select" data-field="model" ${models.length ? '' : 'disabled'}>${selectOptions(models, v.model, 'Model')}</select>
    <select class="fitment-select" data-field="trim" ${trims.length ? '' : 'disabled'}>${selectOptions(trims, v.trim, 'Trim')}</select>
    <select class="fitment-select" data-field="drive" ${v.trim ? '' : 'disabled'}>${selectOptions(driveOptions(v.make, v.model), v.drive, 'Drive')}</select>
  </div>`;
}

function header() {
  const active = state.route.name === 'store' ? 'SHOP' : '';
  const localeValue = state.localeMode === 'manual' ? state.locale : 'auto';
  return `<div class="announcement">Global delivery on performance parts · <span>Enjoy as low as 0% APR Financing</span> · Build now, pay later</div>
  <header class="site-header">
    <div class="container header-main">
      <a class="brand" href="#home" aria-label="F-Box home"><i class="brand-mark"></i><span>F-BOX</span></a>
      <form class="search-bar" data-form="search">${icons.search}<input name="query" value="${esc(state.search)}" placeholder="Search wheels, calipers, rotors, pads..." aria-label="Search products" /></form>
      <div class="header-actions">
        <button class="header-action" data-action="account">${icons.user}<span>${state.account?.username ? esc(state.account.username) : 'My Account'}</span></button>
        <button class="header-action" data-action="cart">${icons.cart}<span>Cart</span><b class="cart-count">${cartCount()}</b></button>
        <label class="locale-control"><span>Language</span><select class="locale-select" data-locale aria-label="Language selection"><option value="auto" ${localeValue === 'auto' ? 'selected' : ''}>Auto · ${localeLabel(state.locale)}</option>${localeOptions.map(([code, label]) => `<option value="${code}" ${localeValue === code ? 'selected' : ''}>${label}</option>`).join('')}</select></label>
        <button class="hamburger" data-action="mobile-nav" aria-label="Open navigation">${icons.menu}</button>
      </div>
    </div>
    <div class="nav-row ${state.mobileNav ? 'is-open' : ''}">
      <div class="container nav-inner">
        <nav class="nav-links">
          <button class="nav-link ${active ? 'is-active' : ''}" data-action="mega">Shop ${icons.chevron}</button>
          <a class="nav-link" href="#store" data-action="store-link">Browse all parts</a>
          <a class="nav-link" href="#home#fitment">Add my car</a>
          <a class="nav-link" href="#home#gallery">Search gallery</a>
          <a class="nav-link" href="#home#brands">Brands</a>
          <a class="nav-link" href="#home#resources">Resources</a>
        </nav>
        <div class="nav-meta"><span>Need help?</span><a href="tel:${company.tel}">${company.phone}</a></div>
      </div>
    </div>
    ${state.menuOpen ? megaMenu() : ''}
  </header>`;
}
function megaMenu() {
  const groups = [['Shop by product', ['Wheels', 'Calipers', 'Rotors', 'Brake Pads', 'Wheel & Tire Packages']], ['Fitment tools', ['Shop by vehicle', 'Fitment guide', 'Brake clearance', 'Search gallery', 'Wheel offset guide']], ['Build essentials', ['Suspension', 'Wheel accessories', 'Lug nuts', 'Spacers & adapters', 'Car care']], ['F-Box service', ['Today’s deals', 'Financing', 'Track my order', 'Wholesale program', 'Fitment support']]];
  return `<div class="mega-menu"><div class="container mega-grid">${groups.map(([title, links]) => `<div class="mega-col"><h3>${title}</h3>${links.map(link => link === 'Track my order' ? `<a href="#home" data-action="orders">${link}</a>` : `<a href="#store" data-category-link="${esc(link.includes('Wheels') ? 'Wheels' : link.includes('Calipers') ? 'Calipers' : link.includes('Rotors') ? 'Rotors' : link.includes('Pads') ? 'Brake Pads' : 'All')}">${link}</a>`).join('')}</div>`).join('')}</div></div>`;
}

function fitmentProducts() {
  const preferred = [
    products.find(item => item.category === 'Wheels' && item.diameter === 19),
    products.find(item => item.category === 'Calipers'),
    products.find(item => item.category === 'Rotors'),
    products.find(item => item.category === 'Brake Pads')
  ].filter(Boolean);
  return preferred;
}
function renderFitmentProduct(item) {
  return `<button class="fitment-product spotlight-card" data-action="quick-view" data-id="${item.id}"><span class="fitment-product-image"><img class="${item.image_cutout ? 'is-cutout' : ''}" src="${assetUrl(item.image)}" alt="${esc(item.name)}"></span><span class="fitment-product-copy"><small>${item.category}</small><strong>${item.name}</strong><span>${money(item.price)} <em>· ${item.reviews ? `${item.reviews} reviews` : 'No verified reviews yet'}</em></span></span></button>`;
}
function fitmentPreview() {
  if (!state.vehicle?.trim) return '';
  return `<div class="fitment-preview reveal" aria-live="polite"><div class="fitment-preview-head"><div><p class="eyebrow">Fitment matched</p><strong>${esc(currentVehicleLabel())}</strong><span>Recommended F-Box parts with clearance notes ready.</span></div><button class="icon-btn" data-action="change-vehicle" aria-label="Change vehicle">${icons.close}</button></div><div class="fitment-products">${fitmentProducts().map(renderFitmentProduct).join('')}</div><div class="fitment-preview-foot"><span>${fitmentProducts().length} product families matched to this build</span><button class="btn btn-primary btn-small" data-action="view-fitment-products">View all matching parts</button></div></div>`;
}

function homePage() {
  return `<section class="hero" id="home"><div class="container hero-content"><div class="hero-copy reveal">
    <div class="hero-kicker">The F-Box fitment system</div>
    <h1>Find what fits <em>your ride.</em></h1>
    <p class="hero-sub">Wheels, calipers, rotors and pads selected around your car — with real fitment notes, honest reviews and shipping you can track.</p>
    <div class="fitment-card" id="fitment">${vehicleSelector('hero')}<button class="btn btn-primary" data-action="shop-vehicle">Shop now</button></div>${fitmentPreview()}
    <div class="hero-foot"><span><strong>60,000+</strong> builds studied</span><span><strong>4.9/5</strong> verified reviews</span><span><strong>48 hr</strong> brake parts dispatch</span></div>
  </div></div></section>
  <div class="container"><div class="trust-strip"><div class="trust-item"><div class="trust-icon">${icons.shield}</div><div><strong>Fitment checked</strong><span>Confidence before checkout</span></div></div><div class="trust-item"><div class="trust-icon">${icons.truck}</div><div><strong>Fast global delivery</strong><span>Live estimates at checkout</span></div></div><div class="trust-item"><div class="trust-icon">${icons.bolt}</div><div><strong>Build-ready stock</strong><span>In-stock picks ship first</span></div></div><div class="trust-item"><div class="trust-icon">${icons.chat}</div><div><strong>Real human help</strong><span>Talk to a fitment expert</span></div></div></div></div>
  <section class="section" id="gallery"><div class="container"><div class="section-heading"><div><p class="eyebrow">Start with your platform</p><h2>Fitment video guides</h2></div><p>See the stance, clearance and brake-room decisions before you buy. Every guide is built to make the next click feel obvious.</p></div><div class="guide-grid">${guideCards.map(([name, caption, image], i) => `<a class="guide-card spotlight-card reveal delay-${i % 4}" href="#store"><img src="${ASSET + image}" alt="${esc(name)} fitment guide" loading="lazy"><div class="guide-label"><small>${caption}</small><strong>${name}</strong></div></a>`).join('')}</div></div></section>
  <section class="section-tight" style="background:#f7f9fa"><div class="container"><div class="section-heading"><div><p class="eyebrow">One catalog, all the pieces</p><h2>Shop the build</h2></div><a class="btn btn-dark" href="#store">View all parts</a></div><div class="category-grid">${categories.map(([name, copy, icon], i) => `<a class="category-card reveal delay-${i % 4}" href="#store" data-category-link="${esc(name.includes('Wheel') ? 'Wheels' : name)}"><div class="category-icon">${iconForCategory(icon)}</div><strong>${name}</strong><span>${copy}</span></a>`).join('')}</div></div></section>
  <section class="section" id="brands"><div class="container"><div class="section-heading"><div><p class="eyebrow">Popular right now</p><h2>Best-selling wheels</h2></div><p>Our most saved silhouettes, translated into F-Box fitment notes so you can compare the visual and the actual spec.</p></div><div class="product-grid">${products.filter(p => p.category === 'Wheels').slice(0, 4).map(renderProductCard).join('')}</div></div></section>
  <section class="section-tight"><div class="container"><div class="brand-feature"><div><p class="eyebrow" style="color:var(--lime)">F-Box brake lab</p><h2>Make the <span>stop</span> part of the build.</h2><p>From quiet street pads to six-piston ceramic kits, every braking product is presented with clearance, heat and daily-use context.</p><a class="btn btn-primary" href="#store" data-category-link="Calipers">Explore braking</a></div><div class="brand-carousel">${[['a7dd472643daf9b4.jpg', 'Ceramic Pro'], ['fe1a37ef746c28f0.jpg', 'Street 4P'], ['e78ac1cfdeae4727.jpg', 'Track Slotted'], ['f5effff1812a14eb.jpg', 'Street Blue']].map(([image, label]) => `<div class="brand-item"><img src="${ASSET + image}" alt="${label}" loading="lazy"><span>${label}</span></div>`).join('')}</div></div></div></section>
  <section class="section" id="resources"><div class="container"><div class="section-heading"><div><p class="eyebrow">Proof from the community</p><h2>Built by people who drive them.</h2></div><p>4.9/5 from F-Box customers across daily builds, weekend cars and track setups.</p></div><div class="reviews-layout"><div class="review-score"><strong>4.9</strong>${stars(4.9)}<p>from 16,494 verified reviews</p><div class="review-bars"><div class="review-bar"><span>5★</span><i class="bar-track"><i style="width:94%"></i></i><span>94%</span></div><div class="review-bar"><span>4★</span><i class="bar-track"><i style="width:5%"></i></i><span>5%</span></div><div class="review-bar"><span>3★</span><i class="bar-track"><i style="width:1%"></i></i><span>1%</span></div></div></div><div class="review-list">${reviews.slice(0, 2).map((review, i) => renderReview(review, i)).join('')}</div></div></div></section>`;
}

function customWheelHomePage() {
  const customSpecs = [
    ['01', 'Diameter + width', 'Set the visual stance and usable tire envelope.'],
    ['02', 'PCD + center bore', 'Match the hub, lug pattern and hardware before production.'],
    ['03', 'ET + brake clearance', 'Balance concavity, caliper room and the way you drive.'],
    ['04', 'Finish + center cap', 'Make the final surface, logo and details yours.']
  ];
  const buyerModes = [
    ['Street builds', 'Daily fitment with a cleaner stance, correct clearance and a finish you can live with.', 'Stock, lowered or mildly modified'],
    ['Show cars', 'One-off color combinations, deep lips, custom caps and a wheel that owns the room.', 'Visual impact, built around your brief'],
    ['Track setups', 'Wider grip, brake room and function-first offset decisions for hard laps.', 'Brake clearance and use-case led'],
    ['Dealers + brands', 'Repeatable specs, private-label details and a factory route that scales with your catalog.', 'OEM / ODM / wholesale ready']
  ];
  const customProcess = [
    ['Tell us the car', 'Year, make, model, trim, stock or modified.'],
    ['Lock the numbers', 'Diameter, width, PCD, ET, bore and brake clearance.'],
    ['Approve the look', 'Design direction, finish, center cap and brand details.'],
    ['Build + ship', 'Production updates, final inspection and global delivery.']
  ];
  return `<section class="custom-wheel-hero" id="home"><div class="container custom-wheel-hero-grid"><div class="custom-wheel-copy reveal"><p class="custom-kicker">F-Box Custom Wheel Studio <span>Made to your numbers</span></p><h1>Made for your <em>exact build.</em></h1><p class="custom-hero-sub">Custom forged wheels for drivers who know the difference between a wheel that looks right and a wheel that fits right. Bring us the car, the stance and the finish — we will turn the brief into a build-ready spec.</p><div class="custom-hero-actions"><a class="btn btn-primary" href="#home#custom-build">Start a custom build</a><a class="btn btn-light" href="#store" data-category-link="Wheels">Shop finished wheels</a></div><div class="custom-hero-proof"><span><strong>1:1</strong> build brief</span><span><strong>PCD · ET · CB</strong> fitment-led</span><span><strong>Global</strong> delivery support</span></div></div><div class="custom-wheel-stage spotlight-card reveal delay-2"><div class="custom-stage-index">BUILD 001 <span>/ F-BOX CUSTOM</span></div><div class="custom-stage-ring"></div><img src="${ASSET}a7dd472643daf9b4.jpg" alt="F-Box custom black performance wheel" loading="eager"><div class="custom-stage-caption"><strong>Form follows fitment.</strong><span>Monoblock / satin black / custom spec</span></div></div></div><div class="container custom-wheel-rail"><a href="#home#custom-build"><span>01</span> Configure your spec</a><a href="#home#workshop"><span>02</span> See the process</a><a href="#home#gallery"><span>03</span> Browse real builds</a><a href="#home#brands"><span>04</span> Shop ready designs</a></div></section>
  <div class="container"><div class="trust-strip custom-trust-strip"><div class="trust-item"><div class="trust-icon">${icons.shield}</div><div><strong>Fitment before finish</strong><span>Numbers first. No guesswork.</span></div></div><div class="trust-item"><div class="trust-icon">${icons.spark}</div><div><strong>Made-to-order options</strong><span>Size, color, cap and detail.</span></div></div><div class="trust-item"><div class="trust-icon">${icons.bolt}</div><div><strong>Proof before production</strong><span>Review the brief before we build.</span></div></div><div class="trust-item"><div class="trust-icon">${icons.chat}</div><div><strong>Human fitment help</strong><span>Talk to a real build specialist.</span></div></div></div></div>
  <section class="custom-build-section section" id="custom-build"><div class="container"><div class="custom-section-heading"><div><p class="eyebrow">The custom brief</p><h2>Spec it once.<br><span>Get the wheel right.</span></h2></div><p>Custom wheel buyers are not choosing a generic product from a shelf. They are choosing a stance, a purpose and a set of numbers that have to work together. F-Box makes that decision visible before the order moves forward.</p></div><div class="custom-build-grid"><div class="custom-vehicle-card"><div class="custom-card-top"><span class="custom-step-number">01</span><div><p class="eyebrow">Start with the vehicle</p><h3>Tell us what you drive.</h3></div></div><p>Stock car, lowered street build, big-brake setup or full project — start with the platform so the wheel can be designed around the real clearance.</p><div class="fitment-card custom-fitment-card" id="fitment">${vehicleSelector('hero')}<button class="btn btn-primary" data-action="shop-vehicle">Check my fitment</button></div>${fitmentPreview()}</div><div class="custom-spec-card"><p class="eyebrow">What we lock together</p><div class="custom-spec-list">${customSpecs.map(([number, title, copy]) => `<div class="custom-spec-row"><strong>${number}</strong><div><h3>${title}</h3><p>${copy}</p></div></div>`).join('')}</div><div class="custom-spec-tags"><span>Forged / 1-piece / 2-piece</span><span>Deep concave / step lip</span><span>Custom finish / cap / logo</span></div></div></div></div></section>
  <section class="custom-audience section-tight"><div class="container"><div class="custom-section-heading compact"><div><p class="eyebrow">Built around the buyer</p><h2>One wheel studio.<br><span>Four ways to build.</span></h2></div><p>Lead with the use case instead of forcing every visitor through the same catalog path.</p></div><div class="custom-audience-grid">${buyerModes.map(([title, copy, meta], i) => `<article class="custom-audience-card reveal delay-${i % 4}"><span class="custom-audience-index">0${i + 1}</span><h3>${title}</h3><p>${copy}</p><small>${meta}</small></article>`).join('')}</div></div></section>
  <section class="custom-workshop section" id="workshop"><div class="container"><div class="custom-workshop-grid"><div class="custom-workshop-media spotlight-card"><img src="${ASSET}ff2a26733252a2c8.jpg" alt="Custom wheel engineering and finish reference" loading="lazy"><div class="custom-media-stamp"><strong>F-BOX / 001</strong><span>Engineering reference</span></div><div class="custom-media-note">Finished wheel study · finish and spoke direction</div></div><div class="custom-workshop-copy"><p class="eyebrow">From brief to build</p><h2>A custom wheel is a process, not a product card.</h2><p>Strong custom-wheel brands sell confidence: a clear brief, transparent fitment decisions, a finish that feels personal and a human who stays close when the build gets specific.</p><div class="custom-process-list">${customProcess.map(([title, copy], i) => `<div class="custom-process-row"><span>0${i + 1}</span><div><strong>${title}</strong><p>${copy}</p></div></div>`).join('')}</div><a class="btn btn-dark" href="#home#custom-build">Build my wheel brief</a></div></div></div></section>
  <section class="section custom-finish-section"><div class="container"><div class="custom-finish-grid"><div><p class="eyebrow">The details buyers remember</p><h2>Color is only the beginning.</h2><p class="muted">A custom wheel feels premium when the small decisions are easy to compare: satin or gloss, deep or flush, center cap or branded, street-safe or track-led.</p><div class="custom-finish-chips"><span>Gloss / satin / matte</span><span>Brushed / polished / milled</span><span>Custom center caps</span><span>Laser logo details</span><span>1-piece / 2-piece</span><span>Road / show / track</span></div></div><div class="custom-finish-collage"><div class="custom-finish-tile large"><img src="${ASSET}0938e8f8953be744.jpg" alt="Polished multi-spoke custom wheel" loading="lazy"><span>Polished / multi-spoke</span></div><div class="custom-finish-tile"><img src="${ASSET}038bd6e7abb31b4c.jpg" alt="Gloss black custom wheel" loading="lazy"><span>Gloss / deep dish</span></div><div class="custom-finish-tile"><img src="${ASSET}daff2c93eff5e0db.jpg" alt="Graphite custom wheel" loading="lazy"><span>Graphite / performance</span></div></div></div></div></section>
  <section class="section" id="gallery"><div class="container"><div class="section-heading"><div><p class="eyebrow">Verified builds only</p><h2>Customer build gallery.</h2></div><p>Every customer photo is permissioned and reviewed by the F-Box team before it appears here.</p></div>${fboxCases.length ? `<div class="guide-grid">${fboxCases.map((item, i) => `<article class="guide-card spotlight-card reveal delay-${i % 4}"><img src="${esc(item.image_url)}" alt="${esc(item.title)}" loading="lazy"><div class="guide-label"><small>${esc(item.vehicle || item.product_name || 'F-Box build')}</small><strong>${esc(item.title)}</strong></div></article>`).join('')}</div>` : '<div class="case-empty"><strong>真实案例正在整理中</strong><span>下单并完成车型适配确认后，客户可授权展示自己的上车效果。</span></div>'}</div></section>
  <section class="section custom-ready-section" id="brands"><div class="container"><div class="custom-ready-head"><div><p class="eyebrow">For buyers who want it now</p><h2>Start with a proven design.<br><span>Make it yours.</span></h2></div><div><p>These ready-to-buy F-Box wheels stay in the catalog exactly as before. Use them as a starting point, or ask us to take the fitment and finish further.</p><a class="btn btn-dark" href="#store" data-category-link="Wheels">Browse finished wheels</a></div></div><div class="product-grid">${products.filter(p => p.category === 'Wheels').slice(0, 4).map(renderProductCard).join('')}</div></div></section>
  <section class="section-tight"><div class="container"><div class="brand-feature"><div><p class="eyebrow" style="color:var(--lime)">F-Box brake lab</p><h2>Make the <span>stop</span> part of the build.</h2><p>From quiet street pads to six-piston ceramic kits, every braking product is presented with clearance, heat and daily-use context.</p><a class="btn btn-primary" href="#store" data-category-link="Calipers">Explore braking</a></div><div class="brand-carousel">${[['a7dd472643daf9b4.jpg', 'Ceramic Pro'], ['fe1a37ef746c28f0.jpg', 'Street 4P'], ['e78ac1cfdeae4727.jpg', 'Track Slotted'], ['f5effff1812a14eb.jpg', 'Street Blue']].map(([image, label]) => `<div class="brand-item"><img src="${ASSET + image}" alt="${label}" loading="lazy"><span>${label}</span></div>`).join('')}</div></div></div></section>
  <section class="section" id="resources"><div class="container"><div class="section-heading"><div><p class="eyebrow">Verified customer feedback</p><h2>Reviews will live here.</h2></div><p>F-Box does not publish invented ratings. Reviews will appear after real orders are completed and verified.</p></div><div class="case-empty"><strong>暂无已验证评价</strong><span>商品评价会在真实订单完成后进入审核流程。</span></div></div></section>`;
}

function iconForCategory(type) {
  if (type === 'truck') return icons.truck;
  if (type === 'shield') return icons.shield;
  if (type === 'bolt') return icons.bolt;
  if (type === 'disc') return icons.spark;
  if (type === 'arrow') return icons.chevron;
  return icons.spark;
}

function filterProducts() {
  let list = products.filter(item => {
    const f = state.filters;
    const query = state.search.trim().toLowerCase();
    return (f.category === 'All' || item.category === f.category) && (!f.saleOnly || item.oldPrice) && (f.finish === 'All' || item.finish === f.finish) && (f.diameter === 'All' || String(item.diameter) === String(f.diameter)) && (!f.minPrice || item.price >= Number(f.minPrice)) && (!f.maxPrice || item.price <= Number(f.maxPrice)) && item.rating >= Number(f.minRating) && (!query || [item.name, item.brand, item.category, item.meta].join(' ').toLowerCase().includes(query));
  });
  if (state.sort === 'latest') {
    list.sort((left, right) => {
      const leftSort = Math.max(0, Math.floor(Number(left.sort || 0)));
      const rightSort = Math.max(0, Math.floor(Number(right.sort || 0)));
      if (leftSort || rightSort) {
        if (!leftSort) return 1;
        if (!rightSort) return -1;
        if (leftSort !== rightSort) return leftSort - rightSort;
      }
      return String(right.created_at || right.updated_at || '').localeCompare(String(left.created_at || left.updated_at || ''));
    });
  }
  if (state.sort === 'price-low') list.sort((a, b) => a.price - b.price);
  if (state.sort === 'price-high') list.sort((a, b) => b.price - a.price);
  if (state.sort === 'rating') list.sort((a, b) => b.rating - a.rating);
  return list;
}
function renderProductCard(item) {
  const saved = state.wishlist.includes(item.id);
  return `<article class="product-card spotlight-card reveal"><div class="product-media">${item.badge ? `<span class="product-badge ${item.badge === 'Sale' ? 'alt' : ''}">${item.badge}</span>` : ''}<div class="product-actions"><button class="icon-btn ${saved ? 'is-saved' : ''}" data-action="wishlist" data-id="${item.id}" aria-label="Save product">${icons.heart}</button><button class="icon-btn" data-action="quick-view" data-id="${item.id}" aria-label="Quick view">${icons.eye}</button></div><img class="product-image ${item.image_cutout ? 'is-cutout' : ''}" src="${assetUrl(item.image)}" alt="${esc(item.name)} ${esc(item.finish)}" loading="lazy"></div><div class="product-body"><div class="product-brand">${item.brand}</div><h3 class="product-title">${item.name}</h3><div class="product-meta">${item.meta}</div><div class="rating-row">${productRatingMarkup(item)}</div><div class="product-deal">${item.deal || 'Availability managed by F-Box'}</div><div class="price-row"><div><span class="price">${money(item.price)} <small>/ ea</small></span>${item.oldPrice ? `<span class="was-price">${money(item.oldPrice)}</span>` : ''}</div><span class="muted" style="font-size:10px">${item.category}</span></div><div class="product-cta"><a class="btn btn-outline btn-small" href="#product/${item.id}">Details</a><button class="btn btn-primary btn-small" data-action="add" data-id="${item.id}">Add</button></div></div></article>`;
}

function storePage() {
  const list = filterProducts();
  const fitmentBanner = state.vehicle?.trim ? `<div class="fitment-match-banner"><div><p class="eyebrow">Fitment context</p><strong>${esc(currentVehicleLabel())}</strong><span>Products below are shown with the selected vehicle context.</span></div><button class="btn btn-outline btn-small" data-action="change-vehicle">Change vehicle</button></div>` : '';
  return `<section class="store-hero"><div class="container"><div class="breadcrumbs"><a href="#home">Home</a><span>/</span><span>${state.filters.category === 'All' ? 'Performance parts' : state.filters.category}</span></div><h1>${state.filters.category === 'All' ? 'All performance parts' : state.filters.category}</h1><p class="muted">Fitment-first shopping for wheels, calipers, rotors and pads. Prices, stock and product status are managed by the F-Box catalog.</p></div></section>
<main class="container store-layout"><aside class="filter-rail"><div class="filter-head"><strong>Filter with F-Box AI</strong><span>Describe the look or setup you want. We will narrow the catalog.</span></div><div class="filter-section"><input class="filter-input" data-filter="ai" placeholder="e.g. bronze wheels for 2020 Civic" value="${esc(state.search)}"><p class="filter-help">Try “track pads”, “19 inch black wheels”, or a car model.</p></div><div class="filter-section"><h3>Delivery estimate</h3><div class="filter-stack"><input class="filter-input" data-filter="zip" placeholder="Deliver to ZIP / postcode"><button class="btn btn-outline btn-small" data-action="save-zip">Save location</button></div></div><div class="filter-section"><h3>Search by vehicle</h3>${vehicleSelector('store')}<button class="btn btn-dark btn-small filter-apply" data-action="shop-vehicle">Apply vehicle</button></div><div class="filter-section"><h3>Product type</h3><select class="filter-select" data-filter="category">${selectOptions(['All', 'Wheels', 'Calipers', 'Rotors', 'Brake Pads'], state.filters.category, 'All parts')}</select></div><div class="filter-section"><h3>Fitment preferences</h3><label class="check-row"><input type="checkbox" data-filter="saleOnly" ${state.filters.saleOnly ? 'checked' : ''}> In-stock deals only</label><select class="filter-select" data-filter="finish">${selectOptions(['All', 'Satin Black', 'Bronze Machined', 'Gloss Black', 'Matte Bronze', 'Racing Red', 'Electric Blue', 'Black Hat', 'Ceramic'], state.filters.finish, 'All finishes')}</select></div><div class="filter-section"><h3>Wheel diameter <span>inches</span></h3><select class="filter-select" data-filter="diameter">${selectOptions(['All', '17', '18', '19', '20'], state.filters.diameter, 'Any diameter')}</select></div><div class="filter-section"><h3>Price range</h3><div class="filter-row"><input class="filter-input" data-filter="minPrice" placeholder="Min" value="${esc(state.filters.minPrice)}"><input class="filter-input" data-filter="maxPrice" placeholder="Max" value="${esc(state.filters.maxPrice)}"></div></div><div class="filter-section"><h3>Customer rating</h3><select class="filter-select" data-filter="minRating">${selectOptions(['0', '4', '4.5', '4.8'], state.filters.minRating, 'Any rating')}</select></div></aside><section class="store-main"><div class="ai-query"><span style="color:var(--lavender)">${icons.spark}</span><input data-filter="ai" placeholder="F-Box AI: Search by vehicle, product, finish or use case" value="${esc(state.search)}"><button class="btn btn-primary btn-small" data-action="ai-filter">Search</button></div>${fitmentBanner}<div class="store-toolbar"><div class="result-count">${list.length} results <span>${state.vehicle ? `· fits ${esc(currentVehicleLabel())}` : ''}</span></div><div class="toolbar-actions"><button class="btn btn-outline btn-small" data-action="clear-filters">Clear filters</button><select class="toolbar-select" data-filter="sort"><option value="latest" ${state.sort === 'latest' ? 'selected' : ''}>Newest arrivals</option><option value="price-low" ${state.sort === 'price-low' ? 'selected' : ''}>Price: low to high</option><option value="price-high" ${state.sort === 'price-high' ? 'selected' : ''}>Price: high to low</option><option value="rating" ${state.sort === 'rating' ? 'selected' : ''}>Highest rated</option></select></div></div>${list.length ? `<div class="product-grid">${list.map(renderProductCard).join('')}</div>` : `<div class="empty-state"><h2>No exact matches yet.</h2><p>Try clearing one filter or tell F-Box what you want in the AI search.</p><button class="btn btn-primary" data-action="clear-filters">Reset catalog</button></div>`}</section></main>`;
}

function reviewDateLabel(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  try {
    return new Intl.DateTimeFormat(state.locale || 'en', { year: 'numeric', month: 'short', day: 'numeric' }).format(date);
  } catch {
    return date.toLocaleDateString();
  }
}
function reviewsForProduct(item) {
  return reviews.filter(review => review.product_id === item.id);
}
function reviewStats(records) {
  const total = records.length;
  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const sum = records.reduce((value, review) => {
    const rating = Math.max(1, Math.min(5, Math.round(Number(review.rating || 0))));
    counts[rating] += 1;
    return value + Number(review.rating || 0);
  }, 0);
  return { total, counts, rating: total ? Number((sum / total).toFixed(1)) : 0 };
}
function reviewBars(stats) {
  return [5, 4, 3, 2, 1].map(rating => {
    const count = stats.counts[rating] || 0;
    const percent = stats.total ? Math.round((count / stats.total) * 100) : 0;
    return '<div class="review-bar"><span>' + rating + '★</span><i class="bar-track"><i style="width:' + percent + '%"></i></i><span>' + percent + '%</span></div>';
  }).join('');
}
function renderReview(review, index = 0) {
  const meta = [
    review.verified_purchase ? '<span class="review-verified">✓ Verified purchase</span>' : '',
    review.customer_name ? '<span>' + esc(review.customer_name) + '</span>' : '',
    review.customer_country ? '<span class="review-country">' + esc(review.customer_country) + '</span>' : '',
    review.vehicle ? '<span>' + esc(review.vehicle) + '</span>' : ''
  ].filter(Boolean).join('');
  const photoBadge = Number(review.review_images_count || 0) > 0 ? '<span class="review-photo-badge">' + Number(review.review_images_count) + ' photo' + (Number(review.review_images_count) > 1 ? 's' : '') + ' shared</span>' : '';
  const sourceBadge = review.source_platform ? '<span class="review-source">' + esc(review.source_platform) + '</span>' : '';
  const reply = review.admin_reply ? '<div class="review-reply"><strong>F-Box reply</strong><p>' + esc(review.admin_reply) + '</p></div>' : '';
  return '<article class="review-item" style="animation-delay:' + String(index * 80) + 'ms"><div class="review-head"><div><strong>' + esc(review.title) + '</strong><div>' + stars(Number(review.rating || 0)) + sourceBadge + photoBadge + '</div></div><small>' + esc(reviewDateLabel(review.created_at)) + '</small></div><p>' + esc(review.body) + '</p>' + reply + '<div class="review-meta">' + meta + '</div></article>';
}
function renderProductReviewSection(item) {
  const productReviews = reviewsForProduct(item);
  const stats = reviewStats(productReviews);
  const summary = stats.total
    ? '<p>' + stats.total + ' review' + (stats.total === 1 ? '' : 's') + ' for this product</p>'
    : '<p>No customer reviews yet.</p>';
  const list = productReviews.length
    ? productReviews.slice(0, state.reviewLimit).map(renderReview).join('') + (state.reviewLimit < productReviews.length ? '<button class="btn btn-outline" data-action="load-reviews">Load more reviews</button>' : '')
    : '<div class="review-empty"><strong>Be the first to share your fitment experience.</strong><span>Your review goes to the F-Box team for approval before it is published.</span></div>';
  return '<section class="detail-section" id="reviews"><div class="section-heading"><div><p class="eyebrow">Customer feedback</p><h2>Product reviews</h2></div><button class="btn btn-outline" data-action="write-review">Write a review</button></div><div class="reviews-layout"><div class="review-score"><strong>' + (stats.total ? stats.rating.toFixed(1) : '—') + '</strong>' + stars(stats.rating) + summary + '<div class="review-bars">' + reviewBars(stats) + '</div></div><div class="review-list">' + list + '</div></div></section>';
}
function wireProductReviews() {
  if (state.route.name !== 'product') return;
  const item = product(state.route.id);
  const section = document.getElementById('reviews');
  if (!item || !section) return;
  section.outerHTML = renderProductReviewSection(item);
  const score = document.querySelector('.detail-rating');
  if (score) {
    const count = Number(item.reviews || 0);
    score.innerHTML = stars(Number(item.rating || 0)) + ' <a href="#reviews">' + (count ? Number(item.rating || 0).toFixed(1) + ' · ' + count + ' ratings' : 'No reviews yet') + '</a>';
  }
}
function wireReviewForm() {
  const form = document.querySelector('form[data-form="review"]');
  if (!form || form.querySelector('[name="customer_name"]')) return;
  form.insertAdjacentHTML('afterbegin', '<div class="review-form-grid"><input class="text-input" name="customer_name" autocomplete="name" placeholder="Your name" required><input class="text-input" name="customer_email" type="email" autocomplete="email" placeholder="Email for review follow-up" required></div>');
  form.insertAdjacentHTML('beforeend', '<label class="review-consent"><input type="checkbox" name="consent" required> I confirm this is my own experience and allow F-Box to review it for publication.</label>');
  form.querySelectorAll('.rating-star').forEach(button => {
    button.addEventListener('click', () => {
      form.querySelector('[name="rating"]').value = button.dataset.rating;
      form.querySelectorAll('.rating-star').forEach(item => item.classList.toggle('is-active', Number(item.dataset.rating) <= Number(button.dataset.rating)));
    });
  });
}
function visualizerReferenceImages(item) {
  return productGallery(item);
}
function visualizerReferenceAsset(item, current) {
  const image = current?.referenceImage || item?.image || '';
  return image ? assetUrl(image) : '';
}
function legacyWheelVisualizerTrigger(item) {
  if (item.category !== 'Wheels') return '';
  const referenceImage = state.productImage[item.id] || item.image;
  return `<section class="wheel-visualizer-entry" aria-labelledby="wheel-visualizer-title"><div class="wheel-visualizer-entry-copy"><div class="wheel-visualizer-eyebrow"><span>${icons.spark}</span> See it on your car</div><h2 id="wheel-visualizer-title">Preview this wheel<br><em>before you commit.</em></h2><p>Upload one clear photo of your car and F-Box will prepare three angles with this exact wheel, finish and fitment as the reference.</p><div class="wheel-visualizer-entry-proof"><span>3 angles</span><span>Fitment-led</span><span>Selected gallery angle</span></div></div><button class="btn btn-primary wheel-visualizer-open" data-action="wheel-open" data-id="${item.id}" data-image="${esc(referenceImage)}"><span>Upload car photo</span><span aria-hidden="true">↗</span></button></section>`;
}
function wheelVisualizerTrigger(item) {
  const referenceImages = visualizerReferenceImages(item);
  const referenceImage = referenceImages.includes(state.productImage[item.id]) ? state.productImage[item.id] : item.image;
  const context = visualizerProductContext(item);
  return `<section class="wheel-visualizer-entry" data-product-category="${esc(item.category)}" aria-labelledby="wheel-visualizer-title"><div class="wheel-visualizer-entry-copy"><div class="wheel-visualizer-eyebrow"><span>${icons.spark}</span> See it on your car</div><h2 id="wheel-visualizer-title">${esc(context.heading)}<br><em>before you commit.</em></h2><p>Upload one clear photo of your car and F-Box will prepare three angles with this exact ${esc(context.subject)}, finish and fitment as the reference.</p><div class="wheel-visualizer-entry-proof"><span>3 angles</span><span>Fitment-led</span><span>Selected product image</span></div></div><button class="btn btn-primary wheel-visualizer-open" data-action="wheel-open" data-id="${item.id}" data-image="${esc(referenceImage)}"><span>Upload car photo</span><span aria-hidden="true">↗</span></button></section>`;
}
function wireWheelVisualizerEntry() {
  if (state.route.name !== 'product') return;
  const item = product(state.route.id);
  if (item && item.category !== 'Wheels') document.querySelectorAll('.gallery .thumb:not(:first-child)').forEach(thumb => thumb.remove());
  const form = document.querySelector('.detail-form');
  if (item && form && !document.querySelector('.wheel-visualizer-entry')) form.insertAdjacentHTML('beforebegin', wheelVisualizerTrigger(item));
}
function wireHomeVisualizerBanner() {
  if (state.route.name !== 'home') return;
  const stage = document.querySelector('.custom-wheel-stage');
  if (!stage || stage.querySelector('.home-visualizer-teaser')) return;
  stage.insertAdjacentHTML('beforeend', `<aside class="home-visualizer-teaser" aria-labelledby="home-visualizer-title"><div class="home-visualizer-teaser-top"><span class="home-visualizer-badge">New / visual fitment</span><span class="home-visualizer-count">03 angles</span></div><h2 id="home-visualizer-title">See it on <em>your car.</em></h2><p>Choose a wheel, upload one photo and compare the stance before you commit.</p><div class="home-visualizer-angles"><span><strong>01</strong> front 3/4</span><span><strong>02</strong> rear 3/4</span><span><strong>03</strong> side profile</span></div><a class="home-visualizer-link" href="#store" data-category-link="Wheels">Choose a wheel to preview <span aria-hidden="true">↗</span></a></aside>`);
}
function productPage(item) {
  const image = state.productImage[item.id] || item.image;
  const related = products.filter(p => p.category === item.category && p.id !== item.id).slice(0, 4);
  const specs = [['Brand', item.brand], ['Model', item.name], ['Part number', item.part], ['Finish', item.color], ['Diameter', item.diameter ? `${item.diameter} mm / in` : 'Application specific'], ['Material', item.material], ['Weight', item.weight], ['Fitment', item.meta]];
  return `<div class="detail-wrap"><div class="container"><div class="breadcrumbs"><a href="#home">Home</a><span>/</span><a href="#store">${item.category}</a><span>/</span><span>${item.name}</span></div><div class="detail-grid"><div class="gallery"><div class="thumbs">${[item.image, 'a7dd472643daf9b4.jpg', 'ff2a26733252a2c8.jpg'].map((img, i) => `<button class="thumb ${image === img ? 'is-active' : ''}" data-action="product-image" data-id="${item.id}" data-image="${img}"><img src="${ASSET + img}" alt="${esc(item.name)} view ${i + 1}"></button>`).join('')}</div><div class="main-image"><img src="${ASSET + image}" alt="${esc(item.name)} ${esc(item.finish)}"></div></div><div><div class="detail-kicker">${item.category} · ${item.brand}</div><h1 class="detail-title">${item.name}<br><span style="color:var(--lavender)">${item.meta}</span></h1><div class="detail-rating">${stars(item.rating)} <a href="#reviews">${item.rating} · ${item.reviews} ratings</a></div><div class="detail-price">${money(item.price)} <small>each</small></div><div class="detail-set">${money(item.price * 4)} set of four · ${item.oldPrice ? `was ${money(item.oldPrice)} each` : 'build pricing available'}</div><div class="financing-note">Pay over time with F-Box financing. Starting at ${money(Math.max(18, Math.round(item.price / 12)))}/month with approved credit.</div><div class="detail-form"><div><label class="field-label">Check vehicle fitment</label>${vehicleSelector('detail')}</div><div><label class="field-label">Finish</label><div class="finish-options"><button class="finish-option is-active">${item.color}</button><button class="finish-option">Satin Black</button><button class="finish-option">Bronze Machined</button></div></div><div><label class="field-label">Delivery estimate</label><div class="ship-note">${icons.truck}<span>Free delivery to the lower 48 · Aug 19–Aug 21<br>Enter a postcode for an exact estimate.</span></div></div><div class="detail-actions"><button class="btn btn-primary" data-action="add" data-id="${item.id}">Add to cart</button><button class="btn btn-dark" data-action="buy-now" data-id="${item.id}">Buy it now</button></div></div></div></div><div class="specs">${specs.map(([label, value]) => `<div class="spec"><span>${label}</span><strong>${esc(value)}</strong></div>`).join('')}</div><section class="detail-section" id="reviews"><div class="section-heading"><div><p class="eyebrow">Customer proof</p><h2>Product reviews</h2></div><button class="btn btn-outline" data-action="write-review">Write a review</button></div><div class="reviews-layout"><div class="review-score"><strong>${item.rating}</strong>${stars(item.rating)}<p>${item.reviews} reviews for this product</p><div class="review-bars"><div class="review-bar"><span>5★</span><i class="bar-track"><i style="width:94%"></i></i><span>94%</span></div><div class="review-bar"><span>4★</span><i class="bar-track"><i style="width:5%"></i></i><span>5%</span></div><div class="review-bar"><span>3★</span><i class="bar-track"><i style="width:1%"></i></i><span>1%</span></div></div></div><div class="review-list">${reviews.slice(0, state.reviewLimit).map(renderReview).join('')}${state.reviewLimit < reviews.length ? `<button class="btn btn-outline" data-action="load-reviews">Load more reviews</button>` : ''}</div></div></section><section class="detail-section"><div class="section-heading"><div><p class="eyebrow">Keep building</p><h2>Related ${item.category}</h2></div><a class="btn btn-dark" href="#store">Shop all</a></div><div class="product-grid">${related.map(renderProductCard).join('')}</div></section></div></div>`;
}

function cartPage() {
  const total = cartTotal();
  return `<section class="cart-page"><div class="container"><div class="breadcrumbs"><a href="#home">Home</a><span>/</span><span>Shopping cart</span></div><div class="section-heading"><div><p class="eyebrow">Your saved build</p><h1 class="detail-title">Shopping cart</h1></div><a class="btn btn-outline" href="#store">Continue shopping</a></div>${state.cart.length ? `<div class="cart-layout"><div class="cart-list">${state.cart.map(item => { const p = product(item.id); return `<div class="cart-item"><img src="${ASSET + p.image}" alt="${esc(p.name)}"><div><h3>${p.name}</h3><p>${p.category} · ${p.meta}</p><button class="btn btn-outline btn-small" data-action="remove-cart" data-id="${p.id}" style="margin-top:10px">Remove</button></div><div class="qty-control"><button data-action="qty" data-id="${p.id}" data-delta="-1">−</button><span>${item.qty}</span><button data-action="qty" data-id="${p.id}" data-delta="1">+</button></div><div class="cart-price">${money(p.price * item.qty)}</div></div>`; }).join('')}</div><aside class="summary-card"><h2>Order summary</h2><div class="summary-row"><span>Parts subtotal</span><strong>${money(total)}</strong></div><div class="summary-row"><span>Estimated delivery</span><strong>Calculated at checkout</strong></div><div class="summary-row"><span>Fitment review</span><strong style="color:var(--success)">Included</strong></div><div class="coupon"><input class="text-input" placeholder="Promo code"><button class="btn btn-outline btn-small" data-action="apply-coupon">Apply</button></div><div class="summary-row total"><span>Total</span><strong>${money(total)}</strong></div><button class="btn btn-primary" data-action="checkout" style="width:100%;margin-top:12px">Continue to checkout</button><p class="filter-help">Orders are created in the F-Box backend. Payment remains a separate PayPal step.</p></aside></div>` : `<div class="empty-cart"><h2>Your cart is ready for a build.</h2><p class="muted">Add wheels, calipers, rotors or pads and we will keep the fitment context attached.</p><a class="btn btn-primary" href="#store">Start shopping</a></div>`}</div></section>`;
}

function legacyWheelVisualizerResultCard(result, index, item, mode) {
  const angle = wheelVisualizerAngleLabel(result.angle);
  const imageUrl = result.imageUrl || result.image_url || result.url || '';
  return `<article class="wheel-result-card"><div class="wheel-result-media"><img class="wheel-result-output is-ai-generated" src="${esc(imageUrl)}" alt="${esc(item.name)} on your vehicle — ${esc(angle)}" loading="lazy"><span class="wheel-result-mode">F-Box AI visual preview</span></div><div class="wheel-result-copy"><strong>${esc(angle)}</strong><span>Wheel, finish and fitment held as reference</span></div></article>`;
}
function visualizerProductContext(item) {
  const contexts = {
    Wheels: { subject: 'wheel', heading: 'Preview this wheel', resultNote: 'Image 2 wheel installed; vehicle and tire preserved' },
    Calipers: { subject: 'wheel', heading: 'Preview this wheel', resultNote: 'Image 2 wheel installed; vehicle and tire preserved' },
    Rotors: { subject: 'wheel', heading: 'Preview this wheel', resultNote: 'Image 2 wheel installed; vehicle and tire preserved' },
    'Brake Pads': { subject: 'wheel', heading: 'Preview this wheel', resultNote: 'Image 2 wheel installed; vehicle and tire preserved' }
  };
  return contexts[item?.category] || { subject: 'performance part', heading: 'Preview this part', resultNote: 'Product identity, finish and fitment held as reference' };
}
function legacyWheelVisualizerReferencePicker(item, current) {
  const images = [...new Set([item.image, 'a7dd472643daf9b4.jpg', 'ff2a26733252a2c8.jpg'])];
  const selected = current.referenceImage || item.image;
  return `<section class="wheel-reference-switcher" aria-label="Wheel reference"><div class="wheel-reference-copy"><div class="wheel-content-kicker">Wheel reference</div><strong>Choose the gallery image to use.</strong><span>Replace the reference before generating or regenerate with another angle.</span></div><div class="wheel-reference-options">${images.map((image, index) => `<button class="wheel-reference-option ${selected === image ? 'is-active' : ''}" data-action="wheel-reference" data-image="${esc(image)}" aria-label="Use wheel gallery image ${index + 1}" ${current.phase === 'generating' ? 'disabled' : ''}><img src="${assetUrl(image)}" alt="${esc(item.name)} gallery reference ${index + 1}"><span>${String(index + 1).padStart(2, '0')}</span></button>`).join('')}</div></section>`;
}
function wheelVisualizerReferencePicker(item, current) {
  const images = visualizerReferenceImages(item);
  const selected = current.referenceImage || item.image;
  const context = visualizerProductContext(item);
  const options = images.length ? images.map((image, index) => `<button class="wheel-reference-option ${selected === image ? 'is-active' : ''}" data-action="wheel-reference" data-image="${esc(image)}" aria-label="Use ${esc(context.subject)} gallery image ${index + 1}" ${current.phase === 'generating' ? 'disabled' : ''}><img src="${assetUrl(image)}" alt="${esc(item.name)} gallery reference ${index + 1}"><span>${String(index + 1).padStart(2, '0')}</span></button>`).join('') : `<div class="wheel-reference-unavailable"><strong>Brake-part reference image pending</strong><span>This preview uses the selected product category and finish, while the original wheel remains locked.</span></div>`;
  return `<section class="wheel-reference-switcher" aria-label="Image 2 wheel reference"><div class="wheel-reference-copy"><div class="wheel-content-kicker">Image 2 · wheel reference</div><strong>${images.length ? 'Choose the wheel image to place on the vehicle.' : 'Select a wheel reference image.'}</strong><span>${images.length ? 'Image 1 is your car. Image 2 is the wheel that replaces the original wheel.' : 'The model requires a second image showing the selected wheel.'}</span></div><div class="wheel-reference-options">${options}</div></section>`;
}
function wheelVisualizerInquiryDefaults(item) {
  const meta = String(item?.meta || '');
  const sizeMatch = meta.match(/(\d+(?:\.\d+)?)x(\d+(?:\.\d+)?)/);
  const pcdMatches = meta.match(/\d+x\d+(?:\.\d+)?/g) || [];
  const offsetMatch = meta.match(/([+-]\d+(?:\.\d+)?)/);
  return {
    diameter: sizeMatch?.[1] || String(item?.diameter || ''),
    width: sizeMatch?.[2] || '',
    pcd: pcdMatches[pcdMatches.length - 1] || '',
    offset: offsetMatch?.[1] || '',
    center_bore: '',
    quantity: '4',
    oem_diameter: '',
    oem_width: '',
    oem_pcd: '',
    oem_center_bore: '',
    oem_offset: '',
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    customer_note: ''
  };
}
function wheelInquirySelect(name, values, selected, label, required = true) {
  return `<select class="text-input" name="${esc(name)}"${required ? ' required' : ''}><option value="">Select ${esc(label)}</option>${values.map(value => `<option value="${esc(value)}" ${String(value) === String(selected) ? 'selected' : ''}>${esc(value)}</option>`).join('')}</select>`;
}
function wheelInquiryOemFields(draft = {}) {
  const diameters = ['15', '16', '17', '18', '19', '20', '21', '22'];
  const widths = ['5.5', '6.0', '6.5', '7.0', '7.5', '8.0', '8.5', '9.0', '9.5', '10.0', '10.5', '11.0', '11.5', '12.0'];
  const pcds = ['4x98', '4x100', '4x108', '5x100', '5x108', '5x112', '5x114.3', '5x115', '5x120', '5x127', '5x130', '5x135', '5x139.7', '5x150', '5x165.1', '6x114.3', '6x120', '6x135', '6x139.7'];
  const offsets = ['-25', '-10', '0', '+10', '+15', '+20', '+25', '+30', '+35', '+40', '+45', '+50', '+55'];
  return `<div class="wheel-oem-panel"><div class="wheel-oem-head"><strong>OEM wheel data</strong><span class="wheel-oem-badge">OEM</span></div><div class="wheel-inquiry-grid"><label><span>OEM diameter</span>${wheelInquirySelect('oem_diameter', diameters, draft.oem_diameter, 'OEM diameter', false)}</label><label><span>OEM width (J)</span>${wheelInquirySelect('oem_width', widths, draft.oem_width, 'OEM J', false)}</label><label><span>OEM PCD</span>${wheelInquirySelect('oem_pcd', pcds, draft.oem_pcd, 'OEM PCD', false)}</label><label><span>OEM center bore (CB)</span><input class="text-input" name="oem_center_bore" value="${esc(draft.oem_center_bore || '')}" inputmode="decimal" placeholder="e.g. 66.1 mm"></label><label><span>OEM offset (ET)</span>${wheelInquirySelect('oem_offset', offsets, draft.oem_offset, 'OEM ET', false)}</label></div></div>`;
}
function wireWheelInquiryDetails() {
  const form = document.querySelector('form[data-form="wheel-inquiry"]');
  if (!form || form.dataset.fitmentEnhanced === 'true') return;
  const section = form.querySelector('.wheel-inquiry-section');
  if (!section) return;
  const draft = state.wheelVisualizer?.inquiry?.draft || wheelVisualizerInquiryDefaults(wheelVisualizerItem());
  section.insertAdjacentHTML('beforeend', wheelInquiryOemFields(draft));
  const labels = {
    diameter: 'Diameter <b>*</b>',
    width: 'Width (J) <b>*</b>',
    pcd: 'PCD <b>*</b>',
    offset: 'Offset (ET) <b>*</b>',
    center_bore: 'Center bore (CB) <b>*</b>',
    quantity: 'Quantity <b>*</b>'
  };
  Object.entries(labels).forEach(([name, html]) => {
    const label = form.querySelector(`[name="${name}"]`)?.closest('label')?.querySelector(':scope > span');
    if (label) label.innerHTML = html;
  });
  form.dataset.fitmentEnhanced = 'true';
}
function wheelVisualizerDownloadName(item, angle, index = 0) {
  const slug = String(item?.id || item?.name || 'fbox-preview').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'fbox-preview';
  const angleSlug = String(angle || `view-${index + 1}`).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || `view-${index + 1}`;
  return `fbox-${slug}-${angleSlug}.jpg`;
}
async function wheelVisualizerDownload(imageUrl, fileName) {
  if (!imageUrl) return;
  try {
    const response = await fetch(imageUrl, { mode: 'cors' });
    if (!response.ok) throw new Error('Image download failed');
    const blob = await response.blob();
    if (!blob.size) throw new Error('Empty image');
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = fileName || 'fbox-preview.jpg';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1200);
    setToast('Image saved to your downloads.');
  } catch {
    window.open(imageUrl, '_blank', 'noopener,noreferrer');
    setToast('The image opened in a new tab. Use Save image there.');
  }
}
function wheelVisualizerResultCard(result, index, item, mode) {
  const angle = wheelVisualizerAngleLabel(result.angle);
  const imageUrl = result.imageUrl || result.image_url || result.url || '';
  const context = visualizerProductContext(item);
  const downloadName = wheelVisualizerDownloadName(item, angle, index);
  const imageActions = imageUrl ? `<div class="wheel-result-actions"><button type="button" class="btn btn-outline btn-small" data-action="wheel-image-viewer" data-image-url="${esc(imageUrl)}" data-angle="${esc(angle)}" data-product="${esc(item.name)}" data-download-name="${esc(downloadName)}">View larger <span aria-hidden="true">↗</span></button><button type="button" class="btn btn-outline btn-small" data-action="wheel-image-download" data-image-url="${esc(imageUrl)}" data-download-name="${esc(downloadName)}">Save image <span aria-hidden="true">↓</span></button></div>` : '';
  return `<article class="wheel-result-card"><div class="wheel-result-media">${imageUrl ? `<button type="button" class="wheel-result-open" data-action="wheel-image-viewer" data-image-url="${esc(imageUrl)}" data-angle="${esc(angle)}" data-product="${esc(item.name)}" data-download-name="${esc(downloadName)}" aria-label="View enlarged ${esc(angle)} preview"><img class="wheel-result-output is-ai-generated" src="${esc(imageUrl)}" alt="${esc(item.name)} on your vehicle — ${esc(angle)}" loading="lazy"><span class="wheel-result-zoom-hint">Click to enlarge</span></button>` : '<div class="wheel-result-empty">Preview unavailable</div>'}<span class="wheel-result-mode">F-Box AI visual preview</span></div><div class="wheel-result-copy"><strong>${esc(angle)}</strong><span>${esc(context.resultNote)}</span>${imageActions}</div></article>`;
}
function wheelVisualizerImageViewer() {
  const viewer = state.wheelVisualizer?.resultViewer;
  if (!viewer?.open || !viewer.imageUrl) return '';
  return `<div class="wheel-image-viewer-overlay" data-action="wheel-image-viewer-close"><div class="wheel-image-viewer" data-wheel-image-viewer role="dialog" aria-modal="true" aria-labelledby="wheel-image-viewer-title" tabindex="-1"><header class="wheel-image-viewer-head"><div><div class="wheel-content-kicker">F-Box preview</div><h3 id="wheel-image-viewer-title">${esc(viewer.angleLabel)}</h3><span>${esc(viewer.productName)} · click outside to close</span></div><button type="button" class="icon-btn wheel-modal-close" data-action="wheel-image-viewer-close" aria-label="Close enlarged preview">${icons.close}</button></header><div class="wheel-image-viewer-stage"><img src="${esc(viewer.imageUrl)}" alt="${esc(viewer.alt)}"></div><div class="wheel-image-viewer-actions"><button type="button" class="btn btn-primary" data-action="wheel-image-download" data-image-url="${esc(viewer.imageUrl)}" data-download-name="${esc(viewer.downloadName)}">Save image <span aria-hidden="true">↓</span></button><button type="button" class="btn btn-outline" data-action="wheel-image-viewer-close">Close</button></div></div></div>`;
}
function wheelVisualizerInquiryContent(item, current) {
  const draft = { ...wheelVisualizerInquiryDefaults(item), ...(current.inquiry?.draft || {}) };
  const vehicleLabel = state.vehicle ? currentVehicleLabel() : current.vehicleName || 'Uploaded vehicle photo';
  const resultImages = current.results.map(result => result.imageUrl || result.image_url || result.url || '').filter(Boolean);
  const error = current.inquiry?.error ? `<div class="wheel-inquiry-error" role="alert">${esc(current.inquiry.error)}</div>` : '';
  if (current.inquiry?.status === 'success') {
    return `<div class="wheel-visualizer-content wheel-inquiry-success"><div class="wheel-success-mark">✓</div><div class="wheel-content-kicker">Inquiry received</div><h3>We have your build brief.<br><em>F-Box will follow up.</em></h3><p class="wheel-content-lead">Your product, wheel specifications and three generated previews are now attached to inquiry <strong>${esc(current.inquiry.id || 'submitted')}</strong>. A fitment specialist will confirm clearance and final pricing with you.</p><div class="wheel-inquiry-success-meta"><span>${esc(item.name)}</span><span>${resultImages.length} preview images attached</span><span>${esc(vehicleLabel)}</span></div><div class="wheel-inquiry-actions"><button type="button" class="btn btn-outline" data-action="wheel-inquiry-results">Back to previews</button><button type="button" class="btn btn-primary" data-action="wheel-close">Close studio <span aria-hidden="true">↗</span></button></div></div>`;
  }
  const submitting = current.inquiry?.status === 'submitting';
  return `<div class="wheel-visualizer-content wheel-inquiry-content"><div class="wheel-content-kicker">Start your fitment inquiry</div><h3>Tell us the spec.<br><em>We will confirm the build.</em></h3><p class="wheel-content-lead">Your selected product and all three generated previews will be attached. Choose the wheel data below so the F-Box team can check the exact vehicle fitment before quoting.</p>${error}<div class="wheel-inquiry-preview-strip">${resultImages.map((imageUrl, index) => `<button type="button" class="wheel-inquiry-preview" data-action="wheel-image-viewer" data-image-url="${esc(imageUrl)}" data-angle="${esc(wheelVisualizerAngleLabel(current.results[index]?.angle))}" data-product="${esc(item.name)}" data-download-name="${esc(wheelVisualizerDownloadName(item, current.results[index]?.angle, index))}" aria-label="View preview ${index + 1}"><img src="${esc(imageUrl)}" alt="${esc(item.name)} preview ${index + 1}"></button>`).join('')}</div><form class="wheel-inquiry-form" data-form="wheel-inquiry"><section class="wheel-inquiry-section"><div><strong>Wheel data</strong><span>Required for fitment review</span></div><div class="wheel-inquiry-grid"><label><span>Diameter <b>*</b></span>${wheelInquirySelect('diameter', ['17', '18', '19', '20', '21', '22'], draft.diameter, 'diameter')}</label><label><span>Width <b>*</b></span>${wheelInquirySelect('width', ['7.0', '7.5', '8.0', '8.5', '9.0', '9.5', '10.0', '10.5', '11.0', '11.5', '12.0'], draft.width, 'width')}</label><label><span>PCD / bolt pattern <b>*</b></span>${wheelInquirySelect('pcd', ['4x100', '5x100', '5x108', '5x112', '5x114.3', '5x120', '5x127', '5x130', '5x135', '5x139.7', '5x150', '6x135', '6x139.7'], draft.pcd, 'PCD')}</label><label><span>Offset / ET <b>*</b></span>${wheelInquirySelect('offset', ['-10', '0', '+15', '+20', '+25', '+30', '+35', '+40', '+45', '+50'], draft.offset, 'offset')}</label><label><span>Center bore <b>*</b></span><input class="text-input" name="center_bore" value="${esc(draft.center_bore)}" required placeholder="e.g. 66.1 mm"></label><label><span>Quantity <b>*</b></span>${wheelInquirySelect('quantity', ['1', '2', '4'], draft.quantity, 'quantity')}</label></div></section><section class="wheel-inquiry-section"><div><strong>Contact details</strong><span>So a fitment specialist can reply</span></div><div class="wheel-inquiry-grid"><label><span>Name <b>*</b></span><input class="text-input" name="customer_name" value="${esc(draft.customer_name)}" required placeholder="Your name"></label><label><span>Email <b>*</b></span><input class="text-input" name="customer_email" type="email" value="${esc(draft.customer_email)}" required placeholder="you@example.com"></label><label><span>Phone / WhatsApp</span><input class="text-input" name="customer_phone" value="${esc(draft.customer_phone)}" placeholder="Optional"></label><label><span>Vehicle reference</span><input class="text-input" value="${esc(vehicleLabel)}" readonly></label><label class="wheel-inquiry-full"><span>Notes for F-Box</span><textarea class="text-input" name="customer_note" rows="3" placeholder="Tell us about staggered fitment, brake clearance, finish or delivery needs.">${esc(draft.customer_note)}</textarea></label></div></section><div class="wheel-inquiry-form-actions"><button type="button" class="btn btn-outline" data-action="wheel-inquiry-results" ${submitting ? 'disabled' : ''}>Back to previews</button><button type="submit" class="btn btn-primary" ${submitting ? 'disabled' : ''}>${submitting ? 'Sending inquiry…' : 'Send inquiry'} <span aria-hidden="true">↗</span></button></div></form></div>`;
}
function wheelVisualizerModalLegacy() {
  const current = state.wheelVisualizer;
  if (!current?.open) return '';
  const item = wheelVisualizerItem();
  const phase = current.phase;
  const steps = [['upload', '01', 'Upload'], ['crop', '02', 'Frame'], ['reference', '03', 'Reference'], ['generating', '04', 'Generate'], ['results', '05', 'Results'], ['inquiry', '06', 'Inquiry']];
  const stepIndex = phase === 'error' ? 3 : Math.max(0, steps.findIndex(([key]) => key === phase));
  const stepRail = steps.map(([key, number, label], index) => `<div class="wheel-step ${index === stepIndex ? 'is-active' : ''} ${index < stepIndex ? 'is-done' : ''}"><span>${index < stepIndex ? '✓' : number}</span><strong>${label}</strong></div>`).join('');
  let content = '';
  if (phase === 'upload') content = `<div class="wheel-visualizer-content"><div class="wheel-content-kicker">Start with one real photo</div><h3>Show us the car.<br><em>We will show you the stance.</em></h3><p class="wheel-content-lead">Use a clear exterior photo with at least one wheel visible. A front three-quarter or side view gives the best fitment reference.</p><label class="wheel-upload-zone" data-wheel-dropzone><input type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" data-wheel-upload><span class="wheel-upload-icon">＋</span><strong>Drop your car photo here</strong><span>JPG, PNG, WEBP or HEIC · Up to 20 MB · mobile photos are compressed securely</span><span class="btn btn-dark btn-small">Choose a photo</span></label><div class="wheel-visualizer-privacy"><span>${icons.shield}</span><span>Your image is used only to create this preview. No payment or credits are required.</span></div></div>`;
  if (phase === 'crop') content = `<div class="wheel-visualizer-content"><div class="wheel-content-kicker">Frame the reference</div><h3>Keep the whole car.<br><em>Adjust only if needed.</em></h3><p class="wheel-content-lead">Upload the photo as-is. The full image stays available, even when the car sits low in a portrait frame. Drag the image or use the controls below; a wheel only needs to be visible, not centered in a box.</p><div class="wheel-crop-stage" data-wheel-crop-stage><img data-wheel-crop-image src="${esc(current.vehicleUrl)}" alt="${esc(current.vehicleName || 'Uploaded vehicle photo')}" draggable="false" style="${wheelVisualizerCropStyle(current.crop)}"><div class="wheel-crop-guide"><span>Full photo retained · drag to frame</span></div></div><div class="wheel-crop-live-note"><strong>Live framing</strong><span>Changes update the image above.</span></div><div class="wheel-crop-controls"><label><span>Zoom</span><input type="range" min="1" max="1.6" step="0.01" value="${current.crop.zoom}" data-wheel-crop="zoom"><output data-wheel-crop-output="zoom">${Number(current.crop.zoom).toFixed(2)}×</output></label><label><span>Horizontal position</span><input type="range" min="0" max="100" step="1" value="${current.crop.x}" data-wheel-crop="x"><output data-wheel-crop-output="x">${current.crop.x}%</output></label><label><span>Vertical position</span><input type="range" min="0" max="100" step="1" value="${current.crop.y}" data-wheel-crop="y"><output data-wheel-crop-output="y">${current.crop.y}%</output></label></div><div class="wheel-crop-actions"><button class="btn btn-outline btn-small" data-action="wheel-crop-reset">Reset frame</button><button class="btn btn-primary" data-action="wheel-generate">Generate 3 angles <span aria-hidden="true">↗</span></button></div></div>`;
  if (phase === 'generating') { const referenceAsset = visualizerReferenceAsset(item, current); content = `<div class="wheel-visualizer-content wheel-generating-content" aria-live="polite"><div class="wheel-generating-orbit"><div class="wheel-generating-wheel">${referenceAsset ? `<img src="${referenceAsset}" alt="${esc(item.name)}">` : `<span class="wheel-generating-part">${esc(item.category)}</span>`}</div><span></span><span></span><span></span></div><div class="wheel-content-kicker">F-Box visual studio</div><h3>Matching ${esc(visualizerProductContext(item).subject)} to vehicle<br><em>and checking the stance.</em></h3><p class="wheel-content-lead">We are applying only the selected ${esc(item.category.toLowerCase())} while keeping the original wheel and vehicle geometry locked.</p><div class="wheel-progress"><span></span></div><div class="wheel-generating-meta"><span>Product mask locked</span><span>3 angles requested</span><span>Officially included</span></div></div>`; }
  if (phase === 'results') content = `<div class="wheel-visualizer-content wheel-results-content"><div class="wheel-results-head"><div><div class="wheel-content-kicker">Your preview set</div><h3>See the wheel<br><em>in its natural stance.</em></h3></div><div class="wheel-results-count"><strong>03</strong><span>angles</span></div></div><p class="wheel-content-lead">These views use ${esc(item.name)} in ${esc(item.finish)} as the wheel reference. Keep the final fitment check with the F-Box team before production.</p><div class="wheel-results-grid">${current.results.map((result, index) => wheelVisualizerResultCard(result, index, item, current.mode)).join('')}</div><div class="wheel-results-actions"><button class="btn btn-outline" data-action="wheel-reset">Try another photo</button><button class="btn btn-primary" data-action="wheel-inquiry-open">Start an inquiry <span aria-hidden="true">↗</span></button></div></div>`;
  if (phase === 'results' && item.category !== 'Wheels') {
    const context = visualizerProductContext(item);
    content = content.replace('See the wheel', `See the ${context.subject}`).replace('as the wheel reference', `as the ${context.subject} reference`);
  }
  if (phase === 'inquiry') content = wheelVisualizerInquiryContent(item, current);
  if (phase === 'error') content = `<div class="wheel-visualizer-content wheel-error-content" role="alert"><div class="wheel-error-mark">!</div><div class="wheel-content-kicker">Preview not ready</div><h3>We could not finish<br><em>this set of angles.</em></h3><p class="wheel-content-lead">${esc(current.error || 'Please check the image and try again.')}</p><div class="wheel-error-actions"><button class="btn btn-outline" data-action="wheel-reset">Choose another photo</button><button class="btn btn-primary" data-action="wheel-retry">Retry preview</button></div></div>`;
  return `<div class="wheel-visualizer-overlay" data-action="wheel-close"><div class="wheel-visualizer-shell" data-wheel-modal role="dialog" aria-modal="true" aria-labelledby="wheel-visualizer-dialog-title"><header class="wheel-visualizer-header"><div><div class="wheel-visualizer-brand"><span class="wheel-brand-dot"></span> F-BOX VISUAL STUDIO</div><h2 id="wheel-visualizer-dialog-title">${esc(item.name)} <span>· ${esc(item.finish)}</span></h2></div><div class="wheel-visualizer-header-actions"><span class="wheel-included-badge">Included with your build</span><button class="icon-btn wheel-modal-close" data-action="wheel-close" aria-label="Close visual preview">${icons.close}</button></div></header><div class="wheel-visualizer-body"><aside class="wheel-step-rail"><div class="wheel-step-rail-title">Your build preview</div>${stepRail}<div class="wheel-step-rail-foot"><span>${icons.shield}</span><p>F-Box covers the preview cost. There is no customer charge.</p></div></aside><main class="wheel-visualizer-main">${wheelVisualizerReferencePicker(item, current)}${content}</main></div></div></div>`;
}
function wheelVisualizerModal() {
  const current = state.wheelVisualizer;
  let html = wheelVisualizerModalLegacy();
  if (!current?.open) return html;
  if (current.phase === 'crop') html = html.replace('data-action="wheel-generate">Generate 3 angles', 'data-action="wheel-reference-next">Continue to wheel reference');
  if (current.phase === 'reference') {
    const item = wheelVisualizerItem();
    const referenceAsset = visualizerReferenceAsset(item, current);
    const referenceLabel = 'Image 2 is sent as the authoritative wheel reference. Image 1 remains the ground-truth vehicle photo.';
    const content = `<div class="wheel-visualizer-content wheel-reference-content"><div class="wheel-content-kicker">Confirm image 2 · wheel reference</div><h3>Lock the wheel.<br><em>Then replace it on the car.</em></h3><p class="wheel-content-lead">${referenceLabel} The original wheel is replaced in its existing position while the vehicle identity, tire and camera perspective stay unchanged.</p><div class="wheel-reference-lockup"><div class="wheel-reference-large">${referenceAsset ? `<img src="${referenceAsset}" alt="${esc(item.name)} selected wheel reference">` : `<span class="wheel-reference-missing">Wheel<br>reference pending</span>`}</div><div><strong>${esc(item.name)}</strong><span>${esc(item.finish)} · ${esc(item.meta)}</span><small>Image 2 locked for all three angles</small></div></div><div class="wheel-reference-actions"><button class="btn btn-outline btn-small" data-action="wheel-reference-back">Back to framing</button><button class="btn btn-primary" data-action="wheel-generate">Generate 3 angles <span aria-hidden="true">↗</span></button></div></div>`;
    html = html.replace('</main></div></div></div>', `${content}</main></div></div></div>`);
  }
  return html;
}
// First-party analytics beacon: every page/product view and key CTA click is
// reported to the F-Box backend so the owner can see where buyers come from.
// Events are fire-and-forget; failures never affect the storefront.
function trackEvent(type, payload = {}) {
  try {
    fetch('/api/fbox-content/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ type, locale: state.locale, ...payload }),
      keepalive: true,
      signal: AbortSignal.timeout(4000)
    }).catch(() => {});
  } catch { /* analytics must never break the page */ }
}

let lastTrackedPath = '';
function trackPageView() {
  const path = location.pathname + location.hash;
  if (path === lastTrackedPath) return;
  lastTrackedPath = path;
  const productId = state.route?.name === 'product' ? state.route.id : '';
  trackEvent(productId ? 'product_view' : 'page_view', {
    path,
    title: document.title,
    referrer: document.referrer || '',
    product_id: productId,
    product_name: productId ? (product(productId)?.name || '') : ''
  });
}

function modal() {
  if (!state.modal) return '';
  if (state.modal.type === 'account-panel') {
    const account = state.account || {};
    return `<div class="overlay" data-action="close-modal"><div class="modal" data-modal-content><button class="icon-btn modal-close" data-action="close-modal">${icons.close}</button><p class="eyebrow">F-Box account</p><h2>Hi, ${esc(account.username || 'builder')}.</h2><div class="account-panel"><p>${esc(account.email || '')}${account.company ? ' · ' + esc(account.company) : ''}${account.country ? ' · ' + esc(account.country) : ''}</p><div class="account-panel-actions"><button class="btn btn-outline" data-action="orders">Track my orders</button><button class="btn btn-dark" data-action="account-logout">Sign out</button></div></div></div></div>`;
  }
  if (!state.modal) return '';
  if (state.modal.type === 'quick') { const item = product(state.modal.id); return `<div class="overlay" data-action="close-modal"><div class="modal" data-modal-content><button class="icon-btn modal-close" data-action="close-modal">${icons.close}</button><p class="eyebrow">Quick view</p><h2>${item.name}</h2><div class="quick-product"><img src="${ASSET + item.image}" alt="${esc(item.name)}"><div><div class="product-brand">${item.brand} · ${item.category}</div><div>${stars(item.rating)} <span class="muted">${item.reviews} reviews</span></div><p>${item.meta}<br>${item.deal}</p><strong style="font-size:22px">${money(item.price)} <small class="muted">/ each</small></strong><button class="btn btn-primary" data-action="add" data-id="${item.id}" style="width:100%;margin-top:15px">Add to cart</button></div></div></div></div>`; }
  if (state.modal.type === 'account') { const register = state.modal.mode === 'register'; return `<div class="overlay" data-action="close-modal"><div class="modal" data-modal-content><button class="icon-btn modal-close" data-action="close-modal">${icons.close}</button><p class="eyebrow">F-Box account</p><h2>${register ? 'Create your build account.' : 'Save your build.'}</h2><p>${register ? 'Save fitment builds, wishlist, addresses and orders. Dealers: add your company so we can quote wholesale.' : 'Sign in to sync your cart, wishlist and orders with the F-Box service.'}</p><form class="modal-form" data-form="account" data-mode="${register ? 'register' : 'login'}"><input class="text-input" name="username" placeholder="Username" autocomplete="username" required><input class="text-input" name="password" type="password" placeholder="Password (6+ characters)" autocomplete="${register ? 'new-password' : 'current-password'}" minlength="6" required>${register ? '<input class="text-input" name="email" type="email" autocomplete="email" placeholder="Email (for quotes & order updates)" required><input class="text-input" name="telephone" autocomplete="tel" placeholder="Phone / WhatsApp (optional)"><input class="text-input" name="company" autocomplete="organization" placeholder="Company (dealers & distributors)">' : ''}<button class="btn btn-primary">${register ? 'Create account & sign in' : 'Sign in'}</button><button class="btn btn-outline" type="button" data-action="${register ? 'account-login' : 'account-register'}">${register ? 'I already have an account' : 'Create a new account'}</button></form></div></div>`; }
  if (state.modal.type === 'orders') return `<div class="overlay" data-action="close-modal"><div class="modal modal-wide" data-modal-content><button class="icon-btn modal-close" data-action="close-modal">${icons.close}</button><p class="eyebrow">F-Box account</p><h2>Track my orders.</h2><p>订单状态来自 F-Box 自有订单服务；发货后可在这里继续查看物流信息。</p>${state.accountOrdersLoading ? '<div class="loading-copy">正在读取订单…</div>' : state.accountOrders.length ? `<div class="account-order-list">${state.accountOrders.map(order => `<article class="account-order"><div><strong>${esc(order.orderSn || order.id || 'Order')}</strong><small>${esc(order.createTime || '')}</small></div><div><span>${esc(order.productName || order.receiverName || 'F-Box order')}</span><small>${esc(order.status === 0 ? '待付款' : order.status === 1 ? '待发货' : order.status === 2 ? '已发货' : order.status === 3 ? '已完成' : order.status === 4 ? '已关闭' : '处理中')}</small></div><strong>${money(order.payAmount || order.totalAmount || 0)}</strong></article>`).join('')}</div>` : '<div class="empty-state"><h3>暂无订单</h3><p>登录后创建的 F-Box 订单会出现在这里。</p></div>'}</div></div>`;
  if (state.modal.type === 'review') return `<div class="overlay" data-action="close-modal"><div class="modal" data-modal-content><button class="icon-btn modal-close" data-action="close-modal">${icons.close}</button><p class="eyebrow">Your experience</p><h2>Write a review.</h2><form class="modal-form" data-form="review"><div class="review-rating-input" role="radiogroup" aria-label="Rating"><input type="hidden" name="rating" value="5">${[5,4,3,2,1].map(n => `<button type="button" class="rating-star ${n === 5 ? 'is-active' : ''}" data-rating="${n}" aria-label="${n} stars">★</button>`).join('')}</div><input class="text-input" name="title" placeholder="Review title" required><textarea class="text-input" name="body" rows="5" placeholder="What did you install? How does it fit?" required></textarea><input class="text-input" name="vehicle" placeholder="Your vehicle (e.g. 2023 BMW M340i)"><button class="btn btn-primary">Submit review</button></form></div></div>`;
  if (state.modal.type === 'checkout') { const f = state.checkoutForm || {}; return `<div class="overlay" data-action="close-modal"><div class="modal" data-modal-content><button class="icon-btn modal-close" data-action="close-modal">${icons.close}</button><p class="eyebrow">Secure checkout</p><h2>创建 F-Box 订单</h2><div class="checkout-steps">${['客户信息', '收货信息', '创建订单'].map((label, i) => `<div class="checkout-step ${state.checkoutStep === i + 1 || state.checkoutStep === 3 ? 'is-active' : ''}">${i + 1}. ${label}</div>`).join('')}</div>${state.checkoutStep === 4 ? `<div class="success-box"><h3>订单已创建。</h3><p>订单号：${esc(state.lastOrder?.orderSn || state.lastOrder?.id || '已提交')}。你可以在后台“订单 > 订单列表”继续处理。</p><button class="btn btn-dark" data-action="close-modal">返回商城</button></div>` : `<form class="modal-form" data-form="checkout"><input class="text-input" name="name" value="${esc(f.name || '')}" required placeholder="Full name"><input class="text-input" name="phone" value="${esc(f.phone || '')}" required placeholder="Phone number"><input class="text-input" name="email" value="${esc(f.email || '')}" type="email" required placeholder="Email address"><input class="text-input" name="address" value="${esc(f.address || '')}" required placeholder="Street address"><div class="filter-row"><input class="text-input" name="city" value="${esc(f.city || '')}" required placeholder="City"><input class="text-input" name="province" value="${esc(f.province || '')}" placeholder="State / Province"></div><div class="filter-row"><input class="text-input" name="region" value="${esc(f.region || '')}" placeholder="Region"><input class="text-input" name="postCode" value="${esc(f.postCode || '')}" required placeholder="Postcode"></div><p class="filter-help">订单会先创建为“待付款”，支付由后台配置的支付渠道处理。</p><button class="btn btn-primary" data-submit-order>${state.checkoutStep === 3 ? '提交并创建订单' : '继续填写并创建订单'}</button></form>`}</div></div>`; }
  return '';
}
function chat() {
  const messages = state.chatMessages.length
    ? state.chatMessages.map(message => message.kind === 'quote' && message.quote ? `<div class="chat-bubble is-agent">${esc(message.text)}${quoteCardMarkup(message.quote)}</div>` : `<div class="chat-bubble ${message.role === 'customer' ? 'is-customer' : 'is-agent'}">${esc(message.text)}</div>`).join('')
    : '<div class="chat-bubble">Hey — tell us what you are building. A fitment specialist will follow up here.</div>';
  return `<button class="chat-fab" data-action="chat" aria-label="Open chat">${icons.chat}${state.chatMessages.length ? `<span class="chat-fab-dot" aria-label="Chat active"></span>` : ''}</button>${state.chatOpen ? `<div class="chat-panel"><div class="chat-head"><div><strong>F-Box fitment help</strong><small>Usually replies in a few minutes</small></div><button class="icon-btn" data-action="chat">${icons.close}</button></div><div class="chat-body"><div class="chat-thread">${messages}</div><div class="chat-quick"><button data-action="chat-reply" data-message="I need help checking my wheel fitment.">Check my wheel fitment</button><button data-action="chat-reply" data-message="Can you recommend brake pads for my car?">Recommend brake pads</button><button data-action="chat-reply" data-message="I need help tracking my order.">Track my order</button></div><form class="chat-compose" data-form="site-chat"><input class="chat-input" name="message" placeholder="Type your message…" autocomplete="off" ${state.chatSending ? 'disabled' : ''}><button class="btn btn-primary chat-send" type="submit" ${state.chatSending ? 'disabled' : ''}>${state.chatSending ? 'Sending…' : 'Send'}</button></form></div></div>` : ''}`;
}

function quoteCardMarkup(quote) {
  const spec = [quote.customer_wheel_specs?.diameter && `${quote.customer_wheel_specs.diameter} × ${quote.customer_wheel_specs.width || '—'}`, quote.customer_wheel_specs?.pcd, quote.customer_wheel_specs?.center_bore && `CB ${quote.customer_wheel_specs.center_bore}`, quote.customer_wheel_specs?.offset && `ET ${quote.customer_wheel_specs.offset}`].filter(Boolean).join(' · ');
  const paid = quote.payment_status === 'paid';
  return `<div class="chat-quote-card"><div class="chat-quote-head"><span>F-BOX QUOTATION</span><strong>${paid ? 'Paid' : 'Ready to review'}</strong></div><div class="chat-quote-product">${quote.product_image ? `<img src="${esc(quote.product_image)}" alt="${esc(quote.product_name || 'F-Box product')}">` : ''}<div><strong>${esc(quote.product_name || 'F-Box custom quote')}</strong><small>${esc(spec || 'Custom fitment specification')}</small></div></div><div class="chat-quote-grid"><span>Product × Qty<strong>${money(quote.unit_price)} × ${quote.quantity || 1}</strong></span><span>Shipping<strong>${money(quote.shipping_fee || 0)}</strong></span><span>Production<strong>${quote.production_time_days ? `${quote.production_time_days} days` : 'To confirm'}</strong></span><span>Transit estimate<strong>${quote.shipping_estimate_days ? `${quote.shipping_estimate_days} days` : 'To confirm'}</strong></span></div><div class="chat-quote-total"><span>Total</span><strong>${money(quote.total)}</strong></div>${quote.logistics_method ? `<p class="chat-quote-note">${esc(quote.logistics_method)}</p>` : ''}${quote.note ? `<p class="chat-quote-note">${esc(quote.note)}</p>` : ''}${paid ? '<div class="chat-quote-paid">Payment received — F-Box will continue with production and shipping.</div>' : quote.payment_ready && quote.checkout_token ? `<button class="btn btn-primary chat-quote-pay" data-action="pay-quote" data-quote-id="${esc(quote.id)}" data-payment-token="${esc(quote.checkout_token)}">Pay with PayPal ↗</button>` : '<div class="chat-quote-pending">Payment setup is being prepared. Please message us for assistance.</div>'}</div>`;
}

async function submitWebsiteChat(message) {
  const text = String(message || '').trim();
  if (!text || state.chatSending) return;
  state.chatSending = true;
  state.chatMessages = [...state.chatMessages, { role: 'customer', text }];
  render();
  try {
    const response = await fetch('/api/fbox-content/chat', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversation_id: state.chatSessionId,
        message: text,
        locale: state.locale,
        vehicle: currentVehicleLabel(),
        vehicle_selection: state.vehicle || {},
        official_wheel_specs: currentOfficialWheelSpecs(),
        product_id: state.route.name === 'product' ? state.route.id : '',
        product_name: state.route.name === 'product' ? product(state.route.id).name : '',
        product_category: state.route.name === 'product' ? product(state.route.id).category : '',
        product_finish: state.route.name === 'product' ? product(state.route.id).finish : '',
        product_image: state.route.name === 'product' ? `${location.origin}/assets/${product(state.route.id).image}` : '',
        product_display_price: state.route.name === 'product' ? product(state.route.id).price : 0
      })
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.detail || 'Message could not be sent.');
    state.chatSessionId = payload.data?.id || state.chatSessionId;
    if (state.chatSessionId) localStorage.setItem('fbox-chat-session', state.chatSessionId);
    state.chatMessages = payload.data?.messages || state.chatMessages;
  } catch (error) {
    state.chatMessages = state.chatMessages.slice(0, -1);
    setToast(error?.message || '客服消息发送失败，请稍后再试。');
  } finally {
    state.chatSending = false;
    render();
  }
}
async function loadWebsiteChat() {
  if (!state.chatSessionId) return;
  try {
    const response = await fetch(`/api/fbox-content/chat/${encodeURIComponent(state.chatSessionId)}`, { headers: { Accept: 'application/json' } });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) return;
    state.chatMessages = payload.data?.messages || state.chatMessages;
    render();
  } catch { /* Chat remains usable when the customer is offline. */ }
}
async function payQuote(quoteId, paymentToken) {
  try {
    const response = await fetch(`/api/fbox-content/quotes/${encodeURIComponent(quoteId)}/paypal`, { method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify({ payment_token: paymentToken }) });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.detail || 'PayPal checkout could not be started.');
    if (!payload.data?.approval_url) throw new Error('PayPal did not return an approval link.');
    window.location.href = payload.data.approval_url;
  } catch (error) { setToast(error?.message || 'PayPal checkout could not be started.'); }
}
async function captureReturnedPayPalPayment() {
  const query = new URLSearchParams(location.search);
  const quoteId = query.get('paypal_quote');
  const paymentToken = query.get('paypal_token');
  const orderId = query.get('token');
  if (!quoteId || !paymentToken || !orderId) return;
  try {
    const response = await fetch('/api/fbox-content/paypal/capture', { method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify({ quote_id: quoteId, payment_token: paymentToken, order_id: orderId }) });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.detail || 'PayPal payment confirmation failed.');
    if (payload.data?.inquiry?.messages) state.chatMessages = payload.data.inquiry.messages;
    setToast(payload.data?.status === 'paid' ? 'PayPal payment received. F-Box will continue your order.' : 'PayPal payment is still processing.');
  } catch (error) { setToast(error?.message || 'PayPal payment confirmation failed.'); }
  history.replaceState({}, document.title, `${location.pathname}${location.hash || '#home'}`);
}
function footer() { return `<footer class="footer"><div class="container"><div class="footer-top"><div><a class="brand" href="#home"><i class="brand-mark"></i><span>F-BOX</span></a><p class="footer-slogan">A fitment-first destination for the parts that make your car feel like yours.</p><div class="company-meta"><strong>${company.legalName}</strong><a href="tel:${company.tel}">${company.phone}</a></div></div><div class="footer-grid"><div class="footer-col"><h3>Shop</h3><a href="#store">Wheels</a><a href="#store">Calipers</a><a href="#store">Rotors</a><a href="#store">Brake pads</a></div><div class="footer-col"><h3>Tools</h3><a href="#home#fitment">Shop by vehicle</a><a href="#home#gallery">Fitment guides</a><a href="#home#resources">Reviews</a><a href="#store">Financing</a></div><div class="footer-col"><h3>Help</h3><a href="#home#resources">FAQs & policies</a><a href="#home#resources">Shipping & returns</a><a href="#home#resources">Warranty</a><a href="tel:${company.tel}">Contact us · ${company.phone}</a></div><div class="footer-col"><h3>Company</h3><a href="#home">About F-Box</a><a href="#home">Wholesale</a><a href="#home">Careers</a><a href="#home" data-action="orders">Track order</a></div></div></div><div class="footer-bottom"><span>© 2026 ${company.legalName} · F-Box Performance Parts</span><span>Terms · Privacy · CCPA</span></div></div></footer>`; }

function applyTranslations() {
  document.documentElement.lang = state.locale;
  document.documentElement.dir = state.locale === 'ar' ? 'rtl' : 'ltr';
  const dictionary = localeDictionaries[state.locale];
  if (!dictionary) return;
  const root = document.querySelector('#app');
  if (!root) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(node => {
    const raw = node.nodeValue;
    const key = raw.trim();
    if (!key || !dictionary[key]) return;
    const leading = raw.match(/^\s*/)?.[0] || '';
    const trailing = raw.match(/\s*$/)?.[0] || '';
    node.nodeValue = `${leading}${dictionary[key]}${trailing}`;
  });
  root.querySelectorAll('[placeholder]').forEach(element => {
    const translated = dictionary[element.getAttribute('placeholder')];
    if (translated) element.setAttribute('placeholder', translated);
  });
  root.querySelectorAll('[aria-label]').forEach(element => {
    const translated = dictionary[element.getAttribute('aria-label')];
    if (translated) element.setAttribute('aria-label', translated);
  });
}

const translationCache = JSON.parse(localStorage.getItem('fbox-translation-cache') || '{}');
let translationRun = 0;
const translationProtectedClasses = ['brand', 'brand-mark', 'company-meta', 'product-brand', 'product-title', 'product-meta', 'fitment-selects', 'locale-select', 'cart-count', 'stars', 'part-number'];
function isProtectedTranslationNode(node, root) {
  let element = node.parentElement;
  while (element && element !== root) {
    if (['SCRIPT', 'STYLE', 'OPTION', 'SELECT', 'TEXTAREA'].includes(element.tagName)) return true;
    if (translationProtectedClasses.some(className => element.classList.contains(className))) return true;
    element = element.parentElement;
  }
  return false;
}
function translationLocale(code) { return code === 'pt-BR' ? 'pt' : code; }
function preserveTextWhitespace(source, translated) {
  const leading = source.match(/^\s*/)?.[0] || '';
  const trailing = source.match(/\s*$/)?.[0] || '';
  return `${leading}${translated.trim()}${trailing}`;
}
function collectTranslationTargets(root) {
  const targets = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const source = node.nodeValue || '';
    const key = source.trim();
    if (!key || key.length < 2 || /^[-+·•\d\s$€£¥%/.,:;!?]+$/.test(key) || /[\u0400-\u04FF\u0600-\u06FF\u3040-\u30FF\u3400-\u9FFF\uAC00-\uD7AF]/.test(key) || isProtectedTranslationNode(node, root)) continue;
    targets.push({ node, source, key, kind: 'text' });
  }
  root.querySelectorAll('[placeholder],[aria-label],[title]').forEach(element => {
    if (translationProtectedClasses.some(className => element.classList.contains(className))) return;
    ['placeholder', 'aria-label', 'title'].forEach(attribute => {
      const key = element.getAttribute(attribute);
      if (!key || key.length < 2 || /[\u0400-\u04FF\u0600-\u06FF\u3040-\u30FF\u3400-\u9FFF\uAC00-\uD7AF]/.test(key)) return;
      targets.push({ element, source: key, key, kind: 'attribute', attribute });
    });
  });
  return targets;
}
async function translatePhrase(source, locale, signal) {
  const cacheKey = `${locale}::${source}`;
  if (translationCache[cacheKey]) return translationCache[cacheKey];
  if (typeof fetch !== 'function') return source;
  const endpoint = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${encodeURIComponent(translationLocale(locale))}&dt=t&q=${encodeURIComponent(source)}`;
  const response = await fetch(endpoint, { signal, headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`Translation request failed: ${response.status}`);
  const payload = await response.json();
  const translated = Array.isArray(payload?.[0]) ? payload[0].map(part => part?.[0] || '').join('') : source;
  translationCache[cacheKey] = translated || source;
  return translated || source;
}
async function translatePageFull() {
  if (state.locale === 'en') return;
  const root = document.querySelector('#app');
  if (!root) return;
  const run = ++translationRun;
  const controller = new AbortController();
  const targets = collectTranslationTargets(root);
  const pendingKeys = new Set();
  const pending = targets.filter(target => {
    const cacheKey = `${state.locale}::${target.key}`;
    if (translationCache[cacheKey] || pendingKeys.has(target.key)) return false;
    pendingKeys.add(target.key);
    return true;
  });
  const apply = (target, translated) => {
    if (target.kind === 'text' && target.node.isConnected) target.node.nodeValue = preserveTextWhitespace(target.source, translated);
    if (target.kind === 'attribute' && target.element.isConnected) target.element.setAttribute(target.attribute, translated);
  };
  const cached = targets.filter(target => translationCache[`${state.locale}::${target.key}`]);
  cached.forEach(target => apply(target, translationCache[`${state.locale}::${target.key}`]));
  for (let index = 0; index < pending.length; index += 5) {
    if (run !== translationRun) { controller.abort(); return; }
    const batch = pending.slice(index, index + 5);
    try {
      const results = await Promise.all(batch.map(async target => [target, await translatePhrase(target.key, state.locale, controller.signal)]));
      if (run !== translationRun) return;
      results.forEach(([target, translated]) => targets.filter(candidate => candidate.key === target.key).forEach(candidate => apply(candidate, translated)));
      localStorage.setItem('fbox-translation-cache', JSON.stringify(translationCache));
    } catch {
      // Local locale dictionaries remain visible when the public translation endpoint is blocked or offline.
      return;
    }
  }
}

async function detectLocaleByIp() {
  if (state.localeMode === 'manual') return;
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 2600);
  try {
    const response = await fetch('https://ipapi.co/json/', { signal: controller.signal, headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`IP locale request failed: ${response.status}`);
    const data = await response.json();
    const detected = countryLocale(data.country_code);
    state.localeCountry = data.country_code || '';
    if (state.localeMode === 'auto' && detected !== state.locale) {
      state.locale = detected;
      render();
    }
  } catch {
    // Privacy extensions, offline previews and rate limits fall back to navigator.language or English.
  } finally {
    window.clearTimeout(timeout);
  }
}

function productFromCard(card) {
  const name = card.querySelector('.product-title')?.textContent?.trim() || '';
  return products.find(item => item.name === name);
}
function quoteActionButton(label, className, productId, action = 'customize') {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.dataset.action = action;
  button.dataset.id = productId;
  button.textContent = label;
  return button;
}
function wireProductGallery() {
  if (state.route.name !== 'product') return;
  const item = product(state.route.id);
  const images = productGallery(item);
  if (!item || !images.length) return;
  const active = images.includes(state.productImage[item.id]) ? state.productImage[item.id] : images[0];
  state.productImage[item.id] = active;
  const thumbs = document.querySelector('.gallery .thumbs');
  if (thumbs) {
    thumbs.replaceChildren();
    images.forEach((image, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'thumb' + (image === active ? ' is-active' : '');
      button.dataset.action = 'product-image';
      button.dataset.id = item.id;
      button.dataset.image = image;
      button.setAttribute('aria-label', item.name + ' image ' + (index + 1));
      const preview = document.createElement('img');
      preview.src = assetUrl(image);
      preview.alt = item.name + ' view ' + (index + 1);
      button.append(preview);
      thumbs.append(button);
    });
  }
  const mainImage = document.querySelector('.gallery .main-image img');
  if (mainImage) {
    mainImage.src = assetUrl(active);
    mainImage.alt = item.name + ' ' + (item.finish || '');
  }
}
function wireStartingPrices() {
  document.querySelectorAll('.product-card').forEach(card => {
    const item = productFromCard(card);
    if (!item || !hasStartingPrice(item)) return;
    const price = card.querySelector('.price');
    if (price) price.textContent = productPriceText(item);
    const add = card.querySelector('[data-action="add"]');
    if (add) {
      const link = document.createElement('a');
      link.className = add.className;
      link.href = '#product/' + item.id;
      link.textContent = 'Customize & quote';
      add.replaceWith(link);
    }
  });
  if (state.route.name === 'product') {
    const item = product(state.route.id);
    if (!item || !hasStartingPrice(item)) return;
    const price = document.querySelector('.detail-price');
    if (price) {
      const note = document.createElement('small');
      note.textContent = 'starting price / wheel';
      price.replaceChildren(document.createTextNode(productPriceText(item) + ' '), note);
    }
    const set = document.querySelector('.detail-set');
    if (set) set.textContent = 'Final price is quoted after fitment, finish, PCD, CB and ET are confirmed.';
    const financing = document.querySelector('.financing-note');
    if (financing) financing.textContent = 'Made to order. Start the visual fitment preview or send an inquiry to receive your exact USD quote.';
    const actions = document.querySelector('.detail-actions');
    if (actions) {
      actions.replaceChildren(
        quoteActionButton('Upload car photo', 'btn btn-primary', item.id),
        quoteActionButton('Ask F-Box', 'btn btn-dark', item.id, 'chat')
      );
    }
  }
  if (state.modal?.type === 'quick') {
    const item = product(state.modal.id);
    if (!item || !hasStartingPrice(item)) return;
    const quick = document.querySelector('.quick-product');
    const quickImage = quick?.querySelector('img');
    if (quickImage) quickImage.src = assetUrl(productGallery(item)[0] || item.image);
    const quickPrice = quick?.querySelector('strong');
    if (quickPrice) quickPrice.textContent = productPriceText(item);
    const add = quick?.querySelector('[data-action="add"]');
    if (add) {
      const link = document.createElement('a');
      link.className = add.className;
      link.href = '#product/' + item.id;
      link.textContent = 'Customize & quote';
      add.replaceWith(link);
    }
  }
}
function render() {
  state.route = getRoute();
  const page = state.route.name === 'home' ? customWheelHomePage() : state.route.name === 'store' ? storePage() : state.route.name === 'cart' ? cartPage() : productPage(product(state.route.id));
  document.querySelector('#app').innerHTML = `${header()}${page}${footer()}${chat()}${state.cookie ? '<div class="cookie-banner"><span>By using F-Box, you agree to our cookie policy and fitment analytics.</span><button data-action="dismiss-cookie">Dismiss</button></div>' : ''}${modal()}${wheelVisualizerModal()}${wheelVisualizerImageViewer()}${state.toast ? `<div class="toast">${esc(state.toast)}</div>` : ''}`;
  wireProductGallery();
  wireStartingPrices();
  wireProductReviews();
  wireReviewForm();
  wireWheelVisualizerEntry();
  wireWheelInquiryDetails();
  wireHomeVisualizerBanner();
  decorateIntegrationState();
  applyTranslations();
  translatePageFull();
  wireSpotlights();
  animateIn();
}

function wireSpotlights() {
  document.querySelectorAll('.spotlight-card').forEach(card => card.addEventListener('pointermove', event => { const rect = card.getBoundingClientRect(); card.style.setProperty('--mouse-x', `${event.clientX - rect.left}px`); card.style.setProperty('--mouse-y', `${event.clientY - rect.top}px`); }));
}
async function animateIn() {
  try {
    const mod = await import('https://cdn.jsdelivr.net/npm/animejs@4.0.2/+esm');
    const animate = mod.animate;
    const targets = document.querySelectorAll('.reveal');
    if (typeof animate === 'function' && targets.length) animate(targets, { opacity: [0, 1], translateY: [14, 0], duration: 560, delay: mod.stagger ? mod.stagger(45) : 0, ease: 'outCubic' });
  } catch { /* CSS reveal is the offline fallback. */ }
}

function updateVehicle(field, value) {
  const v = { ...(state.vehicle || {}) };
  if (field === 'year') { state.vehicle = value ? { year: value } : null; }
  else { v[field] = value; if (field === 'make') { delete v.model; delete v.trim; delete v.drive; } if (field === 'model') { delete v.trim; delete v.drive; } if (field === 'trim') delete v.drive; state.vehicle = v; }
  persist(); render();
  if (state.vehicle?.trim) window.setTimeout(() => document.querySelector('.fitment-preview')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 80);
}
function clearFilters() { state.search = ''; state.filters = { category: 'All', saleOnly: false, finish: 'All', diameter: 'All', minPrice: '', maxPrice: '', minRating: '0' }; state.sort = 'latest'; render(); }
async function wheelVisualizerSubmitInquiry(values) {
  const current = state.wheelVisualizer;
  if (!current?.open || current.phase !== 'inquiry' || current.inquiry?.status === 'submitting') return;
  const item = wheelVisualizerItem();
  const resultImages = current.results.map(result => result.imageUrl || result.image_url || result.url || '').filter(Boolean).slice(0, 3);
  const vehicleLabel = state.vehicle ? currentVehicleLabel() : current.vehicleName || 'Uploaded vehicle photo';
  const wheelSpecs = { diameter: values.diameter, width: values.width, pcd: values.pcd, offset: values.offset, center_bore: values.center_bore, quantity: values.quantity, oem_diameter: values.oem_diameter, oem_width: values.oem_width, oem_pcd: values.oem_pcd, oem_center_bore: values.oem_center_bore, oem_offset: values.oem_offset };
  const fitmentText = Object.entries(wheelSpecs).map(([key, value]) => `${key}: ${value}`).join(', ');
  const message = `Visual fitment inquiry for ${item.name}. Wheel data — ${fitmentText}. Vehicle reference: ${vehicleLabel}. Generated preview images attached: ${resultImages.length}. Customer note: ${values.customer_note || 'None'}`;
  current.inquiry = { status: 'submitting', draft: values, error: '' };
  render();
  try {
    const response = await fetch('/api/fbox-content/inquiries', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: 'visualizer-wheel-inquiry',
        message,
        customer_name: values.customer_name,
        customer_email: values.customer_email,
        customer_phone: values.customer_phone,
        vehicle: vehicleLabel,
        vehicle_selection: state.vehicle || {},
        official_wheel_specs: currentOfficialWheelSpecs(),
        vehicle_file_name: current.vehicleName,
        product_id: item.id,
        product_name: item.name,
        product_category: item.category,
        product_finish: item.finish,
        product_image: visualizerReferenceAsset(item, current),
        product_display_price: item.price,
        preview_images: resultImages,
        wheel_specs: wheelSpecs,
        customer_note: values.customer_note
      })
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.detail || 'The inquiry could not be submitted.');
    current.inquiry = { status: 'success', id: payload.data?.id || 'submitted', draft: values, error: '' };
    render();
  } catch (error) {
    current.inquiry = { status: 'error', draft: values, error: error?.message || 'The inquiry could not be submitted. Please try again.' };
    render();
  }
}
async function addToCart(id) {
  const item = product(id);
  if (item && hasStartingPrice(item)) {
    setToast('This is a starting price. Confirm your vehicle and custom wheel data to receive the final quote.');
    go('#product/' + item.id);
    return;
  }
  const existing = state.cart.find(row => row.id === id);
  if (existing) existing.qty += 1;
  else state.cart.push({ id, qty: 1 });
  persist();
  if (state.mallToken && item) {
    try {
      await mallRequest(mallConfig.portalBase, '/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: item.id, quantity: 1 })
      });
      await loadMallCart();
    } catch (error) {
      setToast(error?.message || 'F-Box 购物车同步失败，当前商品已保存在本地。');
      return;
    }
  }
  setToast(`${item.name} added to your cart.`);
}

document.addEventListener('click', async event => {
  const anchor = event.target.closest('a[href^="#home#"]');
  if (anchor) {
    event.preventDefault();
    const sectionId = anchor.getAttribute('href').split('#home#')[1];
    state.modal = null;
    if (location.hash !== '#home') location.hash = '#home';
    window.setTimeout(() => document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 40);
    return;
  }
  const target = event.target.closest('[data-action], [data-category-link]');
  if (!target) return;
  const action = target.dataset.action;
  if (['add', 'buy-now', 'checkout', 'chat', 'write-review', 'customize', 'quote'].includes(action)) {
    trackEvent('click', { path: location.pathname + location.hash, title: action, meta: { action, product_id: target.dataset.id || '' } });
  }
  if (target.dataset.categoryLink !== undefined) { state.filters.category = target.dataset.categoryLink || 'All'; state.menuOpen = false; go('#store'); return; }
  if (action === 'mega') { state.menuOpen = !state.menuOpen; render(); return; }
  if (action === 'mobile-nav') { state.mobileNav = !state.mobileNav; render(); return; }
  if (action === 'cart') { go('#cart'); return; }
  if (action === 'account') { state.modal = state.mallToken && state.account ? { type: 'account-panel' } : { type: 'account', mode: 'login' }; render(); return; }
  if (action === 'account-logout') { await mallLogout(); state.modal = null; setToast('Signed out. Your local cart stays on this device.'); return; }
  if (action === 'account-register') { state.modal = { type: 'account', mode: 'register' }; render(); return; }
  if (action === 'account-login') { state.modal = { type: 'account', mode: 'login' }; render(); return; }
  if (action === 'orders') { if (!state.mallToken) { state.modal = { type: 'account', mode: 'login', afterLogin: 'orders' }; render(); } else { state.modal = { type: 'orders' }; loadMemberOrders(); } return; }
  if (action === 'dismiss-cookie') { state.cookie = false; localStorage.setItem('fbox-cookie', 'dismissed'); render(); return; }
  if (action === 'chat') { state.chatOpen = !state.chatOpen; render(); if (state.chatOpen) void loadWebsiteChat(); return; }
  if (action === 'pay-quote') { void payQuote(target.dataset.quoteId, target.dataset.paymentToken); return; }
  if (action === 'chat-reply') {
    const message = target.dataset.message || 'I need fitment help.';
    await submitWebsiteChat(message);
    return;
  }
  if (action === 'wheel-open') { state.wheelVisualizer = wheelVisualizerState(target.dataset.id, target.dataset.image); render(); return; }
  if (action === 'wheel-reference') {
    const current = state.wheelVisualizer;
    const nextImage = target.dataset.image;
    if (!current?.open || !nextImage || current.phase === 'generating' || current.referenceImage === nextImage) return;
    current.referenceImage = nextImage;
    state.productImage[current.productId] = nextImage;
    current.results = [];
    current.jobId = '';
    current.error = '';
    current.errorCode = '';
    current.mode = 'fbox-lingkeai';
    if (current.phase === 'results' || current.phase === 'error') current.phase = current.vehicleFile ? 'reference' : 'upload';
    render();
    return;
  }
  if (action === 'wheel-reference-next') { if (state.wheelVisualizer.vehicleFile) { state.wheelVisualizer.phase = 'reference'; render(); } return; }
  if (action === 'wheel-reference-back') { if (state.wheelVisualizer.vehicleFile) { state.wheelVisualizer.phase = 'crop'; render(); } return; }
  if (action === 'wheel-image-viewer') {
    const imageUrl = target.dataset.imageUrl;
    if (!state.wheelVisualizer?.open || !imageUrl) return;
    state.wheelVisualizer.resultViewer = {
      open: true,
      imageUrl,
      angleLabel: target.dataset.angle || 'Generated view',
      productName: target.dataset.product || wheelVisualizerItem().name,
      alt: `${target.dataset.product || wheelVisualizerItem().name} on your vehicle — ${target.dataset.angle || 'generated view'}`,
      downloadName: target.dataset.downloadName || 'fbox-preview.jpg'
    };
    render();
    return;
  }
  if (action === 'wheel-image-download') { void wheelVisualizerDownload(target.dataset.imageUrl, target.dataset.downloadName || 'fbox-preview.jpg'); return; }
  if (action === 'wheel-image-viewer-close') {
    if (target.classList.contains('wheel-image-viewer-overlay') && event.target !== target) return;
    if (state.wheelVisualizer?.resultViewer) { state.wheelVisualizer.resultViewer = null; render(); }
    return;
  }
  if (action === 'wheel-inquiry-open') {
    if (state.wheelVisualizer?.phase === 'results' && state.wheelVisualizer.results.length) {
      state.wheelVisualizer.phase = 'inquiry';
      state.wheelVisualizer.resultViewer = null;
      state.wheelVisualizer.inquiry = { status: 'idle', draft: wheelVisualizerInquiryDefaults(wheelVisualizerItem()), error: '' };
      render();
    }
    return;
  }
  if (action === 'wheel-inquiry-results') { if (state.wheelVisualizer?.open && state.wheelVisualizer.results.length) { state.wheelVisualizer.phase = 'results'; state.wheelVisualizer.resultViewer = null; render(); } return; }
  if (action === 'wheel-close') { if (event.target.closest('[data-wheel-modal]') && !target.classList.contains('wheel-modal-close')) return; wheelVisualizerClose(); return; }
  if (action === 'wheel-generate') { if (state.wheelVisualizer.phase === 'reference') wheelVisualizerStart(); return; }
  if (action === 'wheel-reset') { wheelVisualizerReset('upload'); return; }
  if (action === 'wheel-retry') { if (state.wheelVisualizer.vehicleFile) { if (state.wheelVisualizer.jobId && !['JOB_FAILED', 'JOB_CANCELED'].includes(state.wheelVisualizer.errorCode)) wheelVisualizerResume(); else wheelVisualizerStart(); } else wheelVisualizerReset('upload'); return; }
  if (action === 'wheel-crop-reset') { state.wheelVisualizer.crop = { zoom: 1, x: 50, y: 50 }; render(); return; }
  if (action === 'quick-view') { state.modal = { type: 'quick', id: target.dataset.id }; render(); return; }
  if (action === 'close-modal') { if (event.target.closest('[data-modal-content]') && !target.classList.contains('modal-close')) return; state.modal = null; render(); return; }
  if (action === 'wishlist') {
    const id = target.dataset.id;
    const item = product(id);
    const wasSaved = state.wishlist.includes(id);
    state.wishlist = wasSaved ? state.wishlist.filter(x => x !== id) : [...state.wishlist, id];
    persist();
    if (state.mallToken && item) {
      try {
        if (wasSaved) await mallRequest(mallConfig.portalBase, `/wishlist/${encodeURIComponent(item.id)}`, { method: 'DELETE' });
        else await mallRequest(mallConfig.portalBase, '/wishlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ product_id: item.id }) });
      } catch (error) { setToast(error?.message || '收藏同步失败，已保存在当前设备。'); }
    }
    render();
    return;
  }
  if (action === 'customize') {
    const item = product(target.dataset.id);
    if (item?.category === 'Wheels') state.wheelVisualizer = wheelVisualizerState(item.id, state.productImage[item.id] || productGallery(item)[0] || item.image);
    else state.chatOpen = true;
    render();
    return;
  }
  if (action === 'add') { addToCart(target.dataset.id); return; }
  if (action === 'buy-now') { addToCart(target.dataset.id); state.modal = state.mallToken ? { type: 'checkout' } : { type: 'account', afterLogin: 'checkout' }; state.checkoutStep = state.mallToken ? 3 : 1; render(); return; }
  if (action === 'product-image') { state.productImage[target.dataset.id] = target.dataset.image; render(); return; }
  if (action === 'view-fitment-products') { state.search = ''; state.filters.category = 'All'; go('#store'); return; }
  if (action === 'change-vehicle') { state.vehicle = null; localStorage.removeItem('fbox-vehicle'); go('#home'); return; }
  if (action === 'shop-vehicle') { if (!state.vehicle?.trim) { setToast('Choose Year, Make, Model and Trim first.'); return; } setToast(`Fitment saved for ${currentVehicleLabel()}.`); if (state.route.name !== 'store') go('#store'); else render(); return; }
  if (action === 'clear-filters') { clearFilters(); return; }
  if (action === 'ai-filter') { const input = document.querySelector('.ai-query input'); state.search = input?.value || ''; render(); return; }
  if (action === 'save-zip') { setToast('Delivery estimate saved for this session.'); return; }
  if (action === 'remove-cart') { const item = state.cart.find(row => row.id === target.dataset.id); state.cart = state.cart.filter(row => row.id !== target.dataset.id); persist(); if (state.mallToken && item) { await mallRequest(mallConfig.portalBase, `/cart/items/${encodeURIComponent(item.id)}`, { method: 'DELETE' }).catch(() => {}); } render(); return; }
  if (action === 'qty') { const item = state.cart.find(x => x.id === target.dataset.id); if (item) item.qty = Math.max(0, item.qty + Number(target.dataset.delta)); state.cart = state.cart.filter(x => x.qty > 0); persist(); if (state.mallToken && item && item.qty > 0) await mallRequest(mallConfig.portalBase, `/cart/items/${encodeURIComponent(item.id)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ quantity: item.qty }) }).catch(() => {}); render(); return; }
  if (action === 'apply-coupon') { setToast(state.mallToken ? '优惠码将在 F-Box 结算规则中校验；当前订单按商品美元售价创建。' : '请先登录 F-Box 账户，再选择可用优惠。'); return; }
  if (action === 'checkout') { if (!state.cart.length) { setToast('Your cart is empty.'); return; } state.modal = state.mallToken ? { type: 'checkout' } : { type: 'account', afterLogin: 'checkout' }; state.checkoutStep = state.mallToken ? 3 : 1; render(); return; }
  if (action === 'load-reviews') { state.reviewLimit = reviews.length; render(); return; }
  if (action === 'write-review') { state.modal = { type: 'review', id: state.route.name === 'product' ? state.route.id : '' }; render(); return; }
});

document.addEventListener('change', event => {
  const el = event.target;
  if (el.matches('[data-wheel-upload]')) { wheelVisualizerHandleFile(el.files?.[0]); return; }
  if (el.matches('[data-locale]')) {
    if (el.value === 'auto') {
      localStorage.removeItem('fbox-locale');
      state.localeMode = 'auto';
      state.locale = browserLocale() || 'en';
      render();
      detectLocaleByIp();
    } else {
      state.localeMode = 'manual';
      state.locale = localeOptions.some(([code]) => code === el.value) ? el.value : 'en';
      localStorage.setItem('fbox-locale', state.locale);
      render();
    }
    return;
  }
  if (el.matches('[data-field]')) { updateVehicle(el.dataset.field, el.value); return; }
  if (el.matches('[data-filter]')) {
    const key = el.dataset.filter;
    if (key === 'ai') state.search = el.value;
    else if (key === 'sort') state.sort = el.value;
    else if (key === 'saleOnly') state.filters.saleOnly = el.checked;
    else state.filters[key] = el.value;
    render();
  }
});
let wheelCropDrag = null;
document.addEventListener('pointerdown', event => {
  const stage = event.target.closest('[data-wheel-crop-stage]');
  if (!stage || !state.wheelVisualizer?.vehicleUrl) return;
  wheelCropDrag = { stage, startX: event.clientX, startY: event.clientY, x: Number(state.wheelVisualizer.crop.x), y: Number(state.wheelVisualizer.crop.y) };
  stage.classList.add('is-dragging');
  stage.setPointerCapture?.(event.pointerId);
});
document.addEventListener('pointermove', event => {
  if (!wheelCropDrag) return;
  const rect = wheelCropDrag.stage.getBoundingClientRect();
  const nextX = wheelCropDrag.x - ((event.clientX - wheelCropDrag.startX) / rect.width) * 100;
  const nextY = wheelCropDrag.y - ((event.clientY - wheelCropDrag.startY) / rect.height) * 100;
  state.wheelVisualizer.crop.x = Math.min(100, Math.max(0, Math.round(nextX)));
  state.wheelVisualizer.crop.y = Math.min(100, Math.max(0, Math.round(nextY)));
  wheelVisualizerUpdateCropPreview();
});
function endWheelCropDrag() {
  wheelCropDrag?.stage.classList.remove('is-dragging');
  wheelCropDrag = null;
}
document.addEventListener('pointerup', endWheelCropDrag);
document.addEventListener('pointercancel', endWheelCropDrag);
document.addEventListener('input', event => {
  const el = event.target;
  if (!el.matches('[data-wheel-crop]')) return;
  const key = el.dataset.wheelCrop;
  state.wheelVisualizer.crop[key] = Number(el.value);
  wheelVisualizerUpdateCropPreview();
});
document.addEventListener('dragover', event => {
  if (event.target.closest('[data-wheel-dropzone]')) event.preventDefault();
});
document.addEventListener('drop', event => {
  const zone = event.target.closest('[data-wheel-dropzone]');
  if (!zone) return;
  event.preventDefault();
  wheelVisualizerHandleFile(event.dataTransfer?.files?.[0]);
});
document.addEventListener('submit', async event => {
  event.preventDefault();
  const form = event.target;
  if (form.dataset.form === 'search') { state.search = new FormData(form).get('query') || ''; go('#store'); }
  if (form.dataset.form === 'site-chat') { await submitWebsiteChat(new FormData(form).get('message')); return; }
  if (form.dataset.form === 'wheel-inquiry') { await wheelVisualizerSubmitInquiry(Object.fromEntries(new FormData(form).entries())); return; }
  if (form.dataset.form === 'account') {
    const values = new FormData(form);
    try {
      if (form.dataset.mode === 'register') {
        const registered = await mallRegister(Object.fromEntries(values.entries()));
        const registerToken = `${registered?.tokenHead || 'Bearer '}${registered?.token || ''}`.trim();
        if (registerToken && registered?.token) {
          state.mallToken = registerToken;
          localStorage.setItem('fbox-mall-token', state.mallToken);
          state.account = registered?.data?.member || registered?.member || null;
          await syncMallCart();
          await syncMallWishlist();
          const next = state.modal?.afterLogin;
          state.modal = next === 'checkout' ? { type: 'checkout' } : next === 'orders' ? { type: 'orders' } : null;
          state.checkoutStep = next === 'checkout' ? 3 : state.checkoutStep;
          if (next === 'orders') await loadMemberOrders();
          setToast('Welcome to F-Box — your account is ready.');
        } else {
          state.modal = { type: 'account', mode: 'login' };
          setToast('账户已创建，请登录 F-Box。');
        }
        return;
      }
      const result = await mallLogin(values.get('username'), values.get('password'));
      state.mallToken = `${result?.tokenHead || 'Bearer '}${result?.token || ''}`.trim();
      if (state.mallToken) localStorage.setItem('fbox-mall-token', state.mallToken);
      state.account = result?.data?.member || result?.member || null;
      const next = state.modal?.afterLogin;
      await syncMallCart();
      await syncMallWishlist();
      state.modal = next === 'checkout' ? { type: 'checkout' } : next === 'orders' ? { type: 'orders' } : null;
      state.checkoutStep = next === 'checkout' ? 3 : state.checkoutStep;
      if (next === 'orders') await loadMemberOrders();
      setToast('Signed in through the F-Box account service.');
    } catch (error) {
      setToast(error?.message || 'F-Box account sign-in failed.');
    }
  }
  if (form.dataset.form === 'review') {
    const values = new FormData(form);
    if (!values.get('consent')) {
      setToast('Please confirm that this is your own experience before submitting.');
      return;
    }
    try {
      const reviewResponse = await fetch('/api/fbox-content/reviews', { method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify({ product_id: state.modal?.id || '', product_name: state.modal?.id ? product(state.modal.id).name : '', customer_name: values.get('customer_name'), customer_email: values.get('customer_email'), title: values.get('title'), body: values.get('body'), vehicle: values.get('vehicle'), rating: Math.min(5, Math.max(1, Number(values.get('rating') || 5))) }) });
      const reviewPayload = await reviewResponse.json().catch(() => ({}));
      if (!reviewResponse.ok) throw new Error(reviewPayload.detail || 'Review could not be submitted.');
      state.modal = null;
      setToast('Thanks — 评价已提交，等待 F-Box 审核后展示。');
    } catch (error) { setToast(error?.message || '评价提交失败，请稍后再试。'); }
  }
  if (form.dataset.form === 'checkout') {
    state.checkoutForm = Object.fromEntries(new FormData(form).entries());
    localStorage.setItem('fbox-checkout-form', JSON.stringify(state.checkoutForm));
    try {
      state.lastOrder = await createMallOrder(state.checkoutForm);
      state.checkoutStep = 4;
      state.cart = [];
      persist();
      render();
    } catch (error) {
      setToast(error?.message || '订单创建失败，请检查登录状态、地址和库存。');
    }
  }
});
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  if (state.wheelVisualizer?.resultViewer?.open) { state.wheelVisualizer.resultViewer = null; render(); return; }
  if (state.wheelVisualizer?.open) wheelVisualizerClose();
});
window.addEventListener('hashchange', () => { state.menuOpen = false; state.mobileNav = false; state.modal = null; state.reviewLimit = 3; render(); window.scrollTo({ top: 0, behavior: 'instant' }); trackPageView(); });
render();
void captureReturnedPayPalPayment();
detectLocaleByIp();
checkMallBackend();
loadMallCatalog();
loadFBoxContent();
void loadAccountInfo();
trackPageView();
