import { useState, useEffect } from 'react';
import { GripVertical, Plus, Trash2, ChevronDown, ChevronRight, Pencil, Check, X, ArrowDownWideNarrow } from 'lucide-react';
import { useResumeStore } from '../../stores/resumeStore';
import { ResumeModule, MODULE_CONFIGS, SummaryItem, ModuleType } from '../../types/resume';
import { sortItemsByDateDesc } from '../../utils/sortItems';
import DateInput from './DateInput';

const SORTABLE_TYPES: ModuleType[] = ['experience', 'education', 'projects', 'custom'];

interface ModuleEditorProps {
  module: ResumeModule;
  index: number;
  expandSignal: { expand: boolean; key: number } | null;
  onDragStart: (index: number) => void;
  onDragOver: (index: number) => void;
  onDragEnd: () => void;
}

export default function ModuleEditor({ module, index, expandSignal, onDragStart, onDragOver, onDragEnd }: ModuleEditorProps) {
  const store = useResumeStore();
  const [expanded, setExpanded] = useState(true);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(module.title);
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

  // 响应全局展开/折叠信号
  useEffect(() => {
    if (expandSignal) {
      setExpanded(expandSignal.expand);
    }
  }, [expandSignal]);

  // summary 模块要求 items[] 至少有 1 个 item 绑定 textarea；防御性兜底
  useEffect(() => {
    if (module.type === 'summary' && module.items.length === 0) {
      store.addItem(module.id);
    }
  }, [module.type, module.id, module.items.length, store]);

  const config = MODULE_CONFIGS[module.type];

  const handleSaveTitle = () => {
    store.updateModuleTitle(module.id, titleValue);
    setEditingTitle(false);
  };

  const handleCancelTitle = () => {
    setTitleValue(module.title);
    setEditingTitle(false);
  };

  // Item drag handlers
  const handleItemDragStart = (itemIndex: number) => {
    setDraggedItemIndex(itemIndex);
  };

  const handleItemDragOver = (e: React.DragEvent, itemIndex: number) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === itemIndex) return;
    store.reorderItem(module.id, draggedItemIndex, itemIndex);
    setDraggedItemIndex(itemIndex);
  };

  const handleItemDragEnd = () => {
    setDraggedItemIndex(null);
  };

  const renderField = (item: any, field: any) => {
    const value = item[field.key] || '';

    if (field.type === 'month') {
      return (
        <DateInput
          value={value}
          onChange={(v) => store.updateItem(module.id, item.id, { [field.key]: v })}
        />
      );
    }

    if (field.type === 'month-or-present') {
      return (
        <DateInput
          value={value}
          onChange={(v) => store.updateItem(module.id, item.id, { [field.key]: v })}
          allowPresent
        />
      );
    }

    if (field.type === 'textarea') {
      return (
        <textarea
          value={value}
          onChange={(e) => store.updateItem(module.id, item.id, { [field.key]: e.target.value })}
          placeholder={field.placeholder}
          rows={2}
          className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      );
    }

    if (field.type === 'select') {
      return (
        <select
          value={value}
          onChange={(e) => store.updateItem(module.id, item.id, { [field.key]: e.target.value })}
          className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">选择等级</option>
          <option value="精通">精通</option>
          <option value="熟练">熟练</option>
          <option value="了解">了解</option>
          <option value="入门">入门</option>
        </select>
      );
    }

    return (
      <input
        type="text"
        value={value}
        onChange={(e) => store.updateItem(module.id, item.id, { [field.key]: e.target.value })}
        placeholder={field.placeholder}
        className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    );
  };

  return (
    <div
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => { e.preventDefault(); onDragOver(index); }}
      onDragEnd={onDragEnd}
    >
      {/* Module Header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100 cursor-move">
        <GripVertical size={18} className="text-gray-400 shrink-0" />

        {editingTitle ? (
          <div className="flex items-center gap-2 flex-1">
            <input
              type="text"
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              className="flex-1 border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveTitle();
                if (e.key === 'Escape') handleCancelTitle();
              }}
            />
            <button onClick={handleSaveTitle} className="text-green-600 hover:text-green-800">
              <Check size={16} />
            </button>
            <button onClick={handleCancelTitle} className="text-gray-500 hover:text-gray-700">
              <X size={16} />
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 flex-1 text-left font-bold text-gray-800 hover:text-blue-600 transition-colors"
            >
              {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              <span>{module.title}</span>
              <span className="text-xs text-gray-400 font-normal ml-1">({module.items.length})</span>
            </button>
            {SORTABLE_TYPES.includes(module.type) && (
              <button
                onClick={() => store.toggleModuleSort(module.id)}
                className={`p-1 ${module.sortByDateDesc ? 'text-blue-600' : 'text-gray-400 hover:text-blue-600'}`}
                title={module.sortByDateDesc ? '已按时间倒序（点击关闭）' : '按时间倒序'}
              >
                <ArrowDownWideNarrow size={14} />
              </button>
            )}
            <button
              onClick={() => setEditingTitle(true)}
              className="text-gray-400 hover:text-blue-600 p-1"
              title="重命名"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={() => store.removeModule(module.id)}
              className="text-gray-400 hover:text-red-600 p-1"
              title="删除模块"
            >
              <Trash2 size={14} />
            </button>
          </>
        )}
      </div>

      {/* Module Content */}
      {expanded && (
        module.type === 'summary' ? (
          <div className="p-4">
            <textarea
              value={(module.items[0] as SummaryItem | undefined)?.content || ''}
              onChange={(e) => {
                const first = module.items[0];
                if (first) {
                  store.updateItem(module.id, first.id, { content: e.target.value } as Partial<SummaryItem>);
                }
              }}
              rows={8}
              placeholder="使用 Markdown 语法：- 列表、**粗体**、## 标题、`代码`"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y font-mono"
            />
          </div>
        ) : (
        <div className="p-4 space-y-3">
          {(module.sortByDateDesc ? sortItemsByDateDesc(module.items, module.type) : module.items).map((item, itemIndex) => {
            const sortLocked = !!module.sortByDateDesc;
            return (
            <div
              key={item.id}
              className="border border-gray-200 rounded-md p-3 bg-gray-50/50"
              draggable={!sortLocked}
              onDragStart={() => { if (!sortLocked) handleItemDragStart(itemIndex); }}
              onDragOver={(e) => { if (!sortLocked) handleItemDragOver(e, itemIndex); }}
              onDragEnd={handleItemDragEnd}
            >
              <div className="flex justify-between items-center mb-2">
                <div className={`flex items-center gap-1 ${sortLocked ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 cursor-move'}`}
                  title={sortLocked ? '排序模式下不可拖拽' : ''}
                >
                  <GripVertical size={14} />
                  <span className="text-xs">条目 {itemIndex + 1}</span>
                </div>
                <button
                  onClick={() => store.removeItem(module.id, item.id)}
                  className="text-red-400 hover:text-red-600 p-0.5"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div className={`grid gap-2 ${config.itemFields.length > 4 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                {config.itemFields.map((field) => (
                  <div key={field.key} className={field.type === 'textarea' ? 'col-span-full' : ''}>
                    <label className="block text-xs text-gray-500 mb-0.5">{field.label}</label>
                    {renderField(item, field)}
                  </div>
                ))}
              </div>
            </div>
            );
          })}

          <button
            onClick={() => store.addItem(module.id)}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium w-full justify-center py-2 border border-dashed border-blue-300 rounded-md hover:bg-blue-50 transition-colors"
          >
            <Plus size={16} /> 添加条目
          </button>
        </div>
        )
      )}
    </div>
  );
}
