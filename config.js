// ===== 密码解码函数 =====
function decodePassword(encoded) { return atob(encoded); }

// ===== 卡密认证 =====
const ADMIN_PASSWORD_ENC = "MTUwNDA4"; const ADMIN_PASSWORD = decodePassword(ADMIN_PASSWORD_ENC);
const CARD_KEYS_STORE = 'cardKeys'; const SESSION_KEY = 'authSession';
const CARD_SECRET_ENC = "WEs5bVAyd1E3dkw1"; const CARD_SECRET = decodePassword(CARD_SECRET_ENC);
function getCardKeys() { try { return JSON.parse(localStorage.getItem(CARD_KEYS_STORE) || '[]'); } catch (e) { return []; } }
function saveCardKeys(keys) { localStorage.setItem(CARD_KEYS_STORE, JSON.stringify(keys)); }
function getAuthSession() { try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null'); } catch (e) { return null; } }
function setAuthSession(session) { sessionStorage.setItem(SESSION_KEY, JSON.stringify(session)); }
function clearAuthSession() { sessionStorage.removeItem(SESSION_KEY); }
function generateSelfVerifyingCard(expireDays) { const now = Date.now(); const expireMs = expireDays * 86400000; const raw = `${now}-${expireMs}-${CARD_SECRET}`; let hash = 0; for (let i = 0; i < raw.length; i++) { hash = ((hash << 5) - hash) + raw.charCodeAt(i); hash |= 0; } hash = Math.abs(hash).toString(16).toUpperCase().padStart(4, '0'); return `${now.toString(36).toUpperCase()}-${expireMs.toString(36).toUpperCase()}-${hash}`; }
function verifySelfVerifyingCard(code) { const parts = code.split('-'); if (parts.length !== 3) return { valid: false, reason: '卡密格式错误' }; const payload = parts[0] + '-' + parts[1]; const providedHash = parts[2]; const now = Date.now(); let createTime, expireMs; try { createTime = parseInt(parts[0], 36); expireMs = parseInt(parts[1], 36); } catch (e) { return { valid: false, reason: '卡密无效' }; } if (isNaN(createTime) || isNaN(expireMs)) return { valid: false, reason: '卡密无效' }; if (now > createTime + expireMs) return { valid: false, reason: '卡密已过期' }; const raw = `${createTime}-${expireMs}-${CARD_SECRET}`; let hash = 0; for (let i = 0; i < raw.length; i++) { hash = ((hash << 5) - hash) + raw.charCodeAt(i); hash |= 0; } const computedHash = Math.abs(hash).toString(16).toUpperCase().padStart(4, '0'); if (computedHash !== providedHash) return { valid: false, reason: '卡密验证失败' }; const keys = getCardKeys(); const found = keys.find(k => k.code === code); if (found && found.status === 'disabled') return { valid: false, reason: '卡密已被禁用' }; if (!found) { keys.push({ code, status: 'active', createTime: new Date(createTime).toISOString(), expireDays: Math.ceil(expireMs / 86400000) }); saveCardKeys(keys); } return { valid: true, card: { code, status: 'active' } }; }
function checkCardAccess(code) { return verifySelfVerifyingCard(code); }
function isAdmin() { const session = getAuthSession(); return session && session.role === 'admin'; }
function checkCurrentAccess() { const session = getAuthSession(); if (!session) return false; if (session.role === 'admin') return true; if (session.role === 'card' && session.cardCode) { const result = verifySelfVerifyingCard(session.cardCode); if (!result.valid) { clearAuthSession(); return false; } return true; } return false; }

// ===== 数据库密码 =====
const PASSWORD_ENC = "ODkxMTA1"; const PASSWORD = decodePassword(PASSWORD_ENC);

// ===== 本年生肖切换密码 =====
const YEAR_ZODIAC_PASSWORD_ENC = "MTUwNDA4"; const YEAR_ZODIAC_PASSWORD = decodePassword(YEAR_ZODIAC_PASSWORD_ENC);

// ===== 数据库常量 =====
const DB_NAME = 'OrderDatabase', DB_VERSION = 7, STORE_NAME = 'orders', REPORT_STORE_NAME = 'report_orders', RECYCLE_STORE_NAME = 'recycle_bin', LOG_STORE_NAME = 'operation_log', COMBO_STORE_NAME = 'combo_orders';

// ===== 全局变量 =====
let db = null;
let dbAvailable = true;

// ===== 订单变量与基础函数 =====
let tableBetData = {}, userBetData = {}, reportBetData = {}, reportAmountData = {}, reportRiskData = {};
let numberCount = {}, zodiacCount = {}, numberAmountCount = {}, zodiacAmountCount = {};
let zodiacDirectAmount = {}, zodiacFilteredAmount = {};
let zodiacReportAmount = {}, zodiacFilteredReportAmount = {};
let numberOrderTotal = 0, zodiacWeightedTotal = 0;
let originalOrderAmount = {};
let directOrderAmount = {};
let directReportAmount = {};
// 订单计数（所有玩法）
let orderCountAll = 0;

// ===== 地区常量 =====
let currentRegion = localStorage.getItem('currentRegion') || 'macau';

// ===== 生肖顺序 =====
const zodiacOrder = ['马','蛇','龙','兔','虎','牛','鼠','猪','狗','鸡','猴','羊'];
let currentZodiacMap = {};

// ===== 颜色数组 =====
const redNumbers = ['01','02','07','08','12','13','18','19','23','24','29','30','34','35','40','45','46'];
const blueNumbers = ['03','04','09','10','14','15','20','25','26','31','36','37','41','42','47','48'];
const greenNumbers = ['05','06','11','16','17','21','22','27','28','32','33','38','39','43','44','49'];

// ===== 回收站保留天数 =====
const RECYCLE_RETENTION_DAYS = 30;

// ===== 最高z-index =====
let highestZ = 2000;

// ===== 分层缓存 =====
const statsCache = new Map();
function getCacheKey(region, date, filterUser) { return `${region}|${date}|${filterUser || 'all'}`; }
function clearStatsCache() { statsCache.clear(); }

// ===== 工具函数 =====
function getTodayCST() { const now = new Date(); const offset = 8*60; const localTime = now.getTime() + (now.getTimezoneOffset() + offset) * 60000; const cstDate = new Date(localTime); return `${cstDate.getFullYear()}-${String(cstDate.getMonth()+1).padStart(2,'0')}-${String(cstDate.getDate()).padStart(2,'0')}`; }
function buildZodiacMap(startZodiac) { const map = {}; const startIndex = zodiacOrder.indexOf(startZodiac); const idx = startIndex !== -1 ? startIndex : 0; for (let i=1; i<=49; i++) map[i.toString().padStart(2,'0')] = zodiacOrder[(idx+i-1)%12]; return map; }
function formatTimestampToCST(iso){ const d=new Date(iso); return new Intl.DateTimeFormat('zh-CN',{year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false,timeZone:'Asia/Shanghai'}).format(d); }
function getUserColor(u){ let h=0; for(let i=0;i<u.length;i++)h=u.charCodeAt(i)+((h<<5)-h); const hue=(h%360+360)%360; return`hsl(${hue},70%,45%)`; }

// ===== KW_LIST =====
const KW_LIST = ['每一注', '每组各', '每个数', '各数', '各组', '每组', '每数', '每号', '各号', '号各', '各码', '各注', '个号', '个数', '组各', '各下', '各买', '一注', '个组', '每个', '各', '组', '注', '名', '=', '＝', '下', '买', '个', '共', '每', '打', '投', '号', '各号码', '每个号', '每个号码', '个号码', '各号各', '个号各', '每号', '每号码'];

// ===== 赔率相关函数 =====
function getOddsData() { try { return JSON.parse(localStorage.getItem('comboOddsData') || '{}'); } catch(e) { return {}; } }
function saveOddsData() {
  const data = {};
  document.querySelectorAll('.odds-input[data-field="odds"]').forEach(inp => {
    const type = inp.dataset.type; if (!data[type]) data[type] = { odds: '', rebate: '4' }; data[type].odds = inp.value.trim();
  });
  document.querySelectorAll('.odds-input[data-field="rebate"]').forEach(inp => {
    const type = inp.dataset.type; if (!data[type]) data[type] = { odds: '', rebate: '4' }; data[type].rebate = inp.value.trim();
  });
  document.querySelectorAll('.odds-input[data-field="name"]').forEach(inp => {
    const type = inp.dataset.type; if (!data[type]) data[type] = { odds: '', rebate: '4' }; data[type].name = inp.value.trim();
  });
  localStorage.setItem('comboOddsData', JSON.stringify(data));
  document.querySelectorAll('.odds-input').forEach(inp => { inp.disabled = true; inp.style.border = 'none'; inp.style.background = 'transparent'; });
  showToast('赔率已保存'); if (document.getElementById('lianxiaoStatsWin')) refreshLianxiaoStats();
}
function getOddsForType(type, oddsData) {
  const defaults = {
    '特码':{odds:47,rebate:4},
    '特肖':{odds:11,rebate:4},
    '特肖本年肖':{odds:10,rebate:4},
    '平特肖':{odds:2,rebate:4},'平特肖带主肖':{odds:1.8,rebate:4},'二连肖':{odds:4,rebate:4},'二连肖带主肖':{odds:3.5,rebate:4},
    '三连肖':{odds:10,rebate:4},'三连肖带主肖':{odds:9,rebate:4},'四连肖':{odds:30,rebate:4},'四连肖带主肖':{odds:25,rebate:4},
    '五连肖':{odds:100,rebate:4},'五连肖带主肖':{odds:90,rebate:4},'平特尾':{odds:1.8,rebate:4},'平特尾零尾':{odds:2,rebate:4},
    '二连尾':{odds:3,rebate:4},'二连尾零尾':{odds:3.5,rebate:4},'三连尾':{odds:6,rebate:4},'三连尾零尾':{odds:6.5,rebate:4},
    '四连尾':{odds:14,rebate:4},'四连尾零尾':{odds:15,rebate:4},'五连尾':{odds:28,rebate:4},'五连尾零尾':{odds:30,rebate:4},
    '五不中':{odds:2,rebate:4},'六不中':{odds:2.5,rebate:4},'七不中':{odds:3,rebate:4},'八不中':{odds:3.5,rebate:4},
    '九不中':{odds:4,rebate:4},'十不中':{odds:5,rebate:4},'十一不中':{odds:6,rebate:4},'十二不中':{odds:7,rebate:4},
    '二中二':{odds:60,rebate:4},'三中三':{odds:600,rebate:4},'平码':{odds:7,rebate:4},
    '特碰':{odds:120,rebate:4},
    '包红波':{odds:2.6,rebate:4},'包蓝波':{odds:2.7,rebate:4},'包绿波':{odds:2.7,rebate:4},
    '包红单':{odds:5,rebate:4},'包红双':{odds:4.7,rebate:4},'包红大':{odds:6,rebate:4},'包红小':{odds:4,rebate:4},
    '包蓝单':{odds:5,rebate:4},'包蓝双':{odds:5,rebate:4},'包蓝大':{odds:4.7,rebate:4},'包蓝小':{odds:6,rebate:4},
    '包绿单':{odds:5,rebate:4},'包绿双':{odds:5,rebate:4},'包绿大':{odds:5,rebate:4},'包绿小':{odds:6,rebate:4},
    '包单':{odds:1.8,rebate:4},'包双':{odds:1.8,rebate:4},'包大':{odds:1.8,rebate:4},'包小':{odds:1.8,rebate:4},
    '包家禽':{odds:1.8,rebate:4},'包野兽':{odds:1.8,rebate:4}
  };
  const saved = oddsData[type] || {};
  return {
    odds: parseFloat(saved.odds) || defaults[type]?.odds || 1,
    rebate: parseFloat(saved.rebate) || defaults[type]?.rebate || 4
  };
}

// ===== 存储抽屉控制 =====
let storageDrawerTimer = null;
function toggleStorageDrawer() {
  const panel = document.getElementById('storagePanel');
  if (!panel) return;
  const isShowing = panel.classList.contains('show');
  if (isShowing) {
    panel.classList.remove('show');
    if (storageDrawerTimer) { clearTimeout(storageDrawerTimer); storageDrawerTimer = null; }
  } else {
    panel.classList.add('show');
    updateLogCount();
  }
}
function showStorageDrawerTemporary(duration = 5000) {
  const panel = document.getElementById('storagePanel');
  if (!panel) return;
  panel.classList.add('show');
  updateLogCount();
  if (storageDrawerTimer) clearTimeout(storageDrawerTimer);
  storageDrawerTimer = setTimeout(() => {
    panel.classList.remove('show');
    storageDrawerTimer = null;
  }, duration);
}

// ===== 浮动窗口控制（只允许标题栏拖拽 + 边界弹回） =====
function makeWindowDraggable(winId) {
  const win = document.getElementById(winId);
  if (!win) return;
  const header = win.querySelector('.modal-header') || win.querySelector('.database-modal-header');
  if (!header) return;
  let isDragging = false, startX, startY, startLeft, startTop;

  function onMouseDown(e) {
    if (e.target.closest('.window-controls')) return;
    if (e.target.closest('input, textarea, button, select, [contenteditable="true"]')) return;
    if (e.offsetX > e.target.clientWidth || e.offsetY > e.target.clientHeight) return;
    isDragging = true;
    const rect = win.getBoundingClientRect();
    startX = e.clientX;
    startY = e.clientY;
    startLeft = rect.left;
    startTop = rect.top;

    // 如果窗口已经越界，先拉回安全位置再开始拖拽
    const minVisible = 50;
    if (startTop < 0) {
      win.style.top = '0px';
      win.style.transform = 'none';
      startTop = 0;
    }
    if (startLeft < -win.offsetWidth + minVisible) {
      win.style.left = (-win.offsetWidth + minVisible) + 'px';
      win.style.transform = 'none';
      startLeft = -win.offsetWidth + minVisible;
    }
    if (startLeft > window.innerWidth - minVisible) {
      win.style.left = (window.innerWidth - minVisible) + 'px';
      win.style.transform = 'none';
      startLeft = window.innerWidth - minVisible;
    }

    win.style.cursor = 'grabbing';
    e.preventDefault();
  }

  header.addEventListener('mousedown', onMouseDown);

  // 双击标题栏重置窗口到中央
  header.addEventListener('dblclick', function(e) {
    if (e.target.closest('.window-controls')) return;
    if (e.target.closest('input, textarea, button, select')) return;
    win.style.left = '50%';
    win.style.top = '50%';
    win.style.transform = 'translate(-50%, -50%)';
    win.style.right = '';
    win.style.bottom = '';
    showToast('窗口已重置到中央');
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    let newLeft = startLeft + dx;
    let newTop = startTop + dy;

    const winWidth = win.offsetWidth;
    const winHeight = win.offsetHeight;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const minVisible = 50;

    if (newLeft < -winWidth + minVisible) newLeft = -winWidth + minVisible;
    if (newLeft > screenWidth - minVisible) newLeft = screenWidth - minVisible;
    if (newTop < 5) newTop = 5;   // 防止标题栏跑出浏览器可视区域顶部
    if (newTop > screenHeight - minVisible) newTop = screenHeight - minVisible;

    win.style.left = newLeft + 'px';
    win.style.top = newTop + 'px';
    win.style.transform = 'none';
  });

  document.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    win.style.cursor = '';

    // 松开鼠标后兜底修正
    const rect = win.getBoundingClientRect();
    const winWidth = win.offsetWidth;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const minVisible = 50;

    if (rect.top < 5) {
      win.style.top = '5px';
      win.style.transform = 'none';
    }
    if (rect.left < -winWidth + minVisible) {
      win.style.left = (-winWidth + minVisible) + 'px';
      win.style.transform = 'none';
    }
    if (rect.left > screenWidth - minVisible) {
      win.style.left = (screenWidth - minVisible) + 'px';
      win.style.transform = 'none';
    }
    if (rect.top > screenHeight - minVisible) {
      win.style.top = (screenHeight - minVisible) + 'px';
      win.style.transform = 'none';
    }
  });

  win.addEventListener('mousedown', () => { highestZ += 1; win.style.zIndex = highestZ; });
}

// ===== 最大化窗口 =====
function maximizeWindow(winId) { const win = document.getElementById(winId); if (!win) return; const isMaximized = win.getAttribute('data-maximized') === 'true'; if (isMaximized) { const origWidth = win.getAttribute('data-orig-width'); const origHeight = win.getAttribute('data-orig-height'); const origLeft = win.getAttribute('data-orig-left'); const origTop = win.getAttribute('data-orig-top'); const origTransform = win.getAttribute('data-orig-transform'); if (origWidth) win.style.width = origWidth; if (origHeight) win.style.height = origHeight; if (origLeft) win.style.left = origLeft; if (origTop) win.style.top = origTop; if (origTransform !== null) win.style.transform = origTransform; win.style.right = ''; win.style.bottom = ''; win.setAttribute('data-maximized', 'false'); win.style.resize = 'both'; win.style.overflow = 'auto'; } else { const rect = win.getBoundingClientRect(); win.setAttribute('data-orig-width', win.style.width || (rect.width + 'px')); win.setAttribute('data-orig-height', win.style.height || (rect.height + 'px')); win.setAttribute('data-orig-left', win.style.left || (rect.left + 'px')); win.setAttribute('data-orig-top', win.style.top || (rect.top + 'px')); win.setAttribute('data-orig-transform', win.style.transform || ''); win.style.left = '0'; win.style.top = '0'; win.style.right = '0'; win.style.bottom = '0'; win.style.width = 'auto'; win.style.height = 'auto'; win.style.transform = 'none'; win.setAttribute('data-maximized', 'true'); win.style.resize = 'none'; win.style.overflow = 'auto'; } }

// ===== 日常辅助函数 =====
function isTokenMatching(token,targetNum){ const t=targetNum.padStart(2,'0'); if(/^\d{1,2}$/.test(token))return token.padStart(2,'0')===t; if(D[token]){const nums=keyToAllNums(token);return nums.includes(t);} return false; }
function highlightContent(content,targetNum){ if(!targetNum)return content; const t=targetNum.padStart(2,'0'); const parts=[];let tmp=''; for(const ch of content){if(ch==='-'||ch===' '){if(tmp)parts.push(tmp);parts.push(ch);tmp='';}else{tmp+=ch;}} if(tmp)parts.push(tmp); return parts.map(p=>{if(p==='-'||p===' ')return p;if(isTokenMatching(p,targetNum))return`<span class="highlight-number">${p}</span>`;return p;}).join(''); }
function orderContainsTarget(content,targetNum){ if(!targetNum)return true; const t=targetNum.padStart(2,'0'); const lines=content.split('\n'); for(const line of lines){ if(!line.startsWith('特码:')) continue; const m=line.match(/^特码:(.+?)\s+各(?:数|)\s*(\d+)$/); if(!m)continue; const cont=m[1]; const parts=[];let tmp=''; for(const ch of cont){if(ch==='-'||ch===' '){if(tmp)parts.push(tmp);parts.push(ch);tmp='';}else{tmp+=ch;}} if(tmp)parts.push(tmp); for(const p of parts){if(p!=='-'&&p!==' '&&isTokenMatching(p,targetNum))return true;} } return false; }
function getSpecialAmountFromOrder(content, prizeNum) { if (!prizeNum) return 0; const targetNum = prizeNum.padStart(2, '0'); const lines = content.split('\n'); let total = 0; for (const line of lines) { const match = line.match(/^(.+?):(.+?)\s+各(?:数|)\s*(\d+)$/); if (!match) continue; const tokensPart = match[2]; const amount = parseInt(match[3]) || 0; const tokens = tokensPart.split('-').map(t => t.trim()).filter(t => t); for (const token of tokens) { if (isTokenMatching(token, targetNum)) { total += amount; } } } return total; }