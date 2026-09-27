// =============================================================================
// parser.js - 港澳识别系统 - 核心识别解析函数（增强版）
// 引用 config.js 和 dictionary.js 中的变量（D, ZODIAC, ZODIAC_NUMS, KW_LIST, NUM_TO_ZODIAC, ATTR_TO_ZODIACS, AGE_TO_NUMS, currentRegion 等）
// 增强版移植自 Python parser.py，包含14步预处理管道、增强的collectSpecialMatches、processOneLine、applyInlineInheritance
// =============================================================================

// ===== 地区切换核心逻辑 =====
// currentRegion 已在 config.js 中定义
function getCurrentRegion() { return currentRegion; }
function setCurrentRegion(region) {
  currentRegion = region;
  localStorage.setItem('currentRegion', region);
  document.getElementById('btnMacau').classList.toggle('region-active', region === 'macau');
  document.getElementById('btnHongkong').classList.toggle('region-active', region === 'hongkong');
  document.getElementById('btnYuegang').classList.toggle('region-active', region === 'yuegang');
  const navbar = document.getElementById('mainNavbar');
  if (navbar) {
    if (region === 'macau') navbar.style.borderBottomColor = '#e74c3c';
    else if (region === 'hongkong') navbar.style.borderBottomColor = '#3498db';
    else if (region === 'yuegang') navbar.style.borderBottomColor = '#27ae60';
  }
  document.body.setAttribute('data-region', region);
}

async function switchRegion(region) {
  if (region === currentRegion) return;
  const recognizeWin = document.getElementById('recognizeWin');
  const sourceInput = document.querySelector('.source-order-input');
  if (recognizeWin && sourceInput && sourceInput.value.trim()) {
    const confirmed = await confirm('识别弹窗中有未保存的订单内容，切换地区将清空输入，确定切换吗？');
    if (!confirmed) return;
    sourceInput.value = ''; const resultEl = document.getElementById('orderResult'); if (resultEl) resultEl.innerHTML = ''; updateOrderTotalDisplay();
  }
  const orderWin = document.getElementById('orderWin'); if (orderWin) orderWin.remove();
  const reportWin = document.getElementById('reportWin'); if (reportWin) reportWin.remove();
  setCurrentRegion(region); clearMemoryData(); await updateTableFromRecords(); updateSelects(); updateRecycleCount(); updateRecentDrawTexts(); renderSmartDecision();
  addOperationLog('switch', `切换至${region === 'macau' ? '澳门' : region === 'hongkong' ? '香港' : '粤港'}`, region);
  showToast(`已切换至${region === 'macau' ? '澳门' : region === 'hongkong' ? '香港' : '粤港'}`);
}

function clearMemoryData() { tableBetData = {}; userBetData = {}; reportBetData = {}; reportAmountData = {}; reportRiskData = {}; numberCount = {}; zodiacCount = {}; numberAmountCount = {}; zodiacAmountCount = {}; zodiacDirectAmount = {}; zodiacFilteredAmount = {}; zodiacReportAmount = {}; zodiacFilteredReportAmount = {}; numberOrderTotal = 0; zodiacWeightedTotal = 0; originalOrderAmount = {}; directOrderAmount = {}; directReportAmount = {}; }

// ===== 插入分类文字 =====
function insertCategoryText(text) {
  const ta = document.querySelector('.source-order-input');
  if (!ta) return;
  const start = ta.selectionStart;
  const end = ta.selectionEnd;
  ta.value = ta.value.substring(0, start) + text + ta.value.substring(end);
  ta.focus();
  ta.setSelectionRange(start + text.length, start + text.length);
  performRecognition(ta.value);
}

// ===== 地区圆点切换函数 =====
function setDotRegion(region) {
  window._dotRegion = region;
  const dotSmart = document.getElementById('dotSmart');
  const dotMacau = document.getElementById('dotMacau');
  const dotHongkong = document.getElementById('dotHongkong');
  const dotYuegang = document.getElementById('dotYuegang');
  
  if (dotSmart) {
    if (region === 'auto') {
      dotSmart.style.background = '#8e44ad'; dotSmart.style.color = '#fff'; dotSmart.style.border = '1px solid #8e44ad';
      if (dotSmart.querySelector('span')) dotSmart.querySelector('span').style.background = '#fff';
    } else {
      dotSmart.style.background = 'transparent'; dotSmart.style.color = '#8e44ad'; dotSmart.style.border = '1px solid #8e44ad';
      if (dotSmart.querySelector('span')) { dotSmart.querySelector('span').style.background = 'transparent'; dotSmart.querySelector('span').style.border = '1px solid #8e44ad'; }
    }
  }
  if (dotMacau) {
    if (region === 'macau') {
      dotMacau.style.background = '#e74c3c'; dotMacau.style.color = '#fff'; dotMacau.style.border = '1px solid #e74c3c';
      if (dotMacau.querySelector('span')) dotMacau.querySelector('span').style.background = '#fff';
    } else {
      dotMacau.style.background = 'transparent'; dotMacau.style.color = '#e74c3c'; dotMacau.style.border = '1px solid #e74c3c';
      if (dotMacau.querySelector('span')) { dotMacau.querySelector('span').style.background = 'transparent'; dotMacau.querySelector('span').style.border = '1px solid #e74c3c'; }
    }
  }
  if (dotHongkong) {
    if (region === 'hongkong') {
      dotHongkong.style.background = '#3498db'; dotHongkong.style.color = '#fff'; dotHongkong.style.border = '1px solid #3498db';
      if (dotHongkong.querySelector('span')) dotHongkong.querySelector('span').style.background = '#fff';
    } else {
      dotHongkong.style.background = 'transparent'; dotHongkong.style.color = '#3498db'; dotHongkong.style.border = '1px solid #3498db';
      if (dotHongkong.querySelector('span')) { dotHongkong.querySelector('span').style.background = 'transparent'; dotHongkong.querySelector('span').style.border = '1px solid #3498db'; }
    }
  }
  if (dotYuegang) {
    if (region === 'yuegang') {
      dotYuegang.style.background = '#27ae60'; dotYuegang.style.color = '#fff'; dotYuegang.style.border = '1px solid #27ae60';
      if (dotYuegang.querySelector('span')) dotYuegang.querySelector('span').style.background = '#fff';
    } else {
      dotYuegang.style.background = 'transparent'; dotYuegang.style.color = '#27ae60'; dotYuegang.style.border = '1px solid #27ae60';
      if (dotYuegang.querySelector('span')) { dotYuegang.querySelector('span').style.background = 'transparent'; dotYuegang.querySelector('span').style.border = '1px solid #27ae60'; }
    }
  }
}

// ===== 标记地区函数 =====
function markRegion(region) {
  const ta = document.querySelector('.source-order-input');
  if (!ta) return;
  const start = ta.selectionStart, end = ta.selectionEnd;
  if (start === end) { showToast('请先选择文本'); return; }
  const selectedText = ta.value.substring(start, end);
  if (!selectedText.trim()) { showToast('请先选择文本'); return; }
  
  const prefixMap = { 'macau': '澳', 'hongkong': '港', 'yuegang': '粤' };
  const prefix = prefixMap[region] || '';
  
  const allPrefixes = ['澳', '奥', '澳门', '奥门', '门', '港', '香', '香港', '粤', '粤港'];
  const allPrefixesSorted = [...allPrefixes].sort((a, b) => b.length - a.length);
  
  const lines = selectedText.split('\n');
  const markedLines = lines.map(line => {
    let trimmed = line.trim();
    if (!trimmed) return line;
    
    for (const p of allPrefixesSorted) {
      if (trimmed.startsWith(p)) {
        trimmed = trimmed.substring(p.length).trim();
        break;
      }
    }
    
    const leadingSpace = line.match(/^(\s*)/)[1];
    return leadingSpace + prefix + trimmed;
  });
  
  const markedText = markedLines.join('\n');
  ta.value = ta.value.substring(0, start) + markedText + ta.value.substring(end);
  performRecognition(ta.value);
  const regionLabels = { 'macau': '澳门', 'hongkong': '香港', 'yuegang': '粤港' };
  showToast('已标记为' + (regionLabels[region] || region));
}

// ===== 替换预设与分类别名 =====
function getReplacePresets() { try { return JSON.parse(localStorage.getItem('replacePresets') || '[]'); } catch (e) { return []; } }
function getCategoryAliases() { try { return JSON.parse(localStorage.getItem('categoryAliases') || '[]'); } catch (e) { return []; } }
function getCustomAmountSuffixes() { try { return JSON.parse(localStorage.getItem('customAmountSuffixes') || '[]'); } catch (e) { return []; } }

function applyCategoryAliases(text) { const a=getCategoryAliases(); if(!a.length)return text;const s=[...a].sort((x,y)=>y.alias.length-x.alias.length); let r=text; s.forEach(x=>{ if(x.alias&&x.target)r=r.split(x.alias).join(x.target); }); return r; }
function applyReplacePresets(text) { const p = getReplacePresets(); let r = text; p.forEach(x => { if (x.old && x.new) { const escapedOld = x.old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); const regex = new RegExp(escapedOld, 'g'); r = r.replace(regex, x.new); } }); return r; }

// ===== 预构建玩法名正则（PLAY_NAMES_LIST 定义在 dictionary.js 中） =====
function buildPlayPatterns() {
    const patterns = [];
    for (const name of PLAY_NAMES_LIST) {
        patterns.push(name);
        for (let i = 2; i <= 5; i++) {
            patterns.push(i + name);
        }
    }
    patterns.sort((a, b) => b.length - a.length);
    return patterns;
}







// =============================================================================
// 预处理管道（14步）
// =============================================================================

// ===== 正则常量（用于预处理） =====
const PRE_SUFFIX_LIST = '米|元|块|角|分|厘|眯|咪|井|#|快|斤|文|蚊|纹|园|圆';

// 第1步：全角转半角
function step_convertFullWidth(txt) {
  let result = '';
  for (const ch of txt) {
    if (ch >= '\uFF01' && ch <= '\uFF5E') {
      result += String.fromCharCode(ch.charCodeAt(0) - 0xFEE0);
    } else {
      result += ch;
    }
  }
  result = result.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  result = result.replace(/[oO]/g, '0');
  result = result.replace(/[liI！]/g, '1');
  return result;
}

// ===== 错别字映射表 =====
// 条目与顺序均与 Python 版 dict_data.TYPO_MAP 一致（替换时按 key 长度降序，等长保持本表顺序）
const TYPO_MAP = {
  '夏式': '复式', '復式': '复式', '复试': '复式', '複试': '复式',
  '友': '有', '尤': '龙', '坡': '波', '午': '牛', '綠': '绿', '监': '蓝', '篮': '蓝',
  '俏': '肖', '消': '肖', '销': '肖', '宵': '肖',
  '串肖': '连肖', '连消': '连肖', '車肖': '连肖', '蓮': '连', '莲': '连', '联': '连',
  '肖连': '连肖', '藍': '蓝', '录': '绿', '碌': '绿', '禄': '绿', '啵': '波',
  '|': '1', '○': '0', 'σ': '0', '〇': '0', 'l': '1', 'I': '1',
  '壹': '一', '贰': '二', '叁': '三', '肆': '四', '伍': '五', '陆': '六', '柒': '七', '捌': '八', '玖': '九',
  '拾': '十', '佰': '百', '仟': '千',
  '馬': '马', '龍': '龙', '雞': '鸡', '豬': '猪', '鳮': '鸡',
  '候': '猴', '侯': '猴', '免': '兔', '拘': '狗',
  '老鼠': '鼠', '老虎': '虎', '兔子': '兔', '猴子': '猴', '老蛇': '蛇', '子': '鼠',
  '特吗': '特码', '苹码': '平码', '兰': '蓝',
  '紅波小': '红小', '紅波大': '红大', '綠波小': '绿小', '綠波大': '绿大',
  '蓝波小': '蓝小', '蓝波大': '蓝大', '兰小': '蓝小', '兰大': '蓝大',
  '尾数小': '小尾', '尾数大': '大尾',
  '平特一肖': '平特肖', '平特二肖': '平特肖', '平特三肖': '平特肖', '平特马': '平特肖马',
  '复试三肖': '复式三连肖', '三肖复式': '三连肖复式',
  '复试三尾': '复式三连尾', '三尾复式': '三连尾复式',
  '复试二中二': '复式二中二', '二中二复试': '复式二中二', '二中二复': '复式二中二', '二中二复式': '复式二中二',
  '复试三中三': '复式三中三', '三中三复试': '复式三中三',
  '家肖': '家禽', '野肖': '野兽', '家属': '家肖',
  '复三': '复式三', '复三尾': '复式三连尾',
  '復制': '复式', '复制': '复式', '复示': '复式', '覆式': '复式',
  '単': '单', '組': '组', '毎': '每', '㺅': '猴', '𤠣': '猴'
};

// 按 key 长度降序的错别字条目（Python 版 step_fixTypos 的 sorted(TYPO_MAP, key=len, reverse=True)）
const TYPO_MAP_SORTED = Object.entries(TYPO_MAP).sort((a, b) => b[0].length - a[0].length);

// 按错别字表归一文本（仅替换，不删除噪声词）
function applyTypoMap(str) {
  let r = str;
  for (const [k, v] of TYPO_MAP_SORTED) r = r.split(k).join(v);
  return r;
}

// 第2步：错别字替换
function step_fixTypos(txt) {
  let result = applyTypoMap(txt);
  // 删除噪声词
  ['天天彩', '天天采', '天天', '天彩', '天采', '总单'].forEach(s => result = result.split(s).join(''));
  result = result.replace(/澳门\d+期/g, '');
  // "分别拖/分别托/分拖" → "拖"（前组分别拖后组）
  // 须在金额单位处理(step_stripAmountSuffix)之前做，否则"分"被当金额单位(角分厘)剥掉
  result = result.replace(/分别?(?=[拖托])/g, '');
  return result;
}

// 第3步：剥离汇总后缀（共40、合计40、共计40米等）
function step_stripTotalSuffix(txt) {
  let result = txt;
  const totalKws = '共(?:计)?|总(?:共|计|金额|投注|投入|额)?|合(?:计|共)?|计|一共|全部|小计|一起|全|🈴';
  // 组/注数量：支持阿拉伯与中文数字（如"共6组"、"共六组"）
  const cntNum = '\\d+(?:\\.\\d+)?|[一二三四五六七八九十百千两]+';
  // 先剥离中间的"共计XX组"（"组"是数量单位，不是金额关键字）
  result = result.replace(new RegExp(`(?:${totalKws})\\s*(?:${cntNum})\\s*组\\s*`, 'g'), '');
  // 再剥离"共XX注"（"注"是数量单位，不是金额关键字），避免注数被当成号码、整行拆坏
  // 如"07.19.31.43托12.24.36.48共16注每注20" → "07.19.31.43托12.24.36.48每注20"
  result = result.replace(new RegExp(`(?:${totalKws})\\s*(?:${cntNum})\\s*注\\s*`, 'g'), '');
  // 再剥离"共XX个"（"个"做组合数单位时冗余，避免数字被误当号码、拖号被挤坏）
  // 如"02.14.26.38托09.21.33.45共16个每注20" → "02.14.26.38托09.21.33.45每注20"
  result = result.replace(new RegExp(`(?:${totalKws})\\s*(?:${cntNum})\\s*个\\s*`, 'g'), '');
  // 再剥离行尾：关键词 + 可选空格 + 数字 + 可选单位词
  // 使用 'm' 使 $ 匹配每行末尾，避免中间行的合计没被剥离
  result = result.replace(new RegExp(`(?:${totalKws})\\s*(?:${cntNum})\\s*(?:${PRE_SUFFIX_LIST})?\\s*$`, 'gm'), '');
  // 也匹配行尾顿号/逗号/句号分隔的汇总确认（如 "共30。"）
  result = result.replace(new RegExp(`(?:${totalKws})\\s*(?:${cntNum})\\s*(?:${PRE_SUFFIX_LIST})?\\s*[。，、]?\\s*$`, 'gm'), '');
  return result.trim();
}

// 第4步：数字间'一'→'-'，合并连续'-'
function step_normalizeDash(txt) {
  let result = txt;
  result = result.replace(/(\d)一(\d)/g, '$1-$2');
  result = result.replace(/(\d{2})\.(\d{2})(?!\d)/g, '$1-$2');
  result = result.replace(/-{2,}/g, '-');
  return result;
}

// 第5步：展开行内"号码+分隔符+金额+单位词"模式
function step_expandInlinePairs(txt) {
  const suffixList = '米|元|块|角|分|厘|眯|咪|井|#|快|斤|文|蚊|纹|园|圆';
  const sepClass = '[\\s,\\-.。、+\\-*＊\\/\\\\|:;~]';
  const itemPattern = new RegExp(
    '(?<![\\-\\d])(\\d{1,2})\\s*' + sepClass + '\\s*(\\d+)\\s*(?:' + suffixList + ')',
    'g'
  );

  const lines = txt.split('\n');
  const resultLines = [];
  for (const line of lines) {
    if (!line.trim()) { resultLines.push(line); continue; }
    const matches = [...line.matchAll(itemPattern)];
    if (!matches.length) { resultLines.push(line); continue; }
    // 检查各匹配项之间是否只有空白或分隔符字符（无其他有意义内容）
    const sepClean = /[\s,\-.。、+\-*＊\/\\|:;~]/g;
    let allMatchOnly = true;
    for (let i = 0; i < matches.length - 1; i++) {
      const between = line.substring(matches[i].index + matches[i][0].length, matches[i + 1].index);
      if (between.replace(sepClean, '')) { allMatchOnly = false; break; }
    }
    if (!allMatchOnly) { resultLines.push(line); continue; }
    const parts = [];
    if (matches[0].index > 0) {
      const prefix = line.substring(0, matches[0].index).trim();
      if (prefix) parts.push(prefix);
    }
    for (const m of matches) parts.push(m[0].trim());
    if (matches[matches.length - 1].index + matches[matches.length - 1][0].length < line.length) {
      const suffix = line.substring(matches[matches.length - 1].index + matches[matches.length - 1][0].length).trim();
      if (suffix) parts.push(suffix);
    }
    if (parts.length === 1) resultLines.push(line);
    else resultLines.push(parts.join('\n'));
  }
  return resultLines.join('\n');
}

// 第6步：玩法名后紧跟标点删除
function step_removePlayPunctuation(txt) {
  let result = txt;
  const patterns = buildPlayPatterns();
  const puncts = '[，。！？；：、,.!?;:～·@＃$％＾＆＊（）＿＋\\-＝｛｝［］｜＼：；＇＂＜＞．／　~@#$%^&*()_+\\-=\\[\]\\{\\}\\|\\\\:;\'\"<>\\./`]';
  for (const pattern of patterns) {
    const re_ = new RegExp('(' + pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')' + puncts, 'g');
    result = result.replace(re_, '$1');
  }
  return result;
}

// 第7步：同行连肖多组拆分
function step_expandLianXiaoGroups(txt) {
  const ZODIAC_SET = '鼠牛虎兔龙蛇马羊猴𤠣鸡狗猪';
  const numMap = { '二': 2, '三': 3, '四': 4, '五': 5, '两': 2, '2': 2, '3': 3, '4': 4, '5': 5 };
  const suffixList = '米|元|块|角|分|厘|眯|咪|井|#|快|斤|文|蚊|纹|园|圆';
  const sepChars = '[\\s,，。.、；;：:！!？?\\-+\\/\\\\|*＊～~]+';

  const lines = txt.split('\n');
  const result = [];
  for (const line of lines) {
    if (!line.trim()) { result.push(line); continue; }
    // 匹配行首连肖玩法名
    const playMatch = line.match(new RegExp(
      '^([二三四五2345两])(?:连肖|连|肖连|肖全中|连?肖|肖中|连)\\s*'
    ));
    if (playMatch) {
      const count = numMap[playMatch[1]];
      if (!count || count < 2 || count > 5) { result.push(line); continue; }
      const playName = playMatch[0].trim();
      const rest = line.substring(playMatch[0].length).trim();
      if (!rest) { result.push(line); continue; }
      const groups = [];
      let pos = 0;
      while (pos < rest.length) {
        let m = rest.substring(pos).match(new RegExp('^' + sepChars));
        if (m) { pos += m[0].length; continue; }
        let zodiacs = '';
        for (let i = 0; i < count; i++) {
          if (pos + i < rest.length && ZODIAC_SET.includes(rest[pos + i])) {
            zodiacs += rest[pos + i];
          } else break;
        }
        if (zodiacs.length !== count) break;
        pos += count;
        m = rest.substring(pos).match(new RegExp('^' + sepChars));
        if (m) pos += m[0].length;
        const amtMatch = rest.substring(pos).match(new RegExp(
          '^(\\d+(?:\\.\\d+)?)((?:\\s*(?:' + suffixList + '))?)'
        ));
        if (!amtMatch) break;
        const amount = amtMatch[0];
        pos += amtMatch[0].length;
        groups.push(zodiacs + amount);
      }
      if (groups.length >= 2 && pos >= rest.length) {
        for (const g of groups) result.push(playName + g);
      } else result.push(line);
      continue;
    }
    // 行尾连肖关键字+金额模式
    const tailMatch = line.trim().match(new RegExp(
      '([二三四五2345两])(?:连肖|连[肖]?|肖连|肖全中|连?肖|肖中|连)\\s*(?:各|各号|各组)?\\s*(\\d+(?:\\.\\d+)?)(?:\\s*(?:' + suffixList + '))?\\s*$'
    ));
    if (!tailMatch) { result.push(line); continue; }
    const k = numMap[tailMatch[1]];
    if (!k || k < 2 || k > 5) { result.push(line); continue; }
    const amount = tailMatch[2];
    const before = line.substring(0, line.indexOf(tailMatch[0])).trim();
    const rawGroups = before.split(/\s+/).filter(g => g);
    let valid = true;
    const parsedGroups = [];
    for (const g of rawGroups) {
      const zInGroup = (g.match(new RegExp('[' + ZODIAC_SET + ']', 'g')) || []).join('');
      if (zInGroup.length !== k || zInGroup.length !== g.trim().length) { valid = false; break; }
      parsedGroups.push(zInGroup);
    }
    if (valid && parsedGroups.length >= 2) {
      const kNumMap = { 2: '二', 3: '三', 4: '四', 5: '五' };
      const prefix = (kNumMap[k] || '二') + '连肖';
      for (const g of parsedGroups) result.push(prefix + g + amount);
    } else { result.push(line); }
  }
  return result.join('\n');
}

// 第8步：平码无冒号字典键展开号码
function step_expandPingmaContent(txt) {
  const kws_sorted = [...KW_LIST].filter(k => k.trim()).sort((a, b) => b.length - a.length);
  const kw_pattern = kws_sorted.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const pingmaRe = new RegExp(
    '(平码|独平)\\s*([\\s\\S]+?)\\s*(' + kw_pattern + ')\\s*(\\d+)',
    'g'
  );
  const lines = txt.split('\n');
  const result = [];
  for (const line of lines) {
    if (!line.trim()) { result.push(line); continue; }
    let newLine = line;
    let match;
    while ((match = pingmaRe.exec(newLine)) !== null) {
      const playName = match[1];
      const content = match[2].trim();
      const kw = match[3];
      const amt = match[4];
      // 检查无效号码
      if (findInvalidNums(content).length > 0) continue;
      // 处理单个字典键
      if (D[content]) {
        const nums = keyToAllNums(content);
        if (nums && nums.length) {
          const is_zodiac = content.length === 1 && ZODIAC.includes(content);
          const marker = is_zodiac ? ' ZODIAC ' : '';
          newLine = newLine.replace(match[0], playName + nums.join('-') + kw + amt + marker);
          continue;
        }
      }
      const zodiac_chars = extractZodiacs(content);
      const nums_found = (content.match(/\d{1,2}/g) || []);
      if (zodiac_chars.length || nums_found.length) {
        const all_nums = [];
        const seen = new Set();
        for (const ch of zodiac_chars) {
          if (ZODIAC_NUMS[ch]) {
            ZODIAC_NUMS[ch].split(/[\s,，]+/).forEach(n => {
              if (!seen.has(n)) { seen.add(n); all_nums.push(n); }
            });
          }
        }
        for (const n of nums_found) all_nums.push(String(parseInt(n)).padStart(2, '0'));
        if (all_nums.length) {
          all_nums.sort((a, b) => parseInt(a) - parseInt(b));
          const marker = zodiac_chars.length ? ' ZODIAC ' : '';
          newLine = newLine.replace(match[0], playName + all_nums.join('-') + kw + amt + marker);
        }
      }
    }
    result.push(newLine);
  }
  return result.join('\n');
}

// 第9步：金额单位替换+多注连写换行拆分
function step_stripAmountSuffix(txt) {
  const suffixList = '米|元|块|角|分|厘|眯|咪|井|#|快|斤|文|蚊|纹|园|圆';
  // 金额关键词：紧跟其后的金额（如"每组5米""各5米""下5米"）是本注金额，
  // 即便后面接着生肖/中文也不参与多注连写拆分，避免"每组5米 羊虎猴鼠兔鸡"被拆成两行。
  const kwPre = '(?:每组各|每注各|每一组|每组|每注|每|各号|各|下|买|押|投|打|注|名|组)';
  let result = txt;
  // 第1步：单位词后接空白/标点/生肖字符时拆分为新行
  // 注意：使用 [^\S\n] 代替 \s 避免跨行匹配（数字+单位+换行+下行的中文被误吞）
  result = result.replace(
    new RegExp(
      '(.*?)(\\d+(?:\\.\\d+)?)\\s*(?:' + suffixList + ')(?:(?:[^\\S\\n]*[^\\w\\s\\u4e00-\\u9fa5]+[^\\S\\n]*|[^\\S\\n]+)(?=[\\u4e00-\\u9fa5])|(?=[鼠牛虎兔龙蛇马羊猴𤠣鸡狗猪]))',
      'g'
    ),
    (matched, p1, p2) => {
      if (new RegExp(kwPre + '$').test(p1)) return matched;
      return p1 + p2 + '\n';
    }
  );
  // 第2步：数字后接中文标点再接中文时拆分为新行
  const PUNCT_CLASS = '，,。！？';
  const _kw_neg = '(?!' + KW_LIST.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')';
  result = result.replace(
    new RegExp('(\\d+)\\s*[' + PUNCT_CLASS + ']\\s*' + _kw_neg + '(?=[\\u4e00-\\u9fa5])', 'g'),
    '$1\n'
  );
  // 第3步：数字后跟空白再跟3位以上数字+头/尾 → 换行拆分（如"10 157尾各号5"→"10\n157尾各号5"）
  // 避免将不同订单的金额（如"10"）和头尾数字（如"157尾"）混在一起
  // 使用 \d{3,} 避免误拆 "5 47尾"（47是两位数尾号，合法）
  result = result.replace(/(\d+)\s+(?=\d{3,}[头尾])/g, '$1\n');
  // 第4步：其余所有单位词替换为空格
  result = result.replace(
    new RegExp('(\\d+(?:\\.\\d+)?)\\s*(?:' + suffixList + ')', 'g'),
    '$1 '
  );
  // 第5步：单位词替换为空格后，再检查一次数字+空白+3位以上数字+头/尾 → 换行拆分
  // 因为第4步前有单位词阻挡（如"10米 157尾"），第3步无法匹配，第4步替换后才形成"10 157尾"
  result = result.replace(/(\d+)\s+(?=\d{3,}[头尾])/g, '$1\n');
  return result;
}

// 第10步：中文标点处换行/转空格
function step_handleChinesePunctuation(txt) {
  let result = txt;
  result = result.replace(/(\d) ([。！？；，])/g, '$1$2');
  const moneyKwPart = '(?:' + KW_LIST.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')';
  const reKw = new RegExp('(' + moneyKwPart + '\\s*\\d+(?:\\.\\d+)?)\\s*([。！？；，])', 'g');
  result = result.replace(reKw, '$1\n');
  const reSuffix = new RegExp('(\\d+(?:\\.\\d+)?\\s*(?:' + PRE_SUFFIX_LIST + '))\\s*([。！？；，])', 'g');
  result = result.replace(reSuffix, '$1\n');
  result = result.replace(/[。！？；，]/g, ' ');
  return result;
}

// 第11步：删除非法字符（@ 保留：N不中支持 @金额 标注写法）
function step_cleanSpecialChars(txt) {
  return txt.replace(/[^\dA-Za-z\u4e00-\u9fa5\s,\-，=＝\.@]/g, ' ');
}

// 第12步：折叠连续空白
function step_collapseSpaces(txt) {
  let result = txt.replace(/\n/g, '[[[NL]]]');
  result = result.replace(/\s{2,}/g, ' ');
  result = result.replace(/\[\[\[NL\]\]\]/g, '\n');
  return result;
}

// 辅助：展开头尾批量写法
function _expand_ht(m, suffix, expandAll) {
  const raw = m[1];
  const digits = raw.match(/\d/g);
  if (!digits || digits.length < 2) return m[0];
  // 纯数字（无分隔符）的情况
  if (/^\d+$/.test(raw)) {
    // 只有整个字符串是两位数号码（10-49）时才不展开
    // 如 "15头" → 不展开（15是两位数号码），"157头" → 展开为 1头-5头-7头
    // 但 expandAll（各号/每号）时两位数尾也拆开，如 "35尾各号30"→"3尾-5尾"
    if (raw.length === 2 && parseInt(raw, 10) >= 10 && parseInt(raw, 10) <= 49 && !expandAll) return m[0];
    // 长度 > 2 或非两位数号码的纯数字，展开为单个数字
    return digits.map(d => d + suffix).join('-');
  }
  // 有分隔符的情况，检查是否包含两位数号码（01-49）
  // 如 "47-6尾" 中的 "47" 是两位数号码，不应展开为 "4尾-7尾-6尾"
  // 但以0开头的两位数（如"04头"）是补零写法，应展开为"0头-4头"
  const twoDigitMatch = raw.match(/(?<!\d)(?:0[1-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9])(?!\d)/);
  if (twoDigitMatch && !twoDigitMatch[0].startsWith('0')) return m[0];
  return digits.map(d => d + suffix).join('-');
}

// 第13步：展开"123头/456尾"（按行处理，避免跨行或空格分隔的不同订单被误连）
function step_expandHeadTail(txt) {
  // 只允许不会误跨订单的分隔符：空格、Tab、-、.、·、/、\、|、～、+、*
  // 注意：不能加 \s（含\n），否则跨行抓取前一笔金额；不能加逗号，也会误抓前一笔
  const SEP = ' \t\\-\\.\\·\\/\\\\\\|～\\+\\*';
  const re1 = new RegExp('((?:\\d[' + SEP + ']*)+)头', 'g');
  const re2 = new RegExp('((?:\\d[' + SEP + ']*)+)尾', 'g');
  // 任何下注关键词（KW_LIST 全部词）都视为"每个号码都要下注"语义，
  // 触发两位数连写尾拆分（"35尾各号30"→"3尾-5尾"、"12尾各数30"→"1尾-2尾"等）
  const kwSorted = KW_LIST.filter(k => k).slice().sort((a, b) => b.length - a.length)
    .map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const expandAll = new RegExp(kwSorted.join('|')).test(txt);
  return txt.split('\n').map(line => {
    line = line.replace(re1, (m, digits) => _expand_ht([m, digits], '头', expandAll));
    line = line.replace(re2, (m, digits) => _expand_ht([m, digits], '尾', expandAll));
    return line;
  }).join('\n');
}

// ===== 复式相关常量 =====
const _FU_SHI_XIAO_ZODIAC = '牛虎蛇兔龙马羊猴鸡狗猪鼠';
const _FU_PREFIX_RE = '复(?:式|制|试|示|覆|復)?';  // "复"字前缀变体（与 step_restoreFuShiLianXiao 一致）
const _LIAN_COUNT_CHARS = '二三四五2345两';         // 连肖连数字符集（当前 2-5 连，扩展连数时在此添加）

// ===== 订单标记块内"玩法名 + 前置金额X"的解析常量 =====
const _OM_AMT_KW = '(?:每一组各|每组各|每注各|组各|各组|每一组|每组|每注|买|下|押|各)';
const _OM_SUFFIX = '[米元块角分厘眯咪井#快斤文蚊纹园圆]?';
const _OM_PLAY = '(?:(?:复制|复试|复[式制试示覆復]?)?(?:二中二|三中二|三中三|特碰|六肖中特|[二三四五2345两]连[肖尾]?(?:复[式制试示覆復]?)?|[0-9一二三四五六七八九十两]+不中))';

// 把"X有"归一为"X连肖"（口语写法，如"四有复试各20"=四连肖复式、"三有鼠牛虎"=三连肖）
// 必须在最前，"X有"口语写法归一，订单标记与普通输入都生效
function step_restoreYouSuffix(txt) {
  const Z = _FU_SHI_XIAO_ZODIAC;
  let result = txt;
  // 1) "X有 复试/复式" → "复式X连肖"（置于该转换的最前，让订单标记首行也能识别）
  result = result.replace(/([二三四五两2345])有\s*(复[式制试示覆復]?)/g, (m, n) => '复式' + n + '连肖');
  // 2) "X有 生肖串" → "X连肖 生肖串"（"有"后可跟任意标点/空格再接生肖，兼容"四有：XY""四有，XY各N"）
  //    用 SEP_CHARS 内部字符（去掉外层[]）构造，避免嵌套字符类；补充 · 间隔号
  const sep = SEP_CHARS.slice(1, -1) + '·';
  result = result.replace(new RegExp('([二三四五两2345])有(?=[' + sep + ']*[' + Z + '])', 'g'),
    (m, n) => n + '连肖');
  // 3) 订单标记"X有 组/组合" → "X连肖 "（组字转空格，作为分隔），如"四有组各25"=四连肖 各25。
  //    不能残留为"X连肖组"：连肖正则只认"X连肖"后面跟生肖/分隔/金额，"组"字会破坏匹配落到特肖。
  result = result.replace(/([二三四五两2345])有\s*组/g, (m, n) => n + '连肖 ');
  // 4) "X肖连中"/"X连中" → "X肖连"/"X连"：末尾"中"为口语冗余（如四肖连中=四肖连），
  //    归一并按连肖处理，避免"中"被误判成"四肖中特"等中特玩法
  result = result.replace(/([二三四五两2345])(肖)连中/g, (m, a, b) => a + b + '连');
  result = result.replace(/([二三四五两2345])连中/g, (m, n) => n + '连');
  return result;
}

// 拖式玩法名置尾 → 移到行首。
// 如 "11.21.41拖17.47二中二各组2米" → "二中二11.21.41拖17.47各组2米"
function step_dragPlayToFront(txt) {
  const _play = '[二三四五][中][二三四五]';
  const _amt = '\\s*(?:各组|每组各|每注各|各组各|各号|各|每注|每组)?'
    + '\\s*\\d+(?:\\.\\d+)?(?:[米元块角分厘眯咪井#快斤文蚊纹园圆])?';
  return txt.replace(
    new RegExp('^([\\d.\\-，、\\s]+?拖[\\d.\\-，、\\s]+)(' + _play + ')(' + _amt + ')\\s*$', 'gm'),
    (m, p1, p2, p3) => p2 + p1 + p3
  );
}

// 展开 --start--{...}--end-- 订单标记块：块内多行合并为一条订单。
// 普通块：如 --start--{\n虎兔 各 30\n龙马 各 40\n}--end--  →  虎兔 各 30 龙马 各 40
// 变通块（首行 = 玩法名 + 前置金额X，金额关键字与后缀均可变通）：
//   "复制五连 各组5\n羊虎猴鼠兔鸡"     → "复式五连 羊虎猴鼠兔鸡 各5"
//   "复式三中三 各2 36 16 35 51 41"  → "复式三中三 36 16 35 51 41 各2"
//   "三连肖各5\n蛇龙兔\n虎牛鼠\n马羊蛇" → 每行 → "三连肖蛇龙兔 各5\n三连肖虎牛鼠 各5\n..."
function step_expandOrderMarks(txt) {
  function _process(match, content) {
    const lines = content.split('\n').map(s => s.trim()).filter(s => s);
    if (!lines.length) return '';
    const first = lines[0];
    // 首行：玩法名 + 前置金额X(可选后缀) + 其余内容
    // 玩法名与金额间允许"复式变体/组/组合/分隔符"夹在中间，以支持"四连复试组各20"、"复制五连各组5"等变通写法
    const reFirst = new RegExp(
      '^(?<play>' + _OM_PLAY + ')'
      + '(?<sep>(?:(?:复[式制试示覆復]?|组|组合)|[^\\d\\u4e00-\\u9fa5])*)'
      + '(?:(?<kw>' + _OM_AMT_KW + ')\\s*(?<num>\\d+(?:\\.\\d+)?)' + _OM_SUFFIX + '\\s*)?'
      + '(?<rest>.*)$'
    );
    let fm = first.match(reFirst);
    let prefix = '';
    if (!fm) {
      // 首行玩法名前可能带前置前缀（如"新奥"标签/地区名），导致 ^ 锚定失败；
      // 退而搜索玩法名，前缀原样回拼，使"各组X移到行尾"逻辑照常生效。
      const rSearch = new RegExp(reFirst.source.replace(/^\^/, ''));
      const sm = first.match(rSearch);
      if (sm && sm.index > 0 && !/\d/.test(first.substring(0, sm.index)) && first.substring(0, sm.index).trim()) {
        prefix = first.substring(0, sm.index);
        fm = sm;
      }
    }
    const play = fm ? fm.groups.play : '';
    const num = fm ? fm.groups.num : '';
    if (!play || !num) return lines.join(' ');   // 非"前置金额"块：保持原合并
    const rest = ((fm.groups.rest) || '').trim();
    const tail = (rest + ' ' + lines.slice(1).join(' ')).trim();
    const playN = play.split('复制').join('复式').split('复试').join('复式');
    const isFu = playN.startsWith('复式');
    // 仅"连肖/连尾"是逐行一组的多组玩法；中X/特碰/不中/复式都合并为一条
    const isMultiGroup = (!isFu) && /^[二三四五2345两]+连[肖尾]$/.test(playN);
    if (isFu || !isMultiGroup) {
      // 复式或单组玩法：整块合并为一条（金额放末尾）
      const body = tail || rest;
      return (prefix + playN + ' ' + body + ' 各' + num).trim();
    }
    // 连肖/连尾：多行每行一组；仅单行则按一条
    if (lines.length > 1) {
      const parts = [];
      if (rest) parts.push(prefix + playN + rest + ' 各' + num);
      for (const ln of lines.slice(1)) parts.push(prefix + playN + ' ' + ln.trim() + ' 各' + num);
      return parts.join('\n');
    }
    return (prefix + playN + ' ' + tail + ' 各' + num).trim();
  }
  return txt.replace(/--start--\{([\s\S]*?)\}--end--/g, _process);
}

// 展开复式多连数写法，每连数一行后走单连数逻辑。覆盖三类：
//   A. 紧凑式（任意标点/复分隔）：龙蛇羊猪复3.4连各组200、龙蛇羊猪复2复3复4连各组200
//   B. 枚举式（连词/标点连接，末尾"连"可省略）：复试3连和复试4龙蛇羊猪各200
//   C. 连数段前置：复3.4连龙蛇羊猪各200、复3复4连龙蛇羊猪各200
// 只处理"含复/复式 + 多连数 + 连"结构；单连数（复3连）不匹配，走原逻辑。
function step_expandMultiLian(txt) {
  const fragRe = new RegExp(_FU_PREFIX_RE + '[' + _LIAN_COUNT_CHARS + '](?:连(?:肖)?)?', 'g');
  const sep = '(?:[^0-9\\u4e00-\\u9fff]+|' + _FU_PREFIX_RE + ')';
  const out = [];
  for (const line of txt.split('\n')) {
    const stripped = line.trim();
    // B：枚举式——行内多个"复(式)?N(连)?"片段（片段间任意连词/标点）
    const frags = [...stripped.matchAll(fragRe)];
    if (frags.length >= 2) {
      const prefix = stripped.substring(0, frags[0].index);
      const tail = stripped.substring(frags[frags.length - 1].index + frags[frags.length - 1][0].length);
      for (const f of frags) {
        let seg = f[0];
        if (!seg.endsWith('连')) seg += '连';   // "复试4" → "复试4连"
        out.push(prefix + seg + tail);
      }
      continue;
    }
    // A/C：紧凑式——连数段内任意标点或"复"分隔
    const m = stripped.match(new RegExp(
      '^(.+?)([' + _LIAN_COUNT_CHARS + '](?:' + sep + '[' + _LIAN_COUNT_CHARS + '])+)(连(?:肖)?)(.*)$'
    ));
    if (m && m[1].includes('复')) {
      const lians = m[2].match(new RegExp('[' + _LIAN_COUNT_CHARS + ']', 'g')) || [];
      if (lians.length >= 2) {
        for (const n of lians) out.push(m[1] + n + m[3] + m[4]);
        continue;
      }
    }
    out.push(line);
  }
  return out.join('\n');
}

// 把"复式X肖"归一为"复式X连肖"（如"复式五肖...各组5"→复式五连肖）。
// X=二三四五(两)/2-5，且紧后跟生肖串才转，避免误伤"平特肖"等带"肖"的玩法。
function step_restoreFuShiLianXiao(txt) {
  return txt.replace(
    new RegExp('(复制|复试|复[式制试示覆復]?)([二三四五两2345])肖(?=[' + _FU_SHI_XIAO_ZODIAC + '])', 'g'),
    (m, a, b) => a + b + '连肖'
  );
}

// 归一"每一个号码/每一个号/每一个" → "每号码/每号/每"。
// 须在 step_cnAmountToNum 之前执行：否则"一"会被转成数字"1"，
// "每一个号码"变成"每1个号码"，金额关键词"每一个号码"永远匹配不到。
function step_normalizeEveryAmount(txt) {
  let result = txt;
  result = result.replace(/每一个号码/g, '每号码');
  result = result.replace(/每一个号/g, '每号');
  result = result.replace(/每一个/g, '每');
  return result;
}

// 中文数字金额转换为阿拉伯数字。
// 1) 后跟金额单位词："五十块"→"50"、"一千二块"→"1200"、"十块钱"→"10"。
// 2) 前置金额关键词："每组三十"→"每组30"、"各五十"→"各50"、"下三十"→"下30"。
// 排除玩法名中的中文数字（如"买二中二""六肖中特"不转换）。
function step_cnAmountToNum(txt) {
  const cn = '[一二三四五六七八九十百千两万〇零]';
  const units = '块|元|米|文|蚊|纹|园|圆|角|分|厘|钱|塊|圓';
  const kwPre = '(?:每组|每注|每|各|下|买|押|投|打|注|名|组)';
  const playGuard = '(?!中|连|肖|尾|碰|不|拖|托|码|特)';
  let result = txt;
  result = result.replace(new RegExp('(' + cn + '+)(?:' + units + ')', 'g'),
    (matched, p1, offset, whole) => {
      // 前面是数字/分隔符时补空格，防止"01五十米"粘连成"0150"
      const before = offset > 0 ? whole[offset - 1] : '';
      const sep = (before && (/\d/.test(before) || '.-/'.includes(before))) ? ' ' : '';
      return sep + Math.trunc(toNum(p1));
    });
  result = result.replace(new RegExp(kwPre + '(' + cn + '+' + ')' + playGuard, 'g'),
    (matched, p1) => matched.substring(0, matched.length - p1.length) + Math.trunc(toNum(p1)));
  return result;
}

// 把只含号码的续行并入上一行（玩法/金额与号码分行书写）。
// 如"复式三中三 每组三十\n36 16 35 15 31 41" →
//   "复式三中三 每组30 36 16 35 15 31 41"（后续 moveGroup 再移到行尾）。
// 只合并"至少2个号码"的纯数字行，避免误吞"40"等合计行。
function step_joinContinuationNumbers(txt) {
  const playRe = /(特码|特肖|平特肖|平码|平特尾|六肖中特|6肖中特|六肖|6肖|二中二|三中二|三中三|特碰|连肖|连尾|不中|包|复式|复[式试]|数尾|尾)/;
  const numOnlyRe = new RegExp('^(?:\\d{1,2}(?:' + SEP_CHARS + '+\\d{1,2})+)(?!' + SEP_CHARS + '*\\d)$');
  const result = [];
  for (const line of txt.split('\n')) {
    const stripped = line.trim();
    if (!stripped) { result.push(line); continue; }
    if (numOnlyRe.test(stripped) && result.length) {
      const prev = result[result.length - 1].trim();
      if (prev && playRe.test(prev)) {
        result[result.length - 1] = prev + ' ' + stripped;
        continue;
      }
    }
    result.push(line);
  }
  return result.join('\n');
}

// 把"每组X/每注X"等前置的每注金额移到行尾并转为"各X"。
// 如"复式五连 每组5 羊虎猴鼠兔鸡" → "复式五连 羊虎猴鼠兔鸡 各5"；
//    "复式三中三 每组2 36 16 35 15 31 41" → "复式三中三 36 16 35 15 31 41 各2"。
// 若"每组X"后面还跟着另一注（含自己的金额关键字+金额），则拆成两行。
// 注意："复式+玩法名+每组X"写法不支持识别，直接跳过该行不做转换。
function step_moveGroupAmtToEnd(txt) {
  const groupRe = /(每组各|每注各|每一组|每组|每注)\s*(\d+(?:\.\d+)?)/;
  const needMarkRe = new RegExp(
    '复[式制试示覆復]?\\s*'
    + '(?:二中二|三中二|三中三|特碰|[二三四五2345两]连[肖尾]?)'
    + '[^，。；;\\n]*?'
    + '(?:每组各|每注各|每一组|每组|每注)\\s*\\d+(?:\\.\\d+)?');
  // 金额关键字+金额：用于判断"每组X"后面是否还有独立的一注
  const amtKws = KW_LIST.filter(k => k).slice().sort((a, b) => b.length - a.length)
    .map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const amtRe = new RegExp('(?:' + amtKws + ')\\s*\\d+(?:\\.\\d+)?');
  const result = [];
  for (const line of txt.split('\n')) {
    if (needMarkRe.test(line)) { result.push(line); continue; }
    const m = line.match(groupRe);
    if (m) {
      const head = line.substring(0, m.index).replace(/\s+$/, '');
      const tail = line.substring(m.index + m[0].length).trim();
      if (head || tail) {
        if (head && tail && amtRe.test(tail)) {
          result.push((head + ' 各' + m[2]).trim());
          result.push(tail);
          continue;
        }
        result.push((head + ' ' + tail + ' 各' + m[2]).trim());
        continue;
      }
    }
    result.push(line);
  }
  return result.join('\n');
}

// 行首"生肖串+连肖玩法"调整顺序为"玩法+生肖串"。
// 如"龙虎鼠三连肖 五十块" → "三连肖龙虎鼠 五十块"。
// 只处理行首生肖在前的连肖写法，避免影响"平特肖""六肖中特"等其它格式。
function step_zodiacBeforePlay(txt) {
  const Z = '鼠牛虎兔龙蛇马羊猴𤠣鸡狗猪';
  let result = txt;
  // 无复式前缀：生肖串 + 数字连肖  →  数字连肖 + 生肖串
  result = result.replace(
    new RegExp('^([' + Z + ']{2,})\\s*([二三四五2345两])(?:连肖|连[肖尾]?)\\s*', 'gmu'),
    (m, z, n) => n + '连肖' + z + ' ');
  // 复式前缀：复式 + 生肖串 + 数字连肖  →  复式 + 数字连肖 + 生肖串
  // 如"复式羊马蛇二连各100" → "复式二连羊马蛇各100"
  result = result.replace(
    new RegExp('^((?:复[式制试示覆復]?|复制|复试))\\s*([' + Z + ']{2,})\\s*([二三四五2345两])(?:连肖|连[肖尾]?)\\s*', 'gmu'),
    (m, fu, z, n) => fu + n + '连肖' + z + ' ');
  // 生肖在前 + 平特肖（"平特一肖"已被归一为"平特肖"）：如"龙鼠平特肖各100" → "平特肖龙鼠各100"
  result = result.replace(
    new RegExp('^([' + Z + ']{2,})\\s*(平特肖|平肖|平码肖)\\s*', 'gmu'),
    (m, z, play) => play + z + ' ');
  return result;
}

// ===== 批量模式展开（仅保留平特肖批量模式） =====
// 连肖批量模式（"五连" / "五连肖鸡牛兔虎龙" + 生肖行 + 金额行）已移除：
// 跨行组合必须先点订单标记（--start--{...}--end--）才会被识别，未点标记时逐行独立识别，
// 避免输入被自动展开成多条订单（用户要求 2026-09-24）。
function expandBatchMode(text) {
  if (!text || !text.trim()) return text;
  // 统一换行符（PyQt selectedText 使用 \u2029）
  text = text.replace(/\u2029/g, '\n');
  const lines = text.split('\n');
  const lineCount = lines.length;
  const ZODIAC_SET = '鼠牛虎兔龙蛇马羊猴𤠣鸡狗猪';
  const PINTE_PLAYS = new Set(['平特一肖', '平特肖', '平肖', '平码肖', '一肖', '独肖']);
  for (let i = 0; i < lineCount; i++) {
    const stripped = lines[i].trim();
    if (!stripped) continue;
    if (PINTE_PLAYS.has(stripped)) {
      // 平特肖批量模式：后续每行是单个生肖+金额（如"蛇，200米"）
      const dataLines = [];
      for (let j = i + 1; j < lineCount; j++) {
        const nextStripped = lines[j].trim();
        if (!nextStripped) continue;
        const zodiacAmtMatch = nextStripped.match(
          new RegExp('^([' + ZODIAC_SET + '])[，,、\\s]*(\\d+)(?:米|元|块|角|分|厘)?\\s*$', 'u')
        );
        if (zodiacAmtMatch) dataLines.push([j, zodiacAmtMatch[1], zodiacAmtMatch[2]]);
        else break;
      }
      if (dataLines.length) {
        const expandedLines = [];
        for (let k = 0; k < lineCount; k++) {
          if (k === i) continue; // 跳过声明行
          const dl = dataLines.find(d => d[0] === k);
          if (dl) expandedLines.push('平特肖' + dl[1] + '各' + dl[2]);
          else expandedLines.push(lines[k]);
        }
        return expandedLines.join('\n');
      }
      continue;
    }
  }
  return text;
}

// 展开 --order--{...}--order-- 玩法继承块，处理玩法名继承。
// 块内第一条有玩法名的行，后续行自动继承该玩法名。
// 如：--order--{\n二中二\n牛拖虎各10\n}--order--  → 二中二\n二中二牛拖虎各10
function step_expandMarks(txt) {
  function _expand(match, content) {
    content = expandBatchMode(content);
    const lines = content.split('\n');
    let inherited = null;
    const result = [];
    for (let line of lines) {
      line = line.trim();
      if (!line) continue;
      // 归一错别字后再判断玩法名（复制/复试→复式），行内容原样保留
      const pm = applyTypoMap(line).match(playNameRe);
      if (pm) {
        inherited = pm[1];
        result.push(line);
      } else if (inherited) {
        result.push(inherited + line);
      } else {
        result.push(line);
      }
    }
    return result.join('\n');
  }
  return txt.replace(/--order--\{([\s\S]*?)\}--order--/g, _expand);
}
const playNameRe = (function() {
  const CN_NUMS = ['', '', '二', '三', '四', '五'];
  const patterns = [];
  for (const name of PLAY_NAMES_LIST) {
    patterns.push(name);
    for (let i = 2; i <= 5; i++) {
      patterns.push(i + name);
      patterns.push(CN_NUMS[i] + name);
    }
  }
  // 复式前缀
  const extra = [];
  for (const p of patterns) extra.push('复式' + p);
  patterns.push(...extra);
  // "复式X连/复式X连尾"等写法（无"肖/尾"后缀，如"复式五连 羊虎猴鼠兔鸡 各5"）
  for (let i = 2; i <= 5; i++) {
    for (const suffix of ['连', '连尾']) {
      patterns.push('复式' + i + suffix);
      patterns.push('复式' + CN_NUMS[i] + suffix);
    }
  }
  patterns.sort((a, b) => b.length - a.length);
  return new RegExp('(' + patterns.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')');
})();

// 预处理管道（步序与 Python 版 preprocessPipeline 完全一致）
const preprocessPipeline = [
  step_restoreYouSuffix,   // 必须在最前，"X有"口语写法归一，订单标记与普通输入都生效
  step_dragPlayToFront,    // 拖式玩法名置尾移到行首（"…拖…二中二各组X"）
  step_expandMarks,        // 必须在最前面，展开玩法继承块（--order--{}--order--）
  step_expandOrderMarks,   // 订单标记块合并为一条订单（--start--{}--end--）
  step_convertFullWidth,
  step_fixTypos,
  step_expandMultiLian,    // "复式多连数"（复3.4连各组200）→ 每连数一行，须在 restore 之前
  step_restoreFuShiLianXiao, // "复式X肖"→"复式X连肖"
  step_stripTotalSuffix,   // 剥离行尾汇总确认后缀（共40、合计40等）
  step_normalizeEveryAmount, // "每一个号码"→"每号码"等，须在 cnAmountToNum 之前
  step_cnAmountToNum,      // 中文数字金额（五十块等）转阿拉伯数字
  step_normalizeDash,      // 将数字间的'一'转为'-'，必须在 expandInlinePairs 之前
  step_expandInlinePairs,  // 必须在 step_stripAmountSuffix 之前
  step_removePlayPunctuation,
  step_expandLianXiaoGroups, // 同行连肖多组拆分（只处理连肖，不处理连尾）
  step_expandPingmaContent,  // 必须在 step_removePlayPunctuation 之后
  step_stripAmountSuffix,
  step_handleChinesePunctuation,
  step_cleanSpecialChars,
  step_collapseSpaces,
  step_joinContinuationNumbers, // 只含号码的续行并入上一行（须在 moveGroup 之前）
  step_moveGroupAmtToEnd,  // "每组X/每注X"前置金额移到行尾
  step_zodiacBeforePlay,   // 行首生肖在前的连肖写法调整顺序
  step_expandHeadTail,
];

// ===== 主预处理函数 =====
function preprocess(txt) {
  let result = expandBatchMode(txt);  // 先展开批量模式（平特一肖 + 生肖+金额行等）
  for (const step of preprocessPipeline) {
    result = step(result);
  }
  return result.trim();
}

// =============================================================================
// 正则常量（定义在 dictionary.js 中，此处引用）
// =============================================================================

// 拖码支持的属性分类（用于二中二拖、特碰碰等）
const ATTR_KEYS = [
  '红波', '蓝波', '绿波', '红单', '红双', '蓝单', '蓝双', '绿单', '绿双',
  '红大', '红小', '蓝大', '蓝小', '绿大', '绿小',
  '家禽', '野兽',
  '单', '双', '大', '小',
  '金', '木', '水', '火', '土',
];
const ATTR_KEYS_SORTED = [...ATTR_KEYS].sort((a, b) => b.length - a.length);
const ATTR_RE = ATTR_KEYS_SORTED.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');

// =============================================================================
// 辅助函数
// =============================================================================

// 将混合项转号码集合
function _items_to_nums(items) {
  const nums = [];
  const ZODIAC_SET = '鼠牛虎兔龙蛇马羊猴鸡狗猪';
  for (const item of items) {
    if (new RegExp('^[' + ZODIAC_SET + ']+$').test(item)) {
      for (const ch of item) {
        if (ZODIAC_NUMS[ch]) nums.push(...ZODIAC_NUMS[ch].split(/[\s,，]+/));
      }
    } else if (/^\d+尾$/.test(item)) {
      const d = item.replace('尾', '');
      if (D[d + '尾']) nums.push(...D[d + '尾'].split(/[\s,，]+/));
    } else if (ATTR_KEYS.includes(item) && keyToAllNums(item).length) {
      nums.push(...keyToAllNums(item));
    } else if (/^\d{1,2}$/.test(item) && parseInt(item) >= 1 && parseInt(item) <= 49) {
      nums.push(String(parseInt(item)).padStart(2, '0'));
    }
  }
  return [...new Set(nums)].sort((a, b) => parseInt(a) - parseInt(b));
}

// 检测连肖中是否有重复生肖
function _check_dup_in_chars(chars, playName, warnings) {
  const seen = new Set();
  const dups = [];
  for (const ch of chars) {
    if (seen.has(ch)) { if (!dups.includes(ch)) dups.push(ch); }
    seen.add(ch);
  }
  if (dups.length) {
    warnings.push(playName + '中存在重复生肖' + dups.join('、') + '，请检查');
    return true;
  }
  return false;
}

// 检测连尾中是否有重复尾数
function _check_dup_in_tails(digits, playName, warnings) {
  const seen = new Set();
  const dups = [];
  for (const d of digits) {
    if (seen.has(d)) { if (!dups.includes(d)) dups.push(d); }
    seen.add(d);
  }
  if (dups.length) {
    warnings.push(playName + '中存在重复尾数' + dups.join('、') + '尾，请检查');
    return true;
  }
  return false;
}

// 展开连写生肖（如"牛马" → ["牛","马"]）
function _expand_zodiac(items) {
  const ZODIAC_SET = '鼠牛虎兔龙蛇马羊猴鸡狗猪';
  const result = [];
  for (const item of items) {
    if (item.split('').every(ch => ZODIAC_SET.includes(ch)) && item.length > 1) {
      result.push(...item.split(''));
    } else {
      result.push(item);
    }
  }
  return result;
}

// 拖匹配通用impl
function _handle_drag_match_impl(leftPart, rightPart, amt, kw, catName) {
  const leftItems = leftPart.split(new RegExp(SEP_CHARS + '+')).filter(s => s.trim());
  const rightItems = rightPart.split(new RegExp(SEP_CHARS + '+')).filter(s => s.trim());
  if (leftItems.length === 0 || rightItems.length === 0) return null;
  const leftNums = _items_to_nums(_expand_zodiac(leftItems));
  const rightNums = _items_to_nums(_expand_zodiac(rightItems));
  if (leftNums.length === 0 || rightNums.length === 0) return null;
  const pairs = [];
  for (const a of leftNums) {
    for (const b of rightNums) {
      if (a !== b) pairs.push(a + '-' + b);
    }
  }
  if (pairs.length === 0) return null;
  const warnings = [];
  if (pairs.length > 1 && !kw) warnings.push('这行没有写关键词和金额，请在号码后面加上"各/各号+金额"');
  return { cat: catName || '二中二', nums: pairs, amt, cnt: pairs.length, total: amt * pairs.length, kw, warnings };
}

// 拖匹配（二中二/特碰）
function _drag_helper(leftPart, rightPart, amt, kw, catName) {
  return _handle_drag_match_impl(leftPart, rightPart, amt, kw, catName);
}

// 三中三双拖
function _drag_helper_szz_double(leftPart, midPart, rightPart, amt, kw) {
  const leftItems = leftPart.split(new RegExp(SEP_CHARS + '+')).filter(s => s.trim());
  const midItems = midPart.split(new RegExp(SEP_CHARS + '+')).filter(s => s.trim());
  const rightItems = rightPart.split(new RegExp(SEP_CHARS + '+')).filter(s => s.trim());
  if (leftItems.length === 0 || midItems.length === 0 || rightItems.length === 0) return null;
  const leftNums = _items_to_nums(_expand_zodiac(leftItems));
  const midNums = _items_to_nums(_expand_zodiac(midItems));
  const rightNums = _items_to_nums(_expand_zodiac(rightItems));
  if (leftNums.length === 0 || midNums.length === 0 || rightNums.length === 0) return null;
  const triples = [];
  for (const a of leftNums) {
    for (const b of midNums) {
      for (const c of rightNums) {
        if (a !== b && a !== c && b !== c) {
          triples.push([a, b, c].sort((x, y) => parseInt(x) - parseInt(y)).join('-'));
        }
      }
    }
  }
  if (triples.length === 0) return null;
  const warnings = [];
  const uniqueTriples = [...new Set(triples)];
  if (uniqueTriples.length > 1 && !kw) warnings.push('这行没有写关键词和金额，请在号码后面加上"各/各号+金额"');
  return { cat: '三中三', nums: uniqueTriples, amt, cnt: uniqueTriples.length, total: amt * uniqueTriples.length, kw, warnings };
}

// 全局文本变量（用于text_after）
let _text_global = '';

// 匹配后剩余文本
function text_after(m) {
  return _text_global.substring(m.index + m[0].length);
}



// =============================================================================
// 收集特殊匹配（增强版，移植自Python parser.py）
// =============================================================================
function collectSpecialMatches(text) {
  _text_global = text;
  const Z = ZODIAC;
  const allMatches = [];

  function isOverlap(start, end, intervals) {
    return intervals.some(iv => start < iv.end && end > iv.start);
  }

  const multiMatches = [];
  const lockedIntervals = [];

  // ===== 修复6：连肖无关键字整行及带关键字版本 (优先级最高) =====
  const reLianXiaoNoKw = new RegExp(
    '^[\\s]*((?:[' + Z + ']+))[\\s]*([二三四五2345两])' +
    '(?:连肖|连[肖]?|肖连|肖全中|连?肖|肖中|连)' +
    '[\\s]*(?:(' + KW_GROUP + ')\\s*)?(' + AMT_GROUP + ')\\s*$',
    'gm'
  );
  let mLX;
  while ((mLX = reLianXiaoNoKw.exec(text)) !== null) {
    const zPart = mLX[1];
    const k = toNum(mLX[2].replace(/[^0-9二三四五两]/g, ''));
    if (!k || k < 2 || k > 5) continue;
    const kw = mLX[4] || '';
    const amt = toNum(mLX[5] || mLX[6]);
    if (!amt || amt <= 0) continue;
    const zChars = (zPart.match(new RegExp('[' + Z + ']', 'g')) || []).join('');
    if (zChars.length !== k) {
      const warnings = [k + '连肖指定了' + k + '个生肖，但实际输入了' + zChars.length + '个（' + zChars + '），请检查'];
      multiMatches.push({ start: mLX.index, end: mLX.index + mLX[0].length, result: { cat: k + '连肖', nums: [], amt, cnt: 0, total: 0, kw: kw || '各组', warnings } });
      lockedIntervals.push({ start: mLX.index, end: mLX.index + mLX[0].length });
      continue;
    }
    const warnings = [];
    if (_check_dup_in_chars(zChars, '连肖', warnings)) {
      multiMatches.push({ start: mLX.index, end: mLX.index + mLX[0].length, result: { cat: k + '连肖', nums: [], amt, cnt: 0, total: 0, kw: kw || '各组', warnings } });
      lockedIntervals.push({ start: mLX.index, end: mLX.index + mLX[0].length });
      continue;
    }
    const comb = zCombosKeepOrder(zChars, k);
    if (!kw && comb.length > 1) warnings.push('这行没有写关键词和金额，请在号码后面加上"各/各号+金额"');
    multiMatches.push({ start: mLX.index, end: mLX.index + mLX[0].length, result: { cat: k + '连肖', nums: comb, amt, cnt: comb.length, total: amt * comb.length, kw: kw || '各组', warnings } });
    lockedIntervals.push({ start: mLX.index, end: mLX.index + mLX[0].length });
  }

  // ===== 修复6补：玩法在前，生肖在后的无关键字连肖 =====
  const reLianXiaoNoKw2 = new RegExp(
    '^' + SEP + '([二三四五2345两])' +
    '(?:连肖|连[肖]?|肖连|肖全中|连?肖|肖中|连)' +
    SEP_CHARS + '*((?:[' + Z + ']+))' + SEP_CHARS + '*' + SEP +
    '(?:(' + KW_GROUP + ')' + SEP + ')?(' + AMT_GROUP + ')' + SEP + '$',
    'gm'
  );
  let mLX2;
  while ((mLX2 = reLianXiaoNoKw2.exec(text)) !== null) {
    if (isOverlap(mLX2.index, mLX2.index + mLX2[0].length, lockedIntervals)) continue;
    const k = toNum(mLX2[1].replace(/[^0-9二三四五两]/g, ''));
    if (!k || k < 2 || k > 5) continue;
    const zPart = mLX2[2];
    const kw = mLX2[4] || '各组';
    const amt = toNum(mLX2[5] || mLX2[6]);
    if (!amt || amt <= 0) continue;
    const zChars = (zPart.match(new RegExp('[' + Z + ']', 'g')) || []).join('');
    if (zChars.length !== k) {
      const warnings = [k + '连肖指定了' + k + '个生肖，但实际输入了' + zChars.length + '个（' + zChars + '），请检查'];
      multiMatches.push({ start: mLX2.index, end: mLX2.index + mLX2[0].length, result: { cat: k + '连肖', nums: [], amt, cnt: 0, total: 0, kw: '', warnings } });
      lockedIntervals.push({ start: mLX2.index, end: mLX2.index + mLX2[0].length });
      continue;
    }
    const comb = zCombosKeepOrder(zChars, k);
    const warnings = [];
    if (_check_dup_in_chars(zChars, '连肖', warnings)) {
      multiMatches.push({ start: mLX2.index, end: mLX2.index + mLX2[0].length, result: { cat: k + '连肖', nums: [], amt, cnt: 0, total: 0, kw: kw, warnings } });
      lockedIntervals.push({ start: mLX2.index, end: mLX2.index + mLX2[0].length });
      continue;
    }
    if (comb.length > 1) warnings.push('这行没有写关键词和金额，请在号码后面加上"各/各号+金额"');
    multiMatches.push({ start: mLX2.index, end: mLX2.index + mLX2[0].length, result: { cat: k + '连肖', nums: comb, amt, cnt: comb.length, total: amt * comb.length, kw: kw, warnings } });
    lockedIntervals.push({ start: mLX2.index, end: mLX2.index + mLX2[0].length });
  }

  // ===== 修复6补：第二种变体（带斜杠） =====
  const reLianXiaoNoKw3 = new RegExp(
    '^[\\s]*([二三四五2345两])(?:连肖|连[肖]?|肖连|肖全中|连?肖|肖中|连)' +
    '[\\s，,]*((?:[' + Z + ']+))[\\s]*[\\/]?' +
    '[\\s]*(?:(' + KW_GROUP + ')\\s*)?(' + AMT_GROUP + ')\\s*$',
    'gm'
  );
  let mLX3;
  while ((mLX3 = reLianXiaoNoKw3.exec(text)) !== null) {
    if (isOverlap(mLX3.index, mLX3.index + mLX3[0].length, lockedIntervals)) continue;
    const k = toNum(mLX3[1].replace(/[^0-9二三四五两]/g, ''));
    if (!k || k < 2 || k > 5) continue;
    const zPart = mLX3[2];
    const kw = mLX3[4] || '';
    const amt = toNum(mLX3[5] || mLX3[6]);
    if (!amt || amt <= 0) continue;
    const zChars = (zPart.match(new RegExp('[' + Z + ']', 'g')) || []).join('');
    if (zChars.length !== k) {
      const warnings = [k + '连肖指定了' + k + '个生肖，但实际输入了' + zChars.length + '个（' + zChars + '），请检查'];
      multiMatches.push({ start: mLX3.index, end: mLX3.index + mLX3[0].length, result: { cat: k + '连肖', nums: [], amt, cnt: 0, total: 0, kw: '', warnings } });
      lockedIntervals.push({ start: mLX3.index, end: mLX3.index + mLX3[0].length });
      continue;
    }
    const comb = zCombosKeepOrder(zChars, k);
    const warnings = [];
    if (_check_dup_in_chars(zChars, '连肖', warnings)) {
      multiMatches.push({ start: mLX3.index, end: mLX3.index + mLX3[0].length, result: { cat: k + '连肖', nums: [], amt, cnt: 0, total: 0, kw: kw, warnings } });
      lockedIntervals.push({ start: mLX3.index, end: mLX3.index + mLX3[0].length });
      continue;
    }
    if (comb.length > 1) warnings.push('这行没有写关键词和金额，请在号码后面加上"各/各号+金额"');
    multiMatches.push({ start: mLX3.index, end: mLX3.index + mLX3[0].length, result: { cat: k + '连肖', nums: comb, amt, cnt: comb.length, total: amt * comb.length, kw: kw, warnings } });
    lockedIntervals.push({ start: mLX3.index, end: mLX3.index + mLX3[0].length });
  }

  // ===== 多组连肖 =====
  const reMultiLX = new RegExp(
    '([二三四五2345两])(?:连肖|连[肖]?|肖连|肖全中|连?肖|肖中|连)' +
    SEP + '((?:[' + Z + ']+' + SEP_CHARS + '+)+[' + Z + ']+)' +
    '[\\s]*(?=' + KW_GROUP + ')' + KW_GROUP + SEP + AMT_GROUP,
    'g'
  );
  let mMultiLX;
  while ((mMultiLX = reMultiLX.exec(text)) !== null) {
    if (isOverlap(mMultiLX.index, mMultiLX.index + mMultiLX[0].length, lockedIntervals)) continue;
    const full = mMultiLX[0];
    const { amt, kw } = extractAmtAndKw(full);
    if (!amt || amt <= 0) continue;
    const k = toNum(mMultiLX[1].replace(/[^0-9二三四五两]/g, ''));
    if (!k || k < 2 || k > 5) continue;
    const zPart = mMultiLX[2];
    const groups = zPart.split(new RegExp(SEP_CHARS + '+')).filter(g => g.trim().length >= k);
    if (groups.length <= 1) continue;
    const allCombos = [];
    const warnings = [];
    const invalidGroups = [];
    for (const zg of groups) {
      const zChars = zg.trim();
      if (zChars.length === k) {
        if (_check_dup_in_chars(zChars, '连肖', warnings)) continue;
        allCombos.push(...zCombosKeepOrder(zChars, k));
      } else {
        invalidGroups.push(zChars);
      }
    }
    for (const zs of invalidGroups) {
      warnings.push(k + '连肖指定了' + k + '个生肖，但实际输入了' + zs.length + '个（' + zs + '），请检查');
    }
    if (allCombos.length === 0) continue;
    if (allCombos.length > 1 && !kw) warnings.push('这行没有写关键词和金额，请在号码后面加上"各/各号+金额"');
    multiMatches.push({
      start: mMultiLX.index, end: mMultiLX.index + mMultiLX[0].length,
      result: { cat: k + '连肖', nums: allCombos, amt, cnt: allCombos.length, total: amt * allCombos.length, kw, warnings }
    });
    lockedIntervals.push({ start: mMultiLX.index, end: mMultiLX.index + mMultiLX[0].length });
  }

  // ===== 多组连尾 =====
  const reMultiLW = new RegExp(
    '([二三四五2345])(?:连尾|尾连)' +
    SEP + '((?:\\d+尾?' + SEP_CHARS + '*)+)' +
    '[\\s]*(?=' + KW_GROUP + ')' + KW_GROUP + SEP + AMT_GROUP,
    'g'
  );
  let mMultiLW;
  while ((mMultiLW = reMultiLW.exec(text)) !== null) {
    if (isOverlap(mMultiLW.index, mMultiLW.index + mMultiLW[0].length, lockedIntervals)) continue;
    const full = mMultiLW[0];
    const { amt, kw } = extractAmtAndKw(full);
    if (!amt || amt <= 0) continue;
    const k = toNum(mMultiLW[1]);
    if (!k || k < 2 || k > 5) continue;
    const tailPart = mMultiLW[2];
    const groups = tailPart.split(new RegExp(SEP_CHARS + '+')).filter(g => g.trim().length > 0);
    if (groups.length <= 1) continue;
    const warnings = [];
    const allCombos = [];
    const invalidGroups = [];
    for (const g of groups) {
      const digits = (g.match(/\d/g) || []);
      if (digits.length === k) {
        if (_check_dup_in_tails(digits, '连尾', warnings)) continue;
        allCombos.push(...tailCKeepOrder(digits.join(','), k));
      } else {
        invalidGroups.push(g.trim());
      }
    }
    for (const ig of invalidGroups) {
      const igDigits = (ig.match(/\d/g) || []);
      warnings.push(k + '连尾指定了' + k + '个尾数，但实际输入了' + igDigits.length + '个（' + ig + '），请检查');
    }
    if (allCombos.length === 0) continue;
    if (allCombos.length > 1 && !kw) warnings.push('这行没有写关键词和金额，请在号码后面加上"各/各号+金额"');
    multiMatches.push({
      start: mMultiLW.index, end: mMultiLW.index + mMultiLW[0].length,
      result: { cat: k + '连尾', nums: allCombos, amt, cnt: allCombos.length, total: amt * allCombos.length, kw, warnings }
    });
    lockedIntervals.push({ start: mMultiLW.index, end: mMultiLW.index + mMultiLW[0].length });
  }

  // ===== 通用正则匹配 =====
  function addMatch(pattern, handler) {
    let m;
    while ((m = pattern.exec(text)) !== null) {
      if (isOverlap(m.index, m.index + m[0].length, lockedIntervals)) continue;
      const info = handler(m);
      if (info) {
        if (Array.isArray(info)) {
          for (const item of info) {
            if (item) {
              const s = item._start !== undefined ? item._start : m.index;
              const e = item._end !== undefined ? item._end : m.index + m[0].length;
              delete item._start;
              delete item._end;
              allMatches.push({ start: s, end: e, result: item });
              lockedIntervals.push({ start: s, end: e });
            }
          }
        } else {
          allMatches.push({ start: m.index, end: m.index + m[0].length, result: info });
          lockedIntervals.push({ start: m.index, end: m.index + m[0].length });
        }
      }
    }
  }

  // ===== 六肖中特 / 6肖中特（玩法名 + 六肖 + 金额；金额词 买/下/押，不允许各） =====
  const LX_PLAY_RE = '(?:六|6)肖(?:中特|中)?';
  const LX_ZODIAC = '((?:[' + Z + ']){6})';
  const LX_AMT = SEP + '(?:(买|下|押)' + SEP + ')?(' + AMT_RE_STR + ')' + SEP + '$';
  // 玩法名在前：六肖中特 牛马羊鸡狗猪 买100
  addMatch(new RegExp('^' + SEP + LX_PLAY_RE + SEP + LX_ZODIAC + LX_AMT, 'gm'),
    function(m) { return _h_liuXiao(m, 'front'); }
  );
  // 玩法名在后：牛马羊鸡狗猪 六肖中特 买100 / 牛马鸡猪狗猴六肖100
  addMatch(new RegExp('^' + SEP + LX_ZODIAC + SEP + LX_PLAY_RE + LX_AMT, 'gm'),
    function(m) { return _h_liuXiao(m, 'back'); }
  );
  // 六肖中特 catch-all：玩法名 + 非六肖或带"各" → 报错（提示不能用各）
  addMatch(new RegExp(LX_PLAY_RE + SEP + '(.+)$', 'gm'),
    function(m) {
      if (m[1].indexOf('各') >= 0 ||
          !new RegExp('^((?:[' + Z + ']){6})\\s*(?:买|下|押)?\\s*\\d').test(m[1])) {
        return { cat: '__unrecognized__', nums: [], amt: 0, cnt: 0, total: 0, kw: '',
          warnings: ['6肖中特需要写6个生肖，且不能用"各"关键字，如"6肖中特牛马羊鸡狗猪买100"'],
          rawLine: m[0].trim() };
      }
      return null;
    }
  );

  // ===== 特肖 =====
  addMatch(new RegExp('特肖' + SEP + '((?:[' + Z + ']+' + SEP_CHARS + '*)+?)' + SEP + END_AMT_RE, 'g'),
    function(m) { return _h_teXiao(m, Z, SEP_CHARS, END_AMT_RE); }
  );

  // 特肖catch-all
  addMatch(new RegExp('特肖' + SEP + '(.+)$', 'g'),
    function(m) { return _catchall_teXiao(m, Z); }
  );

  // ===== 包玩法 =====
  const BAO_ATTRS = ['红波', '蓝波', '绿波', '红单', '红双', '蓝单', '蓝双', '绿单', '绿双',
    '红大', '红小', '蓝大', '蓝小', '绿大', '绿小', '单', '双', '大', '小', '家禽', '野兽'];
  const BAO_ATTRS_SORTED = [...BAO_ATTRS].sort((a, b) => b.length - a.length);
  addMatch(new RegExp('包' + SEP + '(' + BAO_ATTRS_SORTED.join('|') + ')' + SEP + '(\\d+)', 'g'),
    function(m) { return _h_bao(m); }
  );

  // ===== 简写特肖/特码：单个生肖+金额 =====
  // 分隔符为"="时走特码（鼠=20→特码鼠各20），否则走特肖（鼠20→特肖鼠各20）
  addMatch(new RegExp('^' + SEP + '([' + Z + '])' + SEP + '(\\d+)' + SEP + '$', 'gm'),
    function(m) {
      const fullText = m[0];
      if (fullText.includes('=') || fullText.includes('＝')) {
        const zodiac = m[1];
        const amt = toNum(m[2]);
        const nums = ZODIAC_NUMS[zodiac] ? ZODIAC_NUMS[zodiac].split(/[\s,，]+/) : [];
        return { cat: '特码', nums: [zodiac], amt, cnt: nums.length, total: amt * nums.length, kw: '=', warnings: [] };
      }
      return { cat: '特肖', nums: [m[1]], amt: toNum(m[2]), cnt: 1, total: toNum(m[2]), kw: '各', warnings: [] };
    }
  );

  // ===== 简写生肖+玩法名+金额（如"虎平特100"） =====
  addMatch(new RegExp('^' + SEP + '([' + Z + ']+)' + SEP + '(平特(?:肖)?|平码|特肖)' + SEP + '(\\d+)' + SEP + '$', 'gm'),
    function(m) { return _h_sheng_play_short(m); }
  );

  // ===== 简写包玩法 =====
  const BAO_SHORT_MAP = {
    '红波': '红波', '蓝波': '蓝波', '兰波': '蓝波', '绿波': '绿波',
    '红单': '红单', '红双': '红双', '蓝单': '蓝单', '蓝双': '蓝双',
    '兰单': '蓝单', '兰双': '蓝双', '兰波单': '蓝单', '兰波双': '蓝双',
    '绿单': '绿单', '绿双': '绿双',
    '红大': '红大', '红小': '红小', '蓝大': '蓝大', '蓝小': '蓝小',
    '绿大': '绿大', '绿小': '绿小',
    '单': '单', '双': '双', '大': '大', '小': '小',
    '家禽': '家禽', '野兽': '野兽',
    '家肖': '家禽', '野肖': '野兽',
    '红': '红波', '蓝': '蓝波', '兰': '蓝波', '绿': '绿波'
  };
  const short_attrs = Object.keys(BAO_SHORT_MAP).sort((a, b) => b.length - a.length).join('|');
  addMatch(new RegExp('^' + SEP + '(' + short_attrs + ')' + SEP + '(\\d+)' + SEP + '$', 'gm'),
    function(m) { return _h_bao_short(m, BAO_SHORT_MAP); }
  );

  // ===== 特碰（拖碰） =====
  addMatch(new RegExp(
    '特碰' + SEP +
    '((?:[' + Z + ']+|\\d+尾|\\d{1,2}|' + ATTR_RE + ')(?:' + SEP_CHARS + '+(?:[' + Z + ']+|\\d+尾|\\d{1,2}|' + ATTR_RE + '))*)' +
    SEP_CHARS + '*(?:碰)' + SEP_CHARS + '*((?:[' + Z + ']+|\\d+尾|\\d{1,2}|' + ATTR_RE + ')(?:' + SEP_CHARS + '+(?:[' + Z + ']+|\\d+尾|\\d{1,2}|' + ATTR_RE + '))*)' +
    SEP + END_AMT_RE, 'g'),
    function(m) { return _h_drag_tePeng(m); }
  );

  // ===== 特碰（拖/托/抚）：胆码 + 拖码，如"特碰01-02拖03-04各100" =====
  addMatch(new RegExp(
    '特碰' + SEP +
    '((?:[' + Z + ']+|\\d+尾|\\d{1,2}|' + ATTR_RE + ')(?:' + SEP_CHARS + '+(?:[' + Z + ']+|\\d+尾|\\d{1,2}|' + ATTR_RE + '))*)' +
    SEP_CHARS + '*(?:拖|托|抚)' + SEP_CHARS + '*((?:[' + Z + ']+|\\d+尾|\\d{1,2}|' + ATTR_RE + ')(?:' + SEP_CHARS + '+(?:[' + Z + ']+|\\d+尾|\\d{1,2}|' + ATTR_RE + '))*)(?!' + SEP_CHARS + '*(?:拖|托|抚))' +
    SEP + END_AMT_RE, 'g'),
    function(m) { return _h_drag_tePeng(m); }
  );

  // ===== 二中二（拖/托/抚） =====
  addMatch(new RegExp(
    '[二2]中[二2]' + SEP +
    '((?:[' + Z + ']+|\\d+尾|\\d{1,2}|' + ATTR_RE + ')(?:' + SEP_CHARS + '+(?:[' + Z + ']+|\\d+尾|\\d{1,2}|' + ATTR_RE + '))*)' +
    SEP_CHARS + '*(?:拖|托|抚)' + SEP_CHARS + '*((?:[' + Z + ']+|\\d+尾|\\d{1,2}|' + ATTR_RE + ')(?:' + SEP_CHARS + '+(?:[' + Z + ']+|\\d+尾|\\d{1,2}|' + ATTR_RE + '))*)' +
    SEP + END_AMT_RE, 'g'),
    function(m) { return _h_drag_erzhong(m); }
  );

  // ===== 复式二中二 =====
  addMatch(new RegExp(
    '复[式试]?[二2]中[二2]' + SEP + '((?:\\d+' + SEP_CHARS + ')+\\d+)(?!' + SEP_CHARS + '*[拖托抚碰])' + SEP + END_AMT_RE, 'g'),
    function(m) { return _h_fushi(m, '二中二', 2); }
  );

  // ===== 二中二（非复式） =====
  addMatch(new RegExp(
    '[二2]中[二2]' + SEP + '((?:\\d{1,2}(?!\\d)' + SEP_CHARS + '+\\d{1,2}(?!\\d)' + SEP_CHARS + '*)+)(?!' + SEP_CHARS + '*[拖托抚碰])' + SEP + END_AMT_RE, 'g'),
    function(m) { return _h_ezz(m); }
  );

  // ===== 二中二（混合项无拖，需提示缺少拖/托/抚） =====
  addMatch(new RegExp(
    '[二2]中[二2]' + SEP +
    '((?:[' + Z + ']+|\\d+尾|\\d{1,2}|' + ATTR_RE + ')(?:' + SEP_CHARS + '+(?:[' + Z + ']+|\\d+尾|\\d{1,2}|' + ATTR_RE + '))*)' +
    '(?!' + SEP_CHARS + '*[拖托抚碰])' + SEP + END_AMT_RE, 'g'),
    function(m) { return _h_ezz_nodrag(m); }
  );

  // ===== 号码在前、玩法在后（三中二） =====
  addMatch(new RegExp(
    '((?:\\d{1,2}' + SEP_CHARS + '+\\d{1,2}' + SEP_CHARS + '+\\d{1,2}(?!\\d)' + SEP_CHARS + '*)+)' +
    SEP + '([三3]中[二2])' + SEP + '(' + KW_GROUP + ')' + SEP + AMT_GROUP, 'g'),
    function(m) { return _h_nums_then_play(m); }
  );

  // ===== 号码在前、玩法在后（三中三） =====
  addMatch(new RegExp(
    '((?:\\d{1,2}' + SEP_CHARS + '+\\d{1,2}' + SEP_CHARS + '+\\d{1,2}(?!\\d)' + SEP_CHARS + '*)+)' +
    SEP + '([三3]中[三3])' + SEP + '(' + KW_GROUP + ')' + SEP + AMT_GROUP, 'g'),
    function(m) { return _h_nums_then_play(m); }
  );

  // ===== 号码在前、玩法在后（二中二/特碰/三中三） =====
  addMatch(new RegExp(
    '((?:\\d{1,2}' + SEP_CHARS + '+\\d{1,2}(?!\\d)' + SEP_CHARS + '*)+)' +
    SEP + '([二2]中[二2]|[三3]中[三3]|特碰)' + SEP + '(' + KW_GROUP + ')' + SEP + AMT_GROUP, 'g'),
    function(m) { return _h_nums_then_play(m); }
  );

  // ===== 号码 + 复式玩法 =====
  addMatch(new RegExp(
    '((?:\\d+' + SEP_CHARS + ')+\\d+)' +
    SEP + '(复[式试]?(?:[二2]中[二2]|[三3]中[三3]|特碰))' + SEP + '(' + KW_GROUP + ')' + SEP + AMT_GROUP, 'g'),
    function(m) { return _h_nums_fushi_play(m); }
  );

  // ===== 复式特碰 =====
  addMatch(new RegExp('复[式试]?特碰' + SEP + '((?:\\d+' + SEP_CHARS + ')+\\d+)(?!' + SEP_CHARS + '*[拖托抚碰])' + SEP + END_AMT_RE, 'g'),
    function(m) { return _h_fushi(m, '特碰', 2); }
  );

  // ===== 特碰（非复式） =====
  addMatch(new RegExp('特碰' + SEP + '((?:\\d{1,2}(?!\\d)' + SEP_CHARS + '+\\d{1,2}(?!\\d)' + SEP_CHARS + '*)+)(?!' + SEP_CHARS + '*[拖托抚碰])' + SEP + END_AMT_RE, 'g'),
    function(m) { return _h_tepeng(m); }
  );

  // ===== 复式三中二 =====
  addMatch(new RegExp('复[式试]?[三3]中[二2]' + SEP + '((?:\\d+' + SEP_CHARS + ')+\\d+)' + SEP + END_AMT_RE, 'g'),
    function(m) { return _h_fushi(m, '三中二', 3); }
  );

  // ===== 复式三中三 =====
  addMatch(new RegExp('复[式试]?[三3]中[三3]' + SEP + '((?:\\d+' + SEP_CHARS + ')+\\d+)' + SEP + END_AMT_RE, 'g'),
    function(m) { return _h_fushi(m, '三中三', 3); }
  );

  // ===== 三中二 =====
  addMatch(new RegExp('[三3]中[二2]' + SEP + '((?:\\d{1,2}' + SEP_CHARS + '+\\d{1,2}' + SEP_CHARS + '+\\d{1,2}(?!\\d)' + SEP_CHARS + '*)+)' + SEP + END_AMT_RE, 'g'),
    function(m) { return _h_sze(m); }
  );

  // ===== 三中三 =====
  addMatch(new RegExp('[三3]中[三3]' + SEP + '((?:\\d{1,2}' + SEP_CHARS + '+\\d{1,2}' + SEP_CHARS + '+\\d{1,2}(?!\\d)' + SEP_CHARS + '*)+)' + SEP + END_AMT_RE, 'g'),
    function(m) { return _h_szz(m); }
  );

  // ===== 三中三双拖 =====
  addMatch(new RegExp(
    '[三3]中[三3]' + SEP +
    '((?:[' + Z + ']+|\\d+尾|\\d{1,2}|' + ATTR_RE + ')(?:' + SEP_CHARS + '+(?:[' + Z + ']+|\\d+尾|\\d{1,2}|' + ATTR_RE + '))*)' +
    SEP_CHARS + '*(?:拖|托|抚)' + SEP_CHARS + '*((?:[' + Z + ']+|\\d+尾|\\d{1,2}|' + ATTR_RE + ')(?:' + SEP_CHARS + '+(?:[' + Z + ']+|\\d+尾|\\d{1,2}|' + ATTR_RE + '))*)' +
    SEP_CHARS + '*(?:拖|托|抚)' + SEP_CHARS + '*((?:[' + Z + ']+|\\d+尾|\\d{1,2}|' + ATTR_RE + ')(?:' + SEP_CHARS + '+(?:[' + Z + ']+|\\d+尾|\\d{1,2}|' + ATTR_RE + '))*)' +
    SEP + END_AMT_RE, 'g'),
    function(m) { return _h_drag_szz_double(m); }
  );

  // ===== 三中三（拖/托/抚） =====
  addMatch(new RegExp(
    '[三3]中[三3]' + SEP +
    '((?:[' + Z + ']+|\\d+尾|\\d{1,2}|' + ATTR_RE + ')(?:' + SEP_CHARS + '+(?:[' + Z + ']+|\\d+尾|\\d{1,2}|' + ATTR_RE + '))*)' +
    SEP_CHARS + '*(?:拖|托|抚)' + SEP_CHARS + '*((?:[' + Z + ']+|\\d+尾|\\d{1,2}|' + ATTR_RE + ')(?:' + SEP_CHARS + '+(?:[' + Z + ']+|\\d+尾|\\d{1,2}|' + ATTR_RE + '))*)(?!' + SEP_CHARS + '*(?:拖|托|抚))' +
    SEP + END_AMT_RE, 'g'),
    function(m) { return _h_drag_szz(m); }
  );

  // ===== 三中三（混合项无拖，需提示缺少拖/托/抚） =====
  addMatch(new RegExp(
    '[三3]中[三3]' + SEP +
    '((?:[' + Z + ']+|\\d+尾|\\d{1,2}|' + ATTR_RE + ')(?:' + SEP_CHARS + '+(?:[' + Z + ']+|\\d+尾|\\d{1,2}|' + ATTR_RE + '))*)' +
    '(?!' + SEP_CHARS + '*[拖托抚碰])' + SEP + END_AMT_RE, 'g'),
    function(m) { return _h_szz_nodrag(m); }
  );

  // ===== 连肖复式 =====
  addMatch(new RegExp(
    '([二三四五2345两])(?:连肖|连[肖]?|肖连|肖全中|连?肖|肖中|连)' + SEP + '复[式试]?' + SEP + '((?:[' + Z + ']+))' + SEP + END_AMT_RE, 'g'),
    function(m) { return _h_lianxiao_fushi(m); }
  );

  // ===== 生肖 + 连肖 + 复式 =====
  addMatch(new RegExp(
    '((?:[' + Z + ']+))' + SEP + '([二三四五2345两])(?:连肖|连[肖]?|肖连|肖全中|连?肖|肖中|连)' + SEP + '复[式试]?' + SEP + '(' + KW_GROUP + ')' + SEP + AMT_GROUP, 'g'),
    function(m) { return _h_sheng_lx_fushi(m); }
  );

  // ===== 生肖 + 复式 + 连肖 =====
  addMatch(new RegExp(
    '((?:[' + Z + ']+))' + SEP + '复[式试]?' + SEP + '([二三四五2345两])(?:连肖|连[肖]?|肖连|肖全中|连?肖|肖中|连)' + SEP + '(' + KW_GROUP + ')' + SEP + AMT_GROUP, 'g'),
    function(m) { return _h_sheng_lx_fushi(m); }
  );

  // ===== 生肖 + 数字连肖 =====
  addMatch(new RegExp(
    '((?:[' + Z + ']+))' + SEP + '(?:连肖|连[肖]?|肖连|肖全中|连?肖|肖中|连)' + SEP + '([二三四五2345两])' + SEP + END_AMT_RE, 'g'),
    function(m) { return _h_sheng_num_lx(m); }
  );

  // ===== 连尾复式 =====
  addMatch(new RegExp(
    '([二三四五2345])(?:连尾|尾连)' + SEP + '复[式试]?' + SEP + '((?:\\d{1,2}尾?' + SEP_CHARS + '*)+)' + SEP + END_AMT_RE, 'g'),
    function(m) { return _h_lianwei_fushi(m); }
  );

  // ===== 尾数 + 连尾 + 数字 =====
  addMatch(new RegExp(
    '(?=.*?(?:连尾|尾连))' + '((?:\\d{1,2}尾?' + SEP_CHARS + '*)+)' + SEP + '(?:([二三四五2345])连尾|尾连([二三四五2345]))' + SEP + END_AMT_RE, 'g'),
    function(m) { return _h_tail_num_lw(m); }
  );

  // ===== 复式连肖（可带数字前缀） =====
  addMatch(new RegExp(
    '复[式试]?([二三四五2345两])?(?:肖|连肖|平连|连)' + SEP + '((?:[' + Z + ']+' + SEP_CHARS + '*)+)' + SEP + END_AMT_RE, 'g'),
    function(m) { return _h_fu_lianxiao(m); }
  );

  // ===== 尾数 + 复式 + 连尾 =====
  addMatch(new RegExp(
    '(?=.*?(?:连尾|尾连))' + '((?:\\d{1,2}尾?' + SEP_CHARS + '*)+)' + SEP + '复[式试]?' + SEP + '([二三四五2345])(?:连尾|尾连)' + SEP + '(' + KW_GROUP + ')' + SEP + AMT_GROUP, 'g'),
    function(m) { return _h_tail_fushi_lw(m); }
  );

  // ===== 尾数 + 连尾 + 复式 =====
  addMatch(new RegExp(
    '(?=.*?(?:连尾|尾连))' + '((?:\\d{1,2}尾?' + SEP_CHARS + '*)+)' + SEP + '([二三四五2345])(?:连尾|尾连)' + SEP + '复[式试]?' + SEP + '(' + KW_GROUP + ')' + SEP + AMT_GROUP, 'g'),
    function(m) { return _h_tail_fushi_lw(m); }
  );

  // ===== 尾数 + 尾连 + 数字 + 复式 =====
  addMatch(new RegExp(
    '(?=.*?(?:连尾|尾连))' + '((?:\\d{1,2}尾?' + SEP_CHARS + '*)+)' + SEP + '尾连' + SEP + '([二三四五2345])' + SEP + '复[式试]?' + SEP + '(' + KW_GROUP + ')' + SEP + AMT_GROUP, 'g'),
    function(m) { return _h_tail_fushi_lw(m); }
  );

  // ===== 尾数 + 复式 + 尾连 + 数字 =====
  addMatch(new RegExp(
    '(?=.*?(?:连尾|尾连))' + '((?:\\d{1,2}尾?' + SEP_CHARS + '*)+)' + SEP + '复[式试]?' + SEP + '尾连' + SEP + '([二三四五2345])' + SEP + '(' + KW_GROUP + ')' + SEP + AMT_GROUP, 'g'),
    function(m) { return _h_tail_fushi_lw(m); }
  );

  // ===== 复式连尾 =====
  addMatch(new RegExp(
    '复[式试]?([二三四五2345])?(?:连尾|尾连)' + SEP + '((?:\\d{1,2}尾?' + SEP_CHARS + '*)+)' + SEP + END_AMT_RE, 'g'),
    function(m) { return _h_fu_lianwei(m); }
  );

  // ===== N不中（五~十八） =====
  addMatch(new RegExp(
    '([五六七八九十]|十[一二三四五六七八]|十一|十二|十三|十四|十五|十六|十七|十八|[5-9]|1[0-8])不[中出]' +
    SEP + '((?:[' + Z + ']+|\\d{1,2})(?:' + SEP + '(?:[' + Z + ']+|\\d{1,2}))*)(?!\\d)' +
    SEP + '[下共买个—来=＝\\/各组四各]*' + SEP + '(\\d+|[一二三四五六七八九十百千两]+)', 'g'),
    function(m) { return _h_buzhong(m); }
  );

  // ===== 连肖（含组，完整版） =====
  addMatch(new RegExp(
    '([二三四五2345两])(?:连肖|连[肖]?|肖连|肖全中|连?肖|肖中|连)' + SEP +
    '((?:[' + Z + ']+(?:' + SEP_CHARS + '+[' + Z + ']+)*))' + SEP +
    '(?:(?=' + KW_GROUP + ')' + KW_GROUP + SEP + AMT_GROUP + '|' + END_AMT_RE + ')', 'gd'),
    function(m) { return _h_lianxiao_groups(m); }
  );

  // ===== 连肖 catch-all =====
  addMatch(new RegExp(
    '([二三四五2345两])(?:连肖|连(?!尾)|肖连|肖全中|连?肖|肖中)' + SEP + '(.+)$', 'g'),
    function(m) { return _catchall_lianxiao(m, Z, m[1]); }
  );

  // ===== 连尾（含组，完整版） =====
  addMatch(new RegExp(
    '([二三四五2345])(?:连尾|尾连)' + SEP +
    '((?:\\d{1,2}尾?' + SEP_CHARS + '*)+)' + SEP +
    '(?:(?=' + KW_GROUP + ')' + KW_GROUP + SEP + AMT_GROUP + '|' + END_AMT_RE + ')', 'g'),
    function(m) { return _h_lianwei_groups(m); }
  );

  // ===== 连尾 catch-all =====
  addMatch(new RegExp(
    '([二三四五2345])(?:连尾|尾连)' + SEP + '(.+)$', 'g'),
    function(m) { return _catchall_lianwei(m, m[1]); }
  );

  // ===== 平特肖 =====
  addMatch(new RegExp(
    '(?:平特(?:一肖|肖)?|[1一]肖中|平肖|平码肖|一肖|独肖)' + SEP + '((?:[' + Z + ']+' + SEP_CHARS + '*)+)' + SEP + END_AMT_RE, 'g'),
    function(m) { return _h_pingte_xiao(m); }
  );

  // ===== 平特肖 catch-all =====
  addMatch(new RegExp(
    '(?:平特(?:一肖|肖)?|[1一]肖中|平肖|平码肖|一肖|独肖)' + SEP + '(?!(?:一尾|\\d+尾|尾))(.+)$', 'g'),
    function(m) { return _catchall_pingteXiao(m, Z); }
  );

  // ===== 平特尾 =====
  addMatch(new RegExp(
    '(?:平特(?:一尾|尾)?|平尾|尾中)' + SEP + '((?:\\d+尾' + SEP_CHARS + '*)+)' + SEP + END_AMT_RE, 'g'),
    function(m) { return _h_pingte_wei(m); }
  );

  // ===== 平特+N连肖+生肖+金额（如"平特三连龙狗猪10"） =====
  addMatch(new RegExp(
    '(?:平特)' + SEP + '([二三四五2345两])(?:连肖|连)' + SEP + '((?:[' + Z + ']+))' + SEP + END_AMT_RE, 'g'),
    function(m) { return _h_pingte_lianxiao(m); }
  );

  // ===== 平特尾 catch-all =====
  addMatch(new RegExp(
    '(?:平特(?:一尾|尾)?|平尾|尾中)' + SEP + '(.+)$', 'g'),
    function(m) { return _catchall_pingteWei(m); }
  );

  // ===== 平码 =====
  addMatch(new RegExp(
    '(?:平码|独平)' + SEP + '((\\d{1,2}(?!\\d)(?:' + SEP_CHARS + '+\\d{1,2}(?!\\d))*)' + SEP + '(?:' + KW_GROUP + SEP + ')?(?:' + AMT_GROUP + ')?)', 'g'),
    function(m) { return _h_pingma(m); }
  );

  // ===== 平码 catch-all =====
  addMatch(new RegExp(
    '(?:平码|独平)' + SEP + '(.+)$', 'g'),
    function(m) { return _catchall_pingma(m); }
  );

  // ===== 检测到"拖/托/抚"但没有玩法名 =====
  addMatch(new RegExp(
    '((?:[' + Z + ']+|\\d+尾|\\d{1,2}|' + ATTR_RE + ')(?:' + SEP_CHARS + '+(?:[' + Z + ']+|\\d+尾|\\d{1,2}|' + ATTR_RE + '))*)' +
    SEP_CHARS + '*(?:拖|托|抚)' + SEP_CHARS + '*((?:[' + Z + ']+|\\d+尾|\\d{1,2}|' + ATTR_RE + ')(?:' + SEP_CHARS + '+(?:[' + Z + ']+|\\d+尾|\\d{1,2}|' + ATTR_RE + '))*)' +
    SEP + END_AMT_RE, 'g'),
    function(m) { return _h_drag_no_playname(m); }
  );

  // ===== 号码+中文金额格式（如"48六百"→特码48各数600） =====
  addMatch(new RegExp('(\\d{1,2})([一二三四五六七八九十百千两]+)', 'g'),
    function(m) { return _h_number_chinese_amount(m); }
  );

  // ===== 第13条：只写了玩法名没内容 =====
  // 特肖缺少生肖和金额
  addMatch(new RegExp('^(?:特肖|特码肖|特码一肖|一肖|独肖|单肖|肖)$', 'gm'),
    function(m) { return { cat: '__unrecognized__', nums: [], amt: 0, cnt: 0, total: 0, kw: '',
      warnings: ['特肖缺少生肖和金额，请补充'], rawLine: m[0] }; }
  );
  // 包缺少属性
  addMatch(new RegExp('^(?:包|包波|包色)$', 'gm'),
    function(m) { return { cat: '__unrecognized__', nums: [], amt: 0, cnt: 0, total: 0, kw: '',
      warnings: ['包缺少属性（如红波、蓝波、单、双等）和金额，请补充'], rawLine: m[0] }; }
  );
  // 连肖缺少生肖和金额
  addMatch(new RegExp('^(?:连肖|连|肖连|肖全中|连?肖|肖中)(?:[二三四五2345两])?$', 'gm'),
    function(m) { return { cat: '__unrecognized__', nums: [], amt: 0, cnt: 0, total: 0, kw: '',
      warnings: ['连肖缺少生肖和金额，请补充'], rawLine: m[0] }; }
  );
  // 平特肖缺少生肖和金额
  addMatch(new RegExp('^(?:平特肖|平特一肖|平肖|平码肖|一肖中|独肖)$', 'gm'),
    function(m) { return { cat: '__unrecognized__', nums: [], amt: 0, cnt: 0, total: 0, kw: '',
      warnings: ['平特肖缺少生肖和金额，请补充'], rawLine: m[0] }; }
  );
  // 平特尾缺少尾数和金额
  addMatch(new RegExp('^(?:平特尾|平尾|尾中)$', 'gm'),
    function(m) { return { cat: '__unrecognized__', nums: [], amt: 0, cnt: 0, total: 0, kw: '',
      warnings: ['平特尾缺少尾数和金额，请补充'], rawLine: m[0] }; }
  );
  // 连尾缺少尾数和金额
  addMatch(new RegExp('^(?:连尾|尾连)(?:[二三四五2345])?$', 'gm'),
    function(m) { return { cat: '__unrecognized__', nums: [], amt: 0, cnt: 0, total: 0, kw: '',
      warnings: ['连尾缺少尾数和金额，请补充'], rawLine: m[0] }; }
  );
  // 二中二缺少号码和金额
  addMatch(new RegExp('^(?:二[中中]二|二[中中]2|2[中中]2|2[中中]二)$', 'gm'),
    function(m) { return { cat: '__unrecognized__', nums: [], amt: 0, cnt: 0, total: 0, kw: '',
      warnings: ['二中二缺少号码和金额，请补充'], rawLine: m[0] }; }
  );
  // 三中三缺少号码和金额
  addMatch(new RegExp('^(?:三[中中]三|三[中中]3|3[中中]3|3[中中]三)$', 'gm'),
    function(m) { return { cat: '__unrecognized__', nums: [], amt: 0, cnt: 0, total: 0, kw: '',
      warnings: ['三中三缺少号码和金额，请补充'], rawLine: m[0] }; }
  );
  // 特碰缺少号码和金额
  addMatch(new RegExp('^特碰$', 'gm'),
    function(m) { return { cat: '__unrecognized__', nums: [], amt: 0, cnt: 0, total: 0, kw: '',
      warnings: ['特碰缺少号码和金额，请补充'], rawLine: m[0] }; }
  );
  // 不中缺少号码和金额
  addMatch(new RegExp('^(?:[五六七八九十十][一二三四五六七八九十]?不[中出])$', 'gm'),
    function(m) { return { cat: '__unrecognized__', nums: [], amt: 0, cnt: 0, total: 0, kw: '',
      warnings: ['不中缺少号码和金额，请补充'], rawLine: m[0] }; }
  );
  // 平码缺少号码和金额
  addMatch(new RegExp('^(?:平码|独平)$', 'gm'),
    function(m) { return { cat: '__unrecognized__', nums: [], amt: 0, cnt: 0, total: 0, kw: '',
      warnings: ['平码缺少号码和金额，请补充'], rawLine: m[0] }; }
  );

  // ===== 合并multiMatches到allMatches =====
  allMatches.push(...multiMatches);
  allMatches.sort((a, b) => a.start - b.start);
  const deduped = [];
  let lastEnd = 0;
  for (const match of allMatches) {
    if (match.start >= lastEnd) {
      if (match.result && match.result._extendToEnd) {
        match.end = text.length;
        delete match.result._extendToEnd;
      }
      deduped.push(match);
      lastEnd = match.end;
    }
  }
  return deduped;
}

// =============================================================================
// collectSpecialMatches 处理器函数
// =============================================================================

// 号码+中文金额格式
function _h_number_chinese_amount(m) {
  const num = parseInt(m[1]);
  if (num < 1 || num > 49) return null;
  const amt = toNum(m[2]);
  if (amt <= 0) return null;
  const padded = String(num).padStart(2, '0');
  return { cat: '特码', nums: [padded], amt, cnt: 1, total: amt, kw: '各数', warnings: [] };
}

// 检测到拖/托但缺少玩法名
function _h_drag_no_playname(m) {
  const full = m[0];
  return { cat: '__unrecognized__', nums: [], amt: 0, cnt: 0, total: 0, kw: '',
    warnings: ['检测到"拖/托"但缺少玩法名，请在号码前加上"二中二"或"三中三"'], rawLine: full };
}

// 6肖中特 / 六肖中特：玩法名 + 六个生肖 + 金额（整组赔付）
// side == 'front' 玩法名在前；side == 'back' 玩法名在后。金额词统一显示"买"，不允许"各"
function _h_liuXiao(m, side) {
  const full = m[0];
  const zodiacChars = (m[1].match(new RegExp('[' + ZODIAC + ']', 'g')) || []).join('');
  const amtRaw = m[3] || m[4];
  if (zodiacChars.length !== 6) {
    return { cat: '__unrecognized__', nums: [], amt: 0, cnt: 0, total: 0, kw: '',
      warnings: ['6肖中特需要写6个生肖，且不能用"各"关键字，如"6肖中特牛马羊鸡狗猪买100"'],
      rawLine: full.trim() };
  }
  if (new Set(zodiacChars.split('')).size !== 6) {
    return { cat: '__unrecognized__', nums: [], amt: 0, cnt: 0, total: 0, kw: '',
      warnings: ['6肖中特的6个生肖不能重复，请重新输入'], rawLine: full.trim() };
  }
  const amt = toNum(amtRaw || '0');
  if (!amt || amt <= 0) {
    return { cat: '__unrecognized__', nums: [], amt: 0, cnt: 0, total: 0, kw: '',
      warnings: ['6肖中特需要填写有效金额，如"6肖中特牛马羊鸡狗猪买100"'], rawLine: full.trim() };
  }
  return { cat: '6肖中特', nums: zodiacChars, amt: amt, cnt: 6, total: amt, kw: '买', warnings: [] };
}

// 特肖
function _h_teXiao(m, Z, SEP_CHARS, END_AMT_RE) {
  const full = m[0];
  // 如果前面是"平"，说明是"平特肖"玩法，不应被特肖匹配
  if (m.index > 0 && m.input && m.input[m.index - 1] === '平') return null;
  const { amt, kw } = extractAmtAndKw(full);
  if (!amt || amt <= 0) return null;
  const zodiacs = (m[1].match(new RegExp('[' + Z + ']', 'g')) || []);
  if (!zodiacs.length) return null;
  const warnings = [];
  if (zodiacs.length > 1 && !kw) warnings.push('这行没有写关键词和金额，请在号码后面加上"各/各号+金额"');
  return { cat: '特肖', nums: zodiacs, amt, cnt: zodiacs.length, total: amt * zodiacs.length, kw: kw || '各', warnings };
}

// 特肖 catch-all
function _catchall_teXiao(m, Z) {
  const full = m[0];
  // 如果前面是"平"，说明是"平特肖"玩法，不应被特肖匹配
  if (m.index > 0 && m.input && m.input[m.index - 1] === '平') return null;
  const amtMatch = full.match(/(\d+)$/);
  if (!amtMatch) return null;
  const zodiacs = (m[1].match(new RegExp('[' + Z + ']', 'g')) || []);
  const nonZodiac = m[1].replace(new RegExp('[' + Z + SEP_CHARS + '\\d]', 'g'), '').trim();
  if (zodiacs.length > 0 && nonZodiac) {
    return { cat: '__unrecognized__', nums: [], amt: 0, cnt: 0, total: 0, kw: '',
      warnings: ['特肖后的"'+ nonZodiac +'"不是正确的生肖，请检查'], rawLine: full };
  }
  return null;
}

// 包玩法
function _h_bao(m) {
  const full = m[0];
  const attr = m[1];
  const amt = toNum(m[2]);
  if (!amt || amt <= 0) return null;
  if (full.includes('各')) {
    return { cat: '__unrecognized__', nums: [], amt: 0, cnt: 0, total: 0, kw: '',
      warnings: ['包玩法不允许使用"各"关键字'], rawLine: full };
  }
  return { cat: '包' + attr, nums: [attr], amt, cnt: 1, total: amt, kw: '各' };
}

// 简写生肖+玩法名+金额
function _h_sheng_play_short(m) {
  const sheng = m[1];
  const play = m[2];
  const amt = toNum(m[3]);
  if (!amt || amt <= 0) return null;
  const cat = play.startsWith('平特') ? '平特肖' : play;
  const warnings = [];
  if (sheng.length >= 2) {
    warnings.push('这行没有写关键词和金额，请确认是否为多个生肖，如需逐个下注请在号码后面加上"各/各号+金额"');
  }
  return { cat: cat, nums: [sheng], amt, cnt: 1, total: amt, kw: '各', warnings };
}

// 简写包玩法
function _h_bao_short(m, BAO_SHORT_MAP) {
  const attr = m[1];
  const amt = toNum(m[2]);
  if (!amt || amt <= 0) return null;
  const full_attr = BAO_SHORT_MAP[attr];
  if (!full_attr) return null;
  return { cat: '包' + full_attr, nums: [full_attr], amt, cnt: 1, total: amt, kw: '各' };
}

// 特碰拖
function _h_drag_tePeng(m) {
  const full = m[0];
  const { amt, kw } = extractAmtAndKw(full);
  if (!amt || amt <= 0) return null;
  if (!kw) {
    if (m.length >= 4 && m[3]) { /* try alternate capture */ }
    if (!amt || amt <= 0) return null;
  }
  const leftPart = m[1], rightPart = m[2];
  return _drag_helper(leftPart, rightPart, amt, kw || '各', '特碰');
}

// 二中二拖
function _h_drag_erzhong(m) {
  const full = m[0];
  const { amt, kw } = extractAmtAndKw(full);
  if (!amt || amt <= 0) return null;
  if (!kw) {
    return { cat: '__unrecognized__', nums: [], amt: 0, cnt: 0, total: 0, kw: '',
      warnings: ['这行没有写关键词和金额，请在号码后面加上"各/各号+金额"'], rawLine: full };
  }
  const leftPart = m[1], rightPart = m[2];
  return _drag_helper(leftPart, rightPart, amt, kw, '二中二');
}

// 三中三拖（单拖）
function _h_drag_szz(m) {
  const full = m[0];
  const { amt, kw } = extractAmtAndKw(full);
  if (!amt || amt <= 0) return null;
  if (!kw) {
    return { cat: '__unrecognized__', nums: [], amt: 0, cnt: 0, total: 0, kw: '',
      warnings: ['这行没有写关键词和金额，请在号码后面加上"各/各号+金额"'], rawLine: full };
  }
  const leftPart = m[1], rightPart = m[2];
  const leftItems = _expand_zodiac(leftPart.split(new RegExp(SEP_CHARS + '+')).filter(s => s.trim()));
  const rightItems = _expand_zodiac(rightPart.split(new RegExp(SEP_CHARS + '+')).filter(s => s.trim()));
  const leftNums = _items_to_nums(leftItems);
  const rightNums = _items_to_nums(rightItems);
  if (leftNums.length === 0 || rightNums.length < 2) return null;
  const triples = [];
  for (const a of leftNums) {
    for (const combo of combosNoSort(rightNums, 2)) {
      const b = combo[0], c = combo[1];
      if (a !== b && a !== c) {
        triples.push([a, b, c].sort((x, y) => parseInt(x) - parseInt(y)).join('-'));
      }
    }
  }
  if (triples.length === 0) return null;
  const warnings = [];
  if (triples.length > 1 && !kw) warnings.push('这行没有写关键词和金额，请在号码后面加上"各/各号+金额"');
  return { cat: '三中三', nums: triples, amt, cnt: triples.length, total: amt * triples.length, kw, warnings };
}

// 三中三双拖
function _h_drag_szz_double(m) {
  const full = m[0];
  const { amt, kw } = extractAmtAndKw(full);
  if (!amt || amt <= 0) return null;
  if (!kw) {
    return { cat: '__unrecognized__', nums: [], amt: 0, cnt: 0, total: 0, kw: '',
      warnings: ['这行没有写关键词和金额，请在号码后面加上"各/各号+金额"'], rawLine: full };
  }
  const leftPart = m[1], midPart = m[2], rightPart = m[3];
  return _drag_helper_szz_double(leftPart, midPart, rightPart, amt, kw);
}

// 复式（通用）
function _h_fushi(m, catName, k) {
  const full = m[0];
  const { amt, kw } = extractAmtAndKw(full);
  if (!amt || amt <= 0) return null;
  if (!kw) {
    return { cat: '__unrecognized__', nums: [], amt: 0, cnt: 0, total: 0, kw: '',
      warnings: ['这行没有写关键词和金额，请在号码后面加上"各/各号+金额"'], rawLine: full };
  }
  const nums = extractNums(m[1]);
  const invalidNums = findInvalidNums(m[1]);
  const warnings = invalidNums.length ? ['号码' + invalidNums.join('、') + '超出范围（1-49），请检查重新输入'] : [];
  if (nums.length !== new Set(nums).size) {
    const dup = [...new Set(nums.filter(n => nums.indexOf(n) !== nums.lastIndexOf(n)))].sort((a, b) => parseInt(a) - parseInt(b));
    warnings.push('存在重复号码' + dup.map(n => String(n).padStart(2, '0')).join('、') + '，请检查');
    return { cat: catName, nums: [], amt, cnt: 0, total: 0, kw, warnings };
  }
  const combos_ = combosNoSort(nums, k).map(c => c.join('-'));
  if (combos_.length > 1 && !kw) warnings.push('这行没有写关键词和金额，请在号码后面加上"各/各号+金额"');
  return { cat: catName, nums: combos_, amt, cnt: combos_.length, total: amt * combos_.length, kw, warnings };
}

// 二中二（非复式）
function _h_ezz(m) {
  const full = m[0];
  let { amt, kw } = extractAmtAndKw(full);
  if (!amt || amt <= 0) return null;
  const numPart = m[1];
  const invalidNums = findInvalidNums(numPart);
  const warnings = invalidNums.length ? ['号码' + invalidNums.join('、') + '超出范围（1-49），请检查重新输入'] : [];
  if (!kw) {
    const lineInfo = extractAmtAndKw(m.input);
    if (lineInfo.amt && lineInfo.amt > 0 && lineInfo.kw) {
      amt = lineInfo.amt; kw = lineInfo.kw;
    } else if (m[3] !== undefined) {
      const amt_raw = m[3];
      if (amt_raw) amt = toNum(amt_raw.trim());
      if (!amt || amt <= 0) return null;
    } else {
      return null;
    }
  }
  const full_nums = extractNums(m.input);
  const part_nums = extractNums(numPart);
  const expected_extra = (amt >= 1 && amt <= 49) ? 1 : 0;
  if (full_nums.length > part_nums.length + expected_extra) {
    warnings.push('号码数不对，请检查');
    return { cat: '二中二', nums: [], amt, cnt: 0, total: 0, kw, warnings };
  }
  const pairs = [];
  const pr = new RegExp('(\\d{1,2})' + SEP_CHARS + '+(\\d{1,2})(?!\\d)', 'g');
  let pm;
  while ((pm = pr.exec(numPart)) !== null) {
    const a = pm[1], b = pm[2];
    if (a === b) {
      warnings.push('存在重复号码' + a + '，请检查');
      return { cat: '二中二', nums: [], amt, cnt: 0, total: 0, kw, warnings };
    }
    pairs.push(String(parseInt(a)).padStart(2, '0') + '-' + String(parseInt(b)).padStart(2, '0'));
  }
  if (pairs.length === 0) {
    const nums = extractNums(numPart);
    if (nums.length % 2 !== 0 || nums.length === 0) {
      warnings.push('二中二需要2个号码一组，当前输入了' + nums.length + '个号码，请检查');
      return { cat: '二中二', nums: [], amt, cnt: 0, total: 0, kw, warnings };
    }
    if (nums.length !== new Set(nums).size) {
      const dup = [...new Set(nums.filter(n => nums.indexOf(n) !== nums.lastIndexOf(n)))].sort((a, b) => parseInt(a) - parseInt(b));
      warnings.push('存在重复号码' + dup.map(n => String(n).padStart(2, '0')).join('、') + '，请检查');
      return { cat: '二中二', nums: [], amt, cnt: 0, total: 0, kw, warnings };
    }
    const uniq = [...new Set(nums)].sort((a, b) => parseInt(a) - parseInt(b));
    combosNoSort(uniq, 2).forEach(c => pairs.push(c.join('-')));
  }
  if (pairs.length > 1 && !kw) {
    warnings.push('这行没有写关键词和金额，请在号码后面加上"各/各号+金额"');
    return { cat: '二中二', nums: [], amt, cnt: 0, total: 0, kw: '', warnings };
  }
  if (pairs.length === 1 && !kw && amt > 0) kw = '各';
  return { cat: '二中二', nums: pairs, amt, cnt: pairs.length, total: amt * pairs.length, kw, warnings };
}

// 展开连写的生肖（如"鼠牛龙" → ["鼠","牛","龙"]）
function _expand_zodiac_items(itemList) {
  const ZODIAC_SET = '鼠牛虎兔龙蛇马羊猴𤠣鸡狗猪';
  const expanded = [];
  for (const item of itemList) {
    if (item.length > 1 && [...item].every(ch => ZODIAC_SET.indexOf(ch) >= 0)) {
      expanded.push(...item.split(''));
    } else {
      expanded.push(item);
    }
  }
  return expanded;
}

// 二中二无拖（混合项）
function _h_ezz_nodrag(m) {
  const full = m[0];
  const { amt, kw } = extractAmtAndKw(full);
  if (!amt || amt <= 0) return null;
  if (!kw) {
    return { cat: '__unrecognized__', nums: [], amt: 0, cnt: 0, total: 0, kw: '',
      warnings: ['这行没有写关键词和金额，请在号码后面加上"各/各号+金额"'], rawLine: full };
  }
  const itemList = m[1].split(new RegExp(SEP_CHARS + '+')).map(s => s.trim()).filter(s => s);
  const expanded = _expand_zodiac_items(itemList);
  if (expanded.length >= 2) {
    return { cat: '__unrecognized__', nums: [], amt: 0, cnt: 0, total: 0, kw: '',
      warnings: ['二中二有多个项但缺少"拖"或"托"关键字：' + expanded.join('-')], rawLine: full };
  }
  return null;
}

// 三中二无拖
function _h_sze_nodrag(m) {
  const full = m[0];
  const { amt, kw } = extractAmtAndKw(full);
  if (!amt || amt <= 0) return null;
  return { cat: '__unrecognized__', nums: [], amt: 0, cnt: 0, total: 0, kw: '',
    warnings: ['三中二需要使用"拖/托/抚"来分隔胆码和拖码'], rawLine: full };
}

// 三中三无拖
function _h_szz_nodrag(m) {
  const full = m[0];
  const { amt, kw } = extractAmtAndKw(full);
  if (!amt || amt <= 0) return null;
  if (!kw) {
    return { cat: '__unrecognized__', nums: [], amt: 0, cnt: 0, total: 0, kw: '',
      warnings: ['这行没有写关键词和金额，请在号码后面加上"各/各号+金额"'], rawLine: full };
  }
  const itemList = m[1].split(new RegExp(SEP_CHARS + '+')).map(s => s.trim()).filter(s => s);
  const expanded = _expand_zodiac_items(itemList);
  if (expanded.length >= 2) {
    return { cat: '__unrecognized__', nums: [], amt: 0, cnt: 0, total: 0, kw: '',
      warnings: ['三中三有多个项但缺少"拖"或"托"关键字：' + expanded.join('-')], rawLine: full };
  }
  return null;
}

// 号码在前，玩法在后
function _h_nums_then_play(m) {
  const full = m[0];
  const { amt, kw } = extractAmtAndKw(full);
  if (!amt || amt <= 0) return null;
  const numPart = m[1];
  const playName = m[2].trim();
  const invalidNums = findInvalidNums(numPart);
  const warnings = invalidNums.length ? ['号码' + invalidNums.join('、') + '超出范围（1-49），请检查重新输入'] : [];
  if (playName === '三中三') {
    const allNums = extractNums(numPart);
    if (allNums.length !== new Set(allNums).size) {
      const dup = [...new Set(allNums.filter(n => allNums.indexOf(n) !== allNums.lastIndexOf(n)))].sort((a, b) => parseInt(a) - parseInt(b));
      warnings.push('存在重复号码' + dup.map(n => String(n).padStart(2, '0')).join('、') + '，请检查');
      return { cat: playName, nums: [], amt, cnt: 0, total: 0, kw, warnings };
    }
  }
  const pairs = [];
  if (playName !== '三中二') {
    const pr = new RegExp('(\\d{1,2})' + SEP_CHARS + '+(\\d{1,2})(?!\\d)', 'g');
    let pm;
    while ((pm = pr.exec(numPart)) !== null) {
      pairs.push(String(parseInt(pm[1])).padStart(2, '0') + '-' + String(parseInt(pm[2])).padStart(2, '0'));
    }
  }
  if (pairs.length === 0) {
    const nums = extractNums(numPart);
    if (nums.length < 2) {
      warnings.push('' + playName + '至少需要2个号码，当前只有' + nums.length + '个，请补充');
      return { cat: playName, nums: [], amt, cnt: 0, total: 0, kw, warnings };
    }
    if (playName === '二中二' || playName === '特碰') {
      combosNoSort(nums, 2).forEach(c => pairs.push(c.join('-')));
    } else if (playName === '三中二' || playName === '三中三') {
      if (nums.length < 3) {
        warnings.push('' + playName + '至少需要3个号码，当前只有' + nums.length + '个，请补充');
        return { cat: playName, nums: [], amt, cnt: 0, total: 0, kw, warnings };
      }
      if (nums.length !== new Set(nums).size) {
        const dup = [...new Set(nums.filter(n => nums.indexOf(n) !== nums.lastIndexOf(n)))].sort((a, b) => parseInt(a) - parseInt(b));
        warnings.push('存在重复号码' + dup.map(n => String(n).padStart(2, '0')).join('、') + '，请检查');
        return { cat: playName, nums: [], amt, cnt: 0, total: 0, kw, warnings };
      }
      combosNoSort(nums, 3).forEach(c => pairs.push(c.join('-')));
    }
  }
  if (pairs.length === 0) return null;
  if (pairs.length > 1 && !kw) warnings.push('这行没有写关键词和金额，请在号码后面加上"各/各号+金额"');
  return { cat: playName, nums: pairs, amt, cnt: pairs.length, total: amt * pairs.length, kw, warnings };
}

// 号码 + 复式玩法
function _h_nums_fushi_play(m) {
  const full = m[0];
  const { amt, kw } = extractAmtAndKw(full);
  if (!amt || amt <= 0) return null;
  const nums = extractNums(m[1]);
  const playPart = m[2].trim();
  const invalidNums = findInvalidNums(m[1]);
  const warnings = invalidNums.length ? ['号码' + invalidNums.join('、') + '超出范围（1-49），请检查重新输入'] : [];
  let cat = '';
  let k = 0;
  if (/[二2]中[二2]/.test(playPart)) { cat = '二中二'; k = 2; }
  else if (/[三3]中[二2]/.test(playPart)) { cat = '三中二'; k = 3; }
  else if (/[三3]中[三3]/.test(playPart)) { cat = '三中三'; k = 3; }
  else if (/特碰/.test(playPart)) { cat = '特碰'; k = 2; }
  if (!cat || nums.length < k) {
    warnings.push('' + (cat || playPart) + '至少需要' + k + '个号码，当前只有' + nums.length + '个，请补充');
    return { cat: cat || playPart, nums: [], amt, cnt: 0, total: 0, kw, warnings };
  }
  if (nums.length !== new Set(nums).size) {
    const dup = [...new Set(nums.filter(n => nums.indexOf(n) !== nums.lastIndexOf(n)))].sort((a, b) => parseInt(a) - parseInt(b));
    warnings.push('存在重复号码' + dup.map(n => String(n).padStart(2, '0')).join('、') + '，请检查');
    return { cat, nums: [], amt, cnt: 0, total: 0, kw, warnings };
  }
  const pairs = combosNoSort(nums, k).map(c => c.join('-'));
  if (pairs.length > 1 && !kw) warnings.push('这行没有写关键词和金额，请在号码后面加上"各/各号+金额"');
  return { cat, nums: pairs, amt, cnt: pairs.length, total: amt * pairs.length, kw, warnings };
}

// 特碰（非复式）
function _h_tepeng(m) {
  const full = m[0];
  let { amt, kw } = extractAmtAndKw(full);
  if (!amt || amt <= 0) return null;
  const numPart = m[1];
  const invalidNums = findInvalidNums(numPart);
  const warnings = invalidNums.length ? ['号码' + invalidNums.join('、') + '超出范围（1-49），请检查重新输入'] : [];
  if (!kw) {
    const lineInfo = extractAmtAndKw(m.input);
    if (lineInfo.amt && lineInfo.amt > 0 && lineInfo.kw) {
      amt = lineInfo.amt; kw = lineInfo.kw;
    } else {
      return { cat: '__unrecognized__', nums: [], amt: 0, cnt: 0, total: 0, kw: '',
        warnings: ['这行没有写关键词和金额，请在号码后面加上"各/各号+金额"'], rawLine: full };
    }
  }
  const full_nums = extractNums(m.input);
  const part_nums = extractNums(numPart);
  const expected_extra = (amt >= 1 && amt <= 49) ? 1 : 0;
  if (full_nums.length > part_nums.length + expected_extra) {
    warnings.push('号码数不对，请检查');
    return { cat: '特碰', nums: [], amt, cnt: 0, total: 0, kw, warnings };
  }
  const pairs = [];
  const pr = new RegExp('(\\d{1,2})' + SEP_CHARS + '+(\\d{1,2})(?!\\d)', 'g');
  let pm;
  while ((pm = pr.exec(numPart)) !== null) {
    pairs.push(String(parseInt(pm[1])).padStart(2, '0') + '-' + String(parseInt(pm[2])).padStart(2, '0'));
  }
  if (pairs.length === 0) {
    const nums = extractNums(numPart);
    if (nums.length % 2 !== 0 || nums.length === 0) {
      warnings.push('特碰需要2个号码一组，当前输入了' + nums.length + '个号码，请检查');
      return { cat: '特碰', nums: [], amt, cnt: 0, total: 0, kw, warnings };
    }
    const uniq = [...new Set(nums)].sort((a, b) => parseInt(a) - parseInt(b));
    combosNoSort(uniq, 2).forEach(c => pairs.push(c.join('-')));
  }
  if (pairs.length > 1 && !kw) warnings.push('这行没有写关键词和金额，请在号码后面加上"各/各号+金额"');
  return { cat: '特碰', nums: pairs, amt, cnt: pairs.length, total: amt * pairs.length, kw, warnings };
}

// 三中二（非复式）
function _h_sze(m) {
  const full = m[0];
  let { amt, kw } = extractAmtAndKw(full);
  if (!amt || amt <= 0) return null;
  const numPart = m[1];
  const invalidNums = findInvalidNums(numPart);
  const warnings = invalidNums.length ? ['号码' + invalidNums.join('、') + '超出范围（1-49），请检查重新输入'] : [];
  if (!kw) {
    const lineInfo = extractAmtAndKw(m.input);
    if (lineInfo.amt && lineInfo.amt > 0 && lineInfo.kw) {
      amt = lineInfo.amt; kw = lineInfo.kw;
    } else if (m[3] !== undefined) {
      const amt_raw = m[3];
      if (amt_raw) amt = toNum(amt_raw.trim());
      if (!amt || amt <= 0) {
        return { cat: '__unrecognized__', nums: [], amt: 0, cnt: 0, total: 0, kw: '',
          warnings: ['这行没有写关键词和金额，请在号码后面加上"各/各号+金额"'], rawLine: full };
      }
      kw = '各';
    } else {
      return { cat: '__unrecognized__', nums: [], amt: 0, cnt: 0, total: 0, kw: '',
        warnings: ['这行没有写关键词和金额，请在号码后面加上"各/各号+金额"'], rawLine: full };
    }
  }
  const full_nums = extractNums(m.input);
  const part_nums = extractNums(numPart);
  const expected_extra = (amt >= 1 && amt <= 49) ? 1 : 0;
  if (full_nums.length > part_nums.length + expected_extra) {
    warnings.push('号码数不对，请检查');
    return { cat: '三中二', nums: [], amt, cnt: 0, total: 0, kw, warnings };
  }
  const triples = [];
  const tr = new RegExp('(\\d{1,2})' + SEP_CHARS + '+(\\d{1,2})' + SEP_CHARS + '+(\\d{1,2})(?!\\d)', 'g');
  let tm;
  while ((tm = tr.exec(numPart)) !== null) {
    const a = tm[1], b = tm[2], c = tm[3];
    if (a === b || a === c || b === c) {
      const dups = [...new Set([a, b, c].filter(x => [a, b, c].filter(y => y === x).length > 1))].sort((x, y) => parseInt(x) - parseInt(y));
      warnings.push('存在重复号码' + dups.map(x => String(parseInt(x)).padStart(2, '0')).join('、') + '，请检查');
      return { cat: '三中二', nums: [], amt, cnt: 0, total: 0, kw, warnings };
    }
    triples.push(a + '-' + b + '-' + c);
  }
  if (triples.length === 0) {
    const nums = extractNums(numPart);
    if (nums.length % 3 !== 0 || nums.length === 0) {
      warnings.push('三中二需要3个号码一组，当前输入了' + nums.length + '个号码，请检查');
      return { cat: '三中二', nums: [], amt, cnt: 0, total: 0, kw, warnings };
    }
    if (nums.length !== new Set(nums).size) {
      const dup = [...new Set(nums.filter(n => nums.indexOf(n) !== nums.lastIndexOf(n)))].sort((a, b) => parseInt(a) - parseInt(b));
      warnings.push('存在重复号码' + dup.map(n => String(n).padStart(2, '0')).join('、') + '，请检查');
      return { cat: '三中二', nums: [], amt, cnt: 0, total: 0, kw, warnings };
    }
    const uniq = [...new Set(nums)].sort((a, b) => parseInt(a) - parseInt(b));
    combosNoSort(uniq, 3).forEach(c => triples.push(c.join('-')));
  }
  if (triples.length > 1 && !kw) warnings.push('这行没有写关键词和金额，请在号码后面加上"各/各号+金额"');
  return { cat: '三中二', nums: triples, amt, cnt: triples.length, total: amt * triples.length, kw, warnings };
}

// 三中三（非复式）
function _h_szz(m) {
  const full = m[0];
  let { amt, kw } = extractAmtAndKw(full);
  if (!amt || amt <= 0) return null;
  const numPart = m[1];
  const invalidNums = findInvalidNums(numPart);
  const warnings = invalidNums.length ? ['号码' + invalidNums.join('、') + '超出范围（1-49），请检查重新输入'] : [];
  if (!kw) {
    const lineInfo = extractAmtAndKw(m.input);
    if (lineInfo.amt && lineInfo.amt > 0 && lineInfo.kw) {
      amt = lineInfo.amt; kw = lineInfo.kw;
    } else if (m[3] !== undefined) {
      const amt_raw = m[3];
      if (amt_raw) amt = toNum(amt_raw.trim());
      if (!amt || amt <= 0) return null;
    } else {
      return null;
    }
  }
  const full_nums = extractNums(m.input);
  const part_nums = extractNums(numPart);
  const expected_extra = (amt >= 1 && amt <= 49) ? 1 : 0;
  if (full_nums.length > part_nums.length + expected_extra) {
    warnings.push('号码数不对，请检查');
    return { cat: '三中三', nums: [], amt, cnt: 0, total: 0, kw, warnings };
  }
  const triples = [];
  const tr = new RegExp('(\\d{1,2})' + SEP_CHARS + '+(\\d{1,2})' + SEP_CHARS + '+(\\d{1,2})(?!\\d)', 'g');
  let tm;
  while ((tm = tr.exec(numPart)) !== null) {
    const a = tm[1], b = tm[2], c = tm[3];
    if (a === b || a === c || b === c) {
      const dups = [...new Set([a, b, c].filter(x => [a, b, c].filter(y => y === x).length > 1))].sort((x, y) => parseInt(x) - parseInt(y));
      warnings.push('存在重复号码' + dups.map(x => String(parseInt(x)).padStart(2, '0')).join('、') + '，请检查');
      return { cat: '三中三', nums: [], amt, cnt: 0, total: 0, kw, warnings };
    }
    triples.push(a + '-' + b + '-' + c);
  }
  if (triples.length === 0) {
    const nums = extractNums(numPart);
    if (nums.length % 3 !== 0 || nums.length === 0) {
      warnings.push('三中三需要3个号码一组，当前输入了' + nums.length + '个号码，请检查');
      return { cat: '三中三', nums: [], amt, cnt: 0, total: 0, kw, warnings };
    }
    if (nums.length !== new Set(nums).size) {
      const dup = [...new Set(nums.filter(n => nums.indexOf(n) !== nums.lastIndexOf(n)))].sort((a, b) => parseInt(a) - parseInt(b));
      warnings.push('存在重复号码' + dup.map(n => String(n).padStart(2, '0')).join('、') + '，请检查');
      return { cat: '三中三', nums: [], amt, cnt: 0, total: 0, kw, warnings };
    }
    const uniq = [...new Set(nums)].sort((a, b) => parseInt(a) - parseInt(b));
    combosNoSort(uniq, 3).forEach(c => triples.push(c.join('-')));
  }
  if (triples.length > 1 && !kw) {
    warnings.push('这行没有写关键词和金额，请在号码后面加上"各/各号+金额"');
    return { cat: '三中三', nums: [], amt, cnt: 0, total: 0, kw: '', warnings };
  }
  if (triples.length === 1 && !kw && amt > 0) kw = '各';
  return { cat: '三中三', nums: triples, amt, cnt: triples.length, total: amt * triples.length, kw, warnings };
}

// 平特肖
function _h_pingte_xiao(m) {
  const full = m[0];
  const { amt, kw } = extractAmtAndKw(full);
  if (!amt || amt <= 0) return null;
  const zs = extractZodiacs(m[1]);
  const warnings = [];
  if (zs.length >= 2 && !kw) { warnings.push('这行没有写关键词和金额，请在号码后面加上"各/各号+金额"'); }
  return { cat: '平特肖', nums: zs, amt, cnt: zs.length, total: amt * zs.length, kw, warnings };
}

// 平特肖 catch-all
function _catchall_pingteXiao(m, Z) {
  const full = m[0];
  const amtMatch = full.match(/(\d+)$/);
  if (!amtMatch) return null;
  const zodiacs = (m[1].match(new RegExp('[' + Z + ']', 'g')) || []);
  if (zodiacs.length === 0) {
    const nonZodiac = m[1].replace(/[\s\d,，.。、+\-*＊\/\\|]+/g, '').trim();
    if (nonZodiac) {
      return { cat: '__unrecognized__', nums: [], amt: 0, cnt: 0, total: 0, kw: '',
        warnings: ['平特肖后的"' + nonZodiac + '"不是正确的生肖，请检查'], rawLine: full };
    }
  }
  return null;
}

// 平特尾
function _h_pingte_wei(m) {
  const full = m[0];
  const { amt, kw } = extractAmtAndKw(full);
  if (!amt || amt <= 0) return null;
  const tails = (m[1].match(/\d/g) || []).map(d => d + '尾');
  if (!kw && tails.length >= 2) {
    return { cat: '__unrecognized__', nums: [], amt: 0, cnt: 0, total: 0, kw: '',
      warnings: ['这行没有写关键词和金额，请在号码后面加上"各/各号+金额"'], rawLine: full };
  }
  const warnings = [];
  if (tails.length >= 2 && !kw) { warnings.push('这行没有写关键词和金额，请在号码后面加上"各/各号+金额"'); }
  return { cat: '平特尾', nums: tails, amt, cnt: tails.length, total: amt * tails.length, kw, warnings };
}

// 平特尾 catch-all
function _catchall_pingteWei(m) {
  const full = m[0];
  const amtMatch = full.match(/(\d+)$/);
  if (!amtMatch) return null;
  const tails = (m[1].match(/\d/g) || []);
  if (tails.length === 0) {
    return { cat: '__unrecognized__', nums: [], amt: 0, cnt: 0, total: 0, kw: '',
      warnings: ['平特尾后需要写尾数（如"8尾"、"08尾"）'], rawLine: full };
  }
  return null;
}

// 平特+N连肖
function _h_pingte_lianxiao(m) {
  const full = m[0];
  const { amt, kw } = extractAmtAndKw(full);
  if (!amt || amt <= 0) return null;
  const kStr = m[1];
  const k = toNum(kStr.replace(/[^0-9二三四五两]/g, ''));
  if (!k || k < 2 || k > 5) return null;
  const zPart = m[2];
  const zChars = (zPart.match(new RegExp('[' + ZODIAC + ']', 'g')) || []).join('');
  if (zChars.length !== k) return null;
  const warnings = [];
  if (_check_dup_in_chars(zChars, '平特' + k + '连肖', warnings)) {
    return { cat: k + '连肖', nums: [], amt, cnt: 0, total: 0, kw: kw || '各组', warnings };
  }
  const comb = zCombosKeepOrder(zChars, k);
  return { cat: k + '连肖', nums: comb, amt, cnt: comb.length, total: amt * comb.length, kw: kw || '各组', warnings };
}

// 剔除行尾的“关键词+金额”，用于无效号码自动移除时保留有效号码
function _strip_kw_amt_tail(s) {
  return s.replace(new RegExp('(?:' + KW_LIST.join('|') + ')\\s*\\d+\\s*$'), '');
}

// 平码
function _h_pingma(m) {
  const full = m[0];
  const fullLine = _text_global || full;
  // 说明：Python 版因捕获组嵌套，m.lastindex 恒为 1，实际总是回退到
  // extractAmtAndKw(full) 提取 kw/amt，这里保持一致，不直接读捕获组。
  const nums = extractNums(m[2]);
  let kw = '';
  let amt = 0;
  {
    const info = extractAmtAndKw(full);
    kw = info.kw || '';
    amt = info.amt || 0;
  }
  // 缺少金额关键字，且“金额”实际是潜在号码（1-99）：说明正则把最后一个号码当作金额了
  if (!kw && amt >= 1 && amt <= 99) {
    nums.push(String(amt).padStart(2, '0'));
    amt = 0;
  }
  // 正则捕获的金额包含无效号码（>99，如 "3640"）；有明确关键字时不走此分支
  if (!kw && amt > 99) {
    const info = extractAmtAndKw(fullLine);
    if (info.amt && info.amt <= 99) {
      amt = info.amt;
      kw = info.kw || '';
    }
    const fullInvalid = findInvalidNums(fullLine);
    if (fullInvalid.length) {
      const clean = _strip_kw_amt_tail(fullLine.trim());
      const validNums = extractNums(clean);
      if (validNums.length && amt > 0 && amt <= 99) {
        if (!kw && validNums.length >= 2) {
          return { cat: '__unrecognized__', nums: [], amt: 0, cnt: 0, total: 0, kw: '',
            warnings: ['这行没有写关键词和金额，请在号码后面加上"各/各号+金额"'], rawLine: full };
        }
        return { cat: '平码', nums: validNums, amt, cnt: validNums.length, total: amt * validNums.length, kw,
          warnings: ['号码' + fullInvalid.join('、') + '超出范围（1-49），已自动移除'], rawLine: full, _extendToEnd: true };
      }
      return { cat: '__unrecognized__', nums: [], amt: 0, cnt: 0, total: 0, kw: '',
        warnings: ['号码' + fullInvalid.join('、') + '超出范围（1-49），请检查重新输入'], rawLine: full };
    }
    if (amt > 99) {
      return { cat: '__unrecognized__', nums: [], amt: 0, cnt: 0, total: 0, kw: '',
        warnings: ['无法识别金额，请输入数字金额，如"各10"'], rawLine: full };
    }
  }
  if (!amt || amt <= 0) {
    if (nums.length >= 2) {
      return { cat: '__unrecognized__', nums: [], amt: 0, cnt: 0, total: 0, kw: '',
        warnings: ['这行没有写关键词和金额，请在号码后面加上"各/各号+金额"'], rawLine: full };
    }
    return null;
  }
  if (!kw && nums.length >= 2) {
    return { cat: '__unrecognized__', nums: [], amt: 0, cnt: 0, total: 0, kw: '',
      warnings: ['这行没有写关键词和金额，请在号码后面加上"各/各号+金额"'], rawLine: full };
  }
  let invalidNums = findInvalidNums(fullLine);
  // 有明确关键字时，金额值不是号码，从无效号码列表中排除
  if (kw && amt > 0) invalidNums = invalidNums.filter(n => n !== amt);
  if (invalidNums.length) {
    const clean = _strip_kw_amt_tail(fullLine.trim());
    const validNums = extractNums(clean);
    if (validNums.length && amt > 0) {
      return { cat: '平码', nums: validNums, amt, cnt: validNums.length, total: amt * validNums.length, kw,
        warnings: ['号码' + invalidNums.join('、') + '超出范围（1-49），已自动移除'], rawLine: full, _extendToEnd: true };
    }
    return { cat: '__unrecognized__', nums: [], amt: 0, cnt: 0, total: 0, kw: '',
      warnings: ['号码' + invalidNums.join('、') + '超出范围（1-49），请检查重新输入'], rawLine: full };
  }
  const warnings = [];
  if (nums.length > 1 && !kw) warnings.push('这行没有写关键词和金额，请在号码后面加上"各/各号+金额"');
  // 检查是否由生肖转化而来，添加提示
  if (fullLine && fullLine.includes('ZODIAC')) {
    warnings.push('已将生肖转化为号码来识别，如果本意是"平特肖"请改用"平特肖"玩法');
  }
  return { cat: '平码', nums: nums, amt, cnt: nums.length, total: amt * nums.length, kw, warnings };
}

// 平码 catch-all
function _catchall_pingma(m) {
  const full = m[0];
  const info = extractAmtAndKw(full);
  const amt = info.amt;
  if (!amt || amt <= 0) return null;
  let content = m[1];
  // 移除金额部分，避免金额中的数字被误判为号码
  content = content.replace(new RegExp('(?:' + KW_LIST.join('|') + ')\\s*\\d*$'), '');
  content = content.replace(/\d+$/, '').trim();
  const nums = content.match(/\d{1,2}/g);
  if (nums) return null;
  return { cat: '__unrecognized__', nums: [], amt: 0, cnt: 0, total: 0, kw: '',
    warnings: ['平码需要填写号码，不能写生肖或其他内容，如"平码01 02 05各10"'], rawLine: full, _extendToEnd: true };
}

// 连肖（含组，完整版）
function _h_lianxiao_groups(m) {
  const full = m[0];
  const { amt, kw } = extractAmtAndKw(full);
  if (!amt || amt <= 0) return null;
  const k = toNum(m[1].replace(/[^0-9二三四五两]/g, ''));
  if (!k || k < 2 || k > 5) return null;
  const zPart = m[2];
  const warnings = [];
  const afterEnd = text_after(m);
  if (!kw && /^\s*[鼠牛虎兔龙蛇马羊猴鸡狗猪]/.test(afterEnd)) return null;
  const groups = zPart.split(new RegExp(SEP_CHARS + '+')).filter(g => g.trim().length > 0);
  const validCombos = [];
  const invalidGroups = [];
  for (const g of groups) {
    const zs = g.trim();
    if (zs.length === k) {
      if (_check_dup_in_chars(zs, '连肖', warnings)) continue;
      validCombos.push(...zCombosKeepOrder(zs, k));
    } else {
      invalidGroups.push(zs);
    }
  }
  for (const zs of invalidGroups) {
    // 第8条：连肖中检测到未识别内容（游离数字）
    const strayNums = zs.match(/\d+/g);
    if (strayNums) {
      warnings.push('连肖中检测到未识别内容"' + strayNums.join('') + '"，已默认移除，请确认是否正确');
    } else {
      warnings.push(k + '连肖指定了' + k + '个生肖，但实际输入了' + zs.length + '个（' + zs + '），请检查');
    }
  }
  if (validCombos.length > 0) {
    const cnt = validCombos.length;
    if (cnt > 1 && !kw) warnings.push('这行没有写关键词和金额，请在号码后面加上"各/各号+金额"');
    return { cat: k + '连肖', nums: validCombos, amt, cnt, total: amt * cnt, kw, warnings };
  } else {
    return { cat: k + '连肖', nums: [], amt, cnt: 0, total: 0, kw, warnings };
  }
}

// 连肖 catch-all
function _catchall_lianxiao(m, Z, kStr) {
  const full = m[0];
  const { amt } = extractAmtAndKw(full);
  if (!amt || amt <= 0) return null;
  const content = m[2];
  // 只检查金额关键字之前的内容，避免后面的另一个订单中的生肖被误判
  let contentBeforeKw = content;
  let foundKw = false;
  for (const kw of KW_LIST) {
    const idx = content.indexOf(kw);
    if (idx >= 0) { contentBeforeKw = content.substring(0, idx); foundKw = true; break; }
  }
  if (!foundKw) {
    const md = content.match(/\d+/);
    if (md) contentBeforeKw = content.substring(0, md.index);
  }
  const zodiacs = (contentBeforeKw.match(new RegExp('[' + Z + ']', 'g')) || []);
  if (zodiacs.length > 0) return null;
  return { cat: '__unrecognized__', nums: [], amt: 0, cnt: 0, total: 0, kw: '',
    warnings: [kStr + '连肖需要填写生肖，不能写号码或其他内容，如"' + kStr + '连肖牛马鸡各10"'],
    rawLine: full, _extendToEnd: true };
}

// 连尾（含组，完整版）
function _h_lianwei_groups(m) {
  const full = m[0];
  const { amt, kw } = extractAmtAndKw(full);
  if (!amt || amt <= 0) return null;
  const k = toNum(m[1]);
  if (!k || k < 2 || k > 5) return null;
  const tailPart = m[2];
  const digits = (tailPart.match(/\d/g) || []);
  const warnings = [];
  const afterEnd = text_after(m);
  if (!kw && /^\s*\d+/.test(afterEnd)) return null;
  if (digits.length !== k) {
    warnings.push(k + '连尾指定了' + k + '个尾数，但实际输入了' + digits.length + '个，请检查');
    return { cat: k + '连尾', nums: [], amt, cnt: 0, total: 0, kw, warnings };
  }
  if (_check_dup_in_tails(digits, '连尾', warnings)) {
    return { cat: k + '连尾', nums: [], amt, cnt: 0, total: 0, kw, warnings };
  }
  const comb = tailCKeepOrder(digits.join(','), k);
  if (comb.length > 1 && !kw) warnings.push('这行没有写关键词和金额，请在号码后面加上"各/各号+金额"');
  return { cat: k + '连尾', nums: comb, amt, cnt: comb.length, total: amt * comb.length, kw, warnings };
}

// 连尾 catch-all
function _catchall_lianwei(m, kStr) {
  const full = m[0];
  const amtMatch = full.match(/(\d+)$/);
  if (!amtMatch) return null;
  const digits = (m[2].match(/\d/g) || []);
  if (digits.length === 0) {
    const nonTail = m[2].replace(/[\s\d,，.。、+\-*＊\/\\|]+/g, '').trim();
    if (nonTail) {
      return { cat: '__unrecognized__', nums: [], amt: 0, cnt: 0, total: 0, kw: '',
        warnings: ['连尾后的"' + nonTail + '"不是正确的尾数，请写"数字+尾"格式如"8尾"'], rawLine: full };
    }
  }
  return null;
}

// 连肖复式
function _h_lianxiao_fushi(m) {
  const full = m[0];
  const { amt, kw } = extractAmtAndKw(full);
  if (!amt || amt <= 0) return null;
  const k = toNum(m[1].replace(/[^0-9二三四五两]/g, ''));
  if (!k || k < 2 || k > 5) return null;
  const zPart = m[2].trim();
  const zChars = (zPart.match(new RegExp('[' + ZODIAC + ']', 'g')) || []).join('');
  if (!zChars || zChars.length < k) return null;
  const comb = zCombosKeepOrder(zChars, k);
  const warnings = [];
  if (!kw) warnings.push('这行没有写关键词和金额，请在号码后面加上"各/各号+金额"');
  return { cat: k + '连肖', nums: comb, amt, cnt: comb.length, total: amt * comb.length, kw, warnings };
}

// 生肖+连肖+复式
function _h_sheng_lx_fushi(m) {
  const full = m[0];
  const { amt, kw } = extractAmtAndKw(full);
  if (!amt || amt <= 0) return null;
  const zPart = m[1];
  const zChars = (zPart.match(new RegExp('[' + ZODIAC + ']', 'g')) || []).join('');
  const k = toNum(m[2].replace(/[^0-9二三四五两]/g, ''));
  if (!k || k < 2 || k > 5) return null;
  if (!zChars || zChars.length < k) return null;
  const comb = zCombosKeepOrder(zChars, k);
  const warnings = [];
  if (!kw) warnings.push('这行没有写关键词和金额，请在号码后面加上"各/各号+金额"');
  return { cat: k + '连肖', nums: comb, amt, cnt: comb.length, total: amt * comb.length, kw, warnings };
}

// 生肖+数字连肖
function _h_sheng_num_lx(m) {
  const full = m[0];
  const { amt, kw } = extractAmtAndKw(full);
  if (!amt || amt <= 0) return null;
  const zPart = m[1];
  const zChars = (zPart.match(new RegExp('[' + ZODIAC + ']', 'g')) || []).join('');
  const k = toNum(m[2].replace(/[^0-9二三四五两]/g, ''));
  if (!k || k < 2 || k > 5) return null;
  const warnings = [];
  const afterEnd = text_after(m);
  if (!kw && /^\s*[鼠牛虎兔龙蛇马羊猴鸡狗猪]+/.test(afterEnd)) return null;
  if (zChars.length !== k) {
    warnings.push(k + '连肖指定了' + k + '个生肖，但实际输入了' + zChars.length + '个（' + zChars + '），请检查');
    return { cat: k + '连肖', nums: [], amt, cnt: 0, total: 0, kw, warnings };
  }
  const groups = zPart.split(new RegExp(SEP_CHARS + '+')).filter(g => g.trim().length >= k);
  const results = [];
  for (const zg of groups) { results.push(...zCombosKeepOrder(zg, k)); }
  const cnt = results.length || 0;
  if (cnt > 1 && !kw) warnings.push('这行没有写关键词和金额，请在号码后面加上"各/各号+金额"');
  return { cat: k + '连肖', nums: results, amt, cnt, total: amt * cnt, kw, warnings };
}

// 连尾复式
function _h_lianwei_fushi(m) {
  const full = m[0];
  const { amt, kw } = extractAmtAndKw(full);
  if (!amt || amt <= 0) return null;
  const k = toNum(m[1]);
  if (!k || k < 2 || k > 5) return null;
  const tailPart = m[2];
  const digits = (tailPart.match(/\d/g) || []);
  if (digits.length < k) return null;
  const comb = tailCKeepOrder(digits.join(','), k);
  const warnings = [];
  if (_check_dup_in_tails(digits, '连尾', warnings)) {
    return { cat: k + '连尾', nums: [], amt, cnt: 0, total: 0, kw, warnings };
  }
  if (!kw) warnings.push('这行没有写关键词和金额，请在号码后面加上"各/各号+金额"');
  return { cat: k + '连尾', nums: comb, amt, cnt: comb.length, total: amt * comb.length, kw, warnings };
}

// 尾数+连尾+数字
function _h_tail_num_lw(m) {
  const full = m[0];
  const { amt, kw } = extractAmtAndKw(full);
  if (!amt || amt <= 0) return null;
  const tailPart = m[1];
  const digits = (tailPart.match(/\d/g) || []);
  const k = toNum(m[2] || m[3]);
  if (!k || k < 2 || k > 5) return null;
  const warnings = [];
  const afterEnd = text_after(m);
  if (!kw && /^\s*\d+/.test(afterEnd)) return null;
  if (digits.length !== k) {
    warnings.push(k + '连尾指定了' + k + '个尾数，但实际输入了' + digits.length + '个，请检查');
    return { cat: k + '连尾', nums: [], amt, cnt: 0, total: 0, kw, warnings };
  }
  const comb = tailCKeepOrder(digits.join(','), k);
  const warnings2 = [];
  if (_check_dup_in_tails(digits, '连尾', warnings2)) {
    return { cat: k + '连尾', nums: [], amt, cnt: 0, total: 0, kw, warnings: warnings2 };
  }
  if (comb.length > 1 && !kw) warnings2.push('这行没有写关键词和金额，请在号码后面加上"各/各号+金额"');
  return { cat: k + '连尾', nums: comb, amt, cnt: comb.length, total: amt * comb.length, kw, warnings: warnings2 };
}

// 复式连肖
function _h_fu_lianxiao(m) {
  const full = m[0];
  const { amt, kw } = extractAmtAndKw(full);
  if (!amt || amt <= 0) return null;
  const kDigit = m[1] ? toNum(m[1].replace(/[^0-9二三四五两]/g, '')) : null;
  const zPart = m[2].trim();
  const zChars = (zPart.match(new RegExp('[' + ZODIAC + ']', 'g')) || []).join('');
  if (!zChars || zChars.length < 2) return null;
  const k = kDigit || Math.min(zChars.length, 5);
  if (k < 2 || k > 5 || zChars.length < k) return null;
  const comb = zCombosKeepOrder(zChars, k);
  const warnings = [];
  if (_check_dup_in_chars(zChars, '连肖', warnings)) {
    return { cat: k + '连肖', nums: [], amt, cnt: 0, total: 0, kw, warnings };
  }
  if (comb.length > 1 && !kw) warnings.push('这行没有写关键词和金额，请在号码后面加上"各/各号+金额"');
  return { cat: k + '连肖', nums: comb, amt, cnt: comb.length, total: amt * comb.length, kw, warnings };
}

// 复式连尾
function _h_fu_lianwei(m) {
  const full = m[0];
  const { amt, kw } = extractAmtAndKw(full);
  if (!amt || amt <= 0) return null;
  const kDigit = m[1] ? toNum(m[1]) : null;
  const tailPart = m[2];
  const digits = (tailPart.match(/\d/g) || []);
  const k = kDigit || Math.min(digits.length, 5);
  if (k < 2 || k > 5 || digits.length < k) return null;
  const comb = tailCKeepOrder(digits.join(','), k);
  const warnings = [];
  if (_check_dup_in_tails(digits, '连尾', warnings)) {
    return { cat: k + '连尾', nums: [], amt, cnt: 0, total: 0, kw, warnings };
  }
  if (comb.length > 1 && !kw) warnings.push('这行没有写关键词和金额，请在号码后面加上"各/各号+金额"');
  return { cat: k + '连尾', nums: comb, amt, cnt: comb.length, total: amt * comb.length, kw, warnings };
}

// 尾数+复式+连尾/尾数+连尾+复式（通用）
function _h_tail_fushi_lw(m) {
  const full = m[0];
  const { amt, kw } = extractAmtAndKw(full);
  if (!amt || amt <= 0) return null;
  const tailPart = m[1];
  const digits = (tailPart.match(/\d/g) || []);
  const k = toNum(m[2]);
  if (!k || k < 2 || k > 5) return null;
  if (digits.length < k) return null;
  const comb = tailCKeepOrder(digits.join(','), k);
  const warnings = [];
  if (_check_dup_in_tails(digits, '连尾', warnings)) {
    return { cat: k + '连尾', nums: [], amt, cnt: 0, total: 0, kw, warnings };
  }
  if (!kw) warnings.push('这行没有写关键词和金额，请在号码后面加上"各/各号+金额"');
  return { cat: k + '连尾', nums: comb, amt, cnt: comb.length, total: amt * comb.length, kw, warnings };
}

// N不中（五~十八不中）
const _CN_NUM_MAP = { '五': 5, '六': 6, '七': 7, '八': 8, '九': 9, '十': 10,
  '十一': 11, '十二': 12, '十三': 13, '十四': 14, '十五': 15,
  '十六': 16, '十七': 17, '十八': 18 };
function _h_buzhong(m) {
  const k = _CN_NUM_MAP[m[1]] || (m[1] && /^\d+$/.test(m[1]) ? parseInt(m[1]) : 0);
  if (!k || k < 5 || k > 18) return null;
  const full = m[0];
  const { amt, kw } = extractAmtAndKw(full);
  if (!amt || amt <= 0) return null;
  if (!kw) {
    return { cat: '__unrecognized__', nums: [], amt: 0, cnt: 0, total: 0, kw: '',
      warnings: ['这行没有写关键词和金额，请在号码后面加上"各/各号+金额"'], rawLine: full };
  }
  const items = (m[2].match(new RegExp('[' + ZODIAC + ']+|\\d{1,2}', 'g')) || []).filter(s => s.trim());
  const nums = _items_to_nums(items);
  const invalidNums = findInvalidNums(m[2]);
  if (invalidNums.length) {
    return { cat: '__unrecognized__', nums: [], amt: 0, cnt: 0, total: 0, kw: '',
      warnings: ['号码' + invalidNums.join('、') + '超出范围（1-49），请检查重新输入'], rawLine: full };
  }
  const warnings = [];
  const raw_nums = items.filter(item => /^\d{1,2}$/.test(item));
  const seen = {};
  const dups = [];
  for (const n of raw_nums) {
    if (seen[n]) { if (!dups.includes(n)) dups.push(n); }
    seen[n] = true;
  }
  if (dups.length) {
    warnings.push('存在重复号码' + dups.sort((a,b) => parseInt(a)-parseInt(b)).join('、') + '，请检查');
    return { cat: k + '不中', nums: [], amt, cnt: 0, total: 0, kw, warnings };
  }
  if (nums.length !== k) {
    warnings.push(k + '不中需要' + k + '个号码，当前输入了' + nums.length + '个号码（' + nums.join('-') + '），请调整');
    return { cat: k + '不中', nums: [], amt, cnt: 0, total: 0, kw, warnings };
  }
  const cbs = combos(nums, k).map(c => c.join('-'));
  if (cbs.length > 1 && !kw) warnings.push('这行没有写关键词和金额，请在号码后面加上"各/各号+金额"');
  return { cat: k + '不中', nums: cbs, amt, cnt: cbs.length, total: amt * cbs.length, kw, warnings };
}

// =============================================================================
// processOneLine - 单行识别（保留号码-金额对简单配对 + 增强tryMatchTeXiao验证 + 中文金额格式处理）
// =============================================================================
// 检查剩余文本是否只是合计数字（避免合计数字被误当作号码报错）
function _isTotalRemaining(text) {
  if (!text) return true;
  let t = String(text).trim();
  t = t.replace(/^[，,、\s]+/, '');
  if (!t) return true;
  const totalKws = '共(?:计)?|总(?:共|计|金额|投注|投入|额)?|合(?:计|共)?|计|一共|全部|小计|一起|全|🈴';
  return new RegExp(
    '^(?:' + totalKws + ')?\\s*\\d+(?:\\.\\d+)?\\s*' +
    '(?:米|元|块|角|分|厘|眯|咪|井|#|快|斤|文|蚊|纹|园|圆)?\\s*$'
  ).test(t);
}

// 检查是否只包含玩法名（无实际号码、生肖、金额关键字）
function _is_play_name_only(text) {
  const t = String(text || '').trim();
  if (!t) return false;
  const playSet = new Set(PLAY_NAMES_LIST);
  if (playSet.has(t)) return true;
  for (const prefix of ['二', '三', '四', '五', '2', '3', '4', '5']) {
    if (t.startsWith(prefix) && playSet.has(t.substring(prefix.length))) return true;
  }
  if (t.startsWith('复式') && playSet.has(t.substring(2))) return true;
  return false;
}

function processOneLine(line, inheritedPlay = null) {
  if (!line.trim()) return [];
  // 如果只输入了玩法名（没有号码、生肖、金额），不产生结果也不报警
  // （对应 Python processOneLine 顶部的 _is_play_name_only 提前返回；
  //   玩法继承 --order-- 的首行即单独的玩法名，须被静默跳过）
  if (_is_play_name_only(line)) return [];
  const defaultSuffixes = ['米', '元', '块', '角', '分', '厘'];
  const userSuffixes = getCustomAmountSuffixes();
  const combinedSuffixes = [...new Set([...defaultSuffixes, ...userSuffixes])];
  const suffixList = combinedSuffixes.length ? combinedSuffixes.join('|') : '';
  const suffixPattern = suffixList ? `(?:${suffixList})?` : '';
  const amtPart = `((?:\\d+|[一二三四五六七八九十百千两]+)${suffixPattern})`;
  const numPart = '(\\d{1,2})';
  const sepPart = `[\\s,\\-.。、+\\-*＊\\/\\\\|]+`;
  const pairRe = new RegExp(`^\\s*${numPart}\\s*${sepPart}\\s*${amtPart}\\s*$`);
  const pairMatch = line.match(pairRe);
  if (pairMatch) {
    const num = pairMatch[1].padStart(2, '0');
    let amtStr = pairMatch[2];
    if (suffixList) {
      const suffixRe = new RegExp(`(${suffixList})$`);
      amtStr = amtStr.replace(suffixRe, '');
    }
    const amt = toNum(amtStr);
    if (parseInt(num) >= 1 && parseInt(num) <= 49 && amt > 0) {
      return [{ cat: '特码', nums: [num], amt, cnt: 1, total: amt, kw: '各', warnings: [] }];
    }
  }
  // ===== 号码-金额对识别结束 =====

  const ZODIAC_SET = new Set('鼠牛虎兔龙蛇马羊猴鸡狗猪'.split(''));

  // ===== 增强tryMatchTeXiao的验证 =====
  function tryMatchTeXiao(content) {
    if (!content || !content.trim()) return null;
    if (/特码/.test(content)) return null;
    // 跳过含"号各"的内容
    if (/号各|号\s*各/.test(content)) return null;
    
    const trimmed = content.trim();
    const shxMatch = trimmed.match(new RegExp(`(.+?)(各肖|各(?!数|号|组|码|注|下|买))\\s*(\\d+)`));
    if (!shxMatch) return null;
    const rawContent = shxMatch[1]; const amtRaw = parseInt(shxMatch[3]) || 0; const kw = shxMatch[2] || '';
    if (amtRaw <= 0) return null;
    // 关键字含"号"就退出
    if (kw && kw.includes('号')) return null;
    
    const zodiacChars = []; for (const ch of rawContent) { if (ZODIAC_SET.has(ch)) zodiacChars.push(ch); }
    if (zodiacChars.length > 0) {
      const cnt = zodiacChars.length; const total = amtRaw * cnt;
      const warnings = []; if (cnt > 1 && !kw) warnings.push('缺少金额关键字');
      return { cat: '特肖', nums: zodiacChars, amt: amtRaw, cnt: cnt, total: total, kw: kw || '各', warnings };
    }
    return null;
  }

  const specialMatches = collectSpecialMatches(line);
  const results = [];
  let lastEnd = 0;

  for (const m of specialMatches) {
    if (m.start < lastEnd) {
      continue;
    }
    if (m.start > lastEnd) {
      const content = line.substring(lastEnd, m.start);
      let subLast = 0;
      const kwReLocal = new RegExp(`(${KW_LIST.join('|')})\\s*(${AMT_RE_STR})`, 'g');
      let subMatch;
      while ((subMatch = kwReLocal.exec(content)) !== null) {
        const subContent = content.substring(subLast, subMatch.index);
        
        // ===== 范围号码识别 =====
        if (subContent.includes('到') || (subMatch[0] && subMatch[0].includes('到'))) {
          const combined = subContent + (subMatch ? subMatch[0] : '');
          const rangeMatch = combined.match(/(\d{1,2})\s*到\s*(\d{1,2})/);
          if (rangeMatch) {
            const start = parseInt(rangeMatch[1]);
            const end = parseInt(rangeMatch[2]);
            const amt = toNum(subMatch[2]);
            const kw = subMatch[1];
            
            if (!kw) {
              results.push({ cat: '__unrecognized__', nums: [], amt: 0, cnt: 0, total: 0, kw: '',
                warnings: ['缺少金额关键字'], rawLine: combined.trim() });
            } else if (start >= 1 && end <= 49 && start <= end) {
              const nums = [];
              for (let i = start; i <= end; i++) { nums.push(String(i).padStart(2, '0')); }
              results.push({ cat: '特码', nums: nums, amt: amt, cnt: nums.length, total: amt * nums.length, kw: kw, warnings: [] });
            } else {
              results.push({ cat: '__unrecognized__', nums: [], amt: 0, cnt: 0, total: 0, kw: '',
                warnings: ['号码范围无效，请检查'], rawLine: combined.trim() });
            }
            subLast = subMatch.index + subMatch[0].length;
            continue;
          }
        }
        
        const teXiaoResult = tryMatchTeXiao(subContent + subMatch[0]);
        if (teXiaoResult) {
          results.push(teXiaoResult);
        } else {
          const seg = parseTeMaSegment(subContent);
          if (seg) {
            const amt = toNum(subMatch[2]);
            const kw = subMatch[1];
            const cnt = seg.allNumsArr ? seg.allNumsArr.length : seg.totalCount;
            results.push({ cat: '特码', nums: seg.displayItems, amt, cnt: cnt, total: amt * cnt, kw, warnings: seg.warnings || [] });
          }
        }
        subLast = subMatch.index + subMatch[0].length;
      }
    }
    results.push(m.result);
    lastEnd = m.end;
  }

  if (lastEnd < line.length) {
    const content = line.substring(lastEnd);
    let subLast = 0;
    const kwReLocal = new RegExp(`(${KW_LIST.join('|')})\\s*(${AMT_RE_STR})`, 'g');
    let subMatch;
    while ((subMatch = kwReLocal.exec(content)) !== null) {
      const subContent = content.substring(subLast, subMatch.index);
      
      // ===== 范围号码识别 =====
      if (subContent.includes('到') || (subMatch[0] && subMatch[0].includes('到'))) {
        const combined = subContent + (subMatch ? subMatch[0] : '');
        const rangeMatch = combined.match(/(\d{1,2})\s*到\s*(\d{1,2})/);
        if (rangeMatch) {
          const start = parseInt(rangeMatch[1]);
          const end = parseInt(rangeMatch[2]);
          const amt = toNum(subMatch[2]);
          const kw = subMatch[1];
          
          if (!kw) {
            results.push({ cat: '__unrecognized__', nums: [], amt: 0, cnt: 0, total: 0, kw: '',
              warnings: ['缺少金额关键字'], rawLine: combined.trim() });
          } else if (start >= 1 && end <= 49 && start <= end) {
            const nums = [];
            for (let i = start; i <= end; i++) { nums.push(String(i).padStart(2, '0')); }
            results.push({ cat: '特码', nums: nums, amt: amt, cnt: nums.length, total: amt * nums.length, kw: kw, warnings: [] });
          } else {
            results.push({ cat: '__unrecognized__', nums: [], amt: 0, cnt: 0, total: 0, kw: '',
              warnings: ['号码范围无效，请检查'], rawLine: combined.trim() });
          }
          subLast = subMatch.index + subMatch[0].length;
          continue;
        }
      }
      
      const teXiaoResult = tryMatchTeXiao(subContent + subMatch[0]);
      if (teXiaoResult) {
        results.push(teXiaoResult);
      } else {
        const seg = parseTeMaSegment(subContent);
        if (seg) {
          const amt = toNum(subMatch[2]);
          const kw = subMatch[1];
          const cnt = seg.allNumsArr ? seg.allNumsArr.length : seg.totalCount;
          results.push({ cat: '特码', nums: seg.displayItems, amt, cnt: cnt, total: amt * cnt, kw, warnings: seg.warnings || [] });
        }
      }
      subLast = subMatch.index + subMatch[0].length;
    }
    if (subLast < content.length) {
      const remaining = content.substring(subLast).trim();
      
      // 剩余文本只是合计数字，跳过
      if (_isTotalRemaining(remaining)) {
        // skip
      } else if (remaining.includes('到')) {
        const rangeMatch = remaining.match(/(\d{1,2})\s*到\s*(\d{1,2})/);
        if (rangeMatch) {
          const start = parseInt(rangeMatch[1]);
          const end = parseInt(rangeMatch[2]);
          const amtMatch = remaining.match(/(各(?:数|号|组|码|注|下|买)?)\s*(\d+)/);
          if (amtMatch) {
            const amt = toNum(amtMatch[2]);
            if (start >= 1 && end <= 49 && start <= end && amt > 0) {
              const nums = [];
              for (let i = start; i <= end; i++) { nums.push(String(i).padStart(2, '0')); }
              results.push({ cat: '特码', nums: nums, amt: amt, cnt: nums.length, total: amt * nums.length, kw: amtMatch[1], warnings: [] });
            } else {
              results.push({ cat: '__unrecognized__', nums: [], amt: 0, cnt: 0, total: 0, kw: '',
                warnings: ['号码范围无效，请检查'], rawLine: remaining });
            }
          } else {
            results.push({ cat: '__unrecognized__', nums: [], amt: 0, cnt: 0, total: 0, kw: '',
              warnings: ['缺少金额关键字'], rawLine: remaining });
          }
        }
      } else if (remaining && containsDictElement(remaining)) {
        const kwReCheck = new RegExp('(' + KW_LIST.join('|') + ')');
        if (inheritedPlay && !kwReCheck.test(remaining)) {
          results.push({ cat: '__unrecognized__', nums: [], amt: 0, cnt: 0, total: 0, kw: '',
            warnings: [], rawLine: remaining });
        } else {
          const teXiaoResult = tryMatchTeXiao(remaining);
          if (teXiaoResult) {
            results.push(teXiaoResult);
          } else {
            results.push({ cat: '__unrecognized__', nums: [], amt: 0, cnt: 0, total: 0, kw: '',
              warnings: ['这行无法识别，请检查格式是否正确，需要写玩法名、号码/生肖和金额'], rawLine: remaining });
          }
        }
      }
    }
  }

  if (specialMatches.length === 0 && results.length === 0) {
    // ===== 整行检查范围号码 =====
    if (line.includes('到')) {
      const rangeMatch = line.match(/(\d{1,2})\s*到\s*(\d{1,2})/);
      if (rangeMatch) {
        const start = parseInt(rangeMatch[1]);
        const end = parseInt(rangeMatch[2]);
        const amtMatch = line.match(/(各(?:数|号|组|码|注|下|买)?)\s*(\d+)/);
        
        if (amtMatch) {
          const amt = toNum(amtMatch[2]);
          if (start >= 1 && end <= 49 && start <= end && amt > 0) {
            const nums = [];
            for (let i = start; i <= end; i++) { nums.push(String(i).padStart(2, '0')); }
            return [{ cat: '特码', nums: nums, amt: amt, cnt: nums.length, total: amt * nums.length, kw: amtMatch[1], warnings: [] }];
          } else {
            return [{ cat: '__unrecognized__', nums: [], amt: 0, cnt: 0, total: 0, kw: '',
              warnings: ['号码范围无效，请检查'], rawLine: line.trim() }];
          }
        } else {
          return [{ cat: '__unrecognized__', nums: [], amt: 0, cnt: 0, total: 0, kw: '',
            warnings: ['缺少金额关键字'], rawLine: line.trim() }];
        }
      }
    }
    
    // inheritedPlay 继承上下文：无关键字时标记为 __unrecognized__ 但无警告（让继承函数处理）
    const kwReCheck = new RegExp('(' + KW_LIST.join('|') + ')');
    if (inheritedPlay && !kwReCheck.test(line)) {
      if (containsDictElement(line)) {
        return [{ cat: '__unrecognized__', nums: [], amt: 0, cnt: 0, total: 0, kw: '',
          warnings: [], rawLine: line.trim() }];
      }
    }
    
    const teXiaoResult = tryMatchTeXiao(line);
    if (teXiaoResult) { return [teXiaoResult]; }
    let subLast = 0;
    const kwReLocal = new RegExp(`(${KW_LIST.join('|')})\\s*(${AMT_RE_STR})`, 'g');
    let subMatch;
    while ((subMatch = kwReLocal.exec(line)) !== null) {
      const subContent = line.substring(subLast, subMatch.index);
      const seg = parseTeMaSegment(subContent);
      if (seg) {
        const amt = toNum(subMatch[2]);
        const kw = subMatch[1];
        const cnt = seg.allNumsArr ? seg.allNumsArr.length : seg.totalCount;
        results.push({ cat: '特码', nums: seg.displayItems, amt, cnt: cnt, total: amt * cnt, kw, warnings: seg.warnings || [] });
      }
      subLast = subMatch.index + subMatch[0].length;
    }
    if (subLast < line.length) {
      const remaining = line.substring(subLast).trim();
      if (_isTotalRemaining(remaining)) {
        // 合计数字，跳过
      } else if (remaining && containsDictElement(remaining)) {
        const teXiaoResult = tryMatchTeXiao(remaining);
        if (teXiaoResult) { results.push(teXiaoResult); }
        else {
          results.push({ cat: '__unrecognized__', nums: [], amt: 0, cnt: 0, total: 0, kw: '',
            warnings: ['这行无法识别，请检查格式是否正确，需要写玩法名、号码/生肖和金额'], rawLine: remaining });
        }
      }
    }
  }
  return results;
}



// =============================================================================
// applyInlineInheritance - 增强版继承函数（移植自 Python parser.py）
// 关键字一致性检查 + 格式匹配检查 + 特肖/特码→连肖继承 + 多组继承 + 打断链
// =============================================================================
function applyInlineInheritance(lineResults, lastInheritablePlay = null) {
  if (!lineResults || lineResults.length === 0) return { results: lineResults, lastPlay: lastInheritablePlay };

  const inheritableCats = {
    '平特肖': { type: 'zodiac', count: 1 },
    '平特尾': { type: 'tail', count: 1 }
  };
  for (let i = 2; i <= 5; i++) {
    inheritableCats[i + '连肖'] = { type: 'zodiac', count: i };
    inheritableCats[i + '连尾'] = { type: 'tail', count: i };
  }
  const ZODIAC_SET = new Set('鼠牛虎兔龙蛇马羊猴鸡狗猪'.split(''));

  // 1. 确定本行的继承源
  let inheritedPlay = lastInheritablePlay;
  for (const r of lineResults) {
    if (r.cat !== '__unrecognized__' && inheritableCats[r.cat]) {
      inheritedPlay = { cat: r.cat, kw: r.kw || '', ...inheritableCats[r.cat] };
      break;
    }
  }

  // 2. 遍历处理
  const processed = [];
  let keywordMismatchBreak = false; // 关键词不一致时打断后续继承链
  for (const r of lineResults) {
    if (r.cat !== '__unrecognized__') {
      // ----- 特肖继承连肖：如果上游有连肖玩法，将特肖转为连肖 -----
      if (inheritedPlay && inheritedPlay.type === 'zodiac' && inheritedPlay.count >= 2 && r.cat === '特肖') {
        const zodiacs = r.nums || [];
        if (zodiacs.length === inheritedPlay.count && (r.kw || '') === (inheritedPlay.kw || '')) {
          const comboStr = zodiacs.join('');
          processed.push({
            cat: inheritedPlay.cat, nums: [comboStr], amt: r.amt, cnt: 1, total: r.amt,
            kw: inheritedPlay.kw || '各组', warnings: [], rawLine: r.rawLine || '', _inherited: true
          });
          continue;
        }
        // 特肖关键词不一致，继承链打断
        keywordMismatchBreak = true;
      }
      // ----- 特码继承连肖：将特码中的生肖提取出来转为连肖 -----
      if (inheritedPlay && inheritedPlay.type === 'zodiac' && inheritedPlay.count >= 2 && r.cat === '特码') {
        const zodiacChars = (r.nums || []).filter(n => ZODIAC_SET.has(n));
        if (zodiacChars.length === inheritedPlay.count) {
          const contentKw = r.kw || '';
          const inheritedKw = inheritedPlay.kw || '';
          if (contentKw && contentKw !== inheritedKw) {
            keywordMismatchBreak = true;
            processed.push(r);
            continue;
          }
          const comboStr = zodiacChars.join('');
          processed.push({
            cat: inheritedPlay.cat, nums: [comboStr], amt: r.amt, cnt: 1, total: r.amt,
            kw: contentKw || inheritedPlay.kw || '各组', warnings: [], rawLine: r.rawLine || '', _inherited: true
          });
          continue;
        }
      }
      processed.push(r);
      continue;
    }
    if (!inheritedPlay) { processed.push(r); continue; }

    let raw = (r.rawLine || '').trim();
    // 去掉末尾标点符号，避免影响金额提取
    raw = raw.replace(/[，,。.、；;：:！!？?]+$/, '');
    if (!raw) { processed.push(r); continue; }

    const amtMatch = raw.match(/(\d+)\s*$/);
    if (!amtMatch) { processed.push(r); continue; }
    const amt = parseInt(amtMatch[1]) || 0;
    if (amt <= 0) { processed.push(r); continue; }

    let content = raw.substring(0, amtMatch.index).trim();
    if (!content) { processed.push(r); continue; }

    // 提取内容中的关键字
    let contentKw = '';
    for (const kw of KW_LIST) {
      if (content.includes(kw)) { contentKw = kw; break; }
    }

    const inheritedKw = inheritedPlay.kw || '';
    if (contentKw !== inheritedKw) {
      // 无关键词时允许继承（只有连肖/连尾才允许这种写法）
      // 有关键词但关键词不一致时，不继承，并打断后续继承链
      if (contentKw) {
        keywordMismatchBreak = true;
        r.warnings = ['关键字不一致（需要"' + (inheritedKw || '无关键字') + '"，实际"' + (contentKw || '无关键字') + '"）'];
        processed.push(r);
        continue;
      }
    }

    // 清理内容中的关键字
    let cleanContent = content;
    if (contentKw) { cleanContent = content.replace(new RegExp(contentKw), '').trim(); }
    cleanContent = cleanContent.replace(/[\s,，.。、+\-*＊\/\\|]+/g, '-');

    // 格式匹配检查
    let matched = false;
    if (inheritedPlay.type === 'zodiac') {
      let items = cleanContent.split('-').filter(i => i.trim());
      // 如果拆分后数量不匹配，尝试把整串当纯生肖逐字符拆分
      if (items.length !== inheritedPlay.count) {
        const pureZodiacStr = cleanContent.replace(/[^鼠牛虎兔龙蛇马羊猴鸡狗猪]/g, '');
        if (pureZodiacStr.length === inheritedPlay.count) {
          items = pureZodiacStr.split('');
        }
      }
      if (inheritedPlay.count === 1) {
        if (items.length === 1 && /^[鼠牛虎兔龙蛇马羊猴鸡狗猪]$/.test(items[0].trim())) {
          processed.push({ cat: inheritedPlay.cat, nums: [items[0].trim()], amt: amt, cnt: 1, total: amt, kw: inheritedPlay.kw || '各', warnings: [], rawLine: raw, _inherited: true });
          matched = true;
        }
      } else {
        if (items.length === inheritedPlay.count && items.every(i => /^[鼠牛虎兔龙蛇马羊猴鸡狗猪]$/.test(i.trim()))) {
          const comboStr = items.map(i => i.trim()).join('');
          processed.push({ cat: inheritedPlay.cat, nums: [comboStr], amt: amt, cnt: 1, total: amt, kw: inheritedPlay.kw || '各组', warnings: [], rawLine: raw, _inherited: true });
          matched = true;
        } else {
          // 尝试按分隔符拆分成多组独立继承（如"龙虎鼠20 龙虎猴20 龙虎羊20"）
          const multiPat = new RegExp('((?:[' + Object.keys(ZODIAC_NUMS).join('') + ']){' + inheritedPlay.count + '})\\s*(\\d+)', 'g');
          const multiMatches = [];
          let mm;
          while ((mm = multiPat.exec(raw)) !== null) {
            multiMatches.push(mm);
          }
          if (multiMatches.length > 0) {
            // 检查是否有生肖字符未被任何匹配覆盖
            const covered = new Array(raw.length).fill(false);
            for (const mm of multiMatches) {
              for (let pos = mm.index; pos < mm.index + mm[0].length; pos++) {
                if (pos < raw.length) covered[pos] = true;
              }
            }
            const uncoveredZodiacs = [];
            for (let pos = 0; pos < raw.length; pos++) {
              if (!covered[pos] && ZODIAC_SET.has(raw[pos])) {
                uncoveredZodiacs.push(raw[pos]);
              }
            }
            if (uncoveredZodiacs.length > 0) {
              // 有未被覆盖的生肖字符→存在多余字符，不继承，给出警告
              const uniqueExtra = [...new Set(uncoveredZodiacs)].join('');
              r.warnings = ['格式不匹配，存在多余生肖字符"' + uniqueExtra + '"，需要' + inheritedPlay.count + '个连续生肖+金额，请检查'];
              processed.push(r);
              matched = true;
            } else {
              const multiResults = [];
              for (const mm of multiMatches) {
                const eZodiac = mm[1];
                const eAmt = parseInt(mm[2]) || 0;
                if (!eAmt || eAmt <= 0) continue;
                if (eZodiac.length !== inheritedPlay.count) continue;
                const comboStr = eZodiac.split('').join('-');
                multiResults.push({ cat: inheritedPlay.cat, nums: [comboStr], amt: eAmt, cnt: 1, total: eAmt, kw: inheritedPlay.kw || '各组', warnings: [], rawLine: raw, _inherited: true });
              }
              if (multiResults.length > 0) {
                processed.push(...multiResults);
                matched = true;
              }
            }
          }
        }
      }
    } else if (inheritedPlay.type === 'tail') {
      let items = cleanContent.split('-').filter(i => /\d+尾/.test(i.trim()));
      if (items.length !== inheritedPlay.count) {
        const pureDigits = cleanContent.replace(/[^0-9]/g, '');
        if (pureDigits.length === inheritedPlay.count) {
          items = pureDigits.split('').map(d => d + '尾');
        }
      }
      if (inheritedPlay.count === 1) {
        if (items.length === 1 && /\d+尾$/.test(items[0].trim())) {
          processed.push({ cat: inheritedPlay.cat, nums: [items[0].trim()], amt: amt, cnt: 1, total: amt, kw: inheritedPlay.kw || '各', warnings: [], rawLine: raw, _inherited: true });
          matched = true;
        }
      } else {
        if (items.length === inheritedPlay.count && items.every(i => /\d+尾$/.test(i.trim()))) {
          const comboStr = items.map(i => i.trim()).join('-');
          processed.push({ cat: inheritedPlay.cat, nums: [comboStr], amt: amt, cnt: 1, total: amt, kw: inheritedPlay.kw || '各组', warnings: [], rawLine: raw, _inherited: true });
          matched = true;
        }
      }
    }

    if (!matched) {
      r.warnings = ['格式不匹配，需要' + inheritedPlay.count + '个' + (inheritedPlay.type === 'zodiac' ? '生肖' : '尾数') + '，请检查'];
      processed.push(r);
    }
  }

  // 3. 确定传递给下一行的继承源
  let outgoingPlay = lastInheritablePlay;
  if (!keywordMismatchBreak) {
    for (let i = lineResults.length - 1; i >= 0; i--) {
      const r = lineResults[i];
      if (r.cat !== '__unrecognized__' && inheritableCats[r.cat]) {
        outgoingPlay = { cat: r.cat, kw: r.kw || '', ...inheritableCats[r.cat] };
        break;
      }
    }
  } else {
    outgoingPlay = null;
  }
  return { results: processed, lastPlay: outgoingPlay };
}

// =============================================================================
// 地区关键字提取
// =============================================================================
const REGION_KEYWORDS = {
  'macau': ['澳', '奥', '澳门', '奥门', '门', 'mc', 'MC', 'Mc'],
  'hongkong': ['港', '香', '香港', 'hk', 'HK', 'Hk'],
  'yuegang': ['粤', '粤港', 'yg', 'YG', 'Yg']
};
const REGION_LABELS = { 'macau': '澳门', 'hongkong': '香港', 'yuegang': '粤港' };

function extractRegion(line) {
  const allKeywords = [];
  for (const [region, keywords] of Object.entries(REGION_KEYWORDS)) {
    for (const kw of keywords) { allKeywords.push({ region, keyword: kw, len: kw.length }); }
  }
  allKeywords.sort((a, b) => b.len - a.len);
  for (const { region, keyword } of allKeywords) {
    const idx = line.indexOf(keyword);
    if (idx !== -1) {
      if (idx > 0 && /[\u4e00-\u9fa5]/.test(line.charAt(idx - 1))) continue;
      let remaining = (line.substring(0, idx) + line.substring(idx + keyword.length)).trim();
      // 去掉剩余内容中的动作词前缀
      const ACTION_PREFIXES = ['买', '下', '打', '投', '下注', '买注', '投注', '各下', '各买'].sort((a, b) => b.length - a.length);
      for (const ap of ACTION_PREFIXES) {
        if (remaining.startsWith(ap)) {
          remaining = remaining.substring(ap.length).trim();
          break;
        }
      }
      return { region, remaining };
    }
  }
  return null;
}

// =============================================================================
// 核心识别函数 - performRecognition（UI部分：结果展示、纯订单行生成）
// =============================================================================
function performRecognition(text) {
  const resultDiv = document.getElementById('orderResult');
  if (!text || !text.trim()) {
    if (resultDiv) resultDiv.innerHTML = '';
    window._pureOrderLines = [];
    window._pureOrderRegions = [];
    window._cachedMaxLossData = [];
    updateOrderTotalDisplay();
    updateMaxLossDisplay();
    return;
  }
  let processedText = text;
  processedText = applyReplacePresets(processedText);
  processedText = applyCategoryAliases(processedText);
  processedText = preprocess(processedText);
  const lines = processedText.split('\n');
  const allResults = [];
  const lineRegions = [];
  let currentLineRegion = currentRegion;
  
  // 圆点强制地区模式
  const dotRegion = window._dotRegion || 'auto';

  // 跨行继承上下文
  let lastInheritablePlay = null;

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx];
    if (!line.trim()) continue;
    let orderLine = line;
    
    if (dotRegion !== 'auto') {
      currentLineRegion = dotRegion;
    } else {
      const extracted = extractRegion(line);
      if (extracted) {
        currentLineRegion = extracted.region;
        orderLine = extracted.remaining;
      }
    }
    lineRegions.push(currentLineRegion);
    if (!orderLine.trim()) continue;

    const parsed = processOneLine(orderLine, lastInheritablePlay);
    let lineResults = [];
    if (parsed.length === 0) {
      // 跳过合计数字行（如"共40"、"40"、"40米"等）
      if (_isTotalRemaining(orderLine.trim())) continue;
      // 如果只输入了玩法名（没有号码、生肖、金额），跳过不报警
      if (_is_play_name_only(orderLine)) continue;
      if (containsDictElement(orderLine)) {
        lineResults.push({ cat: '__unrecognized__', nums: [], amt: 0, cnt: 0, total: 0, kw: '',
          warnings: ['这行无法识别，请检查格式是否正确，需要写玩法名、号码/生肖和金额'], rawLine: orderLine.trim() });
      }
    } else {
      lineResults.push(...parsed);
    }
    if (lineResults.length > 0) {
      const inheritResult = applyInlineInheritance(lineResults, lastInheritablePlay);
      lineResults = inheritResult.results;
      lastInheritablePlay = inheritResult.lastPlay;
      lineResults.forEach(r => { r.region = currentLineRegion; r.lineIndex = lineIdx; });
      allResults.push(...lineResults);
    }
  }

  const mergedArray = allResults.map(r => ({
    category: r.cat, numbers: r.nums, unitAmount: r.amt,
    totalCount: r.cnt, totalAmount: r.total, kw: r.kw || '', warnings: r.warnings || [],
    rawLine: r.rawLine || '',
    region: r.region || currentRegion,
    _inherited: r._inherited || false,
    lineIndex: r.lineIndex
  }));

  if (resultDiv) {
    if (mergedArray.length === 0) {
      resultDiv.innerHTML = text ? '<div class="result-line">' + text + '</div>' : '';
      window._pureOrderLines = [];
      window._pureOrderRegions = [];
      window._cachedMaxLossData = [];
    } else {
      displayResults(mergedArray, resultDiv);
    }
  }
  updateOrderTotalDisplay();
  updateMaxLossDisplay();
}

// =============================================================================
// 显示结果
// =============================================================================
function displayResults(rs, container) {
  if (!container) container = document.getElementById('orderResult');
  if (!container) return;
  if (rs.length === 0) { container.innerHTML = ''; window._pureOrderLines = []; window._pureOrderRegions = []; window._cachedMaxLossData = []; return; }
  let total = 0; let html = '';
  const pureLines = [];
  const pureRegions = [];
  const maxLossData = [];

  const regionColorMap = { 'macau': '#e74c3c', 'hongkong': '#3498db', 'yuegang': '#27ae60' };

  for (let i = 0; i < rs.length; i++) {
    const r = rs[i];
    if (r.category === '__unrecognized__') {
      const regionLabel = REGION_LABELS[r.region] || '';
      const warnText = (r.warnings && r.warnings.length) ? r.warnings.join('；') : '缺少金额关键字或有效玩法';
      if (r.region && r.region !== currentRegion && !r.warnings.length) {
        html += '<div class="result-line" data-line-index="' + i + '"><span style="color:' + (regionColorMap[r.region] || '#333') + ';">' + regionLabel + '·</span>' + r.rawLine + ' <span style="color:red;">[已提取地区' + regionLabel + '，但内容无法识别]</span></div>';
      } else {
        const warnClick = (r.warnings && r.warnings.length) ? ' onclick="jumpToInputLine(' + i + ')" style="color:red;cursor:pointer;" title="点击跳转到输入行"' : '';
        html += '<div class="result-line" data-line-index="' + i + '"><span style="color:' + (r.region !== currentRegion ? (regionColorMap[r.region] || '#e74c3c') : '#000') + ';">' + regionLabel + '·</span>' + r.rawLine + ' <span' + warnClick + '>[' + warnText + ']</span></div>';
      }
      continue;
    }
    total += r.totalAmount;
    const regionLabel = REGION_LABELS[r.region] || '';
    const isCurrentRegion = r.region === currentRegion;
    const regionColor = isCurrentRegion ? 'color:#000;' : 'color:' + (regionColorMap[r.region] || '#333') + ';';
    const kwDisplay = (r.category === '特码') ? '各数' : '各';
    const amountStr = kwDisplay + Math.round(r.unitAmount);
    const info = r.totalCount > 1 ? '(' + r.totalCount + '注, 共' + Math.round(r.totalAmount) + ')' : '(共' + Math.round(r.totalAmount) + ')';
    const numStr = formatNums(r.category, r.numbers);
    let line = '<span style="' + regionColor + '">' + regionLabel + '·</span>' + r.category + ':' + numStr + amountStr + ' ' + info;
    if (r._inherited) { line += ' <span style="color:#27ae60;">[继承]</span>'; }
    if (r.warnings && r.warnings.length) {
      line += ' <span onclick="jumpToInputLine(' + i + ')" style="color:red;cursor:pointer;text-decoration:underline dotted;" title="点击跳转到输入行">[' + r.warnings.join('；') + ']</span>';
    }
    html += '<div class="result-line" data-line-index="' + i + '">' + line + '</div>';
    const pureNumStr = formatNums(r.category, r.numbers);
    pureLines.push(r.category + ':' + pureNumStr + ' ' + kwDisplay + ' ' + Math.round(r.unitAmount));
    pureRegions.push(r.region);

    if (r.category === '特码' || r.category === '特肖') {
      maxLossData.push({ category: r.category, numbers: r.numbers, unitAmount: Math.round(r.unitAmount) });
    }
  }

  container.innerHTML = html;
  window._pureOrderLines = pureLines;
  window._pureOrderRegions = pureRegions;
  window._cachedMaxLossData = maxLossData;
}

// ===== 点击报警跳转到输入框对应行 =====
function jumpToInputLine(lineIndex) {
  const textarea = document.querySelector('.source-order-input');
  if (!textarea) return;
  const lines = textarea.value.split('\n');
  let nonEmptyIdx = 0;
  let pos = 0;
  for (let i = 0; i < lines.length; i++) {
    if (nonEmptyIdx === lineIndex) {
      const lineEnd = pos + lines[i].length;
      textarea.focus();
      textarea.setSelectionRange(lineEnd, lineEnd);
      const lineHeight = parseInt(getComputedStyle(textarea).lineHeight) || 20;
      const pad = textarea.clientHeight / 3;
      textarea.scrollTop = Math.max(0, (i * lineHeight) - pad);
      textarea.style.outline = '2px solid #e74c3c';
      textarea.style.outlineOffset = '-2px';
      setTimeout(() => { textarea.style.outline = ''; textarea.style.outlineOffset = ''; }, 1500);
      return;
    }
    pos += lines[i].length + 1;
    nonEmptyIdx++;
  }
}







// ===== 计算最大亏损（仅特码+特肖，按兑奖赔率，不去重） =====
function computeMaxLoss() {
  const data = window._cachedMaxLossData;
  if (!data || data.length === 0) return 0;
  const oddsData = getOddsData();
  const curYearZodiac = document.getElementById('startZodiacSelect')?.value || '马';
  const numPayout = {};
  let totalOrderAmount = 0;
  data.forEach(item => {
    const { category, numbers, unitAmount } = item;
    if (!unitAmount || unitAmount <= 0) return;
    if (category === '特码') {
      const { odds } = getOddsForType('特码', oddsData);
      numbers.forEach(token => {
        let expanded;
        if (/^\d{1,2}$/.test(token) && parseInt(token) >= 1 && parseInt(token) <= 49) { expanded = [String(parseInt(token)).padStart(2, '0')]; }
        else if (ZODIAC_NUMS[token]) { expanded = (ZODIAC_NUMS[token] || '').split(/[\s,，]+/); }
        else if (D[token]) { expanded = keyToAllNums(token) || [token]; }
        else { expanded = [token]; }
        expanded.forEach(num => { numPayout[num] = (numPayout[num] || 0) + unitAmount * odds; });
        totalOrderAmount += expanded.length * unitAmount;
      });
    } else if (category === '特肖') {
      numbers.forEach(zodiac => {
        const isBenming = zodiac === curYearZodiac;
        const type = isBenming ? '特肖本年肖' : '特肖';
        const { odds } = getOddsForType(type, oddsData);
        const nums = (ZODIAC_NUMS[zodiac] || '').split(/[\s,，]+/);
        const payout = unitAmount * odds;
        nums.forEach(num => { numPayout[num] = (numPayout[num] || 0) + payout; });
      });
      totalOrderAmount += numbers.length * unitAmount;
    }
  });
  if (totalOrderAmount === 0) return 0;
  let maxPayout = 0;
  for (const num in numPayout) { if (numPayout[num] > maxPayout) maxPayout = numPayout[num]; }
  const rebateRate = parseFloat(document.getElementById('rebateRate')?.value) || 4;
  return Math.round(totalOrderAmount - totalOrderAmount * (rebateRate / 100) - maxPayout);
}

function updateMaxLossDisplay() {
  const display = document.getElementById('maxLossDisplay');
  if (!display) return;
  const maxLoss = computeMaxLoss();
  if (maxLoss !== 0) { display.textContent = '最大亏损：' + maxLoss; display.style.display = 'inline'; }
  else { display.textContent = ''; display.style.display = 'none'; }
}

// =============================================================================
// 总金额显示与更新
// =============================================================================
function updateOrderTotalDisplay() {
  const display = document.getElementById('orderTotalDisplay');
  if (!display) return;
  if (window._pureOrderLines && window._pureOrderLines.length > 0) {
    let total = 0;
    // 从结果显示中提取总金额
    const resultDiv = document.getElementById('orderResult');
    if (resultDiv) {
      const lines = resultDiv.querySelectorAll('.result-line');
      lines.forEach(ln => {
        const match = ln.textContent.match(/共(\d+)/);
        if (match) total += parseInt(match[1]);
      });
    }
    display.textContent = '总注额：' + total;
    display.style.display = 'inline';
  } else {
    display.textContent = '';
    display.style.display = 'none';
  }
}

// =============================================================================
// 赔率管理函数
// =============================================================================
function showOddsWin() {
  if (document.getElementById('oddsWin')) return;
  const savedOdds = getOddsData();
  const defaults = {
    '特码':{odds:'47',rebate:'4'},
    '特肖':{odds:'11',rebate:'4'},
    '特肖本年肖':{odds:'10',rebate:'4'},
    '平特肖':{odds:'2',rebate:'4'},'平特肖带主肖':{odds:'1.8',rebate:'4'},'二连肖':{odds:'4',rebate:'4'},'二连肖带主肖':{odds:'3.5',rebate:'4'},
    '三连肖':{odds:'10',rebate:'4'},'三连肖带主肖':{odds:'9',rebate:'4'},'四连肖':{odds:'30',rebate:'4'},'四连肖带主肖':{odds:'25',rebate:'4'},
    '五连肖':{odds:'100',rebate:'4'},'五连肖带主肖':{odds:'90',rebate:'4'},'平特尾':{odds:'1.8',rebate:'4'},'平特尾零尾':{odds:'2',rebate:'4'},
    '二连尾':{odds:'3',rebate:'4'},'二连尾零尾':{odds:'3.5',rebate:'4'},'三连尾':{odds:'6',rebate:'4'},'三连尾零尾':{odds:'6.5',rebate:'4'},
    '四连尾':{odds:'14',rebate:'4'},'四连尾零尾':{odds:'15',rebate:'4'},'五连尾':{odds:'28',rebate:'4'},'五连尾零尾':{odds:'30',rebate:'4'},
    '五不中':{odds:'2',rebate:'4'},'六不中':{odds:'2.5',rebate:'4'},'七不中':{odds:'3',rebate:'4'},'八不中':{odds:'3.5',rebate:'4'},
    '九不中':{odds:'4',rebate:'4'},'十不中':{odds:'5',rebate:'4'},'十一不中':{odds:'6',rebate:'4'},'十二不中':{odds:'7',rebate:'4'},
    '十三不中':{odds:'8.5',rebate:'4'},'十四不中':{odds:'10.5',rebate:'4'},'十五不中':{odds:'13',rebate:'4'},
    '十六不中':{odds:'16',rebate:'4'},'十七不中':{odds:'19',rebate:'4'},'十八不中':{odds:'23',rebate:'4'},
    '二中二':{odds:'60',rebate:'4'},'三中二':{odds:'20',rebate:'4'},'三中三':{odds:'600',rebate:'4'},'平码':{odds:'7',rebate:'4'},
    '特碰':{odds:'120',rebate:'4'},
    '包红波':{odds:'2.6',rebate:'4'},'包蓝波':{odds:'2.7',rebate:'4'},'包绿波':{odds:'2.7',rebate:'4'},
    '包红单':{odds:'5',rebate:'4'},'包红双':{odds:'4.7',rebate:'4'},'包红大':{odds:'6',rebate:'4'},'包红小':{odds:'4',rebate:'4'},
    '包蓝单':{odds:'5',rebate:'4'},'包蓝双':{odds:'5',rebate:'4'},'包蓝大':{odds:'4.7',rebate:'4'},'包蓝小':{odds:'6',rebate:'4'},
    '包绿单':{odds:'5',rebate:'4'},'包绿双':{odds:'5',rebate:'4'},'包绿大':{odds:'5',rebate:'4'},'包绿小':{odds:'6',rebate:'4'},
    '包单':{odds:'1.8',rebate:'4'},'包双':{odds:'1.8',rebate:'4'},'包大':{odds:'1.8',rebate:'4'},'包小':{odds:'1.8',rebate:'4'},
    '包家禽':{odds:'1.8',rebate:'4'},'包野兽':{odds:'1.8',rebate:'4'}
  };
  const types = Object.keys(defaults);
  let rows = '';
  types.forEach(t => {
    const saved = savedOdds[t] || {};
    const oddsVal = saved.odds || defaults[t].odds;
    const rebateVal = saved.rebate || defaults[t].rebate;
    rows += `<tr><td style="text-align:center;padding:3px;"><input type="text" class="odds-input" data-type="${t}" data-field="name" value="${t}" style="width:80px;text-align:center;border:none;background:transparent;outline:none;" disabled></td><td><input type="text" class="odds-input" data-type="${t}" data-field="odds" value="${oddsVal}" style="width:60px;text-align:center;border:none;background:transparent;outline:none;" disabled></td><td><input type="text" class="odds-input" data-type="${t}" data-field="rebate" value="${rebateVal}" style="width:60px;text-align:center;border:none;background:transparent;outline:none;" disabled></td></tr>`;
  });
  const win = document.createElement('div'); win.className = 'floating-window'; win.id = 'oddsWin';
  win.style.width = '550px'; win.style.height = '650px'; win.style.left = '50%'; win.style.top = '50%'; win.style.transform = 'translate(-50%, -50%)';
  win.innerHTML = `
    <div class="modal-header"><h3>赔率设置</h3><div class="window-controls"><button onclick="maximizeWindow('oddsWin')">🗖</button><button onclick="document.getElementById('oddsWin').remove()">×</button></div></div>
    <div class="modal-body" style="overflow-y:auto;">
      <table style="width:100%;"><thead><tr><th style="text-align:center;">玩法</th><th style="text-align:center;">赔率</th><th style="text-align:center;">反水%</th></tr></thead><tbody>${rows}</tbody></table>
    </div>
    <div class="modal-footer">
      <button class="btn" style="background:#f39c12;color:#fff;padding:4px 12px;font-size:12px;min-height:28px;" onclick="enableOddsEdit()">修改</button>
      <button class="btn" style="background:#28a745;color:#fff;padding:4px 12px;font-size:12px;min-height:28px;" onclick="saveOddsData()">保存</button>
      <button class="btn" style="background:#3498db;color:#fff;padding:4px 12px;font-size:12px;min-height:28px;" onclick="resetOddsToDefault()">恢复默认</button>
      <button class="btn" style="background:#6c757d;color:#fff;padding:4px 12px;font-size:12px;min-height:28px;" onclick="document.getElementById('oddsWin').remove()">关闭</button>
    </div>`;
  document.body.appendChild(win);
  makeWindowDraggable('oddsWin'); highestZ += 1; win.style.zIndex = highestZ;
}

function resetOddsToDefault() {
  const defaults = {
    '特码':{odds:'47',rebate:'4'},
    '特肖':{odds:'11',rebate:'4'},
    '特肖本年肖':{odds:'10',rebate:'4'},
    '平特肖':{odds:'2',rebate:'4'},'平特肖带主肖':{odds:'1.8',rebate:'4'},'二连肖':{odds:'4',rebate:'4'},'二连肖带主肖':{odds:'3.5',rebate:'4'},
    '三连肖':{odds:'10',rebate:'4'},'三连肖带主肖':{odds:'9',rebate:'4'},'四连肖':{odds:'30',rebate:'4'},'四连肖带主肖':{odds:'25',rebate:'4'},
    '五连肖':{odds:'100',rebate:'4'},'五连肖带主肖':{odds:'90',rebate:'4'},'平特尾':{odds:'1.8',rebate:'4'},'平特尾零尾':{odds:'2',rebate:'4'},
    '二连尾':{odds:'3',rebate:'4'},'二连尾零尾':{odds:'3.5',rebate:'4'},'三连尾':{odds:'6',rebate:'4'},'三连尾零尾':{odds:'6.5',rebate:'4'},
    '四连尾':{odds:'14',rebate:'4'},'四连尾零尾':{odds:'15',rebate:'4'},'五连尾':{odds:'28',rebate:'4'},'五连尾零尾':{odds:'30',rebate:'4'},
    '五不中':{odds:'2',rebate:'4'},'六不中':{odds:'2.5',rebate:'4'},'七不中':{odds:'3',rebate:'4'},'八不中':{odds:'3.5',rebate:'4'},
    '九不中':{odds:'4',rebate:'4'},'十不中':{odds:'5',rebate:'4'},'十一不中':{odds:'6',rebate:'4'},'十二不中':{odds:'7',rebate:'4'},
    '二中二':{odds:'60',rebate:'4'},'三中三':{odds:'600',rebate:'4'},'平码':{odds:'7',rebate:'4'},
    '特碰':{odds:'120',rebate:'4'},
    '包红波':{odds:'2.6',rebate:'4'},'包蓝波':{odds:'2.7',rebate:'4'},'包绿波':{odds:'2.7',rebate:'4'},
    '包红单':{odds:'5',rebate:'4'},'包红双':{odds:'4.7',rebate:'4'},'包红大':{odds:'6',rebate:'4'},'包红小':{odds:'4',rebate:'4'},
    '包蓝单':{odds:'5',rebate:'4'},'包蓝双':{odds:'5',rebate:'4'},'包蓝大':{odds:'4.7',rebate:'4'},'包蓝小':{odds:'6',rebate:'4'},
    '包绿单':{odds:'5',rebate:'4'},'包绿双':{odds:'5',rebate:'4'},'包绿大':{odds:'5',rebate:'4'},'包绿小':{odds:'6',rebate:'4'},
    '包单':{odds:'1.8',rebate:'4'},'包双':{odds:'1.8',rebate:'4'},'包大':{odds:'1.8',rebate:'4'},'包小':{odds:'1.8',rebate:'4'},
    '包家禽':{odds:'1.8',rebate:'4'},'包野兽':{odds:'1.8',rebate:'4'}
  };
  document.querySelectorAll('.odds-input[data-field="odds"]').forEach(inp => {
    const type = inp.dataset.type;
    if (defaults[type]) inp.value = defaults[type].odds;
  });
  document.querySelectorAll('.odds-input[data-field="rebate"]').forEach(inp => {
    const type = inp.dataset.type;
    if (defaults[type]) inp.value = defaults[type].rebate;
  });
  showToast('已恢复默认赔率，请点击保存以生效');
}

function enableOddsEdit() {
  document.querySelectorAll('.odds-input').forEach(inp => { inp.disabled = false; inp.style.border = '1px solid #ccc'; inp.style.background = '#fff'; });
  showToast('已进入编辑模式');
}

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

// ===== 根据玩法获取赔率 =====
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
    '十三不中':{odds:8.5,rebate:4},'十四不中':{odds:10.5,rebate:4},'十五不中':{odds:13,rebate:4},
    '十六不中':{odds:16,rebate:4},'十七不中':{odds:19,rebate:4},'十八不中':{odds:23,rebate:4},
    '二中二':{odds:60,rebate:4},'三中二':{odds:20,rebate:4},'三中三':{odds:600,rebate:4},'平码':{odds:7,rebate:4},
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

let currentParseMethod = parseInt(localStorage.getItem('savedParseMethod') || '0');
function parseExcessText(text, method) { const lines = text.trim().split('\n').filter(l => l.trim()); const items = []; for (const line of lines) { const match = line.match(/(\d{2})各(\d+)米/); if (match) { items.push({ num: match[1], amount: parseInt(match[2]) }); } } if (items.length === 0) return ''; items.sort((a, b) => b.amount - a.amount); const parseItems = (method) => { const data = items.map(item => ({ ...item })); const result = []; if (method === 0) { while (data.some(d => d.amount > 0)) { const maxAmount = Math.max(...data.map(d => d.amount)); if (maxAmount <= 0) break; const group = []; for (const d of data) { if (d.amount > 0 && (maxAmount - d.amount) <= maxAmount * 0.4) { group.push(d.num); } } const groupAmount = Math.min(...group.map(n => data.find(d => d.num === n).amount)); for (const n of group) { const d = data.find(d => d.num === n); d.amount -= groupAmount; } result.push(`${group.join('-')}各数${groupAmount}`); } } else if (method === 1) { while (data.some(d => d.amount > 0)) { let bestAmount = 0; let bestCount = 0; for (let i = 0; i < data.length; i++) { const candidate = data[i].amount; if (candidate <= 0) continue; let count = 0; for (const d of data) { if (d.amount >= candidate) count++; } if (count > bestCount || (count === bestCount && candidate < bestAmount)) { bestCount = count; bestAmount = candidate; } } if (bestCount === 0) break; const group = []; for (const d of data) { if (d.amount >= bestAmount) { group.push(d.num); d.amount -= bestAmount; } } result.push(`${group.join('-')}各数${bestAmount}`); } } else if (method === 2) { const levels = [50, 10, 5, 2, 1]; for (const lv of levels) { let again = true; while (again) { again = false; const group = []; for (const d of data) { if (d.amount >= lv) { group.push(d.num); d.amount -= lv; again = true; } } if (group.length > 0) { result.push(`${group.join('-')}各数${lv}`); } } } } else if (method === 3) { for (let lv = 100; lv >= 1; lv--) { let again = true; while (again) { again = false; const group = []; for (const d of data) { if (d.amount >= lv) { group.push(d.num); d.amount -= lv; again = true; } } if (group.length > 0) { result.push(`${group.join('-')}各数${lv}`); } } } } else if (method === 4) { const levels = []; for (let lv = 100; lv >= 5; lv -= 5) levels.push(lv); levels.push(3, 2, 1); for (const lv of levels) { let again = true; while (again) { again = false; const group = []; for (const d of data) { if (d.amount >= lv) { group.push(d.num); d.amount -= lv; again = true; } } if (group.length > 0) { result.push(`${group.join('-')}各数${lv}`); } } } } return result.join('\n'); }; return parseItems(method); }
function switchParseMethod() { const text = document.getElementById('reportCapInfo').innerText; if (!text || text === '无超出的号码') { showToast('当前没有超额文本'); document.getElementById('parseResultArea').innerText = ''; return; } const result = parseExcessText(text, currentParseMethod); document.getElementById('parseResultArea').innerText = result; const methodNames = ['聚类分组', '贪心合并', '固定50→10→5→2→1', '100递减', '固定100→...→1']; showToast(`当前方案：${methodNames[currentParseMethod]}`); currentParseMethod = (currentParseMethod + 1) % 5; localStorage.setItem('savedParseMethod', currentParseMethod); }
function copyOrderGroup() { const text = document.getElementById('parseResultArea').innerText; if (!text) { showToast('没有解析结果'); return; } navigator.clipboard.writeText(text).then(() => showToast('订单组已复制')); }