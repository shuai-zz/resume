# Resume Builder — 简历生成器

## 项目概述

一个纯前端简历制作工具，支持表单编辑、多模板切换、Markdown 渲染、头像上传、模块化管理，以及 PDF/Word/JSON 导出。

**核心设计原则**：
- 所有数据存储在浏览器端，不依赖后端/数据库
- 用户数据自动写入 localStorage（刷新不丢），同时支持 JSON 文件导入/导出
- 模块化架构，支持自由增删改模块、拖拽排序、自定义模块

---

## 技术栈

| 技术 | 用途 |
|------|------|
| React 18 + TypeScript | UI 框架 |
| Vite | 构建工具 |
| Tailwind CSS | 原子化样式 |
| Zustand + persist | 全局状态管理 + localStorage 自动暂存 |
| marked + DOMPurify | Markdown 渲染 + XSS 防护 |
| html2canvas + jspdf | PDF 导出 |
| docx + file-saver | Word 导出 |
| lucide-react | 图标库 |

---

## 项目结构

```
src/
├── types/resume.ts              # 核心类型定义 + 模块配置 + 辅助函数
├── stores/resumeStore.ts        # Zustand 状态管理（全局唯一数据源）
├── App.tsx                      # 根组件：布局 + 顶部工具栏 + 导入导出
├── main.tsx                     # 应用入口
├── index.css                    # 全局样式 + Markdown 样式 + 打印样式
├── components/
│   ├── Editor/
│   │   ├── ResumeForm.tsx       # 左侧编辑器主面板（模板选择 + 个人信息 + 自定义字段 + 模块列表）
│   │   ├── ModuleEditor.tsx     # 单个模块编辑器（标题编辑 + 条目增删改 + 拖拽排序 + 时间倒序 toggle）
│   │   ├── AvatarUpload.tsx     # 头像上传组件（点击/拖拽上传 + 删除）
│   │   ├── IconPicker.tsx       # 自定义字段图标选择器（curated 24 个 lucide 图标 popover）
│   │   └── DateInput.tsx        # 月份选择器 + 可选「至今」复选框
│   └── Preview/
│       └── ResumePreview.tsx    # 右侧预览容器（应用 sortByDateDesc 后再传给模板）
├── templates/
│   ├── index.ts                 # 模板注册表
│   ├── TemplateModern.tsx       # 现代风格（蓝色头部 + 图标分隔）
│   ├── TemplateClassic.tsx      # 经典风格（居中标题 + 衬线字体）
│   └── TemplateMinimal.tsx      # 极简风格（双栏布局）
└── utils/
    ├── exportPdf.ts             # PDF 导出（DOM → canvas → PDF）
    ├── exportWord.ts            # Word 导出（docx.js 程序化生成，应用 sortByDateDesc）
    ├── importExport.ts          # JSON 导入/导出 + sanitizeResumeData（migrate + import 共用）
    ├── markdown.tsx             # Markdown 渲染组件
    ├── icons.ts                 # Lucide 图标注册表 + getIcon() fallback（24 个 curated）
    └── sortItems.ts             # 按时间倒序排序工具（endDate desc → startDate desc）
```

---

## 核心数据模型

### 个人信息（PersonalInfo）

```ts
interface CustomField {
  id: string;
  icon: string;         // Lucide 图标名，从 utils/icons.ts 的 ICON_REGISTRY 选
  label: string;        // 信息名称（如「微信」「生日」）
  value: string;        // 信息内容；为空时模板不渲染该条
}

interface PersonalInfo {
  name: string;         // 姓名
  title: string;        // 职位头衔
  avatar: string;       // 头像 base64
  email: string;
  phone: string;
  location: string;     // 城市
  website: string;      // 个人网站/GitHub
  customFields: CustomField[];  // 自定义联系字段，header 联系信息行混排
}
```

**注**：原 `personalInfo.summary` 字段已废弃。「个人总结」现在是一个独立的 `summary` 类型模块（单 markdown textarea），由 `modules` 数组承载，可以参与排序、重命名、删除。

### 模块系统（核心抽象）

```ts
type ModuleType = 'experience' | 'education' | 'projects' | 'summary' | 'custom';

interface ResumeModule {
  id: string;
  type: ModuleType;
  title: string;        // 可自定义重命名
  items: ModuleItem[];  // 模块内的条目列表
  sortByDateDesc?: boolean;  // 开启后编辑器和预览实时按 endDate desc → startDate desc 排序；store 内 items 顺序不变
}

interface ResumeData {
  personalInfo: PersonalInfo;
  modules: ResumeModule[];    // 所有模块统一在此，顺序即展示顺序
  template: 'modern' | 'classic' | 'minimal';
}
```

**注**：
- `'summary'` 模块约定恰好 1 个 item（绑定 markdown textarea），`ModuleEditor` 走特殊渲染分支不显示「添加条目」
- 原 `'skills'` 类型已移除，相关内容合并入「个人总结」
- `sortByDateDesc` 是渲染层选项，不会动 store；开启时拖拽 handle 自动禁用避免冲突

### 模块配置（MODULE_CONFIGS）

每种预设模块类型对应一个 `ModuleConfig`，定义：
- `defaultTitle`：默认显示名称
- `defaultItems`：默认示例数据
- `itemFields`：表单字段定义（key/label/placeholder/type）

**注意**：所有 `description` 字段均支持 Markdown 语法。

---

## 状态管理（Zustand）

Store 用 `zustand/middleware` 的 `persist` 包过，数据自动同步到 `localStorage["resume-builder-data"]`；只持久化 `personalInfo / modules / template` 三个数据字段，不持久化 action。

**持久化版本**：当前 `version: 4`。从任意旧版本（v1/v2/v3）迁移都委托 `sanitizeResumeData()`（`src/utils/importExport.ts`），同一份逻辑同时给 store migrate 和 JSON 导入用，避免行为漂移。Sanitize 会：
- 删除已废弃的 `personalInfo.summary` 字段
- 滤掉 `skills` 类型模块
- 缺 `summary` 模块时自动 unshift 一个
- `customFields` / `sortByDateDesc` 缺字段时兜底默认值

Store 提供以下操作：

```ts
// 个人信息
updatePersonalInfo(info: Partial<PersonalInfo>)

// 模板切换
setTemplate(template: TemplateType)

// 全量数据加载（导入 JSON 时使用）
loadData(data: ResumeData)

// 模块管理
addModule(type, title?)             // summary 类型自动带 1 个空 item，其他类型清空让用户自填
removeModule(moduleId)
updateModuleTitle(moduleId, title)
toggleModuleSort(moduleId)          // 翻转 sortByDateDesc
moveModule(fromIndex, toIndex)      // 拖拽排序模块

// 条目管理
addItem(moduleId)
removeItem(moduleId, itemId)
updateItem(moduleId, itemId, data)
reorderItem(moduleId, fromIndex, toIndex)
```

---

## 模板系统

### 模板渲染方式

每个模板是一个 React 组件，接收完整的 `ResumeData`：

```tsx
function TemplateModern({ data }: { data: ResumeData }) {
  // 遍历 data.modules 渲染各模块
  // 根据 module.type 决定渲染样式
}
```

### 模板注册

```ts
// templates/index.ts
export const templates = {
  modern:  { component: TemplateModern,  name: '现代风格' },
  classic: { component: TemplateClassic, name: '经典风格' },
  minimal: { component: TemplateMinimal, name: '极简风格' },
};
```

### 新增模板步骤

1. 在 `templates/` 下创建新的模板组件（参考现有模板结构）
2. 在 `templates/index.ts` 中注册
3. 在 `types/resume.ts` 的 `TemplateType` 中添加新类型

---

## 导出机制

| 格式 | 实现方式 | 文件 |
|------|---------|------|
| **PDF** | html2canvas 将 `#resume-preview` DOM 截图 → jspdf 生成 | `utils/exportPdf.ts` |
| **Word** | docx.js 按模块类型程序化构建 Document → blob 下载 | `utils/exportWord.ts` |
| **JSON** | `JSON.stringify(data)` → Blob → 触发下载 | `utils/importExport.ts` |

**打印**：直接调用 `window.print()`，CSS 媒体查询隐藏非简历内容。

---

## 导入/导出 JSON（本地暂存）

**保存**：点击顶部「保存」按钮，导出 `{姓名}_{日期}.json`。

**导入**：点击「导入」按钮选择 JSON 文件，调用 `loadData()` 全量替换当前状态。

**注意**：头像以 base64 存储在 `personalInfo.avatar` 中，会随 JSON 一起导出/导入。

---

## 开发规范

### 新增字段

如果需要在某个模块类型中新增字段：

1. `types/resume.ts`：在对应的 `*Item` 接口中添加字段
2. `types/resume.ts`：在 `MODULE_CONFIGS` 的 `itemFields` 中添加字段配置
3. `types/resume.ts`：在 `createEmptyItem()` 中初始化字段
4. `types/resume.ts`：在 `defaultItems` 示例数据中补充字段
5. `utils/exportWord.ts`：在对应模块的渲染逻辑中使用新字段
6. 各 `templates/Template*.tsx`：在对应模块渲染中使用新字段

### 字段类型

`itemFields[].type` 支持以下类型：
- `'text'`（默认）：普通文本输入框
- `'textarea'`：多行文本（自动占满整行）
- `'select'`：下拉选择
- `'month'`：原生 `<input type="month">` 月份选择器（输出 `YYYY-MM`）
- `'month-or-present'`：月份选择器 + 「至今」复选框；勾上时把值存为字符串 `"至今"` 并禁用日期输入框

排序工具 `sortItemsByDateDesc()`（`src/utils/sortItems.ts`）把 `"至今"` 和空字符串都视为 `Infinity`（最新，排最前）。

---

## 启动命令

```bash
# 开发
npm run dev          # http://localhost:5173/

# 生产构建
npm run build        # 输出到 dist/

# 预览构建结果
npm run preview
```

---

## 已知限制

1. **头像大小**：限制 2MB，大图片会导致 JSON 文件体积膨胀
2. **PDF 分页**：html2canvas 截图生成 PDF，超长简历可能分页不精确
3. **Word 导出样式**：docx.js 生成的 Word 文档为简化样式，与网页预览有差异
4. **拖拽排序**：模块和条目均使用 HTML5 原生拖拽，无拖拽占位动画
5. **localStorage 容量**：浏览器一般给单 origin 5-10MB；头像 base64 接近 2MB 上限 + 大量条目时，写入可能抛 `QuotaExceededError`（暂未做兜底）

---

## 规划中的功能

### 用户自定义主题（D+ 方案）

允许用户上传自己的简历主题，**仅作本地使用，不做共享分发**。一旦做共享市场，就要承担审核 / 版权 / 运维责任，超出个人项目可持续投入的边界。

**方案选型**：不引入模板 DSL，而是基于现有 3 个内置模板暴露主题变量 + 字段开关。用户上传的是 `theme.json`（纯数据），不是模板代码 —— 没有 XSS / 数据外发风险，也不需要设计 DSL 抽象。

**theme.json 示意结构**（待定稿）：

```json
{
  "name": "我的主题",
  "baseTemplate": "modern",
  "colors": {
    "primary": "#3b82f6",
    "text": "#1f2937",
    "muted": "#6b7280",
    "accent": "#f59e0b"
  },
  "fonts": {
    "body": "Inter",
    "heading": "Inter"
  },
  "spacing": {
    "pagePadding": "40px",
    "moduleGap": "24px"
  },
  "showIcons": true,
  "fieldVisibility": {
    "experience": { "position": true, "description": true },
    "education":  { "ranking": false, "description": false }
  }
}
```

**核心待办**：

1. Theme schema 定义 + zod 校验
2. **重构 3 个内置模板**：把硬编码颜色（`text-blue-600` 等）换成 CSS 变量（占工作量大头，仔细做避免视觉回归）
3. ThemeProvider：把 `--theme-*` 变量注入到 `#resume-preview` 根节点
4. store 加 `theme` 字段，走现有 zustand persist
5. **字段显隐开关**：每个 `ModuleType` 暴露哪些字段可隐藏（如 `experience.position` / `education.ranking`），在 ModuleEditor 顶部加 toggle
6. **Curated 字体包**：内置 5-10 种预设字体（思源宋体 / Inter / JetBrains Mono / 系统字体 等），不接受任意字体 URL（避免 `@font-face url(...)` 外发用户 IP 给第三方）
7. UI：在"选择模板"下面加"导入/导出主题 JSON"按钮，复用现有 import/export 逻辑
8. 验证 PDF / Word 导出仍正确（html2canvas 支持 CSS 变量；Word 导出需要在 `exportWord.ts` 里也读 theme 配色）

**预估工作量**：1.5-2 天。其中第 2 步（重构模板硬编码颜色）占 3-4 小时，其余各 0.5-1 小时。

**核心权衡 / 不做的事**：

- **不支持自由 layout 自定义**（双栏改单栏、模块移到 header 内嵌等）—— 那是"方案 B"（JSON DSL）的范畴，工作量 10-15 天，且 DSL 抽象边界设计本身是巨大的不确定性投入。除非未来有明确用户需求验证，否则不启动 B。
- **主题不上传共享市场**。用户之间想交换 theme.json 自己走 Discord / GitHub Gist 即可，App 只提供导入接口。
- **theme.json 内禁止任意 HTML / JS / 远程 URL**（XSS + 数据外发风险）。颜色字段只接受 hex / hsl 字符串，字体字段只接受预设字体名。
