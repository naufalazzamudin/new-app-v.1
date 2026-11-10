// Pure Stock & Purchase Order Engine for Hotel IT Inventory
export interface MasterItem {
  id: string;
  item_name: string;
  category: string;
  item_code?: string;
  photo_url?: string | null;
  remark?: string | null;
}

export interface StockTransaction {
  id: string;
  item_id: string;
  transaction_date: string;
  quantity: number;
  remark?: string | null;
  type?: string;
  po_id?: string;
  created_by?: string;
  created_at?: string;
}

export interface DepartmentMovement {
  id: string;
  item_id: string;
  department: string;
  type: string;
  quantity: number;
  date: string;
  recipient_name?: string;
  remark?: string;
}

export interface PurchaseOrder {
  id: string;
  po_number?: string;
  item_id?: string;
  item_name: string;
  category: string;
  quantity: number;
  status: 'BELUM DATANG' | 'SUDAH DATANG' | string;
  date_order: string;
  date_arrival?: string | null;
  for_use?: string;
  vendor?: string | null;
  remarks?: string | null;
  inbound_tx_id?: string | null;
  created_by?: string;
  created_at?: string;
}

export function isReductionTx(tx: StockTransaction): boolean {
  if (!tx) return false;
  if (tx.type === 'REDUCTION') return true;
  if (typeof tx.remark === 'string' && (
    tx.remark.startsWith('[PENGURANGAN') ||
    tx.remark.startsWith('[REDUCTION') ||
    tx.remark.includes('PENGURANGAN STOK')
  )) {
    return true;
  }
  return false;
}

export function calculateStockMetrics(
  itemId: string,
  stockTransactions: StockTransaction[],
  departmentMovements: DepartmentMovement[]
) {
  const inbounds = stockTransactions.filter(t => t.item_id === itemId && !isReductionTx(t));
  const totalInbound = inbounds.reduce((sum, t) => sum + (Number(t.quantity) || 0), 0);

  const reductions = stockTransactions.filter(t => t.item_id === itemId && isReductionTx(t));
  const totalReduced = reductions.reduce((sum, t) => sum + (Number(t.quantity) || 0), 0);

  const transfers = departmentMovements.filter(
    m => m.item_id === itemId && (m.type === 'TRANSFER_TO_DEPARTMENT' || m.type === 'TRANSFER TO PC')
  );
  const totalTransferred = transfers.reduce((sum, m) => sum + (Number(m.quantity) || 0), 0);

  const returns = departmentMovements.filter(
    m => m.item_id === itemId && (m.type === 'RETURN_TO_INVENTORY' || m.type === 'RETURN FROM PC')
  );
  const totalReturned = returns.reduce((sum, m) => sum + (Number(m.quantity) || 0), 0);

  const availableStock = Math.max(0, totalInbound - totalReduced - totalTransferred + totalReturned);

  return {
    totalInbound,
    totalReduced,
    totalTransferred,
    totalReturned,
    availableStock
  };
}

export function applyPOArrivalToInventory(
  po: PurchaseOrder,
  state: {
    masterItems: MasterItem[];
    stockTransactions: StockTransaction[];
  },
  actorEmail: string = 'admin@hotel.com'
): { tx: StockTransaction; isNew: boolean } {
  // 1. Resolve matching master item
  let item = state.masterItems.find(i => i.id === po.item_id);
  if (!item && po.item_name) {
    item = state.masterItems.find(i => i.item_name.toLowerCase() === po.item_name.toLowerCase());
  }

  if (!item) {
    item = {
      id: po.item_id || `item-po-${po.id}`,
      item_name: po.item_name,
      category: po.category || 'PC ITEMS',
      item_code: `SKU-${(po.category || 'IT').substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      remark: `Auto-created from PO ${po.po_number || ''}`
    };
    state.masterItems.push(item);
  }

  const arrivalDate = po.date_arrival || new Date().toISOString().split('T')[0];
  po.date_arrival = arrivalDate;
  po.status = 'SUDAH DATANG';

  const txId = po.inbound_tx_id || `tx-po-${po.id}`;
  const existingIdx = state.stockTransactions.findIndex(
    t => t.id === txId || t.id === `tx-po-${po.id}` || (t.po_id && t.po_id === po.id)
  );

  const remark = `[PO SUDAH DATANG] ${po.po_number || 'PO'}: ${item.item_name} (+${po.quantity} unit)${po.vendor ? ' dari ' + po.vendor : ''}${po.for_use ? ' [Peruntukan: ' + po.for_use + ']' : ''}`.trim();

  if (existingIdx !== -1) {
    const existingTx = state.stockTransactions[existingIdx];
    existingTx.item_id = item.id;
    existingTx.quantity = Number(po.quantity) || 1;
    existingTx.transaction_date = arrivalDate;
    existingTx.remark = remark;
    po.inbound_tx_id = existingTx.id;
    return { tx: existingTx, isNew: false };
  }

  const newTx: StockTransaction = {
    id: txId,
    po_id: po.id,
    item_id: item.id,
    transaction_date: arrivalDate,
    quantity: Number(po.quantity) || 1,
    remark: remark,
    created_by: actorEmail,
    created_at: new Date().toISOString()
  };

  po.inbound_tx_id = newTx.id;
  state.stockTransactions.unshift(newTx);
  return { tx: newTx, isNew: true };
}

export function revertPOArrivalFromInventory(
  po: PurchaseOrder,
  state: { stockTransactions: StockTransaction[] }
): boolean {
  const txId = po.inbound_tx_id || `tx-po-${po.id}`;
  const prevLen = state.stockTransactions.length;
  state.stockTransactions = state.stockTransactions.filter(
    t => t.id !== txId && t.id !== `tx-po-${po.id}` && t.po_id !== po.id
  );
  po.inbound_tx_id = null;
  po.status = 'BELUM DATANG';
  po.date_arrival = null;
  return state.stockTransactions.length < prevLen;
}
