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
    <div className="space-y-2">
      {rows.map(([key, value], index) => (
        <div key={index} className="flex gap-2">
          <input
            className="input-field flex-1 font-mono text-xs"
            placeholder={keyPlaceholder}
            value={key}
            onChange={(e) => updateRow(index, e.target.value, value)}
          />
          <input
            className="input-field flex-1 font-mono text-xs"
            placeholder={valuePlaceholder}
            value={value}
            onChange={(e) => updateRow(index, key, e.target.value)}
          />
          <button
            type="button"
            onClick={() => removeRow(index)}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-800 hover:text-red-400"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addRow}
        className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300"
      >
        <Plus className="h-3 w-3" />
        Add row
      </button>
    </div>
  )
}
