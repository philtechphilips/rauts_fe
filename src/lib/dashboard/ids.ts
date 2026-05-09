export function projectIdFromCollectionId(collectionId: string): string | null {
  const m = /^col-([0-9a-fA-F-]+)$/.exec(collectionId);
  if (m) return m[1];
  const fallback = /^col-(.+)$/.exec(collectionId);
  return fallback ? fallback[1] : null;
}

export function endpointNumericId(endpointId: string): string | null {
  const m = /^ep-([0-9a-fA-F-]+)$/.exec(endpointId);
  if (m) return m[1];
  const fallback = /^ep-(.+)$/.exec(endpointId);
  return fallback ? fallback[1] : null;
}
