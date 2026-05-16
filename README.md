# 简历生成器

一个纯前端的在线简历制作工具，支持表单编辑、多模板切换、Markdown 语法、头像上传、模块化管理，以及 PDF / Word / JSON 导出。

**在线预览**：[https://shuai-zz.github.io/resume/](https://shuai-zz.github.io/resume/)

---

## 功能特性

- 📝 **表单编辑** — 左侧编辑，右侧实时预览
- 🎨 **多模板切换** — 现代 / 经典 / 极简三种风格
- 📦 **模块化管理** — 拖拽排序、增删模块、自定义模块
- 🖼️ **头像上传** — 点击或拖拽上传，base64 存储
- ✍️ **Markdown 支持** — 个人简介、项目描述等支持 Markdown 语法
- 🏫 **学校层次** — 教育背景支持自定义学校层次标注
- 📄 **多种导出** — PDF、Word、JSON（本地导入/导出暂存）
- 💾 **数据不落地** — 所有数据存储在浏览器端，支持保存为本地 JSON 文件

---

## 技术栈

- React 18 + TypeScript
- Vite
- Tailwind CSS
- Zustand
- marked（Markdown 渲染）
- html2canvas + jspdf（PDF 导出）
- docx + file-saver（Word 导出）

---

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建
npm run build
```

---

## 使用说明

### 编辑简历

1. 填写个人信息（姓名、职位、联系方式、头像等）
2. 在左侧编辑器中添加/编辑各模块（工作经历、教育背景、项目经历、技能等）
3. 选择喜欢的模板风格
4. 右侧实时预览效果

### 导出简历

| 格式 | 说明 |
|------|------|
| **PDF** | 将简历导出为 PDF 文件 |
| **Word** | 导出为 .docx 格式 |
| **保存** | 将当前所有数据导出为 JSON 文件到本地 |
| **导入** | 从本地 JSON 文件恢复之前的编辑状态 |

### 模块管理

- **拖拽排序**：按住模块标题旁的 `⋮⋮` 图标拖拽调整顺序
- **重命名模块**：点击模块标题旁的 ✏️ 图标
- **添加模块**：点击底部「添加新模块」按钮
- **自定义模块**：输入任意名称创建自定义内容模块

---

## 项目结构

```
src/
├── types/resume.ts          # 类型定义与模块配置
├── stores/resumeStore.ts    # Zustand 状态管理
├── App.tsx                  # 根组件
├── components/
│   ├── Editor/
│   │   ├── ResumeForm.tsx   # 编辑器主面板
│   │   ├── ModuleEditor.tsx # 模块编辑器
│   │   └── AvatarUpload.tsx # 头像上传
│   └── Preview/
│       └── ResumePreview.tsx
├── templates/
│   ├── TemplateModern.tsx   # 现代风格
│   ├── TemplateClassic.tsx  # 经典风格
│   └── TemplateMinimal.tsx  # 极简风格
└── utils/
    ├── exportPdf.ts         # PDF 导出
    ├── exportWord.ts        # Word 导出
    ├── importExport.ts      # JSON 导入/导出
    └── markdown.tsx         # Markdown 渲染
```

---

## 部署

本项目已配置 GitHub Actions 自动部署到 GitHub Pages：

1. 推送代码到 `main` 分支
2. GitHub Actions 自动构建并部署
3. 访问 `https://shuai-zz.github.io/resume/`

---

## License

MIT
