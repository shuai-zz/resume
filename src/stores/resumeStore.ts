import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  ResumeData,
  ResumeModule,
  ModuleItem,
  ModuleType,
  TemplateType,
  defaultResumeData,
  createEmptyItem,
  createModule,
} from '../types/resume';
import { sanitizeResumeData } from '../utils/importExport';

interface ResumeStore extends ResumeData {
  // Personal Info
  updatePersonalInfo: (info: Partial<ResumeData['personalInfo']>) => void;

  // Template
  setTemplate: (template: TemplateType) => void;

  // Full data load (import)
  loadData: (data: ResumeData) => void;

  // Module management
  addModule: (type: ModuleType, title?: string) => void;
  removeModule: (moduleId: string) => void;
  updateModuleTitle: (moduleId: string, title: string) => void;
  toggleModuleSort: (moduleId: string) => void;
  moveModule: (fromIndex: number, toIndex: number) => void;

  // Item management
  addItem: (moduleId: string) => void;
  removeItem: (moduleId: string, itemId: string) => void;
  updateItem: (moduleId: string, itemId: string, data: Partial<ModuleItem>) => void;
  reorderItem: (moduleId: string, fromIndex: number, toIndex: number) => void;
}

export const useResumeStore = create<ResumeStore>()(
  persist(
    (set) => ({
      ...defaultResumeData,

      updatePersonalInfo: (info) =>
        set((state) => ({
          personalInfo: { ...state.personalInfo, ...info },
        })),

      setTemplate: (template) => set({ template }),

      loadData: (data) => set({ ...data }),

      addModule: (type, title) =>
        set((state) => {
          const newModule = createModule(type, title);
          // summary 模块需要至少一个 item 绑定 textarea；其他模块清空让用户自己填
          newModule.items = type === 'summary' ? [createEmptyItem('summary')] : [];
          return { modules: [...state.modules, newModule] };
        }),

      removeModule: (moduleId) =>
        set((state) => ({
          modules: state.modules.filter((m) => m.id !== moduleId),
        })),

      updateModuleTitle: (moduleId, title) =>
        set((state) => ({
          modules: state.modules.map((m) => (m.id === moduleId ? { ...m, title } : m)),
        })),

      toggleModuleSort: (moduleId) =>
        set((state) => ({
          modules: state.modules.map((m) =>
            m.id === moduleId ? { ...m, sortByDateDesc: !m.sortByDateDesc } : m
          ),
        })),

      moveModule: (fromIndex, toIndex) =>
        set((state) => {
          const modules = [...state.modules];
          const [removed] = modules.splice(fromIndex, 1);
          modules.splice(toIndex, 0, removed);
          return { modules };
        }),

      addItem: (moduleId) =>
        set((state) => {
          const module = state.modules.find((m) => m.id === moduleId);
          if (!module) return state;
          const newItem = createEmptyItem(module.type);
          return {
            modules: state.modules.map((m) =>
              m.id === moduleId ? { ...m, items: [...m.items, newItem] } : m
            ),
          };
        }),

      removeItem: (moduleId, itemId) =>
        set((state) => ({
          modules: state.modules.map((m) =>
            m.id === moduleId ? { ...m, items: m.items.filter((i) => i.id !== itemId) } : m
          ),
        })),

      updateItem: (moduleId, itemId, data) =>
        set((state) => ({
          modules: state.modules.map((m) =>
            m.id === moduleId
              ? {
                  ...m,
                  items: m.items.map((i) => (i.id === itemId ? { ...i, ...data } : i)),
                }
              : m
          ),
        })),

      reorderItem: (moduleId, fromIndex, toIndex) =>
        set((state) => ({
          modules: state.modules.map((m) => {
            if (m.id !== moduleId) return m;
            const items = [...m.items];
            const [removed] = items.splice(fromIndex, 1);
            items.splice(toIndex, 0, removed);
            return { ...m, items };
          }),
        })),
    }),
    {
      name: 'resume-builder-data',
      version: 4,
      storage: createJSONStorage(() => localStorage),
      // 旧版本 → 当前：删 personalInfo.summary、滤掉 skills 模块、补 summary 模块、补 customFields、补 sortByDateDesc
      migrate: (persistedState: any, _fromVersion) => sanitizeResumeData(persistedState),
      // 只持久化数据，不持久化 action（action 在每次启动时由 create 重新挂上）
      partialize: (state) => ({
        personalInfo: state.personalInfo,
        modules: state.modules,
        template: state.template,
      }),
    }
  )
);
