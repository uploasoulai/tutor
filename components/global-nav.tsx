'use client';

import { Home } from 'lucide-react';
import Link from 'next/link';
import { useI18n } from '@/lib/hooks/use-i18n';

export function GlobalNav() {
  const { locale, setLocale } = useI18n();

  const toggleLanguage = () => {
    setLocale(locale === 'zh-CN' ? 'en-US' : 'zh-CN');
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3">
      <button
        onClick={toggleLanguage}
        title={locale === 'zh-CN' ? 'Switch to English' : '切换为中文'}
        className="flex items-center justify-center w-12 h-12 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.15)] bg-white hover:bg-gray-50 border border-gray-100 text-[#003461] transition-all hover:scale-105 active:scale-95"
      >
        <span className="font-bold text-sm tracking-widest">
          {locale === 'zh-CN' ? 'EN' : '中'}
        </span>
      </button>
      <Link href="/">
        <button
          title={locale === 'zh-CN' ? '返回主页' : 'Return to Home'}
          className="flex items-center justify-center w-12 h-12 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.15)] bg-[#003461] hover:bg-[#00284d] text-white transition-all hover:scale-105 active:scale-95"
        >
          <Home className="size-5" />
        </button>
      </Link>
    </div>
  );
}
