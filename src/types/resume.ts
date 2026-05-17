// ============ 预设模块数据项类型 ============

export interface ExperienceItem {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface EducationItem {
  id: string;
  school: string;
  degree: string;
  field: string;
  ranking: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
  link: string;
}

export interface SummaryItem {
  id: string;
  content: string;
}

export interface CustomItem {
  id: string;
  title: string;
  subtitle: string;
  startDate: string;
  endDate: string;
  description: string;
}

export type ModuleItem = ExperienceItem | EducationItem | ProjectItem | SummaryItem | CustomItem;

// ============ 模块类型 ============

export type ModuleType = 'experience' | 'education' | 'projects' | 'summary' | 'custom';

export interface ResumeModule {
  id: string;
  type: ModuleType;
  title: string;
  items: ModuleItem[];
}

// ============ 个人信息 ============

export interface PersonalInfo {
  name: string;
  title: string;
  avatar: string;
  email: string;
  phone: string;
  location: string;
  website: string;
}

// ============ 简历数据 ============

export type TemplateType = 'modern' | 'classic' | 'minimal';

export interface ResumeData {
  personalInfo: PersonalInfo;
  modules: ResumeModule[];
  template: TemplateType;
}

// ============ 预设模块配置 ============

export interface ModuleConfig {
  type: ModuleType;
  defaultTitle: string;
  defaultItems: ModuleItem[];
  itemFields: { key: string; label: string; placeholder: string; type?: 'text' | 'textarea' | 'select' }[];
  gridCols?: number; // 表单布局列数
}

export const MODULE_CONFIGS: Record<ModuleType, ModuleConfig> = {
  experience: {
    type: 'experience',
    defaultTitle: '工作经历',
    defaultItems: [
      {
        id: 'exp-1',
        company: '某互联网大厂',
        position: '高级前端工程师',
        startDate: '2021-03',
        endDate: '至今',
        description: '负责公司核心产品的前端架构设计和开发，带领5人团队完成多个重点项目。主导前端性能优化，页面加载速度提升40%。',
      },
    ],
    itemFields: [
      { key: 'company', label: '公司名称', placeholder: '公司名称' },
      { key: 'position', label: '职位', placeholder: '职位' },
      { key: 'startDate', label: '开始时间', placeholder: '开始时间' },
      { key: 'endDate', label: '结束时间', placeholder: '结束时间' },
      { key: 'description', label: '工作描述', placeholder: '工作描述', type: 'textarea' },
    ],
  },
  education: {
    type: 'education',
    defaultTitle: '教育背景',
    defaultItems: [
      {
        id: 'edu-1',
        school: '北京大学',
        degree: '本科',
        field: '计算机科学与技术',
        ranking: '985',
        startDate: '2015-09',
        endDate: '2019-06',
        description: '主修课程：数据结构、算法、操作系统、计算机网络、数据库原理',
      },
    ],
    itemFields: [
      { key: 'school', label: '学校名称', placeholder: '学校名称' },
      { key: 'field', label: '专业', placeholder: '专业' },
      { key: 'degree', label: '学位', placeholder: '学位' },
      { key: 'ranking', label: '学校层次', placeholder: '如：985 / 211 / 双一流 / QS Top 50' },
      { key: 'startDate', label: '开始时间', placeholder: '开始时间' },
      { key: 'endDate', label: '结束时间', placeholder: '结束时间' },
      { key: 'description', label: '描述', placeholder: '描述（可选）', type: 'textarea' },
    ],
  },
  projects: {
    type: 'projects',
    defaultTitle: '项目经历',
    defaultItems: [
      {
        id: 'proj-1',
        name: '企业级管理系统',
        role: '前端负责人',
        startDate: '2022-01',
        endDate: '2022-12',
        description: '设计并实现了一套完整的企业级管理系统，支持权限管理、数据可视化、工作流引擎等核心功能。',
        link: '',
      },
    ],
    itemFields: [
      { key: 'name', label: '项目名称', placeholder: '项目名称' },
      { key: 'role', label: '角色', placeholder: '角色' },
      { key: 'startDate', label: '开始时间', placeholder: '开始时间' },
      { key: 'endDate', label: '结束时间', placeholder: '结束时间' },
      { key: 'description', label: '项目描述', placeholder: '项目描述', type: 'textarea' },
    ],
  },
  summary: {
    type: 'summary',
    defaultTitle: '个人总结',
    defaultItems: [
      {
        id: 'sum-1',
        content: '拥有 5 年前端开发经验，精通 React / Vue 等主流框架，擅长性能优化和工程化建设。\n\n**核心技能**：\n- React / Vue / Angular\n- TypeScript / JavaScript\n- Node.js / Vite / Webpack',
      },
    ],
    itemFields: [
      { key: 'content', label: '内容（支持 Markdown）', placeholder: '使用 Markdown 语法：- 列表、**粗体**、## 标题', type: 'textarea' },
    ],
  },
  custom: {
    type: 'custom',
    defaultTitle: '自定义模块',
    defaultItems: [],
    itemFields: [
      { key: 'title', label: '标题', placeholder: '标题' },
      { key: 'subtitle', label: '副标题', placeholder: '副标题' },
      { key: 'startDate', label: '开始时间', placeholder: '开始时间' },
      { key: 'endDate', label: '结束时间', placeholder: '结束时间' },
      { key: 'description', label: '描述', placeholder: '描述', type: 'textarea' },
    ],
  },
};

// ============ 默认值 ============

export const defaultResumeData: ResumeData = {
  personalInfo: {
    name: '张三',
    title: '高级前端工程师',
    avatar: '',
    email: 'zhangsan@example.com',
    phone: '138-0000-0000',
    location: '北京市',
    website: 'https://github.com/zhangsan',
  },
  modules: [
    { id: 'mod-summary', type: 'summary', title: '个人总结', items: JSON.parse(JSON.stringify(MODULE_CONFIGS.summary.defaultItems)) },
    { id: 'mod-exp', type: 'experience', title: '工作经历', items: MODULE_CONFIGS.experience.defaultItems },
    { id: 'mod-edu', type: 'education', title: '教育背景', items: MODULE_CONFIGS.education.defaultItems },
    { id: 'mod-proj', type: 'projects', title: '项目经历', items: MODULE_CONFIGS.projects.defaultItems },
  ],
  template: 'modern',
};

// ============ 辅助函数 ============

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function createModule(type: ModuleType, title?: string): ResumeModule {
  const config = MODULE_CONFIGS[type];
  return {
    id: `mod-${generateId()}`,
    type,
    title: title || config.defaultTitle,
    items: JSON.parse(JSON.stringify(config.defaultItems)),
  };
}

export function createEmptyItem(type: ModuleType): ModuleItem {
  const base = { id: generateId() };
  switch (type) {
    case 'experience':
      return { ...base, company: '', position: '', startDate: '', endDate: '', description: '' } as ExperienceItem;
    case 'education':
      return { ...base, school: '', degree: '', field: '', ranking: '', startDate: '', endDate: '', description: '' } as EducationItem;
    case 'projects':
      return { ...base, name: '', role: '', startDate: '', endDate: '', description: '', link: '' } as ProjectItem;
    case 'summary':
      return { ...base, content: '' } as SummaryItem;
    case 'custom':
      return { ...base, title: '', subtitle: '', startDate: '', endDate: '', description: '' } as CustomItem;
    default:
      return { ...base, title: '', subtitle: '', startDate: '', endDate: '', description: '' } as CustomItem;
  }
}
