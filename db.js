// ===== 数据库初始化（DB_NAME, DB_VERSION 等常量定义在 config.js 中） =====
function initIndexedDB() { return new Promise((resolve) => { const request = indexedDB.open(DB_NAME, DB_VERSION); request.onerror = () => { dbAvailable = false; document.getElementById('dbWarning').style.display = 'block'; const dbStatusEl = document.getElementById('dbStatus'); if (dbStatusEl) { dbStatusEl.textContent = '异常'; dbStatusEl.style.color = '#e74c3c'; } resolve(false); }; request.onsuccess = (event) => { db = event.target.result; dbAvailable = true; document.getElementById('dbWarning').style.display = 'none'; const dbStatusEl = document.getElementById('dbStatus'); if (dbStatusEl) { dbStatusEl.textContent = '正常'; dbStatusEl.style.color = '#27ae60'; } resolve(true); }; request.onupgradeneeded = (event) => { db = event.target.result; if (!db.objectStoreNames.contains(STORE_NAME)) { db.createObjectStore(STORE_NAME, { keyPath: 'id' }); } if (!db.objectStoreNames.contains(REPORT_STORE_NAME)) { db.createObjectStore(REPORT_STORE_NAME, { keyPath: 'id' }); } if (!db.objectStoreNames.contains(RECYCLE_STORE_NAME)) { db.createObjectStore(RECYCLE_STORE_NAME, { keyPath: 'id' }); } if (!db.objectStoreNames.contains(LOG_STORE_NAME)) { db.createObjectStore(LOG_STORE_NAME, { keyPath: 'id' }); } if (!db.objectStoreNames.contains(COMBO_STORE_NAME)) { db.createObjectStore(COMBO_STORE_NAME, { keyPath: 'id' }); } const tx = event.target.transaction; const orderStore = tx.objectStore(STORE_NAME); const reportStore = tx.objectStore(REPORT_STORE_NAME); const addRegion = (store) => { const allReq = store.getAll(); allReq.onsuccess = () => { const records = allReq.result; records.forEach(r => { if (!r.region) { r.region = 'macau'; store.put(r); } }); }; }; addRegion(orderStore); addRegion(reportStore); }; }); }

// ===== 订单查询函数 =====
async function getAllOrdersUnfiltered() { return new Promise((resolve) => { if (!db) resolve([]); const tx = db.transaction([STORE_NAME], 'readonly'); const store = tx.objectStore(STORE_NAME); const req = store.getAll(); req.onsuccess = (e) => resolve(e.target.result || []); }); }
async function getAllReportsUnfiltered() { return new Promise((resolve) => { if (!db) resolve([]); const tx = db.transaction([REPORT_STORE_NAME], 'readonly'); const store = tx.objectStore(REPORT_STORE_NAME); const req = store.getAll(); req.onsuccess = (e) => resolve(e.target.result || []); }); }
async function getOrderRecords() { const all = await getAllOrdersUnfiltered(); return all.filter(r => r.region === currentRegion); }
async function getReportOrderRecords() { const all = await getAllReportsUnfiltered(); return all.filter(r => r.region === currentRegion); }
async function getComboOrders() { return new Promise((resolve) => { if (!db) resolve([]); const tx = db.transaction([COMBO_STORE_NAME], 'readonly'); const store = tx.objectStore(COMBO_STORE_NAME); const req = store.getAll(); req.onsuccess = (e) => resolve((e.target.result || []).filter(r => r.region === currentRegion)); }); }

// ===== 保存函数 =====
async function saveOrderRecordToIDB(content, user, date, totalAmount = 0, ts = null, regionOverride = null) {
  if (!db || !dbAvailable) { showToast('数据库不可用，操作无法保存'); return false; }
  const record = { id: Date.now() + '-' + Math.random().toString(36).substr(2, 9), content, user, date, totalAmount, region: regionOverride || currentRegion, timestamp: ts || new Date().toISOString() };
  try {
    await new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_NAME], 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.add(record);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
    return true;
  } catch (e) {
    showToast('保存失败，请重试');
    return false;
  }
}
async function saveReportOrderRecordToIDB(content, user, date, totalAmount = 0, ts = null, regionOverride = null) {
  if (!db || !dbAvailable) { showToast('数据库不可用，操作无法保存'); return false; }
  const record = { id: Date.now() + '-' + Math.random().toString(36).substr(2, 9), content, user, date, totalAmount, region: regionOverride || currentRegion, timestamp: ts || new Date().toISOString() };
  try {
    await new Promise((resolve, reject) => {
      const tx = db.transaction([REPORT_STORE_NAME], 'readwrite');
      const store = tx.objectStore(REPORT_STORE_NAME);
      store.add(record);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
    return true;
  } catch (e) {
    showToast('保存失败，请重试');
    return false;
  }
}
async function saveComboOrderRecordToIDB(content, user, date, totalAmount = 0, comboType = '', ts = null) {
  if (!db || !dbAvailable) { showToast('数据库不可用，操作无法保存'); return false; }
  const record = { id: Date.now() + '-' + Math.random().toString(36).substr(2, 9), content, user, date, totalAmount, comboType, region: currentRegion, timestamp: ts || new Date().toISOString() };
  try {
    await new Promise((resolve, reject) => {
      const tx = db.transaction([COMBO_STORE_NAME], 'readwrite');
      const store = tx.objectStore(COMBO_STORE_NAME);
      store.add(record);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
    return true;
  } catch (e) {
    showToast('保存失败，请重试');
    return false;
  }
}

// ===== 操作日志函数 =====
async function addOperationLog(action, detail, regionOverride = null, orderUser = null, orderTotal = 0) {
  if (!db) return;
  const session = getAuthSession();
  const username = session ? (session.role === 'admin' ? '管理员' : '卡密用户') : '未知';
  const now = new Date();
  const cstTime = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  const cstTimestamp = cstTime.toISOString().replace('Z', '+08:00');
  const record = {
    id: Date.now() + '-' + Math.random().toString(36).substr(2, 9),
    timestamp: cstTimestamp, user: username, action: action,
    detail: detail, orderUser: orderUser, orderTotal: orderTotal,
    region: regionOverride || currentRegion
  };
  try {
    const tx = db.transaction([LOG_STORE_NAME], 'readwrite');
    const store = tx.objectStore(LOG_STORE_NAME);
    store.add(record);
    const allReq = store.getAll();
    allReq.onsuccess = () => {
      const allLogs = allReq.result;
      if (allLogs.length > 1000) {
        const sorted = allLogs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        const earliestDate = sorted[0].timestamp.slice(0, 10);
        sorted.forEach(log => { if (log.timestamp.slice(0, 10) === earliestDate) store.delete(log.id); });
      }
    };
  } catch (e) {}
}

async function getAllLogs() {
  return new Promise((resolve) => {
    if (!db) resolve([]);
    const tx = db.transaction([LOG_STORE_NAME], 'readonly');
    const store = tx.objectStore(LOG_STORE_NAME);
    const req = store.getAll();
    req.onsuccess = (e) => resolve(e.target.result || []);
  });
}

async function clearAllLogs() {
  return new Promise((resolve) => {
    if (!db) { resolve(false); return; }
    const tx = db.transaction([LOG_STORE_NAME], 'readwrite');
    const store = tx.objectStore(LOG_STORE_NAME);
    const req = store.clear();
    req.onsuccess = () => resolve(true);
    req.onerror = () => resolve(false);
  });
}

async function updateLogCount() {
  const span = document.getElementById('logCount');
  if (!span) return;
  try { const logs = await getAllLogs(); span.textContent = logs.length; } catch (e) { span.textContent = '0'; }
}

// ===== 回收站数据操作 =====
async function getRecycleBinRecords() { return new Promise((resolve) => { if (!db) resolve([]); const tx = db.transaction([RECYCLE_STORE_NAME],'readonly'); const store = tx.objectStore(RECYCLE_STORE_NAME); const req = store.getAll(); req.onsuccess = (e) => resolve(e.target.result || []); }); }
async function moveToRecycleBin(record, type) { return new Promise((resolve) => { if (!db) { resolve(false); return; } const tx = db.transaction([RECYCLE_STORE_NAME],'readwrite'); const store = tx.objectStore(RECYCLE_STORE_NAME); const recycleRecord = { id: record.id, type: type, content: record.content, user: record.user, date: record.date, totalAmount: record.totalAmount || 0, region: record.region || currentRegion, timestamp: record.timestamp, deletedAt: new Date().toISOString() }; const req = store.add(recycleRecord); req.onsuccess = () => resolve(true); req.onerror = () => resolve(false); }); }
async function deleteFromRecycleBin(id) { return new Promise((resolve) => { if (!db) { resolve(false); return; } const tx = db.transaction([RECYCLE_STORE_NAME],'readwrite'); const store = tx.objectStore(RECYCLE_STORE_NAME); const req = store.delete(id); req.onsuccess = () => resolve(true); req.onerror = () => resolve(false); }); }
async function clearRecycleBin(region = null) { return new Promise((resolve) => { if (!db) resolve(false); const tx = db.transaction([RECYCLE_STORE_NAME],'readwrite'); const store = tx.objectStore(RECYCLE_STORE_NAME); if (region) { const allReq = store.getAll(); allReq.onsuccess = () => { const records = allReq.result.filter(r => r.region === region); records.forEach(r => store.delete(r.id)); resolve(true); }; } else { const req = store.clear(); req.onsuccess = () => resolve(true); } }); }
async function batchDeleteFromRecycleBin(ids) { return new Promise((resolve) => { if (!db) { resolve(false); return; } const tx = db.transaction([RECYCLE_STORE_NAME],'readwrite'); const store = tx.objectStore(RECYCLE_STORE_NAME); let count = 0; ids.forEach(id => { const req = store.delete(id); req.onsuccess = () => { count++; if (count === ids.length) resolve(true); }; req.onerror = () => { console.error('彻底删除失败', id); }; }); }); }

// ===== 单条删除函数 =====
async function deleteOrderRecordFromIDB(id) { if (!db || !dbAvailable) return false; const record = await new Promise((resolve) => { const tx = db.transaction([STORE_NAME], 'readonly'); const store = tx.objectStore(STORE_NAME); const req = store.get(id); req.onsuccess = () => resolve(req.result); req.onerror = () => resolve(null); }); if (!record) return false; await moveToRecycleBin(record, 'order'); await new Promise((resolve) => { const tx = db.transaction([STORE_NAME], 'readwrite'); const store = tx.objectStore(STORE_NAME); const req = store.delete(id); req.onsuccess = () => resolve(true); req.onerror = () => resolve(false); }); return true; }
async function deleteReportOrderRecordFromIDB(id) { if (!db || !dbAvailable) return false; const record = await new Promise((resolve) => { const tx = db.transaction([REPORT_STORE_NAME], 'readonly'); const store = tx.objectStore(REPORT_STORE_NAME); const req = store.get(id); req.onsuccess = () => resolve(req.result); req.onerror = () => resolve(null); }); if (!record) return false; await moveToRecycleBin(record, 'report'); await new Promise((resolve) => { const tx = db.transaction([REPORT_STORE_NAME], 'readwrite'); const store = tx.objectStore(REPORT_STORE_NAME); const req = store.delete(id); req.onsuccess = () => resolve(true); req.onerror = () => resolve(false); }); return true; }
async function deleteComboOrderRecordFromIDB(id) { if (!db || !dbAvailable) return false; const record = await new Promise((resolve) => { const tx = db.transaction([COMBO_STORE_NAME], 'readonly'); const store = tx.objectStore(COMBO_STORE_NAME); const req = store.get(id); req.onsuccess = () => resolve(req.result); req.onerror = () => resolve(null); }); if (!record) return false; await moveToRecycleBin(record, 'combo'); await new Promise((resolve) => { const tx = db.transaction([COMBO_STORE_NAME], 'readwrite'); const store = tx.objectStore(COMBO_STORE_NAME); const req = store.delete(id); req.onsuccess = () => resolve(true); req.onerror = () => resolve(false); }); return true; }

// ===== 批量删除函数 =====
async function batchDeleteOrderRecordFromIDB(ids) { if (!db || !dbAvailable) return false; try { for (const id of ids) { const record = await new Promise((resolve) => { const tx = db.transaction([STORE_NAME], 'readonly'); const store = tx.objectStore(STORE_NAME); const req = store.get(id); req.onsuccess = () => resolve(req.result); req.onerror = () => resolve(null); }); if (record) { await moveToRecycleBin(record, 'order'); await new Promise((resolve) => { const tx = db.transaction([STORE_NAME], 'readwrite'); const store = tx.objectStore(STORE_NAME); const req = store.delete(id); req.onsuccess = () => resolve(true); req.onerror = () => resolve(false); }); } } return true; } catch (e) { console.error('批量删除订单失败', e); return false; } }
async function batchDeleteReportOrderRecordFromIDB(ids) { if (!db || !dbAvailable) return false; try { for (const id of ids) { const record = await new Promise((resolve) => { const tx = db.transaction([REPORT_STORE_NAME], 'readonly'); const store = tx.objectStore(REPORT_STORE_NAME); const req = store.get(id); req.onsuccess = () => resolve(req.result); req.onerror = () => resolve(null); }); if (record) { await moveToRecycleBin(record, 'report'); await new Promise((resolve) => { const tx = db.transaction([REPORT_STORE_NAME], 'readwrite'); const store = tx.objectStore(REPORT_STORE_NAME); const req = store.delete(id); req.onsuccess = () => resolve(true); req.onerror = () => resolve(false); }); } } return true; } catch (e) { console.error('批量删除上报记录失败', e); return false; } }
async function batchDeleteComboOrderRecordFromIDB(ids) { if (!db || !dbAvailable) return false; try { for (const id of ids) { const record = await new Promise((resolve) => { const tx = db.transaction([COMBO_STORE_NAME], 'readonly'); const store = tx.objectStore(COMBO_STORE_NAME); const req = store.get(id); req.onsuccess = () => resolve(req.result); req.onerror = () => resolve(null); }); if (record) { await moveToRecycleBin(record, 'combo'); await new Promise((resolve) => { const tx = db.transaction([COMBO_STORE_NAME], 'readwrite'); const store = tx.objectStore(COMBO_STORE_NAME); const req = store.delete(id); req.onsuccess = () => resolve(true); req.onerror = () => resolve(false); }); } } return true; } catch (e) { console.error('批量删除连肖记录失败', e); return false; } }

// ===== 清空函数 =====
async function clearAllOrderRecordsFromIDB(region = null) { return new Promise((resolve) => { if (!db) resolve(false); const tx = db.transaction([STORE_NAME],'readwrite'); const store = tx.objectStore(STORE_NAME); if (region) { const allReq = store.getAll(); allReq.onsuccess = () => { const records = allReq.result.filter(r => r.region === region); records.forEach(r => store.delete(r.id)); resolve(true); }; } else { const req = store.clear(); req.onsuccess = () => resolve(true); } }); }
async function clearAllReportOrderRecordsFromIDB(region = null) { return new Promise((resolve) => { if (!db) resolve(false); const tx = db.transaction([REPORT_STORE_NAME],'readwrite'); const store = tx.objectStore(REPORT_STORE_NAME); if (region) { const allReq = store.getAll(); allReq.onsuccess = () => { const records = allReq.result.filter(r => r.region === region); records.forEach(r => store.delete(r.id)); resolve(true); }; } else { const req = store.clear(); req.onsuccess = () => resolve(true); } }); }
async function clearAllComboOrderRecordsFromIDB(region = null) { return new Promise((resolve) => { if (!db) resolve(false); const tx = db.transaction([COMBO_STORE_NAME],'readwrite'); const store = tx.objectStore(COMBO_STORE_NAME); if (region) { const allReq = store.getAll(); allReq.onsuccess = () => { const records = allReq.result.filter(r => r.region === region); records.forEach(r => store.delete(r.id)); resolve(true); }; } else { const req = store.clear(); req.onsuccess = () => resolve(true); } }); }

// ===== 存储计算 =====
async function calculateStorageUsage() { const records = await getOrderRecords(); const reportRecords = await getReportOrderRecords(); const comboRecords = await getComboOrders(); const orderCount = records.length + reportRecords.length + comboRecords.length; let usedBytes = 0; records.forEach(r => usedBytes += JSON.stringify(r).length * 2); reportRecords.forEach(r => usedBytes += JSON.stringify(r).length * 2); comboRecords.forEach(r => usedBytes += JSON.stringify(r).length * 2); const usedMB = (usedBytes / (1024*1024)).toFixed(2); const maxStorage = 50*1024*1024; const freeMB = ((maxStorage - usedBytes) / (1024*1024)).toFixed(2); document.getElementById('orderCount').textContent = orderCount; document.getElementById('usedSpace').textContent = `${usedMB} MB`; document.getElementById('freeSpace').textContent = `${freeMB} MB`; const filterDate = document.getElementById('filterDate')?.value || getTodayCST(); const todayRecords = records.filter(r => r.date === filterDate); document.getElementById('todayOrderCount').textContent = todayRecords.length; updateLogCount(); }

// ===== 数据导出/导入 =====
async function exportData(){ try{ const orders=await getAllOrdersUnfiltered(); const reports=await getAllReportsUnfiltered(); const logs = await getAllLogs(); const recycleRecords = await getRecycleBinRecords(); const comboRecords = await getComboOrders(); const drawRecords = {}; for (let i = 0; i < localStorage.length; i++) { const key = localStorage.key(i); if (key && key.startsWith('drawRecord_')) { drawRecords[key] = localStorage.getItem(key); } } const comboDrawRecords = {}; for (let i = 0; i < localStorage.length; i++) { const key = localStorage.key(i); if (key && key.startsWith('comboDrawRecord_')) { comboDrawRecords[key] = localStorage.getItem(key); } } const pingtexiao = {}; for (let i = 0; i < localStorage.length; i++) { const key = localStorage.key(i); if (key && key.startsWith('pingtexiao_')) { pingtexiao[key] = localStorage.getItem(key); } } const pingtexiaoHighlights = {}; for (let i = 0; i < localStorage.length; i++) { const key = localStorage.key(i); if (key && key.startsWith('ptHighlight_')) { pingtexiaoHighlights[key] = localStorage.getItem(key); } } const users = {}; for (let i = 0; i < localStorage.length; i++) { const key = localStorage.key(i); if (key && key.startsWith('users_')) { users[key] = localStorage.getItem(key); } } const presets = localStorage.getItem('replacePresets') || '[]'; const aliases = localStorage.getItem('categoryAliases') || '[]'; const oddsData = localStorage.getItem('comboOddsData') || '{}'; const data={version:7,orders,reports,logs,recycleRecords,comboRecords,drawRecords,comboDrawRecords,pingtexiao,pingtexiaoHighlights,users,replacePresets:JSON.parse(presets),categoryAliases:JSON.parse(aliases),oddsData:JSON.parse(oddsData),exportTime:new Date().toISOString()}; const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}); const url=URL.createObjectURL(blob); const fileName = `港澳识别数据_全部_${getTodayCST()}.json`; const a = document.createElement('a'); a.href = url; a.download = fileName; document.body.appendChild(a); a.click(); document.body.removeChild(a); setTimeout(() => URL.revokeObjectURL(url), 60000); addOperationLog('export', '导出全部数据（含日志/回收站/用户/配置/连肖）'); showToast('导出成功：' + fileName); showStorageDrawerTemporary(5000); }catch(e){showToast('导出失败');} }
async function importData(){ const inp=document.createElement('input'); inp.type='file'; inp.accept='.json'; inp.style.display='none'; document.body.appendChild(inp); inp.onchange=async(e)=>{ const file=e.target.files[0]; if(!file){document.body.removeChild(inp);return;} const reader=new FileReader(); reader.onload=async(ev)=>{ try{ const data=JSON.parse(ev.target.result); if(!data.orders||!data.reports){showToast('无效格式');document.body.removeChild(inp);return;} if (!data.version || data.version < 7) { const cf = await confirm(`备份文件版本（${data.version || '未知'}）低于当前版本（7），导入可能导致数据异常，是否继续？`); if (!cf) { document.body.removeChild(inp); return; } } const recycleCount = data.recycleRecords ? data.recycleRecords.length : 0; const comboCount = data.comboRecords ? data.comboRecords.length : 0; const userCount = data.users ? Object.keys(data.users).length : 0; const pingtexiaoCount = data.pingtexiao ? Object.keys(data.pingtexiao).length : 0; const highlightCount = data.pingtexiaoHighlights ? Object.keys(data.pingtexiaoHighlights).length : 0; const totalToImport = data.orders.length + data.reports.length + (data.drawRecords ? Object.keys(data.drawRecords).length : 0) + (data.comboDrawRecords ? Object.keys(data.comboDrawRecords).length : 0) + pingtexiaoCount + highlightCount + recycleCount + comboCount + userCount + (data.replacePresets ? data.replacePresets.length : 0) + (data.categoryAliases ? data.categoryAliases.length : 0); if(totalToImport === 0){ showToast('文件中没有数据'); document.body.removeChild(inp); return; } let confirmMsg = `文件包含 ${data.orders.length} 条订单，${data.reports.length} 条上报，${data.logs ? data.logs.length : 0} 条日志，${recycleCount} 条回收站记录，${comboCount} 条连肖订单，${userCount} 组用户数据。是否导入？`; const cf = await confirm(confirmMsg); if(!cf){document.body.removeChild(inp);return;} const eo=await getAllOrdersUnfiltered(); const er=await getAllReportsUnfiltered(); const eco=await getComboOrders(); let so=0,no=0; for(const r of data.orders){ const region = r.region || currentRegion; const dup = eo.find(o => o.content === r.content && o.user === r.user && o.timestamp === r.timestamp && o.region === region); if(dup){ so++; continue; } try{ await saveOrderRecordToIDB(r.content, r.user, r.date, r.totalAmount || 0, r.timestamp, region); no++; } catch(e){ console.error('导入订单失败', e); } } let sr=0,nr=0; for(const r of data.reports){ const region = r.region || currentRegion; const dup = er.find(o => o.content === r.content && o.user === r.user && o.timestamp === r.timestamp && o.region === region); if(dup){ sr++; continue; } try{ await saveReportOrderRecordToIDB(r.content, r.user, r.date, r.totalAmount || 0, r.timestamp, region); nr++; } catch(e){ console.error('导入上报失败', e); } } let sco=0,nco=0; if (data.comboRecords && Array.isArray(data.comboRecords)) { for(const r of data.comboRecords){ const region = r.region || currentRegion; const dup = eco.find(o => o.content === r.content && o.user === r.user && o.timestamp === r.timestamp && o.region === region); if(dup){ sco++; continue; } try{ await saveComboOrderRecordToIDB(r.content, r.user, r.date, r.totalAmount || 0, r.comboType || '', r.timestamp); nco++; } catch(e){ console.error('导入连肖订单失败', e); } } } if (data.logs && Array.isArray(data.logs)) { const existingLogs = await getAllLogs(); const existingIds = new Set(existingLogs.map(l => l.id)); for (const log of data.logs) { if (!existingIds.has(log.id)) { await new Promise((resolve) => { const tx = db.transaction([LOG_STORE_NAME], 'readwrite'); const store = tx.objectStore(LOG_STORE_NAME); store.add(log); tx.oncomplete = () => resolve(); }); } } } if (data.recycleRecords && Array.isArray(data.recycleRecords)) { const existingRecycle = await getRecycleBinRecords(); const existingRecycleIds = new Set(existingRecycle.map(r => r.id)); for (const rec of data.recycleRecords) { if (!existingRecycleIds.has(rec.id)) { await new Promise((resolve) => { const tx = db.transaction([RECYCLE_STORE_NAME], 'readwrite'); const store = tx.objectStore(RECYCLE_STORE_NAME); store.add(rec); tx.oncomplete = () => resolve(); }); } } } if (data.users) { for (const [key, value] of Object.entries(data.users)) { if (!localStorage.getItem(key)) { localStorage.setItem(key, value); } } } let dcImported = 0; if (data.drawRecords) { for (const [key, value] of Object.entries(data.drawRecords)) { const existing = localStorage.getItem(key); if (existing) { try { const existingData = JSON.parse(existing); const newData = JSON.parse(value); let changed = false; for (const [issue, entry] of Object.entries(newData)) { if (existingData[issue] && existingData[issue].number && existingData[issue].number.trim()) { if (entry.pl !== undefined && entry.pl !== '') { existingData[issue].pl = entry.pl; changed = true; } } else { existingData[issue] = entry; changed = true; } } if (changed) { localStorage.setItem(key, JSON.stringify(existingData)); dcImported++; } } catch(e) { localStorage.setItem(key, value); dcImported++; } } else { localStorage.setItem(key, value); dcImported++; } } } let comboDrawImported = 0; if (data.comboDrawRecords) { for (const [key, value] of Object.entries(data.comboDrawRecords)) { const existing = localStorage.getItem(key); if (existing) { try { const existingData = JSON.parse(existing); const newData = JSON.parse(value); let changed = false; for (const [issue, entry] of Object.entries(newData)) { if (!existingData[issue] || !existingData[issue].numbers || existingData[issue].numbers.length === 0) { existingData[issue] = entry; changed = true; } } if (changed) { localStorage.setItem(key, JSON.stringify(existingData)); comboDrawImported++; } } catch(e) { if (!localStorage.getItem(key)) { localStorage.setItem(key, value); comboDrawImported++; } } } else { localStorage.setItem(key, value); comboDrawImported++; } } } let ptImported = 0, ptSkipped = 0; if (data.pingtexiao) { for (const [key, value] of Object.entries(data.pingtexiao)) { if (localStorage.getItem(key)) { ptSkipped++; } else { localStorage.setItem(key, value); ptImported++; } } } let hlImported = 0; if (data.pingtexiaoHighlights) { for (const [key, value] of Object.entries(data.pingtexiaoHighlights)) { localStorage.setItem(key, value); hlImported++; } } if (data.oddsData) { if (!localStorage.getItem('comboOddsData')) { localStorage.setItem('comboOddsData', JSON.stringify(data.oddsData)); } } let presetImported = 0, aliasImported = 0; if (data.replacePresets && Array.isArray(data.replacePresets)) { const currentPresets = getReplacePresets(); data.replacePresets.forEach(p => { if (!currentPresets.some(x => x.old === p.old)) { currentPresets.push(p); presetImported++; } }); localStorage.setItem('replacePresets', JSON.stringify(currentPresets)); } if (data.categoryAliases && Array.isArray(data.categoryAliases)) { const currentAliases = getCategoryAliases(); data.categoryAliases.forEach(a => { if (!currentAliases.some(x => x.alias === a.alias)) { currentAliases.push(a); aliasImported++; } }); localStorage.setItem('categoryAliases', JSON.stringify(currentAliases)); } await updateTableFromRecords(); calculateStorageUsage(); renderPingtexiaoTable(); updateCardA(); renderSmartDecision(); addOperationLog('import', `导入${no+nr+nco}条订单/上报/连肖记录`); let msg = `成功导入 ${no+nr+nco} 条记录，${dcImported} 组开奖记录，${comboDrawImported} 组录开奖记录，${recycleCount} 条回收站记录，${comboCount} 条连肖订单，${userCount} 组用户数据。`; if (ptImported > 0) msg += `\n导入平特肖数据 ${ptImported} 组。`; if (ptSkipped > 0) msg += `\n跳过平特肖数据 ${ptSkipped} 组（已存在）。`; if (hlImported > 0) msg += `\n导入平特肖高亮标记 ${hlImported} 组。`; if (presetImported > 0) msg += `\n新增 ${presetImported} 条替换预设。`; if (aliasImported > 0) msg += `\n新增 ${aliasImported} 条分类缩写。`; if(so+sr+sco > 0) msg += `\n跳过 ${so+sr+sco} 条重复记录。`; showToast(msg); document.body.removeChild(inp); showStorageDrawerTemporary(5000); }catch(err){showToast('导入失败');document.body.removeChild(inp);} }; reader.onerror=()=>{showToast('读取失败');document.body.removeChild(inp);}; reader.readAsText(file); }; inp.addEventListener('cancel',()=>{document.body.removeChild(inp);}); inp.click(); }