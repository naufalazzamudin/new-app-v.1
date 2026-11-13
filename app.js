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
  DEMO_DATA: 'HOTEL_IT_DATA_CACHE'
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
    ? `<span class="badge-pill px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 inline-flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>SUDAH DATANG <span class="text-[9px] text-emerald-300 font-semibold bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/40">Tersinkron</span></span>`
    : `<span class="badge-pill px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30 inline-flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0"></span>BELUM DATANG</span>`;
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
  pcComponentMovements: [],
  sharedNotes: [],
  privateNotes: []
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

// Notes & Workspace Documentation State
let activeNotesTab = 'all'; // 'all' | 'shared' | 'private'
let notesSearchQuery = '';
let currentEditingNote = null; // { id, type, isNew, originalCreatedBy, ... }
let noteAutoSaveTimer = null;
let isSavingNote = false;

// ==============================================================================
// 2. INITIAL SEED / OFFLINE FALLBACK DATA
// ==============================================================================
function getInitialSeedData() {
  const now = new Date();
  const twoDaysAgo = new Date(now.getTime() - 2 * 86400000).toISOString();
  const oneDayAgo = new Date(now.getTime() - 86400000).toISOString();

  return {
    masterItems: [],
    stockTransactions: [],
    departmentMovements: [],
    purchaseOrders: [],
    preloved: [],
    activities: [],
    pcs: [],
    pcMovements: [],
    pcComponentMovements: [],
    sharedNotes: [
      {
        id: 'sn-001',
        title: 'SOP Perawatan Rutin Perangkat Hardware Hotel',
        content: '<h3>SOP Rutin Tim IT Rattan-Inn Hotel:</h3><ul><li><b>Pemeriksaan Harian:</b> Cek server Mikrotik, Core Switch Cisco, dan kestabilan Access Point kamar.</li><li><i>Pembersihan Fisik:</i> Bersihkan debu heatsink dan kipas pendingin PC Front Office minimal sebulan sekali.</li><li><u>Audit Akses:</u> Pastikan tidak ada akun default aktif pada sistem kunci pintu kamar (Vingcard).</li><li><s>Jangan matikan UPS utama</s> sebelum verifikasi status server PMS hotel.</li></ul>',
        created_at: twoDaysAgo,
        updated_at: twoDaysAgo,
        created_by: 'admin@hotel.com',
        created_by_name: 'IT Admin Hotel',
        updated_by: 'admin@hotel.com'
      }
    ],
    privateNotes: [
      {
        id: 'pn-001',
        user_id: 'usr-demo-001',
        title: 'Catatan Pribadi IT Admin - Agenda & Rencana Kerja',
        content: '<p><b>Agenda Prioritas IT:</b></p><ol><li>Follow up status kedatangan Purchase Order PO-2026-10-002 (Cisco Switch).</li><li><i>Uji coba backup database Supabase</i> ke file Excel setiap akhir bulan.</li><li><u>Cek stok harddisk & RAM cadangan</u> di ruang IT Storage.</li><li><s>Konfigurasi IP Static CCTV Lobby</s> (Sudah selesai disetting).</li></ol>',
        created_at: oneDayAgo,
        updated_at: oneDayAgo,
        created_by: 'admin@hotel.com',
        updated_by: 'admin@hotel.com'
      }
    ]
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
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'shared_notes' },
        (payload) => handleRealtimeChange('shared_notes', payload)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'private_notes' },
        (payload) => handleRealtimeChange('private_notes', payload)
      )
      .subscribe((status) => {
        const connText = document.getElementById('header-conn-text');
        if (status === 'SUBSCRIBED') {
          console.log('[Supabase Realtime] Subscribed to real-time events on all tables including Notes');
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
  } else if (table === 'shared_notes') {
    if (!state.sharedNotes) state.sharedNotes = [];
    if (eventType === 'INSERT' && newRecord) {
      if (!state.sharedNotes.some(n => n.id === newRecord.id)) {
        state.sharedNotes.unshift(newRecord);
      }
    } else if (eventType === 'UPDATE' && newRecord) {
      const idx = state.sharedNotes.findIndex(n => n.id === newRecord.id);
      if (idx !== -1) state.sharedNotes[idx] = newRecord;
      else state.sharedNotes.unshift(newRecord);
    } else if (eventType === 'DELETE' && oldRecord) {
      state.sharedNotes = state.sharedNotes.filter(n => n.id !== oldRecord.id);
    }
    if (activeView === 'notes') renderNotesView();
  } else if (table === 'private_notes') {
    if (!state.privateNotes) state.privateNotes = [];
    if (eventType === 'INSERT' && newRecord) {
      if (!state.privateNotes.some(n => n.id === newRecord.id)) {
        state.privateNotes.unshift(newRecord);
      }
    } else if (eventType === 'UPDATE' && newRecord) {
      const idx = state.privateNotes.findIndex(n => n.id === newRecord.id);
      if (idx !== -1) state.privateNotes[idx] = newRecord;
      else state.privateNotes.unshift(newRecord);
    } else if (eventType === 'DELETE' && oldRecord) {
      state.privateNotes = state.privateNotes.filter(n => n.id !== oldRecord.id);
    }
    if (activeView === 'notes') renderNotesView();
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
      safeQuery(supabaseClient.from('pc_component_movements').select('*').order('timestamp', { ascending: false })),
      safeQuery(supabaseClient.from('shared_notes').select('*').order('updated_at', { ascending: false })),
      safeQuery(supabaseClient.from('private_notes').select('*').order('updated_at', { ascending: false }))
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
      if (sharedNotesRes && sharedNotesRes.data) state.sharedNotes = sharedNotesRes.data;
      if (privateNotesRes && privateNotesRes.data) state.privateNotes = privateNotesRes.data;

      syncExistingArrivedPOs();
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
        pcCompMovRes,
        sharedNotesRes,
        privateNotesRes
      ] = await Promise.all([
        supabaseClient.from('master_items').select('*').order('created_at', { ascending: false }),
        supabaseClient.from('stock_transactions').select('*').order('transaction_date', { ascending: false }),
        supabaseClient.from('department_movements').select('*').order('date', { ascending: false }),
        supabaseClient.from('purchase_orders').select('*').order('date_order', { ascending: false }),
        supabaseClient.from('preloved').select('*').order('date_repaired', { ascending: false }),
        supabaseClient.from('activities').select('*').order('timestamp', { ascending: false }).limit(20),
        safeQuery(supabaseClient.from('pcs').select('*').order('created_at', { ascending: false })),
        safeQuery(supabaseClient.from('pc_movements').select('*').order('timestamp', { ascending: false })),
        safeQuery(supabaseClient.from('pc_component_movements').select('*').order('timestamp', { ascending: false })),
        safeQuery(supabaseClient.from('shared_notes').select('*').order('updated_at', { ascending: false })),
        safeQuery(supabaseClient.from('private_notes').select('*').order('updated_at', { ascending: false }))
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
        state.sharedNotes = (sharedNotesRes && sharedNotesRes.data) || state.sharedNotes || [];
        state.privateNotes = (privateNotesRes && privateNotesRes.data) || state.privateNotes || [];

        // If no pcs exist in live DB yet, seed initial PCs into local state so app is immediately usable
        if (!state.pcs || state.pcs.length === 0) {
          const seeds = getInitialSeedData();
          state.pcs = seeds.pcs;
          state.pcMovements = seeds.pcMovements;
          state.pcComponentMovements = seeds.pcComponentMovements;
        }

        if (!state.sharedNotes || state.sharedNotes.length === 0) {
          const seeds = getInitialSeedData();
          state.sharedNotes = seeds.sharedNotes;
        }
        if (!state.privateNotes || state.privateNotes.length === 0) {
          const seeds = getInitialSeedData();
          state.privateNotes = seeds.privateNotes;
        }

        syncExistingArrivedPOs();
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
  state.sharedNotes = state.sharedNotes || [];
  state.privateNotes = state.privateNotes || [];

  if (state.pcs.length === 0) {
    const seeds = getInitialSeedData();
    state.pcs = seeds.pcs;
    state.pcMovements = seeds.pcMovements;
    state.pcComponentMovements = seeds.pcComponentMovements;
  }

  if (state.sharedNotes.length === 0) {
    const seeds = getInitialSeedData();
    state.sharedNotes = seeds.sharedNotes;
  }
  if (state.privateNotes.length === 0) {
    const seeds = getInitialSeedData();
    state.privateNotes = seeds.privateNotes;
  }

  syncExistingArrivedPOs();
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
  // Auto-save note immediately if leaving editor
  if (currentEditingNote) {
    saveCurrentNote(true);
  }

  activeView = viewId;
  toggleMobileSidebar(false);

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
  if (viewId === 'notes') renderNotesView();
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
  renderNotesView();
  updateNotesCounter();
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

  // Render Large PC Management Root Topology Card
  renderDashboardPCRootTopology();

  // 9 Departments Quick Glance Grid
  const deptsGrid = document.getElementById('dashboard-depts-grid');
  if (deptsGrid) {
    deptsGrid.innerHTML = DEPARTMENTS.map(dept => {
      const { totalUnits, totalUniqueItems } = getDeptTotalMetrics(dept);
      return `
        <div
          onclick="selectDepartmentAndNavigate('${dept}')"
          class="stat-card-modern border-amber p-4 cursor-pointer transition group"
        >
          <div class="soft-light-orb -right-6 -top-6 w-20 h-20 bg-amber-500/10 group-hover:bg-amber-500/25"></div>
          <div class="relative z-10">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-slate-200 group-hover:text-amber-300 transition truncate">${dept}</span>
              <div class="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:bg-amber-500/20 group-hover:scale-110 transition">
                <i class="fa-solid fa-arrow-up-right-from-square text-[9px]"></i>
              </div>
            </div>
            <div class="mt-2.5 flex items-baseline gap-2">
              <span class="text-2xl font-black font-mono text-amber-300">${totalUnits}</span>
              <span class="text-[10px] text-slate-400 font-medium">units held</span>
            </div>
            <div class="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-400/80"></span>
              <span>${totalUniqueItems} distinct items</span>
            </div>
          </div>
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
      <div class="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-cyan-500/40 transition">
        <div class="flex justify-between text-xs mb-1.5">
          <span class="text-slate-300 font-semibold flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-cyan-400"></span>
            PC ITEMS
          </span>
          <span class="text-cyan-300 font-mono font-bold">${pcCount} (${Math.round((pcCount / total) * 100)}%)</span>
        </div>
        <div class="w-full h-2 rounded-full bg-slate-800/90 overflow-hidden p-0.5">
          <div class="h-full bg-gradient-to-r from-cyan-500 to-cyan-300 rounded-full shadow-sm shadow-cyan-500/50" style="width: ${(pcCount / total) * 100}%"></div>
        </div>
      </div>
      <div class="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/40 transition">
        <div class="flex justify-between text-xs mb-1.5">
          <span class="text-slate-300 font-semibold flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-indigo-400"></span>
            NETWORK ITEMS
          </span>
          <span class="text-indigo-300 font-mono font-bold">${netCount} (${Math.round((netCount / total) * 100)}%)</span>
        </div>
        <div class="w-full h-2 rounded-full bg-slate-800/90 overflow-hidden p-0.5">
          <div class="h-full bg-gradient-to-r from-indigo-500 to-indigo-300 rounded-full shadow-sm shadow-indigo-500/50" style="width: ${(netCount / total) * 100}%"></div>
        </div>
      </div>
      <div class="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-amber-500/40 transition">
        <div class="flex justify-between text-xs mb-1.5">
          <span class="text-slate-300 font-semibold flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-amber-400"></span>
            CCTV & TV ITEMS
          </span>
          <span class="text-amber-300 font-mono font-bold">${cctvCount} (${Math.round((cctvCount / total) * 100)}%)</span>
        </div>
        <div class="w-full h-2 rounded-full bg-slate-800/90 overflow-hidden p-0.5">
          <div class="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full shadow-sm shadow-amber-500/50" style="width: ${(cctvCount / total) * 100}%"></div>
        </div>
      </div>
      <div class="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-emerald-500/40 transition">
        <div class="flex justify-between text-xs mb-1.5">
          <span class="text-slate-300 font-semibold flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
            LOCK SYSTEM
          </span>
          <span class="text-emerald-300 font-mono font-bold">${lockCount} (${Math.round((lockCount / total) * 100)}%)</span>
        </div>
        <div class="w-full h-2 rounded-full bg-slate-800/90 overflow-hidden p-0.5">
          <div class="h-full bg-gradient-to-r from-emerald-500 to-emerald-300 rounded-full shadow-sm shadow-emerald-500/50" style="width: ${(lockCount / total) * 100}%"></div>
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
        let bgOrb = 'bg-brand-500/10 border-brand-500/20';
        let hoverBorder = 'hover:border-brand-500/40';
        if (a.action === 'Transfer') { icon = 'fa-share-from-square'; color = 'text-amber-400'; bgOrb = 'bg-amber-500/10 border-amber-500/20'; hoverBorder = 'hover:border-amber-500/40'; }
        if (a.action === 'Return') { icon = 'fa-arrow-rotate-left'; color = 'text-emerald-400'; bgOrb = 'bg-emerald-500/10 border-emerald-500/20'; hoverBorder = 'hover:border-emerald-500/40'; }
        if (a.action === 'Received') { icon = 'fa-file-invoice'; color = 'text-blue-400'; bgOrb = 'bg-blue-500/10 border-blue-500/20'; hoverBorder = 'hover:border-blue-500/40'; }
        if (a.action === 'Reduced') { icon = 'fa-circle-minus'; color = 'text-rose-400'; bgOrb = 'bg-rose-500/10 border-rose-500/20'; hoverBorder = 'hover:border-rose-500/40'; }

        const dateStr = a.timestamp ? new Date(a.timestamp).toLocaleDateString('en-GB') : '';

        return `
          <div class="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/90 ${hoverBorder} transition flex items-center justify-between text-xs group">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl ${bgOrb} border ${color} flex items-center justify-center group-hover:scale-110 transition">
                <i class="fa-solid ${icon}"></i>
              </div>
              <div>
                <div class="font-bold text-white group-hover:text-indigo-200 transition">${escapeHtml(a.item_name)}</div>
                <div class="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                  <span class="font-medium text-slate-300">${a.action}</span>
                  <span>·</span>
                  <span>by ${escapeHtml(a.username || 'System')}</span>
                </div>
              </div>
            </div>
            <span class="text-[11px] font-mono text-slate-500 bg-slate-950/60 px-2 py-1 rounded-md border border-slate-800">${dateStr}</span>
          </div>
        `;
      }).join('');
    }
  }
}

// ==============================================================================
// 7.1 DASHBOARD PC MANAGEMENT ROOT TOPOLOGY RENDERING
// ==============================================================================
function renderDashboardPCRootTopology() {
  const container = document.getElementById('dashboard-pc-root-container');
  if (!container) return;

  state.pcs = state.pcs || [];
  const totalPCs = state.pcs.length;
  const inDeptPCs = state.pcs.filter(p => !!p.department).length;
  const readyPCs = totalPCs - inDeptPCs;
  const deploymentRate = totalPCs > 0 ? Math.round((inDeptPCs / totalPCs) * 100) : 0;
  const storageRate = totalPCs > 0 ? Math.round((readyPCs / totalPCs) * 100) : 0;

  // Department distribution
  const deptBreakdown = DEPARTMENTS.map(dept => {
    const pcsInDept = state.pcs.filter(p => p.department === dept);
    return {
      department: dept,
      count: pcsInDept.length,
      pcs: pcsInDept
    };
  });
  const activeDepts = deptBreakdown.filter(d => d.count > 0);
  const activeDeptsCount = activeDepts.length;

  // Ready PCs list
  const readyPCList = state.pcs.filter(p => !p.department);

  // 1. Quick KPI Cards
  const statsHtml = `
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      <div class="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/90 relative overflow-hidden group-hover:border-indigo-500/30 transition">
        <div class="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span class="font-semibold uppercase tracking-wider text-[11px]">Total PC Dirakit</span>
          <div class="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <i class="fa-solid fa-desktop text-xs"></i>
          </div>
        </div>
        <div class="text-2xl font-black font-mono text-white tracking-tight">${totalPCs} <span class="text-xs text-slate-400 font-sans font-normal">Unit</span></div>
        <div class="text-[11px] text-indigo-300 mt-1 flex items-center gap-1">
          <i class="fa-solid fa-microchip text-[10px]"></i>
          <span>Assembled & Registered</span>
        </div>
      </div>

      <div class="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/90 relative overflow-hidden group-hover:border-amber-500/30 transition">
        <div class="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span class="font-semibold uppercase tracking-wider text-[11px]">Terpasang Departemen</span>
          <div class="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <i class="fa-solid fa-building-circle-check text-xs"></i>
          </div>
        </div>
        <div class="text-2xl font-black font-mono text-amber-300 tracking-tight">${inDeptPCs} <span class="text-xs text-slate-400 font-sans font-normal">Unit</span></div>
        <div class="text-[11px] text-amber-400/90 mt-1 flex items-center gap-1 font-mono">
          <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
          <span>${deploymentRate}% Tingkat Penempatan</span>
        </div>
      </div>

      <div class="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/90 relative overflow-hidden group-hover:border-emerald-500/30 transition">
        <div class="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span class="font-semibold uppercase tracking-wider text-[11px]">Ready in Storage</span>
          <div class="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <i class="fa-solid fa-boxes-stacked text-xs"></i>
          </div>
        </div>
        <div class="text-2xl font-black font-mono text-emerald-300 tracking-tight">${readyPCs} <span class="text-xs text-slate-400 font-sans font-normal">Unit</span></div>
        <div class="text-[11px] text-emerald-400/90 mt-1 flex items-center gap-1 font-mono">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span>${storageRate}% Standby di IT Room</span>
        </div>
      </div>

      <div class="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/90 relative overflow-hidden group-hover:border-cyan-500/30 transition">
        <div class="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span class="font-semibold uppercase tracking-wider text-[11px]">Cakupan Departemen</span>
          <div class="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
            <i class="fa-solid fa-network-wired text-xs"></i>
          </div>
        </div>
        <div class="text-2xl font-black font-mono text-cyan-300 tracking-tight">${activeDeptsCount} <span class="text-xs text-slate-400 font-sans font-normal">/ 9 Dept</span></div>
        <div class="text-[11px] text-cyan-400/90 mt-1 flex items-center gap-1">
          <i class="fa-solid fa-circle-check text-[10px]"></i>
          <span>Departemen Operasional</span>
        </div>
      </div>
    </div>
  `;

  // 2. The Modern Root/Tree Topology Visualization
  const treeHtml = `
    <div class="p-5 sm:p-6 rounded-2xl bg-slate-950/60 border border-slate-800/80 relative overflow-hidden">
      <!-- Section Title & Legend -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-5 border-b border-slate-800/80">
        <div class="flex items-center gap-2">
          <i class="fa-solid fa-tree text-indigo-400 text-sm"></i>
          <span class="text-xs font-bold uppercase tracking-wider text-slate-300">Topologi Akar Distribusi Workstation</span>
        </div>
        <div class="flex items-center gap-3 text-[11px] text-slate-400">
          <span class="inline-flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-indigo-400"></span>Pangkal Induk</span>
          <span class="inline-flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-emerald-400"></span>Akar Storage</span>
          <span class="inline-flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-amber-400"></span>Akar Departemen</span>
        </div>
      </div>

      <!-- LEVEL 1: ROOT TRUNK / PANGKAL AKAR (CENTRAL ASSEMBLY HUB) -->
      <div class="flex flex-col items-center">
        <div class="max-w-md w-full p-4 rounded-2xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-indigo-950/80 border-2 border-indigo-500/40 shadow-lg shadow-indigo-500/20 text-center relative group-hover:border-indigo-400 transition">
          <div class="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 mb-2 border border-indigo-500/30">
            <i class="fa-solid fa-server text-base"></i>
          </div>
          <div class="text-[11px] font-bold uppercase tracking-widest text-indigo-300 font-mono">PANGKAL INDUK WORKSTATION</div>
          <div class="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">${totalPCs} Unit PC Dirakit</div>
          <div class="mt-1 flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <span>Komponen Terintegrasi</span>
            <span>•</span>
            <span class="text-emerald-400 font-semibold font-mono">${readyPCs} Ready</span>
            <span>•</span>
            <span class="text-amber-400 font-semibold font-mono">${inDeptPCs} Terpasang</span>
          </div>
        </div>

        <!-- Vertical Root Trunk Stem Line -->
        <div class="w-0.5 h-7 bg-gradient-to-b from-indigo-500 to-indigo-500/40 relative">
          <span class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-indigo-400 animate-ping"></span>
        </div>

        <!-- Horizontal Root Splitter Bridge (Percabangan Kiri & Kanan) -->
        <div class="w-full max-w-4xl relative">
          <div class="w-full h-0.5 bg-gradient-to-r from-emerald-500/40 via-indigo-500/60 to-amber-500/40 rounded-full"></div>
          <!-- Left and Right node connectors -->
          <div class="flex justify-between w-full px-8 sm:px-16">
            <div class="w-0.5 h-6 bg-emerald-500/60"></div>
            <div class="w-0.5 h-6 bg-amber-500/60"></div>
          </div>
        </div>

        <!-- LEVEL 2: DUA CABANG AKAR UTAMA (STORAGE BUFFER VS DEPLOYED) -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full max-w-5xl mt-1">
          <!-- CABANG KIRI: AKAR READY DI IT STORAGE (lg:col-span-4) -->
          <div class="lg:col-span-4 flex flex-col">
            <div class="p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/30 hover:border-emerald-500/60 transition shadow-lg shadow-emerald-500/5 h-full flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between pb-2.5 border-b border-slate-800">
                  <div class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                      <i class="fa-solid fa-boxes-stacked text-xs"></i>
                    </div>
                    <div>
                      <div class="text-xs font-bold text-white">Akar IT Storage</div>
                      <div class="text-[10px] text-emerald-400/80 font-medium">Ready Buffer</div>
                    </div>
                  </div>
                  <span class="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 font-mono font-bold text-xs text-emerald-300">
                    ${readyPCs} PC
                  </span>
                </div>

                <p class="text-[11px] text-slate-400 mt-2.5 leading-relaxed">
                  Unit workstation rakitan yang tersimpan di IT Room dan siap dialokasikan ke departemen.
                </p>

                <!-- List of Ready PCs -->
                <div class="mt-3.5 space-y-1.5">
                  <div class="text-[10px] font-bold uppercase tracking-wider text-slate-500">Daftar PC Siap Pakai:</div>
                  ${readyPCList.length === 0 ? `
                    <div class="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center text-[11px] text-slate-500 italic">
                      ${totalPCs === 0 ? 'Belum ada unit PC yang dirakit.' : 'Semua PC terpasang di departemen.'}
                    </div>
                  ` : `
                    <div class="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                      ${readyPCList.map(pc => `
                        <div class="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-[11px] font-mono">
                          <i class="fa-solid fa-desktop text-[10px] text-emerald-400"></i>
                          <span class="font-semibold">${escapeHtml(pc.name)}</span>
                          <span class="text-[9px] text-emerald-400/60 font-sans">(${escapeHtml(pc.chipset || 'PC')})</span>
                        </div>
                      `).join('')}
                    </div>
                  `}
                </div>
              </div>

              <div class="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <span class="text-slate-400">Porsi Cadangan:</span>
                <span class="font-mono font-bold text-emerald-300">${storageRate}%</span>
              </div>
            </div>
          </div>

          <!-- CABANG KANAN: AKAR TERPASANG DI DEPARTEMEN (lg:col-span-8) -->
          <div class="lg:col-span-8 flex flex-col">
            <div class="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-amber-500/30 hover:border-amber-500/60 transition shadow-lg shadow-amber-500/5 h-full">
              <div class="flex items-center justify-between pb-2.5 border-b border-slate-800">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                    <i class="fa-solid fa-building-user text-xs"></i>
                  </div>
                  <div>
                    <div class="text-xs font-bold text-white">Akar Terpasang di Departemen</div>
                    <div class="text-[10px] text-amber-400/80 font-medium">In-Service Operations</div>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <span class="px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 font-mono font-bold text-xs text-amber-300">
                    ${inDeptPCs} PC Terpasang
                  </span>
                  <span class="text-[11px] text-slate-400 font-mono">(${deploymentRate}%)</span>
                </div>
              </div>

              <!-- Sub-Akar: 9 Departemen Breakdown Grid -->
              <div class="mt-3.5">
                <div class="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center justify-between">
                  <span>Percabangan Akar ke 9 Departemen Hotel:</span>
                  <span class="text-amber-400 font-mono">${activeDeptsCount} dari 9 Departemen Aktif</span>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  ${deptBreakdown.map(item => {
                    const hasPC = item.count > 0;
                    return `
                      <div class="p-2.5 rounded-xl ${hasPC ? 'bg-amber-950/20 border-amber-500/40 shadow-sm shadow-amber-500/5' : 'bg-slate-950/40 border-slate-800/80 opacity-70'} border transition hover:border-amber-400/60">
                        <div class="flex items-center justify-between">
                          <span class="text-xs font-bold ${hasPC ? 'text-amber-200' : 'text-slate-400'} truncate">${escapeHtml(item.department)}</span>
                          <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold ${hasPC ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-800 text-slate-500'}">
                            ${item.count} PC
                          </span>
                        </div>

                        ${hasPC ? `
                          <div class="mt-2 flex flex-wrap gap-1">
                            ${item.pcs.map(p => `
                              <span class="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900/90 text-amber-200 border border-amber-500/30" title="${escapeHtml(p.name)} (${escapeHtml(p.chipset || '-')})">
                                <i class="fa-solid fa-desktop text-[8px] text-amber-400"></i>
                                <span class="truncate max-w-[100px]">${escapeHtml(p.name)}</span>
                              </span>
                            `).join('')}
                          </div>
                        ` : `
                          <div class="text-[10px] text-slate-500 mt-1 flex items-center gap-1 font-mono">
                            <i class="fa-regular fa-circle text-[8px]"></i>
                            <span>Kapasitas Tersedia</span>
                          </div>
                        `}
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  container.innerHTML = statsHtml + treeHtml;
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
        const isPO = Boolean(tx.po_id || (tx.id && tx.id.startsWith('tx-po-')) || (typeof tx.remark === 'string' && tx.remark.includes('[PO SUDAH DATANG]')));

        let typeBadge;
        if (isRed) {
          typeBadge = `<span class="badge-pill px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30 whitespace-nowrap"><i class="fa-solid fa-minus text-[9px] mr-1"></i>Pengurangan</span>`;
        } else if (isPO) {
          typeBadge = `<span class="badge-pill px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 whitespace-nowrap"><i class="fa-solid fa-truck-ramp-box text-[9px] mr-1"></i>PO Datang</span>`;
        } else {
          typeBadge = `<span class="badge-pill px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 whitespace-nowrap"><i class="fa-solid fa-plus text-[9px] mr-1"></i>Stok Masuk</span>`;
        }

        const qtyDisplay = isRed
          ? `<span class="font-bold text-rose-400 font-mono">-${tx.quantity}</span>`
          : (isPO
              ? `<span class="font-bold text-emerald-400 font-mono">+${tx.quantity}</span>`
              : `<span class="font-bold text-cyan-400 font-mono">+${tx.quantity}</span>`);

        let displayRemark = escapeHtml(tx.remark || '-');
        if (displayRemark.startsWith('[PENGURANGAN STOK]')) {
          displayRemark = displayRemark.replace('[PENGURANGAN STOK]', '<span class="text-rose-400 font-semibold">[PENGURANGAN]</span>');
        } else if (displayRemark.startsWith('[PO SUDAH DATANG]')) {
          displayRemark = displayRemark.replace('[PO SUDAH DATANG]', '<span class="text-emerald-400 font-semibold">[PO SUDAH DATANG]</span>');
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

// ==============================================================================
// 12.1 PURCHASE ORDER -> INVENTORY REALTIME STOCK SYNC ENGINE
// ==============================================================================
function applyPOArrivalToInventory(po, customArrivalDate = null) {
  if (!po) return null;

  // 1. Resolve matching master item
  let item = state.masterItems.find(i => i.id === po.item_id);
  if (!item && po.item_name) {
    item = state.masterItems.find(i => i.item_name.toLowerCase() === po.item_name.toLowerCase());
  }

  // If item is not in masterItems yet, auto-create it so it appears in inventory
  if (!item) {
    item = {
      id: po.item_id || `item-po-${po.id}-${Date.now()}`,
      item_name: po.item_name,
      category: po.category || 'PC ITEMS',
      item_code: `SKU-${(po.category || 'PO').substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      remark: `Auto-created from PO ${po.po_number || ''}`,
      photo_url: po.photo_url || null,
      created_at: new Date().toISOString()
    };
    state.masterItems.unshift(item);
    if (isLiveSupabase && supabaseClient) {
      supabaseClient.from('master_items').insert(item).then(() => {});
    }
  }

  const arrivalDate = customArrivalDate || po.date_arrival || new Date().toISOString().split('T')[0];
  po.date_arrival = arrivalDate;
  po.status = 'SUDAH DATANG';
  po.item_id = item.id;
  po.updated_at = new Date().toISOString();

  const txId = po.inbound_tx_id || `tx-po-${po.id}`;
  const existingIdx = state.stockTransactions.findIndex(
    t => t.id === txId || t.id === `tx-po-${po.id}` || (t.po_id && t.po_id === po.id)
  );

  const remark = `[PO SUDAH DATANG] ${po.po_number || 'PO'}: ${item.item_name} (+${po.quantity} unit)${po.vendor ? ' dari ' + po.vendor : ''}${po.for_use ? ' [Peruntukan: ' + po.for_use + ']' : ''}`.trim();

  let targetTx = null;
  let isNew = false;

  if (existingIdx !== -1) {
    targetTx = state.stockTransactions[existingIdx];
    targetTx.item_id = item.id;
    targetTx.quantity = Number(po.quantity) || 1;
    targetTx.transaction_date = arrivalDate;
    targetTx.remark = remark;
    po.inbound_tx_id = targetTx.id;
  } else {
    targetTx = {
      id: txId,
      po_id: po.id,
      item_id: item.id,
      transaction_date: arrivalDate,
      quantity: Number(po.quantity) || 1,
      remark: remark,
      created_by: currentUser ? currentUser.email : (po.created_by || 'admin@hotel.com'),
      created_at: new Date().toISOString()
    };
    po.inbound_tx_id = targetTx.id;
    state.stockTransactions.unshift(targetTx);
    isNew = true;
  }

  // Supabase sync
  if (isLiveSupabase && supabaseClient) {
    const poPayload = {
      status: po.status,
      date_arrival: po.date_arrival,
      updated_at: po.updated_at,
      updated_by: currentUser ? currentUser.email : 'admin@hotel.com'
    };
    supabaseClient.from('purchase_orders').update(poPayload).eq('id', po.id).then(() => {});

    const txPayload = {
      id: targetTx.id,
      item_id: targetTx.item_id,
      transaction_date: targetTx.transaction_date,
      quantity: Number(targetTx.quantity) || 1,
      type: 'INBOUND',
      remark: targetTx.remark,
      created_by: targetTx.created_by || 'admin@hotel.com',
      created_at: targetTx.created_at || new Date().toISOString()
    };
    supabaseClient.from('stock_transactions').upsert(txPayload).then(() => {});
  }

  return { item, tx: targetTx, isNew };
}

function revertPOArrivalFromInventory(po) {
  if (!po) return;
  const txId = po.inbound_tx_id || `tx-po-${po.id}`;
  state.stockTransactions = state.stockTransactions.filter(
    t => t.id !== txId && t.id !== `tx-po-${po.id}` && t.po_id !== po.id
  );

  if (isLiveSupabase && supabaseClient) {
    supabaseClient.from('stock_transactions').delete().eq('id', txId).then(() => {});
    supabaseClient.from('purchase_orders').update({
      status: po.status,
      date_arrival: null,
      updated_at: new Date().toISOString(),
      updated_by: currentUser ? currentUser.email : 'admin@hotel.com'
    }).eq('id', po.id).then(() => {});
  }

  po.inbound_tx_id = null;
  po.date_arrival = null;
}

function syncExistingArrivedPOs() {
  if (!state.purchaseOrders || !state.stockTransactions) return;

  let addedCount = 0;
  state.purchaseOrders.forEach(po => {
    if (po.status === 'SUDAH DATANG') {
      const txId = po.inbound_tx_id || `tx-po-${po.id}`;
      const exists = state.stockTransactions.some(t =>
        t.id === txId ||
        t.id === `tx-po-${po.id}` ||
        (t.po_id && t.po_id === po.id)
      );

      if (!exists) {
        applyPOArrivalToInventory(po);
        addedCount++;
      }
    }
  });

  if (addedCount > 0) {
    persistState();
  }
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
      const prevStatus = existing.status;
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

      if (status === 'SUDAH DATANG') {
        if (!existing.date_arrival) {
          existing.date_arrival = new Date().toISOString().split('T')[0];
        }
        applyPOArrivalToInventory(existing);
      } else if (prevStatus === 'SUDAH DATANG' && status !== 'SUDAH DATANG') {
        revertPOArrivalFromInventory(existing);
      }

      if (isLiveSupabase && supabaseClient) {
        await supabaseClient.from('purchase_orders').update(existing).eq('id', editId);
      }
      showToast(
        status === 'SUDAH DATANG'
          ? `Purchase Order diperbarui! Stok +${qty} unit otomatis tercatat di Inventory & Histori Stok Masuk.`
          : 'Purchase Order berhasil diperbarui!',
        'success'
      );
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

    if (status === 'SUDAH DATANG') {
      applyPOArrivalToInventory(newPO);
    }

    if (isLiveSupabase && supabaseClient) {
      await supabaseClient.from('purchase_orders').insert(newPO);
    }
    state.purchaseOrders.unshift(newPO);
    logActivity(`PO: ${itemName} (${qty} units)`, category, 'Added', 'PURCHASE ORDER');
    showToast(
      status === 'SUDAH DATANG'
        ? `PO baru tersimpan! Status SUDAH DATANG: +${qty} unit otomatis masuk ke Inventory Stock.`
        : 'Purchase Order baru berhasil disimpan!',
      'success'
    );
  }

  persistState();
  refreshAllViews();
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
      btn.className = 'po-filter-btn px-3 py-1.5 rounded-lg text-xs font-bold bg-brand-600 text-white shadow-md shadow-brand-500/25 transition';
    } else {
      btn.className = 'po-filter-btn px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900/80 border border-slate-700/80 text-slate-300 hover:text-white transition';
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
        <td class="py-3 px-4 text-center whitespace-nowrap">
          <span class="font-mono font-bold text-white px-2 py-0.5 rounded bg-slate-900 border border-slate-700/80">${po.quantity}</span>
          ${isArrived ? `<span class="block text-[10px] text-emerald-400 font-semibold mt-0.5"><i class="fa-solid fa-arrow-down mr-0.5"></i>+${po.quantity} Masuk Stok</span>` : ''}
        </td>
        <td class="py-3 px-4 text-slate-300 min-w-[150px]">${escapeHtml(po.for_use)}</td>
        <td class="py-3 px-4 whitespace-nowrap">${formatPOStatusBadge(po.status)}</td>
        <td class="py-3 px-4 text-right whitespace-nowrap">
          <div class="flex items-center justify-end gap-1.5">
            ${!isArrived ? `
              <button
                type="button"
                onclick="markPOArrived('${po.id}')"
                title="Tandai Sudah Datang (Otomatis Masuk ke Inventory & Histori Stok Masuk)"
                class="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white transition text-xs font-semibold flex items-center gap-1 shrink-0 border border-emerald-500/30"
              >
                <i class="fa-solid fa-check"></i>
                <span>Terima</span>
              </button>
            ` : `
              <span
                class="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-[11px] font-semibold border border-emerald-500/20 flex items-center gap-1 shrink-0"
                title="Barang telah tiba dan kuantitas order telah otomatis ditambahkan ke stok inventory"
              >
                <i class="fa-solid fa-boxes-stacked text-xs"></i>
                <span>Tersinkron</span>
              </span>
            `}
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

  const result = applyPOArrivalToInventory(po);
  if (!result) return;

  logActivity(`PO Received: ${result.item.item_name} (+${po.quantity} unit masuk inventory)`, po.category, 'Received', 'PURCHASE ORDER');
  persistState();
  refreshAllViews();

  showToast(`Barang PO "${result.item.item_name}" status SUDAH DATANG! Otomatis tertambah +${po.quantity} unit ke Inventory & Histori Stok Masuk.`, 'success');
}

async function confirmDeletePO(poId, itemName) {
  if (!confirm(`Hapus Purchase Order "${itemName}"?`)) return;

  const po = state.purchaseOrders.find(p => p.id === poId);
  if (po && (po.status === 'SUDAH DATANG' || po.inbound_tx_id)) {
    const txId = po.inbound_tx_id || `tx-po-${po.id}`;
    state.stockTransactions = state.stockTransactions.filter(t => t.id !== txId && t.po_id !== poId);
    if (isLiveSupabase && supabaseClient) {
      supabaseClient.from('stock_transactions').delete().eq('id', txId).then(() => {});
    }
  }

  if (isLiveSupabase && supabaseClient) {
    await supabaseClient.from('purchase_orders').delete().eq('id', poId);
  }

  state.purchaseOrders = state.purchaseOrders.filter(p => p.id !== poId);
  persistState();
  refreshAllViews();
  showToast('Purchase Order berhasil dihapus.', 'info');
}

// ==============================================================================
// 14. PRELOVED ITEMS TABLE
// ==============================================================================
function setPrelovedCatFilter(cat) {
  prelovedCategoryFilter = cat;
  document.querySelectorAll('.preloved-cat-pill').forEach(btn => {
    if (btn.dataset.cat === cat) {
      btn.className = 'preloved-cat-pill px-3 py-1.5 rounded-lg text-xs font-bold bg-brand-600 text-white shadow-md shadow-brand-500/25 transition';
    } else {
      btn.className = 'preloved-cat-pill px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900/80 border border-slate-700/80 text-slate-300 hover:text-white transition';
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
      btn.className = 'monthly-subtab px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 text-white shadow-md shadow-brand-500/25 transition';
    } else {
      btn.className = 'monthly-subtab px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900/80 border border-slate-700/80 text-slate-300 hover:text-white transition';
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
  } else if (currentMonthlyTab === 'pc-movements') {
    const matchesMonth = (m) => {
      const rawDate = String(m.timestamp || m.created_at || '');
      return rawDate.startsWith(ym);
    };
    const pcMovs = (state.pcMovements || []).filter(matchesMonth);
    const compMovs = (state.pcComponentMovements || []).filter(matchesMonth);

    if (pcMovs.length === 0 && compMovs.length === 0) {
      container.innerHTML = `<div class="p-8 text-center text-slate-500">Tidak ada data PC Movement Analytics pada periode ${ym}.</div>`;
      return;
    }

    const pcRows = pcMovs.length > 0
      ? pcMovs.map(m => `
          <tr class="hover:bg-slate-900/50 transition">
            <td class="py-2.5 px-3 font-mono text-[11px] text-slate-300 whitespace-nowrap">${escapeHtml(m.timestamp || '-')}</td>
            <td class="py-2.5 px-3 font-bold text-white whitespace-nowrap">${escapeHtml(m.pc_name || '-')}</td>
            <td class="py-2.5 px-3 whitespace-nowrap">${formatPCActionTypeBadge(m.action_type)}</td>
            <td class="py-2.5 px-3 text-slate-400 whitespace-nowrap">${escapeHtml(m.from_location || '-')}</td>
            <td class="py-2.5 px-3 text-slate-200 font-semibold whitespace-nowrap">${escapeHtml(m.to_location || '-')}</td>
            <td class="py-2.5 px-3 text-slate-300 font-mono text-[11px] whitespace-nowrap">${escapeHtml(m.actor || '-')}</td>
            <td class="py-2.5 px-3 text-slate-400 min-w-[140px]">${escapeHtml(m.notes || '-')}</td>
          </tr>
        `).join('')
      : `<tr><td colspan="7" class="py-6 text-center text-slate-500">Tidak ada perpindahan unit PC pada periode ${ym}.</td></tr>`;

    const compRows = compMovs.length > 0
      ? compMovs.map(m => `
          <tr class="hover:bg-slate-900/50 transition">
            <td class="py-2.5 px-3 font-mono text-[11px] text-slate-300 whitespace-nowrap">${escapeHtml(m.timestamp || '-')}</td>
            <td class="py-2.5 px-3 font-bold text-white whitespace-nowrap">${escapeHtml(m.pc_name || '-')}</td>
            <td class="py-2.5 px-3 font-medium text-slate-300 whitespace-nowrap">${escapeHtml(m.slot_name || '-')}</td>
            <td class="py-2.5 px-3 font-semibold text-indigo-300 min-w-[140px]">${escapeHtml(m.item_name || '-')}</td>
            <td class="py-2.5 px-3 whitespace-nowrap">${formatCompActionTypeBadge(m.action_type)}</td>
            <td class="py-2.5 px-3 text-slate-400 whitespace-nowrap">${escapeHtml(m.related_pc_name || '-')}</td>
            <td class="py-2.5 px-3 text-slate-300 font-mono text-[11px] whitespace-nowrap">${escapeHtml(m.actor || '-')}</td>
            <td class="py-2.5 px-3 text-slate-400 min-w-[140px]">${escapeHtml(m.notes || '-')}</td>
          </tr>
        `).join('')
      : `<tr><td colspan="8" class="py-6 text-center text-slate-500">Tidak ada mutasi komponen PC pada periode ${ym}.</td></tr>`;

    container.innerHTML = `
      <div class="space-y-5">
        <div class="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
          <div class="px-4 py-3 border-b border-slate-800 flex items-center justify-between gap-2 bg-slate-900/70">
            <div class="flex items-center gap-2">
              <i class="fa-solid fa-computer text-indigo-400 text-xs"></i>
              <h4 class="text-xs font-bold uppercase tracking-wider text-white">Data Movement PC (Workstation Lifecycle)</h4>
            </div>
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">${pcMovs.length} Log</span>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-900/90 text-slate-400 uppercase text-[11px] font-semibold border-b border-slate-800">
                <tr>
                  <th class="py-2.5 px-3 whitespace-nowrap">Waktu</th>
                  <th class="py-2.5 px-3 whitespace-nowrap">Nama PC</th>
                  <th class="py-2.5 px-3 whitespace-nowrap">Tipe Aksi</th>
                  <th class="py-2.5 px-3 whitespace-nowrap">Dari Lokasi</th>
                  <th class="py-2.5 px-3 whitespace-nowrap">Ke Lokasi</th>
                  <th class="py-2.5 px-3 whitespace-nowrap">Pelaksana</th>
                  <th class="py-2.5 px-3 min-w-[140px]">Catatan</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/80">${pcRows}</tbody>
            </table>
          </div>
        </div>

        <div class="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
          <div class="px-4 py-3 border-b border-slate-800 flex items-center justify-between gap-2 bg-slate-900/70">
            <div class="flex items-center gap-2">
              <i class="fa-solid fa-microchip text-pink-400 text-xs"></i>
              <h4 class="text-xs font-bold uppercase tracking-wider text-white">Data Movement Component (Hardware & Swap)</h4>
            </div>
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-pink-500/15 text-pink-300 border border-pink-500/30">${compMovs.length} Log</span>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-900/90 text-slate-400 uppercase text-[11px] font-semibold border-b border-slate-800">
                <tr>
                  <th class="py-2.5 px-3 whitespace-nowrap">Waktu</th>
                  <th class="py-2.5 px-3 whitespace-nowrap">Nama PC</th>
                  <th class="py-2.5 px-3 whitespace-nowrap">Slot</th>
                  <th class="py-2.5 px-3 min-w-[140px]">Komponen</th>
                  <th class="py-2.5 px-3 whitespace-nowrap">Tipe Aksi</th>
                  <th class="py-2.5 px-3 whitespace-nowrap">Terkait PC</th>
                  <th class="py-2.5 px-3 whitespace-nowrap">Pelaksana</th>
                  <th class="py-2.5 px-3 min-w-[140px]">Catatan</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/80">${compRows}</tbody>
            </table>
          </div>
        </div>
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
    ['RATTAN-INN HOTEL IT ASSETS CONTROL - MASTER CATALOG & STOCK REPORT'],
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
    ['RATTAN-INN HOTEL IT ASSETS CONTROL - 9 DEPARTMENTS ASSET HOLDINGS REPORT'],
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
    ['RATTAN-INN HOTEL IT ASSETS CONTROL - MOTION AUDIT TRAIL LOG'],
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
    ['RATTAN-INN HOTEL IT ASSETS CONTROL - DAMAGED HARDWARE & REFURBISHED ITEMS'],
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

  const matchesMonth = (m) => String(m.timestamp || m.created_at || '').startsWith(ym);
  const pcMovs = (state.pcMovements || []).filter(matchesMonth);
  const pcMovData = [
    [`RATTAN-INN HOTEL IT MONTHLY PC MOVEMENTS - ${ym}`],
    [],
    ['No', 'Waktu (Device Clock)', 'Nama PC', 'Tipe Aksi', 'Dari Lokasi', 'Ke Lokasi', 'Pelaksana (User)', 'Catatan / Remarks']
  ];
  pcMovs.forEach((m, i) => {
    pcMovData.push([i + 1, m.timestamp || m.created_at || '-', m.pc_name, m.action_type, m.from_location, m.to_location, m.actor, m.notes || '-']);
  });
  const wsPcMov = XLSX.utils.aoa_to_sheet(pcMovData);
  wsPcMov['!cols'] = [{ wch: 6 }, { wch: 22 }, { wch: 24 }, { wch: 22 }, { wch: 22 }, { wch: 24 }, { wch: 22 }, { wch: 36 }];
  XLSX.utils.book_append_sheet(wb, wsPcMov, 'Monthly PC Movements');

  const compMovs = (state.pcComponentMovements || []).filter(matchesMonth);
  const compMovData = [
    [`RATTAN-INN HOTEL IT MONTHLY PC COMPONENT MOVEMENTS - ${ym}`],
    [],
    ['No', 'Waktu (Device Clock)', 'Nama PC', 'Slot Komponen', 'Nama Komponen (Hardware)', 'Tipe Aksi', 'Terkait PC (Swap)', 'Pelaksana (User)', 'Catatan / Remarks']
  ];
  compMovs.forEach((m, i) => {
    compMovData.push([i + 1, m.timestamp || m.created_at || '-', m.pc_name, m.slot_name, m.item_name, m.action_type, m.related_pc_name || '-', m.actor, m.notes || '-']);
  });
  const wsCompMov = XLSX.utils.aoa_to_sheet(compMovData);
  wsCompMov['!cols'] = [{ wch: 6 }, { wch: 22 }, { wch: 22 }, { wch: 18 }, { wch: 34 }, { wch: 24 }, { wch: 22 }, { wch: 22 }, { wch: 36 }];
  XLSX.utils.book_append_sheet(wb, wsCompMov, 'Monthly PC Components');

  const filename = `Rattan_Inn_Hotel_IT_Monthly_Report_${ym}.xlsx`;
  XLSX.writeFile(wb, filename);
  showToast(`Laporan bulanan ${ym} (termasuk PC Movement Analytics) berhasil didownload!`, 'success');
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

  const pcMovData = [
    ['HOTEL IT PC MOVEMENT ANALYTICS - WORKSTATION LIFECYCLE'],
    [],
    ['No', 'Waktu (Device Clock)', 'Nama PC', 'Tipe Aksi', 'Dari Lokasi', 'Ke Lokasi', 'Pelaksana (User)', 'Catatan / Remarks']
  ];
  (state.pcMovements || []).forEach((m, index) => {
    pcMovData.push([index + 1, m.timestamp, m.pc_name, m.action_type, m.from_location, m.to_location, m.actor, m.notes || '-']);
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(pcMovData), 'PC Movements');

  const compMovData = [
    ['HOTEL IT PC COMPONENT MOVEMENT ANALYTICS'],
    [],
    ['No', 'Waktu (Device Clock)', 'Nama PC', 'Slot Komponen', 'Nama Komponen (Hardware)', 'Tipe Aksi', 'Terkait PC (Swap)', 'Pelaksana (User)', 'Catatan / Remarks']
  ];
  (state.pcComponentMovements || []).forEach((m, index) => {
    compMovData.push([index + 1, m.timestamp, m.pc_name, m.slot_name, m.item_name, m.action_type, m.related_pc_name || '-', m.actor, m.notes || '-']);
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(compMovData), 'PC Component Movements');

  const pcSummaryData = [
    ['HOTEL IT PC WORKSTATIONS INVENTORY LIST'],
    [],
    ['No', 'Nama PC', 'Chipset', 'Departemen / Status', 'Power Supply', 'Storage', 'RAM Slot 1', 'RAM Slot 2', 'RAM Slot 3', 'VGA Card']
  ];
  (state.pcs || []).forEach((pc, index) => {
    const psu = state.masterItems.find(i => i.id === pc.psu_item_id)?.item_name || '-';
    const storage = state.masterItems.find(i => i.id === pc.storage_item_id)?.item_name || '-';
    const ram1 = state.masterItems.find(i => i.id === pc.ram1_item_id)?.item_name || '-';
    const ram2 = state.masterItems.find(i => i.id === pc.ram2_item_id)?.item_name || '-';
    const ram3 = state.masterItems.find(i => i.id === pc.ram3_item_id)?.item_name || '-';
    const vga = state.masterItems.find(i => i.id === pc.vga_item_id)?.item_name || '-';
    pcSummaryData.push([index + 1, pc.name, pc.chipset, pc.department ? `Terpasang di ${pc.department}` : 'Ready in IT Storage', psu, storage, ram1, ram2, ram3, vga]);
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(pcSummaryData), 'PC Workstations');

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
  const sql = `-- HOTEL IT INVENTORY MANAGEMENT - NOTES & STORAGE SCHEMA MIGRATION
-- 0. Supabase Storage Bucket: note-images (Public Bucket for Note Photos/Images)
INSERT INTO storage.buckets (id, name, public)
VALUES ('note-images', 'note-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Note Images Public Read" ON storage.objects;
DROP POLICY IF EXISTS "Note Images Public Insert" ON storage.objects;
DROP POLICY IF EXISTS "Note Images Public Update" ON storage.objects;
DROP POLICY IF EXISTS "Note Images Public Delete" ON storage.objects;

CREATE POLICY "Note Images Public Read" ON storage.objects FOR SELECT TO public USING (bucket_id = 'note-images');
CREATE POLICY "Note Images Public Insert" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'note-images');
CREATE POLICY "Note Images Public Update" ON storage.objects FOR UPDATE TO public USING (bucket_id = 'note-images');
CREATE POLICY "Note Images Public Delete" ON storage.objects FOR DELETE TO public USING (bucket_id = 'note-images');

-- 1. Note Bersama (Multi-user, Zero-RLS / RLS Disabled)
CREATE TABLE IF NOT EXISTS public.shared_notes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL DEFAULT 'Catatan Bersama Tanpa Judul',
  content TEXT DEFAULT '',
  images JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by TEXT NOT NULL DEFAULT 'admin@hotel.com',
  created_by_name TEXT,
  updated_by TEXT
);
ALTER TABLE public.shared_notes ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.shared_notes DISABLE ROW LEVEL SECURITY;

-- 2. Note Pribadi (RLS Enabled - Hanya diakses, dilihat, dan diedit pemilik)
CREATE TABLE IF NOT EXISTS public.private_notes (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  title TEXT NOT NULL DEFAULT 'Catatan Pribadi Tanpa Judul',
  content TEXT DEFAULT '',
  images JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by TEXT NOT NULL DEFAULT 'admin@hotel.com',
  updated_by TEXT
);
ALTER TABLE public.private_notes ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.private_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Private Notes Select Policy" ON public.private_notes;
CREATE POLICY "Private Notes Select Policy" ON public.private_notes
  FOR SELECT USING (
    auth.uid()::text = user_id OR
    auth.jwt()->>'email' = created_by OR
    created_by = current_user OR
    (auth.role() = 'anon' AND current_setting('request.jwt.claims', true) IS NULL)
  );

DROP POLICY IF EXISTS "Private Notes Insert Policy" ON public.private_notes;
CREATE POLICY "Private Notes Insert Policy" ON public.private_notes
  FOR INSERT WITH CHECK (
    auth.uid()::text = user_id OR
    auth.jwt()->>'email' = created_by OR
    created_by = current_user OR
    (auth.role() = 'anon' AND current_setting('request.jwt.claims', true) IS NULL)
  );

DROP POLICY IF EXISTS "Private Notes Update Policy" ON public.private_notes;
CREATE POLICY "Private Notes Update Policy" ON public.private_notes
  FOR UPDATE USING (
    auth.uid()::text = user_id OR
    auth.jwt()->>'email' = created_by OR
    created_by = current_user OR
    (auth.role() = 'anon' AND current_setting('request.jwt.claims', true) IS NULL)
  );

DROP POLICY IF EXISTS "Private Notes Delete Policy" ON public.private_notes;
CREATE POLICY "Private Notes Delete Policy" ON public.private_notes
  FOR DELETE USING (
    auth.uid()::text = user_id OR
    auth.jwt()->>'email' = created_by OR
    created_by = current_user OR
    (auth.role() = 'anon' AND current_setting('request.jwt.claims', true) IS NULL)
  );

DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.shared_notes; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.private_notes; EXCEPTION WHEN OTHERS THEN NULL; END $$;`;

  navigator.clipboard.writeText(sql).then(() => {
    showToast('SQL Schema (Note Bersama, Note Pribadi RLS & Storage note-images) berhasil disalin!', 'success');
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
      btn.className = 'pc-filter-btn px-3 py-1.5 rounded-lg text-xs font-bold bg-brand-600 text-white shadow-md shadow-brand-500/25 transition';
    } else {
      btn.className = 'pc-filter-btn px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900/80 border border-slate-700/80 text-slate-300 hover:text-white transition';
    }
  });
  renderPCManagement();
}

function renderSlotMiniChip(label, item, iconClass) {
  if (!item) {
    return `
      <div class="px-2.5 py-1.5 rounded-lg bg-slate-950/70 border border-slate-800/80 text-slate-500 truncate flex items-center gap-1.5 transition">
        <i class="fa-solid ${iconClass} text-[9px] text-slate-600 shrink-0"></i>
        <span class="truncate">${label}: <span class="text-slate-600 italic">None</span></span>
      </div>
    `;
  }
  return `
    <div class="px-2.5 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700/70 hover:border-indigo-500/50 text-slate-300 truncate flex items-center gap-1.5 transition shadow-sm" title="${escapeHtml(item.item_name)}">
      <i class="fa-solid ${iconClass} text-[9px] text-indigo-400 shrink-0"></i>
      <span class="font-medium truncate"><span class="text-slate-400 font-bold">${label}:</span> ${escapeHtml(item.item_name)}</span>
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
        class="stat-card-modern ${isAssigned ? 'border-amber' : 'border-indigo'} p-5 flex flex-col justify-between group cursor-pointer relative overflow-hidden transition-all duration-300"
      >
        <div class="soft-light-orb -right-12 -top-12 w-32 h-32 ${isAssigned ? 'bg-amber-500/10' : 'bg-indigo-500/15'} group-hover:scale-125 transition-transform duration-500"></div>

        <div class="relative z-10">
          <!-- Header Card -->
          <div class="flex items-start justify-between gap-2 mb-2">
            <div class="flex items-center gap-2.5 min-w-0">
              <div class="w-10 h-10 rounded-xl ${isAssigned ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'} flex items-center justify-center shrink-0 group-hover:scale-110 transition duration-300 shadow-md">
                <i class="fa-solid fa-desktop text-base"></i>
              </div>
              <div class="min-w-0">
                <h4 class="text-base font-black text-white truncate tracking-tight">${escapeHtml(pc.name)}</h4>
                <div class="text-[11px] text-indigo-300 font-mono truncate flex items-center gap-1.5 mt-0.5">
                  <span class="w-1.5 h-1.5 rounded-full ${isAssigned ? 'bg-amber-400' : 'bg-emerald-400'} animate-pulse"></span>
                  <span>${escapeHtml(pc.chipset || '-')}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Status Placement Badge -->
          <div class="mt-2.5">
            ${isAssigned ? `
              <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 whitespace-nowrap shadow-sm">
                <i class="fa-solid fa-building text-[9px]"></i>
                <span>PC Terpasang: <strong class="text-white">${escapeHtml(pc.department)}</strong></span>
              </div>
            ` : `
              <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 whitespace-nowrap shadow-sm">
                <i class="fa-solid fa-boxes-stacked text-[9px]"></i>
                <span>Ready in IT Storage</span>
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
        <div class="relative z-10 mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-1.5 text-xs" onclick="event.stopPropagation()">
          <div class="flex items-center gap-1.5 flex-1 min-w-0">
            <button
              type="button"
              onclick="openModalPCDetail('${pc.id}')"
              class="px-2.5 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-[11px] font-bold transition flex items-center gap-1.5 truncate border border-slate-700/80 hover:border-indigo-500/40"
            >
              <i class="fa-solid fa-sliders text-[10px] text-indigo-400 shrink-0"></i>
              <span class="truncate">Detail & Komponen</span>
            </button>

            ${isAssigned ? `
              <button
                type="button"
                onclick="handleRemovePCFromDept('${pc.id}')"
                class="px-2.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 text-[11px] font-bold transition whitespace-nowrap shrink-0 shadow-sm"
                title="Lepas PC Dari Departemen"
              >
                Lepas
              </button>
            ` : `
              <button
                type="button"
                onclick="openAssignDeptPrompt('${pc.id}')"
                class="px-2.5 py-1.5 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/40 text-[11px] font-bold transition whitespace-nowrap shrink-0 shadow-sm"
              >
                + Pasang ke Dept
              </button>
            `}
          </div>

          <button
            type="button"
            onclick="confirmDeletePC('${pc.id}')"
            class="p-2 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 text-[11px] transition shrink-0 shadow-sm"
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
        class="stat-card-modern border-amber p-4 sm:p-5 flex flex-col justify-between group cursor-pointer relative overflow-hidden transition-all duration-300"
      >
        <div class="soft-light-orb -right-10 -top-10 w-28 h-28 bg-amber-500/15 group-hover:scale-125 transition-transform duration-500"></div>

        <div class="relative z-10">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2.5">
              <div class="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center text-sm shadow-md group-hover:scale-110 transition duration-300">
                <i class="fa-solid fa-desktop"></i>
              </div>
              <div>
                <h4 class="text-sm font-black text-white truncate">${escapeHtml(pc.name)}</h4>
                <div class="text-[10px] text-amber-300/90 font-mono flex items-center gap-1.5 mt-0.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                  <span>${escapeHtml(pc.chipset || '-')}</span>
                </div>
              </div>
            </div>
            <span class="px-2.5 py-1 rounded-lg text-[9px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 whitespace-nowrap shadow-sm">
              ${escapeHtml(deptName)}
            </span>
          </div>

          <div class="mt-3.5 grid grid-cols-2 gap-1.5 text-[10px]">
            ${renderSlotMiniChip('PSU', psuItem, 'fa-bolt')}
            ${renderSlotMiniChip('Storage', storageItem, 'fa-hard-drive')}
            ${renderSlotMiniChip('RAM 1', ram1Item, 'fa-memory')}
            ${renderSlotMiniChip('RAM 2', ram2Item, 'fa-memory')}
            ${renderSlotMiniChip('RAM 3', ram3Item, 'fa-memory')}
            ${renderSlotMiniChip('VGA', vgaItem, 'fa-tv')}
          </div>
        </div>

        <div class="relative z-10 mt-3.5 pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-1.5" onclick="event.stopPropagation()">
          <div class="flex items-center gap-1.5">
            <button
              type="button"
              onclick="openModalPCDetail('${pc.id}')"
              class="px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-[11px] font-bold transition flex items-center gap-1.5 border border-slate-700/80 hover:border-amber-500/40"
            >
              <i class="fa-solid fa-sliders text-[10px] text-amber-400"></i>
              <span>Detail PC</span>
            </button>
            <button
              type="button"
              onclick="handleRemovePCFromDept('${pc.id}')"
              class="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 text-[11px] font-bold transition whitespace-nowrap shadow-sm"
            >
              Lepas
            </button>
          </div>
          <button
            type="button"
            onclick="confirmDeletePC('${pc.id}')"
            class="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 text-[11px] transition shrink-0 shadow-sm"
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
window.applyPOArrivalToInventory = applyPOArrivalToInventory;
window.revertPOArrivalFromInventory = revertPOArrivalFromInventory;
window.syncExistingArrivedPOs = syncExistingArrivedPOs;
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
window.renderDashboardPCRootTopology = renderDashboardPCRootTopology;
window.updateHeroGreeting = updateHeroGreeting;
window.getGreetingPrefix = getGreetingPrefix;
window.startRealTimeDeviceClock = startRealTimeDeviceClock;
window.setupSupabaseRealtime = setupSupabaseRealtime;

// ==============================================================================
// 20. NOTE & WORKSPACE DOCUMENTATION ENGINE (SHARED & PRIVATE NOTES WITH RLS)
// ==============================================================================

function stripHtml(html) {
  if (!html) return '';
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

function formatNoteDate(isoString) {
  if (!isoString) return '--';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return isoString;

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const day = d.getDate();
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');

  return `${day} ${month} ${year}, ${hours}:${minutes}`;
}

function getActiveUserEmail() {
  return (currentUser && currentUser.email ? currentUser.email : 'admin@hotel.com').toLowerCase().trim();
}

function canUserModifyNote(note, noteType) {
  if (!note) return false;
  const resolvedType = noteType || note.type || 'shared';
  const userEmail = getActiveUserEmail();
  const noteAuthor = (note.created_by || '').toLowerCase().trim();

  if (resolvedType === 'private') {
    if (currentUser && currentUser.id && note.user_id && note.user_id === currentUser.id) return true;
    return noteAuthor !== '' && noteAuthor === userEmail;
  }

  // Note Bersama: HANYA user pembuat note yang bisa mengedit atau menghapus
  return noteAuthor !== '' && noteAuthor === userEmail;
}

function canUserAccessPrivateNote(note) {
  if (!note) return false;
  const userEmail = getActiveUserEmail();
  const owner = (note.created_by || '').toLowerCase().trim();
  if (currentUser && currentUser.id && note.user_id && note.user_id === currentUser.id) return true;
  return owner !== '' && owner === userEmail;
}

function getNoteAuthorLabel(note) {
  if (!note) return 'IT User';
  const email = (note.created_by || '').trim();
  const name = (note.created_by_name || '').trim();
  if (name && email && name.toLowerCase() !== email.toLowerCase()) {
    return `${name} (${email})`;
  }
  return email || name || 'IT User';
}

function extractNoteImagesFromBody() {
  const bodyDiv = document.getElementById('editor-note-body');
  if (!bodyDiv) return Array.isArray(currentEditingNote?.images) ? currentEditingNote.images : [];
  const imgs = Array.from(bodyDiv.querySelectorAll('img'));
  return imgs.map(img => ({
    url: img.getAttribute('src') || '',
    bucket: img.dataset.bucket || 'note-images',
    uploaded_at: img.dataset.uploadedAt || new Date().toISOString()
  })).filter(i => i.url);
}

function countNoteImages(note) {
  if (!note) return 0;
  if (Array.isArray(note.images) && note.images.length > 0) return note.images.length;
  const html = String(note.content || '');
  const matches = html.match(/<img\b[^>]*>/gi);
  return matches ? matches.length : 0;
}

function updateNotesCounter() {
  const shared = state.sharedNotes || [];
  const userPrivate = (state.privateNotes || []).filter(canUserAccessPrivateNote);

  const total = shared.length + userPrivate.length;

  const sidebarBadge = document.getElementById('sidebar-notes-counter');
  const badgeAll = document.getElementById('notes-badge-all');
  const badgeShared = document.getElementById('notes-badge-shared');
  const badgePrivate = document.getElementById('notes-badge-private');

  if (sidebarBadge) sidebarBadge.textContent = total;
  if (badgeAll) badgeAll.textContent = total;
  if (badgeShared) badgeShared.textContent = shared.length;
  if (badgePrivate) badgePrivate.textContent = userPrivate.length;
}

function setNotesTab(tab) {
  activeNotesTab = tab;

  const btnAll = document.getElementById('tab-notes-all');
  const btnShared = document.getElementById('tab-notes-shared');
  const btnPrivate = document.getElementById('tab-notes-private');

  const activeClasses = ['bg-gradient-to-r', 'from-amber-600', 'to-amber-500', 'text-white', 'shadow-md', 'shadow-amber-500/20'];
  const inactiveClasses = ['text-slate-400', 'hover:text-white', 'bg-slate-900/80', 'hover:bg-slate-800', 'border', 'border-slate-700/80'];

  [btnAll, btnShared, btnPrivate].forEach(btn => {
    if (btn) {
      btn.classList.remove(...activeClasses);
      btn.classList.add(...inactiveClasses);
    }
  });

  if (tab === 'all' && btnAll) {
    btnAll.classList.remove(...inactiveClasses);
    btnAll.classList.add(...activeClasses);
  } else if (tab === 'shared' && btnShared) {
    btnShared.classList.remove(...inactiveClasses);
    btnShared.classList.add(...activeClasses);
  } else if (tab === 'private' && btnPrivate) {
    btnPrivate.classList.remove(...inactiveClasses);
    btnPrivate.classList.add(...activeClasses);
  }

  renderNotesCards();
}

function handleNotesSearch(val) {
  notesSearchQuery = (val || '').toLowerCase().trim();
  renderNotesCards();
}

function getFilteredNotes() {
  const shared = (state.sharedNotes || []).map(n => ({ ...n, type: 'shared' }));
  const priv = (state.privateNotes || [])
    .filter(canUserAccessPrivateNote)
    .map(n => ({ ...n, type: 'private' }));

  let list = [];
  if (activeNotesTab === 'all') {
    list = [...shared, ...priv];
  } else if (activeNotesTab === 'shared') {
    list = shared;
  } else if (activeNotesTab === 'private') {
    list = priv;
  }

  // Filter by search query
  if (notesSearchQuery) {
    list = list.filter(n => {
      const titleMatch = (n.title || '').toLowerCase().includes(notesSearchQuery);
      const contentMatch = stripHtml(n.content || '').toLowerCase().includes(notesSearchQuery);
      const authorMatch = getNoteAuthorLabel(n).toLowerCase().includes(notesSearchQuery);
      return titleMatch || contentMatch || authorMatch;
    });
  }

  // Sort by updated_at descending (latest modified note first)
  list.sort((a, b) => {
    const da = new Date(a.updated_at || a.created_at || 0).getTime();
    const db = new Date(b.updated_at || b.created_at || 0).getTime();
    return db - da;
  });

  return list;
}

function renderNotesView() {
  updateNotesCounter();
  renderNotesCards();
}

function renderNotesCards() {
  const container = document.getElementById('notes-cards-grid');
  const emptyState = document.getElementById('notes-empty-state');
  if (!container) return;

  const notes = getFilteredNotes();

  if (notes.length === 0) {
    container.innerHTML = '';
    container.classList.add('hidden');
    if (emptyState) emptyState.classList.remove('hidden');
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');
  container.classList.remove('hidden');

  container.innerHTML = notes.map(note => {
    const isShared = note.type === 'shared';
    const isOwner = canUserModifyNote(note, note.type);
    const authorEmailOrName = note.created_by || note.created_by_name || 'IT User';
    const imageCount = countNoteImages(note);

    const plainText = stripHtml(note.content || '').trim();
    const snippet = plainText
      ? (plainText.length > 90 ? plainText.substring(0, 90) + '...' : plainText)
      : (imageCount > 0 ? `<em>(${imageCount} foto terlampir)</em>` : '<em>(Belum ada isi catatan)</em>');

    const typeBadge = isShared
      ? `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
          <i class="fa-solid fa-users text-[9px]"></i>
          <span>Note Bersama</span>
        </span>`
      : `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
          <i class="fa-solid fa-lock text-[9px]"></i>
          <span>Note Pribadi (RLS)</span>
        </span>`;

    const ownerBadge = isOwner
      ? `<span class="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 whitespace-nowrap">
          <i class="fa-solid fa-check mr-1"></i>Anda
        </span>`
      : `<span class="text-[10px] text-amber-300 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/25 whitespace-nowrap">
          <i class="fa-solid fa-eye mr-1"></i>Hanya Baca
        </span>`;

    const sharedAuthorLine = isShared
      ? `<div class="flex items-center gap-1.5 text-[11px] text-cyan-300/90 bg-cyan-500/10 border border-cyan-500/20 rounded-lg px-2.5 py-1 mb-2.5">
           <i class="fa-solid fa-user-pen text-[10px] text-cyan-400 flex-shrink-0"></i>
           <span class="truncate" title="${escapeHtml(getNoteAuthorLabel(note))}">Dibuat oleh: <strong class="text-white font-semibold">${escapeHtml(authorEmailOrName)}</strong></span>
         </div>`
      : '';

    const imageCountBadge = imageCount > 0
      ? `<span class="inline-flex items-center gap-1 text-[10px] text-cyan-300 bg-cyan-500/10 border border-cyan-500/25 px-2 py-0.5 rounded-md font-semibold">
           <i class="fa-regular fa-image"></i>${imageCount} Foto
         </span>`
      : '';

    const actionBtn = isOwner
      ? `<button
          type="button"
          onclick="openNoteEditor('${note.id}', '${note.type}')"
          class="flex-1 py-1.5 px-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition flex items-center justify-center gap-1.5 shadow-sm"
        >
          <i class="fa-solid fa-pen-to-square text-amber-400 text-xs"></i>
          <span>Buka / Edit</span>
        </button>`
      : `<button
          type="button"
          onclick="openNoteEditor('${note.id}', '${note.type}')"
          class="flex-1 py-1.5 px-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-cyan-300 text-xs font-semibold border border-slate-700 transition flex items-center justify-center gap-1.5 shadow-sm"
        >
          <i class="fa-solid fa-eye text-cyan-400 text-xs"></i>
          <span>Buka (Baca)</span>
        </button>`;

    const deleteBtn = isOwner
      ? `<button
          type="button"
          onclick="deleteNoteFromCard('${note.id}', '${note.type}')"
          title="Hapus Catatan"
          class="p-1.5 px-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition text-xs flex items-center justify-center"
        >
          <i class="fa-solid fa-trash-can"></i>
        </button>`
      : '';

    const borderClass = isShared ? 'border-cyan' : 'border-amber';

    return `
      <div class="stat-card-modern ${borderClass} p-4 sm:p-5 flex flex-col justify-between group transition duration-300 relative cursor-pointer" onclick="handleCardClick(event, '${note.id}', '${note.type}')">
        <div>
          <!-- Header: Type Badge & Ownership Badge -->
          <div class="flex items-center justify-between gap-2 mb-2.5">
            ${typeBadge}
            ${ownerBadge}
          </div>

          <!-- Title -->
          <h3 class="text-sm sm:text-base font-black text-white group-hover:text-amber-300 transition line-clamp-2 mb-2 tracking-tight">
            ${escapeHtml(note.title || 'Catatan Tanpa Judul')}
          </h3>

          ${sharedAuthorLine}

          <!-- Dates Display -->
          <div class="space-y-1 mb-3 text-[11px] font-mono">
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-1.5 text-amber-300 font-semibold">
                <i class="fa-solid fa-clock-rotate-left text-[10px]"></i>
                <span>Diedit: ${formatNoteDate(note.updated_at || note.created_at)}</span>
              </div>
              ${imageCountBadge}
            </div>
            <div class="flex items-center gap-1.5 text-slate-500">
              <i class="fa-regular fa-calendar-plus text-[10px]"></i>
              <span>Dibuat: ${formatNoteDate(note.created_at)}</span>
            </div>
          </div>

          <!-- Snippet Preview -->
          <p class="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-4 font-sans border-t border-slate-800/80 pt-2.5">
            ${snippet}
          </p>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center gap-2 pt-2 border-t border-slate-800/80 mt-auto" onclick="event.stopPropagation()">
          ${actionBtn}
          ${deleteBtn}
        </div>
      </div>
    `;
  }).join('');
}

function handleCardClick(event, noteId, noteType) {
  openNoteEditor(noteId, noteType);
}

function normalizeEditorColor(rawColor) {
  if (!rawColor) return '';
  const str = String(rawColor).trim().toLowerCase();
  if (str.startsWith('#')) {
    if (str.length === 4) {
      return '#' + str[1] + str[1] + str[2] + str[2] + str[3] + str[3];
    }
    return str;
  }
  const rgbMatch = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!rgbMatch) return str;
  const r = Number(rgbMatch[1]).toString(16).padStart(2, '0');
  const g = Number(rgbMatch[2]).toString(16).padStart(2, '0');
  const b = Number(rgbMatch[3]).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
}

function isSelectionInsideEditorBody() {
  const bodyDiv = document.getElementById('editor-note-body');
  if (!bodyDiv) return false;
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) {
    return document.activeElement === bodyDiv;
  }
  const node = sel.anchorNode;
  return node ? bodyDiv.contains(node) : document.activeElement === bodyDiv;
}

function getCurrentBlockTagInsideEditor() {
  const bodyDiv = document.getElementById('editor-note-body');
  if (!bodyDiv) return '';
  const sel = window.getSelection();
  if (sel && sel.rangeCount > 0) {
    let el = sel.anchorNode;
    if (el && el.nodeType === Node.TEXT_NODE) el = el.parentElement;
    while (el && el !== bodyDiv) {
      const tag = (el.tagName || '').toLowerCase();
      if (['h1', 'h2', 'h3', 'h4', 'blockquote', 'p', 'li', 'pre'].includes(tag)) {
        return tag;
      }
      el = el.parentElement;
    }
  }
  try {
    return String(document.queryCommandValue('formatBlock') || '').replace(/[<>]/g, '').toLowerCase();
  } catch (e) {
    return '';
  }
}

function updateEditorToolbarStates() {
  const toolbar = document.getElementById('editor-toolbar');
  if (!toolbar) return;

  const buttons = toolbar.querySelectorAll('.editor-tool-btn[data-cmd]');
  const insideEditor = isSelectionInsideEditorBody();

  if (!insideEditor || !currentEditingNote || !canUserModifyNote(currentEditingNote, currentEditingNote.type)) {
    buttons.forEach(btn => {
      btn.classList.remove('active', '!text-white');
      btn.setAttribute('aria-pressed', 'false');
    });
    return;
  }

  const currentBlock = getCurrentBlockTagInsideEditor();
  let currentColor = '';
  try {
    currentColor = normalizeEditorColor(document.queryCommandValue('foreColor'));
  } catch (e) {
    currentColor = '';
  }

  buttons.forEach(btn => {
    const cmd = btn.getAttribute('data-cmd');
    const val = (btn.getAttribute('data-val') || '').toLowerCase();
    let isActive = false;

    try {
      if (cmd === 'formatBlock') {
        isActive = currentBlock === val;
      } else if (cmd === 'foreColor') {
        isActive = currentColor !== '' && currentColor === val;
      } else {
        isActive = Boolean(document.queryCommandState(cmd));
      }
    } catch (e) {
      isActive = false;
    }

    btn.classList.toggle('active', isActive);
    if (cmd === 'foreColor') {
      btn.classList.toggle('!text-white', isActive);
    }
    btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });
}

function startNewNote() {
  if (currentEditingNote) {
    saveCurrentNote(true);
  }

  if (activeView !== 'notes') {
    navigateTo('notes');
  }

  const nowIso = new Date().toISOString();
  const isPrivate = activeNotesTab === 'private';
  const userEmail = getActiveUserEmail();

  currentEditingNote = {
    id: (isPrivate ? 'pn-' : 'sn-') + Date.now(),
    type: isPrivate ? 'private' : 'shared',
    title: '',
    content: '',
    images: [],
    created_at: nowIso,
    updated_at: nowIso,
    created_by: userEmail,
    created_by_name: currentUser ? (currentUser.email.split('@')[0]) : 'IT Admin',
    user_id: currentUser ? currentUser.id : 'usr-demo-001',
    isNew: true
  };

  document.getElementById('notes-list-view')?.classList.add('hidden');
  document.getElementById('notes-editor-view')?.classList.remove('hidden');

  const titleInput = document.getElementById('editor-note-title');
  const bodyDiv = document.getElementById('editor-note-body');
  const metaCreated = document.getElementById('editor-meta-created');
  const metaUpdated = document.getElementById('editor-meta-updated');
  const metaAuthor = document.getElementById('editor-meta-author');
  const dateDisplay = document.getElementById('editor-date-display');
  const saveText = document.getElementById('editor-save-text');

  if (titleInput) {
    titleInput.value = '';
    titleInput.disabled = false;
  }
  if (bodyDiv) {
    bodyDiv.innerHTML = '';
    bodyDiv.contentEditable = "true";
  }

  const formattedDate = formatNoteDate(nowIso);
  if (metaCreated) metaCreated.textContent = formattedDate;
  if (metaUpdated) metaUpdated.textContent = formattedDate;
  if (metaAuthor) metaAuthor.textContent = userEmail + ' (Anda)';
  if (dateDisplay) dateDisplay.textContent = formattedDate;

  updateEditorTypePills(currentEditingNote.type, true);

  document.getElementById('editor-readonly-notice')?.classList.add('hidden');
  document.getElementById('editor-toolbar')?.classList.remove('hidden');
  document.getElementById('btn-save-note-now')?.classList.remove('hidden');
  document.getElementById('btn-delete-open-note')?.classList.add('hidden');

  if (saveText) saveText.textContent = 'Catatan Baru (Auto-Save Aktif)';

  updateEditorWordCount();
  updateEditorToolbarStates();

  window.scrollTo({ top: 0, behavior: 'smooth' });
  setTimeout(() => {
    titleInput?.focus();
  }, 100);
}

function openNoteEditor(noteId, noteType) {
  if (currentEditingNote && currentEditingNote.id !== noteId) {
    saveCurrentNote(true);
  }

  if (activeView !== 'notes') {
    navigateTo('notes');
  }

  let note = null;
  if (noteType === 'shared') {
    note = (state.sharedNotes || []).find(n => n.id === noteId);
  } else {
    note = (state.privateNotes || []).find(n => n.id === noteId);
  }

  if (!note) {
    showToast('Catatan tidak ditemukan.', 'error');
    return;
  }

  if (noteType === 'private' && !canUserAccessPrivateNote(note)) {
    showToast('Akses ditolak: Note Pribadi hanya dapat diakses oleh pemiliknya.', 'error');
    return;
  }

  currentEditingNote = { ...note, type: noteType, isNew: false };
  const isOwner = canUserModifyNote(note, noteType);

  document.getElementById('notes-list-view')?.classList.add('hidden');
  document.getElementById('notes-editor-view')?.classList.remove('hidden');

  const titleInput = document.getElementById('editor-note-title');
  const bodyDiv = document.getElementById('editor-note-body');
  const metaCreated = document.getElementById('editor-meta-created');
  const metaUpdated = document.getElementById('editor-meta-updated');
  const metaAuthor = document.getElementById('editor-meta-author');
  const dateDisplay = document.getElementById('editor-date-display');
  const saveText = document.getElementById('editor-save-text');

  if (titleInput) {
    titleInput.value = note.title || '';
    titleInput.disabled = !isOwner;
  }
  if (bodyDiv) {
    bodyDiv.innerHTML = note.content || '';
    bodyDiv.contentEditable = isOwner ? "true" : "false";
  }

  const createdFormatted = formatNoteDate(note.created_at);
  const updatedFormatted = formatNoteDate(note.updated_at || note.created_at);
  const authorLabel = getNoteAuthorLabel(note);

  if (metaCreated) metaCreated.textContent = createdFormatted;
  if (metaUpdated) metaUpdated.textContent = updatedFormatted;
  if (metaAuthor) metaAuthor.textContent = isOwner ? `${authorLabel} (Anda)` : authorLabel;
  if (dateDisplay) dateDisplay.textContent = updatedFormatted;

  updateEditorTypePills(noteType, isOwner);

  const readonlyNotice = document.getElementById('editor-readonly-notice');
  const authorDisplay = document.getElementById('editor-author-display');
  const toolbar = document.getElementById('editor-toolbar');
  const saveBtn = document.getElementById('btn-save-note-now');
  const deleteBtn = document.getElementById('btn-delete-open-note');

  if (!isOwner) {
    if (readonlyNotice) readonlyNotice.classList.remove('hidden');
    if (authorDisplay) authorDisplay.textContent = authorLabel;
    if (toolbar) toolbar.classList.add('hidden');
    if (saveBtn) saveBtn.classList.add('hidden');
    if (deleteBtn) deleteBtn.classList.add('hidden');
    if (saveText) saveText.textContent = 'Mode Hanya-Baca';
  } else {
    if (readonlyNotice) readonlyNotice.classList.add('hidden');
    if (toolbar) toolbar.classList.remove('hidden');
    if (saveBtn) saveBtn.classList.remove('hidden');
    if (deleteBtn) deleteBtn.classList.remove('hidden');
    if (saveText) saveText.textContent = 'Tersimpan Otomatis';
  }

  updateEditorWordCount();
  updateEditorToolbarStates();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateEditorTypePills(type, isOwner) {
  const btnShared = document.getElementById('editor-btn-type-shared');
  const btnPrivate = document.getElementById('editor-btn-type-private');
  const group = document.getElementById('editor-type-selector-group');

  if (!btnShared || !btnPrivate) return;

  if (!isOwner) {
    if (group) group.classList.add('opacity-60', 'pointer-events-none');
  } else {
    if (group) group.classList.remove('opacity-60', 'pointer-events-none');
  }

  if (type === 'shared') {
    btnShared.className = 'px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-sm';
    btnPrivate.className = 'px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white transition flex items-center gap-1.5';
  } else {
    btnShared.className = 'px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white transition flex items-center gap-1.5';
    btnPrivate.className = 'px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-sm';
  }
}

function setEditorNoteType(newType) {
  if (!currentEditingNote) return;

  if (!canUserModifyNote(currentEditingNote, currentEditingNote.type)) {
    showToast('Hanya pembuat note yang dapat mengubah tipe catatan.', 'error');
    return;
  }
  if (currentEditingNote.type === newType) return;

  currentEditingNote.type = newType;
  updateEditorTypePills(newType, true);

  scheduleNoteAutoSave();
  showToast(`Tipe catatan diubah menjadi Note ${newType === 'shared' ? 'Bersama' : 'Pribadi'}.`, 'info');
}

function closeNoteEditor() {
  if (currentEditingNote) {
    if (canUserModifyNote(currentEditingNote, currentEditingNote.type)) {
      saveCurrentNote(true);
    }
    currentEditingNote = null;
  }

  document.getElementById('notes-editor-view')?.classList.add('hidden');
  document.getElementById('notes-list-view')?.classList.remove('hidden');

  updateEditorToolbarStates();
  renderNotesCards();
  updateNotesCounter();
}

function execEditorFormat(command, value = null) {
  if (!currentEditingNote) return;
  if (!canUserModifyNote(currentEditingNote, currentEditingNote.type)) return;

  const bodyDiv = document.getElementById('editor-note-body');
  if (bodyDiv && !isSelectionInsideEditorBody()) {
    bodyDiv.focus();
  }

  if (command === 'formatBlock' && value) {
    const targetTag = value.replace(/[<>]/g, '').toLowerCase();
    const currentTag = getCurrentBlockTagInsideEditor();
    if (currentTag === targetTag && targetTag !== 'p') {
      document.execCommand('formatBlock', false, '<p>');
    } else {
      document.execCommand(command, false, value);
    }
  } else {
    document.execCommand(command, false, value);
  }

  if (bodyDiv) bodyDiv.focus();

  updateEditorToolbarStates();
  requestAnimationFrame(updateEditorToolbarStates);
  updateEditorWordCount();
  scheduleNoteAutoSave();
}

let savedNoteSelectionRange = null;

function saveNoteCursorRange() {
  const bodyDiv = document.getElementById('editor-note-body');
  if (!bodyDiv) return;
  const sel = window.getSelection();
  if (sel && sel.rangeCount > 0) {
    const range = sel.getRangeAt(0);
    if (bodyDiv.contains(range.commonAncestorContainer)) {
      savedNoteSelectionRange = range.cloneRange();
    }
  }
}

function triggerNoteImageUpload() {
  if (!currentEditingNote) return;
  if (!canUserModifyNote(currentEditingNote, currentEditingNote.type)) {
    showToast('Mode Hanya-Baca: Anda tidak memiliki izin menambah foto di catatan ini.', 'error');
    return;
  }
  saveNoteCursorRange();
  const input = document.getElementById('editor-note-image-input');
  if (input) input.click();
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error || new Error('Gagal membaca file gambar.'));
    reader.readAsDataURL(file);
  });
}

function insertImageNodeIntoNoteBody(imageUrl, altText, bucketName) {
  const bodyDiv = document.getElementById('editor-note-body');
  if (!bodyDiv) return;

  const img = document.createElement('img');
  img.src = imageUrl;
  img.alt = altText || 'Foto Catatan IT';
  img.dataset.bucket = bucketName || 'note-images';
  img.dataset.uploadedAt = new Date().toISOString();

  bodyDiv.focus();

  const sel = window.getSelection();
  if (savedNoteSelectionRange && bodyDiv.contains(savedNoteSelectionRange.commonAncestorContainer)) {
    sel.removeAllRanges();
    sel.addRange(savedNoteSelectionRange);
  }

  if (sel && sel.rangeCount > 0 && bodyDiv.contains(sel.getRangeAt(0).commonAncestorContainer)) {
    const range = sel.getRangeAt(0);
    range.deleteContents();
    const spacer = document.createElement('p');
    spacer.appendChild(document.createElement('br'));
    range.insertNode(spacer);
    range.insertNode(img);
    range.setStartAfter(spacer);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  } else {
    bodyDiv.appendChild(img);
    const p = document.createElement('p');
    p.appendChild(document.createElement('br'));
    bodyDiv.appendChild(p);
  }

  savedNoteSelectionRange = null;
}

async function uploadNoteImageFile(file) {
  if (!file || !currentEditingNote) return;
  if (!canUserModifyNote(currentEditingNote, currentEditingNote.type)) return;

  if (!file.type || !file.type.startsWith('image/')) {
    showToast('File harus berupa gambar (PNG, JPG, WEBP, GIF).', 'error');
    return;
  }

  if (file.size > 10 * 1024 * 1024) {
    showToast('Ukuran foto maksimal 10 MB per gambar.', 'error');
    return;
  }

  const insertBtn = document.getElementById('btn-note-insert-image');
  const saveText = document.getElementById('editor-save-text');

  if (insertBtn) insertBtn.disabled = true;
  if (saveText) {
    saveText.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-1 text-cyan-400"></i>Mengunggah foto...`;
  }

  let finalUrl = null;
  let usedBucket = 'local-inline';

  try {
    if (isLiveSupabase && supabaseClient) {
      const extMatch = (file.name || '').split('.').pop();
      const fileExt = extMatch && extMatch.length <= 5 ? extMatch.toLowerCase() : 'png';
      const safeId = String(currentEditingNote.id || 'note').replace(/[^a-zA-Z0-9_-]/g, '');
      const fileName = `${safeId}-${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`;

      // Try primary dedicated bucket 'note-images', fallback automatically to 'photos' if bucket isn't provisioned yet
      const bucketsToTry = [
        { bucket: 'note-images', path: `${fileName}` },
        { bucket: 'photos', path: `notes/${fileName}` }
      ];

      for (const candidate of bucketsToTry) {
        const { error: uploadError } = await supabaseClient
          .storage
          .from(candidate.bucket)
          .upload(candidate.path, file, {
            cacheControl: '3600',
            upsert: true,
            contentType: file.type
          });

        if (!uploadError) {
          const { data: pubData } = supabaseClient
            .storage
            .from(candidate.bucket)
            .getPublicUrl(candidate.path);

          if (pubData && pubData.publicUrl) {
            finalUrl = pubData.publicUrl;
            usedBucket = candidate.bucket;
            break;
          }
        } else {
          console.warn(`[Notes Storage] Upload to bucket "${candidate.bucket}" failed:`, uploadError.message);
        }
      }
    }

    if (!finalUrl) {
      finalUrl = await readFileAsDataURL(file);
      usedBucket = isLiveSupabase ? 'inline-fallback' : 'demo-local';
    }

    insertImageNodeIntoNoteBody(finalUrl, file.name || 'Foto Catatan', usedBucket);
    updateEditorWordCount();
    saveCurrentNote(true);

    if (usedBucket === 'note-images' || usedBucket === 'photos') {
      showToast(`Foto berhasil diunggah ke Supabase Bucket "${usedBucket}"!`, 'success');
    } else {
      showToast('Foto disisipkan & disimpan ke catatan (Mode Lokal).', 'info');
    }
  } catch (err) {
    console.error('[Notes Storage] Unexpected error:', err);
    showToast(`Gagal memproses foto: ${err.message || 'Unknown error'}`, 'error');
  } finally {
    if (insertBtn) insertBtn.disabled = false;
  }
}

async function handleNoteImageUpload(event) {
  const input = event?.target;
  const files = input?.files ? Array.from(input.files) : [];
  if (files.length === 0) return;

  for (const file of files) {
    await uploadNoteImageFile(file);
  }

  if (input) input.value = '';
}

function updateEditorWordCount() {
  const bodyDiv = document.getElementById('editor-note-body');
  const countEl = document.getElementById('editor-word-count');
  if (!bodyDiv || !countEl) return;

  const text = (bodyDiv.innerText || '').trim();
  const chars = text.length;
  const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
  const imgCount = bodyDiv.querySelectorAll('img').length;

  countEl.textContent = imgCount > 0
    ? `${words} kata • ${chars} karakter • ${imgCount} foto`
    : `${words} kata • ${chars} karakter`;
}

function scheduleNoteAutoSave() {
  const saveText = document.getElementById('editor-save-text');
  if (saveText) {
    saveText.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-1"></i>Menyimpan...`;
  }

  clearTimeout(noteAutoSaveTimer);
  noteAutoSaveTimer = setTimeout(() => {
    saveCurrentNote(false);
  }, 700);
}

function saveCurrentNote(isInstant = false) {
  if (!currentEditingNote || (isSavingNote && !isInstant)) return;

  if (!canUserModifyNote(currentEditingNote, currentEditingNote.type)) return; // Strict read-only guard

  const userEmail = getActiveUserEmail();
  const titleInput = document.getElementById('editor-note-title');
  const bodyDiv = document.getElementById('editor-note-body');
  const saveText = document.getElementById('editor-save-text');
  const metaUpdated = document.getElementById('editor-meta-updated');
  const dateDisplay = document.getElementById('editor-date-display');

  const rawTitle = titleInput ? titleInput.value.trim() : '';
  const contentHtml = bodyDiv ? bodyDiv.innerHTML : '';
  const plainText = stripHtml(contentHtml).trim();
  const attachedImages = extractNoteImagesFromBody();

  // If both empty and isNew, don't save empty shell
  if (!rawTitle && !plainText && attachedImages.length === 0 && currentEditingNote.isNew) {
    return;
  }

  const finalTitle = rawTitle || 'Catatan Tanpa Judul';
  const nowIso = new Date().toISOString();

  currentEditingNote.title = finalTitle;
  currentEditingNote.content = contentHtml;
  currentEditingNote.images = attachedImages;
  currentEditingNote.updated_at = nowIso;
  currentEditingNote.updated_by = userEmail;

  if (currentEditingNote.isNew) {
    currentEditingNote.isNew = false;
    document.getElementById('btn-delete-open-note')?.classList.remove('hidden');
  }

  // Update in-memory lists
  if (!state.sharedNotes) state.sharedNotes = [];
  if (!state.privateNotes) state.privateNotes = [];

  const notePayload = {
    id: currentEditingNote.id,
    title: currentEditingNote.title,
    content: currentEditingNote.content,
    images: currentEditingNote.images,
    created_at: currentEditingNote.created_at,
    updated_at: currentEditingNote.updated_at,
    created_by: currentEditingNote.created_by,
    created_by_name: currentEditingNote.created_by_name || (currentUser ? currentUser.email.split('@')[0] : 'IT Admin'),
    updated_by: currentEditingNote.updated_by
  };

  if (currentEditingNote.type === 'shared') {
    state.privateNotes = state.privateNotes.filter(n => n.id !== currentEditingNote.id);
    const idx = state.sharedNotes.findIndex(n => n.id === currentEditingNote.id);
    if (idx !== -1) state.sharedNotes[idx] = notePayload;
    else state.sharedNotes.unshift(notePayload);
  } else {
    state.sharedNotes = state.sharedNotes.filter(n => n.id !== currentEditingNote.id);
    notePayload.user_id = currentEditingNote.user_id || (currentUser ? currentUser.id : 'usr-demo-001');
    const idx = state.privateNotes.findIndex(n => n.id === currentEditingNote.id);
    if (idx !== -1) state.privateNotes[idx] = notePayload;
    else state.privateNotes.unshift(notePayload);
  }

  // Persist local cache immediately
  localStorage.setItem(STORAGE_KEYS.DEMO_DATA, JSON.stringify(state));

  // Sync to Supabase in background
  if (isLiveSupabase && supabaseClient) {
    isSavingNote = true;
    const targetTable = currentEditingNote.type === 'shared' ? 'shared_notes' : 'private_notes';
    const dbRecord = currentEditingNote.type === 'shared'
      ? {
          id: notePayload.id,
          title: notePayload.title,
          content: notePayload.content,
          images: notePayload.images,
          created_at: notePayload.created_at,
          updated_at: notePayload.updated_at,
          created_by: notePayload.created_by,
          created_by_name: notePayload.created_by_name,
          updated_by: notePayload.updated_by
        }
      : {
          id: notePayload.id,
          user_id: notePayload.user_id,
          title: notePayload.title,
          content: notePayload.content,
          images: notePayload.images,
          created_at: notePayload.created_at,
          updated_at: notePayload.updated_at,
          created_by: notePayload.created_by,
          updated_by: notePayload.updated_by
        };

    supabaseClient
      .from(targetTable)
      .upsert(dbRecord)
      .then(async res => {
        if (res.error && String(res.error.message || '').toLowerCase().includes('images')) {
          const fallbackRecord = { ...dbRecord };
          delete fallbackRecord.images;
          await supabaseClient.from(targetTable).upsert(fallbackRecord);
        } else if (res.error) {
          console.warn(`[Notes DB Sync] Failed to upsert to ${targetTable}:`, res.error.message);
        }
        isSavingNote = false;
      })
      .catch(err => {
        isSavingNote = false;
        console.warn(`[Notes DB Sync] Network error:`, err);
      });
  }

  const updatedFormatted = formatNoteDate(nowIso);
  if (metaUpdated) metaUpdated.textContent = updatedFormatted;
  if (dateDisplay) dateDisplay.textContent = updatedFormatted;

  if (saveText) {
    saveText.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-400"></span><span>Tersimpan Otomatis</span>`;
  }

  updateNotesCounter();
}

function deleteCurrentOpenNote() {
  if (!currentEditingNote) return;
  if (!canUserModifyNote(currentEditingNote, currentEditingNote.type)) {
    showToast('Hanya pembuat note yang dapat menghapus catatan ini.', 'error');
    return;
  }

  const title = currentEditingNote.title || 'Catatan';
  if (!confirm(`Apakah Anda yakin ingin menghapus catatan "${title}"?`)) return;

  const id = currentEditingNote.id;
  const type = currentEditingNote.type;

  executeDeleteNote(id, type);

  currentEditingNote = null;
  closeNoteEditor();
}

function deleteNoteFromCard(noteId, noteType) {
  let note = null;
  if (noteType === 'shared') {
    note = (state.sharedNotes || []).find(n => n.id === noteId);
  } else {
    note = (state.privateNotes || []).find(n => n.id === noteId);
  }

  if (!canUserModifyNote(note, noteType)) {
    showToast('Hanya pembuat note yang dapat menghapus catatan ini.', 'error');
    return;
  }

  const title = note ? note.title : 'Catatan';
  if (!confirm(`Apakah Anda yakin ingin menghapus catatan "${title}"?`)) return;

  executeDeleteNote(noteId, noteType);
  renderNotesCards();
  updateNotesCounter();
}

function executeDeleteNote(id, type) {
  const existing = type === 'shared'
    ? (state.sharedNotes || []).find(n => n.id === id)
    : (state.privateNotes || []).find(n => n.id === id);

  if (existing && !canUserModifyNote(existing, type)) {
    showToast('Hanya pembuat note yang dapat menghapus catatan ini.', 'error');
    return;
  }

  if (type === 'shared') {
    state.sharedNotes = (state.sharedNotes || []).filter(n => n.id !== id);
  } else {
    state.privateNotes = (state.privateNotes || []).filter(n => n.id !== id);
  }

  localStorage.setItem(STORAGE_KEYS.DEMO_DATA, JSON.stringify(state));

  if (isLiveSupabase && supabaseClient) {
    const table = type === 'shared' ? 'shared_notes' : 'private_notes';
    supabaseClient.from(table).delete().eq('id', id).then(res => {
      if (res.error) console.warn('Note delete error:', res.error);
    });
  }

  showToast('Catatan berhasil dihapus.', 'info');
}

function initNotesEditorListeners() {
  const titleInput = document.getElementById('editor-note-title');
  const bodyDiv = document.getElementById('editor-note-body');

  if (titleInput) {
    titleInput.addEventListener('input', () => {
      scheduleNoteAutoSave();
    });
    titleInput.addEventListener('focus', () => {
      updateEditorToolbarStates();
    });
  }

  if (bodyDiv) {
    bodyDiv.addEventListener('input', () => {
      updateEditorWordCount();
      updateEditorToolbarStates();
      scheduleNoteAutoSave();
    });

    bodyDiv.addEventListener('keyup', () => {
      updateEditorWordCount();
      updateEditorToolbarStates();
      saveNoteCursorRange();
    });

    bodyDiv.addEventListener('mouseup', () => {
      updateEditorToolbarStates();
      saveNoteCursorRange();
    });

    bodyDiv.addEventListener('focus', () => {
      updateEditorToolbarStates();
    });

    bodyDiv.addEventListener('click', (e) => {
      const target = e.target;
      if (target && target.tagName === 'IMG') {
        const isEditable = bodyDiv.contentEditable === 'true';
        if (!isEditable) {
          openLightbox(target.src, currentEditingNote?.title || 'Lampiran Foto Catatan');
          return;
        }
      }
      updateEditorToolbarStates();
      saveNoteCursorRange();
    });

    bodyDiv.addEventListener('dblclick', (e) => {
      if (e.target && e.target.tagName === 'IMG') {
        openLightbox(e.target.src, currentEditingNote?.title || 'Lampiran Foto Catatan');
      }
    });

    bodyDiv.addEventListener('paste', async (e) => {
      const items = e.clipboardData ? Array.from(e.clipboardData.items || []) : [];
      const imageItem = items.find(it => it.type && it.type.startsWith('image/'));
      if (imageItem) {
        e.preventDefault();
        const file = imageItem.getAsFile();
        if (file) await uploadNoteImageFile(file);
        return;
      }

      setTimeout(() => {
        updateEditorWordCount();
        updateEditorToolbarStates();
        scheduleNoteAutoSave();
      }, 50);
    });

    bodyDiv.addEventListener('dragover', (e) => {
      if (currentEditingNote && canUserModifyNote(currentEditingNote, currentEditingNote.type)) {
        e.preventDefault();
      }
    });

    bodyDiv.addEventListener('drop', async (e) => {
      if (!currentEditingNote || !canUserModifyNote(currentEditingNote, currentEditingNote.type)) return;
      const files = e.dataTransfer ? Array.from(e.dataTransfer.files || []).filter(f => f.type.startsWith('image/')) : [];
      if (files.length > 0) {
        e.preventDefault();
        for (const file of files) {
          await uploadNoteImageFile(file);
        }
      }
    });
  }

  document.addEventListener('selectionchange', () => {
    const editorView = document.getElementById('notes-editor-view');
    if (editorView && !editorView.classList.contains('hidden')) {
      updateEditorToolbarStates();
    }
  });

  // Window beforeunload auto-save
  window.addEventListener('beforeunload', () => {
    if (currentEditingNote && canUserModifyNote(currentEditingNote, currentEditingNote.type)) {
      saveCurrentNote(true);
    }
  });
}

// Window Exports for Notes Engine
window.renderNotesView = renderNotesView;
window.updateNotesCounter = updateNotesCounter;
window.setNotesTab = setNotesTab;
window.handleNotesSearch = handleNotesSearch;
window.startNewNote = startNewNote;
window.openNoteEditor = openNoteEditor;
window.closeNoteEditor = closeNoteEditor;
window.setEditorNoteType = setEditorNoteType;
window.execEditorFormat = execEditorFormat;
window.saveCurrentNote = saveCurrentNote;
window.deleteCurrentOpenNote = deleteCurrentOpenNote;
window.deleteNoteFromCard = deleteNoteFromCard;
window.handleCardClick = handleCardClick;
window.triggerNoteImageUpload = triggerNoteImageUpload;
window.handleNoteImageUpload = handleNoteImageUpload;
window.updateEditorToolbarStates = updateEditorToolbarStates;

// ==============================================================================
// 21. EVENT LISTENERS & APPLICATION BOOTSTRAP
// ==============================================================================
document.addEventListener('DOMContentLoaded', () => {
  startRealTimeDeviceClock();
  initSupabaseClient();
  initSettingsForm();
  initMonthlyView();
  initNotesEditorListeners();

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
