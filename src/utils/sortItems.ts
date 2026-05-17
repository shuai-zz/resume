import { ModuleItem, ModuleType } from '../types/resume';

// 把 'YYYY-MM' / '至今' / '' 转成可比较的数字
// '至今' 或空字符串 → Infinity，含义是「当前进行中 / 不知道」，排最前
// 'YYYY-MM' → year*12 + month
// 非法格式 → -Infinity，排最后
function dateKey(v: string): number {
  if (!v || v === '至今') return Infinity;
  const m = /^(\d{4})-(\d{2})$/.exec(v);
  if (!m) return -Infinity;
  return parseInt(m[1], 10) * 12 + parseInt(m[2], 10);
}

// 按简历惯例：endDate desc（至今在前），同结束时间按 startDate desc。
// summary 不含日期字段，原样返回。
export function sortItemsByDateDesc(items: ModuleItem[], type: ModuleType): ModuleItem[] {
  if (type === 'summary') return items;
  return [...items].sort((a: any, b: any) => {
    const endDiff = dateKey(b.endDate || '') - dateKey(a.endDate || '');
    if (endDiff !== 0) return endDiff;
    return dateKey(b.startDate || '') - dateKey(a.startDate || '');
  });
}
