import { interpolateTemplates } from '@/lib/dashboard/workspace-environments';

/** Repeatedly replaces `{{var}}` until stable or max iterations (handles nested refs). */
export function interpolateDeep(input: string, vars: Record<string, string>, maxIterations = 12): string {
  let out = input;
  for (let i = 0; i < maxIterations; i++) {
    const next = interpolateTemplates(out, vars);
    if (next === out) break;
    out = next;
  }
  return out;
}

/** Resolve cross-references between variable values (e.g. token uses {{envSecret}}). */
export function resolveVariableMap(vars: Record<string, string>): Record<string, string> {
  let cur = { ...vars };
  for (let i = 0; i < 12; i++) {
    const next: Record<string, string> = {};
    let changed = false;
    for (const [k, v] of Object.entries(cur)) {
      const nv = interpolateTemplates(v, cur);
      next[k] = nv;
      if (nv !== v) changed = true;
    }
    cur = next;
    if (!changed) break;
  }
  return cur;
}
