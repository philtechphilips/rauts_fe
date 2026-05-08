'use client';

import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView } from '@codemirror/view';

/** Matches dashboard panel chrome; layered after oneDark for background/gutter tweaks */
const rautsShell = EditorView.theme(
  {
    '&': { backgroundColor: '#181818' },
    '.cm-editor': { borderRadius: '8px', outline: 'none' },
    '.cm-editor.cm-focused': { outline: 'none' },
    '.cm-scroller': {
      fontFamily:
        'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
      lineHeight: '1.65',
    },
    '.cm-content': { paddingBlock: '12px', caretColor: '#CFFE26' },
    '.cm-cursor, .cm-dropCursor': { borderLeftColor: '#CFFE26' },
    '.cm-activeLine': { backgroundColor: 'rgba(255,255,255,0.04)' },
    '.cm-gutters': {
      backgroundColor: '#141414',
      borderRight: '1px solid #3A3A3A',
      color: 'rgba(255,255,255,0.28)',
    },
    '.cm-activeLineGutter': { backgroundColor: 'rgba(207,254,38,0.07)' },
    '.cm-selectionBackground': { background: 'rgba(207,254,38,0.18)' },
    '&.cm-focused .cm-selectionBackground': { background: 'rgba(207,254,38,0.22)' },
    '.cm-foldPlaceholder': {
      background: 'rgba(255,255,255,0.06)',
      border: 'none',
      color: 'rgba(255,255,255,0.45)',
    },
  },
  { dark: true },
);

export function JsonBodyEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <div className="rounded-lg overflow-hidden border" style={{ borderColor: '#3A3A3A' }}>
      <CodeMirror
        value={value}
        theme="none"
        height="280px"
        indentWithTab
        extensions={[json(), oneDark, rautsShell]}
        onChange={onChange}
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          highlightActiveLine: true,
          highlightActiveLineGutter: true,
          bracketMatching: true,
          closeBrackets: true,
          indentOnInput: true,
          tabSize: 2,
          autocompletion: false,
          highlightSelectionMatches: true,
        }}
      />
    </div>
  );
}
