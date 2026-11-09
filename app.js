/**
 * ==============================================================================
 * HOTEL IT INVENTORY MANAGEMENT - ZERO-BUNDLER VANILLA JAVASCRIPT CORE
 * BaaS Engine: Supabase (Auth & Database with RLS disabled)
 * Export Engine: SheetJS (xlsx.full.min.js) 100% Client-Side Generation
 * ==============================================================================
 */

// 1. CONSTANTS & SYSTEM CONFIGURATION
const DEPARTMENTS = [
  'Front Office',
  'House Keeping',
  'Engineering',
  'Human Resource',
  'F&B Product',
  'F&B Service',
  'Wellness',
  'Sales & Marketing',
  'Accounting'
];

const CATEGORIES = ['PC ITEMS', 'NETWORK ITEMS', 'CCTV & TV ITEMS', 'LOCK SYSTEM'];

const STORAGE_KEYS = {
  SUPABASE_URL: 'HOTEL_IT_SUPABASE_URL',
  SUPABASE_KEY: 'HOTEL_IT_SUPABASE_KEY',
  AUTH_USER: 'HOTEL_IT_AUTH_USER',
  DEMO_DATA: 'HOTEL_IT_DATA_CACHE',
  GEMINI_API_KEY: 'HOTEL_IT_GEMINI_API_KEY',
  GEMINI_MODEL: 'HOTEL_IT_GEMINI_MODEL'
};

// Default fallback Supabase credentials (from Redeploy Auth)
const DEFAULT_SUPABASE_URL = 'https://ufcutuputdpnepuhcwaq.supabase.co';
const DEFAULT_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmY3V0dXB1dGRwbmVwdWhjd2FxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMyNDIyNTMsImV4cCI6MjEwODgxODI1M30.LtVk8UvjTsltm0J_gR-6zWZqh8bachvYTvMurALhK88';

// Universal Anti-Wrap Badge Formatters (Guarantee Clean Single-Line Badges)
function formatCategoryBadge(category) {
  const cat = category || '-';
  return `<span class="badge-pill px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">${escapeHtml(cat)}</span>`;
}

function formatPOStatusBadge(status) {
  const isArrived = status === 'SUDAH DATANG';
  return isArrived
    ? `<span class="badge-pill px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 shrink-0"></span>SUDAH DATANG</span>`
    : `<span class="badge-pill px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30"><span class="w-1.5 h-1.5 rounded-full bg-blue-400 mr-1.5 shrink-0"></span>BELUM DATANG</span>`;
}

function formatStockStatusBadge(availableStock) {
  if (availableStock === 0) {
    return `<span class="badge-pill px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30"><span class="w-1.5 h-1.5 rounded-full bg-rose-400 mr-1.5 shrink-0"></span>Out of Stock</span>`;
  }
  if (availableStock <= 2) {
    return `<span class="badge-pill px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30"><span class="w-1.5 h-1.5 rounded-full bg-amber-400 mr-1.5 shrink-0"></span>Low Stock (${availableStock})</span>`;
  }
  return `<span class="badge-pill px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 shrink-0"></span>In Stock</span>`;
}

function formatMotionTypeBadge(type) {
  if (type === 'TRANSFER TO PC') {
    return `<span class="badge-pill px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 whitespace-nowrap"><i class="fa-solid fa-desktop text-[9px] mr-1 shrink-0"></i>TRANSFER TO PC</span>`;
  }
  if (type === 'RETURN FROM PC') {
    return `<span class="badge-pill px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 whitespace-nowrap"><i class="fa-solid fa-arrow-rotate-left text-[9px] mr-1 shrink-0"></i>RETURN FROM PC</span>`;
  }
  const isTransfer = type === 'TRANSFER_TO_DEPARTMENT';
  return isTransfer
    ? `<span class="badge-pill px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 whitespace-nowrap"><i class="fa-solid fa-arrow-right text-[9px] mr-1 shrink-0"></i>TRANSFER TO DEPT</span>`
    : `<span class="badge-pill px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 whitespace-nowrap"><i class="fa-solid fa-arrow-rotate-left text-[9px] mr-1 shrink-0"></i>RETURN TO IT</span>`;
}

// Client Device Real-Time Clock Timestamp Formatter (YYYY-MM-DD HH:MM:SS)
function getClientDeviceTimestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// Application State
let supabaseClient = null;
let currentUser = null;
let isLiveSupabase = false;

let state = {
  masterItems: [],
  stockTransactions: [],
  departmentMovements: [],
  purchaseOrders: [],
  preloved: [],
  activities: [],
  pcs: [],
  pcMovements: [],
  pcComponentMovements: []
};

// UI Filters
let activeView = 'dashboard';
let activeDept = 'Front Office';
let invCategoryFilter = 'ALL';
let deptCategoryFilter = 'ALL';
let prelovedCategoryFilter = 'ALL';
let poStatusFilter = 'ALL';
let currentMonthlyTab = 'inbound';
let pendingPhotoDataUrl = null;

// PC Management & Workstation UI State
let pcFilter = 'ALL'; // 'ALL' | 'IN_DEPT' | 'READY'
let pcMovementTab = 'pc'; // 'pc' | 'component'
let currentDetailPCId = null;
let currentActionSlot = null; // { pcId, slotKey, slotLabel }
let currentInstallTarget = null; // { pcId, slotKey, slotLabel }

// ==============================================================================
// 2. INITIAL SEED / OFFLINE FALLBACK DATA
// ==============================================================================
function getInitialSeedData() {
  return {
    masterItems: [],
    stockTransactions: [],
    departmentMovements: [],
    purchaseOrders: [],
    preloved: [],
    activities: [],
    pcs: [],
    pcMovements: [],
    pcComponentMovements: []
  };
}

// ==============================================================================
// 3. STORAGE & SUPABASE INITIALIZATION & REALTIME ENGINE
// ==============================================================================
let realtimeChannel = null;
let realtimeDebounceTimer = null;
let clockIntervalId = null;

// Real-Time Device Clock (HH:MM:SS & Indonesian/International Date)
function startRealTimeDeviceClock() {
  if (clockIntervalId) clearInterval(clockIntervalId);

  function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const timeStr = `${hours}:${minutes}:${seconds}`;

    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const dayName = days[now.getDay()];
    const dateNum = now.getDate();
    const monthName = months[now.getMonth()];
    const year = now.getFullYear();
    const dateStr = `${dayName}, ${dateNum} ${monthName} ${year}`;

    const timeEl = document.getElementById('header-clock-time');
    const dateEl = document.getElementById('header-clock-date');

    if (timeEl) timeEl.textContent = timeStr;
    if (dateEl) dateEl.textContent = dateStr;
  }

  updateClock();
  clockIntervalId = setInterval(updateClock, 1000);
}

function initSupabaseClient() {
  let url = localStorage.getItem(STORAGE_KEYS.SUPABASE_URL);
  let key = localStorage.getItem(STORAGE_KEYS.SUPABASE_KEY);

  // Auto-migrate from placeholder to default live credentials
  if (!url || url.includes('your-project-ref')) {
    url = DEFAULT_SUPABASE_URL;
    localStorage.setItem(STORAGE_KEYS.SUPABASE_URL, url);
  }
  if (!key || key.includes('your-anon-key-here')) {
    key = DEFAULT_SUPABASE_KEY;
    localStorage.setItem(STORAGE_KEYS.SUPABASE_KEY, key);
  }

  const isValidUrl = url && url.startsWith('http') && !url.includes('your-project-ref');

  if (window.supabase && isValidUrl) {
    try {
      supabaseClient = window.supabase.createClient(url, key);
      isLiveSupabase = true;
      updateConnectionBadge(true);
      setupSupabaseRealtime();
      return;
    } catch (e) {
      console.warn('Supabase client init warning:', e);
    }
  }

  isLiveSupabase = false;
  updateConnectionBadge(false);
}

// 3.1 SUPABASE REALTIME MULTI-USER SYNC LISTENER
function setupSupabaseRealtime() {
  if (!isLiveSupabase || !supabaseClient) return;

  // Cleanup active channel if already present
  if (realtimeChannel) {
    try {
      supabaseClient.removeChannel(realtimeChannel);
    } catch (e) {
      console.warn('Realtime cleanup warning:', e);
    }
    realtimeChannel = null;
  }

  try {
    realtimeChannel = supabaseClient
      .channel('public-db-realtime-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'master_items' },
        (payload) => handleRealtimeChange('master_items', payload)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'stock_transactions' },
        (payload) => handleRealtimeChange('stock_transactions', payload)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'department_movements' },
        (payload) => handleRealtimeChange('department_movements', payload)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'purchase_orders' },
        (payload) => handleRealtimeChange('purchase_orders', payload)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'preloved' },
        (payload) => handleRealtimeChange('preloved', payload)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'activities' },
        (payload) => handleRealtimeChange('activities', payload)
      )
      .subscribe((status) => {
        const connText = document.getElementById('header-conn-text');
        if (status === 'SUBSCRIBED') {
          console.log('[Supabase Realtime] Subscribed to real-time events on all 6 tables');
          if (connText) connText.textContent = 'Supabase Live (Realtime)';
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.warn('[Supabase Realtime] Status notification:', status);
        }
      });
  } catch (err) {
    console.warn('[Supabase Realtime] Setup error:', err);
  }
}

// Handler for incoming database changes from other users
function handleRealtimeChange(table, payload) {
  const { eventType, new: newRecord, old: oldRecord } = payload;
  console.log(`[Supabase Realtime Event] ${table} -> ${eventType}`, newRecord || oldRecord);

  // Directly reconcile local state for sub-second UI response
  if (table === 'master_items') {
    if (eventType === 'INSERT' && newRecord) {
      if (!state.masterItems.some(i => i.id === newRecord.id)) {
        state.masterItems.unshift(newRecord);
      }
    } else if (eventType === 'UPDATE' && newRecord) {
      const idx = state.masterItems.findIndex(i => i.id === newRecord.id);
      if (idx !== -1) state.masterItems[idx] = newRecord;
      else state.masterItems.unshift(newRecord);
    } else if (eventType === 'DELETE' && oldRecord) {
      state.masterItems = state.masterItems.filter(i => i.id !== oldRecord.id);
    }
  } else if (table === 'stock_transactions') {
    if (eventType === 'INSERT' && newRecord) {
      if (!state.stockTransactions.some(t => t.id === newRecord.id)) {
        state.stockTransactions.unshift(newRecord);
      }
    } else if (eventType === 'UPDATE' && newRecord) {
      const idx = state.stockTransactions.findIndex(t => t.id === newRecord.id);
      if (idx !== -1) state.stockTransactions[idx] = newRecord;
      else state.stockTransactions.unshift(newRecord);
    } else if (eventType === 'DELETE' && oldRecord) {
      state.stockTransactions = state.stockTransactions.filter(t => t.id !== oldRecord.id);
    }
  } else if (table === 'department_movements') {
    if (eventType === 'INSERT' && newRecord) {
      if (!state.departmentMovements.some(m => m.id === newRecord.id)) {
        state.departmentMovements.unshift(newRecord);
      }
    } else if (eventType === 'UPDATE' && newRecord) {
      const idx = state.departmentMovements.findIndex(m => m.id === newRecord.id);
      if (idx !== -1) state.departmentMovements[idx] = newRecord;
      else state.departmentMovements.unshift(newRecord);
    } else if (eventType === 'DELETE' && oldRecord) {
      state.departmentMovements = state.departmentMovements.filter(m => m.id !== oldRecord.id);
    }
  } else if (table === 'purchase_orders') {
    if (eventType === 'INSERT' && newRecord) {
      if (!state.purchaseOrders.some(p => p.id === newRecord.id)) {
        state.purchaseOrders.unshift(newRecord);
      }
    } else if (eventType === 'UPDATE' && newRecord) {
      const idx = state.purchaseOrders.findIndex(p => p.id === newRecord.id);
      if (idx !== -1) state.purchaseOrders[idx] = newRecord;
      else state.purchaseOrders.unshift(newRecord);
    } else if (eventType === 'DELETE' && oldRecord) {
      state.purchaseOrders = state.purchaseOrders.filter(p => p.id !== oldRecord.id);
    }
  } else if (table === 'preloved') {
    if (eventType === 'INSERT' && newRecord) {
      if (!state.preloved.some(p => p.id === newRecord.id)) {
        state.preloved.unshift(newRecord);
      }
    } else if (eventType === 'UPDATE' && newRecord) {
      const idx = state.preloved.findIndex(p => p.id === newRecord.id);
      if (idx !== -1) state.preloved[idx] = newRecord;
      else state.preloved.unshift(newRecord);
    } else if (eventType === 'DELETE' && oldRecord) {
      state.preloved = state.preloved.filter(p => p.id !== oldRecord.id);
    }
  } else if (table === 'activities') {
    if (eventType === 'INSERT' && newRecord) {
      if (!state.activities.some(a => a.id === newRecord.id)) {
        state.activities.unshift(newRecord);
      }
    } else if (eventType === 'UPDATE' && newRecord) {
      const idx = state.activities.findIndex(a => a.id === newRecord.id);
      if (idx !== -1) state.activities[idx] = newRecord;
    } else if (eventType === 'DELETE' && oldRecord) {
      state.activities = state.activities.filter(a => a.id !== oldRecord.id);
    }
  }

  // Update local cache and refresh all UI components immediately
  localStorage.setItem(STORAGE_KEYS.DEMO_DATA, JSON.stringify(state));
  refreshAllViews();

  // Debounced full background sync to guarantee comprehensive relational consistency
  clearTimeout(realtimeDebounceTimer);
  realtimeDebounceTimer = setTimeout(() => {
    syncAllFromSupabaseQuietly();
  }, 1000);
}

// Background reconciliation fetcher
async function safeQuery(queryPromise) {
  try {
    const res = await queryPromise;
    return res;
  } catch (e) {
    return { data: null, error: e };
  }
}

async function syncAllFromSupabaseQuietly() {
  if (!isLiveSupabase || !supabaseClient) return;

  try {
    const [
      itemsRes,
      txsRes,
      movementsRes,
      poRes,
      prelovedRes,
      activitiesRes,
      pcsRes,
      pcMovRes,
      pcCompMovRes
    ] = await Promise.all([
      supabaseClient.from('master_items').select('*').order('created_at', { ascending: false }),
      supabaseClient.from('stock_transactions').select('*').order('transaction_date', { ascending: false }),
      supabaseClient.from('department_movements').select('*').order('date', { ascending: false }),
      supabaseClient.from('purchase_orders').select('*').order('date_order', { ascending: false }),
      supabaseClient.from('preloved').select('*').order('date_repaired', { ascending: false }),
      supabaseClient.from('activities').select('*').order('timestamp', { ascending: false }).limit(25),
      safeQuery(supabaseClient.from('pcs').select('*').order('created_at', { ascending: false })),
      safeQuery(supabaseClient.from('pc_movements').select('*').order('timestamp', { ascending: false })),
      safeQuery(supabaseClient.from('pc_component_movements').select('*').order('timestamp', { ascending: false }))
    ]);

    if (!itemsRes.error && itemsRes.data) {
      state.masterItems = itemsRes.data;
      state.stockTransactions = txsRes.data || [];
      state.departmentMovements = movementsRes.data || [];
      state.purchaseOrders = poRes.data || [];
      state.preloved = prelovedRes.data || [];
      state.activities = activitiesRes.data || [];
      if (pcsRes && pcsRes.data) state.pcs = pcsRes.data;
      if (pcMovRes && pcMovRes.data) state.pcMovements = pcMovRes.data;
      if (pcCompMovRes && pcCompMovRes.data) state.pcComponentMovements = pcCompMovRes.data;

      localStorage.setItem(STORAGE_KEYS.DEMO_DATA, JSON.stringify(state));
      refreshAllViews();
    }
  } catch (err) {
    console.warn('[Realtime Sync Quiet Fetch Warning]:', err);
  }
}

function updateConnectionBadge(isLive) {
  const headerText = document.getElementById('header-conn-text');
  const headerStatus = document.getElementById('header-conn-status');
  const settingsBadge = document.getElementById('settings-status-badge');
  const configLabel = document.getElementById('config-status-label');

  if (isLive) {
    if (headerText) headerText.textContent = 'Supabase Live';
    if (headerStatus) {
      headerStatus.className = 'hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-[11px] font-medium text-emerald-300';
    }
    if (settingsBadge) {
      settingsBadge.textContent = 'Connected (Live BaaS & Realtime)';
      settingsBadge.className = 'px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';
    }
    if (configLabel) {
      configLabel.textContent = 'https://copyandi.vercel.app/';
      configLabel.className = 'text-[11px] text-emerald-400 font-medium';
    }
  } else {
    if (headerText) headerText.textContent = 'Demo Mode (Offline)';
    if (headerStatus) {
      headerStatus.className = 'hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950/60 border border-amber-500/40 text-[11px] font-medium text-amber-300';
    }
    if (settingsBadge) {
      settingsBadge.textContent = 'Demo Cache Active';
      settingsBadge.className = 'px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30';
    }
    if (configLabel) {
      configLabel.textContent = 'Demo mode active. Connect URL for live sync.';
      configLabel.className = 'text-[11px] text-slate-400';
    }
  }
}

// ==============================================================================
// 4. DATA ENGINE & SUPABASE SYNC
// ==============================================================================
async function loadApplicationData() {
  if (isLiveSupabase && supabaseClient) {
    try {
      const [
        itemsRes,
        txsRes,
        movementsRes,
        poRes,
        prelovedRes,
        activitiesRes,
        pcsRes,
        pcMovRes,
        pcCompMovRes
      ] = await Promise.all([
        supabaseClient.from('master_items').select('*').order('created_at', { ascending: false }),
        supabaseClient.from('stock_transactions').select('*').order('transaction_date', { ascending: false }),
        supabaseClient.from('department_movements').select('*').order('date', { ascending: false }),
        supabaseClient.from('purchase_orders').select('*').order('date_order', { ascending: false }),
        supabaseClient.from('preloved').select('*').order('date_repaired', { ascending: false }),
        supabaseClient.from('activities').select('*').order('timestamp', { ascending: false }).limit(20),
        safeQuery(supabaseClient.from('pcs').select('*').order('created_at', { ascending: false })),
        safeQuery(supabaseClient.from('pc_movements').select('*').order('timestamp', { ascending: false })),
        safeQuery(supabaseClient.from('pc_component_movements').select('*').order('timestamp', { ascending: false }))
      ]);

      if (!itemsRes.error && itemsRes.data) {
        state.masterItems = itemsRes.data;
        state.stockTransactions = txsRes.data || [];
        state.departmentMovements = movementsRes.data || [];
        state.purchaseOrders = poRes.data || [];
        state.preloved = prelovedRes.data || [];
        state.activities = activitiesRes.data || [];
        state.pcs = (pcsRes && pcsRes.data) || state.pcs || [];
        state.pcMovements = (pcMovRes && pcMovRes.data) || state.pcMovements || [];
        state.pcComponentMovements = (pcCompMovRes && pcCompMovRes.data) || state.pcComponentMovements || [];

        // If no pcs exist in live DB yet, seed initial PCs into local state so app is immediately usable
        if (!state.pcs || state.pcs.length === 0) {
          const seeds = getInitialSeedData();
          state.pcs = seeds.pcs;
          state.pcMovements = seeds.pcMovements;
          state.pcComponentMovements = seeds.pcComponentMovements;
        }

        localStorage.setItem(STORAGE_KEYS.DEMO_DATA, JSON.stringify(state));
        setupSupabaseRealtime();
        refreshAllViews();
        return;
      }
    } catch (err) {
      console.warn('Live fetch error, falling back to local cache:', err);
    }
  }

  const cached = localStorage.getItem(STORAGE_KEYS.DEMO_DATA);
  if (cached) {
    try {
      state = JSON.parse(cached);
    } catch (e) {
      state = getInitialSeedData();
      localStorage.setItem(STORAGE_KEYS.DEMO_DATA, JSON.stringify(state));
    }
  } else {
    state = getInitialSeedData();
    localStorage.setItem(STORAGE_KEYS.DEMO_DATA, JSON.stringify(state));
  }

  state.pcs = state.pcs || [];
  state.pcMovements = state.pcMovements || [];
  state.pcComponentMovements = state.pcComponentMovements || [];

  if (state.pcs.length === 0) {
    const seeds = getInitialSeedData();
    state.pcs = seeds.pcs;
    state.pcMovements = seeds.pcMovements;
    state.pcComponentMovements = seeds.pcComponentMovements;
  }

  refreshAllViews();
}

function persistState() {
  localStorage.setItem(STORAGE_KEYS.DEMO_DATA, JSON.stringify(state));
  refreshAllViews();
}

function logActivity(itemName, category, action, type = 'INVENTORY') {
  const username = currentUser ? currentUser.email : 'admin@hotel.com';
  const newAct = {
    id: `act-${Date.now()}`,
    item_name: itemName,
    category: category || 'GENERAL',
    action: action,
    username: username,
    timestamp: new Date().toISOString(),
    type: type
  };

  state.activities.unshift(newAct);
  if (state.activities.length > 30) state.activities.pop();

  if (isLiveSupabase && supabaseClient) {
    supabaseClient.from('activities').insert(newAct).then(() => {});
  }
}

// Helper to detect if a stock transaction is a unit reduction
function isReductionTx(tx) {
  if (!tx) return false;
  if (tx.type === 'REDUCTION') return true;
  if (typeof tx.remark === 'string' && (
    tx.remark.startsWith('[PENGURANGAN') ||
    tx.remark.startsWith('[REDUCTION') ||
    tx.remark.toLowerCase().includes('pengurangan stok')
  )) {
    return true;
  }
  return false;
}

// ==============================================================================
// 5. INVARIANT STOCK ENGINE
// Available = Total Inbound - Total Reduced - Transferred to Depts + Returned to Inventory
// Dept Held = Received - Returned
// ==============================================================================
function calculateStockMetrics(itemId) {
  const inbounds = state.stockTransactions.filter(t => t.item_id === itemId && !isReductionTx(t));
  const totalInbound = inbounds.reduce((sum, t) => sum + (Number(t.quantity) || 0), 0);

  const reductions = state.stockTransactions.filter(t => t.item_id === itemId && isReductionTx(t));
  const totalReduced = reductions.reduce((sum, t) => sum + (Number(t.quantity) || 0), 0);

  // Transfers include both transfers to hotel departments and components allocated into Workstation PCs
  const transfers = state.departmentMovements.filter(m => m.item_id === itemId && (m.type === 'TRANSFER_TO_DEPARTMENT' || m.type === 'TRANSFER TO PC'));
  const totalTransferred = transfers.reduce((sum, m) => sum + (Number(m.quantity) || 0), 0);

  // Returns include returns from departments and components returned from PCs back to inventory
  const returns = state.departmentMovements.filter(m => m.item_id === itemId && (m.type === 'RETURN_TO_INVENTORY' || m.type === 'RETURN FROM PC'));
  const totalReturned = returns.reduce((sum, m) => sum + (Number(m.quantity) || 0), 0);

  const availableStock = Math.max(0, totalInbound - totalReduced - totalTransferred + totalReturned);

  // Department-specific physical held inventory
  const deptTransfers = state.departmentMovements.filter(m => m.item_id === itemId && m.type === 'TRANSFER_TO_DEPARTMENT');
  const deptReturns = state.departmentMovements.filter(m => m.item_id === itemId && m.type === 'RETURN_TO_INVENTORY');
  const totalHeldByDepts = Math.max(0, deptTransfers.reduce((sum, m) => sum + (Number(m.quantity) || 0), 0) - deptReturns.reduce((sum, m) => sum + (Number(m.quantity) || 0), 0));

  return {
    totalInbound,
    totalReduced,
    totalTransferred,
    totalReturned,
    availableStock,
    totalHeldByDepts
  };
}

function calculateDeptItemStock(deptName, itemId) {
  const received = state.departmentMovements
    .filter(m => m.department === deptName && m.item_id === itemId && m.type === 'TRANSFER_TO_DEPARTMENT')
    .reduce((sum, m) => sum + (Number(m.quantity) || 0), 0);

  const returned = state.departmentMovements
    .filter(m => m.department === deptName && m.item_id === itemId && m.type === 'RETURN_TO_INVENTORY')
    .reduce((sum, m) => sum + (Number(m.quantity) || 0), 0);

  const held = Math.max(0, received - returned);

  return { received, returned, held };
}

function getDeptTotalMetrics(deptName) {
  let totalUnits = 0;
  let totalUniqueItems = 0;

  state.masterItems.forEach(item => {
    const { held } = calculateDeptItemStock(deptName, item.id);
    if (held > 0) {
      totalUnits += held;
      totalUniqueItems += 1;
    }
  });

  return { totalUnits, totalUniqueItems };
}

// ==============================================================================
// 6. GREETING & MOBILE NAVIGATION HELPERS
// ==============================================================================
function getGreetingPrefix(email) {
  if (!email) return 'Admin';
  const raw = email.split('@')[0] || 'Admin';
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

function updateHeroGreeting() {
  const heroTitle = document.getElementById('hero-greeting-title');
  if (heroTitle) {
    const name = getGreetingPrefix(currentUser?.email);
    heroTitle.textContent = `Halo ${name}! Aktivitas apa yang ingin anda lakukan?😉`;
  }
}

function toggleMobileSidebar(forceState) {
  const sidebar = document.getElementById('app-sidebar');
  const overlay = document.getElementById('mobile-sidebar-overlay');
  if (!sidebar) return;

  const isCurrentlyOpen = sidebar.classList.contains('translate-x-0');
  const shouldOpen = typeof forceState === 'boolean' ? forceState : !isCurrentlyOpen;

  if (shouldOpen) {
    sidebar.classList.remove('-translate-x-full');
    sidebar.classList.add('translate-x-0');
    if (overlay) overlay.classList.remove('hidden');
    document.body.classList.add('overflow-hidden', 'md:overflow-auto');
  } else {
    sidebar.classList.add('-translate-x-full');
    sidebar.classList.remove('translate-x-0');
    if (overlay) overlay.classList.add('hidden');
    document.body.classList.remove('overflow-hidden', 'md:overflow-auto');
  }
}

// ==============================================================================
// 7. VIEW ROUTING & SPA TAB MANAGEMENT
// ==============================================================================
function navigateTo(viewId) {
  const previousView = activeView;
  activeView = viewId;
  toggleMobileSidebar(false);

  // Privacy Rule: Leaving RattaBot chat view immediately wipes the in-memory chat session
  if (previousView === 'rattabot' && viewId !== 'rattabot') {
    onExitRattaBotView();
  }

  document.querySelectorAll('.app-view').forEach(el => {
    el.classList.add('hidden');
  });

  const target = document.getElementById(`view-${viewId}`);
  if (target) {
    target.classList.remove('hidden');
  }

  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('bg-slate-800', 'text-white', 'border-l-4', 'border-brand-500');
    btn.classList.add('text-slate-300');
  });

  const activeBtn = document.getElementById(`nav-${viewId}`);
  if (activeBtn) {
    activeBtn.classList.add('bg-slate-800', 'text-white', 'border-l-4', 'border-brand-500');
    activeBtn.classList.remove('text-slate-300');
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (viewId === 'dashboard') renderDashboard();
  if (viewId === 'inventory') renderInventoryTable();
  if (viewId === 'departmental') renderDepartmentalView();
  if (viewId === 'pc-management') renderPCManagement();
  if (viewId === 'pc-movements') renderPCMovements();
  if (viewId === 'motion') renderMotionTable();
  if (viewId === 'purchase-orders') renderPOTable();
  if (viewId === 'preloved') renderPrelovedTable();
  if (viewId === 'monthly') renderMonthlyView();
  if (viewId === 'settings') {
    initSettingsForm();
    initGeminiSettings();
  }
  if (viewId === 'rattabot') {
    onEnterRattaBotView();
  }
}

function refreshAllViews() {
  updateHeaderCounters();
  renderDashboard();
  renderInventoryTable();
  renderDepartmentalView();
  renderPCManagement();
  renderPCMovements();
  renderMotionTable();
  renderPOTable();
  renderPrelovedTable();
  renderMonthlyView();
}

function updateHeaderCounters() {
  let totalInventoryStock = 0;
  let totalDeptStock = 0;

  state.masterItems.forEach(item => {
    const metrics = calculateStockMetrics(item.id);
    totalInventoryStock += metrics.availableStock;
    totalDeptStock += metrics.totalHeldByDepts;
  });

  const headerStock = document.getElementById('header-stock-counter');
  const headerDept = document.getElementById('header-dept-counter');

  if (headerStock) headerStock.textContent = totalInventoryStock;
  if (headerDept) headerDept.textContent = totalDeptStock;
}

// ==============================================================================
// 7. DASHBOARD RENDERING
// ==============================================================================
function renderDashboard() {
  updateHeroGreeting();
  let totalInventoryStock = 0;
  let totalDeptStock = 0;

  state.masterItems.forEach(item => {
    const metrics = calculateStockMetrics(item.id);
    totalInventoryStock += metrics.availableStock;
    totalDeptStock += metrics.totalHeldByDepts;
  });

  const statAvailable = document.getElementById('stat-available-stock');
  const statDept = document.getElementById('stat-dept-stock');
  const statMaster = document.getElementById('stat-master-items');
  const statPO = document.getElementById('stat-po-count');
  const statPOPending = document.getElementById('stat-po-pending');
  const statPreloved = document.getElementById('stat-preloved-count');
  const statMovements = document.getElementById('stat-movements-count');

  if (statAvailable) statAvailable.textContent = totalInventoryStock;
  if (statDept) statDept.textContent = totalDeptStock;
  if (statMaster) statMaster.textContent = state.masterItems.length;

  const pendingPOs = state.purchaseOrders.filter(p => p.status === 'BELUM DATANG').length;
  if (statPO) statPO.textContent = state.purchaseOrders.length;
  if (statPOPending) statPOPending.textContent = `${pendingPOs} Pending Delivery`;

  if (statPreloved) statPreloved.textContent = state.preloved.length;
  if (statMovements) statMovements.textContent = state.departmentMovements.length;

  const statPC = document.getElementById('stat-pc-count');
  const statPCSub = document.getElementById('stat-pc-subtext');
  const totalPCs = state.pcs ? state.pcs.length : 0;
  const inDeptPCs = state.pcs ? state.pcs.filter(p => !!p.department).length : 0;
  const readyPCs = totalPCs - inDeptPCs;
  if (statPC) statPC.textContent = totalPCs;
  if (statPCSub) statPCSub.textContent = `${inDeptPCs} Dept · ${readyPCs} Storage`;

  // 7 Departments Quick Glance Grid
  const deptsGrid = document.getElementById('dashboard-depts-grid');
  if (deptsGrid) {
    deptsGrid.innerHTML = DEPARTMENTS.map(dept => {
      const { totalUnits, totalUniqueItems } = getDeptTotalMetrics(dept);
      return `
        <div
          onclick="selectDepartmentAndNavigate('${dept}')"
          class="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-brand-500/50 cursor-pointer transition group"
        >
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-300 group-hover:text-white transition">${dept}</span>
            <i class="fa-solid fa-arrow-up-right-from-square text-[10px] text-slate-600 group-hover:text-brand-400 transition"></i>
          </div>
          <div class="mt-2 flex items-baseline gap-2">
            <span class="text-xl font-bold font-mono text-amber-400">${totalUnits}</span>
            <span class="text-[10px] text-slate-500">units held</span>
          </div>
          <div class="text-[10px] text-slate-400 mt-1">${totalUniqueItems} distinct items</div>
        </div>
      `;
    }).join('');
  }

  // Category Breakdown
  const catContainer = document.getElementById('dashboard-categories-container');
  if (catContainer) {
    const pcCount = state.masterItems.filter(i => i.category === 'PC ITEMS').length;
    const netCount = state.masterItems.filter(i => i.category === 'NETWORK ITEMS').length;
    const cctvCount = state.masterItems.filter(i => i.category === 'CCTV & TV ITEMS').length;
    const lockCount = state.masterItems.filter(i => i.category === 'LOCK SYSTEM').length;
    const total = state.masterItems.length || 1;

    catContainer.innerHTML = `
      <div>
        <div class="flex justify-between text-xs mb-1">
          <span class="text-slate-300 font-medium">PC ITEMS</span>
          <span class="text-slate-400 font-mono font-bold">${pcCount} (${Math.round((pcCount / total) * 100)}%)</span>
        </div>
        <div class="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
          <div class="h-full bg-cyan-400 rounded-full" style="width: ${(pcCount / total) * 100}%"></div>
        </div>
      </div>
      <div>
        <div class="flex justify-between text-xs mb-1">
          <span class="text-slate-300 font-medium">NETWORK ITEMS</span>
          <span class="text-slate-400 font-mono font-bold">${netCount} (${Math.round((netCount / total) * 100)}%)</span>
        </div>
        <div class="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
          <div class="h-full bg-indigo-500 rounded-full" style="width: ${(netCount / total) * 100}%"></div>
        </div>
      </div>
      <div>
        <div class="flex justify-between text-xs mb-1">
          <span class="text-slate-300 font-medium">CCTV & TV ITEMS</span>
          <span class="text-slate-400 font-mono font-bold">${cctvCount} (${Math.round((cctvCount / total) * 100)}%)</span>
        </div>
        <div class="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
          <div class="h-full bg-amber-400 rounded-full" style="width: ${(cctvCount / total) * 100}%"></div>
        </div>
      </div>
      <div>
        <div class="flex justify-between text-xs mb-1">
          <span class="text-slate-300 font-medium">LOCK SYSTEM</span>
          <span class="text-slate-400 font-mono font-bold">${lockCount} (${Math.round((lockCount / total) * 100)}%)</span>
        </div>
        <div class="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
          <div class="h-full bg-emerald-400 rounded-full" style="width: ${(lockCount / total) * 100}%"></div>
        </div>
      </div>
    `;
  }

  // Recent Activities
  const actList = document.getElementById('dashboard-activities-list');
  if (actList) {
    const recent = state.activities.slice(0, 5);
    if (recent.length === 0) {
      actList.innerHTML = `<div class="text-xs text-slate-500 text-center py-4">No recent activities recorded.</div>`;
    } else {
      actList.innerHTML = recent.map(a => {
        let icon = 'fa-boxes-stacked';
        let color = 'text-brand-400';
        if (a.action === 'Transfer') { icon = 'fa-share-from-square'; color = 'text-amber-400'; }
        if (a.action === 'Return') { icon = 'fa-arrow-rotate-left'; color = 'text-emerald-400'; }
        if (a.action === 'Received') { icon = 'fa-file-invoice'; color = 'text-blue-400'; }
        if (a.action === 'Reduced') { icon = 'fa-circle-minus'; color = 'text-rose-400'; }

        const dateStr = a.timestamp ? new Date(a.timestamp).toLocaleDateString('en-GB') : '';

        return `
          <div class="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-slate-800 ${color} flex items-center justify-center">
                <i class="fa-solid ${icon}"></i>
              </div>
              <div>
                <div class="font-semibold text-white">${escapeHtml(a.item_name)}</div>
                <div class="text-[11px] text-slate-400">${a.action} by ${escapeHtml(a.username || 'System')}</div>
              </div>
            </div>
            <span class="text-[10px] font-mono text-slate-500">${dateStr}</span>
          </div>
        `;
      }).join('');
    }
  }
}

function selectDepartmentAndNavigate(deptName) {
  activeDept = deptName;
  navigateTo('departmental');
}

// ==============================================================================
// 8. INVENTORY VIEW RENDERING
// ==============================================================================
function setInvCategoryFilter(cat) {
  invCategoryFilter = cat;
  document.querySelectorAll('.inv-cat-pill').forEach(btn => {
    if (btn.dataset.cat === cat) {
      btn.className = 'inv-cat-pill px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-600 text-white';
    } else {
      btn.className = 'inv-cat-pill px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white';
    }
  });
  renderInventoryTable();
}

function renderInventoryTable() {
  const tbody = document.getElementById('inventory-table-body');
  const emptyState = document.getElementById('inv-empty-state');
  const search = (document.getElementById('inv-search')?.value || '').toLowerCase();

  if (!tbody) return;

  const filtered = state.masterItems.filter(item => {
    const matchCat = invCategoryFilter === 'ALL' || item.category === invCategoryFilter;
    const matchSearch =
      item.item_name.toLowerCase().includes(search) ||
      (item.item_code && item.item_code.toLowerCase().includes(search)) ||
      (item.remark && item.remark.toLowerCase().includes(search));
    return matchCat && matchSearch;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = '';
    emptyState?.classList.remove('hidden');
    return;
  }

  emptyState?.classList.add('hidden');

  tbody.innerHTML = filtered.map(item => {
    const { totalInbound, totalTransferred, totalReturned, availableStock } = calculateStockMetrics(item.id);

    const photoImg = item.photo_url
      ? `<img src="${item.photo_url}" onclick="openLightbox('${item.photo_url}', '${escapeHtml(item.item_name)}')" class="w-10 h-10 rounded-lg object-cover cursor-pointer hover:scale-105 transition border border-slate-700 shrink-0">`
      : `<div class="w-10 h-10 rounded-lg bg-slate-800 text-slate-500 flex items-center justify-center text-sm border border-slate-700 shrink-0"><i class="fa-solid fa-box"></i></div>`;

    return `
      <tr class="hover:bg-slate-900/50 transition">
        <td class="py-3 px-4 min-w-[220px]">
          <div
            class="flex items-center gap-3 cursor-pointer group/item"
            onclick="openItemInboundHistoryModal('${item.id}')"
            title="Klik untuk melihat histori stok masuk item ini"
          >
            ${photoImg}
            <div class="min-w-0">
              <div class="font-bold text-white group-hover/item:text-cyan-400 transition flex items-center gap-1.5">
                <span class="truncate">${escapeHtml(item.item_name)}</span>
                <i class="fa-solid fa-clock-rotate-left text-[11px] text-cyan-400 opacity-60 group-hover/item:opacity-100 transition shrink-0"></i>
              </div>
              <div class="text-[11px] text-slate-400 font-mono">${escapeHtml(item.item_code || 'SKU-GEN')}</div>
            </div>
          </div>
        </td>
        <td class="py-3 px-4 whitespace-nowrap">
          ${formatCategoryBadge(item.category)}
        </td>
        <td class="py-3 px-4 text-center font-mono font-semibold text-slate-300 whitespace-nowrap">${totalInbound}</td>
        <td class="py-3 px-4 text-center font-mono text-amber-400 whitespace-nowrap">${totalTransferred}</td>
        <td class="py-3 px-4 text-center font-mono text-emerald-400 whitespace-nowrap">${totalReturned}</td>
        <td class="py-3 px-4 text-center font-mono text-sm font-bold text-white bg-slate-900/40 whitespace-nowrap">${availableStock}</td>
        <td class="py-3 px-4 whitespace-nowrap">${formatStockStatusBadge(availableStock)}</td>
        <td class="py-3 px-4 text-right whitespace-nowrap">
          <div class="flex items-center justify-end gap-1.5">
            <button
              type="button"
              onclick="openItemInboundHistoryModal('${item.id}')"
              title="Lihat Histori Stok Masuk"
              class="p-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600 text-cyan-300 hover:text-white transition text-xs border border-cyan-500/30 shrink-0"
            >
              <i class="fa-solid fa-clock-rotate-left"></i>
            </button>
            <button
              type="button"
              onclick="openModalTransfer('${item.id}')"
              title="Transfer to Department"
              class="p-1.5 rounded-lg bg-brand-600/20 hover:bg-brand-600 text-brand-300 hover:text-white transition text-xs shrink-0"
            >
              <i class="fa-solid fa-share-from-square"></i>
            </button>
            <button
              type="button"
              onclick="openModalInbound('${item.id}')"
              title="Add Inbound Stock (+)"
              class="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white transition text-xs shrink-0"
            >
              <i class="fa-solid fa-plus"></i>
            </button>
            <button
              type="button"
              onclick="openModalReduceStock('${item.id}')"
              title="Kurangi Stok Unit (-)"
              class="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white transition text-xs border border-rose-500/30 shrink-0"
            >
              <i class="fa-solid fa-minus"></i>
            </button>
            <button
              type="button"
              onclick="confirmDeleteMasterItem('${item.id}', '${escapeHtml(item.item_name)}')"
              title="Delete Item"
              class="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-400 hover:text-white transition text-xs shrink-0"
            >
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// ==============================================================================
// 9. CREATE MASTER ITEM HANDLER
// ==============================================================================
function handleImageUploadPreview(event, previewId) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    pendingPhotoDataUrl = e.target.result;
    const preview = document.getElementById(previewId);
    const container = document.getElementById(`${previewId}-container`);
    if (preview) preview.src = pendingPhotoDataUrl;
    if (container) container.classList.remove('hidden');
  };
  reader.readAsDataURL(file);
}

function handleImageUrlPreview(url, previewId) {
  if (!url || !url.startsWith('http')) return;
  pendingPhotoDataUrl = url;
  const preview = document.getElementById(previewId);
  const container = document.getElementById(`${previewId}-container`);
  if (preview) preview.src = url;
  if (container) container.classList.remove('hidden');
}

function clearImagePreview(previewId, containerId) {
  pendingPhotoDataUrl = null;
  const preview = document.getElementById(previewId);
  const container = document.getElementById(containerId);
  if (preview) preview.src = '';
  if (container) container.classList.add('hidden');
  const fileInput = document.getElementById('create-item-file');
  if (fileInput) fileInput.value = '';
  const urlInput = document.getElementById('create-item-url');
  if (urlInput) urlInput.value = '';
}

async function handleCreateMasterItemSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('create-item-name').value.trim();
  const category = document.getElementById('create-item-category').value;
  const remark = document.getElementById('create-item-remark').value.trim();
  const fileInput = document.getElementById('create-item-file'); // Input file fisik
  const urlInput = document.getElementById('create-item-url').value.trim();

  if (!name || !category) {
    showToast('Nama Barang dan Kategori wajib diisi!', 'error');
    return;
  }

  const prefix = category === 'PC ITEMS' ? 'PC' : category === 'NETWORK ITEMS' ? 'NET' : category === 'LOCK SYSTEM' ? 'LCK' : 'CCTV';
  const randomCode = `${prefix}-${Math.floor(100 + Math.random() * 900)}`;
  const itemId = `item-${Date.now()}`;
  
  let finalPhotoUrl = null;

  // LOGIKA BARU: Unggah file biner asli ke Supabase Storage Bucket jika ada file yang dipilih
  if (isLiveSupabase && supabaseClient && fileInput && fileInput.files.length > 0) {
    const file = fileInput.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${itemId}.${fileExt}`; // Membuat nama file unik berdasarkan ID barang
    const filePath = `${fileName}`;

    showToast('Uploading image to Supabase Storage...', 'info');

    // Proses upload ke bucket 'photos'
    const { data: storageData, error: storageError } = await supabaseClient
      .storage
      .from('photos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (storageError) {
      console.error('Gagal upload ke Storage:', storageError.message);
      showToast(`Gagal upload foto: ${storageError.message}`, 'error');
    } else {
      // Dapatkan URL Publik dari file yang berhasil diunggah
      const { data: publicUrlData } = supabaseClient
        .storage
        .from('photos')
        .getPublicUrl(filePath);
        
      finalPhotoUrl = publicUrlData.publicUrl;
    }
  } else if (urlInput) {
    // Jika user menginput URL gambar eksternal langsung
    finalPhotoUrl = urlInput;
  } else {
    // Fallback ke Base64 preview jika offline mode
    finalPhotoUrl = pendingPhotoDataUrl;
  }

  const newItem = {
    id: itemId,
    item_code: randomCode,
    item_name: name,
    category: category,
    remark: remark || null,
    photo_url: finalPhotoUrl, // Menyimpan URL publik resmi dari bucket Supabase
    is_active: true,
    created_at: new Date().toISOString(),
    created_by: currentUser ? currentUser.email : 'admin@hotel.com',
    updated_at: new Date().toISOString()
  };

  if (isLiveSupabase && supabaseClient) {
    const { error } = await supabaseClient.from('master_items').insert(newItem);
    if (error) {
      console.warn('Supabase insert master item error:', error);
    }
  }

  state.masterItems.unshift(newItem);
  logActivity(name, category, 'Added', 'INVENTORY');
  persistState();
  
  document.getElementById('form-create-master-item').reset();
  clearImagePreview('create-item-preview', 'create-item-preview-container');
  showToast(`Master Item "${name}" berhasil dibuat dengan foto di cloud!`, 'success');
  navigateTo('inventory');
}

async function confirmDeleteMasterItem(itemId, itemName) {
  if (!confirm(`Hapus master barang "${itemName}"? Seluruh transaksi terkait akan ikut dihapus.`)) {
    return;
  }

  if (isLiveSupabase && supabaseClient) {
    await supabaseClient.from('master_items').delete().eq('id', itemId);
  }

  state.masterItems = state.masterItems.filter(i => i.id !== itemId);
  state.stockTransactions = state.stockTransactions.filter(t => t.item_id !== itemId);
  state.departmentMovements = state.departmentMovements.filter(m => m.item_id !== itemId);

  logActivity(itemName, 'GENERAL', 'Deleted', 'INVENTORY');
  persistState();
  showToast(`Item "${itemName}" berhasil dihapus.`, 'info');
}

// ==============================================================================
// 10. DEPARTMENTAL ASSET VIEW & INVARIANT TRANSFER/RETURN
// ==============================================================================
function renderDepartmentalView() {
  const tabsBar = document.getElementById('dept-tabs-bar');
  const tbody = document.getElementById('dept-assets-table-body');
  const emptyState = document.getElementById('dept-empty-state');
  const title = document.getElementById('dept-active-title');
  const subtitle = document.getElementById('dept-active-subtitle');

  if (title) title.textContent = activeDept;

  if (tabsBar) {
    tabsBar.innerHTML = DEPARTMENTS.map(dept => {
      const { totalUnits } = getDeptTotalMetrics(dept);
      const isActive = dept === activeDept;
      const activeClass = isActive
        ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20'
        : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800';

      return `
        <button
          type="button"
          onclick="switchActiveDepartment('${dept}')"
          class="px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition ${activeClass}"
        >
          <span>${dept}</span>
          <span class="px-1.5 py-0.5 rounded-md text-[10px] font-mono ${isActive ? 'bg-slate-950 text-amber-300' : 'bg-slate-800 text-slate-400'}">
            ${totalUnits}
          </span>
        </button>
      `;
    }).join('');
  }

  const deptItems = [];
  state.masterItems.forEach(item => {
    if (deptCategoryFilter !== 'ALL' && item.category !== deptCategoryFilter) {
      return;
    }

    const { received, returned, held } = calculateDeptItemStock(activeDept, item.id);
    if (held > 0 || received > 0) {
      const lastMov = state.departmentMovements
        .filter(m => m.department === activeDept && m.item_id === item.id)
        .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

      deptItems.push({
        item,
        held,
        received,
        returned,
        lastRecipient: lastMov?.recipient_name || '-',
        lastDate: lastMov?.date || '-'
      });
    }
  });

  const { totalUnits, totalUniqueItems } = getDeptTotalMetrics(activeDept);
  if (subtitle) {
    subtitle.textContent = `Total ${totalUniqueItems} jenis hardware, ${totalUnits} unit aktif dipegang oleh departemen ${activeDept}.`;
  }

  if (deptItems.length === 0) {
    if (tbody) tbody.innerHTML = '';
    emptyState?.classList.remove('hidden');
    renderDepartmentWorkstations(activeDept);
    return;
  }

  emptyState?.classList.add('hidden');

  if (tbody) {
    tbody.innerHTML = deptItems.map(({ item, held, received, returned, lastRecipient, lastDate }) => {
      const photoImg = item.photo_url
        ? `<img src="${item.photo_url}" onclick="openLightbox('${item.photo_url}', '${escapeHtml(item.item_name)}')" class="w-10 h-10 rounded-lg object-cover cursor-pointer hover:scale-105 transition border border-slate-700">`
        : `<div class="w-10 h-10 rounded-lg bg-slate-800 text-slate-500 flex items-center justify-center text-sm border border-slate-700"><i class="fa-solid fa-box"></i></div>`;

      return `
        <tr class="hover:bg-slate-900/50 transition">
          <td class="py-3 px-4 min-w-[200px]">
            <div class="flex items-center gap-3">
              ${photoImg}
              <div class="min-w-0">
                <div class="font-bold text-white truncate">${escapeHtml(item.item_name)}</div>
                <div class="text-[11px] text-slate-400 font-mono">${escapeHtml(item.item_code || 'SKU-GEN')}</div>
              </div>
            </div>
          </td>
          <td class="py-3 px-4 whitespace-nowrap">
            ${formatCategoryBadge(item.category)}
          </td>
          <td class="py-3 px-4 text-center font-mono font-bold text-amber-400 text-sm bg-slate-900/40 whitespace-nowrap">
            ${held}
          </td>
          <td class="py-3 px-4 text-center font-mono text-slate-300 whitespace-nowrap">${received}</td>
          <td class="py-3 px-4 text-center font-mono text-emerald-400 whitespace-nowrap">${returned}</td>
          <td class="py-3 px-4 text-slate-300 whitespace-nowrap">${escapeHtml(lastRecipient)}</td>
          <td class="py-3 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">${lastDate}</td>
          <td class="py-3 px-4 text-right whitespace-nowrap">
            ${held > 0 ? `
              <button
                type="button"
                onclick="openModalReturn('${activeDept}', '${item.id}')"
                class="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 font-semibold text-xs transition shrink-0"
              >
                Return to IT
              </button>
            ` : `<span class="text-slate-600 text-[11px]">All returned</span>`}
          </td>
        </tr>
      `;
    }).join('');
  }

  renderDepartmentWorkstations(activeDept);
}

function switchActiveDepartment(deptName) {
  activeDept = deptName;
  renderDepartmentalView();
}

function setDeptCatFilter(cat) {
  deptCategoryFilter = cat;
  document.querySelectorAll('.dept-cat-pill').forEach(btn => {
    if (btn.dataset.cat === cat) {
      btn.className = 'dept-cat-pill px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-600 text-white';
    } else {
      btn.className = 'dept-cat-pill px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white';
    }
  });
  renderDepartmentalView();
}

// ==============================================================================
// 11. MODAL WORKFLOWS (INBOUND, TRANSFER, RETURN, PO, PRELOVED)
// ==============================================================================
function openModal(modalId) {
  document.getElementById(modalId)?.classList.remove('hidden');
}

function closeModal(modalId) {
  document.getElementById(modalId)?.classList.add('hidden');
}

// Item Stock History Modal Logic (Inbound & Pengurangan Unit)
let currentHistoryItemId = null;

function openItemInboundHistoryModal(itemId) {
  const item = state.masterItems.find(i => i.id === itemId);
  if (!item) return;

  currentHistoryItemId = itemId;

  // Set modal header details
  const nameEl = document.getElementById('modal-hist-item-name');
  const catBadge = document.getElementById('modal-hist-category-badge');
  const codeBadge = document.getElementById('modal-hist-code-badge');
  const subtitle = document.getElementById('modal-hist-subtitle');

  if (nameEl) nameEl.textContent = item.item_name;
  if (catBadge) catBadge.textContent = item.category;
  if (codeBadge) codeBadge.textContent = item.item_code || 'SKU-GEN';
  if (subtitle) subtitle.textContent = `Katalog IT: ${item.item_code || '-'} | Kategori: ${item.category}`;

  // Filter all stock transactions (inbound & reductions) for this item
  const txs = state.stockTransactions
    .filter(t => t.item_id === itemId)
    .sort((a, b) => new Date(b.transaction_date || 0) - new Date(a.transaction_date || 0));

  const totalIn = txs.filter(t => !isReductionTx(t)).reduce((sum, t) => sum + (Number(t.quantity) || 0), 0);
  const totalReduced = txs.filter(t => isReductionTx(t)).reduce((sum, t) => sum + (Number(t.quantity) || 0), 0);
  const metrics = calculateStockMetrics(itemId);

  const totalInEl = document.getElementById('modal-hist-total-in');
  const totalReducedEl = document.getElementById('modal-hist-total-reduced');
  const countEl = document.getElementById('modal-hist-tx-count');
  const activeStockEl = document.getElementById('modal-hist-active-stock');

  if (totalInEl) totalInEl.textContent = `${totalIn} unit`;
  if (totalReducedEl) totalReducedEl.textContent = `${totalReduced} unit`;
  if (countEl) countEl.textContent = `${txs.length} kali`;
  if (activeStockEl) activeStockEl.textContent = `${metrics.availableStock} unit`;

  const tbody = document.getElementById('modal-hist-tbody');
  const empty = document.getElementById('modal-hist-empty');

  if (tbody) {
    if (txs.length === 0) {
      tbody.innerHTML = '';
      empty?.classList.remove('hidden');
    } else {
      empty?.classList.add('hidden');
      tbody.innerHTML = txs.map((tx, idx) => {
        const isRed = isReductionTx(tx);
        const typeBadge = isRed
          ? `<span class="badge-pill px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30 whitespace-nowrap"><i class="fa-solid fa-minus text-[9px] mr-1"></i>Pengurangan</span>`
          : `<span class="badge-pill px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 whitespace-nowrap"><i class="fa-solid fa-plus text-[9px] mr-1"></i>Stok Masuk</span>`;
        const qtyDisplay = isRed
          ? `<span class="font-bold text-rose-400 font-mono">-${tx.quantity}</span>`
          : `<span class="font-bold text-cyan-400 font-mono">+${tx.quantity}</span>`;

        let displayRemark = escapeHtml(tx.remark || '-');
        if (displayRemark.startsWith('[PENGURANGAN STOK]')) {
          displayRemark = displayRemark.replace('[PENGURANGAN STOK]', '<span class="text-rose-400 font-semibold">[PENGURANGAN]</span>');
        }

        return `
          <tr class="hover:bg-slate-900/60 transition ${isRed ? 'bg-rose-950/10' : ''}">
            <td class="py-2.5 px-3 text-center font-mono text-slate-500">${idx + 1}</td>
            <td class="py-2.5 px-3 font-mono text-slate-300 whitespace-nowrap">${tx.transaction_date || '-'}</td>
            <td class="py-2.5 px-3 whitespace-nowrap">${typeBadge}</td>
            <td class="py-2.5 px-3 text-center font-mono whitespace-nowrap">${qtyDisplay}</td>
            <td class="py-2.5 px-4 text-slate-300">${displayRemark}</td>
            <td class="py-2.5 px-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">${escapeHtml(tx.created_by || 'IT Staff')}</td>
          </tr>
        `;
      }).join('');
    }
  }

  openModal('modal-item-inbound-history');
}

function openInboundForCurrentItem() {
  if (!currentHistoryItemId) return;
  closeModal('modal-item-inbound-history');
  openModalInbound(currentHistoryItemId);
}

function openReduceForCurrentItem() {
  if (!currentHistoryItemId) return;
  closeModal('modal-item-inbound-history');
  openModalReduceStock(currentHistoryItemId);
}

// ==============================================================================
// 11B. STOCK REDUCTION WORKFLOW (TWO-STEP CONFIRMATION)
// ==============================================================================
let currentReduceItem = null;
let currentReducePendingData = null;

function openModalReduceStock(itemId) {
  const item = state.masterItems.find(i => i.id === itemId);
  if (!item) return;

  const { availableStock } = calculateStockMetrics(itemId);
  if (availableStock <= 0) {
    showToast(`Stok untuk "${item.item_name}" sudah 0. Tidak ada unit yang dapat dikurangi!`, 'warning');
    return;
  }

  currentReduceItem = item;
  currentReducePendingData = null;

  // Populate overview elements
  const catEl = document.getElementById('reduce-item-cat');
  const codeEl = document.getElementById('reduce-item-code');
  const nameEl = document.getElementById('reduce-item-name');
  const stockEl = document.getElementById('reduce-current-stock-badge');
  const itemIdInput = document.getElementById('reduce-item-id');
  const qtyInput = document.getElementById('reduce-qty');
  const qtyHint = document.getElementById('reduce-qty-hint');
  const reasonInput = document.getElementById('reduce-reason');
  const dateInput = document.getElementById('reduce-date');

  if (catEl) catEl.textContent = item.category;
  if (codeEl) codeEl.textContent = item.item_code || 'SKU-GEN';
  if (nameEl) nameEl.textContent = item.item_name;
  if (stockEl) stockEl.textContent = `${availableStock} unit`;
  if (itemIdInput) itemIdInput.value = itemId;

  if (qtyInput) {
    qtyInput.value = '1';
    qtyInput.max = String(availableStock);
  }
  if (qtyHint) {
    qtyHint.textContent = `Maksimal unit yang dapat dikurangi: ${availableStock} unit`;
  }
  if (reasonInput) reasonInput.value = '';
  if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];

  // Reset to Step 1 view
  document.getElementById('reduce-step-1')?.classList.remove('hidden');
  document.getElementById('reduce-step-2')?.classList.add('hidden');
  const chk = document.getElementById('reduce-confirm-checkbox');
  if (chk) chk.checked = false;
  const btnExec = document.getElementById('btn-execute-reduce');
  if (btnExec) btnExec.disabled = true;

  openModal('modal-reduce-stock');
}

function setReduceReason(reasonText) {
  const reasonInput = document.getElementById('reduce-reason');
  if (reasonInput) {
    reasonInput.value = reasonText;
    reasonInput.focus();
  }
}

function proceedToReduceConfirmStep() {
  if (!currentReduceItem) return;

  const qtyInput = document.getElementById('reduce-qty');
  const reasonInput = document.getElementById('reduce-reason');
  const dateInput = document.getElementById('reduce-date');

  const qty = parseInt(qtyInput ? qtyInput.value : '0', 10);
  const reason = reasonInput ? reasonInput.value.trim() : '';
  const date = dateInput ? dateInput.value : new Date().toISOString().split('T')[0];

  const { availableStock } = calculateStockMetrics(currentReduceItem.id);

  if (isNaN(qty) || qty <= 0) {
    showToast('Masukkan jumlah unit pengurangan yang valid (minimal 1 unit)!', 'error');
    qtyInput?.focus();
    return;
  }

  if (qty > availableStock) {
    showToast(`Jumlah pengurangan (${qty}) melebihi stok yang tersedia (${availableStock} unit)!`, 'error');
    qtyInput?.focus();
    return;
  }

  if (!reason) {
    showToast('Alasan pengurangan unit wajib diisi!', 'error');
    reasonInput?.focus();
    return;
  }

  currentReducePendingData = {
    itemId: currentReduceItem.id,
    itemName: currentReduceItem.item_name,
    category: currentReduceItem.category,
    currentStock: availableStock,
    reduceQty: qty,
    remainingStock: availableStock - qty,
    reason: reason,
    date: date,
    user: currentUser ? currentUser.email : 'admin@hotel.com'
  };

  // Populate Step 2 Confirmation Screen
  const confirmItemName = document.getElementById('confirm-item-name');
  const confirmCurrentStock = document.getElementById('confirm-current-stock');
  const confirmReduceQty = document.getElementById('confirm-reduce-qty');
  const confirmRemainingStock = document.getElementById('confirm-remaining-stock');
  const confirmReason = document.getElementById('confirm-reason');
  const confirmUser = document.getElementById('confirm-user');

  if (confirmItemName) confirmItemName.textContent = currentReducePendingData.itemName;
  if (confirmCurrentStock) confirmCurrentStock.textContent = `${currentReducePendingData.currentStock} unit`;
  if (confirmReduceQty) confirmReduceQty.textContent = `-${currentReducePendingData.reduceQty} unit`;
  if (confirmRemainingStock) {
    confirmRemainingStock.textContent = `${currentReducePendingData.remainingStock} unit`;
    confirmRemainingStock.className = currentReducePendingData.remainingStock === 0
      ? 'font-mono font-bold text-rose-400 text-sm'
      : 'font-mono font-bold text-emerald-400 text-sm';
  }
  if (confirmReason) confirmReason.textContent = currentReducePendingData.reason;
  if (confirmUser) confirmUser.textContent = currentReducePendingData.user;

  // Uncheck acknowledgment checkbox and disable submit button initially
  const chk = document.getElementById('reduce-confirm-checkbox');
  if (chk) chk.checked = false;
  const btnExec = document.getElementById('btn-execute-reduce');
  if (btnExec) btnExec.disabled = true;

  // Transition to Step 2
  document.getElementById('reduce-step-1')?.classList.add('hidden');
  document.getElementById('reduce-step-2')?.classList.remove('hidden');
}

function backToReduceStep1() {
  document.getElementById('reduce-step-2')?.classList.add('hidden');
  document.getElementById('reduce-step-1')?.classList.remove('hidden');
}

function toggleReduceConfirmButton() {
  const chk = document.getElementById('reduce-confirm-checkbox');
  const btn = document.getElementById('btn-execute-reduce');
  if (btn) {
    btn.disabled = !(chk && chk.checked);
  }
}

async function executeReduceStock() {
  if (!currentReducePendingData) return;

  const { itemId, itemName, category, reduceQty, reason, date, user } = currentReducePendingData;

  const newTx = {
    id: `tx-${Date.now()}`,
    item_id: itemId,
    transaction_date: date,
    quantity: reduceQty,
    type: 'REDUCTION',
    remark: `[PENGURANGAN STOK] ${reason}`,
    created_by: user,
    created_at: new Date().toISOString()
  };

  if (isLiveSupabase && supabaseClient) {
    try {
      const { error } = await supabaseClient.from('stock_transactions').insert(newTx);
      if (error) {
        if (error.code === 'PGRST204' || error.code === '42703' || (error.message && error.message.includes('column'))) {
          // 'type' column does not exist on remote schema yet; insert without 'type'
          const fallbackTx = { ...newTx };
          delete fallbackTx.type;
          const retryRes = await supabaseClient.from('stock_transactions').insert(fallbackTx);
          if (retryRes.error) {
            console.warn('Fallback stock reduction insert error:', retryRes.error);
          }
        } else {
          console.warn('Stock reduction insert error:', error);
        }
      }
    } catch (e) {
      console.warn('Supabase stock reduction exception:', e);
    }
  }

  state.stockTransactions.unshift(newTx);
  logActivity(`${itemName} (-${reduceQty} units: ${reason})`, category, 'Reduced', 'INVENTORY');
  persistState();

  closeModal('modal-reduce-stock');
  showToast(`Pengurangan stok berhasil! ${itemName} berkurang ${reduceQty} unit.`, 'success');

  // If history modal was open for this item, refresh it
  if (currentHistoryItemId === itemId) {
    openItemInboundHistoryModal(itemId);
  }
}

// Inbound Modal
function openModalInbound(preselectedItemId = null) {
  const select = document.getElementById('inbound-item-id');
  const dateInput = document.getElementById('inbound-date');
  if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];

  if (select) {
    select.innerHTML = state.masterItems.map(item => {
      const { availableStock } = calculateStockMetrics(item.id);
      return `<option value="${item.id}" ${item.id === preselectedItemId ? 'selected' : ''}>
        ${escapeHtml(item.item_name)} (${item.category}) - Available: ${availableStock} unit
      </option>`;
    }).join('');
  }

  openModal('modal-inbound');
}

async function handleInboundSubmit(e) {
  e.preventDefault();
  const itemId = document.getElementById('inbound-item-id').value;
  const qty = parseInt(document.getElementById('inbound-qty').value, 10);
  const date = document.getElementById('inbound-date').value;
  const remark = document.getElementById('inbound-remark').value.trim();

  if (!itemId || isNaN(qty) || qty <= 0) {
    showToast('Jumlah unit inbound tidak valid!', 'error');
    return;
  }

  const item = state.masterItems.find(i => i.id === itemId);
  if (!item) return;

  const newTx = {
    id: `tx-${Date.now()}`,
    item_id: itemId,
    transaction_date: date,
    quantity: qty,
    remark: remark || null,
    created_by: currentUser ? currentUser.email : 'admin@hotel.com',
    created_at: new Date().toISOString()
  };

  if (isLiveSupabase && supabaseClient) {
    await supabaseClient.from('stock_transactions').insert(newTx);
  }

  state.stockTransactions.unshift(newTx);
  logActivity(`${item.item_name} (+${qty} units)`, item.category, 'Added', 'INVENTORY');
  persistState();

  closeModal('modal-inbound');
  showToast(`Berhasil menambahkan stok masuk ${qty} unit untuk ${item.item_name}!`, 'success');
}

// Transfer Modal
function openModalTransfer(preselectedItemId = null) {
  const select = document.getElementById('transfer-item-id');
  const dateInput = document.getElementById('transfer-date');
  if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];

  if (select) {
    select.innerHTML = state.masterItems.map(item => {
      const { availableStock } = calculateStockMetrics(item.id);
      return `<option value="${item.id}" ${item.id === preselectedItemId ? 'selected' : ''}>
        ${escapeHtml(item.item_name)} (${item.category}) — Stok Tersedia: ${availableStock}
      </option>`;
    }).join('');
  }

  updateTransferAvailableStock();
  openModal('modal-transfer');
}

function updateTransferAvailableStock() {
  const select = document.getElementById('transfer-item-id');
  const hint = document.getElementById('transfer-stock-hint');
  if (!select || !hint) return;

  const itemId = select.value;
  const { availableStock } = calculateStockMetrics(itemId);
  hint.textContent = `Stok Tersedia di Gudang IT: ${availableStock} unit`;

  if (availableStock <= 0) {
    hint.className = 'text-[11px] text-rose-400 mt-1 font-semibold';
  } else {
    hint.className = 'text-[11px] text-brand-400 mt-1 font-semibold';
  }
}

async function handleTransferSubmit(e) {
  e.preventDefault();
  const itemId = document.getElementById('transfer-item-id').value;
  const dept = document.getElementById('transfer-department').value;
  const qty = parseInt(document.getElementById('transfer-qty').value, 10);
  const date = document.getElementById('transfer-date').value;
  const recipient = document.getElementById('transfer-recipient').value.trim();
  const remark = document.getElementById('transfer-remark').value.trim();

  const item = state.masterItems.find(i => i.id === itemId);
  if (!item) return;

  const { availableStock } = calculateStockMetrics(itemId);

  if (qty > availableStock) {
    showToast(`Gagal transfer! Jumlah diminta (${qty}) melebihi stok tersedia (${availableStock})!`, 'error');
    return;
  }

  const newMov = {
    id: `mov-${Date.now()}`,
    item_id: itemId,
    department: dept,
    type: 'TRANSFER_TO_DEPARTMENT',
    quantity: qty,
    date: date,
    recipient_name: recipient,
    remark: remark || null,
    created_by: currentUser ? currentUser.email : 'admin@hotel.com',
    created_at: new Date().toISOString()
  };

  if (isLiveSupabase && supabaseClient) {
    await supabaseClient.from('department_movements').insert(newMov);
  }

  state.departmentMovements.unshift(newMov);
  logActivity(`${item.item_name} -> ${dept} (${qty} units)`, item.category, 'Transfer', 'DEPARTMENT');
  persistState();

  closeModal('modal-transfer');
  showToast(`Berhasil mentransfer ${qty} unit ${item.item_name} ke ${dept}!`, 'success');
}

// Return Modal
function openModalReturn(preselectedDept = null, preselectedItemId = null) {
  const deptSelect = document.getElementById('return-department');
  const dateInput = document.getElementById('return-date');
  if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];

  if (deptSelect && preselectedDept) {
    deptSelect.value = preselectedDept;
  }

  updateReturnItemOptions(preselectedItemId);
  openModal('modal-return');
}

function updateReturnItemOptions(preselectedItemId = null) {
  const dept = document.getElementById('return-department').value;
  const itemSelect = document.getElementById('return-item-id');
  if (!itemSelect) return;

  const validItems = [];
  state.masterItems.forEach(item => {
    const { held } = calculateDeptItemStock(dept, item.id);
    if (held > 0) {
      validItems.push({ item, held });
    }
  });

  if (validItems.length === 0) {
    itemSelect.innerHTML = `<option value="">(Tidak ada unit hardware dipegang oleh departemen ini)</option>`;
    document.getElementById('return-stock-hint').textContent = 'Departemen ini tidak memegang unit hardware.';
    return;
  }

  itemSelect.innerHTML = validItems.map(({ item, held }) => `
    <option value="${item.id}" ${item.id === preselectedItemId ? 'selected' : ''}>
      ${escapeHtml(item.item_name)} (${item.category}) — Dipegang: ${held} unit
    </option>
  `).join('');

  updateReturnAvailableStock();
}

function updateReturnAvailableStock() {
  const dept = document.getElementById('return-department').value;
  const itemSelect = document.getElementById('return-item-id');
  const hint = document.getElementById('return-stock-hint');
  if (!itemSelect || !hint) return;

  const itemId = itemSelect.value;
  if (!itemId) {
    hint.textContent = 'Pilih barang terlebih dahulu';
    return;
  }

  const { held } = calculateDeptItemStock(dept, itemId);
  hint.textContent = `Unit aktif dipegang oleh ${dept}: ${held} unit`;
}

async function handleReturnSubmit(e) {
  e.preventDefault();
  const dept = document.getElementById('return-department').value;
  const itemId = document.getElementById('return-item-id').value;
  const qty = parseInt(document.getElementById('return-qty').value, 10);
  const date = document.getElementById('return-date').value;
  const remark = document.getElementById('return-remark').value.trim();

  if (!itemId) {
    showToast('Pilih barang yang ingin dikembalikan!', 'error');
    return;
  }

  const item = state.masterItems.find(i => i.id === itemId);
  if (!item) return;

  const { held } = calculateDeptItemStock(dept, itemId);

  if (qty > held) {
    showToast(`Gagal! Jumlah dikembalikan (${qty}) melebihi unit yang dipegang departemen (${held})!`, 'error');
    return;
  }

  const newMov = {
    id: `mov-${Date.now()}`,
    item_id: itemId,
    department: dept,
    type: 'RETURN_TO_INVENTORY',
    quantity: qty,
    date: date,
    recipient_name: `Returned to IT`,
    remark: remark || null,
    created_by: currentUser ? currentUser.email : 'admin@hotel.com',
    created_at: new Date().toISOString()
  };

  if (isLiveSupabase && supabaseClient) {
    await supabaseClient.from('department_movements').insert(newMov);
  }

  state.departmentMovements.unshift(newMov);
  logActivity(`${dept} -> IT Return (${qty} units: ${item.item_name})`, item.category, 'Return', 'DEPARTMENT');
  persistState();

  closeModal('modal-return');
  showToast(`Berhasil mengembalikan ${qty} unit ${item.item_name} ke stok IT!`, 'success');
}

// PO Modal & Master Item Integration
function populatePOMasterItemDropdown(selectedItemId = null, keyword = '') {
  const select = document.getElementById('po-master-item-id');
  if (!select) return;

  const kw = (keyword || '').toLowerCase().trim();
  const filtered = state.masterItems.filter(item => {
    if (!kw) return true;
    return (
      item.item_name.toLowerCase().includes(kw) ||
      (item.item_code && item.item_code.toLowerCase().includes(kw)) ||
      (item.category && item.category.toLowerCase().includes(kw))
    );
  });

  if (filtered.length === 0) {
    select.innerHTML = '<option value="" disabled selected>(Tidak ada master item yang cocok)</option>';
  } else {
    select.innerHTML = filtered.map(item => `
      <option value="${item.id}" ${item.id === selectedItemId ? 'selected' : ''} data-name="${escapeHtml(item.item_name)}" data-cat="${item.category}" data-code="${item.item_code || ''}">
        ${escapeHtml(item.item_name)} (${item.category}) [${item.item_code || 'SKU'}]
      </option>
    `).join('');
  }

  handlePOMasterItemSelect();
}

function filterPOMasterItemDropdown(keyword) {
  const select = document.getElementById('po-master-item-id');
  const currentVal = select ? select.value : null;
  populatePOMasterItemDropdown(currentVal, keyword);
}

function handlePOMasterItemSelect() {
  const select = document.getElementById('po-master-item-id');
  const nameInput = document.getElementById('po-item-name');
  const catInput = document.getElementById('po-category');
  const infoCategory = document.getElementById('po-info-category');
  const infoCode = document.getElementById('po-info-code');

  if (!select || select.selectedIndex === -1) return;

  const opt = select.options[select.selectedIndex];
  if (!opt || !opt.value) return;

  const item = state.masterItems.find(i => i.id === opt.value);
  if (!item) return;

  if (nameInput) nameInput.value = item.item_name;
  if (catInput) catInput.value = item.category;
  if (infoCategory) infoCategory.textContent = item.category;
  if (infoCode) infoCode.textContent = item.item_code || '-';
}

function openModalPO(editId = null) {
  const form = document.getElementById('form-po');
  form.reset();
  document.getElementById('po-edit-id').value = '';
  document.getElementById('po-modal-title').textContent = 'New Purchase Order';
  document.getElementById('po-date-order').value = new Date().toISOString().split('T')[0];

  const searchInput = document.getElementById('po-item-search');
  if (searchInput) searchInput.value = '';

  let targetItemId = null;

  if (editId) {
    const po = state.purchaseOrders.find(p => p.id === editId);
    if (po) {
      document.getElementById('po-edit-id').value = po.id;
      document.getElementById('po-modal-title').textContent = 'Edit Purchase Order';
      document.getElementById('po-qty').value = po.quantity;
      document.getElementById('po-date-order').value = po.date_order;
      document.getElementById('po-status').value = po.status;
      document.getElementById('po-for-use').value = po.for_use;
      document.getElementById('po-vendor').value = po.vendor || '';
      document.getElementById('po-remarks').value = po.remarks || '';

      if (po.item_id) {
        targetItemId = po.item_id;
      } else {
        const found = state.masterItems.find(i => i.item_name.toLowerCase() === po.item_name.toLowerCase());
        if (found) targetItemId = found.id;
      }
    }
  }

  if (!targetItemId && state.masterItems.length > 0) {
    targetItemId = state.masterItems[0].id;
  }

  populatePOMasterItemDropdown(targetItemId, '');
  openModal('modal-po');
}

async function handlePOSubmit(e) {
  e.preventDefault();
  const editId = document.getElementById('po-edit-id').value;
  const itemId = document.getElementById('po-master-item-id').value;
  const qty = parseInt(document.getElementById('po-qty').value, 10);
  const dateOrder = document.getElementById('po-date-order').value;
  const status = document.getElementById('po-status').value;
  const forUse = document.getElementById('po-for-use').value.trim();
  const vendor = document.getElementById('po-vendor').value.trim();
  const remarks = document.getElementById('po-remarks').value.trim();

  const item = state.masterItems.find(i => i.id === itemId);
  if (!item) {
    showToast('Pilih barang dari Master Item terlebih dahulu!', 'error');
    return;
  }

  const itemName = item.item_name;
  const category = item.category;

  if (editId) {
    const existing = state.purchaseOrders.find(p => p.id === editId);
    if (existing) {
      existing.item_id = item.id;
      existing.item_name = itemName;
      existing.category = category;
      existing.quantity = qty;
      existing.date_order = dateOrder;
      existing.status = status;
      existing.for_use = forUse;
      existing.vendor = vendor || null;
      existing.remarks = remarks || null;
      existing.updated_at = new Date().toISOString();

      if (status === 'SUDAH DATANG' && !existing.date_arrival) {
        existing.date_arrival = new Date().toISOString().split('T')[0];
      }

      if (isLiveSupabase && supabaseClient) {
        await supabaseClient.from('purchase_orders').update(existing).eq('id', editId);
      }
      showToast('Purchase Order berhasil diperbarui!', 'success');
    }
  } else {
    const newPO = {
      id: `po-${Date.now()}`,
      po_number: `PO-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      item_id: item.id,
      item_name: itemName,
      category: category,
      photo_url: item.photo_url || null,
      date_order: dateOrder,
      date_arrival: status === 'SUDAH DATANG' ? dateOrder : null,
      quantity: qty,
      for_use: forUse,
      vendor: vendor || null,
      remarks: remarks || null,
      status: status,
      created_by: currentUser ? currentUser.email : 'admin@hotel.com',
      updated_by: currentUser ? currentUser.email : 'admin@hotel.com',
      created_at: new Date().toISOString()
    };

    if (isLiveSupabase && supabaseClient) {
      await supabaseClient.from('purchase_orders').insert(newPO);
    }
    state.purchaseOrders.unshift(newPO);
    logActivity(`PO: ${itemName} (${qty} units)`, category, 'Added', 'PURCHASE ORDER');
    showToast('Purchase Order baru berhasil disimpan!', 'success');
  }

  persistState();
  closeModal('modal-po');
}

// Damaged Hardware Modal
function openModalPreloved(editId = null) {
  const form = document.getElementById('form-preloved');
  form.reset();
  document.getElementById('preloved-edit-id').value = '';
  document.getElementById('preloved-modal-title').textContent = 'Add Damaged Hardware';
  document.getElementById('preloved-date').value = new Date().toISOString().split('T')[0];

  if (editId) {
    const pre = state.preloved.find(p => p.id === editId);
    if (pre) {
      document.getElementById('preloved-edit-id').value = pre.id;
      document.getElementById('preloved-modal-title').textContent = 'Edit Damaged Hardware';
      document.getElementById('preloved-item-name').value = pre.item_name;
      document.getElementById('preloved-category').value = pre.category;
      document.getElementById('preloved-qty').value = pre.quantity;
      document.getElementById('preloved-date').value = pre.date_repaired;
      document.getElementById('preloved-serial').value = pre.serial_number || '';
      document.getElementById('preloved-remark').value = pre.remark || '';
    }
  }

  openModal('modal-preloved');
}

async function handlePrelovedSubmit(e) {
  e.preventDefault();
  const editId = document.getElementById('preloved-edit-id').value;
  const itemName = document.getElementById('preloved-item-name').value.trim();
  const category = document.getElementById('preloved-category').value;
  const qty = parseInt(document.getElementById('preloved-qty').value, 10);
  const dateRepaired = document.getElementById('preloved-date').value;
  const serial = document.getElementById('preloved-serial').value.trim();
  const remark = document.getElementById('preloved-remark').value.trim();

  if (editId) {
    const existing = state.preloved.find(p => p.id === editId);
    if (existing) {
      existing.item_name = itemName;
      existing.category = category;
      existing.quantity = qty;
      existing.date_repaired = dateRepaired;
      existing.serial_number = serial || null;
      existing.remark = remark || null;
      existing.updated_at = new Date().toISOString();

      if (isLiveSupabase && supabaseClient) {
        await supabaseClient.from('preloved').update(existing).eq('id', editId);
      }
      showToast('Damaged hardware berhasil diperbarui!', 'success');
    }
  } else {
    const newPre = {
      id: `pre-${Date.now()}`,
      item_code: `PRE-${Math.floor(100 + Math.random() * 900)}`,
      item_name: itemName,
      category: category,
      date_repaired: dateRepaired,
      quantity: qty,
      serial_number: serial || null,
      remark: remark || null,
      photo_url: null,
      created_by: currentUser ? currentUser.email : 'admin@hotel.com',
      updated_by: currentUser ? currentUser.email : 'admin@hotel.com',
      created_at: new Date().toISOString()
    };

    if (isLiveSupabase && supabaseClient) {
      await supabaseClient.from('preloved').insert(newPre);
    }
    state.preloved.unshift(newPre);
    logActivity(`Damaged HW: ${itemName} (${qty} units)`, category, 'Added', 'DAMAGED_HARDWARE');
    showToast('Damaged hardware berhasil ditambahkan!', 'success');
  }

  persistState();
  closeModal('modal-preloved');
}

// ==============================================================================
// 12. MOTION ANALYTICS TABLE
// ==============================================================================
function renderMotionTable() {
  const tbody = document.getElementById('motion-table-body');
  const emptyState = document.getElementById('motion-empty-state');
  const typeFilter = document.getElementById('motion-type-filter')?.value || 'ALL';
  const deptFilter = document.getElementById('motion-dept-filter')?.value || 'ALL';
  const search = (document.getElementById('motion-search')?.value || '').toLowerCase();

  if (!tbody) return;

  const filtered = state.departmentMovements.filter(mov => {
    const matchType = typeFilter === 'ALL' || mov.type === typeFilter;
    const matchDept = deptFilter === 'ALL' || mov.department === deptFilter;

    const item = state.masterItems.find(i => i.id === mov.item_id);
    const itemName = item ? item.item_name.toLowerCase() : '';
    const matchSearch =
      itemName.includes(search) ||
      (mov.recipient_name && mov.recipient_name.toLowerCase().includes(search)) ||
      (mov.remark && mov.remark.toLowerCase().includes(search));

    return matchType && matchDept && matchSearch;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = '';
    emptyState?.classList.remove('hidden');
    return;
  }

  emptyState?.classList.add('hidden');

  tbody.innerHTML = filtered.map(mov => {
    const item = state.masterItems.find(i => i.id === mov.item_id);
    const itemName = item ? item.item_name : '(Item deleted)';
    const itemCat = item ? item.category : '-';

    const isTransfer = mov.type === 'TRANSFER_TO_DEPARTMENT';
    const typeBadge = isTransfer
      ? `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">TRANSFER TO DEPT</span>`
      : `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">RETURN TO IT</span>`;

    return `
      <tr class="hover:bg-slate-900/50 transition">
        <td class="py-3 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">${mov.date}</td>
        <td class="py-3 px-4 font-bold text-white min-w-[180px]">${escapeHtml(itemName)}</td>
        <td class="py-3 px-4 whitespace-nowrap">
          ${formatCategoryBadge(itemCat)}
        </td>
        <td class="py-3 px-4 text-center whitespace-nowrap">${formatMotionTypeBadge(mov.type)}</td>
        <td class="py-3 px-4 text-slate-300 font-medium whitespace-nowrap">${mov.department}</td>
        <td class="py-3 px-4 text-center font-mono font-bold ${isTransfer ? 'text-amber-400' : 'text-emerald-400'} whitespace-nowrap">${mov.quantity}</td>
        <td class="py-3 px-4 text-slate-300 whitespace-nowrap">${escapeHtml(mov.recipient_name || '-')}</td>
        <td class="py-3 px-4 text-slate-400 text-[11px] min-w-[160px]">${escapeHtml(mov.remark || '-')}</td>
      </tr>
    `;
  }).join('');
}

// ==============================================================================
// 13. PURCHASE ORDERS TABLE
// ==============================================================================
function setPOStatusFilter(status) {
  poStatusFilter = status;
  document.querySelectorAll('.po-filter-btn').forEach(btn => {
    if (btn.dataset.status === status) {
      btn.className = 'po-filter-btn px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-600 text-white';
    } else {
      btn.className = 'po-filter-btn px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white';
    }
  });
  renderPOTable();
}

function renderPOTable() {
  const tbody = document.getElementById('po-table-body');
  const emptyState = document.getElementById('po-empty-state');
  const search = (document.getElementById('po-search')?.value || '').toLowerCase();

  if (!tbody) return;

  const filtered = state.purchaseOrders.filter(po => {
    const matchStatus = poStatusFilter === 'ALL' || po.status === poStatusFilter;
    const matchSearch =
      po.item_name.toLowerCase().includes(search) ||
      (po.po_number && po.po_number.toLowerCase().includes(search)) ||
      (po.for_use && po.for_use.toLowerCase().includes(search)) ||
      (po.vendor && po.vendor.toLowerCase().includes(search));
    return matchStatus && matchSearch;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = '';
    emptyState?.classList.remove('hidden');
    return;
  }

  emptyState?.classList.add('hidden');

  tbody.innerHTML = filtered.map(po => {
    const isArrived = po.status === 'SUDAH DATANG';

    return `
      <tr class="hover:bg-slate-900/50 transition">
        <td class="py-3 px-4 min-w-[200px]">
          <div class="font-bold text-white truncate">${escapeHtml(po.item_name)}</div>
          <div class="text-[11px] text-slate-400 font-mono">${escapeHtml(po.po_number || 'PO-GEN')}</div>
        </td>
        <td class="py-3 px-4 whitespace-nowrap">
          ${formatCategoryBadge(po.category)}
        </td>
        <td class="py-3 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">${po.date_order}</td>
        <td class="py-3 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">${po.date_arrival || '-'}</td>
        <td class="py-3 px-4 text-center font-mono font-bold text-white whitespace-nowrap">${po.quantity}</td>
        <td class="py-3 px-4 text-slate-300 min-w-[150px]">${escapeHtml(po.for_use)}</td>
        <td class="py-3 px-4 whitespace-nowrap">${formatPOStatusBadge(po.status)}</td>
        <td class="py-3 px-4 text-right whitespace-nowrap">
          <div class="flex items-center justify-end gap-1.5">
            ${!isArrived ? `
              <button
                type="button"
                onclick="markPOArrived('${po.id}')"
                title="Mark Arrived"
                class="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white transition text-xs shrink-0"
              >
                <i class="fa-solid fa-check"></i>
              </button>
            ` : ''}
            <button
              type="button"
              onclick="openModalPO('${po.id}')"
              title="Edit PO"
              class="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition text-xs border border-slate-700 shrink-0"
            >
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button
              type="button"
              onclick="confirmDeletePO('${po.id}', '${escapeHtml(po.item_name)}')"
              title="Delete PO"
              class="p-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white transition text-xs shrink-0"
            >
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

async function markPOArrived(poId) {
  const po = state.purchaseOrders.find(p => p.id === poId);
  if (!po) return;

  po.status = 'SUDAH DATANG';
  po.date_arrival = new Date().toISOString().split('T')[0];
  po.updated_at = new Date().toISOString();

  if (isLiveSupabase && supabaseClient) {
    await supabaseClient.from('purchase_orders').update(po).eq('id', poId);
  }

  logActivity(`PO Received: ${po.item_name}`, po.category, 'Received', 'PURCHASE ORDER');
  persistState();
  showToast(`Status PO ${po.item_name} ditandai SUDAH DATANG!`, 'success');
}

async function confirmDeletePO(poId, itemName) {
  if (!confirm(`Hapus Purchase Order "${itemName}"?`)) return;

  if (isLiveSupabase && supabaseClient) {
    await supabaseClient.from('purchase_orders').delete().eq('id', poId);
  }

  state.purchaseOrders = state.purchaseOrders.filter(p => p.id !== poId);
  persistState();
  showToast('Purchase Order berhasil dihapus.', 'info');
}

// ==============================================================================
// 14. PRELOVED ITEMS TABLE
// ==============================================================================
function setPrelovedCatFilter(cat) {
  prelovedCategoryFilter = cat;
  document.querySelectorAll('.preloved-cat-pill').forEach(btn => {
    if (btn.dataset.cat === cat) {
      btn.className = 'preloved-cat-pill px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-600 text-white';
    } else {
      btn.className = 'preloved-cat-pill px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white';
    }
  });
  renderPrelovedTable();
}

function renderPrelovedTable() {
  const tbody = document.getElementById('preloved-table-body');
  const emptyState = document.getElementById('preloved-empty-state');
  const search = (document.getElementById('preloved-search')?.value || '').toLowerCase();

  if (!tbody) return;

  const filtered = state.preloved.filter(pre => {
    const matchCat = prelovedCategoryFilter === 'ALL' || pre.category === prelovedCategoryFilter;
    const matchSearch =
      pre.item_name.toLowerCase().includes(search) ||
      (pre.serial_number && pre.serial_number.toLowerCase().includes(search)) ||
      (pre.remark && pre.remark.toLowerCase().includes(search));
    return matchCat && matchSearch;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = '';
    emptyState?.classList.remove('hidden');
    return;
  }

  emptyState?.classList.add('hidden');

  tbody.innerHTML = filtered.map(pre => {
    return `
      <tr class="hover:bg-slate-900/50 transition">
        <td class="py-3 px-4 min-w-[180px]">
          <div class="font-bold text-white">${escapeHtml(pre.item_name)}</div>
          <div class="text-[11px] text-teal-400 font-mono">${escapeHtml(pre.item_code || 'PRE-GEN')}</div>
        </td>
        <td class="py-3 px-4 whitespace-nowrap">
          ${formatCategoryBadge(pre.category)}
        </td>
        <td class="py-3 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">${pre.date_repaired}</td>
        <td class="py-3 px-4 text-center font-mono font-bold text-white whitespace-nowrap">${pre.quantity}</td>
        <td class="py-3 px-4 font-mono text-xs text-slate-300 whitespace-nowrap">${escapeHtml(pre.serial_number || '-')}</td>
        <td class="py-3 px-4 text-slate-400 text-xs min-w-[160px]">${escapeHtml(pre.remark || '-')}</td>
        <td class="py-3 px-4 text-right whitespace-nowrap">
          <div class="flex items-center justify-end gap-1.5">
            <button
              type="button"
              onclick="openModalPreloved('${pre.id}')"
              title="Edit Preloved"
              class="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition text-xs border border-slate-700 shrink-0"
            >
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button
              type="button"
              onclick="confirmDeletePreloved('${pre.id}', '${escapeHtml(pre.item_name)}')"
              title="Delete Preloved"
              class="p-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white transition text-xs"
            >
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

async function confirmDeletePreloved(preId, itemName) {
  if (!confirm(`Hapus Damaged Hardware "${itemName}"?`)) return;

  if (isLiveSupabase && supabaseClient) {
    await supabaseClient.from('preloved').delete().eq('id', preId);
  }

  state.preloved = state.preloved.filter(p => p.id !== preId);
  persistState();
  showToast('Damaged hardware berhasil dihapus.', 'info');
}

// ==============================================================================
// 15. MONTHLY DATA & REPORTS VIEW
// ==============================================================================
function initMonthlyView() {
  const selector = document.getElementById('monthly-selector');
  if (selector && !selector.value) {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    selector.value = `${y}-${m}`;
  }
}

function handleMonthlyChange() {
  renderMonthlyView();
}

function setMonthlyTab(tabId) {
  currentMonthlyTab = tabId;
  document.querySelectorAll('.monthly-subtab').forEach(btn => {
    if (btn.dataset.tab === tabId) {
      btn.className = 'monthly-subtab px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 text-white';
    } else {
      btn.className = 'monthly-subtab px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-400 hover:text-white';
    }
  });
  renderMonthlyView();
}

function renderMonthlyView() {
  const container = document.getElementById('monthly-container');
  const selector = document.getElementById('monthly-selector');
  if (!container || !selector) return;

  const ym = selector.value || new Date().toISOString().substring(0, 7);

  if (currentMonthlyTab === 'inbound') {
    const txs = state.stockTransactions.filter(t => t.transaction_date && t.transaction_date.startsWith(ym));
    if (txs.length === 0) {
      container.innerHTML = `<div class="p-8 text-center text-slate-500">Tidak ada stok masuk pada periode ${ym}.</div>`;
      return;
    }

    container.innerHTML = `
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs min-w-[700px]">
          <thead class="bg-slate-900/90 text-slate-400 uppercase text-[11px] font-semibold border-b border-slate-800">
            <tr>
              <th class="py-2.5 px-4 whitespace-nowrap">Tanggal</th>
              <th class="py-2.5 px-4 min-w-[200px]">Nama Barang</th>
              <th class="py-2.5 px-4 whitespace-nowrap">Kategori</th>
              <th class="py-2.5 px-4 text-center whitespace-nowrap">Unit Masuk</th>
              <th class="py-2.5 px-4 min-w-[150px]">Catatan</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/80">
            ${txs.map(t => {
              const item = state.masterItems.find(i => i.id === t.item_id);
              return `
                <tr>
                  <td class="py-2.5 px-4 font-mono text-slate-400 whitespace-nowrap">${t.transaction_date}</td>
                  <td class="py-2.5 px-4 font-bold text-white">${escapeHtml(item?.item_name || '-')}</td>
                  <td class="py-2.5 px-4 whitespace-nowrap">${formatCategoryBadge(item?.category)}</td>
                  <td class="py-2.5 px-4 text-center font-mono font-bold text-cyan-400 whitespace-nowrap">+${t.quantity}</td>
                  <td class="py-2.5 px-4 text-slate-400">${escapeHtml(t.remark || '-')}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  } else if (currentMonthlyTab === 'movements') {
    const movs = state.departmentMovements.filter(m => m.date && m.date.startsWith(ym));
    if (movs.length === 0) {
      container.innerHTML = `<div class="p-8 text-center text-slate-500">Tidak ada mutasi departemen pada periode ${ym}.</div>`;
      return;
    }

    container.innerHTML = `
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs min-w-[750px]">
          <thead class="bg-slate-900/90 text-slate-400 uppercase text-[11px] font-semibold border-b border-slate-800">
            <tr>
              <th class="py-2.5 px-4 whitespace-nowrap">Tanggal</th>
              <th class="py-2.5 px-4 min-w-[180px]">Barang</th>
              <th class="py-2.5 px-4 whitespace-nowrap">Departemen</th>
              <th class="py-2.5 px-4 text-center whitespace-nowrap">Jenis</th>
              <th class="py-2.5 px-4 text-center whitespace-nowrap">Qty</th>
              <th class="py-2.5 px-4 whitespace-nowrap">PIC / Penerima</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/80">
            ${movs.map(m => {
              const item = state.masterItems.find(i => i.id === m.item_id);
              const isTrans = m.type === 'TRANSFER_TO_DEPARTMENT';
              return `
                <tr>
                  <td class="py-2.5 px-4 font-mono text-slate-400 whitespace-nowrap">${m.date}</td>
                  <td class="py-2.5 px-4 font-bold text-white">${escapeHtml(item?.item_name || '-')}</td>
                  <td class="py-2.5 px-4 whitespace-nowrap text-slate-300 font-medium">${m.department}</td>
                  <td class="py-2.5 px-4 text-center whitespace-nowrap">
                    ${formatMotionTypeBadge(m.type)}
                  </td>
                  <td class="py-2.5 px-4 text-center font-mono font-bold ${isTrans ? 'text-amber-400' : 'text-emerald-400'} whitespace-nowrap">${m.quantity}</td>
                  <td class="py-2.5 px-4 text-slate-300 whitespace-nowrap">${escapeHtml(m.recipient_name || '-')}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  } else if (currentMonthlyTab === 'po') {
    const pos = state.purchaseOrders.filter(p => p.date_order && p.date_order.startsWith(ym));
    if (pos.length === 0) {
      container.innerHTML = `<div class="p-8 text-center text-slate-500">Tidak ada purchase order pada periode ${ym}.</div>`;
      return;
    }

    container.innerHTML = `
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs min-w-[700px]">
          <thead class="bg-slate-900/90 text-slate-400 uppercase text-[11px] font-semibold border-b border-slate-800">
            <tr>
              <th class="py-2.5 px-4 whitespace-nowrap">PO Number</th>
              <th class="py-2.5 px-4 min-w-[200px]">Barang</th>
              <th class="py-2.5 px-4 whitespace-nowrap">Tgl Order</th>
              <th class="py-2.5 px-4 text-center whitespace-nowrap">Qty</th>
              <th class="py-2.5 px-4 whitespace-nowrap">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/80">
            ${pos.map(p => `
              <tr>
                <td class="py-2.5 px-4 font-mono text-slate-400 whitespace-nowrap">${p.po_number || '-'}</td>
                <td class="py-2.5 px-4 font-bold text-white">${escapeHtml(p.item_name)}</td>
                <td class="py-2.5 px-4 font-mono text-slate-400 whitespace-nowrap">${p.date_order}</td>
                <td class="py-2.5 px-4 text-center font-mono font-bold whitespace-nowrap">${p.quantity}</td>
                <td class="py-2.5 px-4 whitespace-nowrap">${formatPOStatusBadge(p.status)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  } else if (currentMonthlyTab === 'preloved') {
    const pres = state.preloved.filter(p => p.date_repaired && p.date_repaired.startsWith(ym));
    if (pres.length === 0) {
      container.innerHTML = `<div class="p-8 text-center text-slate-500">Tidak ada damaged hardware pada periode ${ym}.</div>`;
      return;
    }

    container.innerHTML = `
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs min-w-[700px]">
          <thead class="bg-slate-900/90 text-slate-400 uppercase text-[11px] font-semibold border-b border-slate-800">
            <tr>
              <th class="py-2.5 px-4 whitespace-nowrap">Kode</th>
              <th class="py-2.5 px-4 min-w-[180px]">Barang Rekondisi</th>
              <th class="py-2.5 px-4 whitespace-nowrap">Tgl Selesai</th>
              <th class="py-2.5 px-4 text-center whitespace-nowrap">Qty</th>
              <th class="py-2.5 px-4 min-w-[150px]">Remark</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/80">
            ${pres.map(p => `
              <tr>
                <td class="py-2.5 px-4 font-mono text-teal-400 whitespace-nowrap">${p.item_code || '-'}</td>
                <td class="py-2.5 px-4 font-bold text-white">${escapeHtml(p.item_name)}</td>
                <td class="py-2.5 px-4 font-mono text-slate-400 whitespace-nowrap">${p.date_repaired}</td>
                <td class="py-2.5 px-4 text-center font-mono font-bold whitespace-nowrap">${p.quantity}</td>
                <td class="py-2.5 px-4 text-slate-400">${escapeHtml(p.remark || '-')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }
}

// ==============================================================================
// 16. INDEPENDENT CLIENT-SIDE EXCEL EXPORTS (SHEETJS ZERO-BACKEND)
// ==============================================================================
function getSheetJS() {
  if (!window.XLSX) {
    showToast('Pustaka SheetJS belum termuat. Periksa koneksi internet.', 'error');
    return null;
  }
  return window.XLSX;
}

function exportInventoryExcel() {
  const XLSX = getSheetJS();
  if (!XLSX) return;

  const data = [
    ['RATTAN-INN HOTEL IT INVENTORY MANAGEMENT - MASTER CATALOG & STOCK REPORT'],
    [`Generated: ${new Date().toLocaleString()} | User: ${currentUser ? currentUser.email : 'System'}`],
    [],
    ['No', 'Item Code', 'Item Name', 'Category', 'Total Inbound', 'Total Reduced', 'Total Transferred', 'Total Returned', 'Available Stock in IT', 'Status', 'Remark']
  ];

  state.masterItems.forEach((item, index) => {
    const { totalInbound, totalReduced, totalTransferred, totalReturned, availableStock } = calculateStockMetrics(item.id);
    const status = availableStock === 0 ? 'OUT OF STOCK' : availableStock <= 2 ? 'LOW STOCK' : 'AVAILABLE';

    data.push([
      index + 1,
      item.item_code || '-',
      item.item_name,
      item.category,
      totalInbound,
      totalReduced,
      totalTransferred,
      totalReturned,
      availableStock,
      status,
      item.remark || '-'
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = [
    { wch: 6 }, { wch: 14 }, { wch: 40 }, { wch: 18 }, { wch: 14 }, { wch: 14 },
    { wch: 16 }, { wch: 16 }, { wch: 20 }, { wch: 16 }, { wch: 45 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Inventory Stock');

  const filename = `Rattan_Inn_Hotel_IT_Inventory_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, filename);
  showToast(`File "${filename}" berhasil didownload!`, 'success');
}

function exportDepartmentalExcel() {
  const XLSX = getSheetJS();
  if (!XLSX) return;

  const data = [
    ['RATTAN-INN HOTEL IT INVENTORY - 9 DEPARTMENTS ASSET HOLDINGS REPORT'],
    [`Generated: ${new Date().toLocaleString()}`],
    [],
    ['No', 'Department', 'Item Name', 'Category', 'Held Units', 'Total Received', 'Total Returned', 'Last Recipient / PIC', 'Last Movement Date']
  ];

  let rowCount = 0;
  DEPARTMENTS.forEach(dept => {
    state.masterItems.forEach(item => {
      const { received, returned, held } = calculateDeptItemStock(dept, item.id);
      if (held > 0 || received > 0) {
        rowCount++;
        const lastMov = state.departmentMovements
          .filter(m => m.department === dept && m.item_id === item.id)
          .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

        data.push([
          rowCount,
          dept,
          item.item_name,
          item.category,
          held,
          received,
          returned,
          lastMov?.recipient_name || '-',
          lastMov?.date || '-'
        ]);
      }
    });
  });

  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = [
    { wch: 6 }, { wch: 20 }, { wch: 40 }, { wch: 18 }, { wch: 14 },
    { wch: 14 }, { wch: 14 }, { wch: 28 }, { wch: 18 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Departmental Assets');

  const filename = `Rattan_Inn_Hotel_IT_Departmental_Assets_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, filename);
  showToast(`File "${filename}" berhasil didownload!`, 'success');
}

function exportMotionExcel() {
  const XLSX = getSheetJS();
  if (!XLSX) return;

  const data = [
    ['RATTAN-INN HOTEL IT INVENTORY - MOTION AUDIT TRAIL LOG'],
    [`Generated: ${new Date().toLocaleString()}`],
    [],
    ['No', 'Date', 'Hardware Item', 'Category', 'Movement Type', 'Department', 'Quantity', 'Recipient / PIC', 'Remark', 'Recorded By']
  ];

  state.departmentMovements.forEach((mov, index) => {
    const item = state.masterItems.find(i => i.id === mov.item_id);
    data.push([
      index + 1,
      mov.date,
      item?.item_name || '(Item deleted)',
      item?.category || '-',
      mov.type === 'TRANSFER_TO_DEPARTMENT' ? 'TRANSFER TO DEPT' : 'RETURN TO IT',
      mov.department,
      mov.quantity,
      mov.recipient_name || '-',
      mov.remark || '-',
      mov.created_by || 'System'
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = [
    { wch: 6 }, { wch: 14 }, { wch: 40 }, { wch: 18 }, { wch: 20 },
    { wch: 20 }, { wch: 12 }, { wch: 26 }, { wch: 35 }, { wch: 20 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Motion Log');

  const filename = `Rattan_Inn_Hotel_IT_MotionLog_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, filename);
  showToast(`File "${filename}" berhasil didownload!`, 'success');
}

function exportPurchaseOrdersExcel() {
  const XLSX = getSheetJS();
  if (!XLSX) return;

  const data = [
    ['RATTAN-INN HOTEL IT PROCUREMENT - PURCHASE ORDERS REPORT'],
    [`Generated: ${new Date().toLocaleString()}`],
    [],
    ['No', 'PO Number', 'Item Name', 'Category', 'Order Date', 'Arrival Date', 'Qty', 'For Use / Allocation', 'Vendor', 'Status', 'Remarks']
  ];

  state.purchaseOrders.forEach((po, index) => {
    data.push([
      index + 1,
      po.po_number || '-',
      po.item_name,
      po.category,
      po.date_order,
      po.date_arrival || '-',
      po.quantity,
      po.for_use,
      po.vendor || '-',
      po.status,
      po.remarks || '-'
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = [
    { wch: 6 }, { wch: 16 }, { wch: 38 }, { wch: 18 }, { wch: 14 },
    { wch: 14 }, { wch: 8 }, { wch: 30 }, { wch: 24 }, { wch: 16 }, { wch: 35 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Purchase Orders');

  const filename = `Rattan_Inn_Hotel_IT_Purchase_Orders_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, filename);
  showToast(`File "${filename}" berhasil didownload!`, 'success');
}

function exportPrelovedExcel() {
  const XLSX = getSheetJS();
  if (!XLSX) return;

  const data = [
    ['RATTAN-INN HOTEL IT INVENTORY - DAMAGED HARDWARE & REFURBISHED ITEMS'],
    [`Generated: ${new Date().toLocaleString()}`],
    [],
    ['No', 'Item Code', 'Item Name', 'Category', 'Date Repaired', 'Qty', 'Serial Number', 'Remark / Ex-Location']
  ];

  state.preloved.forEach((pre, index) => {
    data.push([
      index + 1,
      pre.item_code || '-',
      pre.item_name,
      pre.category,
      pre.date_repaired,
      pre.quantity,
      pre.serial_number || '-',
      pre.remark || '-'
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = [
    { wch: 6 }, { wch: 14 }, { wch: 40 }, { wch: 18 }, { wch: 14 },
    { wch: 8 }, { wch: 20 }, { wch: 45 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Damaged Hardware');

  const filename = `Rattan_Inn_Hotel_IT_Damaged_Hardware_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, filename);
  showToast(`File "${filename}" berhasil didownload!`, 'success');
}

function exportSelectedMonthlyExcel() {
  const XLSX = getSheetJS();
  if (!XLSX) return;

  const selector = document.getElementById('monthly-selector');
  const ym = selector?.value || new Date().toISOString().substring(0, 7);

  const wb = XLSX.utils.book_new();

  const inbounds = state.stockTransactions.filter(t => t.transaction_date && t.transaction_date.startsWith(ym));
  const inData = [
    [`RATTAN-INN HOTEL IT MONTHLY INBOUND STOCK - ${ym}`],
    [],
    ['No', 'Date', 'Item Name', 'Category', 'Quantity In', 'Remark']
  ];
  inbounds.forEach((t, i) => {
    const item = state.masterItems.find(it => it.id === t.item_id);
    inData.push([i + 1, t.transaction_date, item?.item_name || '-', item?.category || '-', t.quantity, t.remark || '-']);
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(inData), 'Monthly Inbound');

  const movs = state.departmentMovements.filter(m => m.date && m.date.startsWith(ym));
  const movData = [
    [`RATTAN-INN HOTEL IT MONTHLY DEPARTMENT MOVEMENTS - ${ym}`],
    [],
    ['No', 'Date', 'Item Name', 'Department', 'Type', 'Quantity', 'Recipient / PIC', 'Remark']
  ];
  movs.forEach((m, i) => {
    const item = state.masterItems.find(it => it.id === m.item_id);
    movData.push([i + 1, m.date, item?.item_name || '-', m.department, m.type, m.quantity, m.recipient_name || '-', m.remark || '-']);
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(movData), 'Monthly Movements');

  const filename = `Rattan_Inn_Hotel_IT_Monthly_Report_${ym}.xlsx`;
  XLSX.writeFile(wb, filename);
  showToast(`Laporan bulanan ${ym} berhasil didownload!`, 'success');
}

function exportFullBackupExcel() {
  const XLSX = getSheetJS();
  if (!XLSX) return;

  const wb = XLSX.utils.book_new();

  const invData = [
    ['RATTAN-INN HOTEL IT MASTER INVENTORY CATALOG & AVAILABLE STOCK'],
    [`Generated: ${new Date().toISOString()}`],
    [],
    ['No', 'Item Code', 'Item Name', 'Category', 'Total Inbound', 'Transferred to Depts', 'Returned to IT', 'Available in IT Storage', 'Remark']
  ];
  state.masterItems.forEach((item, index) => {
    const m = calculateStockMetrics(item.id);
    invData.push([index + 1, item.item_code || '-', item.item_name, item.category, m.totalInbound, m.totalTransferred, m.totalReturned, m.availableStock, item.remark || '-']);
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(invData), 'Master Inventory');

  const deptData = [
    ['HOTEL IT 9 DEPARTMENTS ASSET HOLDINGS'],
    [],
    ['No', 'Department', 'Hardware Item', 'Category', 'Current Held Units', 'Total Received', 'Total Returned']
  ];
  let dCount = 0;
  DEPARTMENTS.forEach(dept => {
    state.masterItems.forEach(item => {
      const dm = calculateDeptItemStock(dept, item.id);
      if (dm.held > 0 || dm.received > 0) {
        dCount++;
        deptData.push([dCount, dept, item.item_name, item.category, dm.held, dm.received, dm.returned]);
      }
    });
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(deptData), 'Department Assets');

  const movData = [
    ['HOTEL IT MOTION & AUDIT TRAIL LOG'],
    [],
    ['No', 'Date', 'Hardware Item', 'Movement Type', 'Department', 'Quantity', 'Recipient / PIC', 'Remark']
  ];
  state.departmentMovements.forEach((mov, index) => {
    const item = state.masterItems.find(i => i.id === mov.item_id);
    movData.push([index + 1, mov.date, item?.item_name || '-', mov.type, mov.department, mov.quantity, mov.recipient_name || '-', mov.remark || '-']);
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(movData), 'Motion Log');

  const poData = [
    ['HOTEL IT PURCHASE ORDERS RECORD'],
    [],
    ['No', 'PO Number', 'Item Name', 'Category', 'Date Order', 'Date Arrival', 'Qty', 'For Use', 'Vendor', 'Status']
  ];
  state.purchaseOrders.forEach((po, index) => {
    poData.push([index + 1, po.po_number || '-', po.item_name, po.category, po.date_order, po.date_arrival || '-', po.quantity, po.for_use, po.vendor || '-', po.status]);
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(poData), 'Purchase Orders');

  const preData = [
    ['HOTEL IT DAMAGED HARDWARE & REFURBISHED ITEMS'],
    [],
    ['No', 'Code', 'Item Name', 'Category', 'Date Repaired', 'Qty', 'Serial Number', 'Remark']
  ];
  state.preloved.forEach((pre, index) => {
    preData.push([index + 1, pre.item_code || '-', pre.item_name, pre.category, pre.date_repaired, pre.quantity, pre.serial_number || '-', pre.remark || '-']);
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(preData), 'Damaged Hardware');

  const filename = `Hotel_IT_Master_Full_Backup_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, filename);
  showToast(`Full Master Backup file "${filename}" berhasil didownload!`, 'success');
}

// ==============================================================================
// 17. SUPABASE AUTH & LOGIN WORKFLOW
// ==============================================================================
async function handleLoginSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const submitBtn = document.getElementById('btn-login-submit');
  const errorAlert = document.getElementById('login-error-alert');
  const errorMsg = document.getElementById('login-error-msg');

  if (errorAlert) errorAlert.classList.add('hidden');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i><span>Signing in...</span>`;
  }

  if (isLiveSupabase && supabaseClient) {
    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (error) throw error;

      if (data?.user) {
        setCurrentSessionUser({
          id: data.user.id,
          email: data.user.email
        });
        showToast('Login berhasil via Supabase Auth!', 'success');
        return;
      }
    } catch (err) {
      console.warn('Supabase auth failed:', err.message);
      if (errorAlert && errorMsg) {
        errorAlert.innerHTML = `
          <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2 text-rose-300 font-medium">
              <i class="fa-solid fa-circle-exclamation"></i>
              <span>${err.message || 'Akun belum terdaftar di Supabase Auth'}</span>
            </div>
            <p class="text-xs text-slate-300">
              Admin dapat mendaftarkan email ini di Supabase Dashboard, atau lanjutkan langsung ke mode preview:
            </p>
            <button
              type="button"
              id="btn-preview-login-fallback"
              onclick="handleDirectDemoBypassWithEmail('${(email || 'adminhotel@gmail.com').replace(/'/g, "\\'")}')"
              class="w-full py-2 px-3 mt-1 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg transition"
            >
              <i class="fa-solid fa-arrow-right-to-bracket"></i>
              <span>Lanjut Masuk sebagai ${email || 'adminhotel@gmail.com'} (Local/Demo)</span>
            </button>
          </div>
        `;
        errorAlert.classList.remove('hidden');
      }
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<span>Sign In to Dashboard</span><i class="fa-solid fa-arrow-right text-xs"></i>`;
      }
      return;
    }
  }

  // Offline / Demo fallback authentication
  if (email && password) {
    setCurrentSessionUser({
      id: 'usr-demo-001',
      email: email
    });
    showToast('Signed in successfully (Demo Session)', 'info');
  } else {
    if (errorAlert && errorMsg) {
      errorMsg.textContent = 'Harap isi email dan password.';
      errorAlert.classList.remove('hidden');
    }
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<span>Sign In to Dashboard</span><i class="fa-solid fa-arrow-right text-xs"></i>`;
    }
  }
}

function handleDirectDemoBypassWithEmail(customEmail) {
  const email = customEmail || 'adminhotel@gmail.com';
  setCurrentSessionUser({
    id: 'demo-admin-id',
    email: email
  });
  showToast(`Selamat datang ${email}! Mode Preview Aktif.`, 'success');
}

function handleDirectDemoBypass() {
  handleDirectDemoBypassWithEmail('adminhotel@gmail.com');
}

function setCurrentSessionUser(user) {
  currentUser = user;
  localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));

  const emailDisplay = document.getElementById('current-user-email');
  if (emailDisplay) emailDisplay.textContent = user.email;

  updateHeroGreeting();

  document.getElementById('login-view')?.classList.add('hidden');
  document.getElementById('app-shell')?.classList.remove('hidden');

  loadApplicationData();
  navigateTo('dashboard');
}

async function handleLogout() {
  if (isLiveSupabase && supabaseClient) {
    try {
      await supabaseClient.auth.signOut();
    } catch (e) {
      console.warn('Supabase signout:', e);
    }
  }

  currentUser = null;
  localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
  clearRattaBotSession(false);

  document.getElementById('app-shell')?.classList.add('hidden');
  document.getElementById('login-view')?.classList.remove('hidden');

  showToast('Logged out successfully.', 'info');
}

// ==============================================================================
// 18. SETTINGS & DYNAMIC CREDENTIALS PERSISTENCE
// ==============================================================================
function initSettingsForm() {
  const currentUrl = localStorage.getItem(STORAGE_KEYS.SUPABASE_URL) || DEFAULT_SUPABASE_URL;
  const currentKey = localStorage.getItem(STORAGE_KEYS.SUPABASE_KEY) || DEFAULT_SUPABASE_KEY;

  const urlInput = document.getElementById('settings-url');
  const keyInput = document.getElementById('settings-key');
  const configUrl = document.getElementById('config-url');
  const configKey = document.getElementById('config-key');

  if (urlInput) urlInput.value = currentUrl;
  if (keyInput) keyInput.value = currentKey;
  if (configUrl) configUrl.value = currentUrl;
  if (configKey) configKey.value = currentKey;

  initGeminiSettings();
}

function saveSettingsCredentials() {
  const url = document.getElementById('settings-url')?.value.trim();
  const key = document.getElementById('settings-key')?.value.trim();

  if (!url || !key) {
    showToast('Supabase URL dan Anon Key tidak boleh kosong!', 'error');
    return;
  }

  localStorage.setItem(STORAGE_KEYS.SUPABASE_URL, url);
  localStorage.setItem(STORAGE_KEYS.SUPABASE_KEY, key);

  initSupabaseClient();
  loadApplicationData();
  showToast('Kredensial Supabase berhasil disimpan! Menyinkronkan data...', 'success');
}

function saveLoginConfigDrawer() {
  const url = document.getElementById('config-url')?.value.trim();
  const key = document.getElementById('config-key')?.value.trim();

  if (!url || !key) {
    showToast('Supabase URL dan Anon Key harus diisi!', 'error');
    return;
  }

  localStorage.setItem(STORAGE_KEYS.SUPABASE_URL, url);
  localStorage.setItem(STORAGE_KEYS.SUPABASE_KEY, key);

  initSupabaseClient();
  showToast('Kredensial Supabase disimpan. Silakan login.', 'success');
}

async function testSupabaseConnection() {
  initSupabaseClient();

  if (!supabaseClient || !isLiveSupabase) {
    showToast('Koneksi Supabase belum aktif atau URL belum valid.', 'error');
    return;
  }

  try {
    const { data, error } = await supabaseClient.from('master_items').select('count', { count: 'exact' });
    if (error) {
      showToast(`Koneksi gagal: ${error.message}`, 'error');
    } else {
      showToast(`Koneksi Supabase Berhasil! Ditemukan ${data ? data.length : 0} records.`, 'success');
    }
  } catch (e) {
    showToast(`Error tes koneksi: ${e.message}`, 'error');
  }
}

function resetToDefaultCredentials() {
  localStorage.removeItem(STORAGE_KEYS.SUPABASE_URL);
  localStorage.removeItem(STORAGE_KEYS.SUPABASE_KEY);
  initSettingsForm();
  initSupabaseClient();
  showToast('Kredensial di-reset ke nilai default.', 'info');
}

function reloadDemoDataSeed() {
  if (confirm('Muat ulang seluruh data demo standar hotel? Data lokal akan diperbarui.')) {
    state = getInitialSeedData();
    persistState();
    showToast('Data demo berhasil di-reset.', 'success');
  }
}

function copySchemaSQL() {
  const sql = `-- HOTEL IT INVENTORY MANAGEMENT - ZERO-RLS SCHEMA & MIGRATION
ALTER TABLE public.master_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.department_movements DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.preloved DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities DISABLE ROW LEVEL SECURITY;

-- Pengurangan Unit Stok (Stock Reduction Support)
ALTER TABLE public.stock_transactions ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'INBOUND';
ALTER TABLE public.stock_transactions DROP CONSTRAINT IF EXISTS stock_transactions_type_check;
ALTER TABLE public.stock_transactions ADD CONSTRAINT stock_transactions_type_check CHECK (type IN ('INBOUND', 'REDUCTION'));`;

  navigator.clipboard.writeText(sql).then(() => {
    showToast('Ringkasan SQL Schema berhasil disalin ke clipboard!', 'success');
  }).catch(() => {
    showToast('Gagal menyalin, periksa izin clipboard.', 'error');
  });
}

// ==============================================================================
// 19. LIGHTBOX & TOAST UTILITIES
// ==============================================================================
function openLightbox(imgUrl, caption = '') {
  const lightbox = document.getElementById('modal-lightbox');
  const img = document.getElementById('lightbox-img');
  const cap = document.getElementById('lightbox-caption');

  if (img) img.src = imgUrl;
  if (cap) cap.textContent = caption;
  if (lightbox) lightbox.classList.remove('hidden');
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  const colors = {
    success: 'bg-emerald-950/90 text-emerald-200 border-emerald-500/40',
    error: 'bg-rose-950/90 text-rose-200 border-rose-500/40',
    info: 'bg-slate-900/95 text-slate-200 border-slate-700'
  };

  const icons = {
    success: 'fa-circle-check text-emerald-400',
    error: 'fa-circle-xmark text-rose-400',
    info: 'fa-circle-info text-cyan-400'
  };

  toast.className = `p-3.5 rounded-2xl border text-xs shadow-2xl backdrop-blur-md flex items-center gap-3 transition-all duration-300 transform translate-y-2 pointer-events-auto ${colors[type] || colors.info}`;
  toast.innerHTML = `
    <i class="fa-solid ${icons[type] || icons.info} text-base flex-shrink-0"></i>
    <span class="flex-1 font-medium">${escapeHtml(message)}</span>
    <button type="button" class="text-slate-400 hover:text-white transition ml-2 text-xs" onclick="this.parentElement.remove()">
      <i class="fa-solid fa-xmark"></i>
    </button>
  `;

  container.appendChild(toast);
  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-2');
  });

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ==============================================================================
// 19. WORKSTATION PC MANAGEMENT & COMPONENT MUTATION ENGINE
// ==============================================================================

function setPCFilter(filter) {
  pcFilter = filter;
  document.querySelectorAll('.pc-filter-btn').forEach(btn => {
    if (btn.dataset.filter === filter) {
      btn.className = 'pc-filter-btn px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-600 text-white shadow-md';
    } else {
      btn.className = 'pc-filter-btn px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white';
    }
  });
  renderPCManagement();
}

function renderSlotMiniChip(label, item, iconClass) {
  if (!item) {
    return `
      <div class="px-2 py-1 rounded-md bg-slate-900/60 border border-slate-800 text-slate-500 truncate flex items-center gap-1.5">
        <i class="fa-solid ${iconClass} text-[9px] text-slate-600 shrink-0"></i>
        <span class="truncate">${label}: -</span>
      </div>
    `;
  }
  return `
    <div class="px-2 py-1 rounded-md bg-slate-900 border border-slate-700/80 text-slate-300 truncate flex items-center gap-1.5" title="${escapeHtml(item.item_name)}">
      <i class="fa-solid ${iconClass} text-[9px] text-indigo-400 shrink-0"></i>
      <span class="font-medium truncate">${label}: ${escapeHtml(item.item_name)}</span>
    </div>
  `;
}

function renderPCManagement() {
  const grid = document.getElementById('pc-cards-grid');
  const emptyState = document.getElementById('pc-empty-state');
  const search = (document.getElementById('pc-search')?.value || '').toLowerCase().trim();

  state.pcs = state.pcs || [];

  // Update quick stats
  const total = state.pcs.length;
  const inDept = state.pcs.filter(p => !!p.department).length;
  const ready = total - inDept;

  const statTotal = document.getElementById('pc-stat-total');
  const statInDept = document.getElementById('pc-stat-in-dept');
  const statReady = document.getElementById('pc-stat-ready');

  if (statTotal) statTotal.textContent = total;
  if (statInDept) statInDept.textContent = inDept;
  if (statReady) statReady.textContent = ready;

  if (!grid) return;

  const filtered = state.pcs.filter(pc => {
    const matchFilter =
      pcFilter === 'ALL' ||
      (pcFilter === 'IN_DEPT' && !!pc.department) ||
      (pcFilter === 'READY' && !pc.department);

    const nameMatch = pc.name.toLowerCase().includes(search);
    const chipsetMatch = (pc.chipset || '').toLowerCase().includes(search);
    const deptMatch = (pc.department || '').toLowerCase().includes(search);

    return matchFilter && (nameMatch || chipsetMatch || deptMatch);
  });

  if (filtered.length === 0) {
    grid.innerHTML = '';
    emptyState?.classList.remove('hidden');
    return;
  }

  emptyState?.classList.add('hidden');

  grid.innerHTML = filtered.map(pc => {
    const isAssigned = !!pc.department;
    const psuItem = state.masterItems.find(i => i.id === pc.psu_item_id);
    const storageItem = state.masterItems.find(i => i.id === pc.storage_item_id);
    const ram1Item = state.masterItems.find(i => i.id === pc.ram1_item_id);
    const ram2Item = state.masterItems.find(i => i.id === pc.ram2_item_id);
    const ram3Item = state.masterItems.find(i => i.id === pc.ram3_item_id);
    const vgaItem = state.masterItems.find(i => i.id === pc.vga_item_id);

    return `
      <div
        onclick="openModalPCDetail('${pc.id}')"
        class="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/10 transition flex flex-col justify-between group cursor-pointer"
      >
        <div>
          <!-- Header Card -->
          <div class="flex items-start justify-between gap-2 mb-2">
            <div class="flex items-center gap-2.5 min-w-0">
              <div class="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                <i class="fa-solid fa-desktop text-base"></i>
              </div>
              <div class="min-w-0">
                <h4 class="text-base font-black text-white truncate tracking-tight">${escapeHtml(pc.name)}</h4>
                <div class="text-[11px] text-indigo-300 font-mono truncate">${escapeHtml(pc.chipset || '-')}</div>
              </div>
            </div>
          </div>

          <!-- Status Placement Badge -->
          <div class="mt-2.5">
            ${isAssigned ? `
              <div class="badge-pill px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 whitespace-nowrap">
                <i class="fa-solid fa-building mr-1.5 text-[9px]"></i>PC Terpasang di Departemen : ${escapeHtml(pc.department)}
              </div>
            ` : `
              <div class="badge-pill px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 whitespace-nowrap">
                <i class="fa-solid fa-boxes-stacked mr-1.5 text-[9px]"></i>Ready in IT Storage
              </div>
            `}
          </div>

          <!-- 6 Hardware Slots Mini Summary -->
          <div class="mt-4 grid grid-cols-2 gap-1.5 text-[10px]">
            ${renderSlotMiniChip('PSU', psuItem, 'fa-bolt')}
            ${renderSlotMiniChip('Storage', storageItem, 'fa-hard-drive')}
            ${renderSlotMiniChip('RAM 1', ram1Item, 'fa-memory')}
            ${renderSlotMiniChip('RAM 2', ram2Item, 'fa-memory')}
            ${renderSlotMiniChip('RAM 3', ram3Item, 'fa-memory')}
            ${renderSlotMiniChip('VGA', vgaItem, 'fa-tv')}
          </div>
        </div>

        <!-- Quick Action Footer -->
        <div class="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-1.5 text-xs" onclick="event.stopPropagation()">
          <div class="flex items-center gap-1.5 flex-1 min-w-0">
            <button
              type="button"
              onclick="openModalPCDetail('${pc.id}')"
              class="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold transition flex items-center gap-1.5 truncate"
            >
              <i class="fa-solid fa-sliders text-[10px] text-indigo-400 shrink-0"></i>
              <span class="truncate">Detail & Komponen</span>
            </button>

            ${isAssigned ? `
              <button
                type="button"
                onclick="handleRemovePCFromDept('${pc.id}')"
                class="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-semibold transition whitespace-nowrap shrink-0"
                title="Lepas PC Dari Departemen"
              >
                Lepas
              </button>
            ` : `
              <button
                type="button"
                onclick="openAssignDeptPrompt('${pc.id}')"
                class="px-2.5 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-semibold transition whitespace-nowrap shrink-0"
              >
                + Pasang ke Dept
              </button>
            `}
          </div>

          <button
            type="button"
            onclick="confirmDeletePC('${pc.id}')"
            class="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[11px] transition shrink-0"
            title="Delete PC (Semua Komponen Otomatis Kembali ke Inventory)"
          >
            <i class="fa-solid fa-trash-can text-xs"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function populateAddPCComponentDropdowns() {
  const pcItems = state.masterItems.filter(i => i.category === 'PC ITEMS');

  const buildOptions = (isRequired = false, defaultEmptyLabel = '-- Kosong / Tidak Terpasang --') => {
    let html = '';
    if (!isRequired) {
      html += `<option value="">${defaultEmptyLabel}</option>`;
    } else {
      html += `<option value="" disabled selected>-- Pilih Komponen dari PC ITEMS --</option>`;
    }

    pcItems.forEach(item => {
      const metrics = calculateStockMetrics(item.id);
      const isAvailable = metrics.availableStock > 0;
      const stockBadge = isAvailable ? `(Sisa Stok: ${metrics.availableStock} unit)` : '(Habis / Out of stock)';
      const disabledAttr = isAvailable ? '' : 'disabled class="text-slate-600 bg-slate-950"';
      html += `<option value="${item.id}" ${disabledAttr}>${escapeHtml(item.item_name)} ${stockBadge}</option>`;
    });

    return html;
  };

  const psuSelect = document.getElementById('add-pc-psu');
  const storageSelect = document.getElementById('add-pc-storage');
  const ram1Select = document.getElementById('add-pc-ram1');
  const ram2Select = document.getElementById('add-pc-ram2');
  const ram3Select = document.getElementById('add-pc-ram3');
  const vgaSelect = document.getElementById('add-pc-vga');

  if (psuSelect) psuSelect.innerHTML = buildOptions(true);
  if (storageSelect) storageSelect.innerHTML = buildOptions(true);
  if (ram1Select) ram1Select.innerHTML = buildOptions(true);
  if (ram2Select) ram2Select.innerHTML = buildOptions(false, '-- Kosong / Tidak Terpasang --');
  if (ram3Select) ram3Select.innerHTML = buildOptions(false, '-- Kosong / Tidak Terpasang --');
  if (vgaSelect) vgaSelect.innerHTML = buildOptions(false, '-- Kosong / Integrated Graphics (Onboard) --');
}

function openModalAddPC() {
  const form = document.getElementById('form-add-pc');
  if (form) form.reset();
  populateAddPCComponentDropdowns();
  openModal('modal-add-pc');
}

async function handleCreatePCSubmit(e) {
  e.preventDefault();

  const nameInput = document.getElementById('add-pc-name');
  const chipsetInput = document.getElementById('add-pc-chipset');
  const psuSelect = document.getElementById('add-pc-psu');
  const storageSelect = document.getElementById('add-pc-storage');
  const ram1Select = document.getElementById('add-pc-ram1');
  const ram2Select = document.getElementById('add-pc-ram2');
  const ram3Select = document.getElementById('add-pc-ram3');
  const vgaSelect = document.getElementById('add-pc-vga');

  const pcName = (nameInput?.value || '').trim();
  const chipset = (chipsetInput?.value || '').trim();
  const psuId = psuSelect?.value;
  const storageId = storageSelect?.value;
  const ram1Id = ram1Select?.value;
  const ram2Id = ram2Select?.value || null;
  const ram3Id = ram3Select?.value || null;
  const vgaId = vgaSelect?.value || null;

  if (!pcName) {
    showToast('Nama PC wajib diisi.', 'error');
    return;
  }

  if (!chipset) {
    showToast('Chipset (Intel/AMD) wajib diisi.', 'error');
    return;
  }

  // Check unique name
  state.pcs = state.pcs || [];
  if (state.pcs.some(p => p.name.toLowerCase() === pcName.toLowerCase())) {
    showToast(`Nama PC "${pcName}" sudah digunakan. Silakan gunakan nama unik lain.`, 'error');
    return;
  }

  if (!psuId || !storageId || !ram1Id) {
    showToast('Komponen Power Supply, Hardisk/SSD, dan RAM Slot 1 wajib dipilih dari stok inventory.', 'error');
    return;
  }

  // Verify stock availability
  const selectedComps = [
    { slot: 'Power Supply', id: psuId },
    { slot: 'Hardisk / SSD', id: storageId },
    { slot: 'RAM Slot 1', id: ram1Id }
  ];
  if (ram2Id) selectedComps.push({ slot: 'RAM Slot 2', id: ram2Id });
  if (ram3Id) selectedComps.push({ slot: 'RAM Slot 3', id: ram3Id });
  if (vgaId) selectedComps.push({ slot: 'VGA Card', id: vgaId });

  // Count items used to ensure enough available stock
  const itemUsageMap = {};
  for (const comp of selectedComps) {
    itemUsageMap[comp.id] = (itemUsageMap[comp.id] || 0) + 1;
  }

  for (const [itemId, neededQty] of Object.entries(itemUsageMap)) {
    const metrics = calculateStockMetrics(itemId);
    const itemObj = state.masterItems.find(i => i.id === itemId);
    if (metrics.availableStock < neededQty) {
      showToast(`Stok untuk "${itemObj?.item_name || 'Komponen'}" tidak mencukupi (Tersedia: ${metrics.availableStock}, Dibutuhkan: ${neededQty}).`, 'error');
      return;
    }
  }

  const deviceTimestamp = getClientDeviceTimestamp();
  const currentDate = deviceTimestamp.split(' ')[0];
  const actor = currentUser ? currentUser.email : 'admin@hotel.com';

  const newPC = {
    id: `pc-${Date.now()}`,
    name: pcName,
    chipset: chipset,
    department: null,
    status: 'Ready in IT Storage',
    psu_item_id: psuId,
    storage_item_id: storageId,
    ram1_item_id: ram1Id,
    ram2_item_id: ram2Id,
    ram3_item_id: ram3Id,
    vga_item_id: vgaId,
    created_at: deviceTimestamp,
    created_by: actor
  };

  state.pcs.unshift(newPC);

  // Record PC creation in PC Movements
  const pcm = {
    id: `pcm-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    timestamp: deviceTimestamp,
    pc_id: newPC.id,
    pc_name: newPC.name,
    action_type: 'RAKIT_PC_BARU',
    from_location: 'IT Storage',
    to_location: 'Ready in IT Storage',
    actor: actor,
    notes: 'Rakit PC baru dengan alokasi komponen awal'
  };
  state.pcMovements.unshift(pcm);

  // Deduct inventory stock for each component by logging 'TRANSFER TO PC' in departmentMovements
  // and record in pcComponentMovements
  for (const comp of selectedComps) {
    const itemObj = state.masterItems.find(i => i.id === comp.id);
    const itemName = itemObj ? itemObj.item_name : 'Hardware Component';

    // Motion analytics record (Department: -, QTY: 1, Pic: -, Remark: -)
    const mov = {
      id: `mov-pc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      item_id: comp.id,
      department: '-',
      type: 'TRANSFER TO PC',
      quantity: 1,
      date: currentDate,
      recipient_name: '-',
      remark: '-'
    };
    state.departmentMovements.unshift(mov);

    // Component movement log
    const compMov = {
      id: `pccm-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: deviceTimestamp,
      pc_id: newPC.id,
      pc_name: newPC.name,
      slot_name: comp.slot,
      item_id: comp.id,
      item_name: itemName,
      action_type: 'PASANG_DARI_INVENTORY',
      related_pc_name: null,
      actor: actor,
      notes: 'Pemasangan awal saat rakit PC'
    };
    state.pcComponentMovements.unshift(compMov);

    if (isLiveSupabase && supabaseClient) {
      supabaseClient.from('department_movements').insert(mov).then(() => {});
      supabaseClient.from('pc_component_movements').insert(compMov).then(() => {});
    }
  }

  if (isLiveSupabase && supabaseClient) {
    supabaseClient.from('pcs').insert(newPC).then(() => {});
    supabaseClient.from('pc_movements').insert(pcm).then(() => {});
  }

  logActivity(newPC.name, 'PC ITEMS', 'Merakit workstation baru', 'WORKSTATION');
  persistState();
  closeModal('modal-add-pc');
  showToast(`PC "${newPC.name}" berhasil dirakit dan siap digunakan!`, 'success');
}

function openModalPCDetail(pcId) {
  currentDetailPCId = pcId;
  const pc = state.pcs.find(p => p.id === pcId);
  if (!pc) return;

  const titleEl = document.getElementById('pc-detail-title');
  const chipsetEl = document.getElementById('pc-detail-chipset');
  const deptBanner = document.getElementById('pc-detail-dept-banner');
  const slotsGrid = document.getElementById('pc-detail-components-grid');

  if (titleEl) titleEl.textContent = pc.name;
  if (chipsetEl) chipsetEl.textContent = pc.chipset || '-';

  toggleEditPCName(false);

  // Department Placement Banner
  if (deptBanner) {
    const isAssigned = !!pc.department;
    if (isAssigned) {
      deptBanner.innerHTML = `
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span class="text-xs text-slate-400">Status Penempatan:</span>
            <div class="text-sm font-bold text-amber-300 flex items-center gap-2 mt-0.5">
              <i class="fa-solid fa-building"></i>
              <span>PC Terpasang di Departemen : ${escapeHtml(pc.department)}</span>
            </div>
          </div>
          <button
            type="button"
            onclick="handleRemovePCFromDept('${pc.id}')"
            class="px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-semibold transition shrink-0 flex items-center gap-2"
          >
            <i class="fa-solid fa-arrow-right-from-bracket text-xs"></i>
            <span>Lepas dari Departemen (Remove PC From This Department)</span>
          </button>
        </div>
      `;
    } else {
      deptBanner.innerHTML = `
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span class="text-xs text-slate-400">Status Penempatan:</span>
            <div class="text-sm font-bold text-emerald-300 flex items-center gap-2 mt-0.5">
              <i class="fa-solid fa-boxes-stacked"></i>
              <span>Ready in IT Storage</span>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <select id="detail-pc-assign-dept-select" class="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white outline-none focus:border-brand-500">
              ${DEPARTMENTS.map(d => `<option value="${d}">${d}</option>`).join('')}
            </select>
            <button
              type="button"
              onclick="handleAssignPCToDeptFromDetail('${pc.id}')"
              class="px-4 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-brand-600 hover:from-indigo-500 hover:to-brand-500 text-white text-xs font-semibold shadow-md transition shrink-0"
            >
              Pasang ke Departemen
            </button>
          </div>
        </div>
      `;
    }
  }

  // 6 Hardware Component Slots
  if (slotsGrid) {
    const slots = [
      { key: 'psu_item_id', label: 'Power Supply', icon: 'fa-bolt' },
      { key: 'storage_item_id', label: 'Hardisk / SSD', icon: 'fa-hard-drive' },
      { key: 'ram1_item_id', label: 'RAM Slot 1', icon: 'fa-memory' },
      { key: 'ram2_item_id', label: 'RAM Slot 2', icon: 'fa-memory' },
      { key: 'ram3_item_id', label: 'RAM Slot 3', icon: 'fa-memory' },
      { key: 'vga_item_id', label: 'VGA Card', icon: 'fa-tv' }
    ];

    slotsGrid.innerHTML = slots.map(slot => {
      const itemId = pc[slot.key];
      const item = state.masterItems.find(i => i.id === itemId);

      if (item) {
        const photo = item.photo_url
          ? `<img src="${item.photo_url}" class="w-10 h-10 rounded-lg object-cover border border-slate-700 shrink-0">`
          : `<div class="w-10 h-10 rounded-lg bg-slate-800 text-indigo-400 flex items-center justify-center shrink-0 border border-slate-700"><i class="fa-solid ${slot.icon}"></i></div>`;

        return `
          <div class="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/40 transition flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between text-[11px] mb-2">
                <span class="font-bold text-slate-400 flex items-center gap-1.5">
                  <i class="fa-solid ${slot.icon} text-indigo-400"></i>
                  <span>${slot.label}</span>
                </span>
                <span class="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Terpasang</span>
              </div>
              <div class="flex items-start gap-2.5">
                ${photo}
                <div class="min-w-0 flex-1">
                  <h5 class="text-xs font-bold text-white truncate" title="${escapeHtml(item.item_name)}">${escapeHtml(item.item_name)}</h5>
                  <div class="text-[10px] text-slate-400 font-mono mt-0.5">${escapeHtml(item.item_code || '-')}</div>
                </div>
              </div>
            </div>

            <div class="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-end">
              <button
                type="button"
                onclick="openComponentActionModal('${pc.id}', '${slot.key}', '${slot.label}')"
                class="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-[11px] font-semibold transition flex items-center gap-1.5"
              >
                <i class="fa-solid fa-gear text-[10px]"></i>
                <span>Aksi Komponen (Swap / Return)</span>
              </button>
            </div>
          </div>
        `;
      } else {
        return `
          <div class="p-3.5 rounded-xl bg-slate-900/40 border border-dashed border-slate-800 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between text-[11px] mb-2">
                <span class="font-bold text-slate-500 flex items-center gap-1.5">
                  <i class="fa-solid ${slot.icon}"></i>
                  <span>${slot.label}</span>
                </span>
                <span class="px-2 py-0.5 rounded text-[9px] font-medium bg-slate-800 text-slate-500">Kosong</span>
              </div>
              <p class="text-[11px] text-slate-500 italic">Belum ada hardware terpasang pada slot ini.</p>
            </div>

            <div class="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-end">
              <button
                type="button"
                onclick="openModalInstallComponent('${pc.id}', '${slot.key}', '${slot.label}')"
                class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/20 text-[11px] font-semibold transition flex items-center gap-1.5"
              >
                <i class="fa-solid fa-plus text-[10px]"></i>
                <span>Pasang Komponen</span>
              </button>
            </div>
          </div>
        `;
      }
    }).join('');
  }

  openModal('modal-pc-detail');
}

function toggleEditPCName(isEditing) {
  const viewEl = document.getElementById('pc-detail-name-view');
  const editEl = document.getElementById('pc-detail-name-edit');
  const inputEl = document.getElementById('input-edit-pc-name');

  if (isEditing) {
    const pc = state.pcs.find(p => p.id === currentDetailPCId);
    if (pc && inputEl) inputEl.value = pc.name;
    viewEl?.classList.add('hidden');
    editEl?.classList.remove('hidden');
    inputEl?.focus();
  } else {
    viewEl?.classList.remove('hidden');
    editEl?.classList.add('hidden');
  }
}

function saveEditedPCName() {
  const inputEl = document.getElementById('input-edit-pc-name');
  const newName = (inputEl?.value || '').trim();
  if (!newName) {
    showToast('Nama PC tidak boleh kosong.', 'error');
    return;
  }

  const pc = state.pcs.find(p => p.id === currentDetailPCId);
  if (!pc) return;

  if (pc.name.toLowerCase() !== newName.toLowerCase() && state.pcs.some(p => p.id !== pc.id && p.name.toLowerCase() === newName.toLowerCase())) {
    showToast(`Nama PC "${newName}" sudah digunakan oleh workstation lain.`, 'error');
    return;
  }

  const oldName = pc.name;
  pc.name = newName;

  const pcm = {
    id: `pcm-${Date.now()}`,
    timestamp: getClientDeviceTimestamp(),
    pc_id: pc.id,
    pc_name: pc.name,
    action_type: 'RENAME_PC',
    from_location: oldName,
    to_location: newName,
    actor: currentUser ? currentUser.email : 'admin@hotel.com',
    notes: `Nama PC diubah dari "${oldName}" menjadi "${newName}"`
  };
  state.pcMovements.unshift(pcm);

  if (isLiveSupabase && supabaseClient) {
    supabaseClient.from('pcs').update({ name: newName }).eq('id', pc.id).then(() => {});
    supabaseClient.from('pc_movements').insert(pcm).then(() => {});
  }

  logActivity(newName, 'PC ITEMS', `Rename PC dari ${oldName} ke ${newName}`, 'WORKSTATION');
  persistState();
  openModalPCDetail(pc.id);
  showToast('Nama PC berhasil diperbarui!', 'success');
}

function handleAssignPCToDept(pcId, deptName) {
  const pc = state.pcs.find(p => p.id === pcId);
  if (!pc) return;

  const oldLocation = pc.department ? pc.department : 'Ready in IT Storage';
  pc.department = deptName;
  pc.status = `PC Terpasang di Departemen : ${deptName}`;

  const pcm = {
    id: `pcm-${Date.now()}`,
    timestamp: getClientDeviceTimestamp(),
    pc_id: pc.id,
    pc_name: pc.name,
    action_type: 'PASANG_KE_DEPARTEMEN',
    from_location: oldLocation,
    to_location: deptName,
    actor: currentUser ? currentUser.email : 'admin@hotel.com',
    notes: `Workstation ditugaskan ke departemen ${deptName}`
  };
  state.pcMovements.unshift(pcm);

  if (isLiveSupabase && supabaseClient) {
    supabaseClient.from('pcs').update({ department: deptName, status: pc.status }).eq('id', pc.id).then(() => {});
    supabaseClient.from('pc_movements').insert(pcm).then(() => {});
  }

  logActivity(pc.name, 'PC ITEMS', `Pasang PC ke departemen ${deptName}`, 'WORKSTATION');
  persistState();
  showToast(`PC "${pc.name}" berhasil dipasang ke departemen ${deptName}!`, 'success');
}

function handleAssignPCToDeptFromDetail(pcId) {
  const select = document.getElementById('detail-pc-assign-dept-select');
  const dept = select?.value;
  if (!dept) return;
  handleAssignPCToDept(pcId, dept);
  openModalPCDetail(pcId);
}

function handleRemovePCFromDept(pcId) {
  const pc = state.pcs.find(p => p.id === pcId);
  if (!pc) return;

  const oldDept = pc.department || 'Departemen';
  pc.department = null;
  pc.status = 'Ready in IT Storage';

  const pcm = {
    id: `pcm-${Date.now()}`,
    timestamp: getClientDeviceTimestamp(),
    pc_id: pc.id,
    pc_name: pc.name,
    action_type: 'LEPAS_DARI_DEPARTEMEN',
    from_location: oldDept,
    to_location: 'Ready in IT Storage',
    actor: currentUser ? currentUser.email : 'admin@hotel.com',
    notes: `Workstation dilepas dari departemen ${oldDept} dan dikembalikan ke IT Storage`
  };
  state.pcMovements.unshift(pcm);

  if (isLiveSupabase && supabaseClient) {
    supabaseClient.from('pcs').update({ department: null, status: 'Ready in IT Storage' }).eq('id', pc.id).then(() => {});
    supabaseClient.from('pc_movements').insert(pcm).then(() => {});
  }

  logActivity(pc.name, 'PC ITEMS', `Lepas PC dari departemen ${oldDept}`, 'WORKSTATION');
  persistState();

  // If modal detail is open, refresh it
  if (currentDetailPCId === pcId) {
    openModalPCDetail(pcId);
  }
  showToast(`PC "${pc.name}" berhasil dilepas dari ${oldDept} dan berstatus Ready in IT Storage.`, 'info');
}

function openAssignDeptPrompt(pcId) {
  const pc = state.pcs.find(p => p.id === pcId);
  if (!pc) return;
  openModalPCDetail(pcId);
}

// ==============================================================================
// DELETE PC & AUTO-RETURN COMPONENTS ENGINE
// ==============================================================================
let pendingDeletePCId = null;

function confirmDeletePC(pcId) {
  const pc = state.pcs.find(p => p.id === pcId);
  if (!pc) return;

  pendingDeletePCId = pcId;

  const nameEl = document.getElementById('delete-pc-name-display');
  const listEl = document.getElementById('delete-pc-components-list');

  if (nameEl) {
    nameEl.textContent = `${pc.name} (${pc.chipset || 'Workstation'})`;
  }

  const slotDefs = [
    { key: 'psu_item_id', label: 'Power Supply', icon: 'fa-bolt' },
    { key: 'storage_item_id', label: 'Hardisk / SSD', icon: 'fa-hard-drive' },
    { key: 'ram1_item_id', label: 'RAM Slot 1', icon: 'fa-memory' },
    { key: 'ram2_item_id', label: 'RAM Slot 2', icon: 'fa-memory' },
    { key: 'ram3_item_id', label: 'RAM Slot 3', icon: 'fa-memory' },
    { key: 'vga_item_id', label: 'VGA Card', icon: 'fa-tv' }
  ];

  const installed = [];
  slotDefs.forEach(slot => {
    const itemId = pc[slot.key];
    if (itemId) {
      const item = state.masterItems.find(i => i.id === itemId);
      installed.push({
        slotKey: slot.key,
        slotLabel: slot.label,
        icon: slot.icon,
        itemId: itemId,
        itemName: item ? item.item_name : 'Hardware Component'
      });
    }
  });

  if (listEl) {
    if (installed.length === 0) {
      listEl.innerHTML = `
        <div class="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-400 text-center">
          Tidak ada komponen hardware yang terpasang pada PC ini.
        </div>
      `;
    } else {
      listEl.innerHTML = installed.map(comp => `
        <div class="px-3 py-2 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs">
          <div class="flex items-center gap-2 min-w-0">
            <i class="fa-solid ${comp.icon} text-indigo-400 shrink-0 text-xs"></i>
            <span class="text-slate-400 shrink-0 font-medium">${comp.slotLabel}:</span>
            <span class="font-bold text-white truncate" title="${escapeHtml(comp.itemName)}">${escapeHtml(comp.itemName)}</span>
          </div>
          <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0 ml-2">
            +1 ke Inventory
          </span>
        </div>
      `).join('');
    }
  }

  openModal('modal-delete-pc');
}

function openDeletePCModalFromDetail() {
  if (!currentDetailPCId) return;
  confirmDeletePC(currentDetailPCId);
}

async function executeDeletePC() {
  if (!pendingDeletePCId) return;

  const pcIndex = state.pcs.findIndex(p => p.id === pendingDeletePCId);
  if (pcIndex === -1) {
    closeModal('modal-delete-pc');
    return;
  }

  const pc = state.pcs[pcIndex];
  const deviceTimestamp = getClientDeviceTimestamp();
  const currentDate = deviceTimestamp.split(' ')[0];
  const actor = currentUser ? currentUser.email : 'admin@hotel.com';

  const slotDefs = [
    { key: 'psu_item_id', label: 'Power Supply' },
    { key: 'storage_item_id', label: 'Hardisk / SSD' },
    { key: 'ram1_item_id', label: 'RAM Slot 1' },
    { key: 'ram2_item_id', label: 'RAM Slot 2' },
    { key: 'ram3_item_id', label: 'RAM Slot 3' },
    { key: 'vga_item_id', label: 'VGA Card' }
  ];

  let returnedCount = 0;
  const returnedMovements = [];
  const returnedCompMovements = [];

  // Return each installed component back to inventory stock
  slotDefs.forEach(slot => {
    const itemId = pc[slot.key];
    if (itemId) {
      returnedCount++;
      const itemObj = state.masterItems.find(i => i.id === itemId);
      const itemName = itemObj ? itemObj.item_name : 'Hardware Component';

      // 1. Movement log in departmentMovements as 'RETURN FROM PC'
      // This immediately increases availableStock in calculateStockMetrics
      const mov = {
        id: `mov-ret-del-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        item_id: itemId,
        department: '-',
        type: 'RETURN FROM PC',
        quantity: 1,
        date: currentDate,
        recipient_name: 'IT Storage (PC Deleted)',
        remark: `Otomatis kembali ke inventory karena PC "${pc.name}" dihapus`
      };
      state.departmentMovements.unshift(mov);
      returnedMovements.push(mov);

      // 2. PC Component Movement log
      const compMov = {
        id: `pccm-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        timestamp: deviceTimestamp,
        pc_id: pc.id,
        pc_name: pc.name,
        slot_name: slot.label,
        item_id: itemId,
        item_name: itemName,
        action_type: 'RETURN_TO_INVENTORY',
        related_pc_name: null,
        actor: actor,
        notes: `Komponen otomatis kembali ke inventory karena PC "${pc.name}" dihapus`
      };
      state.pcComponentMovements.unshift(compMov);
      returnedCompMovements.push(compMov);
    }
  });

  // 3. PC Movement log for the PC deletion itself
  const pcm = {
    id: `pcm-${Date.now()}`,
    timestamp: deviceTimestamp,
    pc_id: pc.id,
    pc_name: pc.name,
    action_type: 'HAPUS_PC',
    from_location: pc.department ? pc.department : 'Ready in IT Storage',
    to_location: 'Deleted (Hardware Returned)',
    actor: actor,
    notes: `Workstation ${pc.name} dihapus. Sebanyak ${returnedCount} komponen hardware otomatis dikembalikan ke stok gudang IT.`
  };
  state.pcMovements.unshift(pcm);

  // 4. Remove PC from state.pcs
  state.pcs.splice(pcIndex, 1);

  // 5. Supabase persistence if connected
  if (isLiveSupabase && supabaseClient) {
    supabaseClient.from('pcs').delete().eq('id', pc.id).then(() => {});
    supabaseClient.from('pc_movements').insert(pcm).then(() => {});
    returnedMovements.forEach(m => {
      supabaseClient.from('department_movements').insert(m).then(() => {});
    });
    returnedCompMovements.forEach(cm => {
      supabaseClient.from('pc_component_movements').insert(cm).then(() => {});
    });
  }

  logActivity(pc.name, 'PC ITEMS', `Hapus PC ${pc.name} & kembalikan ${returnedCount} komponen ke inventory`, 'WORKSTATION');
  persistState();

  closeModal('modal-delete-pc');
  closeModal('modal-pc-detail');
  pendingDeletePCId = null;
  currentDetailPCId = null;

  refreshAllViews();
  showToast(`PC "${pc.name}" berhasil dihapus. ${returnedCount} komponen telah otomatis kembali ke Inventory Stock!`, 'success');
}

function openComponentActionModal(pcId, slotKey, slotLabel) {
  currentActionSlot = { pcId, slotKey, slotLabel };
  const pc = state.pcs.find(p => p.id === pcId);
  if (!pc) return;

  const itemId = pc[slotKey];
  const item = state.masterItems.find(i => i.id === itemId);
  if (!item) return;

  const nameEl = document.getElementById('comp-action-name');
  const descEl = document.getElementById('comp-action-desc');
  const badgeEl = document.getElementById('comp-action-slot-badge');
  const currentPCEl = document.getElementById('comp-action-current-pc');
  const imgContainer = document.getElementById('comp-action-img-container');
  const swapTargetSelect = document.getElementById('select-swap-target-pc');

  if (nameEl) nameEl.textContent = item.item_name;
  if (descEl) descEl.textContent = item.remark || `Kode SKU: ${item.item_code || '-'}`;
  if (badgeEl) badgeEl.textContent = `Slot: ${slotLabel || slotKey}`;
  if (currentPCEl) currentPCEl.textContent = `Terpasang di: ${pc.name} (${pc.department ? 'Dept ' + pc.department : 'IT Storage'})`;

  if (imgContainer) {
    imgContainer.innerHTML = item.photo_url
      ? `<img src="${item.photo_url}" class="w-full h-full object-cover">`
      : `<i class="fa-solid fa-microchip text-xl text-slate-500"></i>`;
  }

  // Populate other PCs for swap
  if (swapTargetSelect) {
    const otherPCs = state.pcs.filter(p => p.id !== pcId);
    if (otherPCs.length === 0) {
      swapTargetSelect.innerHTML = `<option value="" disabled selected>Tidak ada PC lain yang tersedia</option>`;
    } else {
      swapTargetSelect.innerHTML = otherPCs.map(p => {
        const targetItemId = p[slotKey];
        const targetItem = state.masterItems.find(i => i.id === targetItemId);
        const compLabel = targetItem ? targetItem.item_name : '(Slot Kosong)';
        return `<option value="${p.id}">${escapeHtml(p.name)} &bull; ${compLabel}</option>`;
      }).join('');
    }
  }

  openModal('modal-component-action');
}

async function executeSwapComponent() {
  if (!currentActionSlot) return;
  const { pcId, slotKey, slotLabel } = currentActionSlot;
  const targetSelect = document.getElementById('select-swap-target-pc');
  const targetPCId = targetSelect?.value;

  if (!targetPCId) {
    showToast('Pilih PC tujuan swap terlebih dahulu.', 'error');
    return;
  }

  const pcA = state.pcs.find(p => p.id === pcId);
  const pcB = state.pcs.find(p => p.id === targetPCId);
  if (!pcA || !pcB) return;

  const itemAId = pcA[slotKey];
  const itemBId = pcB[slotKey];

  const itemA = state.masterItems.find(i => i.id === itemAId);
  const itemB = state.masterItems.find(i => i.id === itemBId);

  // Perform Swap
  pcA[slotKey] = itemBId || null;
  pcB[slotKey] = itemAId || null;

  const deviceTimestamp = getClientDeviceTimestamp();
  const actor = currentUser ? currentUser.email : 'admin@hotel.com';

  // Record 2 component movements
  const logA = {
    id: `pccm-${Date.now()}-1`,
    timestamp: deviceTimestamp,
    pc_id: pcA.id,
    pc_name: pcA.name,
    slot_name: slotLabel || slotKey,
    item_id: itemBId || null,
    item_name: itemB ? itemB.item_name : '(Kosong)',
    action_type: 'SWAP_DENGAN_PC_LAIN',
    related_pc_name: pcB.name,
    actor: actor,
    notes: `Tukar komponen dengan ${pcB.name} (Sebelumnya: ${itemA?.item_name || 'Kosong'})`
  };

  const logB = {
    id: `pccm-${Date.now()}-2`,
    timestamp: deviceTimestamp,
    pc_id: pcB.id,
    pc_name: pcB.name,
    slot_name: slotLabel || slotKey,
    item_id: itemAId || null,
    item_name: itemA ? itemA.item_name : '(Kosong)',
    action_type: 'SWAP_DENGAN_PC_LAIN',
    related_pc_name: pcA.name,
    actor: actor,
    notes: `Tukar komponen dengan ${pcA.name} (Sebelumnya: ${itemB?.item_name || 'Kosong'})`
  };

  state.pcComponentMovements.unshift(logA);
  state.pcComponentMovements.unshift(logB);

  if (isLiveSupabase && supabaseClient) {
    supabaseClient.from('pcs').update({ [slotKey]: pcA[slotKey] }).eq('id', pcA.id).then(() => {});
    supabaseClient.from('pcs').update({ [slotKey]: pcB[slotKey] }).eq('id', pcB.id).then(() => {});
    supabaseClient.from('pc_component_movements').insert([logA, logB]).then(() => {});
  }

  logActivity(pcA.name, 'PC ITEMS', `Swap komponen ${slotLabel} dengan ${pcB.name}`, 'WORKSTATION');
  persistState();
  closeModal('modal-component-action');
  openModalPCDetail(pcA.id);
  showToast(`Swap komponen antara ${pcA.name} dan ${pcB.name} berhasil!`, 'success');
}

async function executeReturnComponentToInventory() {
  if (!currentActionSlot) return;
  const { pcId, slotKey, slotLabel } = currentActionSlot;
  const pc = state.pcs.find(p => p.id === pcId);
  if (!pc) return;

  const itemId = pc[slotKey];
  const item = state.masterItems.find(i => i.id === itemId);
  if (!item) return;

  const confirmReturn = confirm(`Apakah Anda yakin ingin melepas "${item.item_name}" dari ${pc.name} dan mengembalikannya ke Inventory IT Storage?`);
  if (!confirmReturn) return;

  // Clear slot on PC
  pc[slotKey] = null;

  const deviceTimestamp = getClientDeviceTimestamp();
  const currentDate = deviceTimestamp.split(' ')[0];
  const actor = currentUser ? currentUser.email : 'admin@hotel.com';

  // 1. Log in department_movements as RETURN FROM PC (so calculateStockMetrics will add 1 unit back to inventory!)
  const mov = {
    id: `mov-ret-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    item_id: item.id,
    department: '-',
    type: 'RETURN FROM PC',
    quantity: 1,
    date: currentDate,
    recipient_name: '-',
    remark: `Returned from workstation ${pc.name}`
  };
  state.departmentMovements.unshift(mov);

  // 2. Log in pcComponentMovements
  const compMov = {
    id: `pccm-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    timestamp: deviceTimestamp,
    pc_id: pc.id,
    pc_name: pc.name,
    slot_name: slotLabel || slotKey,
    item_id: item.id,
    item_name: item.item_name,
    action_type: 'RETURN_TO_INVENTORY',
    related_pc_name: null,
    actor: actor,
    notes: `Dilepas dari ${pc.name} dan dikembalikan 1 unit ke stok gudang IT`
  };
  state.pcComponentMovements.unshift(compMov);

  if (isLiveSupabase && supabaseClient) {
    supabaseClient.from('pcs').update({ [slotKey]: null }).eq('id', pc.id).then(() => {});
    supabaseClient.from('department_movements').insert(mov).then(() => {});
    supabaseClient.from('pc_component_movements').insert(compMov).then(() => {});
  }

  logActivity(item.item_name, 'PC ITEMS', `Return dari ${pc.name} ke Inventory`, 'WORKSTATION');
  persistState();
  closeModal('modal-component-action');
  openModalPCDetail(pc.id);
  showToast(`Komponen "${item.item_name}" berhasil dikembalikan ke Inventory Stock (Stok bertambah 1).`, 'success');
}

function openModalInstallComponent(pcId, slotKey, slotLabel) {
  currentInstallTarget = { pcId, slotKey, slotLabel };
  const pc = state.pcs.find(p => p.id === pcId);
  if (!pc) return;

  const labelEl = document.getElementById('install-comp-target-label');
  const selectEl = document.getElementById('select-install-component');
  const hintEl = document.getElementById('install-comp-stock-hint');

  if (labelEl) labelEl.textContent = `${pc.name} \u2022 ${slotLabel || slotKey}`;

  const pcItems = state.masterItems.filter(i => i.category === 'PC ITEMS');

  if (selectEl) {
    const availableItems = pcItems.filter(item => calculateStockMetrics(item.id).availableStock > 0);
    if (availableItems.length === 0) {
      selectEl.innerHTML = `<option value="" disabled selected>-- Tidak ada stok PC ITEMS yang tersedia di gudang IT --</option>`;
      if (hintEl) hintEl.textContent = 'Stok Tersedia: 0 unit';
    } else {
      selectEl.innerHTML = availableItems.map(item => {
        const m = calculateStockMetrics(item.id);
        return `<option value="${item.id}">${escapeHtml(item.item_name)} (Stok: ${m.availableStock} unit)</option>`;
      }).join('');

      const firstItem = availableItems[0];
      const m = calculateStockMetrics(firstItem.id);
      if (hintEl) hintEl.textContent = `Stok Tersedia: ${m.availableStock} unit`;

      selectEl.onchange = () => {
        const selected = state.masterItems.find(i => i.id === selectEl.value);
        if (selected && hintEl) {
          const met = calculateStockMetrics(selected.id);
          hintEl.textContent = `Stok Tersedia: ${met.availableStock} unit`;
        }
      };
    }
  }

  openModal('modal-install-component');
}

async function executeInstallComponent() {
  if (!currentInstallTarget) return;
  const { pcId, slotKey, slotLabel } = currentInstallTarget;
  const selectEl = document.getElementById('select-install-component');
  const itemId = selectEl?.value;

  if (!itemId) {
    showToast('Pilih komponen hardware terlebih dahulu.', 'error');
    return;
  }

  const pc = state.pcs.find(p => p.id === pcId);
  const item = state.masterItems.find(i => i.id === itemId);
  if (!pc || !item) return;

  const metrics = calculateStockMetrics(item.id);
  if (metrics.availableStock < 1) {
    showToast(`Stok untuk "${item.item_name}" sudah habis.`, 'error');
    return;
  }

  // Install component to slot
  pc[slotKey] = item.id;

  const deviceTimestamp = getClientDeviceTimestamp();
  const currentDate = deviceTimestamp.split(' ')[0];
  const actor = currentUser ? currentUser.email : 'admin@hotel.com';

  // 1. Log in department_movements as TRANSFER TO PC (cuts 1 unit from inventory stock)
  const mov = {
    id: `mov-ins-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    item_id: item.id,
    department: '-',
    type: 'TRANSFER TO PC',
    quantity: 1,
    date: currentDate,
    recipient_name: '-',
    remark: '-'
  };
  state.departmentMovements.unshift(mov);

  // 2. Log in pcComponentMovements
  const compMov = {
    id: `pccm-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    timestamp: deviceTimestamp,
    pc_id: pc.id,
    pc_name: pc.name,
    slot_name: slotLabel || slotKey,
    item_id: item.id,
    item_name: item.item_name,
    action_type: 'PASANG_DARI_INVENTORY',
    related_pc_name: null,
    actor: actor,
    notes: `Dipasang ke ${pc.name} slot ${slotLabel || slotKey}`
  };
  state.pcComponentMovements.unshift(compMov);

  if (isLiveSupabase && supabaseClient) {
    supabaseClient.from('pcs').update({ [slotKey]: item.id }).eq('id', pc.id).then(() => {});
    supabaseClient.from('department_movements').insert(mov).then(() => {});
    supabaseClient.from('pc_component_movements').insert(compMov).then(() => {});
  }

  logActivity(pc.name, 'PC ITEMS', `Pasang ${item.item_name} ke ${pc.name}`, 'WORKSTATION');
  persistState();
  closeModal('modal-install-component');
  openModalPCDetail(pc.id);
  showToast(`Komponen "${item.item_name}" berhasil dipasang ke ${pc.name}!`, 'success');
}

// Department Workstation Integration
function renderDepartmentWorkstations(deptName) {
  const deptTitleEl = document.getElementById('dept-workstation-dept-name');
  const grid = document.getElementById('dept-pc-cards-grid');
  const empty = document.getElementById('dept-pc-empty-state');

  if (deptTitleEl) deptTitleEl.textContent = deptName;
  if (!grid) return;

  state.pcs = state.pcs || [];
  const deptPCs = state.pcs.filter(p => p.department === deptName);

  if (deptPCs.length === 0) {
    grid.innerHTML = '';
    empty?.classList.remove('hidden');
    return;
  }

  empty?.classList.add('hidden');

  grid.innerHTML = deptPCs.map(pc => {
    const psuItem = state.masterItems.find(i => i.id === pc.psu_item_id);
    const storageItem = state.masterItems.find(i => i.id === pc.storage_item_id);
    const ram1Item = state.masterItems.find(i => i.id === pc.ram1_item_id);
    const ram2Item = state.masterItems.find(i => i.id === pc.ram2_item_id);
    const ram3Item = state.masterItems.find(i => i.id === pc.ram3_item_id);
    const vgaItem = state.masterItems.find(i => i.id === pc.vga_item_id);

    return `
      <div
        onclick="openModalPCDetail('${pc.id}')"
        class="glass-panel p-4 rounded-xl border border-slate-800 hover:border-indigo-500/50 hover:shadow-lg transition flex flex-col justify-between group cursor-pointer"
      >
        <div>
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-sm">
                <i class="fa-solid fa-desktop"></i>
              </div>
              <div>
                <h4 class="text-sm font-black text-white truncate">${escapeHtml(pc.name)}</h4>
                <div class="text-[10px] text-indigo-300 font-mono">${escapeHtml(pc.chipset || '-')}</div>
              </div>
            </div>
            <span class="badge-pill px-2 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 whitespace-nowrap">
              ${escapeHtml(deptName)}
            </span>
          </div>

          <div class="mt-3 grid grid-cols-2 gap-1 text-[10px]">
            ${renderSlotMiniChip('PSU', psuItem, 'fa-bolt')}
            ${renderSlotMiniChip('Storage', storageItem, 'fa-hard-drive')}
            ${renderSlotMiniChip('RAM 1', ram1Item, 'fa-memory')}
            ${renderSlotMiniChip('RAM 2', ram2Item, 'fa-memory')}
            ${renderSlotMiniChip('RAM 3', ram3Item, 'fa-memory')}
            ${renderSlotMiniChip('VGA', vgaItem, 'fa-tv')}
          </div>
        </div>

        <div class="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between gap-1.5" onclick="event.stopPropagation()">
          <div class="flex items-center gap-1.5">
            <button
              type="button"
              onclick="openModalPCDetail('${pc.id}')"
              class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold transition flex items-center gap-1"
            >
              <i class="fa-solid fa-sliders text-[10px] text-indigo-400"></i>
              <span>Detail PC</span>
            </button>
            <button
              type="button"
              onclick="handleRemovePCFromDept('${pc.id}')"
              class="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-semibold transition whitespace-nowrap"
            >
              Lepas
            </button>
          </div>
          <button
            type="button"
            onclick="confirmDeletePC('${pc.id}')"
            class="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[11px] transition shrink-0"
            title="Delete PC (Kembalikan Komponen ke Inventory)"
          >
            <i class="fa-solid fa-trash-can text-xs"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function openModalDeptAddPC() {
  const targetLabel = document.getElementById('dept-add-pc-target-dept');
  const select = document.getElementById('select-dept-add-pc');

  if (targetLabel) targetLabel.textContent = activeDept;

  state.pcs = state.pcs || [];
  const readyPCs = state.pcs.filter(p => !p.department);

  if (select) {
    if (readyPCs.length === 0) {
      select.innerHTML = `<option value="" disabled selected>-- Tidak ada PC yang berstatus Ready in IT Storage --</option>`;
    } else {
      select.innerHTML = readyPCs.map(p => {
        return `<option value="${p.id}">${escapeHtml(p.name)} &bull; ${escapeHtml(p.chipset || 'Workstation')}</option>`;
      }).join('');
    }
  }

  openModal('modal-dept-add-pc');
}

function executeDeptAddPC() {
  const select = document.getElementById('select-dept-add-pc');
  const pcId = select?.value;

  if (!pcId) {
    showToast('Pilih PC yang siap dipasang terlebih dahulu.', 'error');
    return;
  }

  handleAssignPCToDept(pcId, activeDept);
  closeModal('modal-dept-add-pc');
}

// ==============================================================================
// 20. PC MOVEMENT ANALYTICS & AUDIT TRAIL ENGINE
// ==============================================================================

function switchPCMovementTab(tab) {
  pcMovementTab = tab;
  const btnPC = document.getElementById('btn-tab-pc-mov');
  const btnComp = document.getElementById('btn-tab-comp-mov');
  const tablePC = document.getElementById('container-table-pc-mov');
  const tableComp = document.getElementById('container-table-comp-mov');

  if (tab === 'pc') {
    btnPC?.classList.replace('bg-slate-800', 'bg-brand-600');
    btnPC?.classList.replace('text-slate-300', 'text-white');
    btnComp?.classList.replace('bg-brand-600', 'bg-slate-800');
    btnComp?.classList.replace('text-white', 'text-slate-300');

    tablePC?.classList.remove('hidden');
    tableComp?.classList.add('hidden');
  } else {
    btnComp?.classList.replace('bg-slate-800', 'bg-brand-600');
    btnComp?.classList.replace('text-slate-300', 'text-white');
    btnPC?.classList.replace('bg-brand-600', 'bg-slate-800');
    btnPC?.classList.replace('text-white', 'text-slate-300');

    tableComp?.classList.remove('hidden');
    tablePC?.classList.add('hidden');
  }

  renderPCMovements();
}

function formatPCActionTypeBadge(type) {
  switch (type) {
    case 'RAKIT_PC_BARU':
      return `<span class="badge-pill px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 whitespace-nowrap"><i class="fa-solid fa-screwdriver-wrench text-[9px] mr-1"></i>RAKIT PC BARU</span>`;
    case 'PASANG_KE_DEPARTEMEN':
      return `<span class="badge-pill px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 whitespace-nowrap"><i class="fa-solid fa-building text-[9px] mr-1"></i>PASANG KE DEPT</span>`;
    case 'LEPAS_DARI_DEPARTEMEN':
      return `<span class="badge-pill px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30 whitespace-nowrap"><i class="fa-solid fa-arrow-right-from-bracket text-[9px] mr-1"></i>LEPAS DARI DEPT</span>`;
    case 'PINDAH_DEPARTEMEN':
      return `<span class="badge-pill px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30 whitespace-nowrap"><i class="fa-solid fa-shuffle text-[9px] mr-1"></i>PINDAH DEPT</span>`;
    case 'RENAME_PC':
      return `<span class="badge-pill px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 whitespace-nowrap"><i class="fa-solid fa-pen text-[9px] mr-1"></i>RENAME PC</span>`;
    case 'HAPUS_PC':
      return `<span class="badge-pill px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-600/20 text-rose-300 border border-rose-500/40 whitespace-nowrap"><i class="fa-solid fa-trash-can text-[9px] mr-1"></i>HAPUS PC</span>`;
    default:
      return `<span class="badge-pill px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 whitespace-nowrap">${escapeHtml(type)}</span>`;
  }
}

function formatCompActionTypeBadge(type) {
  switch (type) {
    case 'PASANG_DARI_INVENTORY':
      return `<span class="badge-pill px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 whitespace-nowrap"><i class="fa-solid fa-plus text-[9px] mr-1"></i>PASANG DARI INVENTORY</span>`;
    case 'SWAP_DENGAN_PC_LAIN':
      return `<span class="badge-pill px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 whitespace-nowrap"><i class="fa-solid fa-shuffle text-[9px] mr-1"></i>SWAP PC LAIN</span>`;
    case 'RETURN_TO_INVENTORY':
      return `<span class="badge-pill px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 whitespace-nowrap"><i class="fa-solid fa-arrow-rotate-left text-[9px] mr-1"></i>RETURN TO INVENTORY</span>`;
    default:
      return `<span class="badge-pill px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 whitespace-nowrap">${escapeHtml(type)}</span>`;
  }
}

function renderPCMovements() {
  const search = (document.getElementById('pc-mov-search')?.value || '').toLowerCase().trim();
  const pcTbody = document.getElementById('pc-movements-tbody');
  const compTbody = document.getElementById('pc-comp-movements-tbody');
  const pcEmpty = document.getElementById('pc-mov-empty-state');
  const compEmpty = document.getElementById('pc-comp-mov-empty-state');

  state.pcMovements = state.pcMovements || [];
  state.pcComponentMovements = state.pcComponentMovements || [];

  // Render Table 1: Data Movement PC
  if (pcTbody) {
    const filteredPC = state.pcMovements.filter(m => {
      const matchSearch =
        m.pc_name.toLowerCase().includes(search) ||
        (m.action_type || '').toLowerCase().includes(search) ||
        (m.from_location || '').toLowerCase().includes(search) ||
        (m.to_location || '').toLowerCase().includes(search) ||
        (m.actor || '').toLowerCase().includes(search) ||
        (m.notes || '').toLowerCase().includes(search);
      return matchSearch;
    });

    if (filteredPC.length === 0) {
      pcTbody.innerHTML = '';
      pcEmpty?.classList.remove('hidden');
    } else {
      pcEmpty?.classList.add('hidden');
      pcTbody.innerHTML = filteredPC.map(m => {
        return `
          <tr class="hover:bg-slate-900/50 transition">
            <td class="py-3 px-4 font-mono text-[11px] text-slate-300 whitespace-nowrap">
              <i class="fa-regular fa-clock text-indigo-400 mr-1.5"></i>${escapeHtml(m.timestamp)}
            </td>
            <td class="py-3 px-4 font-bold text-white min-w-[150px] whitespace-nowrap">
              ${escapeHtml(m.pc_name)}
            </td>
            <td class="py-3 px-4 whitespace-nowrap">
              ${formatPCActionTypeBadge(m.action_type)}
            </td>
            <td class="py-3 px-4 text-slate-400 whitespace-nowrap">${escapeHtml(m.from_location)}</td>
            <td class="py-3 px-4 text-slate-200 font-semibold whitespace-nowrap">${escapeHtml(m.to_location)}</td>
            <td class="py-3 px-4 text-slate-300 text-[11px] whitespace-nowrap font-mono">${escapeHtml(m.actor)}</td>
            <td class="py-3 px-4 text-slate-400 text-[11px] min-w-[180px]">${escapeHtml(m.notes || '-')}</td>
          </tr>
        `;
      }).join('');
    }
  }

  // Render Table 2: Data Movement Component
  if (compTbody) {
    const filteredComp = state.pcComponentMovements.filter(m => {
      const matchSearch =
        m.pc_name.toLowerCase().includes(search) ||
        (m.slot_name || '').toLowerCase().includes(search) ||
        (m.item_name || '').toLowerCase().includes(search) ||
        (m.action_type || '').toLowerCase().includes(search) ||
        (m.actor || '').toLowerCase().includes(search) ||
        (m.notes || '').toLowerCase().includes(search);
      return matchSearch;
    });

    if (filteredComp.length === 0) {
      compTbody.innerHTML = '';
      compEmpty?.classList.remove('hidden');
    } else {
      compEmpty?.classList.add('hidden');
      compTbody.innerHTML = filteredComp.map(m => {
        return `
          <tr class="hover:bg-slate-900/50 transition">
            <td class="py-3 px-4 font-mono text-[11px] text-slate-300 whitespace-nowrap">
              <i class="fa-regular fa-clock text-pink-400 mr-1.5"></i>${escapeHtml(m.timestamp)}
            </td>
            <td class="py-3 px-4 font-bold text-white whitespace-nowrap min-w-[140px]">${escapeHtml(m.pc_name)}</td>
            <td class="py-3 px-4 whitespace-nowrap font-medium text-slate-300">${escapeHtml(m.slot_name)}</td>
            <td class="py-3 px-4 font-semibold text-indigo-300 min-w-[180px]">${escapeHtml(m.item_name)}</td>
            <td class="py-3 px-4 whitespace-nowrap">${formatCompActionTypeBadge(m.action_type)}</td>
            <td class="py-3 px-4 text-slate-400 whitespace-nowrap">${escapeHtml(m.related_pc_name || '-')}</td>
            <td class="py-3 px-4 text-slate-300 text-[11px] whitespace-nowrap font-mono">${escapeHtml(m.actor)}</td>
            <td class="py-3 px-4 text-slate-400 text-[11px] min-w-[180px]">${escapeHtml(m.notes || '-')}</td>
          </tr>
        `;
      }).join('');
    }
  }
}

function exportPCMovementsExcel() {
  const XLSX = getSheetJS();
  if (!XLSX) return;

  const wb = XLSX.utils.book_new();

  // Sheet 1: Data Movement PC
  const pcMovData = [
    ['RATTAN-INN HOTEL IT - DATA MOVEMENT PC AUDIT TRAIL'],
    [`Generated (Device Real-Time Clock): ${getClientDeviceTimestamp()}`],
    [],
    ['No', 'Waktu (Device Clock)', 'Nama PC', 'Tipe Aksi', 'Dari Lokasi', 'Ke Lokasi', 'Pelaksana (User)', 'Catatan / Remarks']
  ];

  (state.pcMovements || []).forEach((m, idx) => {
    pcMovData.push([
      idx + 1,
      m.timestamp,
      m.pc_name,
      m.action_type,
      m.from_location,
      m.to_location,
      m.actor,
      m.notes || '-'
    ]);
  });

  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(pcMovData), 'Data Movement PC');

  // Sheet 2: Data Movement Component
  const compMovData = [
    ['RATTAN-INN HOTEL IT - DATA MOVEMENT COMPONENT AUDIT TRAIL'],
    [`Generated (Device Real-Time Clock): ${getClientDeviceTimestamp()}`],
    [],
    ['No', 'Waktu (Device Clock)', 'Nama PC', 'Slot Komponen', 'Nama Komponen (Hardware)', 'Tipe Aksi', 'Terkait PC (Swap)', 'Pelaksana (User)', 'Catatan / Remarks']
  ];

  (state.pcComponentMovements || []).forEach((m, idx) => {
    compMovData.push([
      idx + 1,
      m.timestamp,
      m.pc_name,
      m.slot_name,
      m.item_name,
      m.action_type,
      m.related_pc_name || '-',
      m.actor,
      m.notes || '-'
    ]);
  });

  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(compMovData), 'Data Movement Component');

  // Sheet 3: PC Workstations Inventory List
  const pcSummaryData = [
    ['RATTAN-INN HOTEL IT - WORKSTATIONS PC INVENTORY LIST'],
    [`Generated (Device Real-Time Clock): ${getClientDeviceTimestamp()}`],
    [],
    ['No', 'Nama PC', 'Chipset', 'Departemen / Status', 'Power Supply', 'Storage', 'RAM Slot 1', 'RAM Slot 2', 'RAM Slot 3', 'VGA Card']
  ];

  (state.pcs || []).forEach((pc, idx) => {
    const psu = state.masterItems.find(i => i.id === pc.psu_item_id)?.item_name || '-';
    const storage = state.masterItems.find(i => i.id === pc.storage_item_id)?.item_name || '-';
    const ram1 = state.masterItems.find(i => i.id === pc.ram1_item_id)?.item_name || '-';
    const ram2 = state.masterItems.find(i => i.id === pc.ram2_item_id)?.item_name || '-';
    const ram3 = state.masterItems.find(i => i.id === pc.ram3_item_id)?.item_name || '-';
    const vga = state.masterItems.find(i => i.id === pc.vga_item_id)?.item_name || '-';

    pcSummaryData.push([
      idx + 1,
      pc.name,
      pc.chipset,
      pc.department ? `Terpasang di ${pc.department}` : 'Ready in IT Storage',
      psu,
      storage,
      ram1,
      ram2,
      ram3,
      vga
    ]);
  });

  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(pcSummaryData), 'PC Inventory List');

  const now = new Date();
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  XLSX.writeFile(wb, `Rattan_Inn_PC_Movement_Analytics_${dateStr}.xlsx`);
  showToast('Excel PC Movement Analytics berhasil didownload!', 'success');
}
window.navigateTo = navigateTo;
window.selectDepartmentAndNavigate = selectDepartmentAndNavigate;
window.switchActiveDepartment = switchActiveDepartment;
window.setInvCategoryFilter = setInvCategoryFilter;
window.setDeptCatFilter = setDeptCatFilter;
window.setPrelovedCatFilter = setPrelovedCatFilter;
window.setPOStatusFilter = setPOStatusFilter;
window.setMonthlyTab = setMonthlyTab;
window.handleMonthlyChange = handleMonthlyChange;
window.renderInventoryTable = renderInventoryTable;
window.renderDepartmentalView = renderDepartmentalView;
window.state = state;
window.renderMotionTable = renderMotionTable;
window.renderPOTable = renderPOTable;
window.renderPrelovedTable = renderPrelovedTable;
window.renderMonthlyView = renderMonthlyView;
window.renderPCManagement = renderPCManagement;
window.renderPCMovements = renderPCMovements;
window.setPCFilter = setPCFilter;
window.switchPCMovementTab = switchPCMovementTab;
window.openModalAddPC = openModalAddPC;
window.handleCreatePCSubmit = handleCreatePCSubmit;
window.openModalPCDetail = openModalPCDetail;
window.toggleEditPCName = toggleEditPCName;
window.saveEditedPCName = saveEditedPCName;
window.handleAssignPCToDept = handleAssignPCToDept;
window.handleAssignPCToDeptFromDetail = handleAssignPCToDeptFromDetail;
window.handleRemovePCFromDept = handleRemovePCFromDept;
window.openAssignDeptPrompt = openAssignDeptPrompt;
window.openComponentActionModal = openComponentActionModal;
window.executeSwapComponent = executeSwapComponent;
window.executeReturnComponentToInventory = executeReturnComponentToInventory;
window.openModalInstallComponent = openModalInstallComponent;
window.executeInstallComponent = executeInstallComponent;
window.renderDepartmentWorkstations = renderDepartmentWorkstations;
window.openModalDeptAddPC = openModalDeptAddPC;
window.executeDeptAddPC = executeDeptAddPC;
window.exportPCMovementsExcel = exportPCMovementsExcel;
window.handleDirectDemoBypassWithEmail = handleDirectDemoBypassWithEmail;
window.handleDirectDemoBypass = handleDirectDemoBypass;
window.confirmDeletePC = confirmDeletePC;
window.openDeletePCModalFromDetail = openDeletePCModalFromDetail;
window.executeDeletePC = executeDeletePC;

window.openModal = openModal;
window.closeModal = closeModal;
window.openModalInbound = openModalInbound;
window.openItemInboundHistoryModal = openItemInboundHistoryModal;
window.openInboundForCurrentItem = openInboundForCurrentItem;
window.populatePOMasterItemDropdown = populatePOMasterItemDropdown;
window.filterPOMasterItemDropdown = filterPOMasterItemDropdown;
window.handlePOMasterItemSelect = handlePOMasterItemSelect;
window.openModalTransfer = openModalTransfer;
window.openModalReturn = openModalReturn;
window.openModalPO = openModalPO;
window.openModalPreloved = openModalPreloved;
window.openModalReduceStock = openModalReduceStock;
window.setReduceReason = setReduceReason;
window.proceedToReduceConfirmStep = proceedToReduceConfirmStep;
window.backToReduceStep1 = backToReduceStep1;
window.toggleReduceConfirmButton = toggleReduceConfirmButton;
window.executeReduceStock = executeReduceStock;
window.openReduceForCurrentItem = openReduceForCurrentItem;

window.openLightbox = openLightbox;

window.updateTransferAvailableStock = updateTransferAvailableStock;
window.updateReturnItemOptions = updateReturnItemOptions;
window.updateReturnAvailableStock = updateReturnAvailableStock;

window.markPOArrived = markPOArrived;
window.confirmDeleteMasterItem = confirmDeleteMasterItem;
window.confirmDeletePO = confirmDeletePO;
window.confirmDeletePreloved = confirmDeletePreloved;

window.handleImageUploadPreview = handleImageUploadPreview;
window.handleImageUrlPreview = handleImageUrlPreview;
window.clearImagePreview = clearImagePreview;

window.exportInventoryExcel = exportInventoryExcel;
window.exportDepartmentalExcel = exportDepartmentalExcel;
window.exportMotionExcel = exportMotionExcel;
window.exportPurchaseOrdersExcel = exportPurchaseOrdersExcel;
window.exportPrelovedExcel = exportPrelovedExcel;
window.exportSelectedMonthlyExcel = exportSelectedMonthlyExcel;
window.exportFullBackupExcel = exportFullBackupExcel;

window.saveSettingsCredentials = saveSettingsCredentials;
window.saveLoginConfigDrawer = saveLoginConfigDrawer;
window.testSupabaseConnection = testSupabaseConnection;
window.resetToDefaultCredentials = resetToDefaultCredentials;
window.copySchemaSQL = copySchemaSQL;

window.toggleMobileSidebar = toggleMobileSidebar;
window.updateHeroGreeting = updateHeroGreeting;
window.getGreetingPrefix = getGreetingPrefix;
window.startRealTimeDeviceClock = startRealTimeDeviceClock;
// ==============================================================================
// 21. RATTABOT AI COPILOT & AUTONOMOUS CRUD ENGINE (GEMINI REST)
// ==============================================================================
const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';

// Strictly in-memory chat session: never stored in LocalStorage or remote database!
let rattabotChatHistory = [];
let rattabotTimerInterval = null;
let rattabotSecondsRemaining = 300; // 5 minutes inactivity countdown
let rattabotPendingAction = null;
let isRattaBotBusy = false;

function getGeminiApiKey() {
  return (localStorage.getItem(STORAGE_KEYS.GEMINI_API_KEY) || '').trim();
}

function getGeminiModel() {
  return localStorage.getItem(STORAGE_KEYS.GEMINI_MODEL) || DEFAULT_GEMINI_MODEL;
}

function initGeminiSettings() {
  const keyInput = document.getElementById('settings-gemini-key');
  const modelSelect = document.getElementById('settings-gemini-model');
  const statusBadge = document.getElementById('gemini-status-badge');
  const statusText = document.getElementById('gemini-status-text');

  const savedKey = getGeminiApiKey();
  const savedModel = getGeminiModel();

  if (keyInput) keyInput.value = savedKey;
  if (modelSelect) modelSelect.value = savedModel;

  if (savedKey) {
    if (statusBadge) {
      statusBadge.className = 'px-3 py-1 rounded-full text-xs font-semibold bg-pink-500/10 text-pink-300 border border-pink-500/30 flex items-center gap-1.5';
    }
    if (statusText) statusText.textContent = '🌸 RattaBot Active';
  } else {
    if (statusBadge) {
      statusBadge.className = 'px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1.5';
    }
    if (statusText) statusText.textContent = 'API Key Belum Diisi';
  }
}

function saveGeminiSettings() {
  const keyInput = document.getElementById('settings-gemini-key');
  const modelSelect = document.getElementById('settings-gemini-model');
  const key = (keyInput?.value || '').trim();
  const model = modelSelect?.value || DEFAULT_GEMINI_MODEL;

  if (!key) {
    showToast('Silahkan masukkan Google Gemini API Key Anda!', 'error');
    return;
  }

  localStorage.setItem(STORAGE_KEYS.GEMINI_API_KEY, key);
  localStorage.setItem(STORAGE_KEYS.GEMINI_MODEL, model);
  initGeminiSettings();
  showToast('Pengaturan RattaBot AI berhasil disimpan! RattaBot kini aktif.', 'success');
}

function clearGeminiSettings() {
  localStorage.removeItem(STORAGE_KEYS.GEMINI_API_KEY);
  localStorage.removeItem(STORAGE_KEYS.GEMINI_MODEL);
  initGeminiSettings();
  showToast('API Key telah dihapus.', 'info');
}

function toggleGeminiKeyVisibility() {
  const input = document.getElementById('settings-gemini-key');
  const btn = document.getElementById('btn-toggle-gemini-key');
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    if (btn) btn.innerHTML = '<i class="fa-solid fa-eye-slash"></i>';
  } else {
    input.type = 'password';
    if (btn) btn.innerHTML = '<i class="fa-solid fa-eye"></i>';
  }
}

async function testGeminiConnection() {
  const keyInput = document.getElementById('settings-gemini-key');
  const modelSelect = document.getElementById('settings-gemini-model');
  const key = (keyInput?.value || getGeminiApiKey()).trim();
  const model = modelSelect?.value || getGeminiModel();

  if (!key) {
    showToast('Masukkan API Key terlebih dahulu untuk melakukan test koneksi!', 'error');
    return;
  }

  const btn = document.getElementById('btn-test-gemini');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin text-amber-400"></i> Testing...';
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: 'Halo! Jawab singkat dalam maksimal 5 kata bahwa sistem RattaBot aktif dan siap.' }]
        }]
      })
    });

    const data = await response.json();
    if (!response.ok) {
      const errMsg = data.error?.message || `HTTP ${response.status}`;
      showToast(`Koneksi Gagal: ${errMsg}`, 'error');
    } else {
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Aktif dan siap digunakan.';
      showToast(`Koneksi Sukses! RattaBot (${model}): "${reply.trim()}"`, 'success');
      localStorage.setItem(STORAGE_KEYS.GEMINI_API_KEY, key);
      localStorage.setItem(STORAGE_KEYS.GEMINI_MODEL, model);
      initGeminiSettings();
    }
  } catch (err) {
    showToast(`Error test koneksi: ${err.message}`, 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-bolt text-amber-400"></i><span>Test API Connection</span>';
    }
  }
}

// -----------------------------------------------------------------------------
// RATTABOT SESSION & PRIVACY ENGINE
// -----------------------------------------------------------------------------
function onEnterRattaBotView() {
  const apiKey = getGeminiApiKey();
  const alertEl = document.getElementById('rattabot-no-key-alert');
  const chatContainerEl = document.getElementById('rattabot-chat-container');
  const modelTag = document.getElementById('rattabot-model-tag');

  if (modelTag) modelTag.textContent = getGeminiModel();

  if (!apiKey) {
    if (alertEl) alertEl.classList.remove('hidden');
    if (chatContainerEl) chatContainerEl.classList.add('hidden');
    stopRattaBotInactivityTimer();
    return;
  }

  if (alertEl) alertEl.classList.add('hidden');
  if (chatContainerEl) chatContainerEl.classList.remove('hidden');

  // Start 5-minute inactivity countdown
  startRattaBotInactivityTimer();

  // If chat is fresh, seed with greeting
  if (rattabotChatHistory.length === 0) {
    const userName = getGreetingPrefix(currentUser?.email) || 'Admin';
    rattabotChatHistory.push({
      role: 'assistant',
      text: `Halo ${userName}! Saya RattaBot 🌸😊, asisten pintar Hotel IT Operational Hub. Aktivitas apa yang ingin anda lakukan hari ini? Anda bisa leluasa bertanya tentang fitur, stok, departemen, atau memberi saya perintah untuk menambah master item, mencatat barang masuk/keluar, transfer departemen, buat PO, catat hardware rusak, hingga rakit & kelola Workstation PC!`,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    });
  }

  renderRattaBotMessages();
  setTimeout(() => {
    document.getElementById('rattabot-input-text')?.focus();
  }, 100);
}

function onExitRattaBotView() {
  clearRattaBotSession(false);
}

function startRattaBotInactivityTimer() {
  stopRattaBotInactivityTimer();
  rattabotSecondsRemaining = 300; // 5 minutes
  updateRattaBotTimerDisplay();

  rattabotTimerInterval = setInterval(() => {
    rattabotSecondsRemaining -= 1;
    updateRattaBotTimerDisplay();

    if (rattabotSecondsRemaining <= 0) {
      stopRattaBotInactivityTimer();
      clearRattaBotSession(true);
    }
  }, 1000);
}

function stopRattaBotInactivityTimer() {
  if (rattabotTimerInterval) {
    clearInterval(rattabotTimerInterval);
    rattabotTimerInterval = null;
  }
}

function resetRattaBotInactivityTimer() {
  rattabotSecondsRemaining = 300;
  updateRattaBotTimerDisplay();
}

function updateRattaBotTimerDisplay() {
  const display = document.getElementById('rattabot-timer-display');
  if (!display) return;
  const mins = Math.floor(Math.max(0, rattabotSecondsRemaining) / 60);
  const secs = Math.max(0, rattabotSecondsRemaining) % 60;
  display.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function clearRattaBotSession(isTimedOut = false) {
  rattabotChatHistory = [];
  rattabotPendingAction = null;
  hideRattaBotConfirmationCard();
  hideRattaBotProcessingBanner();

  const timeoutBanner = document.getElementById('rattabot-timeout-banner');
  if (timeoutBanner) {
    if (isTimedOut) {
      timeoutBanner.classList.remove('hidden');
    } else {
      timeoutBanner.classList.add('hidden');
    }
  }

  // If user is currently looking at rattabot view, re-seed welcome greeting
  if (activeView === 'rattabot' && getGeminiApiKey()) {
    const userName = getGreetingPrefix(currentUser?.email) || 'Admin';
    rattabotChatHistory.push({
      role: 'assistant',
      text: `Halo ${userName}! Saya RattaBot 🌸😊, asisten pintar Hotel IT Operational Hub. Aktivitas apa yang ingin anda lakukan hari ini? Anda bisa leluasa bertanya tentang sistem atau memberi saya perintah untuk menambah, memindahkan, atau mengedit data!`,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    });
    renderRattaBotMessages();
    startRattaBotInactivityTimer();
  } else {
    stopRattaBotInactivityTimer();
  }
}

function resetRattaBotChat(userInitiated = false) {
  clearRattaBotSession(false);
  if (userInitiated) {
    showToast('Sesi chat RattaBot berhasil dibersihkan.', 'info');
  }
}

// -----------------------------------------------------------------------------
// RATTABOT UI RENDERING & MARKDOWN PARSER
// -----------------------------------------------------------------------------
function renderRattaBotMessages() {
  const list = document.getElementById('rattabot-messages-list');
  if (!list) return;

  if (rattabotChatHistory.length === 0) {
    list.innerHTML = `
      <div class="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500">
        <div class="w-16 h-16 rounded-3xl bg-pink-500/10 text-pink-400 flex items-center justify-center text-3xl mb-3">🌸</div>
        <h4 class="text-base font-bold text-white">Sesi Chat Baru</h4>
        <p class="text-xs text-slate-400 mt-1 max-w-sm">Ketik pertanyaan atau beri perintah kepada RattaBot untuk memulai.</p>
      </div>
    `;
    return;
  }

  list.innerHTML = rattabotChatHistory.map((msg, idx) => {
    const isUser = msg.role === 'user';

    if (isUser) {
      return `
        <div class="flex items-start justify-end gap-3 max-w-2xl ml-auto">
          <div class="space-y-1 text-right">
            <div class="flex items-center justify-end gap-2 text-[10px] text-slate-400">
              <span class="font-medium">${escapeHtml(currentUser?.email || 'User')}</span>
              <span>•</span>
              <span>${msg.timestamp || ''}</span>
            </div>
            <div class="p-3.5 rounded-2xl rounded-tr-none bg-gradient-to-r from-brand-600 to-indigo-600 text-white text-xs leading-relaxed shadow-md shadow-brand-900/30 text-left">
              ${escapeHtml(msg.text).replace(/\n/g, '<br>')}
            </div>
          </div>
          <div class="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xs text-slate-300 font-bold shrink-0 mt-4 shadow-sm">
            <i class="fa-solid fa-user text-[11px] text-brand-300"></i>
          </div>
        </div>
      `;
    } else {
      return `
        <div class="flex items-start gap-3 max-w-2xl mr-auto">
          <!-- Smiling Pink Flower Avatar -->
          <div class="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-300 p-0.5 shadow-md shadow-pink-500/20 shrink-0 mt-4">
            <div class="w-full h-full rounded-[10px] bg-slate-900 flex items-center justify-center overflow-hidden">
              <svg viewBox="0 0 100 100" class="w-7 h-7">
                <circle cx="50" cy="24" r="18" fill="#f43f5e"/>
                <circle cx="75" cy="42" r="18" fill="#ec4899"/>
                <circle cx="65" cy="72" r="18" fill="#f43f5e"/>
                <circle cx="35" cy="72" r="18" fill="#ec4899"/>
                <circle cx="25" cy="42" r="18" fill="#f43f5e"/>
                <circle cx="50" cy="50" r="22" fill="#fbbf24"/>
                <circle cx="42" cy="46" r="3" fill="#1e293b"/>
                <circle cx="58" cy="46" r="3" fill="#1e293b"/>
                <circle cx="37" cy="53" r="3" fill="#f43f5e" opacity="0.6"/>
                <circle cx="63" cy="53" r="3" fill="#f43f5e" opacity="0.6"/>
                <path d="M 44 54 Q 50 60 56 54" stroke="#1e293b" stroke-width="2.5" stroke-linecap="round" fill="none"/>
              </svg>
            </div>
          </div>
          <div class="space-y-1">
            <div class="flex items-center gap-2 text-[10px] text-slate-400">
              <span class="font-bold text-pink-400 flex items-center gap-1">
                <span>RattaBot</span>
                <span>🌸</span>
              </span>
              <span>•</span>
              <span>${msg.timestamp || ''}</span>
            </div>
            <div class="p-4 rounded-2xl rounded-tl-none bg-slate-900 border border-slate-800 text-slate-200 text-xs leading-relaxed shadow-lg rattabot-formatted-text">
              ${formatRattaBotMarkdown(msg.text)}
            </div>
          </div>
        </div>
      `;
    }
  }).join('');

  list.scrollTop = list.scrollHeight;
}

function formatRattaBotMarkdown(rawText) {
  if (!rawText) return '';

  let html = rawText;

  // Escape HTML characters safely
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Bold **text**
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>');

  // Inline code `code`
  html = html.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-slate-950 font-mono text-[11px] text-pink-300 border border-slate-800">$1</code>');

  // Bullet items
  html = html.replace(/^\s*[-*]\s+(.*)$/gm, '<li class="ml-4 list-disc text-slate-300">$1</li>');

  // Numbered list items
  html = html.replace(/^\s*(\d+)\.\s+(.*)$/gm, '<li class="ml-4 list-decimal text-slate-300"><span class="font-semibold text-slate-200">$2</span></li>');

  // Convert newlines
  html = html.replace(/\n\n/g, '<div class="my-2"></div>');
  html = html.replace(/\n/g, '<br>');

  return html;
}

function applyRattaBotSuggestion(text) {
  const input = document.getElementById('rattabot-input-text');
  if (input) {
    input.value = text;
    input.focus();
  }
}

function clearRattaBotInput() {
  const input = document.getElementById('rattabot-input-text');
  const clearBtn = document.getElementById('rattabot-clear-input-btn');
  if (input) input.value = '';
  if (clearBtn) clearBtn.classList.add('hidden');
}

// -----------------------------------------------------------------------------
// RATTABOT AI SYSTEM CONTEXT & INTERACTION ENGINE
// -----------------------------------------------------------------------------
function buildRattaBotSystemContext() {
  const userEmail = currentUser ? currentUser.email : 'admin@rattan-inn.com';
  const userName = getGreetingPrefix(userEmail) || 'Admin';

  const itemsSummary = (state.masterItems || []).map(item => {
    const metrics = calculateStockMetrics(item.id);
    return {
      id: item.id,
      name: item.name,
      category: item.category,
      availableStock: metrics.availableStock,
      totalHeldByDepts: metrics.totalHeldByDepts,
      minimumStock: item.minimum_stock || 0
    };
  });

  const pcsSummary = (state.pcs || []).map(pc => ({
    id: pc.id,
    name: pc.name,
    department: pc.department || null,
    status: pc.department ? `Terpasang di ${pc.department}` : 'Tersimpan di IT Storage',
    chipset: pc.chipset,
    components: pc.components || {}
  }));

  const posSummary = (state.purchaseOrders || []).slice(0, 8).map(po => ({
    id: po.id,
    poNumber: po.po_number,
    itemName: po.item_name,
    quantity: po.quantity,
    vendor: po.vendor,
    status: po.status
  }));

  const damagedSummary = (state.preloved || []).slice(0, 8).map(d => ({
    id: d.id,
    itemName: d.item_name,
    department: d.department,
    condition: d.condition,
    remarks: d.remarks
  }));

  return `Kamu adalah "RattaBot", asisten AI pintar dan cerdas dari Rattan-Inn Hotel IT Inventory (berlogo profil bunga pink tersenyum 🌸😊).
User yang sedang aktif saat ini adalah: "${userEmail}" (panggilan: "${userName}").

KEMAMPUAN UTAMA:
Kamu memahami SELURUH fitur, formula, alur kerja, dan database aplikasi ini tanpa terkecuali, dan memiliki kemampuan untuk menjelaskan (Q&A) maupun MENGEKSEKUSI PERINTAH (CRUD, mutasi stok, transfer, PO, damaged hardware, dan rakit/kelola PC) atas nama user.

9 DEPARTEMEN HOTEL RESMI:
1. Front Office
2. House Keeping
3. Engineering
4. Human Resource
5. F&B Product
6. F&B Service
7. Wellness
8. Sales & Marketing
9. Accounting

4 KATEGORI HARDWARE RESMI:
1. PC ITEMS
2. NETWORK ITEMS
3. CCTV & TV ITEMS
4. LOCK SYSTEM

FORMULA INVARIANT STOK:
Stok Tersedia di IT Storage = (Stok Awal + Total Inbound) - Total Pengurangan - Total Ditransfer ke Dept + Total Dikembalikan dari Dept - Komponen Terpakai di PC Rakitan + Komponen Dikembalikan dari PC.
Stok di Departemen = Total Diterima Dept - Total Dikembalikan Dept.

SNAPSHOT DATA REAL-TIME SISTEM SAAT INI:
- Master Items & Stok: ${JSON.stringify(itemsSummary)}
- Workstation PCs: ${JSON.stringify(pcsSummary)}
- Recent Purchase Orders: ${JSON.stringify(posSummary)}
- Recent Damaged Hardware: ${JSON.stringify(damagedSummary)}

ATURAN INTERAKSI (WAJIB DIIKUTI):
1. JIKA USER BERTANYA (Q&A / Penjelasan):
   Jawab dengan ramah, cerdas, akurat, dan terstruktur dalam Bahasa Indonesia. Jelaskan cara kerja fitur, formula stok, rincian hardware, atau status PC.

2. JIKA USER MEMBERI PERINTAH TAPI DETAILNYA BELUM LENGKAP:
   Tanyakan dulu detail yang belum disebutkan secara ramah dan tawarkan pilihan yang valid dari snapshot data sistem saat ini!
   Contoh: jika user bilang "Pindahkan switch ke Front Office" tanpa kuantitas, tanya: "Stok Switch Hub saat ini ada 5 unit. Berapa unit yang ingin dipindahkan ke Front Office?"
   Jika user bilang "Rakit PC baru", tanyakan nama PC dan tawarkan komponen yang tersedia dari kategori PC ITEMS.

3. JIKA PERINTAH SUDAH LENGKAP & DETAIL:
   Kamu LANGSUNG menyiapkan rencana eksekusi dan menyertakan satu blok kode JSON khusus berformat:
\`\`\`rattabot_action
{
  "action": "NAMA_AKSI",
  "description": "Deskripsi rinci apa yang akan dilakukan dalam Bahasa Indonesia (contoh: 'Transfer 2 unit Switch Hub 8-Port ke departemen Front Office')",
  "params": { ... }
}
\`\`\`
   Di dalam teks obrolan, sapa user dan jelaskan dengan detail apa yang akan dilakukan, dan tanyakan:
   "RattaBot akan melakukan [detail aksi]. Apakah anda setuju?"

DAFTAR ACTION TYPE & PARAMS:
- "create_master_item": params: { "name": string, "category": "PC ITEMS"|"NETWORK ITEMS"|"CCTV & TV ITEMS"|"LOCK SYSTEM", "availableStock": number, "minimumStock": number, "notes": string }
- "inbound_stock": params: { "itemId": string, "quantity": number, "notes": string }
- "reduce_stock": params: { "itemId": string, "quantity": number, "reason": string }
- "transfer_to_department": params: { "itemId": string, "department": string, "quantity": number, "notes": string }
- "return_to_inventory": params: { "itemId": string, "department": string, "quantity": number, "notes": string }
- "create_purchase_order": params: { "itemId": string, "quantity": number, "vendor": string, "poNumber": string (opsional), "estimatedArrival": string }
- "mark_po_arrived": params: { "poId": string }
- "record_damaged_hardware": params: { "itemName": string, "department": string, "condition": string, "remarks": string }
- "build_pc": params: { "pcName": string, "chipset": string, "psuId": string, "storageId": string, "ram1Id": string, "ram2Id": string|null, "ram3Id": string|null, "vgaId": string|null }
- "assign_pc_to_department": params: { "pcId": string, "department": string }
- "remove_pc_from_department": params: { "pcId": string }
- "swap_pc_component": params: { "sourcePcId": string, "targetPcId": string, "slotName": string }
- "return_pc_component": params: { "pcId": string, "slotName": string }
- "delete_pc": params: { "pcId": string }

Gunakan nada yang ceria, ramah, dan profesional 🌸😊.`;
}

async function handleRattaBotSubmit(e) {
  if (e) e.preventDefault();
  if (isRattaBotBusy) return;

  const input = document.getElementById('rattabot-input-text');
  const userText = (input?.value || '').trim();
  if (!userText) return;

  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    showToast('Silakan isi Gemini API Key di menu Setting terlebih dahulu.', 'error');
    navigateTo('settings');
    return;
  }

  // Clear input
  if (input) input.value = '';

  // Append user message to in-memory history
  rattabotChatHistory.push({
    role: 'user',
    text: userText,
    timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  });

  resetRattaBotInactivityTimer();
  renderRattaBotMessages();

  // Call Gemini REST API
  await callRattaBotAI();
}

async function callRattaBotAI() {
  const apiKey = getGeminiApiKey();
  const model = getGeminiModel();
  const sendBtn = document.getElementById('rattabot-send-btn');

  isRattaBotBusy = true;
  if (sendBtn) sendBtn.disabled = true;
  showRattaBotProcessingBanner();

  try {
    const systemPrompt = buildRattaBotSystemContext();

    // Map in-memory history to Gemini contents (max 10 recent turns to avoid token limit)
    const recentHistory = rattabotChatHistory.slice(-10);
    const contents = [];

    // Group turns ensuring alternating user/model
    recentHistory.forEach(item => {
      contents.push({
        role: item.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: item.text }]
      });
    });

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemPrompt }]
        },
        contents: contents,
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1200
        }
      })
    });

    const data = await response.json();
    if (!response.ok) {
      const errMsg = data.error?.message || `HTTP ${response.status}`;
      throw new Error(errMsg);
    }

    const rawReply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Maaf, saya tidak dapat memproses jawaban saat ini.';

    // Check if reply includes an action block
    const actionMatch = rawReply.match(/```rattabot_action\s*([\s\S]*?)\s*```/);

    if (actionMatch) {
      try {
        const actionObj = JSON.parse(actionMatch[1]);
        // Clean display text by removing the raw action block
        const cleanDisplayText = rawReply.replace(/```rattabot_action\s*[\s\S]*?\s*```/, '').trim();

        rattabotChatHistory.push({
          role: 'assistant',
          text: cleanDisplayText || `RattaBot siap mengeksekusi: ${actionObj.description}`,
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        });

        // Setup two-step confirmation
        rattabotPendingAction = actionObj;
        showRattaBotConfirmationCard(actionObj);
      } catch (parseErr) {
        console.warn('Failed to parse rattabot_action JSON:', parseErr);
        rattabotChatHistory.push({
          role: 'assistant',
          text: rawReply,
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        });
      }
    } else {
      rattabotChatHistory.push({
        role: 'assistant',
        text: rawReply,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      });
    }

    resetRattaBotInactivityTimer();
    renderRattaBotMessages();
  } catch (err) {
    console.error('RattaBot Error:', err);
    rattabotChatHistory.push({
      role: 'assistant',
      text: `Maaf, terjadi kesalahan saat menghubungi AI engine: ${err.message}. Silakan periksa koneksi atau API Key Anda di menu Pengaturan.`,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    });
    renderRattaBotMessages();
  } finally {
    isRattaBotBusy = false;
    if (sendBtn) sendBtn.disabled = false;
    hideRattaBotProcessingBanner();
  }
}

function showRattaBotConfirmationCard(action) {
  const card = document.getElementById('rattabot-confirmation-card');
  const textEl = document.getElementById('rattabot-confirm-text');
  const detailsEl = document.getElementById('rattabot-confirm-details');

  if (!card) return;

  if (textEl) {
    textEl.textContent = `RattaBot akan melakukan: "${action.description}". Apakah anda setuju?`;
  }

  if (detailsEl) {
    detailsEl.textContent = JSON.stringify(action.params, null, 2);
  }

  card.classList.remove('hidden');
  const list = document.getElementById('rattabot-messages-list');
  if (list) list.scrollTop = list.scrollHeight;
}

function hideRattaBotConfirmationCard() {
  const card = document.getElementById('rattabot-confirmation-card');
  if (card) card.classList.add('hidden');
}

function showRattaBotProcessingBanner() {
  const banner = document.getElementById('rattabot-processing-banner');
  if (banner) banner.classList.remove('hidden');
}

function hideRattaBotProcessingBanner() {
  const banner = document.getElementById('rattabot-processing-banner');
  if (banner) banner.classList.add('hidden');
}

function cancelRattaBotPendingAction() {
  if (!rattabotPendingAction) return;

  hideRattaBotConfirmationCard();
  const desc = rattabotPendingAction.description || 'aksi';
  rattabotPendingAction = null;

  rattabotChatHistory.push({
    role: 'assistant',
    text: `Tindakan untuk "${desc}" telah dibatalkan. Ada hal lain yang ingin Anda tanyakan atau instruksikan? 🌸`,
    timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  });

  resetRattaBotInactivityTimer();
  renderRattaBotMessages();
  showToast('Tindakan dibatalkan.', 'info');
}

async function executeRattaBotPendingAction() {
  if (!rattabotPendingAction) return;

  const action = rattabotPendingAction;
  hideRattaBotConfirmationCard();
  showRattaBotProcessingBanner();

  try {
    await performRattaBotExecution(action);

    // Completion Message
    const completionMsg = `Sudah Selesai ! Saya baru saja melakukan ${action.description}. Boleh anda cek, Senang membantu! 🌸`;

    rattabotChatHistory.push({
      role: 'assistant',
      text: completionMsg,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    });

    rattabotPendingAction = null;
    showToast(`Sukses: ${action.description}`, 'success');
  } catch (err) {
    console.error('Execution Error:', err);
    rattabotChatHistory.push({
      role: 'assistant',
      text: `Maaf, eksekusi gagal: ${err.message}. Data sistem tidak berubah. 🌸`,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    });
    showToast(`Gagal: ${err.message}`, 'error');
  } finally {
    hideRattaBotProcessingBanner();
    resetRattaBotInactivityTimer();
    renderRattaBotMessages();
  }
}

// -----------------------------------------------------------------------------
// RATTABOT PROGRAMMATIC CRUD EXECUTOR (ATTRIBUTED TO CURRENT USER)
// -----------------------------------------------------------------------------
async function performRattaBotExecution(actionObj) {
  const { action, description, params } = actionObj;
  const userEmail = currentUser ? currentUser.email : 'admin@hotel.com';
  const todayDate = new Date().toISOString().split('T')[0];

  state.masterItems = state.masterItems || [];
  state.stockTransactions = state.stockTransactions || [];
  state.departmentMovements = state.departmentMovements || [];
  state.purchaseOrders = state.purchaseOrders || [];
  state.preloved = state.preloved || [];
  state.pcs = state.pcs || [];
  state.pcMovements = state.pcMovements || [];
  state.pcComponentMovements = state.pcComponentMovements || [];

  switch (action) {
    case 'create_master_item': {
      const newItem = {
        id: `item-${Date.now()}`,
        name: params.name,
        category: params.category || 'PC ITEMS',
        available_stock: parseInt(params.availableStock) || 0,
        minimum_stock: parseInt(params.minimumStock) || 5,
        image_url: params.imageUrl || null,
        created_at: new Date().toISOString()
      };
      state.masterItems.unshift(newItem);
      if (isLiveSupabase && supabaseClient) {
        await supabaseClient.from('master_items').insert(newItem);
      }
      logActivity(newItem.name, newItem.category, `Menambahkan Master Item baru "${newItem.name}" via RattaBot AI`, 'INVENTORY');
      break;
    }

    case 'inbound_stock': {
      const item = state.masterItems.find(i => i.id === params.itemId || i.name.toLowerCase() === (params.itemId || '').toLowerCase());
      if (!item) throw new Error('Item tidak ditemukan di master inventory.');
      const qty = parseInt(params.quantity) || 1;
      const newTx = {
        id: `tx-${Date.now()}`,
        item_id: item.id,
        transaction_date: todayDate,
        quantity: qty,
        type: 'INBOUND',
        remark: params.notes || 'Inbound stock via RattaBot AI',
        created_by: userEmail,
        created_at: new Date().toISOString()
      };
      state.stockTransactions.unshift(newTx);
      if (isLiveSupabase && supabaseClient) {
        await supabaseClient.from('stock_transactions').insert(newTx);
      }
      logActivity(item.name, item.category, `Menambah stok masuk +${qty} unit via RattaBot AI`, 'INVENTORY');
      break;
    }

    case 'reduce_stock': {
      const item = state.masterItems.find(i => i.id === params.itemId || i.name.toLowerCase() === (params.itemId || '').toLowerCase());
      if (!item) throw new Error('Item tidak ditemukan di master inventory.');
      const metrics = calculateStockMetrics(item.id);
      const qty = parseInt(params.quantity) || 1;
      if (metrics.availableStock < qty) {
        throw new Error(`Stok tidak mencukupi! Tersedia hanya ${metrics.availableStock} unit.`);
      }
      const newTx = {
        id: `tx-${Date.now()}`,
        item_id: item.id,
        transaction_date: todayDate,
        quantity: qty,
        type: 'REDUCTION',
        remark: `[PENGURANGAN STOK] ${params.reason || 'Pengurangan via RattaBot AI'}`,
        created_by: userEmail,
        created_at: new Date().toISOString()
      };
      state.stockTransactions.unshift(newTx);
      if (isLiveSupabase && supabaseClient) {
        await supabaseClient.from('stock_transactions').insert(newTx);
      }
      logActivity(item.name, item.category, `Mengurangi stok gudang -${qty} unit (${params.reason || 'Pengurangan'}) via RattaBot AI`, 'INVENTORY');
      break;
    }

    case 'transfer_to_department': {
      const item = state.masterItems.find(i => i.id === params.itemId || i.name.toLowerCase() === (params.itemId || '').toLowerCase());
      if (!item) throw new Error('Item tidak ditemukan di master inventory.');
      const metrics = calculateStockMetrics(item.id);
      const qty = parseInt(params.quantity) || 1;
      if (metrics.availableStock < qty) {
        throw new Error(`Stok inventory tidak mencukupi! Tersedia ${metrics.availableStock} unit.`);
      }
      const newMov = {
        id: `mov-${Date.now()}`,
        item_id: item.id,
        department: params.department,
        quantity: qty,
        type: 'TRANSFER',
        movement_date: todayDate,
        notes: params.notes || 'Transfer via RattaBot AI',
        created_by: userEmail,
        created_at: new Date().toISOString()
      };
      state.departmentMovements.unshift(newMov);
      if (isLiveSupabase && supabaseClient) {
        await supabaseClient.from('department_movements').insert(newMov);
      }
      logActivity(item.name, item.category, `Transfer ${qty} unit ke ${params.department} via RattaBot AI`, 'DEPARTMENT');
      break;
    }

    case 'return_to_inventory': {
      const item = state.masterItems.find(i => i.id === params.itemId || i.name.toLowerCase() === (params.itemId || '').toLowerCase());
      if (!item) throw new Error('Item tidak ditemukan di master inventory.');
      const deptHolding = calculateDeptHolding(item.id, params.department);
      const qty = parseInt(params.quantity) || 1;
      if (deptHolding < qty) {
        throw new Error(`Departemen ${params.department} hanya memegang ${deptHolding} unit item ini.`);
      }
      const newMov = {
        id: `mov-${Date.now()}`,
        item_id: item.id,
        department: params.department,
        quantity: qty,
        type: 'RETURN',
        movement_date: todayDate,
        notes: params.notes || 'Pengembalian via RattaBot AI',
        created_by: userEmail,
        created_at: new Date().toISOString()
      };
      state.departmentMovements.unshift(newMov);
      if (isLiveSupabase && supabaseClient) {
        await supabaseClient.from('department_movements').insert(newMov);
      }
      logActivity(item.name, item.category, `Pengembalian ${qty} unit dari ${params.department} ke IT Storage via RattaBot AI`, 'DEPARTMENT');
      break;
    }

    case 'create_purchase_order': {
      const item = state.masterItems.find(i => i.id === params.itemId || i.name.toLowerCase() === (params.itemId || '').toLowerCase());
      const itemName = item ? item.name : (params.itemName || 'Hardware PO');
      const poNum = params.poNumber || `PO-${new Date().getFullYear()}-${String(state.purchaseOrders.length + 1).padStart(3, '0')}`;
      const newPO = {
        id: `po-${Date.now()}`,
        item_id: item ? item.id : null,
        item_name: itemName,
        category: item ? item.category : 'PC ITEMS',
        quantity: parseInt(params.quantity) || 1,
        vendor: params.vendor || 'Official IT Distributor',
        po_number: poNum,
        status: 'BELUM DATANG',
        order_date: todayDate,
        estimated_arrival: params.estimatedArrival || todayDate,
        created_by: userEmail,
        created_at: new Date().toISOString()
      };
      state.purchaseOrders.unshift(newPO);
      if (isLiveSupabase && supabaseClient) {
        await supabaseClient.from('purchase_orders').insert(newPO);
      }
      logActivity(itemName, newPO.category, `Membuat Purchase Order ${poNum} (${newPO.quantity} unit) via RattaBot AI`, 'PURCHASE_ORDER');
      break;
    }

    case 'mark_po_arrived': {
      const po = state.purchaseOrders.find(p => p.id === params.poId || p.po_number === params.poId);
      if (!po) throw new Error('Purchase Order tidak ditemukan.');
      po.status = 'SUDAH DATANG';
      if (isLiveSupabase && supabaseClient) {
        await supabaseClient.from('purchase_orders').update({ status: 'SUDAH DATANG' }).eq('id', po.id);
      }
      let matchedItem = state.masterItems.find(i => (po.item_id && i.id === po.item_id) || i.name.toLowerCase() === po.item_name.toLowerCase());
      if (matchedItem) {
        const newTx = {
          id: `tx-${Date.now()}`,
          item_id: matchedItem.id,
          transaction_date: todayDate,
          quantity: po.quantity,
          type: 'INBOUND',
          remark: `[PO ARRIVED: ${po.po_number}] Inbound via RattaBot AI`,
          created_by: userEmail,
          created_at: new Date().toISOString()
        };
        state.stockTransactions.unshift(newTx);
        if (isLiveSupabase && supabaseClient) {
          await supabaseClient.from('stock_transactions').insert(newTx);
        }
      }
      logActivity(po.item_name, po.category, `Menandai PO ${po.po_number} SUDAH DATANG via RattaBot AI`, 'PURCHASE_ORDER');
      break;
    }

    case 'record_damaged_hardware': {
      const newDamaged = {
        id: `preloved-${Date.now()}`,
        item_name: params.itemName,
        department: params.department || 'IT Storage',
        condition: params.condition || 'Rusak / Butuh Perbaikan',
        date: todayDate,
        remarks: params.remarks || 'Dicatat via RattaBot AI',
        created_by: userEmail,
        created_at: new Date().toISOString()
      };
      state.preloved.unshift(newDamaged);
      if (isLiveSupabase && supabaseClient) {
        await supabaseClient.from('preloved').insert(newDamaged);
      }
      logActivity(newDamaged.item_name, 'DAMAGED_HARDWARE', `Mencatat Damaged Hardware "${newDamaged.item_name}" via RattaBot AI`, 'DAMAGED_HARDWARE');
      break;
    }

    case 'build_pc': {
      const pcName = params.pcName;
      if (!pcName) throw new Error('Nama PC wajib diisi.');
      if (state.pcs.some(p => p.name.toLowerCase() === pcName.toLowerCase())) {
        throw new Error(`Nama PC "${pcName}" sudah ada.`);
      }

      const components = {
        psu: params.psuId || null,
        storage: params.storageId || null,
        ram1: params.ram1Id || null,
        ram2: params.ram2Id || null,
        ram3: params.ram3Id || null,
        vga: params.vgaId || null
      };

      const newPC = {
        id: `pc-${Date.now()}`,
        name: pcName,
        chipset: params.chipset || 'Intel Core i5',
        department: params.department || null,
        components: components,
        created_at: new Date().toISOString()
      };

      // Record component deduction
      const slots = [
        { slot: 'Power Supply', id: components.psu },
        { slot: 'Hardisk / SSD', id: components.storage },
        { slot: 'RAM Slot 1', id: components.ram1 },
        { slot: 'RAM Slot 2', id: components.ram2 },
        { slot: 'RAM Slot 3', id: components.ram3 },
        { slot: 'VGA Card', id: components.vga }
      ].filter(s => s.id);

      slots.forEach(s => {
        const item = state.masterItems.find(i => i.id === s.id);
        const itemName = item ? item.name : s.id;
        state.departmentMovements.unshift({
          id: `mov-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          item_id: s.id,
          department: 'Workstation PC',
          quantity: 1,
          type: 'TRANSFER TO PC',
          movement_date: todayDate,
          notes: `Rakit PC "${pcName}" [Slot: ${s.slot}] via RattaBot AI`,
          created_by: userEmail,
          created_at: new Date().toISOString()
        });

        state.pcComponentMovements.unshift({
          id: `pcmov-comp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          pc_id: newPC.id,
          pc_name: pcName,
          slot_name: s.slot,
          component_id: s.id,
          component_name: itemName,
          action_type: 'PASANG BARU',
          target_pc_id: null,
          target_pc_name: null,
          actor: userEmail,
          remarks: `Pemasangan komponen saat perakitan PC via RattaBot AI`,
          timestamp: new Date().toISOString()
        });
      });

      state.pcMovements.unshift({
        id: `pcmov-${Date.now()}`,
        pc_id: newPC.id,
        pc_name: pcName,
        from_dept: 'Gudang IT',
        to_dept: params.department || 'Tersimpan di IT Storage',
        action_type: 'RAKIT PC BARU',
        actor: userEmail,
        remarks: `Perakitan workstation PC baru via RattaBot AI`,
        timestamp: new Date().toISOString()
      });

      state.pcs.unshift(newPC);

      if (isLiveSupabase && supabaseClient) {
        await supabaseClient.from('pcs').insert(newPC);
      }
      logActivity(pcName, 'PC ITEMS', `Merakit Workstation PC baru "${pcName}" via RattaBot AI`, 'PC');
      break;
    }

    case 'assign_pc_to_department': {
      const pc = state.pcs.find(p => p.id === params.pcId || p.name.toLowerCase() === (params.pcId || '').toLowerCase());
      if (!pc) throw new Error('PC tidak ditemukan.');
      const oldDept = pc.department || 'IT Storage';
      pc.department = params.department;

      state.pcMovements.unshift({
        id: `pcmov-${Date.now()}`,
        pc_id: pc.id,
        pc_name: pc.name,
        from_dept: oldDept,
        to_dept: params.department,
        action_type: 'PINDAH DEPARTEMEN',
        actor: userEmail,
        remarks: `Penempatan PC ke departemen ${params.department} via RattaBot AI`,
        timestamp: new Date().toISOString()
      });

      if (isLiveSupabase && supabaseClient) {
        await supabaseClient.from('pcs').update({ department: params.department }).eq('id', pc.id);
      }
      logActivity(pc.name, 'PC ITEMS', `Menempatkan PC "${pc.name}" di ${params.department} via RattaBot AI`, 'PC');
      break;
    }

    case 'remove_pc_from_department': {
      const pc = state.pcs.find(p => p.id === params.pcId || p.name.toLowerCase() === (params.pcId || '').toLowerCase());
      if (!pc) throw new Error('PC tidak ditemukan.');
      const oldDept = pc.department || 'Departemen';
      pc.department = null;

      state.pcMovements.unshift({
        id: `pcmov-${Date.now()}`,
        pc_id: pc.id,
        pc_name: pc.name,
        from_dept: oldDept,
        to_dept: 'Tersimpan di IT Storage',
        action_type: 'LEPAS DEPARTEMEN',
        actor: userEmail,
        remarks: `Pelepasan PC dari ${oldDept} kembali ke IT Storage via RattaBot AI`,
        timestamp: new Date().toISOString()
      });

      if (isLiveSupabase && supabaseClient) {
        await supabaseClient.from('pcs').update({ department: null }).eq('id', pc.id);
      }
      logActivity(pc.name, 'PC ITEMS', `Melepas PC "${pc.name}" dari ${oldDept} via RattaBot AI`, 'PC');
      break;
    }

    case 'delete_pc': {
      const pc = state.pcs.find(p => p.id === params.pcId || p.name.toLowerCase() === (params.pcId || '').toLowerCase());
      if (!pc) throw new Error('PC tidak ditemukan.');

      // Return all components to inventory (+1 stock)
      const compKeys = ['psu', 'storage', 'ram1', 'ram2', 'ram3', 'vga'];
      compKeys.forEach(slotKey => {
        const compId = pc.components?.[slotKey];
        if (compId) {
          const item = state.masterItems.find(i => i.id === compId);
          const itemName = item ? item.name : compId;

          state.departmentMovements.unshift({
            id: `mov-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            item_id: compId,
            department: 'IT Storage',
            quantity: 1,
            type: 'RETURN FROM PC',
            movement_date: todayDate,
            notes: `Auto-return dari hapus PC "${pc.name}" via RattaBot AI`,
            created_by: userEmail,
            created_at: new Date().toISOString()
          });

          state.pcComponentMovements.unshift({
            id: `pcmov-comp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            pc_id: pc.id,
            pc_name: pc.name,
            slot_name: slotKey.toUpperCase(),
            component_id: compId,
            component_name: itemName,
            action_type: 'KEMBALI KE INVENTORY',
            target_pc_id: null,
            target_pc_name: null,
            actor: userEmail,
            remarks: `Komponen dikembalikan ke gudang inventory karena PC dihapus via RattaBot AI`,
            timestamp: new Date().toISOString()
          });
        }
      });

      state.pcMovements.unshift({
        id: `pcmov-${Date.now()}`,
        pc_id: pc.id,
        pc_name: pc.name,
        from_dept: pc.department || 'IT Storage',
        to_dept: 'DIHAPUS',
        action_type: 'HAPUS PC',
        actor: userEmail,
        remarks: `PC dihapus via RattaBot AI (seluruh komponen kembali ke gudang inventory)`,
        timestamp: new Date().toISOString()
      });

      state.pcs = state.pcs.filter(p => p.id !== pc.id);

      if (isLiveSupabase && supabaseClient) {
        await supabaseClient.from('pcs').delete().eq('id', pc.id);
      }
      logActivity(pc.name, 'PC ITEMS', `Menghapus Workstation PC "${pc.name}" & mengembalikan komponen via RattaBot AI`, 'PC');
      break;
    }

    default:
      throw new Error(`Aksi "${action}" tidak dikenali oleh sistem.`);
  }

  // Persist updated state locally & refresh all UI tables live
  persistState();
  refreshAllViews();
}

// Global Window Exports for RattaBot & Gemini Settings
window.getGeminiApiKey = getGeminiApiKey;
window.getGeminiModel = getGeminiModel;
window.initGeminiSettings = initGeminiSettings;
window.saveGeminiSettings = saveGeminiSettings;
window.clearGeminiSettings = clearGeminiSettings;
window.toggleGeminiKeyVisibility = toggleGeminiKeyVisibility;
window.testGeminiConnection = testGeminiConnection;

window.onEnterRattaBotView = onEnterRattaBotView;
window.onExitRattaBotView = onExitRattaBotView;
window.startRattaBotInactivityTimer = startRattaBotInactivityTimer;
window.stopRattaBotInactivityTimer = stopRattaBotInactivityTimer;
window.resetRattaBotInactivityTimer = resetRattaBotInactivityTimer;
window.clearRattaBotSession = clearRattaBotSession;
window.resetRattaBotChat = resetRattaBotChat;
window.renderRattaBotMessages = renderRattaBotMessages;
window.applyRattaBotSuggestion = applyRattaBotSuggestion;
window.clearRattaBotInput = clearRattaBotInput;
window.handleRattaBotSubmit = handleRattaBotSubmit;
window.cancelRattaBotPendingAction = cancelRattaBotPendingAction;
window.executeRattaBotPendingAction = executeRattaBotPendingAction;
window.executeRattaBotAction = performRattaBotExecution;

document.addEventListener('DOMContentLoaded', () => {
  startRealTimeDeviceClock();
  initSupabaseClient();
  initSettingsForm();
  initMonthlyView();

  document.getElementById('form-login')?.addEventListener('submit', handleLoginSubmit);
  document.getElementById('btn-logout')?.addEventListener('click', handleLogout);

  document.getElementById('form-create-master-item')?.addEventListener('submit', handleCreateMasterItemSubmit);
  document.getElementById('form-inbound')?.addEventListener('submit', handleInboundSubmit);
  document.getElementById('form-transfer')?.addEventListener('submit', handleTransferSubmit);
  document.getElementById('form-return')?.addEventListener('submit', handleReturnSubmit);
  document.getElementById('form-po')?.addEventListener('submit', handlePOSubmit);
  document.getElementById('form-preloved')?.addEventListener('submit', handlePrelovedSubmit);

  const togglePassBtn = document.getElementById('toggle-password');
  if (togglePassBtn) {
    togglePassBtn.addEventListener('click', () => {
      const passInput = document.getElementById('login-password');
      const passIcon = document.getElementById('toggle-password-icon');
      if (passInput && passIcon) {
        if (passInput.type === 'password') {
          passInput.type = 'text';
          passIcon.className = 'fa-solid fa-eye-slash';
        } else {
          passInput.type = 'password';
          passIcon.className = 'fa-solid fa-eye';
        }
      }
    });
  }

  const toggleConfigBtn = document.getElementById('toggle-supabase-config');
  if (toggleConfigBtn) {
    toggleConfigBtn.addEventListener('click', () => {
      const panel = document.getElementById('supabase-config-panel');
      const chevron = document.getElementById('config-chevron');
      if (panel) panel.classList.toggle('hidden');
      if (chevron) chevron.classList.toggle('rotate-180');
    });
  }

  document.getElementById('btn-save-config')?.addEventListener('click', saveLoginConfigDrawer);

  const mobileBtn = document.getElementById('mobile-menu-btn');
  if (mobileBtn) {
    mobileBtn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleMobileSidebar(true);
    };
  }

  const storedUser = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
  if (storedUser) {
    try {
      const user = JSON.parse(storedUser);
      setCurrentSessionUser(user);
    } catch (e) {
      document.getElementById('login-view')?.classList.remove('hidden');
    }
  } else {
    document.getElementById('login-view')?.classList.remove('hidden');
  }
});
