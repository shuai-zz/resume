import { useState } from 'react';
import { Plus, User, LayoutTemplate, ChevronDown, ChevronRight, Maximize2, Minimize2, Trash2 } from 'lucide-react';
import { useResumeStore } from '../../stores/resumeStore';
import { templates } from '../../templates';
import { MODULE_CONFIGS, ModuleType, CustomField, generateId } from '../../types/resume';
import ModuleEditor from './ModuleEditor';
import AvatarUpload from './AvatarUpload';
import IconPicker from './IconPicker';

export default function ResumeForm() {
  const store = useResumeStore();
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [personalExpanded, setPersonalExpanded] = useState(true);
  const [expandSignal, setExpandSignal] = useState<{ expand: boolean; key: number } | null>(null);
  const [draggedModuleIndex, setDraggedModuleIndex] = useState<number | null>(null);

  const handleModuleDragStart = (index: number) => {
    setDraggedModuleIndex(index);
  };

  const handleModuleDragOver = (index: number) => {
    if (draggedModuleIndex === null || draggedModuleIndex === index) return;
    store.moveModule(draggedModuleIndex, index);
    setDraggedModuleIndex(index);
  };

  const handleModuleDragEnd = () => {
    setDraggedModuleIndex(null);
  };

  const handleAddModule = (type: ModuleType) => {
    const title = type === 'custom' && customTitle.trim() ? customTitle.trim() : undefined;
    store.addModule(type, title);
    setShowAddMenu(false);
    setCustomTitle('');
  };

  // ====== 自定义信息字段操作 ======
  const customFields = store.personalInfo.customFields ?? [];

  const addCustomField = () => {
    const newField: CustomField = { id: `cf-${generateId()}`, icon: 'User', label: '', value: '' };
    store.updatePersonalInfo({ customFields: [...customFields, newField] });
  };

  const updateCustomField = (id: string, patch: Partial<CustomField>) => {
    store.updatePersonalInfo({
      customFields: customFields.map((f) => (f.id === id ? { ...f, ...patch } : f)),
    });
  };

  const removeCustomField = (id: string) => {
    store.updatePersonalInfo({
      customFields: customFields.filter((f) => f.id !== id),
    });
  };

  const expandAll = () => {
    setPersonalExpanded(true);
    setExpandSignal({ expand: true, key: Date.now() });
  };

  const collapseAll = () => {
    setPersonalExpanded(false);
    setExpandSignal({ expand: false, key: Date.now() });
  };

  return (
    <div className="space-y-4">
      {/* Global Controls */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <LayoutTemplate size={18} className="text-blue-600" />
          <h3 className="font-bold text-gray-800 dark:text-slate-100">简历编辑</h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={expandAll}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-colors"
            title="展开全部"
          >
            <Maximize2 size={14} />
            <span className="hidden sm:inline">展开全部</span>
          </button>
          <button
            onClick={collapseAll}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-colors"
            title="折叠全部"
          >
            <Minimize2 size={14} />
            <span className="hidden sm:inline">折叠全部</span>
          </button>
        </div>
      </div>

      {/* Template Selection */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-slate-700">
        <div className="flex items-center gap-2 mb-3">
          <LayoutTemplate size={18} className="text-blue-600" />
          <h3 className="font-bold text-gray-800 dark:text-slate-100">选择模板</h3>
        </div>
        <select
          value={store.template}
          onChange={(e) => store.setTemplate(e.target.value as any)}
          className="w-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-slate-100 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {Object.entries(templates).map(([key, { name }]) => (
            <option key={key} value={key}>{name}</option>
          ))}
        </select>
      </div>

      {/* Personal Info */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-slate-700">
        <button
          onClick={() => setPersonalExpanded(!personalExpanded)}
          className="flex items-center gap-2 w-full text-left font-bold text-gray-800 dark:text-slate-100 py-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          {personalExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          <User size={18} />
          <span>个人信息</span>
        </button>

        {personalExpanded && (
          <div className="space-y-3 mt-3">
            <AvatarUpload
              avatar={store.personalInfo.avatar}
              onChange={(avatar) => store.updatePersonalInfo({ avatar })}
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1">姓名</label>
                <input
                  type="text"
                  value={store.personalInfo.name}
                  onChange={(e) => store.updatePersonalInfo({ name: e.target.value })}
                  className="w-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-slate-100 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1">职位</label>
                <input
                  type="text"
                  value={store.personalInfo.title}
                  onChange={(e) => store.updatePersonalInfo({ title: e.target.value })}
                  className="w-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-slate-100 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1">邮箱</label>
                <input
                  type="email"
                  value={store.personalInfo.email}
                  onChange={(e) => store.updatePersonalInfo({ email: e.target.value })}
                  className="w-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-slate-100 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1">电话</label>
                <input
                  type="text"
                  value={store.personalInfo.phone}
                  onChange={(e) => store.updatePersonalInfo({ phone: e.target.value })}
                  className="w-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-slate-100 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1">城市</label>
                <input
                  type="text"
                  value={store.personalInfo.location}
                  onChange={(e) => store.updatePersonalInfo({ location: e.target.value })}
                  className="w-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-slate-100 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1">个人网站</label>
                <input
                  type="text"
                  value={store.personalInfo.website}
                  onChange={(e) => store.updatePersonalInfo({ website: e.target.value })}
                  className="w-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-slate-100 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* 自定义信息 */}
            <div className="border-t border-gray-100 dark:border-slate-700 pt-3">
              <label className="block text-xs text-gray-500 dark:text-slate-400 mb-2">自定义信息</label>
              <div className="space-y-2">
                {customFields.map((f) => (
                  <div key={f.id} className="flex gap-2 items-start">
                    <IconPicker icon={f.icon} onChange={(icon) => updateCustomField(f.id, { icon })} />
                    <input
                      type="text"
                      value={f.label}
                      onChange={(e) => updateCustomField(f.id, { label: e.target.value })}
                      placeholder="名称（如 微信）"
                      className="flex-1 min-w-0 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={f.value}
                      onChange={(e) => updateCustomField(f.id, { value: e.target.value })}
                      placeholder="内容"
                      className="flex-1 min-w-0 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => removeCustomField(f.id)}
                      className="text-gray-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 p-1.5"
                      title="删除"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={addCustomField}
                className="flex items-center gap-1 mt-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium w-full justify-center py-1.5 border border-dashed border-blue-300 dark:border-blue-700 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
              >
                <Plus size={14} /> 添加自定义信息
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modules */}
      <div className="space-y-3">
        {store.modules.map((module, index) => (
          <ModuleEditor
            key={module.id}
            module={module}
            index={index}
            expandSignal={expandSignal}
            onDragStart={handleModuleDragStart}
            onDragOver={handleModuleDragOver}
            onDragEnd={handleModuleDragEnd}
          />
        ))}
      </div>

      {/* Add Module */}
      <div className="relative">
        {showAddMenu ? (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 p-4 space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-gray-800 dark:text-slate-100">添加模块</h4>
              <button
                onClick={() => { setShowAddMenu(false); setCustomTitle(''); }}
                className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 text-sm"
              >
                取消
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(MODULE_CONFIGS) as ModuleType[])
                .filter((t) => t !== 'custom')
                .map((type) => (
                  <button
                    key={type}
                    onClick={() => handleAddModule(type)}
                    className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 dark:border-slate-700 dark:text-slate-200 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-300 dark:hover:border-blue-700 transition-colors text-left"
                  >
                    <Plus size={14} className="text-blue-600 shrink-0" />
                    {MODULE_CONFIGS[type].defaultTitle}
                  </button>
                ))}
            </div>
            <div className="border-t border-gray-100 dark:border-slate-700 pt-3">
              <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1">自定义模块名称</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="输入自定义模块名称"
                  className="flex-1 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && customTitle.trim()) handleAddModule('custom');
                  }}
                />
                <button
                  onClick={() => customTitle.trim() && handleAddModule('custom')}
                  disabled={!customTitle.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed transition-colors"
                >
                  添加
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddMenu(true)}
            className="flex items-center gap-2 justify-center w-full py-3 border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-lg text-gray-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-400 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors font-medium"
          >
            <Plus size={18} /> 添加新模块
          </button>
        )}
      </div>
    </div>
  );
}
