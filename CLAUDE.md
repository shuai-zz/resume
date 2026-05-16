# Resume Builder — 简历生成器

## 项目概述

一个纯前端简历制作工具，支持表单编辑、多模板切换、Markdown 渲染、头像上传、模块化管理，以及 PDF/Word/JSON 导出。

**核心设计原则**：
- 所有数据存储在浏览器端，不依赖后端/数据库
- 用户数据通过 JSON 文件本地导入/导出实现持久化
- 模块化架构，支持自由增删改模块、拖拽排序、自定义模块

---

## 技术栈

| 技术 | 用途 |
|------|------|
| React 18 + TypeScript | UI 框架 |
| Vite | 构建工具 |
| Tailwind CSS | 原子化样式 |
| Zustand | 全局状态管理 |
| marked | Markdown 渲染 |
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
│   │   ├── ResumeForm.tsx       # 左侧编辑器主面板（模板选择 + 个人信息 + 模块列表 + 添加模块）
│   │   ├── ModuleEditor.tsx     # 单个模块编辑器（标题编辑 + 条目增删改 + 拖拽排序）
│   │   └── AvatarUpload.tsx     # 头像上传组件（点击/拖拽上传 + 删除）
│   └── Preview/
│       └── ResumePreview.tsx    # 右侧预览容器
├── templates/
│   ├── index.ts                 # 模板注册表
│   ├── TemplateModern.tsx       # 现代风格（蓝色头部 + 图标分隔）
│   ├── TemplateClassic.tsx      # 经典风格（居中标题 + 衬线字体）
│   └── TemplateMinimal.tsx      # 极简风格（双栏布局）
└── utils/
    ├── exportPdf.ts             # PDF 导出（DOM → canvas → PDF）
    ├── exportWord.ts            # Word 导出（docx.js 程序化生成）
    ├── importExport.ts          # JSON 导入/导出（本地文件持久化）
    └── markdown.tsx             # Markdown 渲染组件
```

---

## 核心数据模型

### 个人信息（PersonalInfo）

```ts
interface PersonalInfo {
  name: string;        // 姓名
  title: string;       // 职位头衔
  avatar: string;      // 头像 base64
  email: string;
  phone: string;
  location: string;    // 城市
  website: string;     // 个人网站/GitHub
  summary: string;     // 个人简介（支持 Markdown）
}
```

### 模块系统（核心抽象）

```ts
interface ResumeModule {
  id: string;
  type: 'experience' | 'education' | 'projects' | 'skills' | 'custom';
  title: string;       // 可自定义重命名
  items: ModuleItem[]; // 模块内的条目列表
}

interface ResumeData {
  personalInfo: PersonalInfo;
  modules: ResumeModule[];    // 所有模块统一在此，顺序即展示顺序
  template: 'modern' | 'classic' | 'minimal';
}
```

### 模块配置（MODULE_CONFIGS）

每种预设模块类型对应一个 `ModuleConfig`，定义：
- `defaultTitle`：默认显示名称
- `defaultItems`：默认示例数据
- `itemFields`：表单字段定义（key/label/placeholder/type）

**注意**：所有 `description` 字段均支持 Markdown 语法。

---

## 状态管理（Zustand）

Store 提供以下操作：

```ts
// 个人信息
updatePersonalInfo(info: Partial<PersonalInfo>)

// 模板切换
setTemplate(template: TemplateType)

// 全量数据加载（导入 JSON 时使用）
loadData(data: ResumeData)

// 模块管理
addModule(type, title?)      // 添加新模块（清空默认条目）
removeModule(moduleId)        // 删除模块
updateModuleTitle(moduleId, title)  // 重命名模块
moveModule(fromIndex, toIndex)      // 拖拽排序模块

// 条目管理
addItem(moduleId)             // 在指定模块中添加空条目
removeItem(moduleId, itemId)  // 删除条目
updateItem(moduleId, itemId, data)  // 更新条目字段
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

`itemFields` 支持三种类型：
- `'text'`（默认）：普通文本输入框
- `'textarea'`：多行文本（自动占满整行）
- `'select'`：下拉选择（目前仅 `skills` 的 `level` 字段使用）

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
