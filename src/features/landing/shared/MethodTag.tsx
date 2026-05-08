import { METHOD_COLOR } from '../data';

export function MethodTag({ method }: { method: string }) {
  return (
    <span
      className="text-[11px] font-bold w-14 shrink-0"
      style={{ color: METHOD_COLOR[method] ?? '#888' }}
    >
      {method}
    </span>
  );
}
