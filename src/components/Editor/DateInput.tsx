interface DateInputProps {
  value: string;
  onChange: (v: string) => void;
  allowPresent?: boolean;
  placeholder?: string;
}

const PRESENT = '至今';

export default function DateInput({ value, onChange, allowPresent }: DateInputProps) {
  const isPresent = value === PRESENT;
  // 浏览器的 month input 只认 YYYY-MM；非法值（含 '至今'）一律传空，浏览器自动显示占位
  const inputValue = /^\d{4}-\d{2}$/.test(value) ? value : '';

  return (
    <div className="flex items-center gap-2">
      <input
        type="month"
        value={inputValue}
        onChange={(e) => onChange(e.target.value)}
        disabled={isPresent}
        className="flex-1 min-w-0 border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
      />
      {allowPresent && (
        <label className="flex items-center gap-1 text-xs text-gray-600 shrink-0 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isPresent}
            onChange={(e) => onChange(e.target.checked ? PRESENT : '')}
            className="cursor-pointer"
          />
          至今
        </label>
      )}
    </div>
  );
}
