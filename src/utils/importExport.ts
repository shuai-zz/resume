import { ResumeData } from '../types/resume';

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
        const data = JSON.parse(e.target?.result as string);
        // 简单校验数据结构
        if (!data.personalInfo || !Array.isArray(data.modules)) {
          reject(new Error('无效的简历文件格式'));
          return;
        }
        resolve(data as ResumeData);
      } catch (err) {
        reject(new Error('解析文件失败，请检查是否为有效的 JSON 文件'));
      }
    };
    reader.onerror = () => reject(new Error('读取文件失败'));
    reader.readAsText(file);
  });
}
