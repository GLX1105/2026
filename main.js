// ===== 入口文件：window.onload 和事件绑定 =====

window.onload = async () => {
  setCurrentRegion(currentRegion);
  const dbInitOk = await initIndexedDB();
  if (!dbInitOk) { document.getElementById('dbWarning').style.display = 'block'; const dbStatusEl = document.getElementById('dbStatus'); if (dbStatusEl) { dbStatusEl.textContent = '异常'; dbStatusEl.style.color = '#e74c3c'; } }
  if (!localStorage.getItem('replacePresets')) { const defaultPresets = [{"old":"兰","new":"蓝"},{"old":"录","new":"绿"},{"old":"碌","new":"绿"},{"old":"禄","new":"绿"},{"old":"拦","new":"蓝"},{"old":"篮","new":"蓝"},{"old":"免","new":"兔"},{"old":"午","new":"牛"},{"old":"侯","new":"猴"},{"old":"㺅","new":"猴"},{"old":"名","new":"各"}]; localStorage.setItem('replacePresets', JSON.stringify(defaultPresets)); }
  if (!localStorage.getItem('categoryAliases')) { const defaultAliases = [{"alias":"红色","target":"红波"},{"alias":"蓝色","target":"蓝波"},{"alias":"绿色","target":"绿波"},{"alias":"兰波","target":"蓝波"},{"alias":"录波","target":"绿波"},{"alias":"金行","target":"金"},{"alias":"木行","target":"木"},{"alias":"水行","target":"水"},{"alias":"火行","target":"火"},{"alias":"土行","target":"土"},{"alias":"红蓝","target":"红波-蓝波"},{"alias":"红绿","target":"红波-绿波"},{"alias":"蓝绿","target":"蓝波-绿波"},{"alias":"火土","target":"火-土"},{"alias":"红蓝波","target":"红波-蓝波"},{"alias":"红绿波","target":"红波-绿波"},{"alias":"蓝绿波","target":"蓝波-绿波"},{"alias":"大单小双","target":"大单-小双"},{"alias":"大双小单","target":"大双-小单"},{"alias":"金木水","target":"金-木-水"},{"alias":"家肖","target":"家禽"},{"alias":"野肖","target":"野兽"},{"alias":"号各","target":"各号"},{"alias":"小数","target":"小"},{"alias":"大数","target":"大"},{"alias":"合单","target":"合数单"},{"alias":"合双","target":"合数双"},{"alias":"大尾","target":"尾大"},{"alias":"小尾","target":"尾小"},{"alias":"大数单","target":"大单"},{"alias":"大数双","target":"大双"},{"alias":"小数单","target":"小单"},{"alias":"小数双","target":"小双"},{"alias":"红波单","target":"红单"},{"alias":"红波双","target":"红双"},{"alias":"蓝波单","target":"蓝单"},{"alias":"蓝波双","target":"蓝双"},{"alias":"绿波单","target":"绿单"},{"alias":"绿波双","target":"绿双"},{"alias":"老虎","target":"虎"},{"alias":"老鼠","target":"鼠"},{"alias":"兔子","target":"兔"},{"alias":"大号","target":"大"},{"alias":"小号","target":"小"}]; localStorage.setItem('categoryAliases', JSON.stringify(defaultAliases)); }
  const today = getTodayCST(); const filterDateEl2 = document.getElementById('filterDate'); if (filterDateEl2) filterDateEl2.value = today;
  const savedZodiac = localStorage.getItem('selectedStartZodiac') || '马'; document.getElementById('startZodiacSelect').value = savedZodiac;
  currentZodiacMap = buildZodiacMap(savedZodiac); updateSelects(); renderAllTablesPlaceholder();
  enableRowDragSelect('riskTable'); enableRowDragSelect('reportTable');
  await autoCleanRecycleBin(); setInterval(autoCleanRecycleBin, 24 * 60 * 60 * 1000); updateRecycleCount();
  updateLiveClock(); setInterval(updateLiveClock, 1000);
  window._systemReady = async () => { await updateTableFromRecords(); calculateStorageUsage(); updateOrderTotalDisplay(); updateReportAmountTotal(); updateRecentDrawTexts(); renderPingtexiaoTable(); updateCardA(); renderSmartDecision(); addOperationLog('login', '系统登录'); };
  if (!checkCurrentAccess()) {
    window.location.href = 'login.html';
    return;
  } else {
    if (isAdmin()) document.getElementById('cardMgrBtn').style.display = '';
    await window._systemReady();
  }
  const fixRangeInput = (id) => { const el = document.getElementById(id); if (el) { el.addEventListener('input', () => { clearStatsCache(); updateTableFromRecords(); }); } };
  fixRangeInput('numAmountMin'); fixRangeInput('numAmountMax'); fixRangeInput('zodiacAmountMin'); fixRangeInput('zodiacAmountMax');

  // ===== 关闭顶层窗口 =====
  function closeTopWindow() {
    const recognizeWin = document.getElementById('recognizeWin'); if (recognizeWin) { closeRecognizeModal(); return true; }
    const orderWin = document.getElementById('orderWin'); if (orderWin) { orderWin.remove(); return true; }
    const reportWin = document.getElementById('reportWin'); if (reportWin) { reportWin.remove(); return true; }
    const drawWin = document.getElementById('drawRecordWin'); if (drawWin) { drawWin.remove(); return true; }
    const recycleWin = document.getElementById('recycleWin'); if (recycleWin) { recycleWin.remove(); return true; }
    const operationLogWin = document.getElementById('operationLogWin'); if (operationLogWin) { operationLogWin.remove(); return true; }
    const databaseModal = document.getElementById('databaseModal'); if (databaseModal && databaseModal.style.display === 'flex') { hideDatabase(); return true; }
    const prefixWin = document.getElementById('prefixWin'); if (prefixWin) { prefixWin.remove(); return true; }
    const amountPrefixWin = document.getElementById('amountPrefixWin'); if (amountPrefixWin) { amountPrefixWin.remove(); return true; }
    const amountSuffixWin = document.getElementById('amountSuffixWin'); if (amountSuffixWin) { amountSuffixWin.remove(); return true; }
    const categoryAliasWin = document.getElementById('categoryAliasWin'); if (categoryAliasWin) { categoryAliasWin.remove(); return true; }
    const replacePresetWin = document.getElementById('replacePresetWin'); if (replacePresetWin) { replacePresetWin.remove(); return true; }
    const cardManagerWin = document.getElementById('cardManagerWin'); if (cardManagerWin) { cardManagerWin.remove(); return true; }
    const userManagerWin = document.getElementById('userManagerWin'); if (userManagerWin) { userManagerWin.remove(); return true; }
    const lianxiaoGenerateWin = document.getElementById('lianxiaoGenerateWin'); if (lianxiaoGenerateWin) { lianxiaoGenerateWin.remove(); return true; }
    const lianxiaoStatsWin = document.getElementById('lianxiaoStatsWin'); if (lianxiaoStatsWin) { lianxiaoStatsWin.remove(); return true; }
    const duiJiangWin = document.getElementById('duiJiangWin'); if (duiJiangWin) { duiJiangWin.remove(); return true; }
    const oddsWin = document.getElementById('oddsWin'); if (oddsWin) { oddsWin.remove(); return true; }
    return false;
  }

  // ===== 键盘事件绑定 =====
  document.addEventListener('keydown', function(e) {
    const recognizeWin = document.getElementById('recognizeWin');
    const activeEl = document.activeElement;
    const isInputFocused = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable);
    if (e.altKey && e.key === '1') { e.preventDefault(); if (recognizeWin) { closeRecognizeModal(); } else { showRecognizeModal(); } return; }
    if (e.altKey && e.key === '2') { e.preventDefault(); if (recognizeWin) { saveReportOrder(); } return; }
    if (e.altKey && e.key === '3') { e.preventDefault(); if (recognizeWin) { saveOrder(); } return; }
    if (e.altKey && e.key === '4') { e.preventDefault(); if (recognizeWin) { const ta = document.querySelector('.source-order-input'); if (ta) ta.focus(); } return; }
    if (e.key === 'Escape' && !isInputFocused) { if (closeTopWindow()) { e.preventDefault(); } else { document.querySelectorAll('#riskTable tr.selected-row, #reportTable tr.selected-row').forEach(tr => tr.classList.remove('selected-row')); e.preventDefault(); } return; }
    if (e.ctrlKey && e.key === 'v') { if (recognizeWin && !isInputFocused) { e.preventDefault(); pasteOrder(); } return; }
    if (e.ctrlKey && e.key === 'Delete') { if (recognizeWin) { e.preventDefault(); clearAllInput(); } return; }
    if (e.key === 'F5') { e.preventDefault(); updateTableFromRecords(); showToast('数据已刷新'); return; }
    if (e.ctrlKey && e.key === 'e') { e.preventDefault(); exportData(); return; }
    if (e.ctrlKey && e.key === 'i') { e.preventDefault(); importData(); return; }
    if (e.ctrlKey && e.key === 'd') { e.preventDefault(); showDatabase(); return; }
  });
};

document.getElementById('rebateRate')?.addEventListener('input', generateRiskTable);
document.getElementById('multipleVal')?.addEventListener('input', generateRiskTable);
document.getElementById('reportRebateRate')?.addEventListener('input', generateReportTable);
document.getElementById('reportMultipleVal')?.addEventListener('input', generateReportTable);
document.getElementById('startZodiacSelect')?.addEventListener('change', changeStartZodiac);

const filterDateEl = document.getElementById('filterDate');
if (filterDateEl) { filterDateEl.addEventListener('change', () => { updateTableFromRecords(); if (document.getElementById('orderWin')) { applyPrizeFilter(); } applyReportCap(); updateRecentDrawTexts(); renderPingtexiaoTable(); updateCardA(); const duiJiangWin = document.getElementById('duiJiangWin'); if (duiJiangWin) { showDuiJiangWin(); } }); filterDateEl.addEventListener('input', updateTableFromRecords); }

const originalApplyReportCap = applyReportCap;
applyReportCap = function() { originalApplyReportCap(); const info = document.getElementById('reportCapInfo').innerText; if (!info || info === '无超出的号码') { document.getElementById('parseResultArea').innerText = ''; } };

// ===== 清空按钮长按事件（长按800ms触发） =====
let resetLock = false;
let resetLongPressTimer = null;
const resetBtn = document.getElementById('resetBtn');
if (resetBtn) {
  resetBtn.addEventListener('mousedown', (e) => { if (e.button !== 0) return; resetLongPressTimer = setTimeout(() => { resetLongPressTimer = null; resetTable(); }, 800); });
  resetBtn.addEventListener('mouseup', () => { if (resetLongPressTimer) { clearTimeout(resetLongPressTimer); resetLongPressTimer = null; } });
  resetBtn.addEventListener('mouseleave', () => { if (resetLongPressTimer) { clearTimeout(resetLongPressTimer); resetLongPressTimer = null; } });
  resetBtn.addEventListener('touchstart', (e) => { resetLongPressTimer = setTimeout(() => { resetLongPressTimer = null; resetTable(); e.preventDefault(); }, 800); });
  resetBtn.addEventListener('touchend', (e) => { if (resetLongPressTimer) { clearTimeout(resetLongPressTimer); resetLongPressTimer = null; resetTable(); e.preventDefault(); } });
  resetBtn.addEventListener('touchcancel', () => { if (resetLongPressTimer) { clearTimeout(resetLongPressTimer); resetLongPressTimer = null; } });
}