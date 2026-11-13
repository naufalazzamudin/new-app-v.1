import test from 'node:test';
import assert from 'node:assert/strict';
import {
  canUserModifyNote,
  canUserAccessPrivateNote,
  getNoteAuthorLabel,
  countNoteImages,
  filterMonthlyPCMovements,
  type NoteRecord,
  type PCMovementRecord,
  type PCComponentMovementRecord
} from '../src/utils/notes_and_recap';

test('Shared Note (Note Bersama) can only be edited/deleted by its creator', () => {
  const sharedNote: NoteRecord = {
    id: 'sn-001',
    type: 'shared',
    title: 'SOP Hardware Hotel',
    content: '<p>Checklist harian</p>',
    created_by: 'admin@hotel.com',
    created_by_name: 'IT Admin Hotel'
  };

  // Creator can edit/delete
  assert.equal(
    canUserModifyNote(sharedNote, 'shared', { id: 'usr-1', email: 'admin@hotel.com' }),
    true
  );
  // Case-insensitive creator email also allowed
  assert.equal(
    canUserModifyNote(sharedNote, 'shared', { id: 'usr-1', email: 'Admin@Hotel.com' }),
    true
  );

  // Another user can NOT edit/delete Note Bersama created by admin@hotel.com
  assert.equal(
    canUserModifyNote(sharedNote, 'shared', { id: 'usr-2', email: 'staff.it@hotel.com' }),
    false
  );

  // Author created by staff.it cannot be modified by admin
  const staffNote: NoteRecord = {
    id: 'sn-002',
    type: 'shared',
    title: 'Catatan Shift Malam',
    content: '<p>Printer FO restart</p>',
    created_by: 'staff.it@hotel.com'
  };
  assert.equal(
    canUserModifyNote(staffNote, 'shared', { id: 'usr-1', email: 'admin@hotel.com' }),
    false
  );
  assert.equal(
    canUserModifyNote(staffNote, 'shared', { id: 'usr-2', email: 'staff.it@hotel.com' }),
    true
  );
});

test('Private Note (Note Pribadi) is strictly isolated to its owner', () => {
  const privateNote: NoteRecord = {
    id: 'pn-001',
    user_id: 'usr-demo-001',
    type: 'private',
    title: 'Agenda Pribadi',
    content: '<p>Rahasia</p>',
    created_by: 'admin@hotel.com'
  };

  assert.equal(
    canUserAccessPrivateNote(privateNote, { id: 'usr-demo-001', email: 'admin@hotel.com' }),
    true
  );
  assert.equal(
    canUserAccessPrivateNote(privateNote, { id: 'usr-other-999', email: 'other@hotel.com' }),
    false
  );
  assert.equal(
    canUserModifyNote(privateNote, 'private', { id: 'usr-other-999', email: 'other@hotel.com' }),
    false
  );
});

test('getNoteAuthorLabel formats author display clearly for Note Bersama', () => {
  assert.equal(
    getNoteAuthorLabel({
      id: 'sn-1',
      title: 'A',
      content: '',
      created_by: 'naufal@hotel.com',
      created_by_name: 'Naufal IT'
    }),
    'Naufal IT (naufal@hotel.com)'
  );
  assert.equal(
    getNoteAuthorLabel({
      id: 'sn-2',
      title: 'B',
      content: '',
      created_by: 'it.support@hotel.com',
      created_by_name: 'it.support@hotel.com'
    }),
    'it.support@hotel.com'
  );
});

test('countNoteImages counts attached images from metadata array or inline <img> HTML', () => {
  assert.equal(
    countNoteImages({
      id: 'sn-img-1',
      title: 'Foto Rak Server',
      content: '<p>Cek kabel</p><img src="https://example.supabase.co/storage/v1/object/public/note-images/a.jpg">',
      images: [{ url: 'https://example.supabase.co/storage/v1/object/public/note-images/a.jpg', bucket: 'note-images' }]
    }),
    1
  );

  assert.equal(
    countNoteImages({
      id: 'sn-img-2',
      title: 'Foto Dual',
      content: '<img src="data:image/png;base64,abc"><img src="https://x/y.png">'
    }),
    2
  );
});

test('filterMonthlyPCMovements filters both PC and component movements by YYYY-MM', () => {
  const pcMovements: PCMovementRecord[] = [
    {
      id: 'pcm-1',
      timestamp: '2026-11-05 14:20:00',
      pc_name: 'PC-FO-01',
      action_type: 'DEPLOY_TO_DEPARTMENT',
      from_location: 'IT Storage',
      to_location: 'Front Office',
      actor: 'admin@hotel.com'
    },
    {
      id: 'pcm-2',
      timestamp: '2026-10-28 09:10:00',
      pc_name: 'PC-ACC-02',
      action_type: 'CREATE_PC',
      from_location: 'Assembly',
      to_location: 'IT Storage',
      actor: 'admin@hotel.com'
    }
  ];

  const compMovements: PCComponentMovementRecord[] = [
    {
      id: 'ccm-1',
      timestamp: '2026-11-06 10:00:00',
      pc_name: 'PC-FO-01',
      slot_name: 'RAM Slot 2',
      item_name: 'RAM DDR4 16GB',
      action_type: 'PASANG_DARI_INVENTORY',
      actor: 'admin@hotel.com'
    },
    {
      id: 'ccm-2',
      timestamp: '2026-09-12 11:30:00',
      pc_name: 'PC-ENG-01',
      slot_name: 'Storage',
      item_name: 'SSD 512GB',
      action_type: 'RETURN_TO_INVENTORY',
      actor: 'admin@hotel.com'
    }
  ];

  const nov = filterMonthlyPCMovements(pcMovements, compMovements, '2026-11');
  assert.equal(nov.pcMovements.length, 1);
  assert.equal(nov.pcMovements[0].id, 'pcm-1');
  assert.equal(nov.compMovements.length, 1);
  assert.equal(nov.compMovements[0].id, 'ccm-1');

  const oct = filterMonthlyPCMovements(pcMovements, compMovements, '2026-10');
  assert.equal(oct.pcMovements.length, 1);
  assert.equal(oct.pcMovements[0].id, 'pcm-2');
  assert.equal(oct.compMovements.length, 0);
});
