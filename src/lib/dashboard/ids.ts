export function projectIdFromCollectionId(collectionId: string): number | null {
  const m = /^col-(\d+)$/.exec(collectionId);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : null;
}

export function endpointNumericId(endpointId: string): number | null {
  const m = /^ep-(\d+)$/.exec(endpointId);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : null;
}
