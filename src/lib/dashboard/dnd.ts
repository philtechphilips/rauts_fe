import type React from 'react';

export const DND_MIME = 'application/x-rauts-dnd';

export type DndPayload =
  | { kind: 'collection'; id: string }
  | { kind: 'folder'; colId: string; folderName: string }
  | { kind: 'endpoint'; colId: string; folderName: string; epId: string };

export function parseDndPayload(e: React.DragEvent): DndPayload | null {
  try {
    const raw = e.dataTransfer.getData(DND_MIME);
    if (!raw) return null;
    return JSON.parse(raw) as DndPayload;
  } catch {
    return null;
  }
}

/** Move `fromIndex` to sit immediately before `toIndex` (both refer to the original array). */
export function reorderByInsertBefore<T>(items: T[], fromIndex: number, toIndex: number): T[] {
  if (fromIndex === toIndex) return [...items];
  const next = [...items];
  const [removed] = next.splice(fromIndex, 1);
  let insert = toIndex;
  if (fromIndex < toIndex) insert = toIndex - 1;
  next.splice(insert, 0, removed);
  return next;
}
