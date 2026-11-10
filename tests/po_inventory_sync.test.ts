import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateStockMetrics,
  applyPOArrivalToInventory,
  revertPOArrivalFromInventory,
  isReductionTx,
  type MasterItem,
  type StockTransaction,
  type DepartmentMovement,
  type PurchaseOrder
} from '../src/utils/po_inventory_engine';

test('isReductionTx identifies reduction vs normal inbound and PO transactions', () => {
  const normalInbound: StockTransaction = {
    id: 'tx-1',
    item_id: 'item-1',
    transaction_date: '2026-11-09',
    quantity: 10,
    remark: 'Restock supplier'
  };
  const poArrival: StockTransaction = {
    id: 'tx-po-1',
    item_id: 'item-1',
    transaction_date: '2026-11-09',
    quantity: 5,
    remark: '[PO SUDAH DATANG] PO-2026-101: SSD 512GB (5 unit)'
  };
  const reductionTx: StockTransaction = {
    id: 'tx-red-1',
    item_id: 'item-1',
    transaction_date: '2026-11-09',
    quantity: 2,
    remark: '[PENGURANGAN STOK] Rusak'
  };

  assert.equal(isReductionTx(normalInbound), false);
  assert.equal(isReductionTx(poArrival), false);
  assert.equal(isReductionTx(reductionTx), true);
});

test('PO arrival automatically adds to stock and increases availableStock in real-time', () => {
  const masterItem: MasterItem = {
    id: 'item-ssd-1',
    item_name: 'SSD Samsung 512GB',
    category: 'PC ITEMS',
    item_code: 'SKU-SSD-01'
  };

  const state = {
    masterItems: [masterItem],
    stockTransactions: [] as StockTransaction[],
    departmentMovements: [] as DepartmentMovement[]
  };

  // Initially: 0 stock
  const initialMetrics = calculateStockMetrics(masterItem.id, state.stockTransactions, state.departmentMovements);
  assert.equal(initialMetrics.totalInbound, 0);
  assert.equal(initialMetrics.availableStock, 0);

  // User creates PO for 10 units and marks it arrived
  const po: PurchaseOrder = {
    id: 'po-test-1',
    po_number: 'PO-2026-888',
    item_id: masterItem.id,
    item_name: masterItem.item_name,
    category: masterItem.category,
    quantity: 10,
    status: 'BELUM DATANG',
    date_order: '2026-11-01',
    vendor: 'Tokopedia IT Store'
  };

  // Apply arrival
  const result = applyPOArrivalToInventory(po, state, 'admin@hotel.com');
  assert.equal(result.isNew, true);
  assert.equal(po.status, 'SUDAH DATANG');
  assert.ok(po.date_arrival);
  assert.equal(state.stockTransactions.length, 1);
  assert.equal(state.stockTransactions[0].quantity, 10);
  assert.equal(state.stockTransactions[0].item_id, masterItem.id);

  // Verify stock recalculated
  const updatedMetrics = calculateStockMetrics(masterItem.id, state.stockTransactions, state.departmentMovements);
  assert.equal(updatedMetrics.totalInbound, 10);
  assert.equal(updatedMetrics.availableStock, 10);
});

test('Calling applyPOArrivalToInventory multiple times is idempotent (prevents duplicate stock)', () => {
  const masterItem: MasterItem = {
    id: 'item-ram-1',
    item_name: 'RAM DDR4 16GB',
    category: 'PC ITEMS'
  };

  const state = {
    masterItems: [masterItem],
    stockTransactions: [] as StockTransaction[],
    departmentMovements: [] as DepartmentMovement[]
  };

  const po: PurchaseOrder = {
    id: 'po-ram-1',
    po_number: 'PO-2026-555',
    item_id: masterItem.id,
    item_name: masterItem.item_name,
    category: masterItem.category,
    quantity: 4,
    status: 'BELUM DATANG',
    date_order: '2026-11-05'
  };

  // First arrival
  applyPOArrivalToInventory(po, state, 'admin@hotel.com');
  assert.equal(state.stockTransactions.length, 1);
  let metrics = calculateStockMetrics(masterItem.id, state.stockTransactions, state.departmentMovements);
  assert.equal(metrics.availableStock, 4);

  // Second arrival call (e.g. repeated click or sync)
  const secondResult = applyPOArrivalToInventory(po, state, 'admin@hotel.com');
  assert.equal(secondResult.isNew, false);
  assert.equal(state.stockTransactions.length, 1); // Still only 1 transaction
  metrics = calculateStockMetrics(masterItem.id, state.stockTransactions, state.departmentMovements);
  assert.equal(metrics.availableStock, 4); // Did not double to 8
});

test('Updating PO quantity while arrived synchronizes stock transaction quantity', () => {
  const masterItem: MasterItem = {
    id: 'item-mouse-1',
    item_name: 'Mouse Logitech G102',
    category: 'PC ITEMS'
  };

  const state = {
    masterItems: [masterItem],
    stockTransactions: [] as StockTransaction[],
    departmentMovements: [] as DepartmentMovement[]
  };

  const po: PurchaseOrder = {
    id: 'po-mouse-1',
    item_id: masterItem.id,
    item_name: masterItem.item_name,
    category: masterItem.category,
    quantity: 5,
    status: 'SUDAH DATANG',
    date_order: '2026-11-08'
  };

  applyPOArrivalToInventory(po, state);
  let metrics = calculateStockMetrics(masterItem.id, state.stockTransactions, state.departmentMovements);
  assert.equal(metrics.availableStock, 5);

  // PO is edited: quantity changed from 5 to 8
  po.quantity = 8;
  applyPOArrivalToInventory(po, state);
  assert.equal(state.stockTransactions.length, 1);
  assert.equal(state.stockTransactions[0].quantity, 8);

  metrics = calculateStockMetrics(masterItem.id, state.stockTransactions, state.departmentMovements);
  assert.equal(metrics.availableStock, 8);
});

test('Reverting arrived PO status rolls back stock from inventory', () => {
  const masterItem: MasterItem = {
    id: 'item-switch-1',
    item_name: 'Cisco Gigabit Switch 24-Port',
    category: 'NETWORK ITEMS'
  };

  const state = {
    masterItems: [masterItem],
    stockTransactions: [] as StockTransaction[],
    departmentMovements: [] as DepartmentMovement[]
  };

  const po: PurchaseOrder = {
    id: 'po-switch-1',
    item_id: masterItem.id,
    item_name: masterItem.item_name,
    category: masterItem.category,
    quantity: 2,
    status: 'BELUM DATANG',
    date_order: '2026-11-02'
  };

  // Arrive
  applyPOArrivalToInventory(po, state);
  assert.equal(calculateStockMetrics(masterItem.id, state.stockTransactions, state.departmentMovements).availableStock, 2);

  // User reverts PO to BELUM DATANG
  const reverted = revertPOArrivalFromInventory(po, state);
  assert.equal(reverted, true);
  assert.equal(po.status, 'BELUM DATANG');
  assert.equal(po.inbound_tx_id, null);
  assert.equal(state.stockTransactions.length, 0);

  // Available stock returns to 0
  assert.equal(calculateStockMetrics(masterItem.id, state.stockTransactions, state.departmentMovements).availableStock, 0);
});
