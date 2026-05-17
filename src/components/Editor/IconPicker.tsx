import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { ICON_REGISTRY, ICON_NAMES, getIcon } from '../../utils/icons';

interface IconPickerProps {
  icon: string;
  onChange: (icon: string) => void;
  size?: number;
}

export default function IconPicker({ icon, onChange, size = 16 }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const Current = getIcon(icon);

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 border border-gray-300 rounded-md px-2 py-1.5 text-gray-600 hover:bg-blue-50 hover:border-blue-300 transition-colors"
        title="选择图标"
      >
        <Current size={size} />
        <ChevronDown size={12} className="text-gray-400" />
      </button>

      {open && (
        <div className="absolute z-20 top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-2 grid grid-cols-6 gap-1 w-[240px]">
          {ICON_NAMES.map((name) => {
            const Icon = ICON_REGISTRY[name];
            const active = name === icon;
            return (
              <button
                key={name}
                type="button"
                onClick={() => { onChange(name); setOpen(false); }}
                title={name}
                className={`p-1.5 rounded transition-colors flex items-center justify-center ${
                  active
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                }`}
              >
                <Icon size={16} />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
