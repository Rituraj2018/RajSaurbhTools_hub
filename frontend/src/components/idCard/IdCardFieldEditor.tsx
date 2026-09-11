import React from 'react';
import { Plus, Trash2, Type } from 'lucide-react';
import { CardTextField } from '../../utils/idCardProcessor';
import { Input } from '../common/Input';

interface IdCardFieldEditorProps {
  fields: CardTextField[];
  values: Record<string, string>;
  onChange: (fieldId: string, value: string) => void;
  onAddField?: () => void;
  onRemoveField?: (fieldId: string) => void;
  className?: string;
}

export const IdCardFieldEditor: React.FC<IdCardFieldEditorProps> = ({
  fields,
  values,
  onChange,
  onAddField,
  onRemoveField,
  className = '',
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Type className="w-4 h-4 text-teal-400" />
          Card Information
        </h3>
        {onAddField && (
          <button
            type="button"
            onClick={onAddField}
            className="flex items-center gap-1 text-[11px] font-medium text-teal-400 hover:text-teal-300 transition-colors"
            aria-label="Add custom field"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Field
          </button>
        )}
      </div>

      <div className="space-y-2.5">
        {fields.filter(f => f.visible).map((field) => (
          <div key={field.id} className="flex items-start gap-2">
            <div className="flex-1">
              <Input
                id={`card-field-${field.id}`}
                label={field.label}
                value={values[field.id] || ''}
                onChange={(e) => onChange(field.id, e.target.value)}
                placeholder={`Enter ${field.label.toLowerCase()}`}
              />
            </div>
            {onRemoveField && !['name', 'orgName', 'idNumber'].includes(field.id) && (
              <button
                type="button"
                onClick={() => onRemoveField(field.id)}
                className="mt-7 p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                aria-label={`Remove ${field.label}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
