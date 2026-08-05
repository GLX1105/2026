// ===== 数据库弹窗 =====
async function showDatabase() { const pwd = await prompt("请输入数据库密码：",""); if (pwd === PASSWORD) { const modal = document.getElementById('databaseModal'); if (!modal) return; modal.style.display = 'flex'; highestZ += 1; modal.style.zIndex = highestZ; renderDatabaseContent(); makeWindowDraggable('databaseModalBox'); } else { await alert("密码错误"); } }
function hideDatabase() { const modal = document.getElementById('databaseModal'); if (modal) modal.style.display = 'none'; }

function renderDatabaseContent() {
  const content = document.getElementById('databaseModalContent');
  if (!content) return;
  const sections = [
    { title: '基础生肖', data: ZODIAC_NUMS },
    { title: '五行', data: { '金': D['金'], '木': D['木'], '水': D['水'], '火': D['火'], '土': D['土'] } },
    { title: '属性肖', data: {} },
    { title: '大小单双', data: { '单': D['单'], '双': D['双'], '大': D['大'], '小': D['小'], '小单': D['小单'], '大单': D['大单'], '小双': D['小双'], '大双': D['大双'] } },
    { title: '合数单双', data: { '合单': D['合单'], '合双': D['合双'], '合大': D['合大'], '合小': D['合小'] } },
    { title: '波色', data: { '红波': D['红波'], '红大': D['红大'], '红小': D['红小'], '红单': D['红单'], '红双': D['红双'], '蓝波': D['蓝波'], '蓝大': D['蓝大'], '蓝小': D['蓝小'], '蓝单': D['蓝单'], '蓝双': D['蓝双'], '绿波': D['绿波'], '绿大': D['绿大'], '绿小': D['绿小'], '绿单': D['绿单'], '绿双': D['绿双'] } },
    { title: '头数', data: {} },
    { title: '尾数', data: {} },
    { title: '岁数', data: {} },
    { title: '合数', data: {} },
    { title: '其他属性码', data: {} }
  ];
  for (let k of Object.keys(ATTR_TO_ZODIACS)) sections[2].data[k] = ATTR_TO_ZODIACS[k];
  for (let h = 0; h <= 4; h++) { sections[6].data[h + '头'] = D[h + '头']; sections[6].data[h + '头单'] = D[h + '头单']; sections[6].data[h + '头双'] = D[h + '头双']; }
  for (let i = 0; i <= 9; i++) sections[7].data[i + '尾'] = D[i + '尾'];
  sections[7].data['小尾'] = D['小尾']; sections[7].data['大尾'] = D['大尾'];
  const cnT = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  for (let i = 0; i <= 9; i++) sections[7].data[cnT[i] + '尾'] = D[cnT[i] + '尾'];
  for (let [k, v] of Object.entries(AGE_TO_NUMS)) {
    const nums = v.split(/[\s,，]+/);
    const zs = nums.map(n => NUM_TO_ZODIAC[n] || n).filter((val, i, a) => a.indexOf(val) === i);
    sections[8].data[k] = zs.join('');
  }
  for (let i = 1; i <= 13; i++) sections[9].data[i + '合'] = D[i + '合'];
  const otherKeys = ['反数', '内围码', '外围码', '前码', '后码', '左边码', '右边码', '楼上码', '楼下码', '风码', '雨码', '深码', '浅码', '拼码', '搏码', '高码', '低码', '长码', '短码', '黑码', '白码', '冷码', '热码', '爱码', '恨码', '顺码', '逆码', '天码', '地码'];
  for (let k of otherKeys) if (D[k] && !sections[10].data[k]) sections[10].data[k] = D[k];
  let html = '<h2 style="text-align:center;color:#1a1a2e;margin-bottom:15px;">号码数据库</h2>';
  for (let sec of sections) {
    const entries = Object.entries(sec.data); if (entries.length === 0) continue;
    html += `<div class="config-section"><div class="config-section-title" style="font-size:14px;font-weight:bold;margin-bottom:8px;">${sec.title} (${entries.length}条)</div><div style="display:grid;grid-template-columns:repeat(2,1fr);gap:4px;">`;
    for (let [k, v] of entries) {
      html += `<div style="display:flex;justify-content:space-between;padding:4px 8px;background:#f5f6fa;border-radius:4px;font-size:12px;"><span style="color:#4a90c4;font-weight:bold;">${k}</span><span style="color:#3a7ab5;font-family:Consolas,monospace;">${v}</span></div>`;
    }
    html += '</div></div>';
  }
  content.innerHTML = html;
}

// ===== 识别弹窗 =====
function showRecognizeModal() {
  if (document.getElementById('recognizeWin')) return;
  const regionLabel = currentRegion === 'macau' ? '澳门' : currentRegion === 'hongkong' ? '香港' : '粤港';
  const win = document.createElement('div'); win.className = 'floating-window'; win.id = 'recognizeWin';
  win.style.width = '850px'; win.style.height = '650px'; win.style.left = '50%'; win.style.top = '50%'; win.style.transform = 'translate(-50%, -50%)';
  win.setAttribute('data-orig-width', '850px'); win.setAttribute('data-orig-height', '650px');
  window._dotRegion = window._dotRegion || 'auto';
  const catWords = '各 各号 单 双 大 小 鼠 牛 虎 兔 龙 蛇 马 羊 猴 鸡 狗 猪 金 木 水 火 土 红波 蓝波 绿波 红单 红双 蓝单 蓝双 绿单 绿双 单数 双数 家禽 野兽 二中二 三中三 平特肖 平特尾 二连肖 三连肖 四连肖 五连肖 二连尾 三连尾 四连尾 五连尾 五不中 六不中 七不中 八不中 九不中 十不中 十一不中 十二不中 二中特 三中二 特串 复试';
  const catSpans = catWords.split(' ').map(w => `<span class="cat-insert-text" onclick="insertCategoryText('${w}')">${w}</span>`).join(' ');
  win.innerHTML = `
    <div class="modal-header">${regionLabel}订单输入<div class="window-controls"><button onclick="maximizeWindow('recognizeWin')">🗖</button><button onclick="closeRecognizeModal()">×</button></div></div>
    <div class="modal-body" style="display:flex; flex-direction:column; gap:10px;">
      <div class="card recognize-card" style="flex:1; display:flex; flex-direction:column;">
        <div class="card-title" style="display:flex; align-items:center; gap:5px;">
          <select id="orderUserSelect" style="padding:4px 8px;border-radius:4px;border:1px solid #ccc;font-size:13px;"></select>
          <div class="amount-stat-box" id="orderTotalAmountBox" style="display:none;"><span>合计：</span><span id="orderTotalAmount">0</span><span id="orderLineCount" style="margin-left:10px;font-weight:normal;font-size:13px;display:none;"></span></div>
          <span id="maxLossDisplay"></span>
          <div style="display:flex; align-items:center; gap:6px; margin-left:auto; margin-right:4px;">
            <span onclick="setDotRegion('auto')" id="dotSmart" style="display:flex;align-items:center;gap:3px;cursor:pointer;padding:2px 7px;border-radius:10px;font-size:11px;font-weight:bold;transition:all 0.2s;" title="智能识别">
              <span style="width:7px;height:7px;border-radius:50%;"></span>智能
            </span>
            <span onclick="setDotRegion('macau')" id="dotMacau" style="display:flex;align-items:center;gap:3px;cursor:pointer;padding:2px 7px;border-radius:10px;font-size:11px;font-weight:bold;transition:all 0.2s;" title="澳门">
              <span style="width:7px;height:7px;border-radius:50%;"></span>澳
            </span>
            <span onclick="setDotRegion('hongkong')" id="dotHongkong" style="display:flex;align-items:center;gap:3px;cursor:pointer;padding:2px 7px;border-radius:10px;font-size:11px;font-weight:bold;transition:all 0.2s;" title="香港">
              <span style="width:7px;height:7px;border-radius:50%;"></span>港
            </span>
            <span onclick="setDotRegion('yuegang')" id="dotYuegang" style="display:flex;align-items:center;gap:3px;cursor:pointer;padding:2px 7px;border-radius:10px;font-size:11px;font-weight:bold;transition:all 0.2s;" title="粤港">
              <span style="width:7px;height:7px;border-radius:50%;"></span>粤
            </span>
          </div>
          <button class="btn btn-prefix btn-sm" onclick="showPrefixManager()">前缀</button>
          <button class="btn btn-amount-prefix btn-sm" onclick="showAmountPrefixManager()">金额前缀</button>
          <button class="btn btn-amount-prefix2 btn-sm" onclick="showAmountSuffixManager()">金额后缀</button>
        </div>
        <div class="order-input-container" style="flex:1;"><div class="input-column"><div class="box-label">订单输入框</div><textarea class="source-order-input" oninput="performRecognition(this.value)"></textarea></div><div class="result-column"><div class="box-label">识别结果</div><div class="result-area-new"><div class="result-content" id="orderResult" contenteditable="false"></div></div></div></div>
        <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;">
          <button class="btn btn-paste" onclick="pasteOrder()">粘贴订单</button>
          <button class="btn btn-save-order" onclick="saveOrder()">保存下单</button>
          <button class="btn btn-report" onclick="saveReportOrder()" style="background:#e74c3c;color:#fff;">上报</button>
          <button class="btn btn-clear" onclick="clearAllInput()">清空</button>
          <button class="btn btn-replace-sep btn-sm" onclick="replaceSeparators()">换分隔</button>
          <button class="btn btn-remove-sep btn-sm" onclick="removeSeparators()">去分隔</button>
          <button class="btn btn-mark btn-sm" onclick="markSelection()">标记</button>
          <button class="btn btn-cancel btn-sm" onclick="semanticReplace()">语义转换</button>
          <button class="btn btn-sm" onclick="markRegion('macau')" style="background:#e74c3c;color:#fff;">标澳</button>
          <button class="btn btn-sm" onclick="markRegion('hongkong')" style="background:#3498db;color:#fff;">标港</button>
          <button class="btn btn-sm" onclick="markRegion('yuegang')" style="background:#27ae60;color:#fff;">标粤</button>
          <span id="invalidTokensDisplay" style="color:red; font-size:12px; display:none; white-space:pre-line; margin-left:auto;"></span>
        </div>
        <div class="cat-shortcuts-container" id="catShortcutsContainer" style="font-size:12px;line-height:1.6;margin-top:6px;">${catSpans}</div>
      </div>
    </div>`;
  document.body.appendChild(win); updateSelects();
  const textarea = win.querySelector('.source-order-input');
  if (textarea) { const draftKey = `recognizeDraft_${currentRegion}`; const draft = localStorage.getItem(draftKey); if (draft) { textarea.value = draft; performRecognition(draft); } textarea.addEventListener('dragover', (e) => { e.preventDefault(); }); textarea.addEventListener('drop', (e) => { e.preventDefault(); const data = e.dataTransfer.getData('text/plain'); if (data) { textarea.value = data; performRecognition(data); showToast('已拖入文本'); } }); }
  makeWindowDraggable('recognizeWin'); highestZ += 1; win.style.zIndex = highestZ;
  showFloatingWinOverlay('recognizeWin');
  win.setAttribute('data-window-type', 'recognize');
  
  setTimeout(() => { if (typeof setDotRegion === 'function') setDotRegion(window._dotRegion || 'auto'); }, 100);

  if (window.innerWidth > 768) {
    const container = document.getElementById('catShortcutsContainer');
    if (container) container.classList.add('show');
  }
}

function closeRecognizeModal() { const textarea = document.querySelector('.source-order-input'); if (textarea) { const draftKey = `recognizeDraft_${currentRegion}`; localStorage.setItem(draftKey, textarea.value); } const win = document.getElementById('recognizeWin'); if (win) win.remove(); }
function markSelection() { const ta = document.querySelector('.source-order-input'); if (!ta) return; const start = ta.selectionStart, end = ta.selectionEnd; if (start === end) { showToast('请先选择文本'); return; } const selectedText = ta.value.substring(start, end); const tokens = selectedText.split(/[\s,，.。、+\-*＊\/\\|]+/).filter(t => t.trim()); if (tokens.length === 0) { showToast('所选内容无有效文字'); return; } const merged = tokens.join('-'); ta.value = ta.value.substring(0, start) + merged + ta.value.substring(end); performRecognition(ta.value); }

// ===== 显示结果 =====
function displayResults(rs, container) {
  if (!container) container = document.getElementById('orderResult');
  if (!container) return;
  if (rs.length === 0) { container.innerHTML = ''; window._pureOrderLines = []; window._pureOrderRegions = []; window._cachedMaxLossData = []; return; }
  let total = 0; let html = '';
  const pureLines = [];
  const pureRegions = [];
  const maxLossData = [];

  // 地区颜色映射
  const regionColorMap = { 'macau': '#e74c3c', 'hongkong': '#3498db', 'yuegang': '#27ae60' };

  for (const r of rs) {
    if (r.category === '__unrecognized__') {
      const regionLabel = REGION_LABELS[r.region] || '';
      const warnText = (r.warnings && r.warnings.length) ? r.warnings.join('；') : '缺少金额关键字或有效玩法';
      if (r.region && r.region !== currentRegion && !r.warnings.length) {
        html += `<div class="result-line"><span style="color:${regionColorMap[r.region] || '#333'};">${regionLabel}·</span>${r.rawLine} <span style="color:red;">[已提取地区${regionLabel}，但内容无法识别]</span></div>`;
      } else {
        html += `<div class="result-line"><span style="color:${r.region !== currentRegion ? (regionColorMap[r.region] || '#e74c3c') : '#000'};">${regionLabel}·</span>${r.rawLine} <span style="color:red;">[${warnText}]</span></div>`;
      }
      continue;
    }
    total += r.totalAmount;
    const regionLabel = REGION_LABELS[r.region] || '';
    const isCurrentRegion = r.region === currentRegion;
    const regionColor = isCurrentRegion ? 'color:#000;' : `color:${regionColorMap[r.region] || '#333'};`;
    const kwDisplay = (r.category === '特码') ? '各数' : '各';
    const amountStr = `${kwDisplay}${Math.round(r.unitAmount)}`;
    const info = r.totalCount > 1 ? `(${r.totalCount}注, 共${Math.round(r.totalAmount)})` : `(共${Math.round(r.totalAmount)})`;
    const numStr = formatNums(r.category, r.numbers);
    let line = `<span style="${regionColor}">${regionLabel}·</span>${r.category}:${numStr}${amountStr} ${info}`;
    if (r._inherited) {
      line += ` <span style="color:#27ae60;">[继承]</span>`;
    }
    if (r.warnings && r.warnings.length) { line += ` <span style="color:red;">[${r.warnings.join('；')}]</span>`; }
    html += `<div class="result-line">${line}</div>`;
    const pureNumStr = formatNums(r.category, r.numbers);
    pureLines.push(`${r.category}:${pureNumStr} ${kwDisplay} ${Math.round(r.unitAmount)}`);
    pureRegions.push(r.region);

    if (r.category === '特码' || r.category === '特肖') {
      maxLossData.push({
        category: r.category,
        numbers: r.numbers,
        unitAmount: Math.round(r.unitAmount)
      });
    }
  }

  container.innerHTML = html;
  window._pureOrderLines = pureLines;
  window._pureOrderRegions = pureRegions;
  window._cachedMaxLossData = maxLossData;
}

// ===== 保存订单 =====
async function saveOrder(){ 
  const user=document.getElementById('orderUserSelect')?.value; 
  if(!user){showToast('请选择用户');return;} 
  const pureLines = window._pureOrderLines; 
  const pureRegions = window._pureOrderRegions || [];
  if(!pureLines || pureLines.length === 0){showToast('订单无效');return;} 
  const date=document.getElementById('filterDate')?.value||getTodayCST(); 
  
  const regionGroups = {};
  pureLines.forEach((line, i) => {
    const region = pureRegions[i] || currentRegion;
    if (!regionGroups[region]) regionGroups[region] = [];
    regionGroups[region].push(line);
  });

  const regionLabels = { 'macau': '澳门', 'hongkong': '香港', 'yuegang': '粤港' };

  const existingOrders = (await getOrderRecords()).filter(r => r.date === date && r.user === user);
  let hasDuplicate = false;
  let duplicateRegions = [];
  
  for (const [region, lines] of Object.entries(regionGroups)) {
    const content = lines.join('\n');
    if (existingOrders.some(o => o.content === content && o.region === region)) {
      hasDuplicate = true;
      duplicateRegions.push(regionLabels[region] || region);
    }
  }

  if (hasDuplicate) {
    const confirmed = await confirm(`该用户今天已在${duplicateRegions.join('、')}保存过相同的订单，确定再次保存吗？`);
    if (!confirmed) { return; }
  }

  // 平特肖数据处理
  const pingtexiaoData = getPingtexiaoData();
  let ptChanged = false;
  pureLines.forEach(line => {
    const match = line.match(/^(.+?):(.+?)\s+各\s*(\d+)$/);
    if (match) {
      const playType = match[1];
      const content = match[2];
      const amt = parseInt(match[3]) || 0;
      if (playType === '平特肖' || normalizePlayType(playType) === '平特肖') {
        const items = content.split('-').filter(i => i.trim());
        items.forEach(item => {
          const cleanItem = item.trim();
          if (/^[\u4e00-\u9fa5]$/.test(cleanItem) && ZODIAC_NUMS[cleanItem]) {
            if (!pingtexiaoData[cleanItem]) pingtexiaoData[cleanItem] = { amount: '', report: '' };
            // 修复：加括号确保先取默认值0再加amt
            pingtexiaoData[cleanItem].amount = ((parseFloat(pingtexiaoData[cleanItem].amount) || 0) + amt).toString();
            ptChanged = true;
          }
        });
      }
    }
  });
  if (ptChanged) { savePingtexiaoData(pingtexiaoData); }

  let savedCount = 0;
  for (const [region, lines] of Object.entries(regionGroups)) {
    const content = lines.join('\n');
    let totalAmount = 0;
    lines.forEach(line => {
      if(line.startsWith('特肖:')){
        const match = line.match(/^特肖:(.+?)\s+各\s*(\d+)$/);
        if(match){ totalAmount += match[1].split('-').filter(z => z.trim()).length * (parseInt(match[2]) || 0); }
      } else if(line.startsWith('包')){
        const match = line.match(/^包(.+?):(.+?)\s+各\s*(\d+)$/);
        if(match){ totalAmount += parseInt(match[3]) || 0; }
      } else if(line.startsWith('特碰:')){
        const match = line.match(/^特碰:(.+?)\s+各\s*(\d+)$/);
        if(match){
          const cleaned = match[1].replace(/[()]/g, '');
          const groups = cleaned.split(/\s+/).filter(c => c.trim());
          totalAmount += groups.length * (parseInt(match[2]) || 0);
        }
      } else if(line.startsWith('特码:')){
        const{numbers,amount}=countItemsInLine(line);
        if(numbers.length>0 && amount>0) totalAmount += numbers.length * amount;
      } else {
        const match = line.match(/^(.+?):(.+?)\s+各\s*(\d+)$/);
        if(match){
          const playType = match[1];
          const content = match[2];
          const amt = parseInt(match[3]) || 0;
          if(playType==='平特肖'||playType==='平特尾'||playType==='平码'){
            const items = content.split('-').filter(i=>i.trim());
            totalAmount += items.length * amt;
          } else {
            const cleaned = content.replace(/[()]/g, '');
            const groups = cleaned.split(/\s+/).filter(c=>c.trim());
            totalAmount += groups.length * amt;
          }
        }
      }
    });
    await saveOrderRecordToIDB(content, user, date, totalAmount, null, region);
    addOperationLog('save_order', content, region, user, totalAmount);
    savedCount++;
  }
  
  const si=document.querySelector('.source-order-input'); if(si)si.value=''; 
  const resultEl=document.getElementById('orderResult'); if(resultEl)resultEl.innerHTML=''; 
  window._pureOrderLines = []; 
  window._pureOrderRegions = [];
  updateOrderTotalDisplay(); 
  const md=document.getElementById('maxLossDisplay'); if(md){md.textContent='';md.style.display='none';} 
  document.querySelectorAll('.category-btn').forEach(b=>b.classList.remove('active')); 
  
  await updateTableFromRecords();
  calculateStorageUsage(); showStorageDrawerTemporary(5000); renderSmartDecision(); updateSingleBetDisplay(); 
  updateOrderCountDisplay();
  renderPingtexiaoTable(); updatePingtexiaoTotal();
  showToast('已保存下单（' + savedCount + '个地区）');
}

// ===== 修复：saveReportOrder 中平特肖金额累加括号修复 + IndexedDB 事务修复 =====
async function saveReportOrder(){ 
  const user=document.getElementById('orderUserSelect')?.value; 
  if(!user){showToast('请选择用户');return;} 
  const pureLines = window._pureOrderLines; 
  const pureRegions = window._pureOrderRegions || [];
  if(!pureLines || pureLines.length === 0){showToast('订单无效');return;} 
  const date=document.getElementById('filterDate')?.value||getTodayCST(); 
  
  const regionGroups = {};
  pureLines.forEach((line, i) => {
    const region = pureRegions[i] || currentRegion;
    if (!regionGroups[region]) regionGroups[region] = [];
    regionGroups[region].push(line);
  });

  const regionLabels = { 'macau': '澳门', 'hongkong': '香港', 'yuegang': '粤港' };

  const existingReports = (await getReportOrderRecords()).filter(r => r.date === date && r.user === user);
  let hasDuplicate = false;
  let duplicateRegions = [];
  
  for (const [region, lines] of Object.entries(regionGroups)) {
    const content = lines.join('\n');
    if (existingReports.some(o => o.content === content && o.region === region)) {
      hasDuplicate = true;
      duplicateRegions.push(regionLabels[region] || region);
    }
  }

  if (hasDuplicate) {
    const confirmed = await confirm(`该用户今天已在${duplicateRegions.join('、')}上报过相同的内容，确定再次上报吗？`);
    if (!confirmed) { return; }
  }

  // 平特肖数据处理
  const pingtexiaoData = getPingtexiaoData();
  let ptChanged = false;
  pureLines.forEach(line => {
    const match = line.match(/^(.+?):(.+?)\s+各\s*(\d+)$/);
    if (match) {
      const playType = match[1];
      const content = match[2];
      const amt = parseInt(match[3]) || 0;
      if (playType === '平特肖' || normalizePlayType(playType) === '平特肖') {
        const items = content.split('-').filter(i => i.trim());
        items.forEach(item => {
          const cleanItem = item.trim();
          if (/^[\u4e00-\u9fa5]$/.test(cleanItem) && ZODIAC_NUMS[cleanItem]) {
            if (!pingtexiaoData[cleanItem]) pingtexiaoData[cleanItem] = { amount: '', report: '' };
            const oldReport = parseFloat(pingtexiaoData[cleanItem].report) || 0;
            // 修复：加括号确保先取默认值0再加amt
            pingtexiaoData[cleanItem].report = ((parseFloat(pingtexiaoData[cleanItem].report) || 0) + amt).toString();
            ptChanged = true;
          }
        });
      }
    }
  });
  if (ptChanged) { savePingtexiaoData(pingtexiaoData); }

  let savedCount = 0;
  for (const [region, lines] of Object.entries(regionGroups)) {
    const content = lines.join('\n');
    let totalAmount = 0;
    lines.forEach(line => {
      if(line.startsWith('特肖:')){
        const match = line.match(/^特肖:(.+?)\s+各\s*(\d+)$/);
        if(match){ totalAmount += match[1].split('-').filter(z => z.trim()).length * (parseInt(match[2]) || 0); }
      } else if(line.startsWith('包')){
        const match = line.match(/^包(.+?):(.+?)\s+各\s*(\d+)$/);
        if(match){ totalAmount += parseInt(match[3]) || 0; }
      } else if(line.startsWith('特碰:')){
        const match = line.match(/^特碰:(.+?)\s+各\s*(\d+)$/);
        if(match){
          const cleaned = match[1].replace(/[()]/g, '');
          const groups = cleaned.split(/\s+/).filter(c => c.trim());
          totalAmount += groups.length * (parseInt(match[2]) || 0);
        }
      } else if(line.startsWith('特码:')){
        const{numbers,amount}=countItemsInLine(line);
        if(numbers.length>0 && amount>0) totalAmount += numbers.length * amount;
      } else {
        const match = line.match(/^(.+?):(.+?)\s+各\s*(\d+)$/);
        if(match){
          const playType = match[1];
          const content = match[2];
          const amt = parseInt(match[3]) || 0;
          if(playType==='平特肖'||playType==='平特尾'||playType==='平码'){
            const items = content.split('-').filter(i=>i.trim());
            totalAmount += items.length * amt;
          } else {
            const cleaned = content.replace(/[()]/g, '');
            const groups = cleaned.split(/\s+/).filter(c=>c.trim());
            totalAmount += groups.length * amt;
          }
        }
      }
    });
    await saveReportOrderRecordToIDB(content, user, date, totalAmount, null, region);
    addOperationLog('save_report', content, region, user, totalAmount);
    savedCount++;
  }
  
  const si=document.querySelector('.source-order-input'); if(si)si.value=''; 
  const resultEl=document.getElementById('orderResult'); if(resultEl)resultEl.innerHTML=''; 
  window._pureOrderLines = []; 
  window._pureOrderRegions = [];
  updateOrderTotalDisplay(); 
  const md=document.getElementById('maxLossDisplay'); if(md){md.textContent='';md.style.display='none';} 
  document.querySelectorAll('.category-btn').forEach(b=>b.classList.remove('active')); 
  
  await updateTableFromRecords();
  calculateStorageUsage(); showStorageDrawerTemporary(5000); renderSmartDecision(); 
  renderPingtexiaoTable(); updatePingtexiaoTotal();
  showToast('已上报成功（' + savedCount + '个地区）'); 
  setTimeout(() => { const toast = document.querySelector('.toast-message.show'); if (toast) toast.style.color = '#ff0000'; }, 10); 
}

function updateOrderCountDisplay() {
  const fd = document.getElementById('filterDate')?.value || getTodayCST();
  getOrderRecords().then(orders => {
    const todayOrders = orders.filter(r => r.date === fd);
    const countEl = document.getElementById('duiJiangOrderCount');
    if (countEl) { countEl.textContent = '(共' + todayOrders.length + '单)'; }
  });
}

// ===== 更新表格 =====
async function updateTableFromRecords(){
  try{
    const fd=document.getElementById('filterDate')?.value;
    const recs=await getOrderRecords();
    const reps=await getReportOrderRecords();
    const riskSwitcher = document.getElementById('riskReportSwitcher')?.value || 'total';
    const viewUser = document.getElementById('viewUserSelect')?.value;
    let filterUser = null;
    if (riskSwitcher === 'user' && viewUser) { filterUser = viewUser; }
    
    tableBetData={};userBetData={};reportBetData={};reportAmountData={};reportRiskData={};
    numberCount={};zodiacCount={};numberAmountCount={};zodiacAmountCount={};
    zodiacDirectAmount={};zodiacFilteredAmount={};
    zodiacReportAmount={};zodiacFilteredReportAmount={};
    numberOrderTotal=0;zodiacWeightedTotal=0; orderCountAll=0;
    originalOrderAmount={}; directOrderAmount={}; directReportAmount={};
    const nMin=parseInt(document.getElementById('numAmountMin')?.value)||1,nMax=parseInt(document.getElementById('numAmountMax')?.value)||50000;
    const zMin=parseInt(document.getElementById('zodiacAmountMin')?.value)||1,zMax=parseInt(document.getElementById('zodiacAmountMax')?.value)||50000;
    const curZod=localStorage.getItem('selectedStartZodiac')||'马';
    const fRecs=fd?recs.filter(r=>r.date===fd):recs;
    const fReps=fd?reps.filter(r=>r.date===fd):reps;
    const fRecsFiltered = filterUser ? fRecs.filter(r => r.user === filterUser) : fRecs;
    const fRepsFiltered = filterUser ? fReps.filter(r => r.user === filterUser) : fReps;
    
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

    fRecsFiltered.forEach(rec=>{ try{
      if(!userBetData[rec.user])userBetData[rec.user]={};
      rec.content.split('\n').filter(l=>l.trim()).forEach(line=>{
        const teXiaoMatch = line.match(/^特肖:(.+?)\s+各\s*(\d+)$/);
        if (teXiaoMatch) {
          const zodiacsStr = teXiaoMatch[1];
          const amtRaw = parseInt(teXiaoMatch[2]) || 0;
          if (amtRaw <= 0) return;
          orderCountAll++;
          const zodiacs = zodiacsStr.split('-').map(z => z.trim()).filter(z => z);
          zodiacs.forEach(z => {
            const isBenming = z === curZod;
            const perNumAmt = Math.round(amtRaw / (isBenming ? 5 : 4));
            if (perNumAmt <= 0) return;
            const nums = (ZODIAC_NUMS[z] || '').split(/[\s,，]+/);
            nums.forEach(num => {
              const numPadded = num.padStart(2, '0');
              userBetData[rec.user][numPadded] = (userBetData[rec.user][numPadded] || 0) + perNumAmt;
              tableBetData[numPadded] = (tableBetData[numPadded] || 0) + perNumAmt;
              reportBetData[numPadded] = (reportBetData[numPadded] || 0) + perNumAmt;
              originalOrderAmount[numPadded] = (originalOrderAmount[numPadded] || 0) + perNumAmt;
            });
            zodiacCount[z] = (zodiacCount[z] || 0) + 1;
            zodiacDirectAmount[z] = (zodiacDirectAmount[z] || 0) + amtRaw;
            if (perNumAmt >= zMin && perNumAmt <= zMax) {
              zodiacAmountCount[z] = (zodiacAmountCount[z] || 0) + 1;
              zodiacFilteredAmount[z] = (zodiacFilteredAmount[z] || 0) + amtRaw;
            }
          });
          return;
        }
        
        const tepengMatch = line.match(/^特碰:(.+?)\s+各\s*(\d+)$/);
        if (tepengMatch) {
          const cleaned = tepengMatch[1].replace(/[()]/g, '');
          const combos = cleaned.split(/\s+/).filter(c => c.trim());
          const amtRaw = parseInt(tepengMatch[2]) || 0;
          if (amtRaw <= 0) return;
          orderCountAll++;
          combos.forEach(combo => {
            const tokens = combo.split('-');
            if (tokens.length === 2) {
              const n1 = tokens[0].padStart(2, '0');
              const n2 = tokens[1].padStart(2, '0');
              [n1, n2].forEach(num => {
                userBetData[rec.user][num] = (userBetData[rec.user][num] || 0) + amtRaw;
                tableBetData[num] = (tableBetData[num] || 0) + amtRaw;
                reportBetData[num] = (reportBetData[num] || 0) + amtRaw;
                originalOrderAmount[num] = (originalOrderAmount[num] || 0) + amtRaw;
                directOrderAmount[num] = (directOrderAmount[num] || 0) + amtRaw;
                numberOrderTotal += amtRaw;
                numberCount[num] = (numberCount[num] || 0) + 1;
                if (amtRaw >= nMin && amtRaw <= nMax) numberAmountCount[num] = (numberAmountCount[num] || 0) + 1;
              });
            }
          });
          return;
        }
        
        const baoMatch = line.match(/^包(.+?):(.+?)\s+各\s*(\d+)$/);
        if (baoMatch) {
          const attr = baoMatch[2].trim();
          const amt = parseInt(baoMatch[3]) || 0;
          if (amt <= 0 || !D[attr]) return;
          orderCountAll++;
          if (attr === '家禽' || attr === '野兽') {
            const zodiacList = expandKeyToZodiacs(attr);
            if (zodiacList.length === 0) return;
            const perZodiacAmt = Math.round(amt / zodiacList.length);
            zodiacList.forEach(z => {
              zodiacCount[z] = (zodiacCount[z] || 0) + 1;
              zodiacDirectAmount[z] = (zodiacDirectAmount[z] || 0) + perZodiacAmt;
              const nums = (ZODIAC_NUMS[z] || '').split(/[\s,，]+/);
              const perNumAmt = Math.round(perZodiacAmt / nums.length);
              nums.forEach(num => {
                const numPadded = num.padStart(2, '0');
                userBetData[rec.user][numPadded] = (userBetData[rec.user][numPadded] || 0) + perNumAmt;
                tableBetData[numPadded] = (tableBetData[numPadded] || 0) + perNumAmt;
                reportBetData[numPadded] = (reportBetData[numPadded] || 0) + perNumAmt;
                originalOrderAmount[numPadded] = (originalOrderAmount[numPadded] || 0) + perNumAmt;
              });
            });
          } else {
            const numList = (D[attr] || '').split(/[\s,，]+/).filter(n => n.trim());
            if (numList.length === 0) return;
            const perNumAmt = Math.round(amt / numList.length);
            numList.forEach(n => {
              const numPadded = n.padStart(2, '0');
              numberCount[numPadded] = (numberCount[numPadded] || 0) + 1;
              if (perNumAmt >= nMin && perNumAmt <= nMax) numberAmountCount[numPadded] = (numberAmountCount[numPadded] || 0) + 1;
              userBetData[rec.user][numPadded] = (userBetData[rec.user][numPadded] || 0) + perNumAmt;
              tableBetData[numPadded] = (tableBetData[numPadded] || 0) + perNumAmt;
              reportBetData[numPadded] = (reportBetData[numPadded] || 0) + perNumAmt;
              originalOrderAmount[numPadded] = (originalOrderAmount[numPadded] || 0) + perNumAmt;
              directOrderAmount[numPadded] = (directOrderAmount[numPadded] || 0) + perNumAmt;
              numberOrderTotal += perNumAmt;
            });
          }
          return;
        }
        
        let content, amt;
        const teMaMatch = line.match(/^特码:(.+?)\s+各(?:数|)\s*(\d+)$/);
        if (teMaMatch) {
          content = teMaMatch[1];
          amt = parseInt(teMaMatch[2]) || 0;
        } else {
          const oldMatch = line.match(/^(.+?)\s+各(?:数|)\s*(\d+)$/);
          if (oldMatch && !/^特肖:/.test(line) && !/^包/.test(line) && !/^特碰:/.test(line) && !/[:：]/.test(line)) {
            content = oldMatch[1];
            amt = parseInt(oldMatch[2]) || 0;
          } else {
            return;
          }
        }
        if (amt <= 0) return;
        orderCountAll++;
        const items = content.split('-').map(i => i.trim()).filter(i => i);

        items.forEach(item => {
          if (/^\d{1,2}$/.test(item) && parseInt(item) >= 1 && parseInt(item) <= 49) {
            const num = item.padStart(2, '0');
            numberCount[num] = (numberCount[num] || 0) + 1;
            if (amt >= nMin && amt <= nMax) numberAmountCount[num] = (numberAmountCount[num] || 0) + 1;
            userBetData[rec.user][num] = (userBetData[rec.user][num] || 0) + amt;
            tableBetData[num] = (tableBetData[num] || 0) + amt;
            reportBetData[num] = (reportBetData[num] || 0) + amt;
            originalOrderAmount[num] = (originalOrderAmount[num] || 0) + amt;
            directOrderAmount[num] = (directOrderAmount[num] || 0) + amt;
            numberOrderTotal += amt;
            return;
          }

          if (/^[鼠牛虎兔龙蛇马羊猴鸡狗猪]$/.test(item)) {
            zodiacCount[item] = (zodiacCount[item] || 0) + 1;
            const zNumCount = (ZODIAC_NUMS[item] || '').split(/[\s,，]+/).length || 0;
            zodiacDirectAmount[item] = (zodiacDirectAmount[item] || 0) + amt * zNumCount;
            if (amt >= zMin && amt <= zMax) {
              zodiacAmountCount[item] = (zodiacAmountCount[item] || 0) + 1;
              zodiacFilteredAmount[item] = (zodiacFilteredAmount[item] || 0) + amt * zNumCount;
            }
            (ZODIAC_NUMS[item] || '').split(/[\s,，]+/).forEach(n => {
              const num = n.padStart(2, '0');
              userBetData[rec.user][num] = (userBetData[rec.user][num] || 0) + amt;
              tableBetData[num] = (tableBetData[num] || 0) + amt;
              reportBetData[num] = (reportBetData[num] || 0) + amt;
              originalOrderAmount[num] = (originalOrderAmount[num] || 0) + amt;
            });
            return;
          }

          if (D[item]) {
            const zodiacList = expandKeyToZodiacs(item);
            if (zodiacList.length > 0) {
              zodiacList.forEach(z => {
                zodiacCount[z] = (zodiacCount[z] || 0) + 1;
                const zNumCount = (ZODIAC_NUMS[z] || '').split(/[\s,，]+/).length || 0;
                zodiacDirectAmount[z] = (zodiacDirectAmount[z] || 0) + amt * zNumCount;
                if (amt >= zMin && amt <= zMax) {
                  zodiacAmountCount[z] = (zodiacAmountCount[z] || 0) + 1;
                  zodiacFilteredAmount[z] = (zodiacFilteredAmount[z] || 0) + amt * zNumCount;
                }
                (ZODIAC_NUMS[z] || '').split(/[\s,，]+/).forEach(n => {
                  const num = n.padStart(2, '0');
                  userBetData[rec.user][num] = (userBetData[rec.user][num] || 0) + amt;
                  tableBetData[num] = (tableBetData[num] || 0) + amt;
                  reportBetData[num] = (reportBetData[num] || 0) + amt;
                  originalOrderAmount[num] = (originalOrderAmount[num] || 0) + amt;
                });
              });
              return;
            }
            const numList = expandKeyToNums(item);
            if (numList.length > 0) {
              numList.forEach(n => {
                const num = n.padStart(2, '0');
                numberCount[num] = (numberCount[num] || 0) + 1;
                if (amt >= nMin && amt <= nMax) numberAmountCount[num] = (numberAmountCount[num] || 0) + 1;
                userBetData[rec.user][num] = (userBetData[rec.user][num] || 0) + amt;
                tableBetData[num] = (tableBetData[num] || 0) + amt;
                reportBetData[num] = (reportBetData[num] || 0) + amt;
                originalOrderAmount[num] = (originalOrderAmount[num] || 0) + amt;
                directOrderAmount[num] = (directOrderAmount[num] || 0) + amt;
                numberOrderTotal += amt;
              });
            }
          }
        });
      });
    } catch(e) {} });

    fRepsFiltered.forEach(rec=>{ try{
      const user=rec.user;
      rec.content.split('\n').filter(l=>l.trim()).forEach(line=>{
        const teXiaoMatch = line.match(/^特肖:(.+?)\s+各\s*(\d+)$/);
        if (teXiaoMatch) {
          const zodiacsStr = teXiaoMatch[1];
          const amtRaw = parseInt(teXiaoMatch[2]) || 0;
          if (amtRaw <= 0) return;
          const zodiacs = zodiacsStr.split('-').map(z => z.trim()).filter(z => z);
          zodiacs.forEach(z => {
            const isBenming = z === curZod;
            const perNumAmt = Math.round(amtRaw / (isBenming ? 5 : 4));
            if (perNumAmt <= 0) return;
            const nums = (ZODIAC_NUMS[z] || '').split(/[\s,，]+/);
            nums.forEach(num => {
              const numPadded = num.padStart(2, '0');
              reportBetData[numPadded] = (reportBetData[numPadded] || 0) - perNumAmt;
              reportAmountData[numPadded] = (reportAmountData[numPadded] || 0) + perNumAmt;
              if (user && userBetData[user]) userBetData[user][numPadded] = (userBetData[user][numPadded] || 0) - perNumAmt;
            });
            zodiacReportAmount[z] = (zodiacReportAmount[z] || 0) + amtRaw;
            if (perNumAmt >= zMin && perNumAmt <= zMax) zodiacFilteredReportAmount[z] = (zodiacFilteredReportAmount[z] || 0) + amtRaw;
          });
          return;
        }

        const tepengMatch = line.match(/^特碰:(.+?)\s+各\s*(\d+)$/);
        if (tepengMatch) {
          const cleaned = tepengMatch[1].replace(/[()]/g, '');
          const combos = cleaned.split(/\s+/).filter(c => c.trim());
          const amtRaw = parseInt(tepengMatch[2]) || 0;
          if (amtRaw <= 0) return;
          combos.forEach(combo => {
            const tokens = combo.split('-');
            if (tokens.length === 2) {
              [tokens[0].padStart(2, '0'), tokens[1].padStart(2, '0')].forEach(num => {
                reportBetData[num] = (reportBetData[num] || 0) - amtRaw;
                reportAmountData[num] = (reportAmountData[num] || 0) + amtRaw;
                if (user && userBetData[user]) userBetData[user][num] = (userBetData[user][num] || 0) - amtRaw;
                directReportAmount[num] = (directReportAmount[num] || 0) + amtRaw;
              });
            }
          });
          return;
        }

        const baoMatch = line.match(/^包(.+?):(.+?)\s+各\s*(\d+)$/);
        if (baoMatch) {
          const attr = baoMatch[2].trim();
          const amt = parseInt(baoMatch[3]) || 0;
          if (amt <= 0 || !D[attr]) return;
          if (attr === '家禽' || attr === '野兽') {
            const zodiacList = expandKeyToZodiacs(attr);
            if (zodiacList.length === 0) return;
            const perZodiacAmt = Math.round(amt / zodiacList.length);
            zodiacList.forEach(z => {
              zodiacReportAmount[z] = (zodiacReportAmount[z] || 0) + perZodiacAmt;
              const nums = (ZODIAC_NUMS[z] || '').split(/[\s,，]+/);
              const perNumAmt = Math.round(perZodiacAmt / nums.length);
              nums.forEach(num => {
                const numPadded = num.padStart(2, '0');
                reportBetData[numPadded] = (reportBetData[numPadded] || 0) - perNumAmt;
                reportAmountData[numPadded] = (reportAmountData[numPadded] || 0) + perNumAmt;
                if (user && userBetData[user]) userBetData[user][numPadded] = (userBetData[user][numPadded] || 0) - perNumAmt;
              });
            });
          } else {
            const numList = (D[attr] || '').split(/[\s,，]+/).filter(n => n.trim());
            if (numList.length === 0) return;
            const perNumAmt = Math.round(amt / numList.length);
            numList.forEach(n => {
              const numPadded = n.padStart(2, '0');
              reportBetData[numPadded] = (reportBetData[numPadded] || 0) - perNumAmt;
              reportAmountData[numPadded] = (reportAmountData[numPadded] || 0) + perNumAmt;
              if (user && userBetData[user]) userBetData[user][numPadded] = (userBetData[user][numPadded] || 0) - perNumAmt;
              directReportAmount[numPadded] = (directReportAmount[numPadded] || 0) + perNumAmt;
            });
          }
          return;
        }

        const { numbers, zodiacs, amount, playType } = countItemsInLine(line);
        if (!amount || amount <= 0) return;
        if (playType && playType !== '特码') return;

        numbers.forEach(num => {
          reportBetData[num] = (reportBetData[num] || 0) - amount;
          reportAmountData[num] = (reportAmountData[num] || 0) + amount;
          if (user && userBetData[user]) userBetData[user][num] = (userBetData[user][num] || 0) - amount;
          if (zodiacs.length === 0) directReportAmount[num] = (directReportAmount[num] || 0) + amount;
        });

        zodiacs.forEach(z => {
          const zNumCount = (ZODIAC_NUMS[z] || '').split(/[\s,，]+/).length || 0;
          zodiacReportAmount[z] = (zodiacReportAmount[z] || 0) + amount * zNumCount;
          if (amount >= zMin && amount <= zMax) zodiacFilteredReportAmount[z] = (zodiacFilteredReportAmount[z] || 0) + amount * zNumCount;
        });
      });
    } catch(e) {} });

    generateRiskTable(); generateReportTable(); renderFrequencyCards(); renderAmountFrequencyCards();
    renderReportAmountTable(); renderOriginalAmountTable(); updateReportAmountTotal(); updateAmountDisplays();
    renderPingtexiaoTable(); updatePingtexiaoTotal();
    calculateStorageUsage(); renderSmartDecision(); updateSingleBetDisplay(); updateOrderCountDisplay();
  } catch(e) {}
}

// ===== 金额显示更新 =====
function updateDirectAmountTotals() {
  let orderTotal = 0; let reportTotal = 0;
  for (let n in directOrderAmount) { orderTotal += directOrderAmount[n] || 0; }
  for (let n in directReportAmount) { reportTotal += directReportAmount[n] || 0; }
  const orderBox = document.getElementById('directOrderTotalBox'); const orderSpan = document.getElementById('directOrderTotalAmount');
  if (orderBox && orderSpan) { if (orderTotal > 0) { orderSpan.textContent = orderTotal; orderBox.style.display = 'inline-flex'; } else { orderBox.style.display = 'none'; } }
  const reportBox = document.getElementById('directReportTotalBox'); const reportSpan = document.getElementById('directReportTotalAmount');
  if (reportBox && reportSpan) { if (reportTotal > 0) { reportSpan.textContent = reportTotal; reportBox.style.display = 'inline-flex'; } else { reportBox.style.display = 'none'; } }
}

function renderOriginalAmountTable() { const tbl = document.getElementById('originalAmountTable'); if (!tbl) return; const cols = [...Array(5)].map((_,c)=>Array.from({length:c===4?9:10},(_,r)=>(c*10+r+1).toString().padStart(2,'0'))); let th = '<thead><tr>'; for (let c=0;c<5;c++) th += '<th>号码</th><th>次数</th><th>金额</th><th>上报</th>'; th += '</tr></thead>'; let tb = '<tbody>'; for (let r=0;r<10;r++) { tb += '<tr>'; for (let c=0;c<5;c++) { const n = cols[c][r] || ''; if (n) { const cnt = numberCount[n] || 0; const amt = directOrderAmount[n] || 0; const rpt = directReportAmount[n] || 0; const cls = redNumbers.includes(n) ? 'red-text' : (blueNumbers.includes(n) ? 'blue-text' : 'green-text'); tb += `<td class="${cls}">${n}</td>`; tb += `<td class="black-text">${cnt > 0 ? cnt : ''}</td>`; tb += `<td class="amount-red-text">${amt > 0 ? amt : ''}</td>`; tb += `<td class="report-red-text">${rpt > 0 ? rpt : ''}</td>`; } else { tb += '<td></td><td></td><td></td><td></td>'; } } tb += '</tr>'; } tb += '</tbody>'; tbl.innerHTML = th + tb; updateDirectAmountTotals(); }

function updateOrderTotalDisplay(){
  const re=document.getElementById('orderResult'); const box=document.getElementById('orderTotalAmountBox'); const span=document.getElementById('orderTotalAmount'); const lineCountSpan=document.getElementById('orderLineCount');
  if(!re||!box||!span)return;
  let total = 0; let lineCount = 0;
  const lines = re.querySelectorAll('.result-line');
  lines.forEach(l => { const m = l.textContent.match(/共(\d+)\)/); if (m) { total += parseInt(m[1]); lineCount++; } });
  if(total > 0){ span.textContent = total; box.style.display = 'inline-flex'; } else { box.style.display = 'none'; }
  if(lineCount > 0){ lineCountSpan.textContent = '(' + lineCount + '行)'; lineCountSpan.style.display = 'inline'; } else { lineCountSpan.style.display = 'none'; }
  const resultLines = re.querySelectorAll('.result-line');
  resultLines.forEach(l => { const text = l.textContent; const maxLossMatch = text.match(/最大亏损:(\d+(?:\.\d+)?)/); if (maxLossMatch) { const md = document.getElementById('maxLossDisplay'); if(md){ md.textContent = '最大亏损: ' + maxLossMatch[1]; md.style.display = 'inline'; } } });
  total = 0; resultLines.forEach(l => { const m = l.textContent.match(/共(\d+)\)/); if (m) total += parseInt(m[1]); });
  if(total > 0) { span.textContent = total; box.style.display = 'inline-flex'; }
}

function computeCurrentOrderTotal(){ 
  const pureLines = window._pureOrderLines || []; 
  let total=0; 
  pureLines.forEach(line=>{
    if(line.startsWith('特肖:')){
      const match = line.match(/^特肖:(.+?)\s+各\s*(\d+)$/);
      if(match){
        const zodiacs = match[1].split('-').filter(z => z.trim());
        const amt = parseInt(match[2]) || 0;
        total += zodiacs.length * amt;
      }
    } else if(line.startsWith('特碰:')){
      const match = line.match(/^特碰:(.+?)\s+各\s*(\d+)$/);
      if(match){
        const cleaned = match[1].replace(/[()]/g, '');
        const groups = cleaned.split(/\s+/).filter(c => c.trim());
        total += groups.length * (parseInt(match[2]) || 0);
      }
    } else if(line.startsWith('包')){
      const match = line.match(/^包(.+?):(.+?)\s+各\s*(\d+)$/);
      if(match){
        total += parseInt(match[3]) || 0;
      }
    } else if(line.startsWith('特码:')){
      const{numbers,amount}=countItemsInLine(line);
      const cnt=numbers.length;
      if(cnt>0) total+=cnt*amount;
    } else {
      const match = line.match(/^(.+?):(.+?)\s+各\s*(\d+)$/);
      if(match){
        const playType = match[1]; const content = match[2]; const amt = parseInt(match[3])||0;
        if(playType==='平特肖'||playType==='平特尾'||playType==='平码'){
          const items = content.split('-').filter(i=>i.trim());
          total += items.length * amt;
        } else {
          const cleaned = content.replace(/[()]/g, '');
          const groups = cleaned.split(/\s+/).filter(c=>c.trim());
          total += groups.length * amt;
        }
      }
    }
  });
  return total; 
}

function updateAmountDisplays(){ 
  const nb=document.getElementById('numberTotalBox'); 
  const zb=document.getElementById('zodiacTotalBox'); 
  if(numberOrderTotal>0){
    document.getElementById('numberTotalAmount').textContent=numberOrderTotal;
    nb.style.display='inline-flex';
  } else { nb.style.display='none'; } 
  let zodiacTotal = 0;
  for (let z in zodiacDirectAmount) { zodiacTotal += zodiacDirectAmount[z] || 0; }
  if(zodiacTotal > 0){
    document.getElementById('zodiacTotalAmount').textContent = zodiacTotal;
    zb.style.display = 'inline-flex';
  } else { zb.style.display = 'none'; } 
}

function updateReportAmountTotal(){ const box=document.getElementById('reportAmountTotalBox'); const span=document.getElementById('reportAmountTotalValue'); let total=0; for(let n in reportAmountData)total+=reportAmountData[n]||0; if(total>0){span.textContent=total;box.style.display='inline-flex';}else{box.style.display='none';} }

// ===== 本年生肖切换 =====
async function changeStartZodiac() { const select = document.getElementById('startZodiacSelect'); const newZodiac = select.value; const savedZodiac = localStorage.getItem('selectedStartZodiac') || '马'; if (newZodiac === savedZodiac) return; const inputPwd = await prompt("请输入本年生肖切换密码：", ""); if (inputPwd !== YEAR_ZODIAC_PASSWORD) { await alert("密码错误"); select.value = savedZodiac; return; } localStorage.setItem('selectedStartZodiac', newZodiac); currentZodiacMap = buildZodiacMap(newZodiac); refreshAll(); }

function renderAllTablesPlaceholder() { const tbody = document.getElementById('tableBody'); if (tbody) { let html = ''; for (let i=1; i<=49; i++) { const num = i.toString().padStart(2,'0'); const zodiac = currentZodiacMap[num] || ''; const cls = redNumbers.includes(num)?'red-text':(blueNumbers.includes(num)?'blue-text':'green-text'); html += `<tr class="${cls}"><td>${num}${zodiac}</td><td>0</td><td>0</td><td>${num}</td><td>${i}</td></tr>`; } tbody.innerHTML = html; } const reportTbody = document.getElementById('reportTableBody'); if (reportTbody) { let html = ''; for (let i=1; i<=49; i++) { const num = i.toString().padStart(2,'0'); const zodiac = currentZodiacMap[num] || ''; const cls = redNumbers.includes(num)?'red-text':(blueNumbers.includes(num)?'blue-text':'green-text'); html += `<tr class="${cls}"><td>${num}${zodiac}</td><td>0</td><td>0</td><td>${num}</td><td>${i}</td></tr>`; } reportTbody.innerHTML = html; } renderFrequencyCards(); renderAmountFrequencyCards(); renderReportAmountTable(); renderOriginalAmountTable(); }

// ===== 表格行选择 =====
function handleTableRowClick(event){ if (window.dragSelectionActive) return; const td = event.target.closest('td'); if(!td) return; const tr = td.closest('tr'); if(!tr) return; const tbody = tr.parentElement; tbody.querySelectorAll('tr').forEach(r => r.classList.remove('selected-row')); tr.classList.add('selected-row'); }

// ===== 风险表生成 =====
function generateRiskTable(){ const sw=document.getElementById('riskReportSwitcher')?.value; let data; if(sw==='total')data=tableBetData; else if(sw==='user'){const u=document.getElementById('viewUserSelect')?.value;data=userBetData[u]||{};} else data=reportBetData; const tbody=document.getElementById('tableBody'); if(!tbody)return; tbody.innerHTML=''; let total=0; const mul=parseFloat(document.getElementById('multipleVal')?.value)||1; const rr=parseFloat(document.getElementById('rebateRate')?.value)||0; let list=[]; for(let n in data){const b=data[n];total+=b;list.push({num:n,bet:b});} for(let i=1;i<=49;i++){const n=i.toString().padStart(2,'0');if(!data[n])list.push({num:n,bet:0});} list.sort((a,b)=>b.bet-a.bet); const reb=(total*rr/100).toFixed(2); list.forEach((item,idx)=>{ const{num,bet}=item; const risk=Math.round(total-bet*mul-parseFloat(reb)); const cls=redNumbers.includes(num)?'red-text':(blueNumbers.includes(num)?'blue-text':'green-text'); const tr=document.createElement('tr'); tr.className=cls; tr.innerHTML=`<td>${num}${currentZodiacMap[num]||''}</td><td>${bet}</td><td>${risk}</td><td>${num}</td><td>${idx+1}</td>`; tbody.appendChild(tr); }); document.getElementById('totalBet').textContent=total; document.getElementById('totalRebate').textContent=reb; }

// ===== 上报表生成 =====
function applyReportCap(){ generateReportTable(); }
function generateReportTable(){
  const cap=document.getElementById('reportCapInput'); let cv=parseFloat(cap?.value); if(isNaN(cv)||cv<=0)cap.value=''; const data=reportBetData; const tbody=document.getElementById('reportTableBody'); if(!tbody)return; tbody.innerHTML=''; const mul=parseFloat(document.getElementById('reportMultipleVal')?.value)||1; const rr=parseFloat(document.getElementById('reportRebateRate')?.value)||0; let total=0; reportRiskData={}; let list=[]; for(let n in data){ let b=data[n]; if(!isNaN(cv)&&cv>0&&b>cv)b=cv; total+=b; list.push({num:n,bet:b}); } for(let i=1;i<=49;i++){const n=i.toString().padStart(2,'0');if(!(n in data))list.push({num:n,bet:0});} list.sort((a,b)=>b.bet-a.bet); const reb=(total*rr/100).toFixed(2); list.forEach((item,idx)=>{ const{num,bet}=item; const risk=Math.round(total-bet*mul-parseFloat(reb)); reportRiskData[num]=risk; const cls=redNumbers.includes(num)?'red-text':(blueNumbers.includes(num)?'blue-text':'green-text'); const tr=document.createElement('tr'); tr.className=cls; tr.innerHTML=`<td>${num}${currentZodiacMap[num]||''}</td><td>${bet}</td><td>${risk}<td>${num}</td><td>${idx+1}</td>`; tbody.appendChild(tr); }); document.getElementById('reportTotalBet').textContent=total; document.getElementById('reportTotalRebate').textContent=reb; const info=document.getElementById('reportCapInfo'); if(!isNaN(cv)&&cv>0){ const exc=[]; for(let n in data){if(data[n]>cv)exc.push({num:n,exceed:data[n]-cv});} if(exc.length>0){ exc.sort((a,b)=>a.exceed-b.exceed); let txt='';let te=0; exc.forEach(x=>{txt+=`${x.num}各${x.exceed}米<br>`;te+=x.exceed;}); txt+=`合计${te}`; info.innerHTML=txt; }else{info.textContent='无超出的号码';} }else{info.textContent='';} if(Object.keys(data).length>0){const max=Math.max(...Object.values(data));cap.placeholder=max;}
}

async function copyReportCapText(){ const info=document.getElementById('reportCapInfo'); const txt=info.innerText||info.textContent; if(!txt||txt==='无超出的号码'){showToast('没有可复制的文本');return;} navigator.clipboard.writeText(txt).then(()=>showToast('已复制')).catch(()=>showToast('复制失败')); }

// ===== 截图功能 =====
async function screenshotTable(tid){ const tbl=document.getElementById(tid); if(!tbl){showToast('表格不存在');return;} try{ const canvas=await html2canvas(tbl,{backgroundColor:'#ffffff',scale:2,logging:false}); canvas.toBlob(async blob=>{ if(!blob){showToast('生成图片失败');return;} try{ const item=new ClipboardItem({'image/png':blob}); await navigator.clipboard.write([item]); showToast('截图已复制'); }catch(e){showToast('复制失败'); } },'image/png'); }catch(e){showToast('截图失败');} }

// ===== 各种统计表渲染 =====
function renderReportAmountTable(){ const tbl=document.getElementById('reportAmountTable'); if(!tbl)return; tbl.innerHTML=''; const cols=[...Array(5)].map((_,c)=>Array.from({length:c===4?9:10},(_,r)=>(c*10+r+1).toString().padStart(2,'0'))); let th='<thead><tr>'; for(let c=0;c<5;c++)th+='<th>号码</th><th>金额</th>'; th+='</tr></thead>'; let tb='<tbody>'; for(let r=0;r<10;r++){ tb+='<tr>'; for(let c=0;c<5;c++){ const n=cols[c][r]||''; if(n){ const a=reportAmountData[n]||0; const cls=redNumbers.includes(n)?'red-text':(blueNumbers.includes(n)?'blue-text':'green-text'); tb+=`<td class="${cls}">${n}</td><td class="black-text">${a||''}</td>`; }else{tb+='<td></td><td></td>';} } tb+='</tr>'; } tb+='</tbody>'; tbl.innerHTML=th+tb; updateReportAmountTotal(); }

function renderFrequencyCards(){ 
  const nt=document.getElementById('numberFreqTable'); if(!nt)return; nt.innerHTML=''; 
  const cols=[...Array(5)].map((_,c)=>Array.from({length:c===4?9:10},(_,r)=>(c*10+r+1).toString().padStart(2,'0'))); 
  let th='<thead><tr>'; for(let c=0;c<5;c++)th+='<th>号码</th><th>次数</th>'; th+='</tr></thead>'; 
  let tb='<tbody>'; for(let r=0;r<10;r++){ tb+='<tr>'; for(let c=0;c<5;c++){ const n=cols[c][r]||''; if(n){ const cnt=numberCount[n]||0; const cls=redNumbers.includes(n)?'red-text':(blueNumbers.includes(n)?'blue-text':'green-text'); tb+=`<td class="${cls}">${n}</td><td class="black-text">${cnt||''}</td>`; }else{tb+='<td></td><td></td>';} } tb+='</tr>'; } tb+='</tbody>'; nt.innerHTML=th+tb; 
  const zt=document.getElementById('zodiacFreqTable'); if(!zt)return; zt.innerHTML=''; 
  const lz=['鼠','牛','虎','兔','龙','蛇'],rz=['马','羊','猴','鸡','狗','猪']; 
  const zcm={'鼠':'red-text','兔':'red-text','马':'red-text','鸡':'red-text','虎':'blue-text','蛇':'blue-text','猴':'blue-text','猪':'blue-text','牛':'green-text','龙':'green-text','羊':'green-text','狗':'green-text'}; 
  let zth='<thead><tr><th>生肖</th><th>次数</th><th>金额</th><th>上报</th><th>生肖</th><th>次数</th><th>金额</th><th>上报</th></tr></thead>',ztb='<tbody>'; 
  for(let r=0;r<6;r++){ 
    const l=lz[r],r2=rz[r]; 
    const lc=zodiacCount[l]||0,rc=zodiacCount[r2]||0; 
    const la=zodiacDirectAmount[l]||0,ra=zodiacDirectAmount[r2]||0; 
    const lrp=zodiacReportAmount[l]||0,rrp=zodiacReportAmount[r2]||0; 
    ztb+=`<tr><td class="${zcm[l]}">${l}</td><td class="black-text">${lc||''}</td><td class="amount-red-text">${la||''}</td><td class="report-red-text">${lrp||''}</td><td class="${zcm[r2]}">${r2}</td><td class="black-text">${rc||''}</td><td class="amount-red-text">${ra||''}</td><td class="report-red-text">${rrp||''}</td></tr>`; 
  } 
  ztb+='</tbody>'; zt.innerHTML=zth+ztb; 
}

function renderAmountFrequencyCards(){ 
  const nt=document.getElementById('numberAmountFreqTable'); if(!nt)return; nt.innerHTML=''; 
  const cols=[...Array(5)].map((_,c)=>Array.from({length:c===4?9:10},(_,r)=>(c*10+r+1).toString().padStart(2,'0'))); 
  let th='<thead><tr>'; for(let c=0;c<5;c++)th+='<th>号码</th><th>次数</th>'; th+='</tr></thead>'; 
  let tb='<tbody>'; for(let r=0;r<10;r++){ tb+='<tr>'; for(let c=0;c<5;c++){ const n=cols[c][r]||''; if(n){ const cnt=numberAmountCount[n]||0; const cls=redNumbers.includes(n)?'red-text':(blueNumbers.includes(n)?'blue-text':'green-text'); tb+=`<td class="${cls}">${n}</td><td class="black-text">${cnt||''}</td>`; }else{tb+='<td></td><td></td>';} } tb+='</tr>'; } tb+='</tbody>'; nt.innerHTML=th+tb; 
  const zt=document.getElementById('zodiacAmountFreqTable'); if(!zt)return; zt.innerHTML=''; 
  const lz=['鼠','牛','虎','兔','龙','蛇'],rz=['马','羊','猴','鸡','狗','猪']; 
  const zcm={'鼠':'red-text','兔':'red-text','马':'red-text','鸡':'red-text','虎':'blue-text','蛇':'blue-text','猴':'blue-text','猪':'blue-text','牛':'green-text','龙':'green-text','羊':'green-text','狗':'green-text'}; 
  let zth='<thead><tr><th>生肖</th><th>次数</th><th>金额</th><th>上报</th><th>生肖</th><th>次数</th><th>金额</th><th>上报</th></tr></thead>',ztb='<tbody>'; 
  for(let r=0;r<6;r++){ 
    const l=lz[r],r2=rz[r]; 
    const lc=zodiacAmountCount[l]||0,rc=zodiacAmountCount[r2]||0; 
    const la=zodiacFilteredAmount[l]||0,ra=zodiacFilteredAmount[r2]||0; 
    const lrp=zodiacFilteredReportAmount[l]||0,rrp=zodiacFilteredReportAmount[r2]||0; 
    ztb+=`<tr><td class="${zcm[l]}">${l}</td><td class="black-text">${lc||''}</td><td class="amount-red-text">${la||''}</td><td class="report-red-text">${lrp||''}</td><td class="${zcm[r2]}">${r2}</td><td class="black-text">${rc||''}</td><td class="amount-red-text">${ra||''}</td><td class="report-red-text">${rrp||''}</td></tr>`; 
  } 
  ztb+='</tbody>'; zt.innerHTML=zth+ztb; 
}

// ===== 统计显示 =====
function renderOrderStats(allOrders, allReports, filterUser, prizeNum) {
  const container = document.getElementById('orderStatsContainer');
  if (!container) return;
  const mul = parseFloat(document.getElementById('multipleVal')?.value) || 1;
  const rr = parseFloat(document.getElementById('rebateRate')?.value) || 0;
  let totalAmountSum = 0;
  allOrders.forEach(it => { totalAmountSum += it.totalAmount || 0; });
  let reportTotalAmount = 0;
  allReports.forEach(it => { reportTotalAmount += it.totalAmount || 0; });
  let totalSpecial = 0, reportSpecial = 0, hitCount = 0;
  if (prizeNum) {
    const num = prizeNum.padStart(2, '0');
    allOrders.forEach(it => {
      totalSpecial += getSpecialAmountFromOrder(it.content, prizeNum);
      if (orderContainsTarget(it.content, prizeNum)) hitCount++;
    });
    allReports.forEach(it => {
      reportSpecial += getSpecialAmountFromOrder(it.content, prizeNum);
    });
  }
  const totalProfit = Math.round(totalAmountSum - totalAmountSum * (rr / 100) - totalSpecial * mul);
  const reportProfit = Math.round(reportTotalAmount - reportTotalAmount * (rr / 100) - reportSpecial * mul);
  const netProfit = totalProfit - reportProfit;
  const showStats = prizeNum && prizeNum.trim() !== '';
  let html = '<div class="stats-block">';
  html += '<div class="stats-row">';
  if (totalAmountSum > 0) { html += `<span class="stat-col"><span class="slabel">总额:</span><span class="stat-val-amount">${totalAmountSum}</span></span>`; }
  if (showStats) {
    html += `<span class="stat-col"><span class="slabel">总特:</span><span class="stat-val-special">${totalSpecial}</span></span>`;
    const tp = Math.round(totalProfit);
    const tlabel = tp >= 0 ? '总盈' : '总亏';
    const tcls = tp >= 0 ? 'stat-val-profit' : 'stat-val-loss';
    html += `<span class="stat-col"><span class="slabel">${tlabel}:</span><span class="${tcls}">${tp}</span></span>`;
    html += `<span class="stat-col"><span class="slabel">中:</span><span class="stat-val-count">${hitCount}条</span></span>`;
  }
  html += '</div><div class="stats-row">';
  if (reportTotalAmount > 0) { html += `<span class="stat-col"><span class="slabel">上报金额:</span><span class="stat-val-amount">${reportTotalAmount}</span></span>`; }
  if (showStats) {
    html += `<span class="stat-col"><span class="slabel">上报特:</span><span class="stat-val-special">${reportSpecial}</span></span>`;
    const rp = Math.round(reportProfit);
    const rlabel = rp >= 0 ? '报盈' : '报亏';
    const rcls = rp >= 0 ? 'stat-val-profit' : 'stat-val-loss';
    html += `<span class="stat-col"><span class="slabel">${rlabel}:</span><span class="${rcls}">${rp}</span></span>`;
    const np = Math.round(netProfit);
    const nlabel = np >= 0 ? '盈' : '亏';
    const ncls = np >= 0 ? 'stat-val-profit' : 'stat-val-loss';
    html += `<span class="stat-col"><span class="slabel">${nlabel}:</span><span class="${ncls}">${np}</span></span>`;
  }
  html += '</div></div>';
  container.innerHTML = html;
}

// ===== 筛选功能 =====
async function applyPrizeFilter(){ const pi=document.getElementById('prizeNumberInput'),uf=document.getElementById('recordUserFilter'); if(!pi||!uf) return; const sd = document.getElementById('filterDate')?.value; const pn=pi.value.trim(),uv=uf.value; const recs=await getOrderRecords(); const reports=await getReportOrderRecords(); const fRecs = sd ? recs.filter(r=>r.date===sd) : recs; const fReps = sd ? reports.filter(r=>r.date===sd) : reports; const userOrders = uv==='all' ? fRecs : fRecs.filter(r=>r.user===uv); const userReports = uv==='all' ? fReps : fReps.filter(r=>r.user===uv); let filtered=pn ? [] : [...userOrders]; if(pn){ for(const it of userOrders){ if(orderContainsTarget(it.content,pn)) filtered.push(it); } } const cont=document.getElementById('orderListContainer'); if(!cont)return; if(filtered.length===0){cont.innerHTML='<div style="padding:20px;text-align:center;color:#666;">暂无匹配订单</div>';} else{ cont.innerHTML=filtered.map(it=>{ const ts=formatTimestampToCST(it.timestamp),ud=it.user||'未知',col=getUserColor(ud),ta=it.totalAmount||0; const lines=it.content.split('\n'); const hl=lines.map(l=>{ const m=l.match(/^特码:(.+?)\s+各(?:数|)\s*(\d+)$/); if(!m)return l; const cont=m[1],amt=m[2]; const hc=highlightContent(cont,pn); return`特码:${hc} 各数 ${amt}`; }).join('<br>'); return`<div class="order-item"><input type="checkbox" class="order-check" data-id="${it.id}"><div class="order-content" data-id="${it.id}">${hl}</div><div class="order-info"><span class="order-total" style="color:#000;">合计：${ta}</span><span class="order-meta"><span style="color:${col};">用户：${ud}</span> &nbsp; ${ts}</span></div><button class="order-copy" onclick="copySingleOrderById('${it.id}')" style="background:#8e44ad;color:#fff;border:none;border-radius:3px;cursor:pointer;font-size:11px;padding:4px 10px;white-space:nowrap;margin-right:4px;">复制</button><button class="order-del" onclick="deleteOrderRecord('${it.id}')">删除</button></div>`; }).join(''); } renderOrderStats(userOrders, userReports, uv, pn); }

// ===== 订单记录 =====
window._orderListAllData = [];
window._orderListPage = 0;
window._orderListPageSize = 50;

async function showOrderRecord(filter='all'){ try{ const recs=await getOrderRecords(),users=getUsers(),today=getTodayCST(); const reports=await getReportOrderRecords(); const fd=document.getElementById('filterDate')?.value; const fRecs=fd?recs.filter(r=>r.date===fd):recs; const fReps=fd?reports.filter(r=>r.date===fd):reports; if(document.getElementById('orderWin'))document.getElementById('orderWin').remove(); const w=document.createElement('div'); w.className='floating-window'; w.id='orderWin'; w.style.width='750px'; w.style.height='600px'; w.style.left='50%'; w.style.top='50%'; w.style.transform='translate(-50%,-50%)'; let html=`<div class="modal-header"><h3>下单记录 <span style="font-size:12px;font-weight:normal;">(共${fRecs.length}单)</span></h3><div class="window-controls"><button onclick="maximizeWindow('orderWin')">🗖</button><button onclick="document.getElementById('orderWin').remove()">×</button></div></div><div class="modal-body" style="display:flex; flex-direction:column; height: calc(100% - 120px);">`;
  html+=`<div style="margin-bottom:6px;display:flex;gap:12px;flex-wrap:wrap;align-items:center;position:sticky;top:0;background:rgba(255,255,255,0.9);z-index:2;padding:5px 0;"><select id="recordUserFilter" onchange="showOrderRecord(this.value)" style="padding:4px 8px;border-radius:4px;border:1px solid #ccc;"><option value="all" ${filter==='all'?'selected':''}>全部用户</option>`;
  users.forEach(u=>html+=`<option value="${u}" ${u===filter?'selected':''}>${u}</option>`);
  html+=`</select><button onclick="checkAll()" style="padding:6px 12px;background:#007bff;color:#fff;border:none;border-radius:4px;">全选</button><button onclick="uncheckAll()" style="padding:6px 12px;background:#6c757d;color:#fff;border:none;border-radius:4px;">取消全选</button><button onclick="deleteChecked()" style="padding:6px 12px;background:#e74c3c;color:#fff;border:none;border-radius:4px;">批量删除</button>`;
  html+=`<span style="display:flex;align-items:center;gap:3px;margin-left:auto;"><span id="orderStatsContainer" style="margin-right:4px;"></span><span style="display:flex;align-items:center;gap:2px;"><span>对奖:</span><input type="text" id="prizeNumberInput" maxlength="2" oninput="applyPrizeFilter()" style="padding:4px;border-radius:4px;border:1px solid #ccc;width:50px;text-align:center;"></span></span>`;
  html+=`</div><div id="orderListContainer" style="flex:1; overflow-y:auto;">`;
  const filterVal = document.getElementById('prizeNumberInput')?.value?.trim();
  const filtered = filterVal ? fRecs.filter(r => orderContainsTarget(r.content, filterVal)) : fRecs;
  if(filtered.length===0){html+=`<div style="padding:20px;text-align:center;color:#666;">暂无订单记录</div>`;} else {
    window._orderListAllData = filtered;
    window._orderListPage = 0;
    const pageSize = window._orderListPageSize;
    const pageData = filtered.slice(0, pageSize);
    html += pageData.map(it => {
      const ts = formatTimestampToCST(it.timestamp), ud = it.user || '未知', col = getUserColor(ud), ta = it.totalAmount || 0;
      let contentHtml = it.content.replace(/\n/g, '<br>');
      return `<div class="order-item"><input type="checkbox" class="order-check" data-id="${it.id}"><div class="order-content" data-id="${it.id}">${contentHtml}</div><div class="order-info"><span class="order-total" style="color:#000;">合计：${ta}</span><span class="order-meta"><span style="color:${col};">用户：${ud}</span> &nbsp; ${ts}</span></div><button class="order-copy" onclick="copySingleOrderById('${it.id}')" style="background:#8e44ad;color:#fff;border:none;border-radius:3px;cursor:pointer;font-size:11px;padding:4px 10px;white-space:nowrap;margin-right:4px;">复制</button><button class="order-del" onclick="deleteOrderRecord('${it.id}')">删除</button></div>`;
    }).join('');
    if (filtered.length > pageSize) {
      html += `<div style="text-align:center;padding:10px;" id="loadMoreOrdersBtn"><button onclick="loadMoreOrders()" style="padding:6px 20px;background:#007bff;color:#fff;border:none;border-radius:4px;cursor:pointer;">加载更多（${pageSize}/${filtered.length}）</button></div>`;
    }
  }
  html+=`</div></div><div class="modal-footer"><button onclick="batchCopyOrders('.order-check')" style="padding:8px 16px;background:#8e44ad;color:#fff;border:none;border-radius:4px;">批量复制</button><button onclick="document.getElementById('orderWin').remove()" style="padding:8px 16px;background:#6c757d;color:#fff;border:none;border-radius:4px;">关闭</button></div>`;
  w.innerHTML=html; document.body.appendChild(w); makeWindowDraggable('orderWin'); highestZ+=1; w.style.zIndex=highestZ;
  renderOrderStats(fRecs, fReps, filter, document.getElementById('prizeNumberInput')?.value?.trim());
 }catch(e){showToast('加载失败');} }

function loadMoreOrders() {
  window._orderListPage = (window._orderListPage || 0) + 1;
  const container = document.getElementById('orderListContainer');
  if (!container) return;
  const allData = window._orderListAllData || [];
  const pageSize = window._orderListPageSize;
  const start = window._orderListPage * pageSize;
  const pageData = allData.slice(start, start + pageSize);
  const oldBtn = document.getElementById('loadMoreOrdersBtn');
  if (oldBtn) oldBtn.remove();
  let html = '';
  pageData.forEach(it => {
    const ts = formatTimestampToCST(it.timestamp), ud = it.user || '未知', col = getUserColor(ud), ta = it.totalAmount || 0;
    let contentHtml = it.content.replace(/\n/g, '<br>');
    html += `<div class="order-item"><input type="checkbox" class="order-check" data-id="${it.id}"><div class="order-content" data-id="${it.id}">${contentHtml}</div><div class="order-info"><span class="order-total" style="color:#000;">合计：${ta}</span><span class="order-meta"><span style="color:${col};">用户：${ud}</span> &nbsp; ${ts}</span></div><button class="order-copy" onclick="copySingleOrderById('${it.id}')" style="background:#8e44ad;color:#fff;border:none;border-radius:3px;cursor:pointer;font-size:11px;padding:4px 10px;white-space:nowrap;margin-right:4px;">复制</button><button class="order-del" onclick="deleteOrderRecord('${it.id}')">删除</button></div>`;
  });
  container.insertAdjacentHTML('beforeend', html);
  if (start + pageSize < allData.length) {
    container.insertAdjacentHTML('beforeend', `<div style="text-align:center;padding:10px;" id="loadMoreOrdersBtn"><button onclick="loadMoreOrders()" style="padding:6px 20px;background:#007bff;color:#fff;border:none;border-radius:4px;cursor:pointer;">加载更多（${start + pageSize}/${allData.length}）</button></div>`);
  }
}

// ===== 删除功能 =====
async function deleteOrderRecord(id) {
  if (!(await confirm('确定删除？（可到回收站恢复）'))) return;
  try {
    const record = await new Promise((resolve) => { const tx = db.transaction([STORE_NAME], 'readonly'); const store = tx.objectStore(STORE_NAME); const req = store.get(id); req.onsuccess = () => resolve(req.result); req.onerror = () => resolve(null); });
    const result = await deleteOrderRecordFromIDB(id);
    if (result) {
      if (record) {
        addOperationLog('delete_order', record.content, currentRegion, record.user, record.totalAmount || 0);
        deductPingtexiaoFromContent(record.content);
      }
      await updateTableFromRecords(); calculateStorageUsage();
      showOrderRecord(); updateRecycleCount();
      if (document.getElementById('lianxiaoStatsWin')) { refreshLianxiaoStats(); }
      showToast('已移入回收站');
    } else { showToast('删除失败，记录可能已不存在'); }
  } catch(e) { console.error('删除订单异常', e); showToast('删除异常'); }
}

async function deleteChecked(){
  const ids=[]; document.querySelectorAll('.order-check:checked').forEach(cb=>ids.push(String(cb.dataset.id)));
  if(ids.length===0){showToast('请选择');return;}
  if(!(await confirm(`确定要删除选中的 ${ids.length} 条记录吗？（可到回收站恢复）`))) return;
  try {
    const details = [];
    for (const id of ids) { const record = await new Promise((resolve) => { const tx = db.transaction([STORE_NAME], 'readonly'); const store = tx.objectStore(STORE_NAME); const req = store.get(id); req.onsuccess = () => resolve(req.result); req.onerror = () => resolve(null); }); if (record) details.push(record); }
    await batchDeleteOrderRecordFromIDB(ids);
    details.forEach(rec => {
      addOperationLog('delete_order', rec.content, currentRegion, rec.user, rec.totalAmount || 0);
      deductPingtexiaoFromContent(rec.content);
    });
    await updateTableFromRecords(); calculateStorageUsage();
    showOrderRecord(); updateRecycleCount();
    if (document.getElementById('lianxiaoStatsWin')) { refreshLianxiaoStats(); }
    showToast(`已将 ${ids.length} 条移入回收站`);
  } catch(e) { console.error('批量删除异常', e); showToast('批量删除异常'); }
}

// ===== 清空输入 =====
function clearAllInput(){ 
  const si=document.querySelector('.source-order-input'); if(si)si.value=''; 
  const re=document.getElementById('orderResult'); if(re)re.innerHTML=''; 
  window._pureOrderLines = []; 
  window._pureOrderRegions = [];
  updateOrderTotalDisplay(); 
  const md=document.getElementById('maxLossDisplay'); if(md){md.textContent='';md.style.display='none';}
  const box = document.getElementById('orderTotalAmountBox'); if(box) box.style.display='none';
  const lineCountSpan = document.getElementById('orderLineCount'); if(lineCountSpan) lineCountSpan.style.display='none';
}

// ===== 平特肖相关 =====
function getPingtexiaoData() { try { return JSON.parse(localStorage.getItem(getPingtexiaoKey()) || '{}'); } catch (e) { return {}; } }
function savePingtexiaoData(data) { localStorage.setItem(getPingtexiaoKey(), JSON.stringify(data)); }

function renderPingtexiaoTable() { const container = document.getElementById('pingtexiaoTableContainer'); if (!container) return; const data = getPingtexiaoData(); const leftZodiacs = ['鼠','牛','虎','兔','龙','蛇']; const rightZodiacs = ['马','羊','猴','鸡','狗','猪']; const zcm = {'鼠':'red-text','兔':'red-text','马':'red-text','鸡':'red-text','虎':'blue-text','蛇':'blue-text','猴':'blue-text','猪':'blue-text','牛':'green-text','龙':'green-text','羊':'green-text','狗':'green-text'}; let html = '<table class="freq-table"><thead><tr>'; html += '<th>生肖</th><th>金额</th><th>上报</th><th>剩余</th>'; html += '<th>生肖</th><th>金额</th><th>上报</th><th>剩余</th>'; html += '</tr></thead><tbody>'; for (let r = 0; r < 6; r++) { html += '<tr>'; [leftZodiacs[r], rightZodiacs[r]].forEach(zodiac => { const d = data[zodiac] || { amount: '', report: '' }; const amountVal = d.amount !== undefined && d.amount !== '' && parseFloat(d.amount) !== 0 ? d.amount : ''; const reportVal = d.report !== undefined && d.report !== '' && parseFloat(d.report) !== 0 ? d.report : ''; const remainVal = (amountVal !== '') ? (parseFloat(amountVal) - (reportVal !== '' ? parseFloat(reportVal) : 0)) : 0; const remain = remainVal !== 0 ? remainVal : ''; html += `<td class="${zcm[zodiac] || ''}">${zodiac}</td>`; html += `<td><input type="number" class="pt-edit-input amount-red-text" data-zodiac="${zodiac}" data-field="amount" value="${amountVal}" readonly style="width:50px;padding:1px 2px;font-size:12px;text-align:center;border:1px solid transparent;background:transparent;"></td>`; html += `<td><input type="number" class="pt-edit-input pt-report-text" data-zodiac="${zodiac}" data-field="report" value="${reportVal}" readonly style="width:50px;padding:1px 2px;font-size:12px;text-align:center;border:1px solid transparent;background:transparent;"></td>`; html += `<td style="font-size:12px;">${remain !== '' ? remain : ''}</td>`; }); html += '</tr>'; } html += '</tbody></table>'; container.innerHTML = html; updatePingtexiaoTotal(); }

function updatePingtexiaoTotal() { let amountTotal = 0, reportTotal = 0; document.querySelectorAll('.pt-edit-input[data-field="amount"]').forEach(input => { const v = parseFloat(input.value.trim()); if (!isNaN(v)) amountTotal += v; }); document.querySelectorAll('.pt-edit-input[data-field="report"]').forEach(input => { const v = parseFloat(input.value.trim()); if (!isNaN(v)) reportTotal += v; }); const amountBox = document.getElementById('ptAmountTotalBox'); const amountSpan = document.getElementById('ptAmountTotal'); const reportBox = document.getElementById('ptReportTotalBox'); const reportSpan = document.getElementById('ptReportTotal'); if (amountBox && amountSpan) { if (amountTotal > 0) { amountSpan.textContent = amountTotal; amountBox.style.display = 'inline-flex'; } else { amountBox.style.display = 'none'; } } if (reportBox && reportSpan) { if (reportTotal > 0) { reportSpan.textContent = reportTotal; reportBox.style.display = 'inline-flex'; } else { reportBox.style.display = 'none'; } } }

function deductPingtexiaoFromContent(content) {
  const pingtexiaoData = getPingtexiaoData();
  let changed = false;
  const lines = content.split('\n');
  lines.forEach(line => {
    const match = line.match(/^(.+?):(.+?)\s+各\s*(\d+)$/);
    if (!match) return;
    const playType = normalizePlayType(match[1]);
    if (playType !== '平特肖') return;
    const combosStr = match[2];
    const amt = parseInt(match[3]) || 0;
    const cleaned = combosStr.replace(/[()]/g, '');
    const items = cleaned.split('-').filter(i => i.trim());
    items.forEach(item => {
      if (/^[\u4e00-\u9fa5]$/.test(item) && ZODIAC_NUMS[item]) {
        if (pingtexiaoData[item]) {
          const oldAmount = parseFloat(pingtexiaoData[item].amount) || 0;
          const newAmount = Math.max(0, oldAmount - amt);
          pingtexiaoData[item].amount = newAmount.toString();
          changed = true;
        }
      }
    });
  });
  if (changed) { savePingtexiaoData(pingtexiaoData); renderPingtexiaoTable(); updatePingtexiaoTotal(); }
}

// ===== 新增：删除上报时同步扣除平特肖上报金额 =====
function deductPingtexiaoFromReportContent(content) {
  const pingtexiaoData = getPingtexiaoData();
  let changed = false;
  const lines = content.split('\n');
  lines.forEach(line => {
    const match = line.match(/^(.+?):(.+?)\s+各\s*(\d+)$/);
    if (!match) return;
    const playType = normalizePlayType(match[1]);
    if (playType !== '平特肖') return;
    const combosStr = match[2];
    const amt = parseInt(match[3]) || 0;
    const cleaned = combosStr.replace(/[()]/g, '');
    const items = cleaned.split('-').filter(i => i.trim());
    items.forEach(item => {
      if (/^[\u4e00-\u9fa5]$/.test(item) && ZODIAC_NUMS[item]) {
        if (pingtexiaoData[item]) {
          const oldReport = parseFloat(pingtexiaoData[item].report) || 0;
          const newReport = Math.max(0, oldReport - amt);
          pingtexiaoData[item].report = newReport.toString();
          changed = true;
        }
      }
    });
  });
  if (changed) { savePingtexiaoData(pingtexiaoData); renderPingtexiaoTable(); updatePingtexiaoTotal(); }
}

// ===== 上报记录 =====
async function showReportOrderRecord(filter='all'){ try{ const recs=await getReportOrderRecords(),users=getUsers(); if(document.getElementById('reportWin'))document.getElementById('reportWin').remove(); const fd=document.getElementById('filterDate')?.value; const df=fd?recs.filter(r=>r.date===fd):recs; const fin=(filter==='all')?df:df.filter(r=>r.user===filter); window._reportListAllData = fin; window._reportListPage = 0; const w=document.createElement('div'); w.className='floating-window'; w.id='reportWin'; w.style.width='700px'; w.style.height='500px'; w.style.left='50%'; w.style.top='50%'; w.style.transform='translate(-50%,-50%)'; let html=`<div class="modal-header"><h3>上报数据 <span style="font-size:12px;font-weight:normal;">(共${fin.length}单)</span></h3><div class="window-controls"><button onclick="maximizeWindow('reportWin')">🗖</button><button onclick="document.getElementById('reportWin').remove()">×</button></div></div><div class="modal-body" style="display:flex; flex-direction:column; height: calc(100% - 120px);">`; html+=`<div style="margin-bottom:10px;display:flex;gap:12px;flex-wrap:wrap;align-items:center;position:sticky;top:0;background:rgba(255,255,255,0.9);z-index:2;padding:5px 0;"><select id="reportRecordUserFilter" onchange="showReportOrderRecord(this.value)" style="padding:4px 8px;border-radius:4px;border:1px solid #ccc;"><option value="all" ${filter==='all'?'selected':''}>全部用户</option>`; users.forEach(u=>html+=`<option value="${u}" ${u===filter?'selected':''}>${u}</option>`); html+=`</select><button onclick="checkAllReport()" style="padding:6px 12px;background:#007bff;color:#fff;border:none;border-radius:4px;">全选</button><button onclick="uncheckAllReport()" style="padding:6px 12px;background:#6c757d;color:#fff;border:none;border-radius:4px;">取消全选</button><button onclick="deleteCheckedReport()" style="padding:6px 12px;background:#e74c3c;color:#fff;border:none;border-radius:4px;">批量删除</button></div>`; html+=`<div id="reportOrderListContainer" style="flex:1; overflow-y:auto;">`; if(fin.length===0)html+=`<div style="padding:20px;text-align:center;color:#666;">暂无上报记录</div>`; else{ const pageSize = window._orderListPageSize || 50; const pageData = fin.slice(0, pageSize); pageData.forEach(it=>{ const ts=formatTimestampToCST(it.timestamp),ud=it.user||'未知',ta=it.totalAmount||0; html+=`<div class="order-item"><input type="checkbox" class="report-order-check" data-id="${it.id}"><div class="order-content" data-id="${it.id}">${it.content.replace(/\n/g,'<br>')}</div><div class="order-info"><span class="order-total" style="color:#000;">合计：${ta}</span><span class="order-meta"><span style="color:red;">用户：${ud}</span> &nbsp; ${ts}</span></div><button class="order-copy" onclick="copySingleOrderById('${it.id}')" style="background:#8e44ad;color:#fff;border:none;border-radius:3px;cursor:pointer;font-size:11px;padding:4px 10px;white-space:nowrap;margin-right:4px;">复制</button><button class="order-del" onclick="deleteReportOrderRecord('${it.id}')">删除</button></div>`; }); if (fin.length > pageSize) { html += `<div style="text-align:center;padding:10px;" id="loadMoreReportsBtn"><button onclick="loadMoreReports()" style="padding:6px 20px;background:#007bff;color:#fff;border:none;border-radius:4px;cursor:pointer;">加载更多（${pageSize}/${fin.length}）</button></div>`; } } html+=`</div></div><div class="modal-footer"><button onclick="batchCopyOrders('.report-order-check')" style="padding:8px 16px;background:#8e44ad;color:#fff;border:none;border-radius:4px;">批量复制</button><button onclick="document.getElementById('reportWin').remove()" style="padding:8px 16px;background:#6c757d;color:#fff;border:none;border-radius:4px;">关闭</button></div>`; w.innerHTML=html; document.body.appendChild(w); makeWindowDraggable('reportWin'); highestZ+=1; w.style.zIndex=highestZ; }catch(e){showToast('加载失败');} }

function loadMoreReports() {
  window._reportListPage = (window._reportListPage || 0) + 1;
  const container = document.getElementById('reportOrderListContainer');
  if (!container) return;
  const allData = window._reportListAllData || [];
  const pageSize = window._orderListPageSize || 50;
  const start = window._reportListPage * pageSize;
  const pageData = allData.slice(start, start + pageSize);
  const oldBtn = document.getElementById('loadMoreReportsBtn');
  if (oldBtn) oldBtn.remove();
  let html = '';
  pageData.forEach(it => {
    const ts = formatTimestampToCST(it.timestamp), ud = it.user || '未知', ta = it.totalAmount || 0;
    html += `<div class="order-item"><input type="checkbox" class="report-order-check" data-id="${it.id}"><div class="order-content" data-id="${it.id}">${it.content.replace(/\n/g, '<br>')}</div><div class="order-info"><span class="order-total" style="color:#000;">合计：${ta}</span><span class="order-meta"><span style="color:red;">用户：${ud}</span> &nbsp; ${ts}</span></div><button class="order-copy" onclick="copySingleOrderById('${it.id}')" style="background:#8e44ad;color:#fff;border:none;border-radius:3px;cursor:pointer;font-size:11px;padding:4px 10px;white-space:nowrap;margin-right:4px;">复制</button><button class="order-del" onclick="deleteReportOrderRecord('${it.id}')">删除</button></div>`;
  });
  container.insertAdjacentHTML('beforeend', html);
  if (start + pageSize < allData.length) {
    container.insertAdjacentHTML('beforeend', `<div style="text-align:center;padding:10px;" id="loadMoreReportsBtn"><button onclick="loadMoreReports()" style="padding:6px 20px;background:#007bff;color:#fff;border:none;border-radius:4px;cursor:pointer;">加载更多（${start + pageSize}/${allData.length}）</button></div>`);
  }
}

async function deleteReportOrderRecord(id) {
  if (!(await confirm('确定删除？（可到回收站恢复）'))) return;
  try {
    const record = await new Promise((resolve) => {
      const tx = db.transaction([REPORT_STORE_NAME], 'readonly');
      const store = tx.objectStore(REPORT_STORE_NAME);
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    });
    const result = await deleteReportOrderRecordFromIDB(id);
    if (result) {
      if (record) {
        addOperationLog('delete_report', record.content, currentRegion, record.user, record.totalAmount || 0);
        deductPingtexiaoFromReportContent(record.content);
      }
      await updateTableFromRecords(); calculateStorageUsage();
      const userFilter = document.getElementById('reportRecordUserFilter')?.value || 'all';
      await showReportOrderRecord(userFilter);
      updateRecycleCount();
      showToast('已移入回收站');
    } else {
      showToast('删除失败，记录可能已不存在');
    }
  } catch(e) {
    console.error('删除上报异常', e);
    showToast('删除异常');
  }
}

async function deleteCheckedReport(){
  const ids=[]; document.querySelectorAll('.report-order-check:checked').forEach(cb=>ids.push(String(cb.dataset.id)));
  if(ids.length===0){showToast('请选择');return;}
  if(!(await confirm(`确定要删除选中的 ${ids.length} 条上报记录吗？（可到回收站恢复）`))) return;
  try {
    const details = [];
    for (const id of ids) {
      const record = await new Promise((resolve) => {
        const tx = db.transaction([REPORT_STORE_NAME], 'readonly');
        const store = tx.objectStore(REPORT_STORE_NAME);
        const req = store.get(id);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
      });
      if (record) details.push(record);
    }
    await batchDeleteReportOrderRecordFromIDB(ids);
    details.forEach(rec => {
      addOperationLog('delete_report', rec.content, currentRegion, rec.user, rec.totalAmount || 0);
      deductPingtexiaoFromReportContent(rec.content);
    });
    await updateTableFromRecords();
    calculateStorageUsage();
    const userFilter = document.getElementById('reportRecordUserFilter')?.value || 'all';
    await showReportOrderRecord(userFilter);
    updateRecycleCount();
    showToast(`已将 ${ids.length} 条移入回收站`);
  } catch(e) { console.error('批量删除异常', e); showToast('批量删除异常'); }
}

// ===== 复制功能 =====
function copySingleOrderById(id) { const el = document.querySelector(`.order-content[data-id="${id}"]`); if (!el) { showToast('未找到订单内容'); return; } navigator.clipboard.writeText(el.innerText).then(() => { showToast('已复制到剪贴板'); }).catch(() => { showToast('复制失败'); }); }
function batchCopyOrders(selector) { const checked = document.querySelectorAll(selector + ':checked'); if (checked.length === 0) { showToast('请先选择订单'); return; } const contents = []; checked.forEach(cb => { const id = cb.dataset.id; if (id) { const el = document.querySelector(`.order-content[data-id="${id}"]`); if (el) contents.push(el.innerText); } }); if (contents.length === 0) { showToast('无有效内容'); return; } navigator.clipboard.writeText(contents.join('\n')).then(() => { showToast(`已复制 ${contents.length} 条订单`); }).catch(() => { showToast('复制失败'); }); }

// ===== 连肖统计窗口 =====
function showLianxiaoStatsWin() {
  if (document.getElementById('lianxiaoStatsWin')) return;
  const win = document.createElement('div'); win.className = 'floating-window'; win.id = 'lianxiaoStatsWin';
  win.style.width = '900px'; win.style.height = '750px'; win.style.left = '50%'; win.style.top = '50%'; win.style.transform = 'translate(-50%, -50%)';
  win.setAttribute('data-orig-width', '900px'); win.setAttribute('data-orig-height', '750px');
  win.innerHTML = `
    <div class="modal-header">连肖统计<div class="window-controls"><button onclick="maximizeWindow('lianxiaoStatsWin')">🗖</button><button onclick="document.getElementById('lianxiaoStatsWin').remove()">×</button></div></div>
    <div class="modal-body" style="display:flex; flex-direction:column; height: calc(100% - 60px);">
      <div id="lianxiaoStatsContainer" style="column-count:4; column-gap:10px; flex:1; overflow-y:auto;"></div>
      <div id="lianxiaoStatsTotal" style="text-align:center; font-weight:bold; font-size:14px; padding:8px; border-top:2px solid #333; margin-top:8px;"></div>
    </div>`;
  document.body.appendChild(win);
  makeWindowDraggable('lianxiaoStatsWin'); highestZ += 1; win.style.zIndex = highestZ;
  showFloatingWinOverlay('lianxiaoStatsWin');
  refreshLianxiaoStats();
}

// ===== 连肖统计刷新 =====
async function refreshLianxiaoStats() {
  const container = document.getElementById('lianxiaoStatsContainer');
  if (!container) return;
  if (!db) { container.innerHTML = '数据库不可用'; return; }
  const fd = document.getElementById('filterDate')?.value || getTodayCST();
  
  const tx = db.transaction([STORE_NAME], 'readonly');
  const store = tx.objectStore(STORE_NAME);
  const all = await new Promise(resolve => {
    const req = store.getAll();
    req.onsuccess = (e) => resolve(e.target.result || []);
  });
  
  const allOrders = all.filter(r => r.region === currentRegion && r.date === fd);
  const records = [];
  allOrders.forEach(order => {
    const lines = order.content.split('\n');
    lines.forEach(line => {
      const newMatch = line.match(/^(.+?):(.+?)\s+各(?:数|组|)\s*(\d+)$/);
      if (newMatch) {
        const playType = normalizePlayType(newMatch[1]);
        if (playType !== '特码') {
          records.push({ content: line, user: order.user, date: order.date });
        }
        return;
      }
      const oldMatch = line.match(/^(.+?)\s+各组\s+(\d+)$/);
      if (oldMatch) {
        records.push({ content: line, user: order.user, date: order.date });
      }
    });
  });
  
  if (records.length === 0) {
    container.innerHTML = '<div style="color:#666;text-align:center;padding:10px;">暂无其他订单数据</div>';
    document.getElementById('lianxiaoStatsTotal').innerHTML = '';
    return;
  }
  const curYearZodiac = document.getElementById('startZodiacSelect')?.value || '马';

  let drawNumbers = [];
  let drawZodiacs = [];
  const fdYear = fd.substring(0, 4);
  let storageKey = `comboDrawRecord_${currentRegion}_${fdYear}`;
  let savedData = {};
  try { savedData = JSON.parse(localStorage.getItem(storageKey) || '{}'); } catch (e) { }
  if (Object.keys(savedData).length === 0) {
    storageKey = `drawRecord_${currentRegion}_${fdYear}`;
    try { savedData = JSON.parse(localStorage.getItem(storageKey) || '{}'); } catch (e) { }
  }
  const currentIssue = getCurrentIssueNumber(parseInt(fdYear), fd);
  if (currentIssue) {
    const issueId = currentIssue.toString().padStart(2, '0');
    const entry = savedData[issueId];
    if (entry && entry.numbers && Array.isArray(entry.numbers)) {
      entry.numbers.forEach(n => {
        if (n && /^\d{2}$/.test(n) && parseInt(n) >= 1 && parseInt(n) <= 49) {
          drawNumbers.push(n);
          const zodiac = currentZodiacMap[n] || '';
          if (zodiac) drawZodiacs.push(zodiac);
        }
      });
    } else if (entry && entry.number && entry.number.trim()) {
      const n = entry.number.trim().padStart(2, '0');
      if (/^\d{2}$/.test(n) && parseInt(n) >= 1 && parseInt(n) <= 49) {
        drawNumbers.push(n);
        const zodiac = currentZodiacMap[n] || '';
        if (zodiac) drawZodiacs.push(zodiac);
      }
    }
  }
  const drawZodiacsSet = new Set(drawZodiacs);
  const drawNumbersSet = new Set(drawNumbers);
  const drawNumbersZhengma = drawNumbers.slice(0, 6);

  const stats = {};
  let grandTotal = 0;
  let orderCountLianxiao = records.length;
  
  records.forEach(rec => {
    const line = rec.content;
    const newMatch = line.match(/^(.+?):(.+?)\s+(各(?:组|))\s*(\d+)$/);
    if (newMatch) {
      const playType = normalizePlayType(newMatch[1]);
      const content = newMatch[2];
      const amount = parseInt(newMatch[4]) || 0;
      
      if (playType === '特肖') {
        const zodiacs = content.split('-').filter(z => z.trim());
        zodiacs.forEach(z => {
          if (!stats['特肖']) stats['特肖'] = { withYear: new Map(), withoutYear: new Map() };
          const hasYear = z === curYearZodiac;
          const target = hasYear ? stats['特肖'].withYear : stats['特肖'].withoutYear;
          target.set(z, (target.get(z) || 0) + amount);
          grandTotal += amount;
        });
        return;
      }
      
      if (playType === '特碰' || playType === '二中二') {
        const comboType = playType === '特碰' ? 'tePeng' : 'zhong2';
        const cleaned = content.replace(/[()]/g, '');
        const combos = cleaned.split(/\s+/).filter(c => c.trim());
        if (!stats[comboType]) stats[comboType] = { withYear: new Map(), withoutYear: new Map() };
        combos.forEach(c => {
          stats[comboType].withYear.set(c, (stats[comboType].withYear.get(c) || 0) + amount);
          grandTotal += amount;
        });
        return;
      }
      
      if (playType.startsWith('包')) {
        const attr = content.trim();
        if (!attr || !D[attr]) return;
        if (!stats['bao']) stats['bao'] = { withYear: new Map(), withoutYear: new Map() };
        stats['bao'].withYear.set(attr, (stats['bao'].withYear.get(attr) || 0) + amount);
        grandTotal += amount;
        return;
      }
      
      const groups = content.split(/\s+/);
      groups.forEach(group => {
        const rawGroup = group.replace(/^\(|\)$/g, '');
        const tokens = rawGroup.split('-');
        if (playType === '平特肖' || playType === '平特尾' || playType === '平码') {
          tokens.forEach(token => {
            const comboType = playType === '平特肖' ? 'pingtexiao' : (playType === '平特尾' ? 'pingtewei' : 'pingma');
            if (!stats[comboType]) stats[comboType] = { withYear: new Map(), withoutYear: new Map() };
            const cleanToken = token.trim();
            if (comboType === 'pingtexiao') {
              const hasYear = cleanToken === curYearZodiac;
              (hasYear ? stats[comboType].withYear : stats[comboType].withoutYear).set(cleanToken, ((hasYear ? stats[comboType].withYear : stats[comboType].withoutYear).get(cleanToken) || 0) + amount);
            } else if (comboType === 'pingtewei') {
              const hasZero = cleanToken.replace('尾', '') === '0';
              (hasZero ? stats[comboType].withYear : stats[comboType].withoutYear).set(cleanToken, ((hasZero ? stats[comboType].withYear : stats[comboType].withoutYear).get(cleanToken) || 0) + amount);
            } else {
              stats[comboType].withYear.set(cleanToken, (stats[comboType].withYear.get(cleanToken) || 0) + amount);
            }
            grandTotal += amount;
          });
        } else if (tokens.every(t => /^[\u4e00-\u9fa5]$/.test(t) && ZODIAC_NUMS[t])) {
          const comboType = 'lianxiao' + tokens.length;
          if (!stats[comboType]) stats[comboType] = { withYear: new Map(), withoutYear: new Map() };
          const hasYear = tokens.some(t => t === curYearZodiac);
          const comboKey = tokens.join('-');
          (hasYear ? stats[comboType].withYear : stats[comboType].withoutYear).set(comboKey, ((hasYear ? stats[comboType].withYear : stats[comboType].withoutYear).get(comboKey) || 0) + amount);
          grandTotal += amount;
        } else if (tokens.every(t => /^\d+尾$/.test(t))) {
          const comboType = 'lianwei' + tokens.length;
          if (!stats[comboType]) stats[comboType] = { withYear: new Map(), withoutYear: new Map() };
          const hasZero = tokens.some(t => t.replace('尾', '') === '0');
          const comboKey = tokens.join('-');
          (hasZero ? stats[comboType].withYear : stats[comboType].withoutYear).set(comboKey, ((hasZero ? stats[comboType].withYear : stats[comboType].withoutYear).get(comboKey) || 0) + amount);
          grandTotal += amount;
        } else if (tokens.every(t => /^\d{2}$/.test(t))) {
          const comboType = tokens.length === 1 ? 'pingma' : (tokens.length === 2 ? 'zhong2' : (tokens.length === 3 ? 'zhong3' : 'buzhong' + tokens.length));
          if (!stats[comboType]) stats[comboType] = { withYear: new Map(), withoutYear: new Map() };
          const comboKey = tokens.join('-');
          stats[comboType].withYear.set(comboKey, (stats[comboType].withYear.get(comboKey) || 0) + amount);
          grandTotal += amount;
        }
      });
      return;
    }
    const oldMatch = line.match(/^(.+?)\s*(?:各组|各)\s*(\d+)$/);
    if (!oldMatch) return;
    const content = oldMatch[1];
    const amount = parseInt(oldMatch[2]) || 0;
    const groups = content.split(/\s+/);
    groups.forEach(group => {
      const rawGroup = group.replace(/^\(|\)$/g, '');
      const tokens = rawGroup.split('-');
      if (tokens.length === 1 && ZODIAC_NUMS[tokens[0]]) {
        const comboType = 'pingtexiao';
        if (!stats[comboType]) stats[comboType] = { withYear: new Map(), withoutYear: new Map() };
        const hasYear = tokens[0] === curYearZodiac;
        (hasYear ? stats[comboType].withYear : stats[comboType].withoutYear).set(tokens[0], ((hasYear ? stats[comboType].withYear : stats[comboType].withoutYear).get(tokens[0]) || 0) + amount);
        grandTotal += amount;
      } else if (tokens.length === 1 && tokens[0].includes('尾')) {
        const comboType = 'pingtewei';
        if (!stats[comboType]) stats[comboType] = { withYear: new Map(), withoutYear: new Map() };
        const hasZero = tokens[0].replace('尾', '') === '0';
        (hasZero ? stats[comboType].withYear : stats[comboType].withoutYear).set(tokens[0], ((hasZero ? stats[comboType].withYear : stats[comboType].withoutYear).get(tokens[0]) || 0) + amount);
        grandTotal += amount;
      } else if (tokens.some(t => ZODIAC_NUMS[t])) {
        const comboType = 'lianxiao' + tokens.length;
        if (!stats[comboType]) stats[comboType] = { withYear: new Map(), withoutYear: new Map() };
        const hasYear = tokens.some(t => t === curYearZodiac);
        const comboKey = tokens.join('-');
        (hasYear ? stats[comboType].withYear : stats[comboType].withoutYear).set(comboKey, ((hasYear ? stats[comboType].withYear : stats[comboType].withoutYear).get(comboKey) || 0) + amount);
        grandTotal += amount;
      } else if (tokens.some(t => t.includes('尾'))) {
        const comboType = 'lianwei' + tokens.length;
        if (!stats[comboType]) stats[comboType] = { withYear: new Map(), withoutYear: new Map() };
        const hasZero = tokens.some(t => t.replace('尾', '') === '0');
        const comboKey = tokens.join('-');
        (hasZero ? stats[comboType].withYear : stats[comboType].withoutYear).set(comboKey, ((hasZero ? stats[comboType].withYear : stats[comboType].withoutYear).get(comboKey) || 0) + amount);
        grandTotal += amount;
      } else {
        const comboType = tokens.length === 1 ? 'pingma' : (tokens.length === 2 ? 'zhong2' : (tokens.length === 3 ? 'zhong3' : 'buzhong' + tokens.length));
        if (!stats[comboType]) stats[comboType] = { withYear: new Map(), withoutYear: new Map() };
        const comboKey = tokens.join('-');
        stats[comboType].withYear.set(comboKey, (stats[comboType].withYear.get(comboKey) || 0) + amount);
        grandTotal += amount;
      }
    });
  });

  const oddsData = getOddsData();
  const defaults = {
    '特码': { odds: 47, rebate: 4 },
    '特肖': { odds: 11, rebate: 4 },
    '特肖本年肖': { odds: 10, rebate: 4 },
    'pingtexiao': { odds: 2, rebate: 4 }, 'pingtexiao带主肖': { odds: 1.8, rebate: 4 }, 'lianxiao2': { odds: 4, rebate: 4 }, 'lianxiao2带主肖': { odds: 3.5, rebate: 4 },
    'lianxiao3': { odds: 10, rebate: 4 }, 'lianxiao3带主肖': { odds: 9, rebate: 4 }, 'lianxiao4': { odds: 30, rebate: 4 }, 'lianxiao4带主肖': { odds: 25, rebate: 4 },
    'lianxiao5': { odds: 100, rebate: 4 }, 'lianxiao5带主肖': { odds: 90, rebate: 4 }, 'pingtewei': { odds: 1.8, rebate: 4 }, 'pingtewei零尾': { odds: 2, rebate: 4 },
    'lianwei2': { odds: 3, rebate: 4 }, 'lianwei2零尾': { odds: 3.5, rebate: 4 }, 'lianwei3': { odds: 6, rebate: 4 }, 'lianwei3零尾': { odds: 6.5, rebate: 4 },
    'lianwei4': { odds: 14, rebate: 4 }, 'lianwei4零尾': { odds: 15, rebate: 4 }, 'lianwei5': { odds: 28, rebate: 4 }, 'lianwei5零尾': { odds: 30, rebate: 4 },
    'buzhong5': { odds: 2, rebate: 4 }, 'buzhong6': { odds: 2.5, rebate: 4 }, 'buzhong7': { odds: 3, rebate: 4 }, 'buzhong8': { odds: 3.5, rebate: 4 },
    'buzhong9': { odds: 4, rebate: 4 }, 'buzhong10': { odds: 5, rebate: 4 }, 'buzhong11': { odds: 6, rebate: 4 }, 'buzhong12': { odds: 7, rebate: 4 },
    'zhong2': { odds: 60, rebate: 4 }, 'zhong3': { odds: 600, rebate: 4 }, 'pingma': { odds: 7, rebate: 4 },
    'tePeng': { odds: 120, rebate: 4 }
  };
  function getPlayOdds(type, hasSpecial) {
    let key = type;
    if (hasSpecial && type === 'pingtexiao') key = 'pingtexiao带主肖';
    else if (hasSpecial && type.startsWith('lianxiao')) key = type + '带主肖';
    else if (hasSpecial && type === 'pingtewei') key = 'pingtewei零尾';
    else if (hasSpecial && type.startsWith('lianwei')) key = type + '零尾';
    const saved = oddsData[key] || {};
    return { odds: parseFloat(saved.odds) || defaults[key]?.odds || 1, rebate: parseFloat(saved.rebate) || defaults[key]?.rebate || 4 };
  }

  let grandPL = 0;
  const cardsArray = [];
  const order = ['特肖', 'tePeng', 'pingtexiao', 'lianxiao2', 'lianxiao3', 'lianxiao4', 'lianxiao5', 'buzhong5', 'buzhong6', 'buzhong7', 'buzhong8', 'buzhong9', 'buzhong10', 'buzhong11', 'buzhong12', 'pingma', 'pingtewei', 'lianwei2', 'lianwei3', 'lianwei4', 'lianwei5', 'zhong2', 'zhong3', 'bao'];

  order.forEach((type) => {
    if (!stats[type]) return;
    const data = stats[type];
    const cardId = 'comboCard_' + type;
    let totalGroups = 0, totalAmount = 0, cardPL = 0, totalHitAmount = 0;
    const isBao = (type === 'bao');
    const isTePeng = (type === 'tePeng');

    let tablesHtml = '';

    function renderTable(map, hasSpecial) {
      if (map.size === 0) return '';
      let html2 = '';
      const headerLabel = isBao ? '属性' : (isTePeng ? '组合' : (type === '特肖' || type.startsWith('lianxiao') || type === 'pingtexiao' ? '生肖' : (type.includes('wei') ? '尾数' : '组合')));
      html2 += '<table style="width:100%;"><tr><th style="text-align:center;">' + headerLabel + '</th><th style="text-align:center;">金额</th><th style="text-align:center;">中奖</th><th style="text-align:center;">盈亏</th></tr>';
      map.forEach((v, k) => {
        const displayKey = k.replace(/^\(|\)$/g, '');
        const tokens = displayKey.split('-');
        let hit = false;
        let odds, rebate;
        if (isBao) {
          const baoType = '包' + displayKey;
          const baoOdds = getOddsForType(baoType, oddsData);
          odds = baoOdds.odds; rebate = baoOdds.rebate;
          if (drawNumbers.length > 0 && D[displayKey]) {
            const attrNums = (D[displayKey] || '').split(/[\s,，]+/).filter(n => n.trim());
            const teMa = drawNumbers[6] || '';
            hit = attrNums.includes(teMa);
          }
        } else if (isTePeng) {
          const baoOdds = getOddsForType('特碰', oddsData);
          odds = baoOdds.odds; rebate = baoOdds.rebate;
          if (drawNumbers.length > 0) {
            const teMa = drawNumbers[6] || '';
            hit = (tokens.length === 2 && tokens[0].padStart(2, '0') === teMa && drawNumbersZhengma.includes(tokens[1].padStart(2, '0')));
          }
        } else {
          const { odds: o, rebate: r } = getPlayOdds(type, hasSpecial);
          odds = o; rebate = r;
          if (type === '特肖') { const teMaZodiac = drawZodiacs.length > 0 ? (currentZodiacMap[drawNumbers[6]] || '') : ''; hit = teMaZodiac === k; }
          else if (type === 'pingtexiao') { hit = drawZodiacsSet.has(k); }
          else if (type === 'pingtewei') { hit = drawZodiacs.length > 0 && tokens.some(t => { const d = t.replace('尾', ''); for (let i = 0; i <= 4; i++) { const n = (i * 10 + parseInt(d)).toString().padStart(2, '0'); if (drawNumbersSet.has(n)) return true; } return false; }); }
          else if (type === 'pingma' || type === 'zhong2' || type === 'zhong3') { const zhengma = drawNumbers.slice(0, 6); hit = tokens.every(t => zhengma.includes(t)); }
          else if (type.startsWith('buzhong')) { hit = !tokens.some(t => drawNumbersSet.has(t)); }
          else if (type.startsWith('lianxiao')) { hit = tokens.every(t => drawZodiacsSet.has(t)); }
          else if (type.startsWith('lianwei')) { hit = tokens.every(t => { const d = t.replace('尾', ''); for (let i = 0; i <= 4; i++) { const n = (i * 10 + parseInt(d)).toString().padStart(2, '0'); if (drawNumbersSet.has(n)) return true; } return false; }); }
        }
        let pl = 0;
        if (drawZodiacs.length > 0 || drawNumbers.length > 0) {
          if (type === '特肖') {
            pl = hit ? (v - v * (rebate / 100) - v * odds) : (v - v * (rebate / 100));
          } else {
            pl = hit ? (v - v * (rebate / 100) - v * odds) : (v - v * (rebate / 100));
          }
        }
        cardPL += pl;
        if (hit) totalHitAmount += v;
        html2 += '<tr><td style="text-align:center;">' + displayKey + '</td><td style="text-align:center;">' + v + '</td><td style="text-align:center;">' + (hit ? '<span class="amount-red-text">' + v + '</span>' : '') + '</td><td style="text-align:center;' + (pl > 0 ? 'color:#27ae60;' : (pl < 0 ? 'color:#e74c3c;' : '')) + '">' + (pl !== 0 ? Math.round(pl) : '') + '</td></tr>';
        totalGroups++; totalAmount += v;
      });
      html2 += '</table>';
      return html2;
    }

    if (type === '特肖') {
      if (data.withYear.size > 0) { tablesHtml += '<div style="font-size:11px;color:#333;">── 本命年生肖 ──</div>'; tablesHtml += renderTable(data.withYear, true); }
      if (data.withoutYear.size > 0) { tablesHtml += '<div style="font-size:11px;color:#333;margin-top:4px;">── 普通生肖 ──</div>'; tablesHtml += renderTable(data.withoutYear, false); }
    } else if (type === 'pingtexiao') {
      if (data.withYear.size > 0) { tablesHtml += '<div style="font-size:11px;color:#333;">── 含本年生肖 ──</div>'; tablesHtml += renderTable(data.withYear, true); }
      if (data.withoutYear.size > 0) { tablesHtml += '<div style="font-size:11px;color:#333;margin-top:4px;">── 其他生肖 ──</div>'; tablesHtml += renderTable(data.withoutYear, false); }
    } else if (type === 'pingtewei') {
      if (data.withYear.size > 0) { tablesHtml += '<div style="font-size:11px;color:#333;">── 含0尾 ──</div>'; tablesHtml += renderTable(data.withYear, true); }
      if (data.withoutYear.size > 0) { tablesHtml += '<div style="font-size:11px;color:#333;margin-top:4px;">── 其他尾数 ──</div>'; tablesHtml += renderTable(data.withoutYear, false); }
    } else if (type.startsWith('lianxiao')) {
      if (data.withYear.size > 0) { tablesHtml += '<div style="font-size:11px;color:#333;">── 含本年生肖 ──</div>'; tablesHtml += renderTable(data.withYear, true); }
      if (data.withoutYear.size > 0) { tablesHtml += '<div style="font-size:11px;color:#333;margin-top:4px;">── 不含本年生肖 ──</div>'; tablesHtml += renderTable(data.withoutYear, false); }
    } else if (type.startsWith('lianwei')) {
      if (data.withYear.size > 0) { tablesHtml += '<div style="font-size:11px;color:#333;">── 含0尾 ──</div>'; tablesHtml += renderTable(data.withYear, true); }
      if (data.withoutYear.size > 0) { tablesHtml += '<div style="font-size:11px;color:#333;margin-top:4px;">── 不含0尾 ──</div>'; tablesHtml += renderTable(data.withoutYear, false); }
    } else {
      if (data.withYear.size > 0) { tablesHtml += renderTable(data.withYear, false); }
    }

    grandPL += cardPL;
    const roundedCardPL = Math.round(cardPL);

    let cardBgStyle = '';
    if (drawZodiacs.length > 0 || drawNumbers.length > 0) {
      if (cardPL <= -500) cardBgStyle = 'background:#fff0f0;';
      else if (cardPL < 0) cardBgStyle = 'background:#fff8f8;';
      else if (cardPL > 500) cardBgStyle = 'background:#f0fff0;';
      else if (cardPL > 0) cardBgStyle = 'background:#f8fff8;';
    }

    let cardLabel = isBao ? '包' : (isTePeng ? '特碰' : (type === 'zhong2' ? '二中二' : (type === 'zhong3' ? '三中三' : getComboTypeLabel(type))));
    let cardHtml = '<div class="freq-card" id="' + cardId + '" style="break-inside:avoid; margin-bottom:10px; min-width:180px;' + cardBgStyle + '">';
    cardHtml += '<div class="freq-title" style="display:flex; align-items:center; justify-content:space-between;"><span>' + cardLabel + '</span><button class="btn" style="background:#27ae60;color:#fff;padding:2px 8px;font-size:11px;min-height:auto;border-radius:20px;" onclick="screenshotSingleComboCard(\'' + cardId + '\')">截图</button></div>';

    cardHtml += '<div style="max-height:400px;overflow-y:auto;">' + tablesHtml + '</div>';
    cardHtml += '<div style="border-top:1px solid #ddd;margin-top:4px;padding-top:4px;font-size:11px;text-align:center;">小计：' + totalGroups + '组 金额：' + totalAmount;
    if (drawZodiacs.length > 0 || drawNumbers.length > 0) {
      cardHtml += ' 中：' + totalHitAmount;
      cardHtml += ' 盈亏：<span style="color:' + (roundedCardPL > 0 ? '#27ae60' : (roundedCardPL < 0 ? '#e74c3c' : '')) + ';">' + (roundedCardPL > 0 ? roundedCardPL : (roundedCardPL < 0 ? roundedCardPL : '')) + '</span>';
    }
    cardHtml += '</div></div>';
    cardsArray.push({ html: cardHtml, groups: totalGroups });
  });

  cardsArray.sort((a, b) => a.groups - b.groups);
  container.innerHTML = cardsArray.map(c => c.html).join('') || '<div style="color:#666;text-align:center;padding:10px;">暂无其他订单数据</div>';
  const roundedGrandPL = Math.round(grandPL);
  let totalHtml = '<span style="color:#0000ff;">总下单金额：</span><span style="color:#0000ff;">' + grandTotal + '</span>';
  totalHtml += ' &nbsp; <span style="color:#0000ff;">总订单数：</span><span style="color:#0000ff;">' + orderCountLianxiao + '</span>';
  if (drawZodiacs.length > 0 || drawNumbers.length > 0) {
    totalHtml += ' &nbsp; <span style="color:#0000ff;">总盈亏：</span><span style="color:' + (roundedGrandPL > 0 ? '#27ae60' : (roundedGrandPL < 0 ? '#e74c3c' : '')) + ';">' + (roundedGrandPL > 0 ? roundedGrandPL : (roundedGrandPL < 0 ? roundedGrandPL : '')) + '</span>';
  }
  document.getElementById('lianxiaoStatsTotal').innerHTML = totalHtml;
}

// ===== 兑奖窗口 =====
function showDuiJiangWin() {
  if (document.getElementById('duiJiangWin')) return;
  const fd = document.getElementById('filterDate')?.value || getTodayCST();
  let year = new Date().getFullYear(); const m = fd.match(/^(\d{4})/); if (m) year = parseInt(m[1]);
  const issueNumber = getCurrentIssueNumber(year, fd);
  const issueDisplay = issueNumber ? `${issueNumber}期` : '';
  const storageKey = `comboDrawRecord_${currentRegion}_${year}`;
  let savedData = {}; try { savedData = JSON.parse(localStorage.getItem(storageKey) || '{}'); } catch(e) {}
  const issueId = issueNumber ? issueNumber.toString().padStart(2, '0') : '';
  const savedEntry = savedData[issueId] || {};
  const savedNumbers = savedEntry.numbers || [];
  const isReadOnly = savedNumbers.length > 0;

  function getNumColorClass(num) { if (!num) return ''; const n = num.padStart(2, '0'); if (redNumbers.includes(n)) return 'red-text'; if (blueNumbers.includes(n)) return 'blue-text'; if (greenNumbers.includes(n)) return 'green-text'; return ''; }

  let drawTableHtml = '<div style="text-align:center; margin-bottom:4px;">录开奖：' + issueDisplay + '</div>';
  drawTableHtml += '<table style="margin:0 auto; border-collapse:collapse;"><tr>';
  for (let i = 0; i < 6; i++) { const num = savedNumbers[i] || ''; const cls = getNumColorClass(num); drawTableHtml += `<td class="pt-num-cell"><input type="text" class="draw-number-input-plain ${cls}" id="drawNum${i+1}" value="${num}" ${isReadOnly?'disabled':''} oninput="onDrawInputPlain(${i+1})" maxlength="2"></td>`; }
  drawTableHtml += '<td class="special-tag-cell">特</td>';
  const num7 = savedNumbers[6] || ''; const cls7 = getNumColorClass(num7);
  drawTableHtml += `<td class="pt-num-cell"><input type="text" class="draw-number-input-plain ${cls7}" id="drawNum7" value="${num7}" ${isReadOnly?'disabled':''} oninput="onDrawInputPlain(7)" maxlength="2"></td>`;
  drawTableHtml += '</tr><tr>';
  for (let i = 0; i < 6; i++) { const num = savedNumbers[i] || ''; const zodiac = num ? (currentZodiacMap[num.padStart(2,'0')] || '') : ''; const zCls = getZodiacColorClass(zodiac); drawTableHtml += `<td class="pt-num-cell"><span class="draw-zodiac-plain ${zCls}" id="drawZodiac${i+1}">${zodiac}</span></td>`; }
  drawTableHtml += '<td class="special-tag-cell">码</td>';
  const zodiac7 = num7 ? (currentZodiacMap[num7.padStart(2,'0')] || '') : ''; const zCls7 = getZodiacColorClass(zodiac7);
  drawTableHtml += `<td class="pt-num-cell"><span class="draw-zodiac-plain ${zCls7}" id="drawZodiac7">${zodiac7}</span></td>`;
  drawTableHtml += '</tr></table>';

  const win = document.createElement('div'); win.className = 'floating-window'; win.id = 'duiJiangWin';
  win.style.width = '900px'; win.style.height = '750px'; win.style.left = '50%'; win.style.top = '50%'; win.style.transform = 'translate(-50%, -50%)';
  win.setAttribute('data-orig-width', '900px'); win.setAttribute('data-orig-height', '750px');
  win.innerHTML = `
    <div class="modal-header">🏆 兑奖窗口<div class="window-controls"><button onclick="maximizeWindow('duiJiangWin')">🗖</button><button onclick="document.getElementById('duiJiangWin').remove()">×</button></div></div>
    <div class="modal-body" style="overflow-y:auto; padding:10px;">
      <div class="duijiang-section-title">📋 下单统计 <span id="duiJiangOrderCount" style="font-size:11px;color:#666;margin-left:8px;"></span> <button class="btn" onclick="screenshotDuiJiangTable('duiJiangOrderTable')" style="padding:2px 8px;font-size:11px;min-height:auto;border-radius:20px;background:#27ae60;color:#fff;border:none;cursor:pointer;margin-left:8px;">截图</button></div>
      <div style="overflow-x:auto;"><table class="duijiang-table" id="duiJiangOrderTable"><thead><tr><th>用户</th><th>下单金额</th><th>返水</th><th>中奖详情</th><th>盈亏</th></tr></thead><tbody id="duiJiangOrderBody"><tr><td colspan="5" style="text-align:center;color:#888;">加载中...</td></tr></tbody></table></div>
      <div class="duijiang-section-title">📤 上报统计 <button class="btn" onclick="screenshotDuiJiangTable('duiJiangReportTable')" style="padding:2px 8px;font-size:11px;min-height:auto;border-radius:20px;background:#27ae60;color:#fff;border:none;cursor:pointer;margin-left:8px;">截图</button></div>
      <div style="overflow-x:auto;"><table class="duijiang-table" id="duiJiangReportTable"><thead><tr><th>用户</th><th>上报金额</th><th>返水</th><th>中奖详情</th><th>盈亏</th></tr></thead><tbody id="duiJiangReportBody"><tr><td colspan="5" style="text-align:center;color:#888;">加载中...</td></tr></tbody></table></div>
      <div class="duijiang-section-title">📊 最终合计 <button class="btn" onclick="screenshotDuiJiangTable('duiJiangFinalTable')" style="padding:2px 8px;font-size:11px;min-height:auto;border-radius:20px;background:#27ae60;color:#fff;border:none;cursor:pointer;margin-left:8px;">截图</button></div>
      <div style="overflow-x:auto;"><table class="duijiang-table" id="duiJiangFinalTable"><thead><tr><th>净金额</th><th>净返水</th><th>中奖详情</th><th>净盈亏</th></tr></thead><tbody id="duiJiangFinalBody"><tr><td colspan="4" style="text-align:center;color:#888;">加载中...</td></tr></tbody></table></div>
      <div class="duijiang-section-title">🎰 录开奖</div>
      ${drawTableHtml}
      <div style="display:flex; gap:6px; margin-top:6px; justify-content:center;">
        <button class="btn" style="background:#f39c12;color:#fff;padding:4px 12px;font-size:12px;min-height:28px;" onclick="enableDrawEdit()">修改</button>
        <button class="btn" style="background:#28a745;color:#fff;padding:4px 12px;font-size:12px;min-height:28px;" onclick="saveDuiJiangDraw()">保存兑奖</button>
        <button class="btn" style="background:#8e44ad;color:#fff;padding:4px 12px;font-size:12px;min-height:28px;" onclick="showOddsWin()">赔率</button>
        <button class="btn" style="background:#3498db;color:#fff;padding:4px 12px;font-size:12px;min-height:28px;" onclick="screenshotDuiJiangAll()">截图全部</button>
      </div>
    </div>`;
  document.body.appendChild(win);
  makeWindowDraggable('duiJiangWin'); highestZ += 1; win.style.zIndex = highestZ;
  showFloatingWinOverlay('duiJiangWin');
  setTimeout(() => {
    for (let i = 1; i <= 7; i++) {
      const inp = document.getElementById('drawNum' + i);
      if (inp) {
        inp.addEventListener('keydown', function(e) {
          if (e.key === 'Enter') {
            e.preventDefault();
            if (i < 7) {
              const next = document.getElementById('drawNum' + (i + 1));
              if (next) { next.focus(); next.select(); }
            }
          }
        });
      }
    }
  }, 100);
  refreshDuiJiangStats();
}

// ===== 单注号码显示 =====
let zodiacRankVisible = false;
function toggleZodiacRank() { zodiacRankVisible = !zodiacRankVisible; updateCardA(); showToast(zodiacRankVisible ? '生肖排行已展开' : '生肖排行已收起'); }
let singleBetVisible = false;
function toggleSingleBet() { singleBetVisible = !singleBetVisible; const row = document.getElementById('singleBetRow'); if (row) { if (singleBetVisible) { updateSingleBetDisplay(); } else { row.style.display = 'none'; } } showToast(singleBetVisible ? '单挑已展开' : '单挑已收起'); }

async function updateSingleBetDisplay() {
  const row = document.getElementById('singleBetRow');
  const display = document.getElementById('singleBetDisplay');
  if (!row || !display) return;
  if (!singleBetVisible) { row.style.display = 'none'; return; }

  const orders = await getOrderRecords();
  const fd = document.getElementById('filterDate')?.value || getTodayCST();
  const filteredOrders = orders.filter(r => r.date === fd);
  const singleCount = {};

  filteredOrders.forEach(order => {
    const lines = order.content.split('\n').filter(l => l.trim());
    lines.forEach(l => {
      const newMatch = l.match(/^特码:(.+?)\s+各(?:数|)\s*(\d+)$/);
      if (newMatch) {
        const content = newMatch[1];
        const amt = parseInt(newMatch[2]) || 0;
        if (amt <= 0) return;
        const items = content.split('-').map(i => i.trim()).filter(i => i);
        if (items.length === 1 && /^\d{1,2}$/.test(items[0])) {
          const num = items[0].padStart(2, '0');
          if (parseInt(num) >= 1 && parseInt(num) <= 49) {
            singleCount[num] = (singleCount[num] || 0) + 1;
          }
        }
        return;
      }
      const oldMatch = l.match(/^(\d{2})\s+各(?:数|)\s*(\d+)$/);
      if (oldMatch && parseInt(oldMatch[2]) > 0) {
        singleCount[oldMatch[1]] = (singleCount[oldMatch[1]] || 0) + 1;
      }
    });
  });

  const singleNums = Object.keys(singleCount);
  if (singleNums.length > 0) {
    const sorted = singleNums.sort((a, b) => parseInt(a) - parseInt(b));
    function getNumCls(n) { if (redNumbers.includes(n)) return 'red-text'; if (blueNumbers.includes(n)) return 'blue-text'; if (greenNumbers.includes(n)) return 'green-text'; return ''; }
    display.innerHTML = sorted.map(n => {
      const cnt = singleCount[n];
      return `<span class="${getNumCls(n)}">${n}${cnt >= 2 ? '(' + cnt + '次)' : ''}</span>`;
    }).join(' ');
    row.style.display = '';
  } else {
    display.innerHTML = '<span style="color:#888;">暂无</span>';
    row.style.display = '';
  }
}

function copySingleBetNums() { const display = document.getElementById('singleBetDisplay'); if (!display) return; const spans = display.querySelectorAll('span'); const nums = Array.from(spans).map(s => s.textContent.replace(/\(\d+次\)/, '').trim()).filter(t => /^\d{2}$/.test(t)); if (nums.length === 0) { showToast('暂无号码'); return; } navigator.clipboard.writeText(nums.join('-')).then(() => { showToast('已复制：' + nums.join('-')); }).catch(() => { showToast('复制失败'); }); }

// ===== 卡片A更新 =====
function updateCardA() { const contentEl = document.getElementById('cardAContent'); if (!contentEl) return; let html = ''; const filterInput = document.getElementById('filterInputCardA'); const filterText = filterInput ? filterInput.value.trim() : ''; if (filterText) { const tokens = filterText.split(/\s+/).filter(t => t); let targetNums = new Set(); tokens.forEach(token => { if (/^\d{1,2}$/.test(token)) { const n = token.padStart(2, '0'); if (parseInt(n) >= 1 && parseInt(n) <= 49) targetNums.add(n); } else if (ZODIAC_NUMS[token]) { ZODIAC_NUMS[token].split(/[\s,，]+/).forEach(n => targetNums.add(n.padStart(2, '0'))); } else if (D[token]) { const nums = keyToAllNums(token); nums.forEach(n => targetNums.add(n.padStart(2, '0'))); } }); if (targetNums.size > 0) { const negativeNums = []; for (const num of targetNums) { if (reportRiskData[num] !== undefined && reportRiskData[num] < 0) { negativeNums.push(num); } } if (negativeNums.length > 0) { html += '<div style="margin-bottom:4px;"><b>添加筛选：</b>'; negativeNums.sort((a, b) => parseInt(a) - parseInt(b)); negativeNums.forEach((num, idx) => { const cls = redNumbers.includes(num) ? 'red-text' : (blueNumbers.includes(num) ? 'blue-text' : 'green-text'); html += `<span class="${cls}">${num}</span>`; if (idx < negativeNums.length - 1) html += '-'; }); html += '</div>'; } } } const topNInput = document.getElementById('topNInput'); const nVal = topNInput ? parseInt(topNInput.value) : NaN; if (!isNaN(nVal) && nVal > 0) { const entries = Object.entries(numberAmountCount).map(([num, cnt]) => ({ num, cnt: cnt || 0 })); for (let i = 1; i <= 49; i++) { const n = i.toString().padStart(2, '0'); if (!numberAmountCount[n]) entries.push({ num: n, cnt: 0 }); } const sortedDesc = [...entries].sort((a, b) => b.cnt - a.cnt || parseInt(a.num) - parseInt(b.num)); const idxDesc = Math.min(nVal - 1, sortedDesc.length - 1); const cutoffDesc = sortedDesc[idxDesc]?.cnt ?? 0; const activeNums = sortedDesc.filter(e => e.cnt >= cutoffDesc && e.cnt > 0); activeNums.sort((a, b) => b.cnt - a.cnt || parseInt(a.num) - parseInt(b.num)); const sortedAsc = [...entries].sort((a, b) => a.cnt - b.cnt || parseInt(a.num) - parseInt(b.num)); const idxAsc = Math.min(nVal - 1, sortedAsc.length - 1); const cutoffAsc = sortedAsc[idxAsc]?.cnt ?? 0; let inactiveNums = sortedAsc.filter(e => e.cnt <= cutoffAsc); inactiveNums.sort((a, b) => b.cnt - a.cnt || parseInt(a.num) - parseInt(b.num)); if (activeNums.length > 0) { html += '<div style="margin-bottom:4px;"><b>活跃次数：</b>'; activeNums.forEach((e, idx) => { const cls = redNumbers.includes(e.num) ? 'red-text' : (blueNumbers.includes(e.num) ? 'blue-text' : 'green-text'); html += `<span class="${cls}">${e.num}</span>`; if (idx < activeNums.length - 1) html += '-'; }); html += '</div>'; } if (inactiveNums.length > 0) { html += '<div style="margin-bottom:4px;"><b>不活跃次数：</b>'; inactiveNums.forEach((e, idx) => { const cls = redNumbers.includes(e.num) ? 'red-text' : (blueNumbers.includes(e.num) ? 'blue-text' : 'green-text'); html += `<span class="${cls}">${e.num}</span>`; if (idx < inactiveNums.length - 1) html += '-'; }); html += '</div>'; } } if (zodiacRankVisible) { const zodiacOrderFixed = ['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪']; const zcm = {'鼠':'red-text','兔':'red-text','马':'red-text','鸡':'red-text','虎':'blue-text','蛇':'blue-text','猴':'blue-text','猪':'blue-text','牛':'green-text','龙':'green-text','羊':'green-text','狗':'green-text'}; const zCountEntries = zodiacOrderFixed.map(z => ({ zodiac: z, cnt: zodiacAmountCount[z] || 0 })); zCountEntries.sort((a, b) => b.cnt - a.cnt); html += '<div style="margin-bottom:4px;"><b>生肖活跃：</b>'; zCountEntries.forEach((e, idx) => { html += `<span class="${zcm[e.zodiac] || ''}">${e.zodiac}</span>`; if (idx < zCountEntries.length - 1) html += '、'; }); html += '</div>'; const zAmtEntries = zodiacOrderFixed.map(z => ({ zodiac: z, amt: zodiacFilteredAmount[z] || 0 })); zAmtEntries.sort((a, b) => b.amt - a.amt); html += '<div style="margin-bottom:4px;"><b>金额排行：</b>'; zAmtEntries.forEach((e, idx) => { html += `<span class="${zcm[e.zodiac] || ''}">${e.zodiac}</span>`; if (idx < zAmtEntries.length - 1) html += '、'; }); html += '</div>'; } contentEl.innerHTML = html; if (singleBetVisible) updateSingleBetDisplay(); }

function copyCardANumbers(type) { const contentEl = document.getElementById('cardAContent'); if (!contentEl) return; const lines = []; let currentLine = []; Array.from(contentEl.childNodes).forEach(node => { if (node.nodeName === 'SPAN') { currentLine.push(node); } else if (node.nodeName === 'BR') { if (currentLine.length > 0) { lines.push(currentLine); currentLine = []; } } else if (node.nodeName === 'DIV') { Array.from(node.childNodes).forEach(child => { if (child.nodeName === 'SPAN') { currentLine.push(child); } else if (child.nodeName === 'BR') { if (currentLine.length > 0) { lines.push(currentLine); currentLine = []; } } }); if (currentLine.length > 0) { lines.push(currentLine); currentLine = []; } } }); if (currentLine.length > 0) lines.push(currentLine); const filterText = document.getElementById('filterInputCardA')?.value.trim(); const topNVal = parseInt(document.getElementById('topNInput')?.value); let targetLineIndex = -1; let lineIdx = 0; if (filterText) { if (type === 'risk') targetLineIndex = lineIdx; lineIdx++; } if (!isNaN(topNVal) && topNVal > 0) { if (type === 'active') targetLineIndex = lineIdx; lineIdx++; if (type === 'inactive') targetLineIndex = lineIdx; lineIdx++; } if (targetLineIndex < 0 || targetLineIndex >= lines.length) { showToast('对应行暂无数据'); return; } const targetNodes = lines[targetLineIndex]; const items = targetNodes.map(span => span.textContent.trim()).filter(t => t && /^\d{2}$/.test(t)); if (items.length === 0) { showToast('没有可复制的项目'); return; } const text = items.join('-'); navigator.clipboard.writeText(text).then(() => { showToast('已复制: ' + text); }).catch(() => { showToast('复制失败'); }); }
function enableRowDragSelect(tableId) { const tbody = document.getElementById(tableId === 'riskTable' ? 'tableBody' : 'reportTableBody'); if (!tbody) return; let startRow = null; let endRow = null; function clearSelection() { tbody.querySelectorAll('tr.selected-row').forEach(tr => tr.classList.remove('selected-row')); } function selectRows(row1, row2) { if (!row1 || !row2) return; const rows = Array.from(tbody.querySelectorAll('tr')); const idx1 = rows.indexOf(row1); const idx2 = rows.indexOf(row2); if (idx1 === -1 || idx2 === -1) return; const minIdx = Math.min(idx1, idx2); const maxIdx = Math.max(idx1, idx2); for (let i = minIdx; i <= maxIdx; i++) { rows[i].classList.add('selected-row'); } } tbody.addEventListener('mousedown', (e) => { if (e.button !== 0) return; if (e.ctrlKey || e.shiftKey) return; const targetRow = e.target.closest('tr'); if (!targetRow) return; window.dragSelectionActive = true; clearSelection(); startRow = targetRow; endRow = targetRow; targetRow.classList.add('selected-row'); e.preventDefault(); }); document.addEventListener('mousemove', (e) => { if (!window.dragSelectionActive) return; const target = document.elementFromPoint(e.clientX, e.clientY); if (!target) return; const tr = target.closest('tr'); if (!tr || tr.parentElement !== tbody) return; if (tr !== endRow) { endRow = tr; clearSelection(); selectRows(startRow, endRow); } }); document.addEventListener('mouseup', () => { if (window.dragSelectionActive) { window.dragSelectionActive = false; startRow = null; endRow = null; } }); let longPressTimer = null; let longPressTriggered = false; let touchStartY = 0; let touchStartX = 0; tbody.addEventListener('touchstart', (e) => { const targetRow = e.target.closest('tr'); if (!targetRow) return; longPressTriggered = false; touchStartY = e.touches[0].clientY; touchStartX = e.touches[0].clientX; if (longPressTimer) clearTimeout(longPressTimer); longPressTimer = setTimeout(() => { longPressTriggered = true; window.dragSelectionActive = true; clearSelection(); startRow = targetRow; endRow = targetRow; targetRow.classList.add('selected-row'); }, 1000); }, { passive: true }); tbody.addEventListener('touchmove', (e) => { if (!longPressTriggered) { const dy = Math.abs(e.touches[0].clientY - touchStartY); const dx = Math.abs(e.touches[0].clientX - touchStartX); if (dy > 10 || dx > 10) { if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null; } } return; } if (!window.dragSelectionActive) return; e.preventDefault(); const touch = e.touches[0]; const target = document.elementFromPoint(touch.clientX, touch.clientY); if (!target) return; const tr = target.closest('tr'); if (!tr || tr.parentElement !== tbody) return; if (tr !== endRow) { endRow = tr; clearSelection(); selectRows(startRow, endRow); } }, { passive: false }); tbody.addEventListener('touchend', () => { if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null; } if (window.dragSelectionActive) { window.dragSelectionActive = false; startRow = null; endRow = null; } longPressTriggered = false; }); }
function copySelectedNumbers(tableId) { const tbody = document.getElementById(tableId === 'riskTable' ? 'tableBody' : 'reportTableBody'); if (!tbody) return; const selectedRows = Array.from(tbody.querySelectorAll('tr.selected-row')); if (selectedRows.length === 0) { showToast('请先选择号码'); return; } const ids = selectedRows.map(row => { const cells = row.querySelectorAll('td'); return cells[3] ? cells[3].textContent.trim() : ''; }).filter(id => id && /^\d+$/.test(id)); if (ids.length === 0) { showToast('无有效号码'); return; } const uniqueIds = [...new Set(ids)]; const text = uniqueIds.join('-') + '各号'; navigator.clipboard.writeText(text).then(() => { showToast('已复制: ' + text); }).catch(() => { showToast('复制失败'); }); }

// ===== 解析超额文本（currentParseMethod 定义在 parser.js 中，事件绑定在 main.js 中） =====
function parseExcessText(text, method) { const lines = text.trim().split('\n').filter(l => l.trim()); const items = []; for (const line of lines) { const match = line.match(/(\d{2})各(\d+)米/); if (match) { items.push({ num: match[1], amount: parseInt(match[2]) }); } } if (items.length === 0) return ''; items.sort((a, b) => b.amount - a.amount); const parseItems = (method) => { const data = items.map(item => ({ ...item })); const result = []; if (method === 0) { while (data.some(d => d.amount > 0)) { const maxAmount = Math.max(...data.map(d => d.amount)); if (maxAmount <= 0) break; const group = []; for (const d of data) { if (d.amount > 0 && (maxAmount - d.amount) <= maxAmount * 0.4) { group.push(d.num); } } const groupAmount = Math.min(...group.map(n => data.find(d => d.num === n).amount)); for (const n of group) { const d = data.find(d => d.num === n); d.amount -= groupAmount; } result.push(`${group.join('-')}各数${groupAmount}`); } } else if (method === 1) { while (data.some(d => d.amount > 0)) { let bestAmount = 0; let bestCount = 0; for (let i = 0; i < data.length; i++) { const candidate = data[i].amount; if (candidate <= 0) continue; let count = 0; for (const d of data) { if (d.amount >= candidate) count++; } if (count > bestCount || (count === bestCount && candidate < bestAmount)) { bestCount = count; bestAmount = candidate; } } if (bestCount === 0) break; const group = []; for (const d of data) { if (d.amount >= bestAmount) { group.push(d.num); d.amount -= bestAmount; } } result.push(`${group.join('-')}各数${bestAmount}`); } } else if (method === 2) { const levels = [50, 10, 5, 2, 1]; for (const lv of levels) { let again = true; while (again) { again = false; const group = []; for (const d of data) { if (d.amount >= lv) { group.push(d.num); d.amount -= lv; again = true; } } if (group.length > 0) { result.push(`${group.join('-')}各数${lv}`); } } } } else if (method === 3) { for (let lv = 100; lv >= 1; lv--) { let again = true; while (again) { again = false; const group = []; for (const d of data) { if (d.amount >= lv) { group.push(d.num); d.amount -= lv; again = true; } } if (group.length > 0) { result.push(`${group.join('-')}各数${lv}`); } } } } else if (method === 4) { const levels = []; for (let lv = 100; lv >= 5; lv -= 5) levels.push(lv); levels.push(3, 2, 1); for (const lv of levels) { let again = true; while (again) { again = false; const group = []; for (const d of data) { if (d.amount >= lv) { group.push(d.num); d.amount -= lv; again = true; } } if (group.length > 0) { result.push(`${group.join('-')}各数${lv}`); } } } } return result.join('\n'); }; return parseItems(method); }
function switchParseMethod() { const text = document.getElementById('reportCapInfo').innerText; if (!text || text === '无超出的号码') { showToast('当前没有超额文本'); document.getElementById('parseResultArea').innerText = ''; return; } const result = parseExcessText(text, currentParseMethod); document.getElementById('parseResultArea').innerText = result; const methodNames = ['聚类分组', '贪心合并', '固定50→10→5→2→1', '100递减', '固定100→...→1']; showToast(`当前方案：${methodNames[currentParseMethod]}`); currentParseMethod = (currentParseMethod + 1) % 5; localStorage.setItem('savedParseMethod', currentParseMethod); }
function copyOrderGroup() { const text = document.getElementById('parseResultArea').innerText; if (!text) { showToast('没有解析结果'); return; } navigator.clipboard.writeText(text).then(() => showToast('订单组已复制')); }

// ===== 回收站窗口 =====
async function showRecycleBin() { const existingWin = document.getElementById('recycleWin'); if (existingWin) existingWin.remove(); const allRecords = await getRecycleBinRecords(); const records = allRecords.filter(r => r.region === currentRegion); const win = document.createElement('div'); win.className = 'floating-window'; win.id = 'recycleWin'; win.style.width = '750px'; win.style.height = '550px'; win.style.left = '50%'; win.style.top = '50%'; win.style.transform = 'translate(-50%, -50%)'; let html = `<div class="modal-header"><h3>🗑️ 回收站</h3><div class="window-controls"><button onclick="maximizeWindow('recycleWin')">🗖</button><button onclick="document.getElementById('recycleWin').remove()">×</button></div></div>`; html += `<div class="modal-body" style="display:flex; flex-direction:column; height: calc(100% - 120px);">`; html += `<div style="margin-bottom:10px;display:flex;gap:12px;flex-wrap:wrap;align-items:center;position:sticky;top:0;background:rgba(255,255,255,0.9);z-index:2;padding:5px 0;"><button onclick="checkAllRecycle()" style="padding:6px 12px;background:#007bff;color:#fff;border:none;border-radius:4px;">全选</button><button onclick="uncheckAllRecycle()" style="padding:6px 12px;background:#6c757d;color:#fff;border:none;border-radius:4px;">取消全选</button><button onclick="restoreCheckedRecycle()" style="padding:6px 12px;background:#27ae60;color:#fff;border:none;border-radius:4px;">恢复选中</button><button onclick="deleteCheckedRecycle()" style="padding:6px 12px;background:#e74c3c;color:#fff;border:none;border-radius:4px;">彻底删除</button><button onclick="emptyRecycleBin()" style="padding:6px 12px;background:#8e44ad;color:#fff;border:none;border-radius:4px;margin-left:auto;">清空回收站</button></div>`; html += `<div id="recycleListContainer" style="flex:1; overflow-y:auto;">`; if (records.length === 0) { html += `<div style="padding:20px;text-align:center;color:#666;">回收站为空</div>`; } else { records.sort((a,b) => new Date(b.deletedAt) - new Date(a.deletedAt)); records.forEach(rec => { const ts = formatTimestampToCST(rec.deletedAt); const typeLabel = rec.type === 'order' ? '下单' : (rec.type === 'report' ? '上报' : '连肖'); const typeColor = rec.type === 'order' ? '#3498db' : (rec.type === 'report' ? '#e67e22' : '#8e44ad'); html += `<div class="order-item"><input type="checkbox" class="recycle-check" data-id="${rec.id}"><div class="order-content">${rec.content.replace(/\n/g,'<br>')}</div><div class="order-info"><span class="order-total" style="color:#000;">合计：${rec.totalAmount || 0}</span><span class="order-meta"><span style="color:${typeColor};">类型：${typeLabel}</span><span style="color:#e74c3c;">删除：${ts}</span><span>用户：${rec.user || '未知'}</span></span></div><button class="order-del" onclick="restoreRecycleRecord('${rec.id}')" style="background:#27ae60;margin-right:4px;">恢复</button><button class="order-del" onclick="permanentlyDeleteRecycleRecord('${rec.id}')">删除</button></div>`; }); } html += `</div></div><div class="modal-footer" style="justify-content:space-between;"><span style="font-size:12px;color:#666;" id="recycleStorageInfo"></span><button onclick="document.getElementById('recycleWin').remove()" style="padding:8px 16px;background:#6c757d;color:#fff;border:none;border-radius:4px;">关闭</button></div>`; win.innerHTML = html; document.body.appendChild(win); updateRecycleStorageInfo(); makeWindowDraggable('recycleWin'); highestZ += 1; win.style.zIndex = highestZ; showFloatingWinOverlay('recycleWin'); updateRecycleCount(); }
function updateRecycleStorageInfo() { const span = document.getElementById('recycleStorageInfo'); if (!span) return; getRecycleBinRecords().then(allRecords => { const records = allRecords.filter(r => r.region === currentRegion); let bytes = 0; records.forEach(r => bytes += JSON.stringify(r).length * 2); const usedMB = (bytes / (1024*1024)).toFixed(2); span.textContent = `回收站占用：${usedMB} MB（共${records.length}条记录）`; }); }
async function updateRecycleCount() { const span = document.getElementById('recycleCount'); if (!span) return; try { const allRecords = await getRecycleBinRecords(); const count = allRecords.filter(r => r.region === currentRegion).length; if (count > 0) { span.textContent = count; span.style.display = 'inline-block'; } else { span.style.display = 'none'; } } catch(e) { span.style.display = 'none'; } }
function checkAllRecycle() { document.querySelectorAll('.recycle-check').forEach(cb => cb.checked = true); }
function uncheckAllRecycle() { document.querySelectorAll('.recycle-check').forEach(cb => cb.checked = false); }

async function refreshRecycleList() { const container = document.getElementById('recycleListContainer'); if (!container) return; const allRecords = await getRecycleBinRecords(); const records = allRecords.filter(r => r.region === currentRegion); if (records.length === 0) { container.innerHTML = '<div style="padding:20px;text-align:center;color:#666;">回收站为空</div>'; } else { records.sort((a,b) => new Date(b.deletedAt) - new Date(a.deletedAt)); container.innerHTML = records.map(rec => { const ts = formatTimestampToCST(rec.deletedAt); const typeLabel = rec.type === 'order' ? '下单' : (rec.type === 'report' ? '上报' : '连肖'); const typeColor = rec.type === 'order' ? '#3498db' : (rec.type === 'report' ? '#e67e22' : '#8e44ad'); return `<div class="order-item"><input type="checkbox" class="recycle-check" data-id="${rec.id}"><div class="order-content">${rec.content.replace(/\n/g,'<br>')}</div><div class="order-info"><span class="order-total" style="color:#000;">合计：${rec.totalAmount || 0}</span><span class="order-meta"><span style="color:${typeColor};">类型：${typeLabel}</span><span style="color:#e74c3c;">删除：${ts}</span><span>用户：${rec.user || '未知'}</span></span></div><button class="order-del" onclick="restoreRecycleRecord('${rec.id}')" style="background:#27ae60;margin-right:4px;">恢复</button><button class="order-del" onclick="permanentlyDeleteRecycleRecord('${rec.id}')">删除</button></div>`; }).join(''); } updateRecycleStorageInfo(); updateRecycleCount(); }

async function restoreRecycleRecord(id) { if (!(await confirm('确定恢复该记录吗？'))) return; try { const records = await getRecycleBinRecords(); const record = records.find(r => r.id === id); if (!record) { showToast('记录不存在'); return; } if (record.type === 'order') { await saveOrderRecordToIDB(record.content, record.user, record.date, record.totalAmount || 0, record.timestamp, record.region); } else if (record.type === 'report') { await saveReportOrderRecordToIDB(record.content, record.user, record.date, record.totalAmount || 0, record.timestamp, record.region); } else if (record.type === 'combo') { await saveComboOrderRecordToIDB(record.content, record.user, record.date, record.totalAmount || 0, 'combo', record.timestamp); } await deleteFromRecycleBin(id); addOperationLog('restore', record.content, record.region, record.user, record.totalAmount || 0); clearStatsCache(); await updateTableFromRecords(); calculateStorageUsage(); refreshRecycleList(); showToast('已恢复'); } catch(e) { showToast('恢复失败'); } }
async function permanentlyDeleteRecycleRecord(id) { if (!(await confirm('确定彻底删除吗？此操作不可恢复！'))) return; const record = await new Promise((resolve) => { const tx = db.transaction([RECYCLE_STORE_NAME], 'readonly'); const store = tx.objectStore(RECYCLE_STORE_NAME); const req = store.get(id); req.onsuccess = () => resolve(req.result); req.onerror = () => resolve(null); }); await deleteFromRecycleBin(id); if (record) { addOperationLog('permanent_delete', record.content, record.region, record.user, record.totalAmount || 0); } else { addOperationLog('permanent_delete', '记录详情未知'); } clearStatsCache(); await updateTableFromRecords(); calculateStorageUsage(); refreshRecycleList(); showToast('已彻底删除'); }
async function restoreCheckedRecycle() { const ids = []; document.querySelectorAll('.recycle-check:checked').forEach(cb => ids.push(String(cb.dataset.id))); if (ids.length === 0) { showToast('请选择'); return; } if (!(await confirm(`确定恢复选中的 ${ids.length} 条记录吗？`))) return; const records = await getRecycleBinRecords(); let count = 0; for (const id of ids) { const record = records.find(r => r.id === id); if (!record) continue; if (record.type === 'order') { await saveOrderRecordToIDB(record.content, record.user, record.date, record.totalAmount || 0, record.timestamp, record.region); } else if (record.type === 'report') { await saveReportOrderRecordToIDB(record.content, record.user, record.date, record.totalAmount || 0, record.timestamp, record.region); } else if (record.type === 'combo') { await saveComboOrderRecordToIDB(record.content, record.user, record.date, record.totalAmount || 0, 'combo', record.timestamp); } addOperationLog('restore', record.content, record.region, record.user, record.totalAmount || 0); await deleteFromRecycleBin(id); count++; } clearStatsCache(); await updateTableFromRecords(); calculateStorageUsage(); refreshRecycleList(); showToast(`已恢复 ${count} 条`); }
async function deleteCheckedRecycle() { const ids = []; document.querySelectorAll('.recycle-check:checked').forEach(cb => ids.push(String(cb.dataset.id))); if (ids.length === 0) { showToast('请选择'); return; } if (!(await confirm(`确定彻底删除选中的 ${ids.length} 条记录吗？此操作不可恢复！`))) return; const records = await getRecycleBinRecords(); for (const id of ids) { const record = records.find(r => r.id === id); if (record) { addOperationLog('permanent_delete', record.content, record.region, record.user, record.totalAmount || 0); } } await batchDeleteFromRecycleBin(ids); clearStatsCache(); await updateTableFromRecords(); calculateStorageUsage(); refreshRecycleList(); showToast(`已彻底删除 ${ids.length} 条`); }
async function emptyRecycleBin() { if (!(await confirm('确定清空整个回收站吗？此操作不可恢复！'))) return; const pwd = await prompt("输入清空密码：",""); if (pwd !== PASSWORD) { await alert("密码错误"); return; } await clearRecycleBin(currentRegion); addOperationLog('reset', '清空回收站'); clearStatsCache(); await updateTableFromRecords(); calculateStorageUsage(); refreshRecycleList(); showToast('回收站已清空'); }
async function autoCleanRecycleBin() { try { const records = await getRecycleBinRecords(); const now = Date.now(); const expireMs = RECYCLE_RETENTION_DAYS * 24 * 60 * 60 * 1000; for (const record of records) { const deletedTime = new Date(record.deletedAt).getTime(); if (now - deletedTime > expireMs) { await deleteFromRecycleBin(record.id); } } updateRecycleCount(); } catch(e) {} }

function formatDateMD(dateStr) { const d = new Date(dateStr + 'T00:00:00'); return `${d.getMonth()+1}/${d.getDate()}`; }

(function() { const originalApplyPrizeFilter = applyPrizeFilter; applyPrizeFilter = async function() { await originalApplyPrizeFilter.apply(this, arguments); const input = document.getElementById('prizeNumberInput'); if (!input) return; let val = input.value.trim(); if (val === '') { input.className = ''; return; } if (/^\d$/.test(val)) val = '0' + val; if (/^\d{2}$/.test(val) && parseInt(val) >= 1 && parseInt(val) <= 49) { const cls = redNumbers.includes(val) ? 'red-text' : (blueNumbers.includes(val) ? 'blue-text' : 'green-text'); input.className = cls; } else { input.className = ''; } }; })();

function getZodiacColorClass(zodiac) { if (!zodiac) return ''; const redSet = new Set(['鼠','兔','马','鸡']); const blueSet = new Set(['虎','蛇','猴','猪']); const greenSet = new Set(['牛','龙','羊','狗']); if (redSet.has(zodiac)) return 'red-text'; if (blueSet.has(zodiac)) return 'blue-text'; if (greenSet.has(zodiac)) return 'green-text'; return ''; }
function getNumberColorClass(num) { if (redNumbers.includes(num)) return 'red-text'; if (blueNumbers.includes(num)) return 'blue-text'; if (greenNumbers.includes(num)) return 'green-text'; return ''; }

async function showDrawRecord() { const old = document.getElementById('drawRecordWin'); if (old) old.remove(); let year = new Date().getFullYear(); const fd = document.getElementById('filterDate')?.value; if (fd) { const m = fd.match(/^(\d{4})/); if (m) year = parseInt(m[1]); } const startDate = new Date(year, 0, 1); const endDate = new Date(year, 11, 31); if (isNaN(startDate) || isNaN(endDate)) { showToast('日期无效'); return; } const rows = []; let issue = 1; const cur = new Date(startDate); while (cur <= endDate) { rows.push({ date: formatDateMD(cur.toISOString().slice(0,10)), issue: issue.toString().padStart(2, '0'), fullDate: cur.toISOString().slice(0,10) }); cur.setDate(cur.getDate() + 1); issue++; } const totalIssues = issue - 1; const groups = Math.ceil(totalIssues / 100); const storageKey = `drawRecord_${currentRegion}_${year}`; let savedData = {}; try { savedData = JSON.parse(localStorage.getItem(storageKey) || '{}'); } catch (e) {} const monthlyPL = new Array(12).fill(0); for (const iid in savedData) { const entry = savedData[iid]; if (entry && entry.number && entry.number.trim() && entry.pl !== undefined && entry.pl !== '') { const num = entry.number.trim().padStart(2, '0'); if (/^\d{2}$/.test(num) && parseInt(num) >= 1 && parseInt(num) <= 49) { const issueNum = parseInt(iid); const issueDate = new Date(year, 0, issueNum); const month = issueDate.getMonth(); const plVal = parseFloat(entry.pl); if (!isNaN(plVal)) monthlyPL[month] += plVal; } } } let totalPLSum = 0; for (let m = 0; m < 12; m++) totalPLSum += monthlyPL[m]; let monthlyInnerHtml = '<table class="monthly-summary-table" style="width:100%;margin:0;border:none;"><tbody>'; for (let m = 0; m < 12; m++) { const val = monthlyPL[m]; let valText = ''; if (val > 0) valText = `<span style="color:#27ae60;font-weight:bold;">+${val}</span>`; else if (val < 0) valText = `<span style="color:#e74c3c;font-weight:bold;">${val}</span>`; monthlyInnerHtml += `<tr><td style="text-align:left;padding:1px 4px;border:none;font-size:11px;color:#0000ff;">${m+1}月</td><td style="text-align:right;padding:1px 4px;border:none;font-size:11px;">${valText}</td></tr>`; } let totalText = ''; if (totalPLSum > 0) totalText = `<span style="color:#27ae60;font-weight:bold;">+${totalPLSum}</span>`; else if (totalPLSum < 0) totalText = `<span style="color:#e74c3c;font-weight:bold;">${totalPLSum}</span>`; monthlyInnerHtml += `<tr style="border-top:2px solid #333;"><td style="text-align:left;padding:1px 4px;border:none;font-size:11px;color:#0000ff;">总盈亏</td><td style="text-align:right;padding:1px 4px;border:none;font-size:11px;">${totalText}</td></tr>`; monthlyInnerHtml += '</tbody></table>'; let tableHtml = '<div class="draw-table-wrap"><table class="draw-table"><thead><tr>'; for (let g = 0; g < groups; g++) { tableHtml += '<th>期号</th><th>号码</th><th>生肖</th><th>盈亏</th>'; } tableHtml += '</tr></thead><tbody>'; const monthlyRowsNeeded = 13; const startRow = 87; for (let r = 0; r < 100; r++) { tableHtml += '<tr>'; for (let g = 0; g < groups; g++) { const idx = g * 100 + r; if (g === 3 && r >= startRow && r < startRow + monthlyRowsNeeded) { if (r === startRow) { tableHtml += `<td colspan="4" rowspan="${monthlyRowsNeeded}" style="vertical-align:top;padding:2px;">${monthlyInnerHtml}</td>`; } } else if (g === 3 && r >= startRow + monthlyRowsNeeded) { tableHtml += '<td></td><td></td><td></td><td></td>'; } else if (idx < rows.length) { const row = rows[idx]; const iid = row.issue; const savedEntry = savedData[iid] || {}; const savedNumber = savedEntry.number || ''; const savedPL = savedEntry.pl || ''; const isReadOnly = !!savedNumber; tableHtml += `<td>${iid}期</td>`; const numVal = savedNumber ? savedNumber.padStart(2, '0') : ''; const numColorClass = savedNumber ? getNumberColorClass(numVal) : ''; const inputDisabled = isReadOnly ? 'disabled' : ''; tableHtml += `<td><input type="text" class="draw-number-input draw-num-${iid} ${numColorClass}" value="${savedNumber}" ${inputDisabled} oninput="onDrawNumberInput(this, '${iid}')" maxlength="2"></td>`; const zodiac = savedNumber ? (currentZodiacMap[numVal] || '') : ''; const zColorClass = getZodiacColorClass(zodiac); tableHtml += `<td><span class="draw-zodiac-${iid} ${zColorClass}">${zodiac}</span></td>`; let plColorClass = ''; if (savedPL !== '') { const plVal = parseFloat(savedPL); if (!isNaN(plVal)) { if (plVal > 0) plColorClass = ' green-text'; else if (plVal < 0) plColorClass = ' red-text'; } } tableHtml += `<td><input type="text" class="draw-pl-input draw-pl-${iid}${plColorClass}" value="${savedPL}" ${inputDisabled} oninput="updatePlColor(this)" maxlength="7"></td>`; } else { tableHtml += '<td></td><td></td><td></td><td></td>'; } } tableHtml += '</tr>'; } tableHtml += '</tbody></table></div>'; const win = document.createElement('div'); win.className = 'floating-window'; win.id = 'drawRecordWin'; win.style.width = Math.min(groups * 170 + 40, window.innerWidth - 20) + 'px'; win.style.height = '650px'; win.style.left = '50%'; win.style.top = '50%'; win.style.transform = 'translate(-50%, -50%)'; const savedCount = localStorage.getItem(`recentDrawCount_${currentRegion}`) || ''; const regionLabel = currentRegion === 'macau' ? '澳门' : currentRegion === 'hongkong' ? '香港' : '粤港'; win.innerHTML = `<div class="modal-header"><h3>开奖记录（${regionLabel} ${year}年阳历）</h3><div class="window-controls"><button onclick="maximizeWindow('drawRecordWin')">🗖</button><button onclick="document.getElementById('drawRecordWin').remove()">×</button></div></div><div class="modal-body" style="display:flex; flex-direction:column; gap:10px;"><div class="card" style="flex:1; display:flex; flex-direction:column;"><div class="card-title" style="display:flex; align-items:center; gap:8px;"><span>开奖号码记录</span><input type="number" id="recentDrawCountInput" placeholder="留空不显示" value="${savedCount}" style="width:60px;padding:2px 4px;border:1px solid #ccc;border-radius:4px;font-size:13px;"><button class="btn btn-primary" onclick="saveRecentDrawCount()" style="padding:4px 12px;font-size:12px;min-height:28px;">保存</button></div><div style="overflow:auto; flex:1;">${tableHtml}</div></div><div style="display:flex; gap:10px; justify-content:center; padding:10px;"><button class="btn btn-primary" onclick="editDrawRecord()">修改</button><button class="btn btn-save-order" onclick="saveDrawRecord(${year})">保存</button><button class="btn btn-danger" onclick="clearAllDrawRecords(${year})" style="background:#e74c3c;color:#fff;">清空全部</button></div></div>`; document.body.appendChild(win); makeWindowDraggable('drawRecordWin'); highestZ += 1; win.style.zIndex = highestZ; showFloatingWinOverlay('drawRecordWin'); updateRecentDrawTexts(); setTimeout(() => { const allNumInputs = win.querySelectorAll('.draw-number-input'); const allPlInputs = win.querySelectorAll('.draw-pl-input'); const allInputs = [...allNumInputs, ...allPlInputs].sort((a, b) => { const trA = a.closest('tr'); const trB = b.closest('tr'); const rows = [...win.querySelectorAll('.draw-table tbody tr')]; if (trA !== trB) return rows.indexOf(trA) - rows.indexOf(trB); const tdsA = [...trA.querySelectorAll('td')]; const tdsB = [...trB.querySelectorAll('td')]; const tdA = a.closest('td'); const tdB = b.closest('td'); return tdsA.indexOf(tdA) - tdsB.indexOf(tdB); }); const enabledInputs = allInputs.filter(inp => !inp.disabled); enabledInputs.forEach((inp, i) => { inp.addEventListener('keydown', function(e) { if (e.key === 'Enter') { e.preventDefault(); const nextIdx = i + 1; if (nextIdx < enabledInputs.length) { const next = enabledInputs[nextIdx]; next.focus(); next.select(); } } }); }); }, 200); }
function updatePlColor(input) { const match = input.className.match(/draw-pl-(\d+)/); const issueClass = match ? match[0] : ''; const val = input.value.trim(); let colorClass = ''; if (val !== '' && val !== '-') { const num = parseFloat(val); if (!isNaN(num)) { if (num > 0) colorClass = ' green-text'; else if (num < 0) colorClass = ' red-text'; } } input.className = 'draw-pl-input' + (issueClass ? ' ' + issueClass : '') + colorClass; }
async function clearAllDrawRecords(year) { if (!(await confirm(`确定清空${currentRegion === 'macau' ? '澳门' : currentRegion === 'hongkong' ? '香港' : '粤港'} ${year}年全部开奖号码吗？此操作不可恢复！`))) return; const storageKey = `drawRecord_${currentRegion}_${year}`; localStorage.removeItem(storageKey); showToast('已清空'); showDrawRecord(); updateRecentDrawTexts(); renderSmartDecision(); }
function onDrawNumberInput(input, issueId) { let val = input.value.replace(/\D/g, ''); if (val.length > 2) val = val.slice(0, 2); input.value = val; const zodiacSpan = document.querySelector(`.draw-zodiac-${issueId}`); if (!zodiacSpan) return; if (val.length === 2) { const num = val.padStart(2, '0'); const intVal = parseInt(num); if (intVal >= 1 && intVal <= 49) { const zodiac = currentZodiacMap[num] || ''; zodiacSpan.textContent = zodiac; zodiacSpan.className = `draw-zodiac-${issueId} ${getZodiacColorClass(zodiac)}`; input.className = `draw-number-input draw-num-${issueId} ${getNumberColorClass(num)}`; return; } } zodiacSpan.textContent = ''; zodiacSpan.className = `draw-zodiac-${issueId}`; input.className = `draw-number-input draw-num-${issueId}`; }
function editDrawRecord() { document.querySelectorAll('.draw-number-input').forEach(el => el.disabled = false); document.querySelectorAll('.draw-pl-input').forEach(el => el.disabled = false); showToast('已进入编辑模式'); }
async function saveDrawRecord(year) { const data = {}; const plInputs = document.querySelectorAll('.draw-pl-input'); plInputs.forEach(input => { const issueId = input.className.match(/draw-pl-(\d+)/)?.[1]; if (issueId) { data[issueId] = { number: '', pl: input.value.trim() }; } }); const numberInputs = document.querySelectorAll('.draw-number-input'); numberInputs.forEach(input => { const issueId = input.className.match(/draw-num-(\d+)/)?.[1]; if (issueId) { let num = input.value.trim(); if (/^\d$/.test(num)) num = '0' + num; if (!/^\d{2}$/.test(num) || parseInt(num) < 1 || parseInt(num) > 49) num = ''; if (!data[issueId]) data[issueId] = { number: num, pl: '' }; else data[issueId].number = num; } }); const storageKey = `drawRecord_${currentRegion}_${year}`; localStorage.setItem(storageKey, JSON.stringify(data)); document.querySelectorAll('.draw-number-input').forEach(el => el.disabled = true); document.querySelectorAll('.draw-pl-input').forEach(el => el.disabled = true); const monthlyPL = new Array(12).fill(0); for (const iid in data) { const entry = data[iid]; if (entry && entry.number && entry.number.trim() && entry.pl !== undefined && entry.pl !== '') { const num = entry.number.trim().padStart(2, '0'); if (/^\d{2}$/.test(num) && parseInt(num) >= 1 && parseInt(num) <= 49) { const issueNum = parseInt(iid); const issueDate = new Date(year, 0, issueNum); const month = issueDate.getMonth(); const plVal = parseFloat(entry.pl); if (!isNaN(plVal)) monthlyPL[month] += plVal; } } } const summaryTable = document.querySelector('.monthly-summary-table'); if (summaryTable) { let html = '<tbody>'; let totalPLSum = 0; for (let m = 0; m < 12; m++) { const val = monthlyPL[m]; totalPLSum += val; let valText = ''; if (val > 0) valText = `<span style="color:#27ae60;font-weight:bold;">+${val}</span>`; else if (val < 0) valText = `<span style="color:#e74c3c;font-weight:bold;">${val}</span>`; html += `<tr><td style="text-align:left;padding:1px 4px;border:none;font-size:11px;color:#0000ff;">${m+1}月</td><td style="text-align:right;padding:1px 4px;border:none;font-size:11px;">${valText}</td></tr>`; } let totalText = ''; if (totalPLSum > 0) totalText = `<span style="color:#27ae60;font-weight:bold;">+${totalPLSum}</span>`; else if (totalPLSum < 0) totalText = `<span style="color:#e74c3c;font-weight:bold;">${totalPLSum}</span>`; html += `<tr style="border-top:2px solid #333;"><td style="text-align:left;padding:1px 4px;border:none;font-size:11px;color:#0000ff;">总盈亏</td><td style="text-align:right;padding:1px 4px;border:none;font-size:11px;">${totalText}</td></tr>`; html += '</tbody>'; summaryTable.innerHTML = html; } updateRecentDrawTexts(); renderSmartDecision(); showToast('保存成功'); }
function saveRecentDrawCount() { const input = document.getElementById('recentDrawCountInput'); if (!input) return; const rawVal = input.value.trim(); if (rawVal === '') { localStorage.removeItem(`recentDrawCount_${currentRegion}`); updateRecentDrawTexts(); renderSmartDecision(); showToast('已清空期数设置'); return; } const val = parseInt(rawVal); if (isNaN(val) || val < 1) { showToast('请输入有效的期数'); return; } localStorage.setItem(`recentDrawCount_${currentRegion}`, val.toString()); updateRecentDrawTexts(); renderSmartDecision(); showToast(`已设置显示最近${val}期`); }
function getCurrentIssueNumber(year, targetDateStr) { const target = new Date(targetDateStr + 'T00:00:00'); const start = new Date(year, 0, 1); if (isNaN(target) || isNaN(start)) return null; if (target < start) return null; const diff = target - start; const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24)) + 1; return dayOfYear; }
function updateRecentDrawTexts() { updateRecentDrawNumbers(); updateRecentZodiacStats(); updateFilterDateDrawInfo(); }
function updateRecentDrawNumbers() { const container = document.getElementById('recentDrawNumbers'); if (!container) return; const countStr = localStorage.getItem(`recentDrawCount_${currentRegion}`); if (!countStr) { container.style.display = 'none'; return; } const count = parseInt(countStr); if (isNaN(count) || count < 1) { container.style.display = 'none'; return; } const fd = document.getElementById('filterDate')?.value || getTodayCST(); let year = new Date().getFullYear(); const m = fd.match(/^(\d{4})/); if (m) year = parseInt(m[1]); const currentIssue = getCurrentIssueNumber(year, fd); if (!currentIssue) { container.style.display = 'none'; return; } const storageKey = `drawRecord_${currentRegion}_${year}`; let savedData = {}; try { savedData = JSON.parse(localStorage.getItem(storageKey) || '{}'); } catch (e) {} const entries = []; for (let i = currentIssue - count; i < currentIssue; i++) { if (i < 1) continue; const issueId = i.toString().padStart(2, '0'); const entry = savedData[issueId]; if (entry && entry.number && entry.number.trim()) { const num = entry.number.trim().padStart(2, '0'); if (/^\d{2}$/.test(num) && parseInt(num) >= 1 && parseInt(num) <= 49) { const zodiac = currentZodiacMap[num] || ''; entries.push({ num, zodiac }); } } } if (entries.length === 0) { container.style.display = 'none'; return; } let html = ''; entries.forEach((entry, idx) => { if (idx > 0) html += '、'; html += `<span class="num ${getNumberColorClass(entry.num)}">${entry.num}</span>`; html += `<span class="slash">/</span>`; html += `<span class="${getZodiacColorClass(entry.zodiac)}">${entry.zodiac}</span>`; }); container.innerHTML = html; container.style.display = ''; }
function updateRecentZodiacStats() { const container = document.getElementById('recentZodiacStats'); if (!container) return; const countStr = localStorage.getItem(`recentDrawCount_${currentRegion}`); if (!countStr) { container.style.display = 'none'; return; } const count = parseInt(countStr); if (isNaN(count) || count < 1) { container.style.display = 'none'; return; } const fd = document.getElementById('filterDate')?.value || getTodayCST(); let year = new Date().getFullYear(); const m = fd.match(/^(\d{4})/); if (m) year = parseInt(m[1]); const currentIssue = getCurrentIssueNumber(year, fd); if (!currentIssue) { container.style.display = 'none'; return; } const storageKey = `drawRecord_${currentRegion}_${year}`; let savedData = {}; try { savedData = JSON.parse(localStorage.getItem(storageKey) || '{}'); } catch (e) {} const zodiacList = []; for (let i = currentIssue - count; i < currentIssue; i++) { if (i < 1) continue; const issueId = i.toString().padStart(2, '0'); const entry = savedData[issueId]; if (entry && entry.number && entry.number.trim()) { const num = entry.number.trim().padStart(2, '0'); if (/^\d{2}$/.test(num) && parseInt(num) >= 1 && parseInt(num) <= 49) { const zodiac = currentZodiacMap[num] || ''; if (zodiac) zodiacList.push(zodiac); } } } if (zodiacList.length === 0) { container.style.display = 'none'; return; } const freq = {}; zodiacList.forEach(z => { freq[z] = (freq[z] || 0) + 1; }); const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]); const repeated = []; const single = []; sorted.forEach(([zodiac, cnt]) => { if (cnt > 1) { repeated.push({ zodiac, cnt }); } else { single.push(zodiac); } }); let html = ''; repeated.forEach(item => { html += `<div>${item.cnt}次：<span class="${getZodiacColorClass(item.zodiac)}">${item.zodiac}</span></div>`; }); if (single.length > 0) { const singleSpans = single.map(z => `<span class="${getZodiacColorClass(z)}">${z}</span>`).join('、'); html += `<div>${singleSpans}</div>`; } container.innerHTML = html; container.style.display = ''; }
function updateFilterDateDrawInfo() { const span = document.getElementById('filterDateDrawInfo'); if (!span) return; const fd = document.getElementById('filterDate')?.value || getTodayCST(); let year = new Date().getFullYear(); const m = fd.match(/^(\d{4})/); if (m) year = parseInt(m[1]); const issueNumber = getCurrentIssueNumber(year, fd); if (!issueNumber) { span.style.display = 'none'; return; } const issueId = issueNumber.toString().padStart(2, '0'); const storageKey = `drawRecord_${currentRegion}_${year}`; let savedData = {}; try { savedData = JSON.parse(localStorage.getItem(storageKey) || '{}'); } catch (e) {} const entry = savedData[issueId]; if (!entry || !entry.number || !entry.number.trim()) { span.style.display = 'none'; return; } const num = entry.number.trim().padStart(2, '0'); if (!/^\d{2}$/.test(num) || parseInt(num) < 1 || parseInt(num) > 49) { span.style.display = 'none'; return; } const zodiac = currentZodiacMap[num] || '';
  span.innerHTML = `<span class="num ${getNumberColorClass(num)}">${num}</span><span class="slash" style="color:#000;">/</span><span class="${getZodiacColorClass(zodiac)}">${zodiac}</span>`;
  span.style.display = ''; }

// ===== 兑奖处理函数 (restored from original) =====

function normalizePlayType(playType) {
  const map = {
    '2连肖':'二连肖','3连肖':'三连肖','4连肖':'四连肖','5连肖':'五连肖',
    '2连尾':'二连尾','3连尾':'三连尾','4连尾':'四连尾','5连尾':'五连尾',
    '5不中':'五不中','6不中':'六不中','7不中':'七不中','8不中':'八不中',
    '9不中':'九不中','10不中':'十不中','11不中':'十一不中','12不中':'十二不中',
    '2中2':'二中二','3中3':'三中三',
    '二连肖':'二连肖','三连肖':'三连肖','四连肖':'四连肖','五连肖':'五连肖',
    '二连尾':'二连尾','三连尾':'三连尾','四连尾':'四连尾','五连尾':'五连尾',
    '五不中':'五不中','六不中':'六不中','七不中':'七不中','八不中':'八不中',
    '九不中':'九不中','十不中':'十不中','十一不中':'十一不中','十二不中':'十二不中',
    '二中二':'二中二','三中三':'三中三','特碰':'特碰',
    '平特肖':'平特肖','平特尾':'平特尾','平码':'平码','特码':'特码','特肖':'特肖'
  };
  return map[playType] || playType;
}

async function saveDuiJiangDraw() {
  await saveDrawNumbers();
  const fd = document.getElementById('filterDate')?.value || getTodayCST();
  let year = new Date().getFullYear();
  const m = fd.match(/^(\d{4})/);
  if (m) year = parseInt(m[1]);
  const issueNumber = getCurrentIssueNumber(year, fd);
  if (!issueNumber) { refreshDuiJiangStats(); return; }
  const issueId = issueNumber.toString().padStart(2, '0');
  const teMaInput = document.getElementById('drawNum7');
  const teMa = teMaInput ? teMaInput.value.trim() : '';
  let teMaFormatted = '';
  if (/^\d$/.test(teMa)) teMaFormatted = '0' + teMa;
  else if (/^\d{2}$/.test(teMa) && parseInt(teMa) >= 1 && parseInt(teMa) <= 49) teMaFormatted = teMa;
  const finalBody = document.getElementById('duiJiangFinalBody');
  let netPL = '';
  if (finalBody) {
    const cells = finalBody.querySelectorAll('td');
    if (cells.length >= 4) {
      const plCell = cells[3];
      if (plCell) {
        const plText = plCell.textContent.trim();
        if (plText !== '' && !isNaN(parseFloat(plText))) netPL = plText;
      }
    }
  }
  if (teMaFormatted || netPL !== '') {
    const storageKey = `drawRecord_${currentRegion}_${year}`;
    let savedData = {};
    try { savedData = JSON.parse(localStorage.getItem(storageKey) || '{}'); } catch(e) {}
    if (!savedData[issueId]) savedData[issueId] = { number: '', pl: '' };
    if (teMaFormatted) savedData[issueId].number = teMaFormatted;
    if (netPL !== '') savedData[issueId].pl = netPL;
    localStorage.setItem(storageKey, JSON.stringify(savedData));
  }
  refreshDuiJiangStats();
}

async function screenshotDuiJiangTable(tableId) {
  const tbl = document.getElementById(tableId);
  if (!tbl) { showToast('表格不存在'); return; }
  try {
    const canvas = await html2canvas(tbl, { backgroundColor: '#ffffff', scale: 2, logging: false });
    canvas.toBlob(async blob => {
      if (!blob) { showToast('生成图片失败'); return; }
      try { const item = new ClipboardItem({ 'image/png': blob }); await navigator.clipboard.write([item]); showToast('截图已复制'); } catch(e) { showToast('复制失败'); }
    }, 'image/png');
  } catch(e) { showToast('截图失败'); }
}

async function screenshotDuiJiangAll() {
  const win = document.getElementById('duiJiangWin');
  if (!win) return;
  const modalBody = win.querySelector('.modal-body');
  if (!modalBody) return;
  try {
    const origOverflow = modalBody.style.overflow;
    const origMaxHeight = modalBody.style.maxHeight;
    modalBody.style.overflow = 'visible';
    modalBody.style.maxHeight = 'none';
    const canvas = await html2canvas(modalBody, { backgroundColor: '#ffffff', scale: 2, logging: false });
    modalBody.style.overflow = origOverflow;
    modalBody.style.maxHeight = origMaxHeight;
    canvas.toBlob(async blob => {
      if (!blob) { showToast('生成图片失败'); return; }
      try { const item = new ClipboardItem({ 'image/png': blob }); await navigator.clipboard.write([item]); showToast('截图全部已复制'); } catch(e) { showToast('复制失败'); }
    }, 'image/png');
  } catch(e) { showToast('截图失败'); }
}

function buildHitDetail(hitByType) {
  const parts = [];
  const orderedTypes = ['特码','特肖','特肖本年肖','平特肖','平特肖带主肖','二连肖','二连肖带主肖','三连肖','三连肖带主肖','四连肖','四连肖带主肖','五连肖','五连肖带主肖','平特尾','平特尾零尾','二连尾','二连尾零尾','三连尾','三连尾零尾','四连尾','四连尾零尾','五连尾','五连尾零尾','五不中','六不中','七不中','八不中','九不中','十不中','十一不中','十二不中','二中二','三中三','平码','特碰'];
  const baoTypes = ['包红波','包蓝波','包绿波','包红单','包红双','包蓝单','包蓝双','包绿单','包绿双','包红大','包红小','包蓝大','包蓝小','包绿大','包绿小','包单','包双','包大','包小','包家禽','包野兽'];
  const allOrderedTypes = [...orderedTypes, ...baoTypes];
  for (const type of allOrderedTypes) {
    if (hitByType[type] && hitByType[type] > 0) {
      parts.push(type + Math.round(hitByType[type]));
    }
  }
  return parts.length > 0 ? parts.join('，') : '';
}

function processTexiaoLineDuijiang(stats, content, amt, drawTeMaZodiac, drawTeMa, hasValidDraw) {
  const zodiacs = content.split('-').map(z => z.trim()).filter(z => z);
  if (zodiacs.length === 0) return;
  const curYearZodiac = document.getElementById('startZodiacSelect')?.value || '马';
  const totalAmt = zodiacs.length * amt;
  const rebate = 4;
  stats.orderTotal += totalAmt;
  stats.orderRebate += totalAmt * (rebate / 100);
  if (hasValidDraw && drawTeMaZodiac) {
    let hitZodiac = null;
    let hitAmt = 0;
    if (zodiacs.includes(drawTeMaZodiac)) {
      hitZodiac = drawTeMaZodiac;
      hitAmt = amt;
    }
    if (hitZodiac) {
      const isBenming = hitZodiac === curYearZodiac;
      const playType = isBenming ? '特肖本年肖' : '特肖';
      const odds = isBenming ? 10 : 11;
      stats.orderHitByType[playType] = (stats.orderHitByType[playType] || 0) + hitAmt;
      stats.orderPL += totalAmt - totalAmt * (rebate / 100) - hitAmt * odds;
    } else {
      stats.orderPL += totalAmt - totalAmt * (rebate / 100);
    }
  }
}

function processTexiaoLineDuijiangReport(stats, content, amt, drawTeMaZodiac, drawTeMa, hasValidDraw) {
  const zodiacs = content.split('-').map(z => z.trim()).filter(z => z);
  if (zodiacs.length === 0) return;
  const curYearZodiac = document.getElementById('startZodiacSelect')?.value || '马';
  const totalAmt = zodiacs.length * amt;
  const rebate = 4;
  stats.reportTotal += totalAmt;
  stats.reportRebate += totalAmt * (rebate / 100);
  if (hasValidDraw && drawTeMaZodiac) {
    let hitZodiac = null;
    let hitAmt = 0;
    if (zodiacs.includes(drawTeMaZodiac)) {
      hitZodiac = drawTeMaZodiac;
      hitAmt = amt;
    }
    if (hitZodiac) {
      const isBenming = hitZodiac === curYearZodiac;
      const playType = isBenming ? '特肖本年肖' : '特肖';
      const odds = isBenming ? 10 : 11;
      stats.reportHitByType[playType] = (stats.reportHitByType[playType] || 0) + hitAmt;
      stats.reportPL += totalAmt - totalAmt * (rebate / 100) - hitAmt * odds;
    } else {
      stats.reportPL += totalAmt - totalAmt * (rebate / 100);
    }
  }
}

function processTepengLineDuijiang(stats, content, amt, drawTeMa, drawNumbersZhengma, hasValidDraw) {
  const cleaned = content.replace(/[()]/g, '');
  const combos = cleaned.split(/\s+/).filter(c => c.trim());
  if (combos.length === 0) return;
  const { odds, rebate } = getOddsForType('特碰', getOddsData());
  const totalAmt = combos.length * amt;
  stats.orderTotal += totalAmt;
  stats.orderRebate += totalAmt * (rebate / 100);
  if (hasValidDraw && drawTeMa) {
    let hitCount = 0;
    combos.forEach(combo => {
      const tokens = combo.split('-');
      if (tokens.length === 2) {
        const first = tokens[0].padStart(2, '0');
        const second = tokens[1].padStart(2, '0');
        if (first === drawTeMa && drawNumbersZhengma.includes(second)) {
          hitCount++;
        }
      }
    });
    if (hitCount > 0) {
      stats.orderHitByType['特碰'] = (stats.orderHitByType['特碰'] || 0) + hitCount * amt;
      stats.orderPL += totalAmt - totalAmt * (rebate / 100) - hitCount * amt * odds;
    } else {
      stats.orderPL += totalAmt - totalAmt * (rebate / 100);
    }
  }
}

function processTepengLineDuijiangReport(stats, content, amt, drawTeMa, drawNumbersZhengma, hasValidDraw) {
  const cleaned = content.replace(/[()]/g, '');
  const combos = cleaned.split(/\s+/).filter(c => c.trim());
  if (combos.length === 0) return;
  const { odds, rebate } = getOddsForType('特碰', getOddsData());
  const totalAmt = combos.length * amt;
  stats.reportTotal += totalAmt;
  stats.reportRebate += totalAmt * (rebate / 100);
  if (hasValidDraw && drawTeMa) {
    let hitCount = 0;
    combos.forEach(combo => {
      const tokens = combo.split('-');
      if (tokens.length === 2) {
        const first = tokens[0].padStart(2, '0');
        const second = tokens[1].padStart(2, '0');
        if (first === drawTeMa && drawNumbersZhengma.includes(second)) {
          hitCount++;
        }
      }
    });
    if (hitCount > 0) {
      stats.reportHitByType['特碰'] = (stats.reportHitByType['特碰'] || 0) + hitCount * amt;
      stats.reportPL += totalAmt - totalAmt * (rebate / 100) - hitCount * amt * odds;
    } else {
      stats.reportPL += totalAmt - totalAmt * (rebate / 100);
    }
  }
}

function processBaoLineDuijiang(stats, playType, content, amt, drawTeMa, hasValidDraw) {
  const attr = content.trim();
  if (!attr || !D[attr]) return;
  const baoType = '包' + attr;
  const { odds, rebate } = getOddsForType(baoType, getOddsData());
  const totalAmt = amt;
  stats.orderTotal += totalAmt;
  stats.orderRebate += totalAmt * (rebate / 100);
  if (hasValidDraw && drawTeMa) {
    const attrNums = (D[attr] || '').split(/[\s,，]+/).filter(n => n.trim());
    const hit = attrNums.includes(drawTeMa);
    if (hit) {
      stats.orderHitByType[baoType] = (stats.orderHitByType[baoType] || 0) + amt;
      stats.orderPL += totalAmt - totalAmt * (rebate / 100) - amt * odds;
    } else {
      stats.orderPL += totalAmt - totalAmt * (rebate / 100);
    }
  }
}

function processBaoLineDuijiangReport(stats, playType, content, amt, drawTeMa, hasValidDraw) {
  const attr = content.trim();
  if (!attr || !D[attr]) return;
  const baoType = '包' + attr;
  const { odds, rebate } = getOddsForType(baoType, getOddsData());
  const totalAmt = amt;
  stats.reportTotal += totalAmt;
  stats.reportRebate += totalAmt * (rebate / 100);
  if (hasValidDraw && drawTeMa) {
    const attrNums = (D[attr] || '').split(/[\s,，]+/).filter(n => n.trim());
    const hit = attrNums.includes(drawTeMa);
    if (hit) {
      stats.reportHitByType[baoType] = (stats.reportHitByType[baoType] || 0) + amt;
      stats.reportPL += totalAmt - totalAmt * (rebate / 100) - amt * odds;
    } else {
      stats.reportPL += totalAmt - totalAmt * (rebate / 100);
    }
  }
}

function processNormalLineDuijiangNew(stats, content, amt, drawTeMa, hasValidDraw) {
  const items = content.split('-').map(i => i.trim()).filter(i => i);
  const nums = [];
  items.forEach(item => {
    if (/^\d+$/.test(item)) { nums.push(item.padStart(2, '0')); }
    else if (ZODIAC_NUMS[item]) { (ZODIAC_NUMS[item] || '').split(/[\s,，]+/).forEach(n => nums.push(n.padStart(2, '0'))); }
    else if (D[item]) {
      const val = D[item];
      if (/[鼠牛虎兔龙蛇马羊猴鸡狗猪]/.test(val)) {
        for (const z of val) { if (ZODIAC_NUMS[z]) ZODIAC_NUMS[z].split(/[\s,，]+/).forEach(n => nums.push(n.padStart(2, '0'))); }
      } else {
        val.split(/[\s,，]+/).filter(n => n.trim()).forEach(n => nums.push(n.padStart(2, '0')));
      }
    }
  });
  const { odds, rebate } = getOddsForType('特码', getOddsData());
  const totalCount = nums.length;
  stats.orderTotal += totalCount * amt;
  stats.orderRebate += totalCount * amt * (rebate / 100);
  if (hasValidDraw) {
    let hitAmount = 0;
    nums.forEach(num => { if (num === drawTeMa && drawTeMa) { hitAmount += amt; } });
    if (hitAmount > 0) { stats.orderHitByType['特码'] = (stats.orderHitByType['特码'] || 0) + hitAmount; }
    stats.orderPL += (totalCount * amt) - (totalCount * amt * (rebate / 100)) - (hitAmount * odds);
  }
}

function processComboLineDuijiangNew(stats, playType, content, amt, drawZodiacsSet, drawNumbersSet, drawNumbersZhengma, hasValidDraw) {
  playType = normalizePlayType(playType);
  const cleaned = content.replace(/[()]/g, '');
  const combos = cleaned.split(/\s+/).filter(c => c.trim());
  const curYearZodiac = document.getElementById('startZodiacSelect')?.value || '马';
  combos.forEach(combo => {
    const tokens = combo.split('-');
    let comboType = playType;
    let hasYearZodiac = false;
    let hasZeroWei = false;
    if (comboType === '平特肖') {
      hasYearZodiac = tokens.some(t => t === curYearZodiac);
    } else if (comboType === '平特尾') {
      hasZeroWei = tokens.some(t => t.replace('尾','') === '0');
    } else if (['二连肖','三连肖','四连肖','五连肖'].includes(comboType)) {
      hasYearZodiac = tokens.some(t => t === curYearZodiac);
    } else if (['二连尾','三连尾','四连尾','五连尾'].includes(comboType)) {
      hasZeroWei = tokens.some(t => t.replace('尾','') === '0');
    }
    if (hasYearZodiac) {
      if (comboType === '平特肖') comboType = '平特肖带主肖';
      else if (['二连肖','三连肖','四连肖','五连肖'].includes(comboType)) comboType = comboType + '带主肖';
    }
    if (hasZeroWei) {
      if (comboType === '平特尾') comboType = '平特尾零尾';
      else if (['二连尾','三连尾','四连尾','五连尾'].includes(comboType)) comboType = comboType + '零尾';
    }
    const { odds, rebate } = getOddsForType(comboType, getOddsData());
    const isPerItem = ['平特肖','平特肖带主肖','平特尾','平特尾零尾','平码'].includes(comboType);
    const effectiveCount = isPerItem ? tokens.length : 1;
    stats.orderTotal += effectiveCount * amt;
    stats.orderRebate += effectiveCount * amt * (rebate / 100);
    if (hasValidDraw) {
      let hit = false;
      if (comboType === '平特肖' || comboType === '平特肖带主肖') { hit = tokens.some(t => drawZodiacsSet.has(t)); }
      else if (comboType === '平特尾' || comboType === '平特尾零尾') { hit = tokens.some(t => { const d = t.replace('尾',''); const tailNums = []; for (let i=0;i<=4;i++) { const n=(i*10+parseInt(d)).toString().padStart(2,'0'); if(parseInt(n)>=1&&parseInt(n)<=49) tailNums.push(n); } return tailNums.some(n => drawNumbersSet.has(n)); }); }
      else if (comboType === '平码') { hit = tokens.some(t => drawNumbersZhengma.includes(t.padStart(2,'0'))); }
      else if (['二连肖','二连肖带主肖','三连肖','三连肖带主肖','四连肖','四连肖带主肖','五连肖','五连肖带主肖'].includes(comboType)) { hit = tokens.every(t => drawZodiacsSet.has(t)); }
      else if (['二连尾','二连尾零尾','三连尾','三连尾零尾','四连尾','四连尾零尾','五连尾','五连尾零尾'].includes(comboType)) { hit = tokens.every(t => { const d=t.replace('尾',''); for(let i=0;i<=4;i++){ const n=(i*10+parseInt(d)).toString().padStart(2,'0'); if(drawNumbersSet.has(n)) return true; } return false; }); }
      else if (['五不中','六不中','七不中','八不中','九不中','十不中','十一不中','十二不中'].includes(comboType)) { hit = !tokens.some(t => drawNumbersSet.has(t.padStart(2,'0'))); }
      else if (comboType === '二中二' || comboType === '三中三') { hit = tokens.every(t => drawNumbersZhengma.includes(t.padStart(2,'0'))); }
      if (hit) {
        if (isPerItem) {
          let hitCount = 0;
          if (comboType === '平特肖' || comboType === '平特肖带主肖') { hitCount = tokens.filter(t => drawZodiacsSet.has(t)).length; }
          else if (comboType === '平特尾' || comboType === '平特尾零尾') { hitCount = tokens.filter(t => { const d=t.replace('尾',''); for(let i=0;i<=4;i++){ const n=(i*10+parseInt(d)).toString().padStart(2,'0'); if(drawNumbersSet.has(n)) return true; } return false; }).length; }
          else if (comboType === '平码') { hitCount = tokens.filter(t => drawNumbersZhengma.includes(t.padStart(2,'0'))).length; }
          if (hitCount > 0) { stats.orderHitByType[comboType] = (stats.orderHitByType[comboType] || 0) + hitCount * amt; }
          stats.orderPL += effectiveCount * amt - effectiveCount * amt * (rebate / 100) - (hitCount * amt * odds);
        } else {
          stats.orderHitByType[comboType] = (stats.orderHitByType[comboType] || 0) + amt;
          stats.orderPL += amt - amt * (rebate / 100) - (amt * odds);
        }
      } else {
        stats.orderPL += effectiveCount * amt - effectiveCount * amt * (rebate / 100);
      }
    }
  });
}

function processComboLineDuijiangNewReport(stats, playType, content, amt, drawZodiacsSet, drawNumbersSet, drawNumbersZhengma, hasValidDraw) {
  playType = normalizePlayType(playType);
  const cleaned = content.replace(/[()]/g, '');
  const combos = cleaned.split(/\s+/).filter(c => c.trim());
  const curYearZodiac = document.getElementById('startZodiacSelect')?.value || '马';
  combos.forEach(combo => {
    const tokens = combo.split('-');
    let comboType = playType;
    let hasYearZodiac = false;
    let hasZeroWei = false;
    if (comboType === '平特肖') {
      hasYearZodiac = tokens.some(t => t === curYearZodiac);
    } else if (comboType === '平特尾') {
      hasZeroWei = tokens.some(t => t.replace('尾','') === '0');
    } else if (['二连肖','三连肖','四连肖','五连肖'].includes(comboType)) {
      hasYearZodiac = tokens.some(t => t === curYearZodiac);
    } else if (['二连尾','三连尾','四连尾','五连尾'].includes(comboType)) {
      hasZeroWei = tokens.some(t => t.replace('尾','') === '0');
    }
    if (hasYearZodiac) {
      if (comboType === '平特肖') comboType = '平特肖带主肖';
      else if (['二连肖','三连肖','四连肖','五连肖'].includes(comboType)) comboType = comboType + '带主肖';
    }
    if (hasZeroWei) {
      if (comboType === '平特尾') comboType = '平特尾零尾';
      else if (['二连尾','三连尾','四连尾','五连尾'].includes(comboType)) comboType = comboType + '零尾';
    }
    const { odds, rebate } = getOddsForType(comboType, getOddsData());
    const isPerItem = ['平特肖','平特肖带主肖','平特尾','平特尾零尾','平码'].includes(comboType);
    const effectiveCount = isPerItem ? tokens.length : 1;
    stats.reportTotal += effectiveCount * amt;
    stats.reportRebate += effectiveCount * amt * (rebate / 100);
    if (hasValidDraw) {
      let hit = false;
      if (comboType === '平特肖' || comboType === '平特肖带主肖') { hit = tokens.some(t => drawZodiacsSet.has(t)); }
      else if (comboType === '平特尾' || comboType === '平特尾零尾') { hit = tokens.some(t => { const d = t.replace('尾',''); const tailNums = []; for (let i=0;i<=4;i++) { const n=(i*10+parseInt(d)).toString().padStart(2,'0'); if(parseInt(n)>=1&&parseInt(n)<=49) tailNums.push(n); } return tailNums.some(n => drawNumbersSet.has(n)); }); }
      else if (comboType === '平码') { hit = tokens.some(t => drawNumbersZhengma.includes(t.padStart(2,'0'))); }
      else if (['二连肖','二连肖带主肖','三连肖','三连肖带主肖','四连肖','四连肖带主肖','五连肖','五连肖带主肖'].includes(comboType)) { hit = tokens.every(t => drawZodiacsSet.has(t)); }
      else if (['二连尾','二连尾零尾','三连尾','三连尾零尾','四连尾','四连尾零尾','五连尾','五连尾零尾'].includes(comboType)) { hit = tokens.every(t => { const d=t.replace('尾',''); for(let i=0;i<=4;i++){ const n=(i*10+parseInt(d)).toString().padStart(2,'0'); if(drawNumbersSet.has(n)) return true; } return false; }); }
      else if (['五不中','六不中','七不中','八不中','九不中','十不中','十一不中','十二不中'].includes(comboType)) { hit = !tokens.some(t => drawNumbersSet.has(t.padStart(2,'0'))); }
      else if (comboType === '二中二' || comboType === '三中三') { hit = tokens.every(t => drawNumbersZhengma.includes(t.padStart(2,'0'))); }
      if (hit) {
        if (isPerItem) {
          let hitCount = 0;
          if (comboType === '平特肖' || comboType === '平特肖带主肖') { hitCount = tokens.filter(t => drawZodiacsSet.has(t)).length; }
          else if (comboType === '平特尾' || comboType === '平特尾零尾') { hitCount = tokens.filter(t => { const d=t.replace('尾',''); for(let i=0;i<=4;i++){ const n=(i*10+parseInt(d)).toString().padStart(2,'0'); if(drawNumbersSet.has(n)) return true; } return false; }).length; }
          else if (comboType === '平码') { hitCount = tokens.filter(t => drawNumbersZhengma.includes(t.padStart(2,'0'))).length; }
          if (hitCount > 0) { stats.reportHitByType[comboType] = (stats.reportHitByType[comboType] || 0) + hitCount * amt; }
          stats.reportPL += effectiveCount * amt - effectiveCount * amt * (rebate / 100) - (hitCount * amt * odds);
        } else {
          stats.reportHitByType[comboType] = (stats.reportHitByType[comboType] || 0) + amt;
          stats.reportPL += amt - amt * (rebate / 100) - (amt * odds);
        }
      } else {
        stats.reportPL += effectiveCount * amt - effectiveCount * amt * (rebate / 100);
      }
    }
  });
}

function processReportLineDuijiangNew(stats, content, amt, drawTeMa, hasValidDraw) {
  const items = content.split('-').map(i => i.trim()).filter(i => i);
  const nums = [];
  items.forEach(item => {
    if (/^\d+$/.test(item)) { nums.push(item.padStart(2, '0')); }
    else if (ZODIAC_NUMS[item]) { (ZODIAC_NUMS[item] || '').split(/[\s,，]+/).forEach(n => nums.push(n.padStart(2, '0'))); }
    else if (D[item]) {
      const val = D[item];
      if (/[鼠牛虎兔龙蛇马羊猴鸡狗猪]/.test(val)) {
        for (const z of val) { if (ZODIAC_NUMS[z]) ZODIAC_NUMS[z].split(/[\s,，]+/).forEach(n => nums.push(n.padStart(2, '0'))); }
      } else {
        val.split(/[\s,，]+/).filter(n => n.trim()).forEach(n => nums.push(n.padStart(2, '0')));
      }
    }
  });
  const { odds, rebate } = getOddsForType('特码', getOddsData());
  const totalCount = nums.length;
  stats.reportTotal += totalCount * amt;
  stats.reportRebate += totalCount * amt * (rebate / 100);
  if (hasValidDraw) {
    let hitAmount = 0;
    nums.forEach(num => { if (num === drawTeMa && drawTeMa) { hitAmount += amt; } });
    if (hitAmount > 0) { stats.reportHitByType['特码'] = (stats.reportHitByType['特码'] || 0) + hitAmount; }
    stats.reportPL += (totalCount * amt) - (totalCount * amt * (rebate / 100)) - (hitAmount * odds);
  }
}

function processNormalLineDuijiangOld(stats, match, drawTeMa, hasValidDraw) {
  const cont = match[1]; const amt = parseInt(match[2]) || 0;
  const items = cont.split('-').map(i => i.trim()).filter(i => i);
  const nums = [];
  items.forEach(item => {
    if (/^\d+$/.test(item)) { nums.push(item.padStart(2, '0')); }
    else if (ZODIAC_NUMS[item]) { (ZODIAC_NUMS[item] || '').split(/[\s,，]+/).forEach(n => nums.push(n.padStart(2, '0'))); }
    else if (D[item]) {
      const val = D[item];
      if (/[鼠牛虎兔龙蛇马羊猴鸡狗猪]/.test(val)) {
        for (const z of val) { if (ZODIAC_NUMS[z]) ZODIAC_NUMS[z].split(/[\s,，]+/).forEach(n => nums.push(n.padStart(2, '0'))); }
      } else {
        val.split(/[\s,，]+/).filter(n => n.trim()).forEach(n => nums.push(n.padStart(2, '0')));
      }
    }
  });
  const { odds, rebate } = getOddsForType('特码', getOddsData());
  const totalCount = nums.length;
  stats.orderTotal += totalCount * amt;
  stats.orderRebate += totalCount * amt * (rebate / 100);
  if (hasValidDraw) {
    let hitAmount = 0;
    nums.forEach(num => { if (num === drawTeMa && drawTeMa) { hitAmount += amt; } });
    if (hitAmount > 0) { stats.orderHitByType['特码'] = (stats.orderHitByType['特码'] || 0) + hitAmount; }
    stats.orderPL += (totalCount * amt) - (totalCount * amt * (rebate / 100)) - (hitAmount * odds);
  }
}

function processComboLineDuijiangOld(stats, match, drawZodiacsSet, drawNumbersSet, drawNumbersZhengma, drawTeMa, hasValidDraw) {
  const combosStr = match[1]; const amt = parseInt(match[2]) || 0;
  const cleaned = combosStr.replace(/[()]/g, ''); const combos = cleaned.split(/\s+/).filter(c => c.trim());
  const curYearZodiac = document.getElementById('startZodiacSelect')?.value || '马';
  combos.forEach(combo => {
    const tokens = combo.split('-');
    let comboType = '';
    let hasYearZodiac = false;
    let hasZeroWei = false;
    if (tokens.length === 1) {
      if (ZODIAC_NUMS[tokens[0]]) { comboType = '平特肖'; if (tokens[0] === curYearZodiac) hasYearZodiac = true; }
      else if (tokens[0].includes('尾')) { comboType = '平特尾'; if (tokens[0].replace('尾','') === '0') hasZeroWei = true; }
      else if (/^\d{2}$/.test(tokens[0])) { comboType = '平码'; }
    } else if (tokens.every(t => ZODIAC_NUMS[t])) {
      const lxMap = {2:'二连肖',3:'三连肖',4:'四连肖',5:'五连肖'};
      comboType = lxMap[tokens.length] || '二连肖';
      hasYearZodiac = tokens.some(t => t === curYearZodiac);
    } else if (tokens.every(t => t.includes('尾'))) {
      const lwMap = {2:'二连尾',3:'三连尾',4:'四连尾',5:'五连尾'};
      comboType = lwMap[tokens.length] || '二连尾';
      hasZeroWei = tokens.some(t => t.replace('尾','') === '0');
    } else if (tokens.every(t => /^\d{2}$/.test(t))) {
      if (tokens.length === 2) { comboType = '二中二'; }
      else if (tokens.length === 3) { comboType = '三中三'; }
      else { const bzMap = {5:'五不中',6:'六不中',7:'七不中',8:'八不中',9:'九不中',10:'十不中',11:'十一不中',12:'十二不中'}; comboType = bzMap[tokens.length] || '五不中'; }
    }
    if (!comboType) return;
    comboType = normalizePlayType(comboType);
    if (hasYearZodiac) {
      if (comboType === '平特肖') comboType = '平特肖带主肖';
      else if (['二连肖','三连肖','四连肖','五连肖'].includes(comboType)) comboType = comboType + '带主肖';
    }
    if (hasZeroWei) {
      if (comboType === '平特尾') comboType = '平特尾零尾';
      else if (['二连尾','三连尾','四连尾','五连尾'].includes(comboType)) comboType = comboType + '零尾';
    }
    const { odds, rebate } = getOddsForType(comboType, getOddsData());
    const isPerItem = ['平特肖','平特肖带主肖','平特尾','平特尾零尾','平码'].includes(comboType);
    const effectiveCount = isPerItem ? tokens.length : 1;
    stats.orderTotal += effectiveCount * amt;
    stats.orderRebate += effectiveCount * amt * (rebate / 100);
    if (hasValidDraw) {
      let hit = false;
      if (comboType === '平特肖' || comboType === '平特肖带主肖') { hit = tokens.some(t => drawZodiacsSet.has(t)); }
      else if (comboType === '平特尾' || comboType === '平特尾零尾') { hit = tokens.some(t => { const d = t.replace('尾',''); const tailNums = []; for (let i=0;i<=4;i++) { const n=(i*10+parseInt(d)).toString().padStart(2,'0'); if(parseInt(n)>=1&&parseInt(n)<=49) tailNums.push(n); } return tailNums.some(n => drawNumbersSet.has(n)); }); }
      else if (comboType === '平码') { hit = tokens.some(t => drawNumbersZhengma.includes(t.padStart(2,'0'))); }
      else if (['二连肖','二连肖带主肖','三连肖','三连肖带主肖','四连肖','四连肖带主肖','五连肖','五连肖带主肖'].includes(comboType)) { hit = tokens.every(t => drawZodiacsSet.has(t)); }
      else if (['二连尾','二连尾零尾','三连尾','三连尾零尾','四连尾','四连尾零尾','五连尾','五连尾零尾'].includes(comboType)) { hit = tokens.every(t => { const d=t.replace('尾',''); for(let i=0;i<=4;i++){ const n=(i*10+parseInt(d)).toString().padStart(2,'0'); if(drawNumbersSet.has(n)) return true; } return false; }); }
      else if (['五不中','六不中','七不中','八不中','九不中','十不中','十一不中','十二不中'].includes(comboType)) { hit = !tokens.some(t => drawNumbersSet.has(t.padStart(2,'0'))); }
      else if (comboType === '二中二' || comboType === '三中三') { hit = tokens.every(t => drawNumbersZhengma.includes(t.padStart(2,'0'))); }
      if (hit) {
        if (isPerItem) {
          let hitCount = 0;
          if (comboType === '平特肖' || comboType === '平特肖带主肖') { hitCount = tokens.filter(t => drawZodiacsSet.has(t)).length; }
          else if (comboType === '平特尾' || comboType === '平特尾零尾') { hitCount = tokens.filter(t => { const d=t.replace('尾',''); for(let i=0;i<=4;i++){ const n=(i*10+parseInt(d)).toString().padStart(2,'0'); if(drawNumbersSet.has(n)) return true; } return false; }).length; }
          else if (comboType === '平码') { hitCount = tokens.filter(t => drawNumbersZhengma.includes(t.padStart(2,'0'))).length; }
          if (hitCount > 0) { stats.orderHitByType[comboType] = (stats.orderHitByType[comboType] || 0) + hitCount * amt; }
          stats.orderPL += effectiveCount * amt - effectiveCount * amt * (rebate / 100) - (hitCount * amt * odds);
        } else {
          stats.orderHitByType[comboType] = (stats.orderHitByType[comboType] || 0) + amt;
          stats.orderPL += amt - amt * (rebate / 100) - (amt * odds);
        }
      } else {
        stats.orderPL += effectiveCount * amt - effectiveCount * amt * (rebate / 100);
      }
    }
  });
}

function processComboLineDuijiangOldReport(stats, match, drawZodiacsSet, drawNumbersSet, drawNumbersZhengma, drawTeMa, hasValidDraw) {
  const combosStr = match[1]; const amt = parseInt(match[2]) || 0;
  const cleaned = combosStr.replace(/[()]/g, ''); const combos = cleaned.split(/\s+/).filter(c => c.trim());
  const curYearZodiac = document.getElementById('startZodiacSelect')?.value || '马';
  combos.forEach(combo => {
    const tokens = combo.split('-');
    let comboType = '';
    let hasYearZodiac = false;
    let hasZeroWei = false;
    if (tokens.length === 1) {
      if (ZODIAC_NUMS[tokens[0]]) { comboType = '平特肖'; if (tokens[0] === curYearZodiac) hasYearZodiac = true; }
      else if (tokens[0].includes('尾')) { comboType = '平特尾'; if (tokens[0].replace('尾','') === '0') hasZeroWei = true; }
      else if (/^\d{2}$/.test(tokens[0])) { comboType = '平码'; }
    } else if (tokens.every(t => ZODIAC_NUMS[t])) {
      const lxMap = {2:'二连肖',3:'三连肖',4:'四连肖',5:'五连肖'};
      comboType = lxMap[tokens.length] || '二连肖';
      hasYearZodiac = tokens.some(t => t === curYearZodiac);
    } else if (tokens.every(t => t.includes('尾'))) {
      const lwMap = {2:'二连尾',3:'三连尾',4:'四连尾',5:'五连尾'};
      comboType = lwMap[tokens.length] || '二连尾';
      hasZeroWei = tokens.some(t => t.replace('尾','') === '0');
    } else if (tokens.every(t => /^\d{2}$/.test(t))) {
      if (tokens.length === 2) { comboType = '二中二'; }
      else if (tokens.length === 3) { comboType = '三中三'; }
      else { const bzMap = {5:'五不中',6:'六不中',7:'七不中',8:'八不中',9:'九不中',10:'十不中',11:'十一不中',12:'十二不中'}; comboType = bzMap[tokens.length] || '五不中'; }
    }
    if (!comboType) return;
    comboType = normalizePlayType(comboType);
    if (hasYearZodiac) {
      if (comboType === '平特肖') comboType = '平特肖带主肖';
      else if (['二连肖','三连肖','四连肖','五连肖'].includes(comboType)) comboType = comboType + '带主肖';
    }
    if (hasZeroWei) {
      if (comboType === '平特尾') comboType = '平特尾零尾';
      else if (['二连尾','三连尾','四连尾','五连尾'].includes(comboType)) comboType = comboType + '零尾';
    }
    const { odds, rebate } = getOddsForType(comboType, getOddsData());
    const isPerItem = ['平特肖','平特肖带主肖','平特尾','平特尾零尾','平码'].includes(comboType);
    const effectiveCount = isPerItem ? tokens.length : 1;
    stats.reportTotal += effectiveCount * amt;
    stats.reportRebate += effectiveCount * amt * (rebate / 100);
    if (hasValidDraw) {
      let hit = false;
      if (comboType === '平特肖' || comboType === '平特肖带主肖') { hit = tokens.some(t => drawZodiacsSet.has(t)); }
      else if (comboType === '平特尾' || comboType === '平特尾零尾') { hit = tokens.some(t => { const d = t.replace('尾',''); const tailNums = []; for (let i=0;i<=4;i++) { const n=(i*10+parseInt(d)).toString().padStart(2,'0'); if(parseInt(n)>=1&&parseInt(n)<=49) tailNums.push(n); } return tailNums.some(n => drawNumbersSet.has(n)); }); }
      else if (comboType === '平码') { hit = tokens.some(t => drawNumbersZhengma.includes(t.padStart(2,'0'))); }
      else if (['二连肖','二连肖带主肖','三连肖','三连肖带主肖','四连肖','四连肖带主肖','五连肖','五连肖带主肖'].includes(comboType)) { hit = tokens.every(t => drawZodiacsSet.has(t)); }
      else if (['二连尾','二连尾零尾','三连尾','三连尾零尾','四连尾','四连尾零尾','五连尾','五连尾零尾'].includes(comboType)) { hit = tokens.every(t => { const d=t.replace('尾',''); for(let i=0;i<=4;i++){ const n=(i*10+parseInt(d)).toString().padStart(2,'0'); if(drawNumbersSet.has(n)) return true; } return false; }); }
      else if (['五不中','六不中','七不中','八不中','九不中','十不中','十一不中','十二不中'].includes(comboType)) { hit = !tokens.some(t => drawNumbersSet.has(t.padStart(2,'0'))); }
      else if (comboType === '二中二' || comboType === '三中三') { hit = tokens.every(t => drawNumbersZhengma.includes(t.padStart(2,'0'))); }
      if (hit) {
        if (isPerItem) {
          let hitCount = 0;
          if (comboType === '平特肖' || comboType === '平特肖带主肖') { hitCount = tokens.filter(t => drawZodiacsSet.has(t)).length; }
          else if (comboType === '平特尾' || comboType === '平特尾零尾') { hitCount = tokens.filter(t => { const d=t.replace('尾',''); for(let i=0;i<=4;i++){ const n=(i*10+parseInt(d)).toString().padStart(2,'0'); if(drawNumbersSet.has(n)) return true; } return false; }).length; }
          else if (comboType === '平码') { hitCount = tokens.filter(t => drawNumbersZhengma.includes(t.padStart(2,'0'))).length; }
          if (hitCount > 0) { stats.reportHitByType[comboType] = (stats.reportHitByType[comboType] || 0) + hitCount * amt; }
          stats.reportPL += effectiveCount * amt - effectiveCount * amt * (rebate / 100) - (hitCount * amt * odds);
        } else {
          stats.reportHitByType[comboType] = (stats.reportHitByType[comboType] || 0) + amt;
          stats.reportPL += amt - amt * (rebate / 100) - (amt * odds);
        }
      } else {
        stats.reportPL += effectiveCount * amt - effectiveCount * amt * (rebate / 100);
      }
    }
  });
}

function processReportLineDuijiangOld(stats, match, drawTeMa, hasValidDraw) {
  const cont = match[1]; const amt = parseInt(match[2]) || 0;
  const items = cont.split('-').map(i => i.trim()).filter(i => i);
  const nums = [];
  items.forEach(item => {
    if (/^\d+$/.test(item)) { nums.push(item.padStart(2, '0')); }
    else if (ZODIAC_NUMS[item]) { (ZODIAC_NUMS[item] || '').split(/[\s,，]+/).forEach(n => nums.push(n.padStart(2, '0'))); }
    else if (D[item]) {
      const val = D[item];
      if (/[鼠牛虎兔龙蛇马羊猴鸡狗猪]/.test(val)) {
        for (const z of val) { if (ZODIAC_NUMS[z]) ZODIAC_NUMS[z].split(/[\s,，]+/).forEach(n => nums.push(n.padStart(2, '0'))); }
      } else {
        val.split(/[\s,，]+/).filter(n => n.trim()).forEach(n => nums.push(n.padStart(2, '0')));
      }
    }
  });
  const { odds, rebate } = getOddsForType('特码', getOddsData());
  const totalCount = nums.length;
  stats.reportTotal += totalCount * amt;
  stats.reportRebate += totalCount * amt * (rebate / 100);
  if (hasValidDraw) {
    let hitAmount = 0;
    nums.forEach(num => { if (num === drawTeMa && drawTeMa) { hitAmount += amt; } });
    if (hitAmount > 0) { stats.reportHitByType['特码'] = (stats.reportHitByType['特码'] || 0) + hitAmount; }
    stats.reportPL += (totalCount * amt) - (totalCount * amt * (rebate / 100)) - (hitAmount * odds);
  }
}

// ===== 连肖管理函数 (restored from original) =====

function comboRemoveSeparators() { const ta = document.getElementById('comboInput'); if (!ta) return; const s = ta.selectionStart, e = ta.selectionEnd; if (s === e) { showToast('请先选择文本'); return; } const sel = ta.value.substring(s, e); const cleaned = sel.replace(/[\s,，.。、+\-*＊\/\\|]+/g, ''); ta.value = ta.value.substring(0, s) + cleaned + ta.value.substring(e); }

async function pasteComboOrder() { try { const text = await navigator.clipboard.readText(); if (text) { const ta = document.getElementById('comboInput'); if (ta) { ta.value = text; } } } catch(err) { showToast('无法访问剪贴板'); } }

async function screenshotLianxiaoStatsAll() {
  const container = document.getElementById('lianxiaoStatsContainer'); if (!container) { showToast('无内容'); return; }
  try {
    const origOverflow = container.style.overflow; const origMaxHeight = container.style.maxHeight;
    container.style.overflow = 'visible'; container.style.maxHeight = 'none';
    const scrollDivs = container.querySelectorAll('div[style*="max-height:400px"]'); const savedStyles = [];
    scrollDivs.forEach(div => { savedStyles.push({ div, overflow: div.style.overflow, maxHeight: div.style.maxHeight }); div.style.overflow = 'visible'; div.style.maxHeight = 'none'; });
    container.offsetHeight;
    const canvas = await html2canvas(container, { backgroundColor: '#ffffff', scale: 2, logging: false });
    container.style.overflow = origOverflow; container.style.maxHeight = origMaxHeight;
    savedStyles.forEach(item => { item.div.style.overflow = item.overflow; item.div.style.maxHeight = item.maxHeight; });
    canvas.toBlob(async blob => { if (!blob) { showToast('生成图片失败'); return; } try { const item = new ClipboardItem({ 'image/png': blob }); await navigator.clipboard.write([item]); showToast('截图已复制'); } catch(e) { showToast('复制失败'); } }, 'image/png');
  } catch(e) { showToast('截图失败'); }
}

async function screenshotSingleComboCard(cardId) {
  const card = document.getElementById(cardId); if (!card) { showToast('卡片不存在'); return; }
  try {
    const clone = card.cloneNode(true); clone.style.position = 'absolute'; clone.style.left = '-9999px'; clone.style.top = '0'; clone.style.width = card.offsetWidth + 'px'; clone.style.display = 'block'; clone.style.visibility = 'visible'; document.body.appendChild(clone);
    const scrollDiv = clone.querySelector('div[style*="max-height:400px"]'); if (scrollDiv) { scrollDiv.style.overflow = 'visible'; scrollDiv.style.maxHeight = 'none'; }
    clone.offsetHeight;
    const canvas = await html2canvas(clone, { backgroundColor: '#ffffff', scale: 2, logging: false });
    document.body.removeChild(clone);
    canvas.toBlob(async blob => { if (!blob) { showToast('生成图片失败'); return; } try { const item = new ClipboardItem({ 'image/png': blob }); await navigator.clipboard.write([item]); showToast('截图已复制'); } catch(e) { showToast('复制失败'); } }, 'image/png');
  } catch(e) { showToast('截图失败'); }
}

async function screenshotRiskCard() {
  const card = document.getElementById('riskReportCard');
  if (!card) { showToast('卡片不存在'); return; }
  try {
    const clone = card.cloneNode(true);
    clone.style.position = 'absolute';
    clone.style.left = '-9999px';
    clone.style.top = '0';
    clone.style.width = card.offsetWidth + 'px';
    clone.style.display = 'block';
    clone.style.visibility = 'visible';
    document.body.appendChild(clone);
    const scrollDivs = clone.querySelectorAll('.table-container, [style*="overflow"]');
    const savedStyles = [];
    scrollDivs.forEach(div => {
      savedStyles.push({ div, overflow: div.style.overflow, maxHeight: div.style.maxHeight });
      div.style.overflow = 'visible';
      div.style.maxHeight = 'none';
    });
    clone.offsetHeight;
    const canvas = await html2canvas(clone, { backgroundColor: '#ffffff', scale: 2, logging: false });
    document.body.removeChild(clone);
    canvas.toBlob(async blob => {
      if (!blob) { showToast('生成图片失败'); return; }
      try { const item = new ClipboardItem({ 'image/png': blob }); await navigator.clipboard.write([item]); showToast('卡片截图已复制'); } catch(e) { showToast('复制失败'); }
    }, 'image/png');
  } catch(e) { showToast('截图失败'); }
}

function getComboTypeLabel(type) {
  const map = { '特肖': '特肖', 'tePeng': '特碰', pingtexiao: '平特肖', pingtewei: '平特尾', lianxiao2: '二连肖', lianxiao3: '三连肖', lianxiao4: '四连肖', lianxiao5: '五连肖', zhong2: '二中二', zhong3: '三中三', pingma: '平码', lianwei2: '二连尾', lianwei3: '三连尾', lianwei4: '四连尾', lianwei5: '五连尾', buzhong5: '五不中', buzhong6: '六不中', buzhong7: '七不中', buzhong8: '八不中', buzhong9: '九不中', buzhong10: '十不中', buzhong11: '十一不中', buzhong12: '十二不中' };
  return map[type] || type;
}

async function clearAllComboOrders() {
  if (!(await confirm('确定清空全部其他订单吗？此操作不可恢复！'))) return;
  if (!db) return;
  const tx = db.transaction([STORE_NAME], 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  const all = await new Promise(resolve => { const req = store.getAll(); req.onsuccess = (e) => resolve(e.target.result || []); });
  const toDelete = all.filter(r => r.region === currentRegion).filter(r => {
    const lines = r.content.split('\n');
    return lines.some(line => {
      const newMatch = line.match(/^(.+?):(.+?)\s+各(?:数|组|)\s*(\d+)$/);
      if (newMatch) {
        const playType = normalizePlayType(newMatch[1]);
        return playType !== '特码';
      }
      const oldMatch = line.match(/^(.+?)\s+各组\s+(\d+)$/);
      return !!oldMatch;
    });
  });
  toDelete.forEach(r => store.delete(r.id));
  refreshLianxiaoStats();
  showToast('已清空全部其他订单');
}

// ===== 操作日志函数 (restored from original) =====

async function showOperationLog() {
  if (document.getElementById('operationLogWin')) return;
  const allLogs = await getAllLogs();
  allLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  window._allLogs = allLogs; window._logPage = 0; window._logPageSize = 50;
  const win = document.createElement('div'); win.className = 'floating-window'; win.id = 'operationLogWin';
  win.style.width = '800px'; win.style.height = '600px'; win.style.left = '50%'; win.style.top = '50%'; win.style.transform = 'translate(-50%, -50%)';
  let html = '<div class="modal-header"><h3>📋 操作日志</h3><div class="window-controls"><button onclick="maximizeWindow(\'operationLogWin\')">🗖</button><button onclick="document.getElementById(\'operationLogWin\').remove()">×</button></div></div>';
  html += '<div class="modal-body" style="display:flex; flex-direction:column; height: calc(100% - 60px);">';
  html += '<div style="margin-bottom:10px;display:flex;gap:12px;align-items:center;position:sticky;top:0;background:rgba(255,255,255,0.9);z-index:2;padding:5px 0;">';
  html += '<select id="logTypeFilter" onchange="filterOperationLog()" style="padding:4px 8px;border-radius:4px;border:1px solid #ccc;"><option value="all">全部操作</option><option value="save_order">保存订单</option><option value="save_report">保存上报</option><option value="delete_order">删除订单</option><option value="delete_report">删除上报</option><option value="restore">恢复记录</option><option value="permanent_delete">彻底删除</option><option value="reset">清空数据</option><option value="export">导出数据</option><option value="import">导入数据</option><option value="switch">切换地区</option><option value="login">登录</option></select>';
  html += '<input type="date" id="logDateFilter" onchange="filterOperationLog()" style="padding:4px 8px;border-radius:4px;border:1px solid #ccc;" value="' + getTodayCST() + '">';
  html += '<button onclick="filterOperationLog()" style="padding:4px 12px;background:#007bff;color:#fff;border:none;border-radius:4px;">筛选</button>';
  html += '<button onclick="clearOperationLog()" style="padding:6px 12px;background:#e74c3c;color:#fff;border:none;border-radius:4px;margin-left:auto;">清除全部日志</button></div>';
  html += '<div id="operationLogList" style="flex:1; overflow-y:auto;"></div></div>';
  win.innerHTML = html; document.body.appendChild(win);
  makeWindowDraggable('operationLogWin'); highestZ += 1; win.style.zIndex = highestZ;
  showFloatingWinOverlay('operationLogWin');
  updateLogCount(); renderLogPage();
}

function renderLogPage() {
  const container = document.getElementById('operationLogList');
  if (!container) return;
  const filter = document.getElementById('logTypeFilter')?.value || 'all';
  const dateFilter = document.getElementById('logDateFilter')?.value || '';
  let filteredLogs = window._allLogs || [];
  if (filter !== 'all') filteredLogs = filteredLogs.filter(log => log.action === filter);
  if (dateFilter) filteredLogs = filteredLogs.filter(log => log.timestamp.slice(0, 10) === dateFilter);
  const pageSize = window._logPageSize; const start = 0;
  const pageLogs = filteredLogs.slice(start, start + pageSize);
  const actionLabels = { 'save_order':'保存订单','save_report':'保存上报','delete_order':'删除订单','delete_report':'删除上报','restore':'恢复记录','permanent_delete':'彻底删除','reset':'清空数据','export':'导出数据','import':'导入数据','switch':'切换地区','login':'登录','logout':'退出登录' };
  const actionColors = { 'save_order':'log-type-save','save_report':'log-type-save','delete_order':'log-type-delete','delete_report':'log-type-delete','restore':'log-type-restore','permanent_delete':'log-type-delete','reset':'log-type-reset','export':'log-type-export','import':'log-type-export','switch':'log-type-switch','login':'log-type-login','logout':'log-type-login' };
  let html = '';
  if (pageLogs.length === 0) { html = '<div style="padding:20px;text-align:center;color:#666;">暂无操作日志</div>'; }
  else {
    pageLogs.forEach(log => {
      const ts = formatTimestampToCST(log.timestamp);
      const actionLabel = actionLabels[log.action] || log.action;
      const colorClass = actionColors[log.action] || 'log-type-login';
      const orderContent = log.detail || ''; const orderUser = log.orderUser || ''; const orderTotal = log.orderTotal || 0;
      html += '<div class="order-item log-item" data-date="' + log.timestamp.slice(0,10) + '" data-action="' + log.action + '"><div class="order-content">' + orderContent.replace(/\n/g,'<br>') + '</div><div class="order-info"><span class="order-total" style="color:#000;">' + (orderTotal>0?'合计：'+orderTotal:'') + '</span><span class="order-meta"><span style="color:#2980b9;">' + (orderUser?'用户：'+orderUser:'') + '</span> &nbsp; <span class="log-type-tag ' + colorClass + '">' + actionLabel + '</span> &nbsp; ' + ts + '</span></div></div>';
    });
    if (start + pageSize < filteredLogs.length) {
      html += '<div style="text-align:center;padding:10px;" id="loadMoreBtn"><button onclick="loadMoreLogs()" style="padding:6px 20px;background:#007bff;color:#fff;border:none;border-radius:4px;cursor:pointer;">加载更多（' + (start+pageSize) + '/' + filteredLogs.length + '）</button></div>';
    }
  }
  container.innerHTML = html;
}

function loadMoreLogs() {
  window._logPage = (window._logPage || 0) + 1;
  const container = document.getElementById('operationLogList'); if (!container) return;
  const filter = document.getElementById('logTypeFilter')?.value || 'all';
  const dateFilter = document.getElementById('logDateFilter')?.value || '';
  let filteredLogs = window._allLogs || [];
  if (filter !== 'all') filteredLogs = filteredLogs.filter(log => log.action === filter);
  if (dateFilter) filteredLogs = filteredLogs.filter(log => log.timestamp.slice(0, 10) === dateFilter);
  const pageSize = window._logPageSize; const currentPage = window._logPage;
  const start = currentPage * pageSize; const pageLogs = filteredLogs.slice(start, start + pageSize);
  const actionLabels = { 'save_order':'保存订单','save_report':'保存上报','delete_order':'删除订单','delete_report':'删除上报','restore':'恢复记录','permanent_delete':'彻底删除','reset':'清空数据','export':'导出数据','import':'导入数据','switch':'切换地区','login':'登录','logout':'退出登录' };
  const actionColors = { 'save_order':'log-type-save','save_report':'log-type-save','delete_order':'log-type-delete','delete_report':'log-type-delete','restore':'log-type-restore','permanent_delete':'log-type-delete','reset':'log-type-reset','export':'log-type-export','import':'log-type-export','switch':'log-type-switch','login':'log-type-login','logout':'log-type-login' };
  const oldBtn = document.getElementById('loadMoreBtn'); if (oldBtn) oldBtn.remove();
  let html = '';
  pageLogs.forEach(log => {
    const ts = formatTimestampToCST(log.timestamp);
    const actionLabel = actionLabels[log.action] || log.action;
    const colorClass = actionColors[log.action] || 'log-type-login';
    const orderContent = log.detail || ''; const orderUser = log.orderUser || ''; const orderTotal = log.orderTotal || 0;
    html += '<div class="order-item log-item" data-date="' + log.timestamp.slice(0,10) + '" data-action="' + log.action + '"><div class="order-content">' + orderContent.replace(/\n/g,'<br>') + '</div><div class="order-info"><span class="order-total" style="color:#000;">' + (orderTotal>0?'合计：'+orderTotal:'') + '</span><span class="order-meta"><span style="color:#2980b9;">' + (orderUser?'用户：'+orderUser:'') + '</span> &nbsp; <span class="log-type-tag ' + colorClass + '">' + actionLabel + '</span> &nbsp; ' + ts + '</span></div></div>';
  });
  container.insertAdjacentHTML('beforeend', html);
  if (start + pageSize < filteredLogs.length) {
    container.insertAdjacentHTML('beforeend', '<div style="text-align:center;padding:10px;" id="loadMoreBtn"><button onclick="loadMoreLogs()" style="padding:6px 20px;background:#007bff;color:#fff;border:none;border-radius:4px;cursor:pointer;">加载更多（' + (start+pageSize) + '/' + filteredLogs.length + '）</button></div>');
  }
}

function filterOperationLog() { window._logPage = 0; renderLogPage(); }

async function clearOperationLog() {
  if (!(await confirm('确定清除全部操作日志吗？'))) return;
  await clearAllLogs(); await updateLogCount();
  const win = document.getElementById('operationLogWin'); if (win) win.remove();
  showToast('操作日志已清除');
}

// ===== 文本操作函数 (restored from original) =====

function quickAddWithAmount(text, button) { const input = document.querySelector('.source-order-input'); if (!input) return; const lines = input.value.trim().split('\n').filter(l=>l.trim()); const idx = lines.findIndex(l=> l.includes(text) && (l.includes('各数')||l.includes('各号'))); if (idx !== -1) { lines.splice(idx,1); button.classList.remove('active'); } else { lines.push(`${text} 各数 `); button.classList.add('active'); } input.value = lines.join('\n'); performRecognition(input.value); const lastIndex = input.value.lastIndexOf('各数'); if (lastIndex !== -1) { const pos = lastIndex + 2; input.focus(); input.setSelectionRange(pos, pos); } }
function removeSeparators() { const ta = document.querySelector('.source-order-input'); if(!ta) return; const s=ta.selectionStart,e=ta.selectionEnd; if(s===e){showToast('请先选择文本');return;} const sel=ta.value.substring(s,e); const cleaned=sel.replace(/[\s,，.。、+\-*＊\/\\|]+/g,''); ta.value=ta.value.substring(0,s)+cleaned+ta.value.substring(e); performRecognition(ta.value); }

function replaceSeparators() { const ta=document.querySelector('.source-order-input'); if(!ta) return; const s=ta.selectionStart,e=ta.selectionEnd; if(s===e){showToast('请先选择文本');return;} const sel=ta.value.substring(s,e); const replaced=sel.replace(/[\s,，.。、+\-*＊\/\\|]+/g,'-'); ta.value=ta.value.substring(0,s)+replaced+ta.value.substring(e); performRecognition(ta.value); }

// ===== 其他UI函数 (restored from original) =====

function switchRiskReport() {
  const val = document.getElementById('riskReportSwitcher').value;
  document.querySelectorAll('#riskTable .selected-row, #reportTable .selected-row').forEach(el => el.classList.remove('selected-row'));
  if (val === 'total') {
    document.getElementById('riskSection').style.display = '';
    document.getElementById('reportSection').style.display = 'none';
    document.getElementById('viewUserSelect').style.display = 'none';
  } else if (val === 'user') {
    document.getElementById('riskSection').style.display = '';
    document.getElementById('reportSection').style.display = 'none';
    document.getElementById('viewUserSelect').style.display = 'inline-block';
  } else if (val === 'report') {
    document.getElementById('riskSection').style.display = 'none';
    document.getElementById('reportSection').style.display = '';
  }
  updateTableFromRecords();
}

function processCurrentOrder(input, user, isNormal, date = null) {
  const lines = input.split('\n').filter(l => l.trim());
  let orderCount = 0;
  lines.forEach(line => { const match = line.match(/^\d{1,2}[.\、]/); if (match) orderCount++; });
  if (orderCount === 0) { lines.forEach(line => { const items = line.split(/[\s,，]+/).filter(i => i.trim()); if (items.length > 0) orderCount++; }); }
  return orderCount;
}

function onDrawInputPlain(idx) {
  const input = document.getElementById('drawNum' + idx);
  if (!input) return;
  let val = input.value.replace(/\D/g, '');
  if (val.length > 2) val = val.slice(0, 2);
  input.value = val;
  if (val.length === 2) {
    const num = parseInt(val);
    if (num >= 1 && num <= 49) {
      input.style.color = 'black';
    } else {
      input.style.color = 'red';
    }
  }
  if (idx < 7) {
    const next = document.getElementById('drawNum' + (idx + 1));
    if (next && val.length === 2) {
      const num = parseInt(val);
      if (num >= 1 && num <= 49) next.focus();
    }
  }
}

function enableDrawEdit() {
  window._lianxiaoEditEnabled = true;
  document.querySelectorAll('.draw-number-input').forEach(el => el.disabled = false);
  showToast('已启用编辑模式');
}

async function saveDrawNumbers() {
  const numbers = [];
  for (let i = 1; i <= 7; i++) {
    const input = document.getElementById('drawNum' + i);
    if (input) {
      const val = input.value.trim();
      if (/^\d{1,2}$/.test(val) && parseInt(val) >= 1 && parseInt(val) <= 49) {
        numbers.push(parseInt(val).toString().padStart(2, '0'));
      } else {
        numbers.push('');
      }
    }
  }
  if (numbers.some(n => n === '')) { showToast('请填写完整7个开奖号码'); return; }
  const fd = document.getElementById('filterDate')?.value || getTodayCST();
  let year = new Date().getFullYear(); const m = fd.match(/^(\d{4})/); if (m) year = parseInt(m[1]);
  const storageKey = `comboDrawRecord_${currentRegion}_${year}`;
  let savedData = {}; try { savedData = JSON.parse(localStorage.getItem(storageKey) || '{}'); } catch(e) {}
  const issueNumber = getCurrentIssueNumber(year, fd);
  if (!issueNumber) { showToast('无效日期'); return; }
  const issueId = issueNumber.toString().padStart(2, '0');
  savedData[issueId] = { numbers: numbers };
  localStorage.setItem(storageKey, JSON.stringify(savedData));
  showToast('开奖号码已保存');
  refreshLianxiaoStats();
}

function updatePrizeStats(pn) {}

function checkAll() { document.querySelectorAll('.order-check').forEach(cb => cb.checked = true); }
function uncheckAll() { document.querySelectorAll('.order-check').forEach(cb => cb.checked = false); }
function checkAllReport() { document.querySelectorAll('.report-order-check').forEach(cb => cb.checked = true); }
function uncheckAllReport() { document.querySelectorAll('.report-order-check').forEach(cb => cb.checked = false); }

async function resetTable() {
  if (resetLock) return; resetLock = true;
  try {
    const regionName = currentRegion === 'macau' ? '澳门' : currentRegion === 'hongkong' ? '香港' : '粤港';
    const confirmed = await confirm(`确定清空当前地区（${regionName}）的所有订单和上报数据吗？此操作不可恢复。`);
    if (!confirmed) { resetLock = false; return; }
    const pwd = await prompt('输入清空密码：', '');
    if (pwd !== PASSWORD) { await alert('密码错误'); resetLock = false; return; }
    clearMemoryData();
    await clearAllOrderRecordsFromIDB(currentRegion);
    await clearAllReportOrderRecordsFromIDB(currentRegion);
    await clearAllComboOrderRecordsFromIDB(currentRegion);
    for (let i = localStorage.length - 1; i >= 0; i--) { const key = localStorage.key(i); if (key && key.startsWith(`pingtexiao_${currentRegion}_`)) localStorage.removeItem(key); if (key && key.startsWith(`ptHighlight_${currentRegion}_`)) localStorage.removeItem(key); }
    renderAllTablesPlaceholder(); calculateStorageUsage(); updateAmountDisplays(); renderPingtexiaoTable();
    addOperationLog('reset', `清空${regionName}所有订单和上报记录`); showToast(`已清空${regionName}的所有订单和上报记录`);
  } catch(e) {} finally { resetLock = false; }
}

async function pasteOrder() { try { const text = await navigator.clipboard.readText(); if(text) { const si = document.querySelector('.source-order-input'); if(si) { si.value = text; performRecognition(text); } } } catch(err) { showToast('无法访问剪贴板'); } }

function fillPingtexiao() { const resultEl = document.getElementById('orderResult'); if (!resultEl) { showToast('识别结果为空'); return; } const text = resultEl.innerText.trim(); if (!text) { showToast('识别结果为空'); return; } const lines = text.split('\n'); const zodiacAmounts = {}; lines.forEach(line => { const { zodiacs, amount } = countItemsInLine(line); if (zodiacs.length > 0 && amount > 0) { zodiacs.forEach(z => { zodiacAmounts[z] = (zodiacAmounts[z] || 0) + amount; }); } }); const matchedZodiacs = Object.keys(zodiacAmounts); if (matchedZodiacs.length === 0) { showToast('未找到生肖数据'); return; } const data = getPingtexiaoData(); matchedZodiacs.forEach(z => { if (!data[z]) data[z] = { amount: '', report: '' }; const oldAmount = parseFloat(data[z].amount) || 0; data[z].amount = (oldAmount + zodiacAmounts[z]).toString(); }); savePingtexiaoData(data); renderPingtexiaoTable(); updatePingtexiaoTotal(); const si = document.querySelector('.source-order-input'); if (si) si.value = ''; if (resultEl) resultEl.innerHTML = ''; updateOrderTotalDisplay(); showToast('已填充 ' + matchedZodiacs.length + ' 个生肖到平特肖'); }

function getPingtexiaoKey() { const fd = document.getElementById('filterDate')?.value || getTodayCST(); return 'pingtexiao_' + currentRegion + '_' + fd; }

function finishPtEdit(input) { if (input.hasAttribute('readonly')) return; input.setAttribute('readonly', 'readonly'); input.style.border = '1px solid transparent'; input.style.background = 'transparent'; updatePtRemain(input); savePingtexiaoCell(); }
function updatePtRemain(input) { const row = input.closest('tr'); if (!row) return; const zodiac = input.dataset.zodiac; const cells = row.cells; let amountVal = '', reportVal = ''; for (let i = 0; i < cells.length; i++) { const amountInput = cells[i].querySelector('.pt-edit-input[data-zodiac="' + zodiac + '"][data-field="amount"]'); if (amountInput) { amountVal = amountInput.value.trim(); const reportInput = cells[i+1].querySelector('.pt-edit-input[data-zodiac="' + zodiac + '"][data-field="report"]'); if (reportInput) reportVal = reportInput.value.trim(); const remainCell = cells[i+2]; if (remainCell) { const a = amountVal !== '' ? parseFloat(amountVal) : 0; const r = reportVal !== '' ? parseFloat(reportVal) : 0; remainCell.textContent = amountVal !== '' ? (a - r) : ''; } break; } } updatePingtexiaoTotal(); }
function savePingtexiaoCell() { const data = getPingtexiaoData(); document.querySelectorAll('.pt-edit-input[data-field="amount"]').forEach(input => { const zodiac = input.dataset.zodiac; if (!data[zodiac]) data[zodiac] = { amount: '', report: '' }; data[zodiac].amount = input.value.trim(); }); document.querySelectorAll('.pt-edit-input[data-field="report"]').forEach(input => { const zodiac = input.dataset.zodiac; if (!data[zodiac]) data[zodiac] = { amount: '', report: '' }; data[zodiac].report = input.value.trim(); }); savePingtexiaoData(data); updatePingtexiaoTotal(); }

// ===== 自定义前后缀管理 (restored from original) =====

function getCustomPrefixes() { try { return JSON.parse(localStorage.getItem('customPrefixes') || '[]'); } catch (e) { return []; } }
function getCustomSuffixes() { try { return JSON.parse(localStorage.getItem('customSuffixes') || '[]'); } catch (e) { return []; } }
function getCustomAmountPrefixes() { try { return JSON.parse(localStorage.getItem('customAmountPrefixes') || '[]'); } catch (e) { return []; } }
function saveCustomAmountPrefixes(list) { localStorage.setItem('customAmountPrefixes', JSON.stringify(list)); }

function renderPrefixList(){ const p=getCustomPrefixes(); const c=document.getElementById('prefixList'); if(!c)return; c.innerHTML=p.length===0?'<div style="text-align:center;color:#666;padding:10px;">暂无自定义前缀</div>':p.map((x,i)=>'<div class="replace-preset-item"><span>' + x + '</span><button onclick="deletePrefix(' + i + ')" style="margin-left:auto;padding:2px 8px;background:#e74c3c;color:#fff;border:none;border-radius:3px;">删除</button></div>').join(''); }

async function addPrefix(){ const v=document.getElementById('newPrefix')?.value.trim(); if(!v){showToast('请输入前缀');return;} const p=getCustomPrefixes(); if(p.includes(v)){showToast('已存在');return;} p.push(v); localStorage.setItem('customPrefixes',JSON.stringify(p)); document.getElementById('newPrefix').value=''; renderPrefixList(); }

async function deletePrefix(i){ if(!(await confirm('确定删除？')))return; const p=getCustomPrefixes(); p.splice(i,1); localStorage.setItem('customPrefixes',JSON.stringify(p)); renderPrefixList(); }

function renderAmountPrefixList() { const list = getCustomAmountPrefixes(); const container = document.getElementById('amountPrefixList'); if(!container)return; container.innerHTML = list.length===0 ? '<div style="text-align:center;color:#666;padding:10px;">暂无自定义金额前缀</div>' : list.map((x,i) => '<div class="replace-preset-item"><span>' + x + '</span><button onclick="deleteAmountPrefix(' + i + ')" style="margin-left:auto;padding:2px 8px;background:#e74c3c;color:#fff;border:none;border-radius:3px;">删除</button></div>').join(''); }

async function addAmountPrefix() { const v = document.getElementById('newAmountPrefix')?.value.trim(); if(!v){ showToast('请输入金额前缀'); return; } const list = getCustomAmountPrefixes(); if(list.includes(v)){ showToast('已存在'); return; } list.push(v); saveCustomAmountPrefixes(list); document.getElementById('newAmountPrefix').value = ''; renderAmountPrefixList(); showToast('已添加（即时生效）'); }

async function deleteAmountPrefix(i) { if(!(await confirm('确定删除？')))return; const list = getCustomAmountPrefixes(); list.splice(i,1); saveCustomAmountPrefixes(list); renderAmountPrefixList(); }

function renderAmountSuffixList(){ const s=getCustomAmountSuffixes(); const c=document.getElementById('amountSuffixList'); if(!c)return; c.innerHTML=s.length===0?'<div style="text-align:center;color:#666;padding:10px;">暂无自定义金额后缀</div>':s.map((x,i)=>'<div class="replace-preset-item"><span>' + x + '</span><button onclick="deleteAmountSuffix(' + i + ')" style="margin-left:auto;padding:2px 8px;background:#e74c3c;color:#fff;border:none;border-radius:3px;">删除</button></div>').join(''); }

async function addAmountSuffix(){ const v=document.getElementById('newAmountSuffix')?.value.trim(); if(!v){showToast('请输入后缀');return;} const s=getCustomAmountSuffixes(); if(s.includes(v)){showToast('已存在');return;} s.push(v); localStorage.setItem('customAmountSuffixes',JSON.stringify(s)); document.getElementById('newAmountSuffix').value=''; renderAmountSuffixList(); }

async function deleteAmountSuffix(i){ if(!(await confirm('确定删除？')))return; const s=getCustomAmountSuffixes(); s.splice(i,1); localStorage.setItem('customAmountSuffixes',JSON.stringify(s)); renderAmountSuffixList(); }

// ===== 前缀管理窗口 (restored from original) =====
function showPrefixManager() { if(document.getElementById('prefixWin'))return; const prefixes=getCustomPrefixes(); const w=document.createElement('div'); w.className='floating-window'; w.id='prefixWin'; w.style.width='500px'; w.style.height='400px'; w.style.left='50%'; w.style.top='50%'; w.style.transform='translate(-50%,-50%)'; w.innerHTML='<div class="modal-header"><h3>前缀管理</h3><div class="window-controls"><button onclick="maximizeWindow(\'prefixWin\')">🗖</button><button onclick="document.getElementById(\'prefixWin\').remove()">×</button></div></div><div class="modal-body"><div style="margin-bottom:12px;display:flex;gap:6px;"><input type="text" id="newPrefix" placeholder="新增行首忽略词" style="flex:1;padding:6px;border:1px solid #ccc;border-radius:4px;"><button onclick="addPrefix()" style="padding:6px 12px;background:#3498db;color:#fff;border:none;border-radius:4px;">添加</button></div><div id="prefixList"></div></div><div class="modal-footer"><button onclick="document.getElementById(\'prefixWin\').remove()" style="padding:8px 16px;background:#6c757d;color:#fff;border:none;border-radius:4px;">关闭</button></div>'; document.body.appendChild(w); renderPrefixList(); makeWindowDraggable('prefixWin'); highestZ+=1; w.style.zIndex=highestZ;
  document.getElementById('newPrefix').addEventListener('keypress', (e) => { if (e.key === 'Enter') { addPrefix(); } });
}

// ===== 金额前缀管理窗口 (restored from original) =====
function showAmountPrefixManager() { if(document.getElementById('amountPrefixWin'))return; const list = getCustomAmountPrefixes(); const w=document.createElement('div'); w.className='floating-window'; w.id='amountPrefixWin'; w.style.width='500px'; w.style.height='450px'; w.style.left='50%'; w.style.top='50%'; w.style.transform='translate(-50%,-50%)'; w.innerHTML='<div class="modal-header"><h3>金额前缀管理</h3><div class="window-controls"><button onclick="maximizeWindow(\'amountPrefixWin\')">🗖</button><button onclick="document.getElementById(\'amountPrefixWin\').remove()">×</button></div></div><div class="modal-body"><div style="margin-bottom:12px;display:flex;gap:6px;"><input type="text" id="newAmountPrefix" placeholder="新增金额前缀（如 投、买）" style="flex:1;padding:6px;border:1px solid #ccc;border-radius:4px;"><button onclick="addAmountPrefix()" style="padding:6px 12px;background:#e67e22;color:#fff;border:none;border-radius:4px;">添加</button></div><div id="amountPrefixList"></div></div><div class="modal-footer"><button onclick="document.getElementById(\'amountPrefixWin\').remove()" style="padding:8px 16px;background:#6c757d;color:#fff;border:none;border-radius:4px;">关闭</button></div>'; document.body.appendChild(w); renderAmountPrefixList(); makeWindowDraggable('amountPrefixWin'); highestZ+=1; w.style.zIndex=highestZ;
  document.getElementById('newAmountPrefix').addEventListener('keypress', (e) => { if (e.key === 'Enter') { addAmountPrefix(); } });
}

// ===== 金额后缀管理窗口 (restored from original) =====
function showAmountSuffixManager() { if(document.getElementById('amountSuffixWin'))return; const s=getCustomAmountSuffixes(); const w=document.createElement('div'); w.className='floating-window'; w.id='amountSuffixWin'; w.style.width='500px'; w.style.height='400px'; w.style.left='50%'; w.style.top='50%'; w.style.transform='translate(-50%,-50%)'; w.innerHTML='<div class="modal-header"><h3>金额后缀管理</h3><div class="window-controls"><button onclick="maximizeWindow(\'amountSuffixWin\')">🗖</button><button onclick="document.getElementById(\'amountSuffixWin\').remove()">×</button></div></div><div class="modal-body"><div style="margin-bottom:12px;display:flex;gap:6px;"><input type="text" id="newAmountSuffix" placeholder="新增后缀(如米、斤)" style="flex:1;padding:6px;border:1px solid #ccc;border-radius:4px;"><button onclick="addAmountSuffix()" style="padding:6px 12px;background:#e67e22;color:#fff;border:none;border-radius:4px;">添加</button></div><div id="amountSuffixList"></div></div><div class="modal-footer"><button onclick="document.getElementById(\'amountSuffixWin\').remove()" style="padding:8px 16px;background:#6c757d;color:#fff;border:none;border-radius:4px;">关闭</button></div>'; document.body.appendChild(w); renderAmountSuffixList(); makeWindowDraggable('amountSuffixWin'); highestZ+=1; w.style.zIndex=highestZ;
  document.getElementById('newAmountSuffix').addEventListener('keypress', (e) => { if (e.key === 'Enter') { addAmountSuffix(); } });
}

// ===== 分类缩写管理 (restored from original) =====

function showCategoryAliases() { if(document.getElementById('categoryAliasWin'))return; const a=getCategoryAliases(); const w=document.createElement('div'); w.className='floating-window'; w.id='categoryAliasWin'; w.style.width='500px'; w.style.height='450px'; w.style.left='50%'; w.style.top='50%'; w.style.transform='translate(-50%,-50%)'; w.innerHTML='<div class="modal-header"><h3>分类缩写</h3><div class="window-controls"><button onclick="maximizeWindow(\'categoryAliasWin\')">🗖</button><button onclick="document.getElementById(\'categoryAliasWin\').remove()">×</button></div></div><div class="modal-body"><div style="margin-bottom:12px;"><div style="display:flex;gap:6px;margin-bottom:8px;"><input type="text" id="aliasOld" placeholder="缩写（如 红蓝波）" style="flex:1;padding:6px;border:1px solid #ccc;border-radius:4px;"><span style="align-self:center;">→</span><input type="text" id="aliasNew" placeholder="正规分类（如 红波-蓝波）" style="flex:1;padding:6px;border:1px solid #ccc;border-radius:4px;"></div><button onclick="addCategoryAlias()" style="padding:6px 12px;background:#007bff;color:#fff;border:none;border-radius:4px;">添加</button></div><div id="aliasList"></div></div><div class="modal-footer"><button onclick="document.getElementById(\'categoryAliasWin\').remove()" style="padding:8px 16px;background:#6c757d;color:#fff;border:none;border-radius:4px;">关闭</button></div>'; document.body.appendChild(w); renderAliasList(); makeWindowDraggable('categoryAliasWin'); highestZ+=1; w.style.zIndex=highestZ;
  document.getElementById('aliasOld').addEventListener('keypress', (e) => { if (e.key === 'Enter') { document.getElementById('aliasNew').focus(); } });
  document.getElementById('aliasNew').addEventListener('keypress', (e) => { if (e.key === 'Enter') { addCategoryAlias(); } });
}

function renderAliasList(){ const a=getCategoryAliases(); const c=document.getElementById('aliasList'); if(!c)return; c.innerHTML=a.length===0?'<div style="text-align:center;color:#666;padding:10px;">暂无分类缩写</div>':a.map((x,i)=>'<div class="replace-preset-item"><span>' + x.alias + ' → ' + x.target + '</span><button onclick="deleteCategoryAlias(' + i + ')" style="margin-left:auto;padding:2px 8px;background:#e74c3c;color:#fff;border:none;border-radius:3px;">删除</button></div>').join(''); }

async function addCategoryAlias(){ const alias=document.getElementById('aliasOld')?.value.trim(); const target=document.getElementById('aliasNew')?.value.trim(); if(!alias||!target){showToast('请输入缩写和目标分类');return;} const a=getCategoryAliases(); if(a.some(x=>x.alias===alias)){showToast('该缩写已存在');return;} a.push({alias,target}); a.sort((x,y)=>y.alias.length-x.alias.length); localStorage.setItem('categoryAliases',JSON.stringify(a)); document.getElementById('aliasOld').value=''; document.getElementById('aliasNew').value=''; renderAliasList(); }

async function deleteCategoryAlias(i){ if(!(await confirm('确定删除？')))return; const a=getCategoryAliases(); a.splice(i,1); localStorage.setItem('categoryAliases',JSON.stringify(a)); renderAliasList(); }

// ===== 替换预设管理 (restored from original) =====

function showReplacePreset() {
  if(document.getElementById('replacePresetWin'))return; const p=getReplacePresets();
  const w=document.createElement('div'); w.className='floating-window'; w.id='replacePresetWin';
  w.style.width='500px'; w.style.height='450px'; w.style.left='50%'; w.style.top='50%'; w.style.transform='translate(-50%,-50%)';
  w.innerHTML='<div class="modal-header"><h3>替换预设</h3><div style="display:flex;align-items:center;gap:8px;margin-left:auto;"><button onclick="resetPresetsToDefault()" title="恢复默认预设" style="background:rgba(255,255,255,0.2);border:none;color:#fff;width:28px;height:28px;border-radius:4px;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;">🔄</button><div class="window-controls"><button onclick="maximizeWindow(\'replacePresetWin\')">🗖</button><button onclick="document.getElementById(\'replacePresetWin\').remove()">×</button></div></div></div><div class="modal-body"><div style="margin-bottom:12px;"><div style="display:flex;gap:6px;margin-bottom:8px;"><input type="text" id="presetOld" placeholder="原文字" style="flex:1;padding:6px;border:1px solid #ccc;border-radius:4px;"><span style="align-self:center;">→</span><input type="text" id="presetNew" placeholder="替换为" style="flex:1;padding:6px;border:1px solid #ccc;border-radius:4px;"></div><button onclick="addReplacePreset()" style="padding:6px 12px;background:#007bff;color:#fff;border:none;border-radius:4px;">添加</button></div><div id="presetList"></div></div><div class="modal-footer"><button onclick="document.getElementById(\'replacePresetWin\').remove()" style="padding:8px 16px;background:#6c757d;color:#fff;border:none;border-radius:4px;">关闭</button></div>';
  document.body.appendChild(w); renderPresetList(); makeWindowDraggable('replacePresetWin'); highestZ+=1; w.style.zIndex=highestZ;
  document.getElementById('presetOld').addEventListener('keypress', (e) => { if (e.key === 'Enter') { document.getElementById('presetNew').focus(); } });
  document.getElementById('presetNew').addEventListener('keypress', (e) => { if (e.key === 'Enter') { addReplacePreset(); } });
}

function renderPresetList(){ const p=getReplacePresets(); const c=document.getElementById('presetList'); if(!c)return; c.innerHTML=p.length===0?'<div style="text-align:center;color:#666;padding:10px;">暂无替换预设</div>':p.map((x,i)=>'<div class="replace-preset-item"><span>' + x.old + ' → ' + x.new + '</span><button onclick="deleteReplacePreset(' + i + ')" style="margin-left:auto;padding:2px 8px;background:#e74c3c;color:#fff;border:none;border-radius:3px;">删除</button></div>').join(''); }

async function addReplacePreset(){ const o=document.getElementById('presetOld')?.value.trim(); const n=document.getElementById('presetNew')?.value.trim(); if(!o||!n){showToast('请输入原文字和替换文字');return;} const p=getReplacePresets(); if(p.some(x=>x.old===o)){showToast('已存在');return;} p.push({old:o,new:n}); localStorage.setItem('replacePresets',JSON.stringify(p)); document.getElementById('presetOld').value=''; document.getElementById('presetNew').value=''; renderPresetList(); }

async function deleteReplacePreset(i){ if(!(await confirm('确定删除？')))return; const p=getReplacePresets(); p.splice(i,1); localStorage.setItem('replacePresets',JSON.stringify(p)); renderPresetList(); }

async function resetPresetsToDefault(){
  if(!(await confirm('确定恢复替换预设和分类缩写为默认值吗？当前自定义数据将被覆盖。')))return;
  const defaultPresets=[{"old":"兰","new":"蓝"},{"old":"录","new":"绿"},{"old":"碌","new":"绿"},{"old":"禄","new":"绿"},{"old":"拦","new":"蓝"},{"old":"篮","new":"蓝"},{"old":"免","new":"兔"},{"old":"午","new":"牛"},{"old":"侯","new":"猴"},{"old":"㺅","new":"猴"},{"old":"名","new":"各"}];
  const defaultAliases=[{"alias":"红色","target":"红波"},{"alias":"蓝色","target":"蓝波"},{"alias":"绿色","target":"绿波"},{"alias":"兰波","target":"蓝波"},{"alias":"录波","target":"绿波"},{"alias":"金行","target":"金"},{"alias":"木行","target":"木"},{"alias":"水行","target":"水"},{"alias":"火行","target":"火"},{"alias":"土行","target":"土"},{"alias":"红蓝","target":"红波-蓝波"},{"alias":"红绿","target":"红波-绿波"},{"alias":"蓝绿","target":"蓝波-绿波"},{"alias":"火土","target":"火-土"},{"alias":"红蓝波","target":"红波-蓝波"},{"alias":"红绿波","target":"红波-绿波"},{"alias":"蓝绿波","target":"蓝波-绿波"},{"alias":"大单小双","target":"大单-小双"},{"alias":"大双小单","target":"大双-小单"},{"alias":"金木水","target":"金-木-水"},{"alias":"家肖","target":"家禽"},{"alias":"野肖","target":"野兽"},{"alias":"号各","target":"各号"},{"alias":"小数","target":"小"},{"alias":"大数","target":"大"},{"alias":"合单","target":"合数单"},{"alias":"合双","target":"合数双"},{"alias":"大尾","target":"尾大"},{"alias":"小尾","target":"尾小"},{"alias":"大数单","target":"大单"},{"alias":"大数双","target":"大双"},{"alias":"小数单","target":"小单"},{"alias":"小数双","target":"小双"},{"alias":"红波单","target":"红单"},{"alias":"红波双","target":"红双"},{"alias":"蓝波单","target":"蓝单"},{"alias":"蓝波双","target":"蓝双"},{"alias":"绿波单","target":"绿单"},{"alias":"绿波双","target":"绿双"},{"alias":"老虎","target":"虎"},{"alias":"老鼠","target":"鼠"},{"alias":"兔子","target":"兔"},{"alias":"大号","target":"大"},{"alias":"小号","target":"小"}];
  localStorage.setItem('replacePresets',JSON.stringify(defaultPresets));
  localStorage.setItem('categoryAliases',JSON.stringify(defaultAliases));
  renderPresetList(); showToast('已恢复默认替换预设和分类缩写');
}

function semanticReplace() { 
  const ta=document.querySelector('.source-order-input'); 
  if(!ta)return; 
  const s=ta.selectionStart,e=ta.selectionEnd; 
  if(s===e){showToast('请先选择文本');return;} 
  const sel=ta.value.substring(s,e).trim(); 
  if(!sel){showToast('请先选择文本');return;}

  function expandToNums(text) {
    const resultNums = new Set();
    if (!text || !text.trim()) return resultNums;
    const headRegex = /([\d\s,，.。、+\-*＊\/\\|]+)头/g;
    let headMatch;
    while ((headMatch = headRegex.exec(text)) !== null) {
      const digits = headMatch[1].match(/\d/g);
      if (digits) {
        digits.forEach(d => {
          const key = d + '头';
          if (D[key]) { D[key].split(/[\s,，]+/).forEach(n => { if (n.trim()) resultNums.add(n.trim().padStart(2, '0')); }); }
        });
      }
    }
    const tailRegex = /([\d\s,，.。、+\-*＊\/\\|]+)尾/g;
    let tailMatch;
    while ((tailMatch = tailRegex.exec(text)) !== null) {
      const digits = tailMatch[1].match(/\d/g);
      if (digits) {
        digits.forEach(d => {
          const key = d + '尾';
          if (D[key]) { D[key].split(/[\s,，]+/).forEach(n => { if (n.trim()) resultNums.add(n.trim().padStart(2, '0')); }); }
        });
      }
    }
    const cleanedText = text.replace(/([\d\s,，.。、+\-*＊\/\\|]+)头/g, '').replace(/([\d\s,，.。、+\-*＊\/\\|]+)尾/g, '');
    const tokens = cleanedText.split(/[\s,，.。、+\-*＊\/\\|]+/).filter(t => t.trim());
    tokens.forEach(token => {
      let matched = false;
      const allDictKeys = Object.keys(D).filter(k => !/^\d+$/.test(k) && !/^\d{2}$/.test(k) && k.length > 1);
      allDictKeys.sort((a, b) => b.length - a.length);
      for (const key of allDictKeys) {
        if (token.includes(key)) {
          const nums = keyToAllNums(key);
          nums.forEach(n => resultNums.add(n.padStart(2, '0')));
          matched = true; break;
        }
      }
      if (!matched) {
        for (const ch of token) {
          if (ZODIAC_NUMS[ch]) {
            ZODIAC_NUMS[ch].split(/[\s,，]+/).forEach(n => resultNums.add(n.padStart(2, '0')));
            matched = true;
          }
        }
      }
    });
    return resultNums;
  }

  function extractExcludeNums(text) {
    const nums = new Set();
    const digits = text.match(/\d{1,2}/g);
    if (digits) {
      digits.forEach(d => {
        const intVal = parseInt(d);
        if (intVal >= 1 && intVal <= 49) { nums.add(String(intVal).padStart(2, '0')); }
      });
    }
    return nums;
  }

  let resultNums = new Set();

  if (sel.includes('不要')) {
    const parts = sel.split('不要');
    const beforeText = parts[0] || '';
    const afterText = parts.slice(1).join('不要') || '';
    const includeNums = expandToNums(beforeText);
    const excludeNums = extractExcludeNums(afterText);
    if (includeNums.size === 0) { showToast('未识别到有效分类'); return; }
    includeNums.forEach(n => { if (!excludeNums.has(n)) resultNums.add(n); });
    if (resultNums.size === 0) { showToast('排除后无剩余号码'); return; }
  } else if (sel.includes('的')) {
    const parts = sel.split('的');
    const beforeText = parts[0] || '';
    const afterText = parts.slice(1).join('的') || '';
    const beforeNums = expandToNums(beforeText);
    const afterNums = expandToNums(afterText);
    if (beforeNums.size === 0 || afterNums.size === 0) { showToast('未识别到有效分类'); return; }
    beforeNums.forEach(n => { if (afterNums.has(n)) resultNums.add(n); });
    if (resultNums.size === 0) { showToast('无共同号码'); return; }
  } else {
    const tokens = sel.split(/[\s,，.。、+\-*＊\/\\|]+/).filter(t => t.trim());
    const matched = tokens.filter(t => D[t]);
    if (!matched.length) { showToast('未识别有效分类'); return; }
    let sets = matched.map(cat => { const nums = keyToAllNums(cat); return new Set(nums); });
    let inter = sets[0];
    for (let i = 1; i < sets.length; i++) { inter = new Set([...inter].filter(x => sets[i].has(x))); }
    resultNums = inter;
    if (resultNums.size === 0) { showToast('无共同号码'); return; }
  }

  const sortedNums = [...resultNums].sort((a, b) => parseInt(a) - parseInt(b));
  const str = sortedNums.join('-');
  ta.value = ta.value.substring(0, s) + str + ta.value.substring(e);
  performRecognition(ta.value);
  showToast('语义转换完成：' + str);
}

// ===== 兑奖统计刷新函数 (restored from original) =====

function refreshDuiJiangStats() {
  const orderBody = document.getElementById('duiJiangOrderBody');
  const reportBody = document.getElementById('duiJiangReportBody');
  const finalBody = document.getElementById('duiJiangFinalBody');
  if (!orderBody || !reportBody || !finalBody) return;

  const fd = document.getElementById('filterDate')?.value || getTodayCST();
  let year = new Date().getFullYear(); const m = fd.match(/^(\d{4})/); if (m) year = parseInt(m[1]);
  const storageKey = `comboDrawRecord_${currentRegion}_${year}`;
  let savedData = {}; try { savedData = JSON.parse(localStorage.getItem(storageKey) || '{}'); } catch(e) {}
  const issueNumber = getCurrentIssueNumber(year, fd);
  const issueId = issueNumber ? issueNumber.toString().padStart(2, '0') : '';
  const entry = issueId ? (savedData[issueId] || {}) : {};
  const hasDrawNumbers = entry && entry.numbers && entry.numbers.length > 0;
  const drawNumbers = []; const drawZodiacs = [];
  if (hasDrawNumbers) {
    entry.numbers.forEach(n => { if (n && /^\d{2}$/.test(n) && parseInt(n) >= 1 && parseInt(n) <= 49) { drawNumbers.push(n); const z = currentZodiacMap[n] || ''; if (z) drawZodiacs.push(z); } });
  }
  const hasValidDraw = drawNumbers.length > 0;
  const drawTeMa = drawNumbers[6] || '';
  const drawTeMaZodiac = drawTeMa ? (currentZodiacMap[drawTeMa] || '') : '';

  const allOrdersPromise = getOrderRecords().then(recs => recs.filter(r => r.date === fd && r.region === currentRegion));
  const allReportsPromise = getReportOrderRecords().then(recs => recs.filter(r => r.date === fd && r.region === currentRegion));
  const allComboPromise = getComboOrders().then(recs => recs.filter(r => r.date === fd && r.region === currentRegion));

  Promise.all([allOrdersPromise, allReportsPromise, allComboPromise]).then(([orders, reports, combos]) => {
    const oddsData = getOddsData();
    const drawZodiacsSet = new Set(drawZodiacs);
    const drawNumbersSet = new Set(drawNumbers);
    const drawNumbersZhengma = drawNumbers.slice(0, 6);

    let totalOrderCount = orders.length + combos.length;

    const userStats = {};
    const allRecords = [...orders, ...combos];
    allRecords.forEach(rec => {
      const user = rec.user || '未知';
      if (!userStats[user]) userStats[user] = { orderTotal: 0, orderRebate: 0, orderHitByType: {}, orderPL: 0, reportTotal: 0, reportRebate: 0, reportHitByType: {}, reportPL: 0 };
      const lines = rec.content.split('\n');
      lines.forEach(line => {
        const newMatch = line.match(/^(.+?):(.+?)\s+各(?:数|组|)\s*(\d+)$/);
        if (newMatch) {
          let playType = newMatch[1];
          const content = newMatch[2];
          const amt = parseInt(newMatch[3]) || 0;
          playType = normalizePlayType(playType);
          if (playType === '特肖') {
            processTexiaoLineDuijiang(userStats[user], content, amt, drawTeMaZodiac, drawTeMa, hasValidDraw);
          } else if (playType === '特码') {
            processNormalLineDuijiangNew(userStats[user], content, amt, drawTeMa, hasValidDraw);
          } else if (playType === '特碰') {
            processTepengLineDuijiang(userStats[user], content, amt, drawTeMa, drawNumbersZhengma, hasValidDraw);
          } else if (playType.startsWith('包')) {
            processBaoLineDuijiang(userStats[user], playType, content, amt, drawTeMa, hasValidDraw);
          } else {
            processComboLineDuijiangNew(userStats[user], playType, content, amt, drawZodiacsSet, drawNumbersSet, drawNumbersZhengma, hasValidDraw);
          }
          return;
        }
        const comboMatch = line.match(/^(.+?)\s+各组\s+(\d+)$/);
        if (comboMatch) { processComboLineDuijiangOld(userStats[user], comboMatch, drawZodiacsSet, drawNumbersSet, drawNumbersZhengma, drawTeMa, hasValidDraw); return; }
        const normalMatch = line.match(/^(.+?)\s+各数\s+(\d+)$/);
        if (normalMatch) { processNormalLineDuijiangOld(userStats[user], normalMatch, drawTeMa, hasValidDraw); }
      });
    });
    // 上报记录
    reports.forEach(rec => {
      const user = rec.user || '未知';
      if (!userStats[user]) userStats[user] = { orderTotal: 0, orderRebate: 0, orderHitByType: {}, orderPL: 0, reportTotal: 0, reportRebate: 0, reportHitByType: {}, reportPL: 0 };
      const lines = rec.content.split('\n');
      lines.forEach(line => {
        const newMatch = line.match(/^(.+?):(.+?)\s+各(?:数|组|)\s*(\d+)$/);
        if (newMatch) {
          let playType = newMatch[1];
          const content = newMatch[2];
          const amt = parseInt(newMatch[3]) || 0;
          playType = normalizePlayType(playType);
          if (playType === '特肖') {
            processTexiaoLineDuijiangReport(userStats[user], content, amt, drawTeMaZodiac, drawTeMa, hasValidDraw);
          } else if (playType === '特码') {
            processReportLineDuijiangNew(userStats[user], content, amt, drawTeMa, hasValidDraw);
          } else if (playType === '特碰') {
            processTepengLineDuijiangReport(userStats[user], content, amt, drawTeMa, drawNumbersZhengma, hasValidDraw);
          } else if (playType.startsWith('包')) {
            processBaoLineDuijiangReport(userStats[user], playType, content, amt, drawTeMa, hasValidDraw);
          } else {
            processComboLineDuijiangNewReport(userStats[user], playType, content, amt, drawZodiacsSet, drawNumbersSet, drawNumbersZhengma, hasValidDraw);
          }
          return;
        }
        const comboMatch = line.match(/^(.+?)\s+各组\s+(\d+)$/);
        if (comboMatch) { processComboLineDuijiangOldReport(userStats[user], comboMatch, drawZodiacsSet, drawNumbersSet, drawNumbersZhengma, drawTeMa, hasValidDraw); return; }
        const normalMatch = line.match(/^(.+?)\s+各数\s+(\d+)$/);
        if (normalMatch) { processReportLineDuijiangOld(userStats[user], normalMatch, drawTeMa, hasValidDraw); }
      });
    });

    const orderCountEl = document.getElementById('duiJiangOrderCount');
    if (orderCountEl) { orderCountEl.textContent = '(共' + totalOrderCount + '单)'; }

    let orderHtml = '', reportHtml = '';
    let sumOrderTotal = 0, sumOrderRebate = 0, sumOrderPL = 0;
    let sumReportTotal = 0, sumReportRebate = 0, sumReportPL = 0;
    let sumOrderHitByType = {}, sumReportHitByType = {};

    const sortedUsers = Object.keys(userStats).sort();
    if (sortedUsers.length === 0) { orderBody.innerHTML = '<tr><td colspan="5">当天无数据</td></tr>'; reportBody.innerHTML = orderBody.innerHTML; finalBody.innerHTML = '<tr><td colspan="4">当天无数据</td></tr>'; return; }
    sortedUsers.forEach(user => {
      const s = userStats[user];
      sumOrderTotal += s.orderTotal; sumOrderRebate += s.orderRebate; sumOrderPL += s.orderPL;
      sumReportTotal += s.reportTotal; sumReportRebate += s.reportRebate; sumReportPL += s.reportPL;
      for (const [type, amt] of Object.entries(s.orderHitByType)) { sumOrderHitByType[type] = (sumOrderHitByType[type] || 0) + amt; }
      for (const [type, amt] of Object.entries(s.reportHitByType)) { sumReportHitByType[type] = (sumReportHitByType[type] || 0) + amt; }

      const orderHitDetail = hasValidDraw ? buildHitDetail(s.orderHitByType) : '';
      const reportHitDetail = hasValidDraw ? buildHitDetail(s.reportHitByType) : '';
      const orderPL = hasValidDraw ? Math.round(s.orderPL) : 0;
      const reportPL = hasValidDraw ? Math.round(s.reportPL) : 0;
      const orderPLColor = orderPL > 0 ? 'color:#008000;' : (orderPL < 0 ? 'color:#ff0000;' : '');
      const reportPLColor = reportPL > 0 ? 'color:#008000;' : (reportPL < 0 ? 'color:#ff0000;' : '');
      orderHtml += '<tr><td>' + user + '</td><td>' + (s.orderTotal > 0 ? s.orderTotal : '') + '</td><td>' + (s.orderRebate > 0 ? Math.round(s.orderRebate) : '') + '</td><td style="color:#ff0000;">' + orderHitDetail + '</td><td style="' + orderPLColor + '">' + (hasValidDraw && orderPL !== 0 ? orderPL : '') + '</td></tr>';
      reportHtml += '<tr><td>' + user + '</td><td>' + (s.reportTotal > 0 ? s.reportTotal : '') + '</td><td>' + (s.reportRebate > 0 ? Math.round(s.reportRebate) : '') + '</td><td style="color:#ff0000;">' + reportHitDetail + '</td><td style="' + reportPLColor + '">' + (hasValidDraw && reportPL !== 0 ? reportPL : '') + '</td></tr>';
    });
    const orderPL = hasValidDraw ? Math.round(sumOrderPL) : 0;
    const reportPL = hasValidDraw ? Math.round(sumReportPL) : 0;
    const orderPLColor = orderPL > 0 ? 'color:#008000;' : (orderPL < 0 ? 'color:#ff0000;' : '');
    const reportPLColor = reportPL > 0 ? 'color:#008000;' : (reportPL < 0 ? 'color:#ff0000;' : '');
    const sumOrderHitDetail = hasValidDraw ? buildHitDetail(sumOrderHitByType) : '';
    const sumReportHitDetail = hasValidDraw ? buildHitDetail(sumReportHitByType) : '';
    orderHtml += '<tr style="background-color:#fef9e7;"><td>所有用户</td><td>' + sumOrderTotal + '</td><td>' + sumOrderRebate + '</td><td style="color:#ff0000;">' + sumOrderHitDetail + '</td><td style="' + orderPLColor + '">' + (hasValidDraw && orderPL !== 0 ? orderPL : '') + '</td></tr>';
    reportHtml += '<tr style="background-color:#fef9e7;"><td>所有用户</td><td>' + sumReportTotal + '</td><td>' + sumReportRebate + '</td><td style="color:#ff0000;">' + sumReportHitDetail + '</td><td style="' + reportPLColor + '">' + (hasValidDraw && reportPL !== 0 ? reportPL : '') + '</td></tr>';
    orderBody.innerHTML = orderHtml; reportBody.innerHTML = reportHtml;
    const netAmount = sumOrderTotal - sumReportTotal;
    const netRebate = Math.round(sumOrderRebate - sumReportRebate);
    const netPL = hasValidDraw ? Math.round(sumOrderPL - sumReportPL) : 0;
    const netPLColor = netPL > 0 ? 'color:#008000;' : (netPL < 0 ? 'color:#ff0000;' : '');
    const netHitByType = {};
    if (hasValidDraw) {
      for (const [type, amt] of Object.entries(sumOrderHitByType)) { netHitByType[type] = (netHitByType[type] || 0) + amt; }
      for (const [type, amt] of Object.entries(sumReportHitByType)) { netHitByType[type] = (netHitByType[type] || 0) - amt; }
    }
    const netHitDetail = hasValidDraw ? buildHitDetail(netHitByType) : '';
    finalBody.innerHTML = '<tr><td>' + (netAmount > 0 ? netAmount : '') + '</td><td>' + (netRebate !== 0 ? netRebate : '') + '</td><td style="color:#ff0000;">' + netHitDetail + '</td><td style="' + netPLColor + '">' + (hasValidDraw && netPL !== 0 ? netPL : '') + '</td></tr>';
  });
}

// ===== 手机端浮动窗口遮罩层（点击遮罩关闭窗口） =====
function showFloatingWinOverlay(winId) {
  if (window.innerWidth > 768) return;
  const existing = document.querySelector('.floating-window-overlay');
  if (existing) existing.remove();
  const overlay = document.createElement('div');
  overlay.className = 'floating-window-overlay';
  overlay.style.display = 'block';
  overlay.onclick = function() {
    const win = document.getElementById(winId);
    if (win) win.remove();
    this.remove();
  };
  document.body.appendChild(overlay);
}

// 自动移除遮罩层（监听浮动窗口被移除）
const _overlayObserver = new MutationObserver(function(mutations) {
  mutations.forEach(function(m) {
    m.removedNodes.forEach(function(node) {
      if (node.classList && node.classList.contains('floating-window')) {
        const overlay = document.querySelector('.floating-window-overlay');
        if (overlay) overlay.remove();
      }
    });
  });
});
_overlayObserver.observe(document.body, { childList: true, subtree: false });