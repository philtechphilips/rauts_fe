import type { Header } from '@/types/dashboard-ui';

export function HeaderTable({
  rows,
  getValue,
  onValueChange,
}: {
  rows: Header[];
  getValue?: (h: Header) => string;
  onValueChange?: (h: Header, value: string) => void;
}) {
  if (!rows.length) return (
    <p className="px-4 py-3 text-[12px] italic" style={{ color: 'rgba(255,255,255,0.2)' }}>No custom headers</p>
  );
  const valueFor = (h: Header) => (getValue ? getValue(h) : h.value);
  return (
    <table className="w-full text-[12px]">
      <thead>
        <tr className="border-b" style={{ borderColor: '#3E3E3E' }}>
          <th className="w-8 py-2 px-3" />
          {['Key', 'Value'].map(h => (
            <th key={h} className="py-2 px-3 text-left font-medium" style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map(h => (
          <tr key={h.key} className="border-b transition-colors" style={{ borderColor: '#2A2A2A' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = '#242424')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}>
            <td className="py-2 px-3"><input type="checkbox" defaultChecked style={{ accentColor: '#CFFE26' }} /></td>
            <td className="py-2 px-3 font-mono" style={{ color: 'rgba(255,255,255,0.75)' }}>{h.key}</td>
            <td className="py-2 px-3">
              {onValueChange ? (
                <input
                  type="text"
                  className="w-full min-w-[100px] max-w-[320px] px-2 py-1 rounded border font-mono text-[12px] outline-none select-text"
                  style={{ background: '#1A1A1A', borderColor: '#3A3A3A', color: 'rgba(255,255,255,0.55)' }}
                  value={valueFor(h)}
                  onChange={(e) => onValueChange(h, e.target.value)}
                />
              ) : (
                <span style={{ color: 'rgba(255,255,255,0.45)' }}>{valueFor(h)}</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
