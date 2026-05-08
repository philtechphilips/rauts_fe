import { METHOD_COLOR } from '@/lib/dashboard/format';

export function MethodBadge({ method, size = 'sm' }: { method: string; size?: 'sm' | 'md' }) {
  const cls = size === 'md'
    ? 'text-[12px] font-bold w-[52px]'
    : 'text-[11px] font-bold w-11 shrink-0';
  return <span className={cls} style={{ color: METHOD_COLOR[method] ?? '#888' }}>{method}</span>;
}
