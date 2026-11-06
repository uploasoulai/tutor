'use client';

import { useEffect, useState } from 'react';

export function DevPreviewToolbar() {
  const [isLocalPreview, setIsLocalPreview] = useState(false);

  useEffect(() => {
    setIsLocalPreview(
      process.env.NODE_ENV === 'development' &&
        ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname),
    );
  }, []);

  if (!isLocalPreview) return null;

  return (
    <details className="fixed bottom-5 left-[132px] z-[120] w-[min(340px,calc(100vw-9rem))] rounded-xl border border-slate-300 bg-white/95 text-slate-900 shadow-xl backdrop-blur">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-semibold">
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          本地开发预览
        </span>
        <span className="text-xs font-normal text-slate-500">无需登录 · 仅界面</span>
      </summary>
      <div className="border-t border-slate-200 px-4 pb-4 pt-3">
        <p className="mb-3 text-xs leading-5 text-slate-600">
          选择要预览的角色页面。账户数据、AI 请求、保存操作和 DeepTutor 仍由后端身份验证保护。
        </p>
        <div className="grid grid-cols-2 gap-2">
          <a className="rounded-lg bg-slate-900 px-3 py-2 text-center text-sm font-medium text-white hover:bg-slate-700" href="/student?preview=student">
            学生主页
          </a>
          <a className="rounded-lg bg-indigo-600 px-3 py-2 text-center text-sm font-medium text-white hover:bg-indigo-500" href="/student/lesson?preview=student&amp;grade=Grade%204&amp;subject=Math&amp;title=Fractions">
            互动课程
          </a>
          <a className="rounded-lg bg-teal-700 px-3 py-2 text-center text-sm font-medium text-white hover:bg-teal-600" href="/parent?preview=parent">
            家长门户
          </a>
          <a className="rounded-lg bg-amber-700 px-3 py-2 text-center text-sm font-medium text-white hover:bg-amber-600" href="/admin?preview=admin">
            管理员页面
          </a>
          <a className="rounded-lg border border-slate-300 px-3 py-2 text-center text-sm font-medium hover:bg-slate-50" href="/explore">
            探索 / 互动课堂
          </a>
          <a className="rounded-lg border border-slate-300 px-3 py-2 text-center text-sm font-medium hover:bg-slate-50" href="/generation-preview">
            课程生成
          </a>
          <a className="col-span-2 rounded-lg border border-slate-300 px-3 py-2 text-center text-sm font-medium hover:bg-slate-50" href="/">
            返回 CoastalTutor 首页
          </a>
        </div>
        <p className="mb-0 mt-3 text-[11px] text-slate-500">
          教师账户本版本休眠；DeepTutor SSO 需要真实账户和已启动服务。
        </p>
      </div>
    </details>
  );
}
