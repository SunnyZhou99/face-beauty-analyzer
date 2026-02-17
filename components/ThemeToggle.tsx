'use client';

import { useState, useEffect } from 'react';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    if (newIsDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    // 触发事件通知其他组件
    window.dispatchEvent(new Event('theme-change'));
  };

  return (
    <button
      onClick={toggleTheme}
      className="fixed top-24 right-4 w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-2xl transition-all hover:scale-110 z-40"
      style={{
        background: isDark ? '#4B5563' : '#FFFFFF',
        color: isDark ? '#FFFFFF' : '#000000'
      }}
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  );
}
