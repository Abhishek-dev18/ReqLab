import { Plus, Trash2 } from 'lucide-react'

interface KeyValueEditorProps {
  pairs: Record<string, string>
  onChange: (pairs: Record<string, string>) => void
  keyPlaceholder?: string
  valuePlaceholder?: string
}

export default function KeyValueEditor({
  pairs,
  onChange,
  keyPlaceholder = 'Key',
  valuePlaceholder = 'Value',
}: KeyValueEditorProps) {
  const entries = Object.entries(pairs)
  const rows = entries.length === 0 ? [['', '']] : entries

  const updateRow = (index: number, key: string, value: string) => {
    const newPairs: Record<string, string> = {}
    rows.forEach(([k, v], i) => {
      if (i === index) {
        if (key) newPairs[key] = value
      } else if (k) {
        newPairs[k] = v
      }
    })
    onChange(newPairs)
  }

  const addRow = () => onChange({ ...pairs, '': '' })

  const removeRow = (index: number) => {
    const newPairs: Record<string, string> = {}
    rows.forEach(([k, v], i) => {
      if (i !== index && k) newPairs[k] = v
    })
    onChange(newPairs)
  }

  return (
    <div className="overflow-hidden rounded border border-pm-border">
      <div className="kv-table-header">
        <span>Key</span>
        <span>Value</span>
        <span />
      </div>
      {rows.map(([key, value], index) => (
        <div key={index} className="kv-table-row hover:bg-pm-hover/30">
          <input
            className="rounded border border-transparent bg-transparent px-2 py-1.5 font-mono text-xs text-pm-text outline-none focus:border-pm-border focus:bg-pm-panel"
            placeholder={keyPlaceholder}
            value={key}
            onChange={(e) => updateRow(index, e.target.value, value)}
          />
          <input
            className="rounded border border-transparent bg-transparent px-2 py-1.5 font-mono text-xs text-pm-text outline-none focus:border-pm-border focus:bg-pm-panel"
            placeholder={valuePlaceholder}
            value={value}
            onChange={(e) => updateRow(index, key, e.target.value)}
          />
          <button
            type="button"
            onClick={() => removeRow(index)}
            className="flex items-center justify-center rounded text-pm-muted hover:bg-pm-hover hover:text-red-400"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addRow}
        className="flex w-full items-center gap-1.5 px-3 py-2 text-xs text-pm-orange hover:bg-pm-hover/30"
      >
        <Plus className="h-3 w-3" />
        Add row
      </button>
    </div>
  )
}
