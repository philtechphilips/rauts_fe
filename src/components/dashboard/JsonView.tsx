import React from 'react';

/** Single <pre> so users can drag-select / copy across lines (parent layout may use select-none). */
export function JsonView({ value }: { value: unknown }) {
  if (value === null || value === undefined)
    return (
      <span className="italic select-text cursor-text" style={{ color: 'rgba(255,255,255,0.2)' }}>
        No body
      </span>
    );

  const json = JSON.stringify(value, null, 2);
  const lines = json.split('\n').map((line, i) => {
    const colored = line
      .replace(/"([^"]+)"(?=\s*:)/g, '<span style="color:#61AFFE">"$1"</span>')
      .replace(/:\s*"([^"]*)"/g, ': <span style="color:#CE9178">"$1"</span>')
      .replace(/:\s*(\d+\.?\d*)/g, ': <span style="color:#B5CEA8">$1</span>')
      .replace(/:\s*(true|false)/g, ': <span style="color:#569CD6">$1</span>')
      .replace(/:\s*(null)/g, ': <span style="color:#569CD6">$1</span>');
    return (
      <React.Fragment key={i}>
        {i > 0 ? '\n' : null}
        <span dangerouslySetInnerHTML={{ __html: colored }} />
      </React.Fragment>
    );
  });
  return (
    <pre
      className="m-0 p-0 bg-transparent border-none whitespace-pre select-text cursor-text font-inherit text-inherit leading-[1.7]"
      style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}
    >
      {lines}
    </pre>
  );
}
