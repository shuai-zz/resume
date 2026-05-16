import { create } from 'zustand';
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
  moveModule: (fromIndex: number, toIndex: number) => void;

  // Item management
  addItem: (moduleId: string) => void;
  removeItem: (moduleId: string, itemId: string) => void;
  updateItem: (moduleId: string, itemId: string, data: Partial<ModuleItem>) => void;
}

export const useResumeStore = create<ResumeStore>((set) => ({
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
      // 清空默认数据，让用户自己填
      newModule.items = [];
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
}));
