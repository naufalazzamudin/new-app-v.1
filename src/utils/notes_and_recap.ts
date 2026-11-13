export interface NoteRecord {
  id: string;
  user_id?: string | null;
  type?: 'shared' | 'private';
  title: string;
  content: string;
  images?: Array<{ url: string; bucket?: string; uploaded_at?: string }>;
  created_at?: string;
  updated_at?: string;
  created_by?: string | null;
  created_by_name?: string | null;
}

export interface SessionUser {
  id?: string | null;
  email?: string | null;
}

export interface PCMovementRecord {
  id: string;
  timestamp?: string;
  created_at?: string;
  pc_name: string;
  action_type: string;
  from_location: string;
  to_location: string;
  actor: string;
  notes?: string;
}

export interface PCComponentMovementRecord {
  id: string;
  timestamp?: string;
  created_at?: string;
  pc_name: string;
  slot_name: string;
  item_name: string;
  action_type: string;
  related_pc_name?: string;
  actor: string;
  notes?: string;
}

export function normalizeUserEmail(email?: string | null): string {
  return (email || '').toLowerCase().trim();
}

export function canUserAccessPrivateNote(
  note: NoteRecord | null | undefined,
  currentUser: SessionUser | null | undefined
): boolean {
  if (!note) return false;
  const userEmail = normalizeUserEmail(currentUser?.email);
  const owner = normalizeUserEmail(note.created_by);
  if (currentUser?.id && note.user_id && note.user_id === currentUser.id) return true;
  return owner !== '' && userEmail !== '' && owner === userEmail;
}

export function canUserModifyNote(
  note: NoteRecord | null | undefined,
  noteType: 'shared' | 'private' | undefined,
  currentUser: SessionUser | null | undefined
): boolean {
  if (!note) return false;
  const resolvedType = noteType || note.type || 'shared';
  const userEmail = normalizeUserEmail(currentUser?.email);
  const noteAuthor = normalizeUserEmail(note.created_by);

  if (resolvedType === 'private') {
    return canUserAccessPrivateNote(note, currentUser);
  }

  // Note Bersama (shared): strictly only the creator user can edit or delete
  return noteAuthor !== '' && userEmail !== '' && noteAuthor === userEmail;
}

export function getNoteAuthorLabel(note: NoteRecord | null | undefined): string {
  if (!note) return 'IT User';
  const email = (note.created_by || '').trim();
  const name = (note.created_by_name || '').trim();
  if (name && email && name.toLowerCase() !== email.toLowerCase()) {
    return `${name} (${email})`;
  }
  return email || name || 'IT User';
}

export function countNoteImages(note: NoteRecord | null | undefined): number {
  if (!note) return 0;
  if (Array.isArray(note.images) && note.images.length > 0) return note.images.length;
  const html = String(note.content || '');
  const matches = html.match(/<img\b[^>]*>/gi);
  return matches ? matches.length : 0;
}

export function filterMonthlyPCMovements(
  pcMovements: PCMovementRecord[],
  compMovements: PCComponentMovementRecord[],
  ym: string
): {
  pcMovements: PCMovementRecord[];
  compMovements: PCComponentMovementRecord[];
} {
  const matchesMonth = (m: { timestamp?: string; created_at?: string }) => {
    const raw = String(m.timestamp || m.created_at || '');
    return raw.startsWith(ym);
  };
  return {
    pcMovements: (pcMovements || []).filter(matchesMonth),
    compMovements: (compMovements || []).filter(matchesMonth)
  };
}
