import type { Param } from '@/types/dashboard-ui';

export function ParamTable({
  rows,
  label,
  getValue,
  onValueChange,
}: {
  rows: Param[];
  label: string;
  getValue?: (p: Param) => string;
  onValueChange?: (p: Param, value: string) => void;
}) {
  if (!rows.length) return (
    <p className="px-4 py-3 text-[12px] italic" style={{ color: 'rgba(255,255,255,0.2)' }}>No {label.toLowerCase()}</p>
  );
  const valueFor = (p: Param) => (getValue ? getValue(p) : p.value || `{{${p.name}}}`);
  return (
    <table className="w-full text-[12px]">
      <thead>
        <tr className="border-b" style={{ borderColor: '#3E3E3E' }}>
          <th className="w-8 py-2 px-3" />
          {['Key', 'Value', 'Description'].map(h => (
            <th key={h} className="py-2 px-3 text-left font-medium" style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map(p => (
          <tr key={p.name} className="border-b group/row transition-colors" style={{ borderColor: '#2A2A2A' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = '#242424')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}>
            <td className="py-2 px-3"><input type="checkbox" defaultChecked={p.required !== false} style={{ accentColor: '#CFFE26' }} /></td>
            <td className="py-2 px-3 font-mono" style={{ color: '#61AFFE' }}>{p.name}</td>
            <td className="py-2 px-3">
              {onValueChange ? (
                <input
                  type="text"
                  className="w-full min-w-[100px] max-w-[280px] px-2 py-1 rounded border font-mono text-[12px] outline-none select-text"
                  style={{ background: '#1A1A1A', borderColor: '#3A3A3A', color: 'rgba(255,255,255,0.65)' }}
                  value={valueFor(p)}
                  onChange={(e) => onValueChange(p, e.target.value)}
                />
              ) : (
                <span style={{ color: 'rgba(255,255,255,0.6)' }}>{valueFor(p)}</span>
              )}
            </td>
            <td className="py-2 px-3" style={{ color: 'rgba(255,255,255,0.3)' }}>{p.description}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
