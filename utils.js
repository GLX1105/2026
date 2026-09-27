// =============================================================================
// utils.js - 港澳识别系统 - 通用工具函数
// 引用 dictionary.js 中的变量（D, ZODIAC, ZODIAC_NUMS, toNum, extractNums 等）
// 对应 Python 版本的 utils.py
// =============================================================================

// ===== 键展开函数 =====
// keyToAllNums 已在 dictionary.js 中定义

function expandKeyToZodiacs(key) {
  if (!D[key]) return [];
  const val = D[key];
  if (/^[鼠牛虎兔龙蛇马羊猴鸡狗猪]+$/.test(val)) return val.split('');
  if (/^[鼠牛虎兔龙蛇马羊猴鸡狗猪]$/.test(key) && ZODIAC_NUMS[key]) return [key];
  return [];
}

function expandKeyToNums(key) {
  if (!D[key]) return [];
  const val = D[key];
  if (/^[鼠牛虎兔龙蛇马羊猴鸡狗猪]+$/.test(val)) return [];
  return val.split(/[\s,，]+/).filter(n => n.trim());
}

// =============================================================================
// 解析特码段（增强版，支持头/尾玩法）
// =============================================================================
function parseTeMaSegment(content) {
  if (!content.trim()) return null;
  const allDictKeys = Object.keys(D).filter(k => !ZODIAC.includes(k) && !/^\d+$/.test(k) && !/^\d{2}$/.test(k));
  allDictKeys.sort((a, b) => b.length - a.length);
  let remaining = content.trim();
  const tokens = [];
  const invalidNums = [];
  const zodRegex = new RegExp('^[' + ZODIAC + ']');
  while (remaining.length > 0) {
    remaining = remaining.trim();
    let matched = false;
    for (const key of allDictKeys) {
      if (remaining.startsWith(key)) {
        if (keyToAllNums(key).length > 0) tokens.push({ type: 'key', value: key });
        remaining = remaining.slice(key.length);
        matched = true;
        break;
      }
    }
    if (matched) continue;
    const zodMatch = remaining.match(zodRegex);
    if (zodMatch) { tokens.push({ type: 'zodiac', value: zodMatch[0] }); remaining = remaining.slice(1); continue; }
    const numMatch = remaining.match(/^(\d+)/);
    if (numMatch) {
      const nStr = numMatch[1];
      const n = parseInt(nStr);
      // 检查后面是否跟着"头"或"尾"
      const afterNum = remaining.slice(nStr.length);
      const htMatch = afterNum.match(/^[头尾]/);
      if (htMatch) {
        tokens.push({ type: 'num', value: nStr + htMatch[0] });
        remaining = remaining.slice(nStr.length + 1);
        continue;
      }
      if (n >= 1 && n <= 49 && nStr.length <= 2) {
        tokens.push({ type: 'num', value: String(n) });
        remaining = remaining.slice(nStr.length);
        continue;
      } else {
        invalidNums.push(nStr);
        remaining = remaining.slice(nStr.length);
        continue;
      }
    }
    remaining = remaining.slice(1);
  }
  if (tokens.length === 0) return null;
  const allNumsArr = [];
  const displayItems = [];
  const warnings = [];
  for (const t of tokens) {
    if (t.type === 'num') {
      const val = t.value;
      // 头/尾玩法
      if (val.endsWith('头') || val.endsWith('尾')) {
        displayItems.push(val);
        allNumsArr.push(val);
      } else {
        const padded = String(parseInt(val)).padStart(2, '0');
        displayItems.push(padded);
        allNumsArr.push(padded);
      }
    } else if (t.type === 'zodiac') {
      displayItems.push(t.value);
      const nums = ZODIAC_NUMS[t.value] ? ZODIAC_NUMS[t.value].split(/[\s,，]+/) : [];
      nums.forEach(n => allNumsArr.push(n));
    } else if (t.type === 'key') {
      displayItems.push(t.value);
      const nums = keyToAllNums(t.value);
      nums.forEach(n => allNumsArr.push(n));
    }
  }
  const cnt = allNumsArr.length;
  if (invalidNums.length) warnings.push('号码' + invalidNums.join('、') + '超出范围（1-49），已自动忽略');
  return { displayItems, totalCount: cnt, warnings, allNumsArr: allNumsArr };
}

// ===== 包含字典元素检查 =====
function containsDictElement(str) {
  if (!str) return false;
  const nums = str.match(/\d+/g);
  if (nums) {
    for (const n of nums) {
      const intVal = parseInt(n);
      if (intVal >= 1 && intVal <= 49) return true;
    }
  }
  if (/[鼠牛虎兔龙蛇马羊猴鸡狗猪]/.test(str)) return true;
  if (/\d+尾/.test(str)) return true;
  const dictKeywords = ['金','木','水','火','土','红波','蓝波','绿波','红单','红双','蓝单','蓝双','绿单','绿双',
    '单数','双数','家禽','野兽','平特肖','平特尾','连肖','连尾','二中二','三中二','三中三','不中','特码','特肖','特碰',
    '红','蓝','绿','单','双','大','小','各','各数','各号','各组','到'];
  for (const kw of dictKeywords) {
    if (str.includes(kw)) return true;
  }
  return false;
}

// ===== 格式化号码显示 =====
function formatNums(cat, numsArr) {
  const simpleCats = ['特码', '特肖', '平特肖', '平码', '平特尾'];
  if (simpleCats.includes(cat)) return numsArr.join('-');
  if (cat.startsWith('包')) return numsArr.join('-');
  if (cat.includes('连肖') || cat.includes('连尾')) return numsArr.join('-');
  return numsArr.map(g => '(' + g + ')').join(' ');
}

// ===== countItemsInLine（用于统计行内注数） =====
function countItemsInLine(line) {
  const teXiaoMatch = line.match(/^特肖:(.+?)\s+各\s*(\d+)$/);
  if (teXiaoMatch) {
    const zodiacsStr = teXiaoMatch[1];
    const amt = parseInt(teXiaoMatch[2]) || 0;
    const zodiacs = zodiacsStr.split('-').map(z => z.trim()).filter(z => z);
    return { numbers: [], zodiacs: zodiacs, amount: amt, playType: '特肖', zodiacCount: zodiacs.length };
  }

  const baoMatch = line.match(/^包(.+?):(.+?)\s+各\s*(\d+)$/);
  if (baoMatch) {
    const attr = baoMatch[2].trim();
    const amt = parseInt(baoMatch[3]) || 0;
    return { numbers: [], zodiacs: [], amount: amt, playType: '包' + attr };
  }

  const tepengMatch = line.match(/^特碰:(.+?)\s+各\s*(\d+)$/);
  if (tepengMatch) {
    const content = tepengMatch[1].trim();
    const amt = parseInt(tepengMatch[2]) || 0;
    const groups = content.split(/\s+/).filter(g => g.trim());
    const nums = [];
    groups.forEach(g => {
      const cleaned = g.replace(/[()]/g, '');
      const tokens = cleaned.split('-');
      tokens.forEach(t => { if (/^\d{2}$/.test(t)) nums.push(t); });
    });
    return { numbers: nums, zodiacs: [], amount: amt, playType: '特碰' };
  }

  const newMatch = line.match(/^(.+?):(.+?)\s+(各(?:数|))\s*(\d+)$/);
  if (newMatch) {
    const playType = newMatch[1];
    const content = newMatch[2];
    const amt = parseInt(newMatch[4]) || 0;
    if (playType !== '特码') { return { numbers: [], zodiacs: [], amount: 0, playType }; }
    const items = content.split('-').map(i => i.trim()).filter(i => i);
    const nums = [];
    const zods = [];
    items.forEach(item => {
      if (/^\d{2}$/.test(item) && parseInt(item) >= 1 && parseInt(item) <= 49) { nums.push(item); }
      else if (/^\d$/.test(item) && parseInt(item) >= 1 && parseInt(item) <= 49) { nums.push(item.padStart(2, '0')); }
      else if (/^[\u4e00-\u9fa5]$/.test(item) && ZODIAC_NUMS[item]) { zods.push(item); ZODIAC_NUMS[item].split(/[\s,，]+/).forEach(n => nums.push(n.padStart(2, '0'))); }
      else if (D[item]) {
        const val = D[item];
        if (/[鼠牛虎兔龙蛇马羊猴鸡狗猪]/.test(val)) {
          if (/^[\u4e00-\u9fa5]$/.test(item) && ZODIAC_NUMS[item]) { zods.push(item); ZODIAC_NUMS[item].split(/[\s,，]+/).forEach(n => nums.push(n.padStart(2, '0'))); }
          else { for (const z of val) { if (ZODIAC_NUMS[z]) { zods.push(z); ZODIAC_NUMS[z].split(/[\s,，]+/).forEach(n => nums.push(n.padStart(2, '0'))); } } }
        } else { val.split(/[\s,，]+/).filter(n => n.trim()).forEach(n => nums.push(n.padStart(2, '0'))); }
      }
    });
    return { numbers: nums, zodiacs: [...new Set(zods)], amount: amt, playType };
  }
  const oldMatch = line.match(/^(.+?)\s+各(?:数|)\s*(\d+)$/);
  if (oldMatch) {
    const content = oldMatch[1];
    const amt = parseInt(oldMatch[2]) || 0;
    const items = content.split('-').map(i => i.trim()).filter(i => i);
    const nums = [];
    const zods = [];
    items.forEach(item => {
      if (/^\d{2}$/.test(item) && parseInt(item) >= 1 && parseInt(item) <= 49) { nums.push(item); }
      else if (/^\d$/.test(item) && parseInt(item) >= 1 && parseInt(item) <= 49) { nums.push(item.padStart(2, '0')); }
      else if (/^[\u4e00-\u9fa5]$/.test(item) && ZODIAC_NUMS[item]) { zods.push(item); ZODIAC_NUMS[item].split(/[\s,，]+/).forEach(n => nums.push(n.padStart(2, '0'))); }
      else if (D[item]) {
        const val = D[item];
        if (/[鼠牛虎兔龙蛇马羊猴鸡狗猪]/.test(val)) {
          if (/^[\u4e00-\u9fa5]$/.test(item) && ZODIAC_NUMS[item]) { zods.push(item); ZODIAC_NUMS[item].split(/[\s,，]+/).forEach(n => nums.push(n.padStart(2, '0'))); }
          else { for (const z of val) { if (ZODIAC_NUMS[z]) { zods.push(z); ZODIAC_NUMS[z].split(/[\s,，]+/).forEach(n => nums.push(n.padStart(2, '0'))); } } }
        } else { val.split(/[\s,，]+/).filter(n => n.trim()).forEach(n => nums.push(n.padStart(2, '0'))); }
      }
    });
    return { numbers: nums, zodiacs: [...new Set(zods)], amount: amt };
  }
  return { numbers: [], zodiacs: [], amount: 0 };
}

// ===== 玩法名称标准化 =====
function normalizePlayType(playType) {
  const map = {
    '2连肖':'二连肖','3连肖':'三连肖','4连肖':'四连肖','5连肖':'五连肖',
    '2连尾':'二连尾','3连尾':'三连尾','4连尾':'四连尾','5连尾':'五连尾',
    '5不中':'五不中','6不中':'六不中','7不中':'七不中','8不中':'八不中',
    '9不中':'九不中','10不中':'十不中','11不中':'十一不中','12不中':'十二不中',
    '13不中':'十三不中','14不中':'十四不中','15不中':'十五不中','16不中':'十六不中',
    '17不中':'十七不中','18不中':'十八不中',
    '2中2':'二中二','3中3':'三中三','3中2':'三中二',
    '二连肖':'二连肖','三连肖':'三连肖','四连肖':'四连肖','五连肖':'五连肖',
    '二连尾':'二连尾','三连尾':'三连尾','四连尾':'四连尾','五连尾':'五连尾',
    '五不中':'五不中','六不中':'六不中','七不中':'七不中','八不中':'八不中',
    '九不中':'九不中','十不中':'十不中','十一不中':'十一不中','十二不中':'十二不中',
    '十三不中':'十三不中','十四不中':'十四不中','十五不中':'十五不中','十六不中':'十六不中',
    '十七不中':'十七不中','十八不中':'十八不中',
    '二中二':'二中二','三中三':'三中三','三中二':'三中二','特碰':'特碰',
    '平特肖':'平特肖','平特尾':'平特尾','平码':'平码','特码':'特码','特肖':'特肖'
  };
  return map[playType] || playType;
}