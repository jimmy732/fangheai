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

const products = [
  { id: 'fbox-axis-19', category: 'Wheels', brand: 'F-Box', name: 'Axis 19', meta: '19x9.5 +35 · 5x114.3', price: 270, oldPrice: 300, rating: 4.9, reviews: 48, finish: 'Satin Black', diameter: 19, image: '9025362311e9a376.jpg', badge: 'Hot', deal: 'Free delivery · Aug 19–21', material: 'Rotary Forged', color: 'Satin Black', part: 'FBX-AXI-1995-35', weight: '22.4 lb' },
  { id: 'fbox-velocity-18', category: 'Wheels', brand: 'F-Box', name: 'Velocity 18', meta: '18x8.5 +35 · 5x114.3', price: 230, oldPrice: 250, rating: 4.8, reviews: 34, finish: 'Bronze Machined', diameter: 18, image: '71118c6795a2a3a8.jpg', badge: 'Sale', deal: 'Save up to $86 with tires', material: 'Cast Aluminum', color: 'Bronze Machined', part: 'FBX-VEL-1885-35', weight: '20.8 lb' },
  { id: 'fbox-forge-20', category: 'Wheels', brand: 'F-Box', name: 'Forge 20', meta: '20x9 +35 · 5x114.3', price: 300, oldPrice: 340, rating: 4.7, reviews: 26, finish: 'Gloss Black', diameter: 20, image: 'a8d2e56e51bb2d69.jpg', badge: 'New', deal: 'In stock · Quick delivery', material: 'Rotary Forged', color: 'Gloss Black', part: 'FBX-FOR-2090-35', weight: '24.3 lb' },
  { id: 'fbox-drift-18', category: 'Wheels', brand: 'F-Box', name: 'Drift 18', meta: '18x9.5 +35 · 5x114.3', price: 216, oldPrice: 240, rating: 4.9, reviews: 31, finish: 'Matte Bronze', diameter: 18, image: 'a5816dd04dfd6ee0.jpg', badge: 'Sale', deal: 'Free mounting with tire package', material: 'Cast Aluminum', color: 'Matte Bronze', part: 'FBX-DRI-1895-35', weight: '21.2 lb' },
  { id: 'fbox-lumen-19', category: 'Wheels', brand: 'F-Box', name: 'Lumen 19', meta: '19x8.5 +35 · 5x112', price: 260, oldPrice: null, rating: 4.8, reviews: 19, finish: 'Machined Silver', diameter: 19, image: 'fb1db723061ad6df.jpg', badge: '', deal: 'Free delivery · Aug 19–21', material: 'Cast Aluminum', color: 'Machined Silver', part: 'FBX-LUM-1985-35', weight: '23.1 lb' },
  { id: 'fbox-track-17', category: 'Wheels', brand: 'F-Box', name: 'Track 17', meta: '17x8 +35 · 5x114.3', price: 198, oldPrice: null, rating: 4.6, reviews: 13, finish: 'Hyper Silver', diameter: 17, image: '0dccdbef8e429925.jpg', badge: '', deal: 'In stock · Quick delivery', material: 'Cast Aluminum', color: 'Hyper Silver', part: 'FBX-TRA-1780-35', weight: '18.6 lb' },
  { id: 'fbox-ceramic-pro', category: 'Calipers', brand: 'F-Box Braking', name: 'Ceramic Pro 6P', meta: '6 piston · front axle · 380 mm', price: 1240, oldPrice: 1390, rating: 4.9, reviews: 22, finish: 'Racing Red', diameter: 380, image: 'fe1a37ef746c28f0.jpg', badge: 'Sale', deal: 'Includes braided lines + hardware', material: 'Forged Aluminum', color: 'Racing Red', part: 'FBX-CP6-380-RD', weight: '11.8 lb' },
  { id: 'fbox-street-4p', category: 'Calipers', brand: 'F-Box Braking', name: 'Street 4P', meta: '4 piston · front axle · 330 mm', price: 880, oldPrice: null, rating: 4.8, reviews: 16, finish: 'Electric Blue', diameter: 330, image: 'f5effff1812a14eb.jpg', badge: 'New', deal: 'Ready to ship in 48 hours', material: 'Forged Aluminum', color: 'Electric Blue', part: 'FBX-ST4-330-BL', weight: '9.4 lb' },
  { id: 'fbox-slotted-380', category: 'Rotors', brand: 'F-Box Braking', name: 'Track Slotted 380', meta: '2-piece · slotted · 380 mm', price: 420, oldPrice: 480, rating: 4.7, reviews: 28, finish: 'Black Hat', diameter: 380, image: 'e78ac1cfdeae4727.jpg', badge: 'Sale', deal: 'Pair pricing available', material: 'Iron + Aluminum', color: 'Black Hat', part: 'FBX-TS380-2P', weight: '21.3 lb' },
  { id: 'fbox-drilled-330', category: 'Rotors', brand: 'F-Box Braking', name: 'Street Drilled 330', meta: '1-piece · drilled & slotted · 330 mm', price: 278, oldPrice: null, rating: 4.6, reviews: 18, finish: 'Geomet Coat', diameter: 330, image: '07576b43c0712d61.jpg', badge: '', deal: 'Free delivery · Aug 19–21', material: 'High Carbon Iron', color: 'Geomet Coat', part: 'FBX-SD330-1P', weight: '17.9 lb' },
  { id: 'fbox-race-pad', category: 'Brake Pads', brand: 'F-Box Braking', name: 'R-Compound Pads', meta: 'Low dust · high bite · front axle', price: 168, oldPrice: 190, rating: 4.9, reviews: 41, finish: 'Carbon Ceramic', diameter: 0, image: '746b0039a724a70a.jpg', badge: 'Sale', deal: 'Ships today · track-ready compound', material: 'Carbon Ceramic', color: 'Carbon Ceramic', part: 'FBX-RCP-FR', weight: '4.1 lb' },
  { id: 'fbox-quiet-pad', category: 'Brake Pads', brand: 'F-Box Braking', name: 'Quiet Street Pads', meta: 'Low noise · low dust · front axle', price: 118, oldPrice: null, rating: 4.8, reviews: 37, finish: 'Ceramic', diameter: 0, image: '333cd3b0b1906049.jpg', badge: '', deal: 'Includes shim kit + grease', material: 'Ceramic', color: 'Ceramic', part: 'FBX-QSP-FR', weight: '3.7 lb' }
];

const reviews = [
  { title: 'Love them', vehicle: '2020 INFINITI Q50 Sport', author: 'Dillon', date: '06-11-2026', body: 'I finally pulled the trigger on getting some wheels and tires and happy I did! They look good and at a good price as well. Big thanks to the F-Box fitment team.', helpful: 18 },
  { title: 'Awesome wheels', vehicle: '2024 Ford Mustang GT Premium', author: 'Don', date: '06-03-2026', body: 'The finish is exactly what I wanted and the fitment guide made ordering painless. They arrived packed well and the stance is perfect on stock suspension.', helpful: 12 },
  { title: 'Love em', vehicle: '2014 Mercedes-Benz CLA45 AMG 4Matic', author: 'Parker', date: '03-02-2026', body: 'Clean design, quick shipping, and no rubbing after dialing in the recommended offset. Would buy another set for the next build.', helpful: 9 },
  { title: 'Super easy to install', vehicle: '2018 Honda Accord Touring', author: 'E', date: '01-21-2026', body: 'Super easy to install and looks very nice! Customer service confirmed the brake clearance before I placed the order.', helpful: 7 }
];

const categories = [
  ['Wheels', 'The right spoke, width and offset.', 'spark'], ['Calipers', 'Big brake color and control.', 'bolt'], ['Rotors', 'Track-ready bite and cooling.', 'disc'], ['Brake Pads', 'Quiet street to race compounds.', 'shield'], ['Wheel & Tire Packages', 'Mount, balance and save.', 'truck'], ['Suspension', 'Drop it. Dial it. Drive it.', 'arrow']
];
const guideCards = [
  ['Honda Civic', '16–21 fitment guide', '99d02f206e944b98.png'], ['Subaru WRX', '15–21 fitment guide', 'f0cc2e2df3bbaaff.png'], ['Ford Mustang', '15–23 fitment guide', '36c013ea2f6eedb6.png'], ['Anovia fitment', 'Daily-driver offsets', 'a7dd472643daf9b4.jpg'], ['Track setups', 'Brake clearance basics', 'fe1a37ef746c28f0.jpg']
];

const company = {
  legalName: 'Fanghe Overseas Intelligent Technology Co., Ltd.',
  phone: '+86 14726178447',
  tel: '+8614726178447'
};

// The storefront stays usable without the mall services. In local development,
// local-fbox-server.mjs proxies these relative paths to mall-portal and mall-admin.
const mallConfig = {
  portalBase: '/api',
  adminBase: '/admin-api'
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
  cookie: localStorage.getItem('fbox-cookie') !== 'dismissed',
  modal: null,
  toast: '',
  search: '',
  vehicle: JSON.parse(localStorage.getItem('fbox-vehicle') || 'null'),
  filters: { category: 'All', saleOnly: false, finish: 'All', diameter: 'All', minPrice: '', maxPrice: '', minRating: '0' },
  sort: 'popular',
  wishlist: JSON.parse(localStorage.getItem('fbox-wishlist') || '[]'),
  cart: JSON.parse(localStorage.getItem('fbox-cart') || '[]'),
  productImage: {},
  reviewLimit: 3,
  checkoutStep: 1,
  locale: initialLocale(),
  localeMode: localStorage.getItem('fbox-locale') ? 'manual' : 'auto',
  localeCountry: '',
  mallToken: localStorage.getItem('fbox-mall-token') || '',
  backend: { portal: 'testing', admin: 'testing', checked: false, checking: false },
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
function money(value) { return `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; }
function stars(rating) { return `<span class="stars" aria-label="${rating} out of 5">★★★★★</span>`; }
function product(id) { return products.find(item => item.id === id) || products[0]; }
function persist() { localStorage.setItem('fbox-cart', JSON.stringify(state.cart)); localStorage.setItem('fbox-wishlist', JSON.stringify(state.wishlist)); if (state.vehicle) localStorage.setItem('fbox-vehicle', JSON.stringify(state.vehicle)); }
function setToast(message) { state.toast = message; render(); window.clearTimeout(setToast.timer); setToast.timer = window.setTimeout(() => { state.toast = ''; render(); }, 2800); }
function go(hash) { state.modal = null; location.hash = hash; }
function cartCount() { return state.cart.reduce((sum, item) => sum + item.qty, 0); }
function cartTotal() { return state.cart.reduce((sum, item) => sum + item.qty * product(item.id).price, 0); }
function currentVehicleLabel() { return state.vehicle ? [state.vehicle.year, state.vehicle.make, state.vehicle.model, state.vehicle.trim].filter(Boolean).join(' ') : 'Select your vehicle'; }

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
  mode: 'local-preview'
});
state.wheelVisualizer = wheelVisualizerDefaults();

function wheelVisualizerState(productId = '', referenceImage = '') {
  const item = product(productId);
  return { ...wheelVisualizerDefaults(), open: true, productId, referenceImage: referenceImage || state.productImage[productId] || item.image };
}
function wheelVisualizerItem() {
  return product(state.wheelVisualizer?.productId || state.route.id);
}
function wheelVisualizerLocalHost() {
  return ['localhost', '127.0.0.1', '::1'].includes(location.hostname);
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
  if (!file.type.startsWith('image/')) {
    state.wheelVisualizer.error = 'Please choose a JPG, PNG, WEBP or HEIC image.';
    state.wheelVisualizer.phase = 'error';
    render();
    return;
  }
  if (file.size > 12 * 1024 * 1024) {
    state.wheelVisualizer.error = 'This image is larger than 12 MB. Please choose a smaller photo.';
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
function wheelVisualizerLocalJob(request) {
  return new Promise(resolve => {
    window.setTimeout(() => {
      const productRef = request.product;
      const referenceImage = request.referenceImage || productRef.image;
      resolve({
        jobId: `local-wheel-${Date.now()}`,
        status: 'succeeded',
        mode: 'local-preview',
        results: [
          { id: 'front-left', angle: 'front_left', imageUrl: request.vehicleUrl, wheelImage: ASSET + referenceImage },
          { id: 'front-right', angle: 'front_right', imageUrl: request.vehicleUrl, wheelImage: ASSET + referenceImage },
          { id: 'side-profile', angle: 'side_profile', imageUrl: request.vehicleUrl, wheelImage: ASSET + referenceImage }
        ]
      });
    }, 1650);
  });
}
async function wheelVisualizerRemoteJob(request) {
  const toDataUrl = blob => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('The selected image could not be prepared.'));
    reader.readAsDataURL(blob);
  });
  const vehicleImage = await toDataUrl(request.file);
  const productResponse = await fetch(`${ASSET}${request.referenceImage || request.product.image}`);
  if (!productResponse.ok) throw new Error('The selected wheel reference could not be loaded.');
  const productImage = await toDataUrl(await productResponse.blob());
  const body = {
    vehicle_image: vehicleImage,
    product_image: productImage,
    product_id: request.product.id,
    product_name: request.product.name,
    product_finish: request.product.finish,
    product_fitment: request.product.meta,
    crop: request.crop,
    angles: 3
  };
  const response = await fetch('/api/wheel-visualizer/jobs', { method: 'POST', body: JSON.stringify(body), headers: { Accept: 'application/json', 'Content-Type': 'application/json' } });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) { const error = new Error(payload.message || 'The visual preview service is unavailable.'); error.status = response.status; throw error; }
  return payload.data || payload;
}
async function createWheelVisualizerJob() {
  const current = state.wheelVisualizer;
  const item = wheelVisualizerItem();
  const request = { file: current.vehicleFile, vehicleUrl: current.vehicleUrl, crop: current.crop, referenceImage: current.referenceImage || item.image, product: item };
  if (window.FBOX_WHEEL_VISUALIZER_API?.create) return window.FBOX_WHEEL_VISUALIZER_API.create(request);
  if (wheelVisualizerLocalHost()) {
    try { return await wheelVisualizerRemoteJob(request); }
    catch (error) {
      const message = String(error?.message || '');
      const localServiceUnavailable = /ECONNREFUSED|failed to fetch|network|service unavailable/i.test(message);
      if (error?.status === 404 || error?.status === 405 || error?.status >= 500 || error?.name === 'TypeError' || localServiceUnavailable) return wheelVisualizerLocalJob(request);
      throw error;
    }
  }
  return wheelVisualizerRemoteJob(request);
}
async function wheelVisualizerStart() {
  const current = state.wheelVisualizer;
  if (!current?.vehicleFile) return;
  current.phase = 'generating';
  current.error = '';
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
    current.mode = result?.mode || 'boxclaw';
    if (current.results.length !== 3) throw new Error('The preview service returned fewer than 3 angles.');
    current.phase = 'results';
    render();
  } catch (error) {
    current.phase = 'error';
    current.error = error?.message || 'We could not generate the visual preview.';
    render();
  }
}
async function wheelVisualizerPoll(jobId) {
  if (!jobId) throw new Error('The preview job did not return an id.');
  for (let attempt = 0; attempt < 45; attempt += 1) {
    await new Promise(resolve => window.setTimeout(resolve, 1200));
    const response = await fetch(`/api/wheel-visualizer/jobs/${encodeURIComponent(jobId)}`, { headers: { Accept: 'application/json' } });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.message || 'The preview job could not be checked.');
    const result = payload.data || payload;
    if (result.status === 'failed') throw new Error(result.message || 'The preview job failed.');
    if (result.status === 'canceled') throw new Error('The preview job was canceled.');
    if (result.status === 'succeeded' || result.status === 'completed') {
      const current = state.wheelVisualizer;
      current.results = (result.results || []).slice(0, 3);
      current.mode = result.mode || 'boxclaw';
      if (current.results.length !== 3) throw new Error('The preview service returned fewer than 3 angles.');
      current.phase = 'results';
      render();
      return;
    }
  }
  throw new Error('The preview is taking longer than expected. Please try again.');
}

async function mallRequest(base, endpoint, options = {}) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), options.timeout || 5000);
  const headers = { Accept: 'application/json', ...(options.headers || {}) };
  if (state.mallToken) headers.Authorization = `Bearer ${state.mallToken}`;
  try {
    const response = await fetch(`${base}${endpoint}`, { ...options, headers, signal: controller.signal });
    const text = await response.text();
    let payload = null;
    try { payload = text ? JSON.parse(text) : null; } catch { payload = text; }
    if (!response.ok) throw new Error(`mall request failed: ${response.status}`);
    if (payload && typeof payload === 'object' && payload.code !== undefined && payload.code !== 200) {
      throw new Error(payload.message || 'mall request failed');
    }
    return payload?.data ?? payload;
  } finally {
    window.clearTimeout(timeout);
  }
}

function mallStatusLabel(status) {
  if (status === 'connected') return 'Connected';
  if (status === 'checking') return 'Checking';
  return 'Testing';
}
function mallStatusChip(kind = 'portal') {
  const status = state.backend[kind] || 'testing';
  return `<span class="integration-chip ${status === 'connected' ? 'is-live' : 'is-testing'}"><i></i>Mall ${kind === 'portal' ? 'portal' : 'admin'} · ${mallStatusLabel(status)}</span>`;
}
async function checkMallBackend() {
  if (state.backend.checking) return;
  state.backend.checking = true;
  state.backend.portal = 'checking';
  state.backend.admin = 'checking';
  render();
  const [portal, admin] = await Promise.allSettled([
    mallRequest(mallConfig.portalBase, '/home/content'),
    fetch(`${mallConfig.adminBase}/swagger-ui.html`, { method: 'GET', signal: AbortSignal.timeout(5000) })
  ]);
  state.backend.portal = portal.status === 'fulfilled' ? 'connected' : 'testing';
  state.backend.admin = admin.status === 'fulfilled' && admin.value.ok ? 'connected' : 'testing';
  state.backend.checked = true;
  state.backend.checking = false;
  render();
}
async function mallLogin(username, password) {
  const body = new URLSearchParams({ username, password });
  return mallRequest(mallConfig.portalBase, '/sso/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  });
}

function decorateIntegrationState() {
  const headerActions = document.querySelector(".header-actions");
  if (headerActions && !headerActions.querySelector(".mall-status")) {
    headerActions.insertAdjacentHTML("afterbegin", `<div class="mall-status" title="Local macrozheng/mall integration">${mallStatusChip("portal")}</div>`);
  }
  const storeHero = document.querySelector(".store-hero .container");
  if (storeHero && !storeHero.querySelector(".integration-strip")) {
    storeHero.insertAdjacentHTML("beforeend", `<div class="integration-strip"><div><strong>F-Box catalog stays active</strong><span>Existing wheels and brake-part interactions are preserved.</span></div><div class="integration-chips">${mallStatusChip("portal")}${mallStatusChip("admin")}<span class="integration-chip is-testing"><i></i>Real checkout · Testing</span></div></div>`);
  }
  const accountForm = document.querySelector("[data-form=account]");
  if (accountForm && !accountForm.previousElementSibling?.classList.contains("integration-note")) {
    accountForm.insertAdjacentHTML("beforebegin", `<div class="integration-note">${mallStatusChip("portal")}<span>Account login uses mall-portal when the local service is available. New account registration remains Testing.</span></div>`);
  }
  const checkoutForm = document.querySelector("[data-form=checkout]");
  if (checkoutForm && !checkoutForm.previousElementSibling?.classList.contains("integration-note")) {
    checkoutForm.insertAdjacentHTML("beforebegin", `<div class="integration-note">${mallStatusChip("portal")}<span>Order generation and payment remain Testing until F-Box products, shipping rules and a payment provider are configured in mall.</span></div>`);
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
        <button class="header-action" data-action="account">${icons.user}<span>My Account</span></button>
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
  </header>
  ${state.menuOpen ? megaMenu() : ''}`;
}
function megaMenu() {
  const groups = [['Shop by product', ['Wheels', 'Calipers', 'Rotors', 'Brake Pads', 'Wheel & Tire Packages']], ['Fitment tools', ['Shop by vehicle', 'Fitment guide', 'Brake clearance', 'Search gallery', 'Wheel offset guide']], ['Build essentials', ['Suspension', 'Wheel accessories', 'Lug nuts', 'Spacers & adapters', 'Car care']], ['F-Box service', ['Today’s deals', 'Financing', 'Track my order', 'Wholesale program', 'Fitment support']]];
  return `<div class="mega-menu"><div class="container mega-grid">${groups.map(([title, links]) => `<div class="mega-col"><h3>${title}</h3>${links.map(link => `<a href="#store" data-category-link="${esc(link.includes('Wheels') ? 'Wheels' : link.includes('Calipers') ? 'Calipers' : link.includes('Rotors') ? 'Rotors' : link.includes('Pads') ? 'Brake Pads' : 'All')}">${link}</a>`).join('')}</div>`).join('')}</div></div>`;
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
  return `<button class="fitment-product spotlight-card" data-action="quick-view" data-id="${item.id}"><span class="fitment-product-image"><img src="${ASSET + item.image}" alt="${esc(item.name)}"></span><span class="fitment-product-copy"><small>${item.category}</small><strong>${item.name}</strong><span>${money(item.price)} <em>· ${item.reviews} reviews</em></span></span></button>`;
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
  <section class="section" id="gallery"><div class="container"><div class="section-heading"><div><p class="eyebrow">Real builds, real context</p><h2>See the stance before you commit.</h2></div><p>Use the existing F-Box gallery and fitment guides to compare car, wheel and clearance direction. Every card still routes to the same catalog flow.</p></div><div class="guide-grid">${guideCards.map(([name, caption, image], i) => `<a class="guide-card spotlight-card reveal delay-${i % 4}" href="#store"><img src="${ASSET + image}" alt="${esc(name)} fitment guide" loading="lazy"><div class="guide-label"><small>${caption}</small><strong>${name}</strong></div></a>`).join('')}</div></div></section>
  <section class="section custom-ready-section" id="brands"><div class="container"><div class="custom-ready-head"><div><p class="eyebrow">For buyers who want it now</p><h2>Start with a proven design.<br><span>Make it yours.</span></h2></div><div><p>These ready-to-buy F-Box wheels stay in the catalog exactly as before. Use them as a starting point, or ask us to take the fitment and finish further.</p><a class="btn btn-dark" href="#store" data-category-link="Wheels">Browse finished wheels</a></div></div><div class="product-grid">${products.filter(p => p.category === 'Wheels').slice(0, 4).map(renderProductCard).join('')}</div></div></section>
  <section class="section-tight"><div class="container"><div class="brand-feature"><div><p class="eyebrow" style="color:var(--lime)">F-Box brake lab</p><h2>Make the <span>stop</span> part of the build.</h2><p>From quiet street pads to six-piston ceramic kits, every braking product is presented with clearance, heat and daily-use context.</p><a class="btn btn-primary" href="#store" data-category-link="Calipers">Explore braking</a></div><div class="brand-carousel">${[['a7dd472643daf9b4.jpg', 'Ceramic Pro'], ['fe1a37ef746c28f0.jpg', 'Street 4P'], ['e78ac1cfdeae4727.jpg', 'Track Slotted'], ['f5effff1812a14eb.jpg', 'Street Blue']].map(([image, label]) => `<div class="brand-item"><img src="${ASSET + image}" alt="${label}" loading="lazy"><span>${label}</span></div>`).join('')}</div></div></div></section>
  <section class="section" id="resources"><div class="container"><div class="section-heading"><div><p class="eyebrow">Proof from the community</p><h2>Built by people who drive them.</h2></div><p>4.9/5 from F-Box customers across daily builds, weekend cars and track setups.</p></div><div class="reviews-layout"><div class="review-score"><strong>4.9</strong>${stars(4.9)}<p>from 16,494 verified reviews</p><div class="review-bars"><div class="review-bar"><span>5★</span><i class="bar-track"><i style="width:94%"></i></i><span>94%</span></div><div class="review-bar"><span>4★</span><i class="bar-track"><i style="width:5%"></i></i><span>5%</span></div><div class="review-bar"><span>3★</span><i class="bar-track"><i style="width:1%"></i></i><span>1%</span></div></div></div><div class="review-list">${reviews.slice(0, 2).map((review, i) => renderReview(review, i)).join('')}</div></div></div></section>`;
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
  if (state.sort === 'price-low') list.sort((a, b) => a.price - b.price);
  if (state.sort === 'price-high') list.sort((a, b) => b.price - a.price);
  if (state.sort === 'rating') list.sort((a, b) => b.rating - a.rating);
  return list;
}
function renderProductCard(item) {
  const saved = state.wishlist.includes(item.id);
  return `<article class="product-card spotlight-card reveal"><div class="product-media">${item.badge ? `<span class="product-badge ${item.badge === 'Sale' ? 'alt' : ''}">${item.badge}</span>` : ''}<div class="product-actions"><button class="icon-btn ${saved ? 'is-saved' : ''}" data-action="wishlist" data-id="${item.id}" aria-label="Save product">${icons.heart}</button><button class="icon-btn" data-action="quick-view" data-id="${item.id}" aria-label="Quick view">${icons.eye}</button></div><img src="${ASSET + item.image}" alt="${esc(item.name)} ${esc(item.finish)}" loading="lazy"></div><div class="product-body"><div class="product-brand">${item.brand}</div><h3 class="product-title">${item.name}</h3><div class="product-meta">${item.meta}</div><div class="rating-row">${stars(item.rating)} <a href="#product/${item.id}">${item.rating} · ${item.reviews} reviews</a></div><div class="product-deal">${item.deal}</div><div class="price-row"><div><span class="price">${money(item.price)} <small>/ ea</small></span>${item.oldPrice ? `<span class="was-price">${money(item.oldPrice)}</span>` : ''}</div><span class="muted" style="font-size:10px">${item.category}</span></div><div class="product-cta"><a class="btn btn-outline btn-small" href="#product/${item.id}">Details</a><button class="btn btn-primary btn-small" data-action="add" data-id="${item.id}">Add</button></div></div></article>`;
}

function storePage() {
  const list = filterProducts();
  const fitmentBanner = state.vehicle?.trim ? `<div class="fitment-match-banner"><div><p class="eyebrow">Fitment context</p><strong>${esc(currentVehicleLabel())}</strong><span>Products below are shown with the selected vehicle context.</span></div><button class="btn btn-outline btn-small" data-action="change-vehicle">Change vehicle</button></div>` : '';
  return `<section class="store-hero"><div class="container"><div class="breadcrumbs"><a href="#home">Home</a><span>/</span><span>${state.filters.category === 'All' ? 'Performance parts' : state.filters.category}</span></div><h1>${state.filters.category === 'All' ? 'All performance parts' : state.filters.category}</h1><p class="muted">Fitment-first shopping for wheels, calipers, rotors and pads. Pick your car to see the parts that actually clear.</p></div></section>
  <main class="container store-layout"><aside class="filter-rail"><div class="filter-head"><strong>Filter with F-Box AI</strong><span>Describe the look or setup you want. We will narrow the catalog.</span></div><div class="filter-section"><input class="filter-input" data-filter="ai" placeholder="e.g. bronze wheels for 2020 Civic" value="${esc(state.search)}"><p class="filter-help">Try “track pads”, “19 inch black wheels”, or a car model.</p></div><div class="filter-section"><h3>Delivery estimate</h3><div class="filter-stack"><input class="filter-input" data-filter="zip" placeholder="Deliver to ZIP / postcode"><button class="btn btn-outline btn-small" data-action="save-zip">Save location</button></div></div><div class="filter-section"><h3>Search by vehicle</h3>${vehicleSelector('store')}<button class="btn btn-dark btn-small filter-apply" data-action="shop-vehicle">Apply vehicle</button></div><div class="filter-section"><h3>Product type</h3><select class="filter-select" data-filter="category">${selectOptions(['All', 'Wheels', 'Calipers', 'Rotors', 'Brake Pads'], state.filters.category, 'All parts')}</select></div><div class="filter-section"><h3>Fitment preferences</h3><label class="check-row"><input type="checkbox" data-filter="saleOnly" ${state.filters.saleOnly ? 'checked' : ''}> In-stock deals only</label><select class="filter-select" data-filter="finish">${selectOptions(['All', 'Satin Black', 'Bronze Machined', 'Gloss Black', 'Matte Bronze', 'Racing Red', 'Electric Blue', 'Black Hat', 'Ceramic'], state.filters.finish, 'All finishes')}</select></div><div class="filter-section"><h3>Wheel diameter <span>inches</span></h3><select class="filter-select" data-filter="diameter">${selectOptions(['All', '17', '18', '19', '20'], state.filters.diameter, 'Any diameter')}</select></div><div class="filter-section"><h3>Price range</h3><div class="filter-row"><input class="filter-input" data-filter="minPrice" placeholder="Min" value="${esc(state.filters.minPrice)}"><input class="filter-input" data-filter="maxPrice" placeholder="Max" value="${esc(state.filters.maxPrice)}"></div></div><div class="filter-section"><h3>Customer rating</h3><select class="filter-select" data-filter="minRating">${selectOptions(['0', '4', '4.5', '4.8'], state.filters.minRating, 'Any rating')}</select></div></aside><section class="store-main"><div class="ai-query"><span style="color:var(--lavender)">${icons.spark}</span><input data-filter="ai" placeholder="F-Box AI: Search by vehicle, product, finish or use case" value="${esc(state.search)}"><button class="btn btn-primary btn-small" data-action="ai-filter">Search</button></div>${fitmentBanner}<div class="store-toolbar"><div class="result-count">${list.length} results <span>${state.vehicle ? `· fits ${esc(currentVehicleLabel())}` : ''}</span></div><div class="toolbar-actions"><button class="btn btn-outline btn-small" data-action="clear-filters">Clear filters</button><select class="toolbar-select" data-filter="sort"><option value="popular" ${state.sort === 'popular' ? 'selected' : ''}>Sort by popular</option><option value="price-low" ${state.sort === 'price-low' ? 'selected' : ''}>Price: low to high</option><option value="price-high" ${state.sort === 'price-high' ? 'selected' : ''}>Price: high to low</option><option value="rating" ${state.sort === 'rating' ? 'selected' : ''}>Highest rated</option></select></div></div>${list.length ? `<div class="product-grid">${list.map(renderProductCard).join('')}</div>` : `<div class="empty-state"><h2>No exact matches yet.</h2><p>Try clearing one filter or tell F-Box what you want in the AI search.</p><button class="btn btn-primary" data-action="clear-filters">Reset catalog</button></div>`}</section></main>`;
}

function renderReview(review, index) { return `<article class="review-item" style="animation-delay:${index * 80}ms"><div class="review-head"><div><strong>${esc(review.title)}</strong><div>${stars(5)}</div></div><small>${review.date}</small></div><p>${esc(review.body)}</p><div class="review-meta"><span>✓ Verified purchase</span><span>${esc(review.vehicle)}</span><span>${review.helpful} found this helpful</span></div></article>`; }
function wheelVisualizerTrigger(item) {
  if (item.category !== 'Wheels') return '';
  const referenceImage = state.productImage[item.id] || item.image;
  return `<section class="wheel-visualizer-entry" aria-labelledby="wheel-visualizer-title"><div class="wheel-visualizer-entry-copy"><div class="wheel-visualizer-eyebrow"><span>${icons.spark}</span> See it on your car</div><h2 id="wheel-visualizer-title">Preview this wheel<br><em>before you commit.</em></h2><p>Upload one clear photo of your car and F-Box will prepare three angles with this exact wheel, finish and fitment as the reference.</p><div class="wheel-visualizer-entry-proof"><span>3 angles</span><span>Fitment-led</span><span>Selected gallery angle</span></div></div><button class="btn btn-primary wheel-visualizer-open" data-action="wheel-open" data-id="${item.id}" data-image="${esc(referenceImage)}"><span>Upload car photo</span><span aria-hidden="true">↗</span></button></section>`;
}
function wireWheelVisualizerEntry() {
  if (state.route.name !== 'product') return;
  const item = product(state.route.id);
  const form = document.querySelector('.detail-form');
  if (item.category === 'Wheels' && form && !document.querySelector('.wheel-visualizer-entry')) form.insertAdjacentHTML('beforebegin', wheelVisualizerTrigger(item));
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
  return `<section class="cart-page"><div class="container"><div class="breadcrumbs"><a href="#home">Home</a><span>/</span><span>Shopping cart</span></div><div class="section-heading"><div><p class="eyebrow">Your saved build</p><h1 class="detail-title">Shopping cart</h1></div><a class="btn btn-outline" href="#store">Continue shopping</a></div>${state.cart.length ? `<div class="cart-layout"><div class="cart-list">${state.cart.map(item => { const p = product(item.id); return `<div class="cart-item"><img src="${ASSET + p.image}" alt="${esc(p.name)}"><div><h3>${p.name}</h3><p>${p.category} · ${p.meta}</p><button class="btn btn-outline btn-small" data-action="remove-cart" data-id="${p.id}" style="margin-top:10px">Remove</button></div><div class="qty-control"><button data-action="qty" data-id="${p.id}" data-delta="-1">−</button><span>${item.qty}</span><button data-action="qty" data-id="${p.id}" data-delta="1">+</button></div><div class="cart-price">${money(p.price * item.qty)}</div></div>`; }).join('')}</div><aside class="summary-card"><h2>Order summary</h2><div class="summary-row"><span>Parts subtotal</span><strong>${money(total)}</strong></div><div class="summary-row"><span>Estimated delivery</span><strong>Calculated at checkout</strong></div><div class="summary-row"><span>Fitment review</span><strong style="color:var(--success)">Included</strong></div><div class="coupon"><input class="text-input" placeholder="Promo code"><button class="btn btn-outline btn-small" data-action="apply-coupon">Apply</button></div><div class="summary-row total"><span>Total</span><strong>${money(total)}</strong></div><button class="btn btn-primary" data-action="checkout" style="width:100%;margin-top:12px">Continue to checkout</button><p class="filter-help">This demo checkout does not collect real payment. Connect your preferred provider before launch.</p></aside></div>` : `<div class="empty-cart"><h2>Your cart is ready for a build.</h2><p class="muted">Add wheels, calipers, rotors or pads and we will keep the fitment context attached.</p><a class="btn btn-primary" href="#store">Start shopping</a></div>`}</div></section>`;
}

function wheelVisualizerResultCard(result, index, item, mode) {
  const angle = wheelVisualizerAngleLabel(result.angle);
  const imageUrl = result.imageUrl || result.image_url || result.url || '';
  if (mode === 'local-preview') {
    const position = ['left', 'right', 'center'][index] || 'center';
    return `<article class="wheel-result-card"><div class="wheel-result-media wheel-result-local"><img class="wheel-result-car" src="${esc(imageUrl)}" alt="Uploaded vehicle preview — ${esc(angle)}" style="${wheelVisualizerCropStyle(state.wheelVisualizer.crop)}"><div class="wheel-result-overlay wheel-result-overlay-${position}"><img src="${esc(result.wheelImage || ASSET + item.image)}" alt="${esc(item.name)} wheel reference"></div><span class="wheel-result-mode">Local layout preview</span></div><div class="wheel-result-copy"><strong>${esc(angle)}</strong><span>Reference placement for ${esc(item.name)}</span></div></article>`;
  }
  return `<article class="wheel-result-card"><div class="wheel-result-media"><img class="wheel-result-output" src="${esc(imageUrl)}" alt="${esc(item.name)} on your vehicle — ${esc(angle)}" loading="lazy"><span class="wheel-result-mode">BoxClaw visual preview</span></div><div class="wheel-result-copy"><strong>${esc(angle)}</strong><span>Wheel, finish and fitment held as reference</span></div></article>`;
}
function wheelVisualizerReferencePicker(item, current) {
  const images = [...new Set([item.image, 'a7dd472643daf9b4.jpg', 'ff2a26733252a2c8.jpg'])];
  const selected = current.referenceImage || item.image;
  return `<section class="wheel-reference-switcher" aria-label="Wheel reference"><div class="wheel-reference-copy"><div class="wheel-content-kicker">Wheel reference</div><strong>Choose the gallery image to use.</strong><span>Replace the reference before generating or regenerate with another angle.</span></div><div class="wheel-reference-options">${images.map((image, index) => `<button class="wheel-reference-option ${selected === image ? 'is-active' : ''}" data-action="wheel-reference" data-image="${esc(image)}" aria-label="Use wheel gallery image ${index + 1}" ${current.phase === 'generating' ? 'disabled' : ''}><img src="${ASSET + image}" alt="${esc(item.name)} gallery reference ${index + 1}"><span>${String(index + 1).padStart(2, '0')}</span></button>`).join('')}</div></section>`;
}
function wheelVisualizerModalLegacy() {
  const current = state.wheelVisualizer;
  if (!current?.open) return '';
  const item = wheelVisualizerItem();
  const phase = current.phase;
  const steps = [['upload', '01', 'Upload'], ['crop', '02', 'Frame'], ['reference', '03', 'Reference'], ['generating', '04', 'Generate'], ['results', '05', 'Results']];
  const stepIndex = phase === 'error' ? 3 : Math.max(0, steps.findIndex(([key]) => key === phase));
  const stepRail = steps.map(([key, number, label], index) => `<div class="wheel-step ${index === stepIndex ? 'is-active' : ''} ${index < stepIndex ? 'is-done' : ''}"><span>${index < stepIndex ? '✓' : number}</span><strong>${label}</strong></div>`).join('');
  let content = '';
  if (phase === 'upload') content = `<div class="wheel-visualizer-content"><div class="wheel-content-kicker">Start with one real photo</div><h3>Show us the car.<br><em>We will show you the stance.</em></h3><p class="wheel-content-lead">Use a clear exterior photo with at least one wheel visible. A front three-quarter or side view gives the best fitment reference.</p><label class="wheel-upload-zone" data-wheel-dropzone><input type="file" accept="image/jpeg,image/png,image/webp,image/heic" data-wheel-upload><span class="wheel-upload-icon">＋</span><strong>Drop your car photo here</strong><span>JPG, PNG, WEBP or HEIC · Up to 12 MB</span><span class="btn btn-dark btn-small">Choose a photo</span></label><div class="wheel-visualizer-privacy"><span>${icons.shield}</span><span>Your image is used only to create this preview. No payment or credits are required.</span></div></div>`;
  if (phase === 'crop') content = `<div class="wheel-visualizer-content"><div class="wheel-content-kicker">Frame the reference</div><h3>Keep the whole car.<br><em>Adjust only if needed.</em></h3><p class="wheel-content-lead">Upload the photo as-is. The full image stays available, even when the car sits low in a portrait frame. Drag the image or use the controls below; a wheel only needs to be visible, not centered in a box.</p><div class="wheel-crop-stage" data-wheel-crop-stage><img data-wheel-crop-image src="${esc(current.vehicleUrl)}" alt="${esc(current.vehicleName || 'Uploaded vehicle photo')}" draggable="false" style="${wheelVisualizerCropStyle(current.crop)}"><div class="wheel-crop-guide"><span>Full photo retained · drag to frame</span></div></div><div class="wheel-crop-live-note"><strong>Live framing</strong><span>Changes update the image above.</span></div><div class="wheel-crop-controls"><label><span>Zoom</span><input type="range" min="1" max="1.6" step="0.01" value="${current.crop.zoom}" data-wheel-crop="zoom"><output data-wheel-crop-output="zoom">${Number(current.crop.zoom).toFixed(2)}×</output></label><label><span>Horizontal position</span><input type="range" min="0" max="100" step="1" value="${current.crop.x}" data-wheel-crop="x"><output data-wheel-crop-output="x">${current.crop.x}%</output></label><label><span>Vertical position</span><input type="range" min="0" max="100" step="1" value="${current.crop.y}" data-wheel-crop="y"><output data-wheel-crop-output="y">${current.crop.y}%</output></label></div><div class="wheel-crop-actions"><button class="btn btn-outline btn-small" data-action="wheel-crop-reset">Reset frame</button><button class="btn btn-primary" data-action="wheel-generate">Generate 3 angles <span aria-hidden="true">↗</span></button></div></div>`;
  if (phase === 'generating') content = `<div class="wheel-visualizer-content wheel-generating-content" aria-live="polite"><div class="wheel-generating-orbit"><div class="wheel-generating-wheel"><img src="${ASSET + (current.referenceImage || item.image)}" alt="${esc(item.name)}"></div><span></span><span></span><span></span></div><div class="wheel-content-kicker">F-Box visual studio</div><h3>Matching wheel to vehicle<br><em>and checking the stance.</em></h3><p class="wheel-content-lead">We are holding the wheel design, finish, proportions and vehicle perspective together while preparing three views.</p><div class="wheel-progress"><span></span></div><div class="wheel-generating-meta"><span>Fitment reference locked</span><span>3 angles requested</span><span>Officially included</span></div></div>`;
  if (phase === 'results') content = `<div class="wheel-visualizer-content wheel-results-content"><div class="wheel-results-head"><div><div class="wheel-content-kicker">Your preview set</div><h3>See the wheel<br><em>in its natural stance.</em></h3></div><div class="wheel-results-count"><strong>03</strong><span>angles</span></div></div><p class="wheel-content-lead">These views use ${esc(item.name)} in ${esc(item.finish)} as the wheel reference. Keep the final fitment check with the F-Box team before production.</p><div class="wheel-results-grid">${current.results.map((result, index) => wheelVisualizerResultCard(result, index, item, current.mode)).join('')}</div>${current.mode === 'local-preview' ? '<div class="wheel-local-note"><strong>Local preview mode</strong><span>BoxClaw is connected through the local adapter, but live image routing is not enabled on this environment. Configure the image route in BoxClaw Admin to replace this layout preview with real generated images.</span></div>' : ''}<div class="wheel-results-actions"><button class="btn btn-outline" data-action="wheel-reset">Try another photo</button><button class="btn btn-primary" data-action="wheel-close">Keep this wheel <span aria-hidden="true">↗</span></button></div></div>`;
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
    const content = `<div class="wheel-visualizer-content wheel-reference-content"><div class="wheel-content-kicker">Select the exact wheel reference</div><h3>Lock the wheel.<br><em>Then generate the match.</em></h3><p class="wheel-content-lead">The highlighted gallery image is sent as the authoritative wheel reference. Your vehicle photo stays unchanged; the selected wheel is applied to all three views.</p><div class="wheel-reference-lockup"><div class="wheel-reference-large"><img src="${ASSET + (current.referenceImage || item.image)}" alt="${esc(item.name)} selected wheel reference"></div><div><strong>${esc(item.name)}</strong><span>${esc(item.finish)} · ${esc(item.meta)}</span><small>Reference image locked for three angles</small></div></div><div class="wheel-reference-actions"><button class="btn btn-outline btn-small" data-action="wheel-reference-back">Back to framing</button><button class="btn btn-primary" data-action="wheel-generate">Generate 3 angles <span aria-hidden="true">↗</span></button></div></div>`;
    html = html.replace('</main></div></div></div>', `${content}</main></div></div></div>`);
  }
  return html;
}
function modal() {
  if (!state.modal) return '';
  if (state.modal.type === 'quick') { const item = product(state.modal.id); return `<div class="overlay" data-action="close-modal"><div class="modal" data-modal-content><button class="icon-btn modal-close" data-action="close-modal">${icons.close}</button><p class="eyebrow">Quick view</p><h2>${item.name}</h2><div class="quick-product"><img src="${ASSET + item.image}" alt="${esc(item.name)}"><div><div class="product-brand">${item.brand} · ${item.category}</div><div>${stars(item.rating)} <span class="muted">${item.reviews} reviews</span></div><p>${item.meta}<br>${item.deal}</p><strong style="font-size:22px">${money(item.price)} <small class="muted">/ each</small></strong><button class="btn btn-primary" data-action="add" data-id="${item.id}" style="width:100%;margin-top:15px">Add to cart</button></div></div></div></div>`; }
  if (state.modal.type === 'account') return `<div class="overlay" data-action="close-modal"><div class="modal" data-modal-content><button class="icon-btn modal-close" data-action="close-modal">${icons.close}</button><p class="eyebrow">F-Box account</p><h2>Save your build.</h2><p>Sign in to keep fitment notes, saved cars and order history together.</p><form class="modal-form" data-form="account"><input class="text-input" type="email" placeholder="Email address" required><input class="text-input" type="password" placeholder="Password" required><button class="btn btn-primary">Sign in</button><button class="btn btn-outline" type="button" data-action="close-modal">Create a new account</button></form></div></div>`;
  if (state.modal.type === 'review') return `<div class="overlay" data-action="close-modal"><div class="modal" data-modal-content><button class="icon-btn modal-close" data-action="close-modal">${icons.close}</button><p class="eyebrow">Your experience</p><h2>Write a review.</h2><form class="modal-form" data-form="review"><input class="text-input" name="title" placeholder="Review title" required><textarea class="text-input" name="body" rows="5" placeholder="What did you install? How does it fit?" required></textarea><input class="text-input" name="vehicle" placeholder="Your vehicle"><button class="btn btn-primary">Submit review</button></form></div></div>`;
  if (state.modal.type === 'checkout') return `<div class="overlay" data-action="close-modal"><div class="modal" data-modal-content><button class="icon-btn modal-close" data-action="close-modal">${icons.close}</button><p class="eyebrow">Secure checkout</p><h2>Finish your order.</h2><div class="checkout-steps">${['Customer', 'Shipping', 'Payment'].map((label, i) => `<div class="checkout-step ${state.checkoutStep === i + 1 ? 'is-active' : ''}">${i + 1}. ${label}</div>`).join('')}</div>${state.checkoutStep === 4 ? `<div class="success-box"><h3>Order request received.</h3><p>F-Box saved your build and will confirm final fitment and shipping by email.</p><button class="btn btn-dark" data-action="close-modal">Back to store</button></div>` : `<form class="modal-form" data-form="checkout"><input class="text-input" required placeholder="Full name"><input class="text-input" type="email" required placeholder="Email address">${state.checkoutStep >= 2 ? '<input class="text-input" required placeholder="Shipping address"><input class="text-input" required placeholder="City / State / Postcode">' : ''}${state.checkoutStep >= 3 ? '<input class="text-input" required placeholder="Card number (demo)"><div class="filter-row"><input class="text-input" required placeholder="MM / YY"><input class="text-input" required placeholder="CVC"></div>' : ''}<button class="btn btn-primary">${state.checkoutStep === 3 ? 'Place demo order' : 'Continue'}</button></form>`}</div></div>`;
  return '';
}
function chat() { return `<button class="chat-fab" data-action="chat" aria-label="Open chat">${icons.chat}</button>${state.chatOpen ? `<div class="chat-panel"><div class="chat-head"><div><strong>F-Box fitment help</strong><small>Usually replies in a few minutes</small></div><button class="icon-btn" data-action="chat">${icons.close}</button></div><div class="chat-body"><div class="chat-bubble">Hey — want help checking wheel clearance or choosing brake parts?</div><div class="chat-quick"><button data-action="chat-reply" data-message="Check my wheel fitment">Check wheel fitment</button><button data-action="chat-reply" data-message="Recommend brake pads">Recommend brake pads</button><button data-action="chat-reply" data-message="Where is my order?">Track my order</button></div></div></div>` : ''}`; }
function footer() { return `<footer class="footer"><div class="container"><div class="footer-top"><div><a class="brand" href="#home"><i class="brand-mark"></i><span>F-BOX</span></a><p class="footer-slogan">A fitment-first destination for the parts that make your car feel like yours.</p><div class="company-meta"><strong>${company.legalName}</strong><a href="tel:${company.tel}">${company.phone}</a></div></div><div class="footer-grid"><div class="footer-col"><h3>Shop</h3><a href="#store">Wheels</a><a href="#store">Calipers</a><a href="#store">Rotors</a><a href="#store">Brake pads</a></div><div class="footer-col"><h3>Tools</h3><a href="#home#fitment">Shop by vehicle</a><a href="#home#gallery">Fitment guides</a><a href="#home#resources">Reviews</a><a href="#store">Financing</a></div><div class="footer-col"><h3>Help</h3><a href="#home#resources">FAQs & policies</a><a href="#home#resources">Shipping & returns</a><a href="#home#resources">Warranty</a><a href="tel:${company.tel}">Contact us · ${company.phone}</a></div><div class="footer-col"><h3>Company</h3><a href="#home">About F-Box</a><a href="#home">Wholesale</a><a href="#home">Careers</a><a href="#cart">Track order</a></div></div></div><div class="footer-bottom"><span>© 2026 ${company.legalName} · F-Box Performance Parts</span><span>Terms · Privacy · CCPA</span></div></div></footer>`; }

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

function render() {
  state.route = getRoute();
  const page = state.route.name === 'home' ? customWheelHomePage() : state.route.name === 'store' ? storePage() : state.route.name === 'cart' ? cartPage() : productPage(product(state.route.id));
  document.querySelector('#app').innerHTML = `${header()}${page}${footer()}${chat()}${state.cookie ? '<div class="cookie-banner"><span>By using F-Box, you agree to our cookie policy and fitment analytics.</span><button data-action="dismiss-cookie">Dismiss</button></div>' : ''}${modal()}${wheelVisualizerModal()}${state.toast ? `<div class="toast">${esc(state.toast)}</div>` : ''}`;
  wireWheelVisualizerEntry();
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
function clearFilters() { state.search = ''; state.filters = { category: 'All', saleOnly: false, finish: 'All', diameter: 'All', minPrice: '', maxPrice: '', minRating: '0' }; state.sort = 'popular'; render(); }
function addToCart(id) { const existing = state.cart.find(item => item.id === id); if (existing) existing.qty += 1; else state.cart.push({ id, qty: 1 }); persist(); setToast(`${product(id).name} added to your cart.`); }

document.addEventListener('click', event => {
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
  if (target.dataset.categoryLink !== undefined) { state.filters.category = target.dataset.categoryLink || 'All'; state.menuOpen = false; go('#store'); return; }
  if (action === 'mega') { state.menuOpen = !state.menuOpen; render(); return; }
  if (action === 'mobile-nav') { state.mobileNav = !state.mobileNav; render(); return; }
  if (action === 'cart') { go('#cart'); return; }
  if (action === 'account') { state.modal = { type: 'account' }; render(); return; }
  if (action === 'dismiss-cookie') { state.cookie = false; localStorage.setItem('fbox-cookie', 'dismissed'); render(); return; }
  if (action === 'chat') { state.chatOpen = !state.chatOpen; render(); return; }
  if (action === 'chat-reply') { setToast(`${target.dataset.message} — a fitment expert will follow up.`); state.chatOpen = false; return; }
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
    current.mode = 'local-preview';
    if (current.phase === 'results' || current.phase === 'error') current.phase = current.vehicleFile ? 'reference' : 'upload';
    render();
    return;
  }
  if (action === 'wheel-reference-next') { if (state.wheelVisualizer.vehicleFile) { state.wheelVisualizer.phase = 'reference'; render(); } return; }
  if (action === 'wheel-reference-back') { if (state.wheelVisualizer.vehicleFile) { state.wheelVisualizer.phase = 'crop'; render(); } return; }
  if (action === 'wheel-close') { if (event.target.closest('[data-wheel-modal]') && !target.classList.contains('wheel-modal-close')) return; wheelVisualizerClose(); return; }
  if (action === 'wheel-generate') { if (state.wheelVisualizer.phase === 'reference') wheelVisualizerStart(); return; }
  if (action === 'wheel-reset') { wheelVisualizerReset('upload'); return; }
  if (action === 'wheel-retry') { if (state.wheelVisualizer.vehicleFile) { state.wheelVisualizer.phase = 'generating'; wheelVisualizerStart(); } else wheelVisualizerReset('upload'); return; }
  if (action === 'wheel-crop-reset') { state.wheelVisualizer.crop = { zoom: 1, x: 50, y: 50 }; render(); return; }
  if (action === 'quick-view') { state.modal = { type: 'quick', id: target.dataset.id }; render(); return; }
  if (action === 'close-modal') { if (event.target.closest('[data-modal-content]') && !target.classList.contains('modal-close')) return; state.modal = null; render(); return; }
  if (action === 'wishlist') { const id = target.dataset.id; state.wishlist = state.wishlist.includes(id) ? state.wishlist.filter(x => x !== id) : [...state.wishlist, id]; persist(); render(); return; }
  if (action === 'add') { addToCart(target.dataset.id); return; }
  if (action === 'buy-now') { addToCart(target.dataset.id); state.modal = { type: 'checkout' }; state.checkoutStep = 1; render(); return; }
  if (action === 'product-image') { state.productImage[target.dataset.id] = target.dataset.image; render(); return; }
  if (action === 'view-fitment-products') { state.search = ''; state.filters.category = 'All'; go('#store'); return; }
  if (action === 'change-vehicle') { state.vehicle = null; localStorage.removeItem('fbox-vehicle'); go('#home'); return; }
  if (action === 'shop-vehicle') { if (!state.vehicle?.trim) { setToast('Choose Year, Make, Model and Trim first.'); return; } setToast(`Fitment saved for ${currentVehicleLabel()}.`); if (state.route.name !== 'store') go('#store'); else render(); return; }
  if (action === 'clear-filters') { clearFilters(); return; }
  if (action === 'ai-filter') { const input = document.querySelector('.ai-query input'); state.search = input?.value || ''; render(); return; }
  if (action === 'save-zip') { setToast('Delivery estimate saved for this session.'); return; }
  if (action === 'remove-cart') { state.cart = state.cart.filter(item => item.id !== target.dataset.id); persist(); render(); return; }
  if (action === 'qty') { const item = state.cart.find(x => x.id === target.dataset.id); if (item) item.qty = Math.max(0, item.qty + Number(target.dataset.delta)); state.cart = state.cart.filter(x => x.qty > 0); persist(); render(); return; }
  if (action === 'apply-coupon') { setToast('Demo code accepted — connect your promotion engine before launch.'); return; }
  if (action === 'checkout') { state.modal = { type: 'checkout' }; state.checkoutStep = 1; render(); return; }
  if (action === 'load-reviews') { state.reviewLimit = reviews.length; render(); return; }
  if (action === 'write-review') { state.modal = { type: 'review' }; render(); return; }
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
  if (form.dataset.form === 'account') {
    const values = new FormData(form);
    try {
      const result = await mallLogin(values.get('username'), values.get('password'));
      state.mallToken = result?.token || '';
      if (state.mallToken) localStorage.setItem('fbox-mall-token', state.mallToken);
      state.modal = null;
      setToast('Signed in through the local mall portal.');
    } catch {
      state.modal = null;
      setToast('Demo sign-in complete. Mall account integration is Testing.');
    }
  }
  if (form.dataset.form === 'review') { state.modal = null; setToast('Thanks — your review is queued for moderation.'); }
  if (form.dataset.form === 'checkout') { if (state.checkoutStep < 3) state.checkoutStep += 1; else { state.checkoutStep = 4; state.cart = []; persist(); } render(); }
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && state.wheelVisualizer?.open) wheelVisualizerClose();
});
window.addEventListener('hashchange', () => { state.menuOpen = false; state.mobileNav = false; state.modal = null; state.reviewLimit = 3; render(); window.scrollTo({ top: 0, behavior: 'instant' }); });
render();
detectLocaleByIp();
checkMallBackend();
