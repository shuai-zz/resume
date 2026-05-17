// 时间区间格式化：两个都空 → 不显示；只有一个 → 单独显示；都有 → 'start sep end'
// 用于模板和 Word 导出中所有 startDate / endDate 拼接的位置
export function formatDateRange(start?: string, end?: string, sep = '-'): string {
  const s = (start || '').trim();
  const e = (end || '').trim();
  if (!s && !e) return '';
  if (s && e) return `${s} ${sep} ${e}`;
  return s || e;
}
