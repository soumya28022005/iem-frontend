// src/components/deploy/EnvEditor.jsx
import { useState } from 'react';
import { Plus, Trash2, Eye, EyeOff, Lock } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export default function EnvEditor({ detectedVars = [], value = {}, onChange }) {
  const [showValues, setShowValues] = useState({});
  const [custom, setCustom] = useState([{ key: '', value: '' }]);

  function handleDetectedChange(key, val) {
    onChange?.({ ...value, [key]: val });
  }

  function handleCustomChange(index, field, val) {
    const updated = [...custom];
    updated[index][field] = val;
    setCustom(updated);

    // Sync to parent
    const customObj = {};
    updated.forEach(({ key, value: v }) => { if (key) customObj[key] = v; });
    onChange?.({ ...value, ...customObj });
  }

  function addRow() {
    setCustom(prev => [...prev, { key: '', value: '' }]);
  }

  function removeRow(i) {
    const updated = custom.filter((_, idx) => idx !== i);
    setCustom(updated);
    const customObj = {};
    updated.forEach(({ key, value: v }) => { if (key) customObj[key] = v; });
    onChange?.({ ...value, ...customObj });
  }

  function toggleShow(key) {
    setShowValues(prev => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="space-y-4">
      {/* Detected vars from .env.example */}
      {detectedVars.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <p className="text-xs font-medium text-gray-400">Detected from .env.example</p>
            <Badge color="gray" size="xs">{detectedVars.length} vars</Badge>
          </div>

          <div className="space-y-2">
            {detectedVars.map((v) => (
              <div key={v.key} className="flex items-center gap-2">
                {/* Key */}
                <div className="flex items-center gap-1.5 w-44 flex-shrink-0">
                  <Lock size={11} className="text-gray-600 flex-shrink-0" />
                  <code className="text-xs font-mono text-gray-300 truncate">{v.key}</code>
                  {v.required && (
                    <span className="text-2xs text-red-400 flex-shrink-0">*</span>
                  )}
                </div>

                {/* Value input */}
                <div className="flex-1 relative">
                  <input
                    type={showValues[v.key] ? 'text' : 'password'}
                    value={value[v.key] || ''}
                    onChange={e => handleDetectedChange(v.key, e.target.value)}
                    placeholder={v.defaultValue || (v.required ? 'Required' : 'Optional')}
                    className={cn(
                      'w-full input-base pr-8 text-xs font-mono',
                      !value[v.key] && v.required && 'border-red-500/30',
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => toggleShow(v.key)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400"
                  >
                    {showValues[v.key]
                      ? <EyeOff size={12} />
                      : <Eye size={12} />}
                  </button>
                </div>

                {/* Has default badge */}
                {v.hasDefault && !value[v.key] && (
                  <Badge color="gray" size="xs">has default</Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Divider */}
      {detectedVars.length > 0 && (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-px bg-white/5" />
          <span className="text-2xs text-gray-600">Additional variables</span>
          <div className="flex-1 h-px bg-white/5" />
        </div>
      )}

      {/* Custom vars */}
      <div className="space-y-2">
        {custom.map((row, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              value={row.key}
              onChange={e => handleCustomChange(i, 'key', e.target.value.toUpperCase())}
              placeholder="KEY_NAME"
              className="input-base w-40 flex-shrink-0 text-xs font-mono"
            />
            <div className="flex-1 relative">
              <input
                type={showValues[`custom_${i}`] ? 'text' : 'password'}
                value={row.value}
                onChange={e => handleCustomChange(i, 'value', e.target.value)}
                placeholder="value"
                className="input-base w-full pr-8 text-xs font-mono"
              />
              <button
                type="button"
                onClick={() => toggleShow(`custom_${i}`)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400"
              >
                {showValues[`custom_${i}`] ? <EyeOff size={12} /> : <Eye size={12} />}
              </button>
            </div>
            <button
              onClick={() => removeRow(i)}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-600
                         hover:text-red-400 hover:bg-red-400/10 transition-colors flex-shrink-0"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}

        <Button size="sm" variant="ghost" icon={Plus} onClick={addRow} className="text-gray-500">
          Add variable
        </Button>
      </div>

      {/* Hint */}
      <p className="text-2xs text-gray-700">
        Values are encrypted before being sent to the deployment platform. They never appear in logs.
      </p>
    </div>
  );
}