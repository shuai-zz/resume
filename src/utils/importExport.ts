import { ResumeData, ResumeModule, defaultResumeData, generateId } from '../types/resume';

// 把任意旧版本（含 personalInfo.summary、skills 模块、缺 customFields 等）的数据规整为当前版本。
// store 的 persist migrate 和 JSON 导入两条路径共用同一份逻辑，避免行为漂移。
export function sanitizeResumeData(raw: any): ResumeData {
  const personalInfoRaw = raw?.personalInfo || {};
  const { summary: _droppedSummary, ...personalInfoRest } = personalInfoRaw;

  const customFields = Array.isArray(personalInfoRest.customFields)
    ? personalInfoRest.customFields
    : [];

  const rawModules: any[] = Array.isArray(raw?.modules) ? raw.modules : [];
  const modules: ResumeModule[] = rawModules.filter((m) => m && m.type !== 'skills');

  const hasSummary = modules.some((m) => m.type === 'summary');
  if (!hasSummary) {
    modules.unshift({
      id: `mod-summary-${generateId()}`,
      type: 'summary',
      title: '个人总结',
      items: [{ id: `sum-${generateId()}`, content: '' } as any],
    });
  }

  return {
    personalInfo: {
      ...defaultResumeData.personalInfo,
      ...personalInfoRest,
      customFields,
    },
    modules,
    template: raw?.template || defaultResumeData.template,
  };
}

export function exportResume(data: ResumeData, filename?: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `${data.personalInfo.name || '简历'}_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importResume(file: File): Promise<ResumeData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const raw = JSON.parse(e.target?.result as string);
        if (!raw.personalInfo || !Array.isArray(raw.modules)) {
          reject(new Error('无效的简历文件格式'));
          return;
        }
        resolve(sanitizeResumeData(raw));
      } catch (err) {
        reject(new Error('解析文件失败，请检查是否为有效的 JSON 文件'));
      }
    };
    reader.onerror = () => reject(new Error('读取文件失败'));
    reader.readAsText(file);
  });
}
