import { useCallback, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'resume-builder-theme';

function getInitial(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') return stored;
  } catch {
    // localStorage 不可用时（隐私模式 / 文件协议）走系统偏好
  }
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

// 唯一职责：把当前 theme 同步到 <html class="dark"> 并持久化用户选择。
// 一旦用户主动 toggle，localStorage 即被写入，从此「锁定」用户选择不再跟随系统。
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitial);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // 写不进去也无所谓，下次刷新会重新跟系统
      }
      return next;
    });
  }, []);

  return { theme, toggle };
}
