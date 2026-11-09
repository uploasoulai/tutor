'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { COASTALTUTOR_HOME_URL } from '@/lib/platform-links'

export function CoastalTutorHomeLink({
  className = '',
  href = COASTALTUTOR_HOME_URL,
  onClick,
}: {
  className?: string
  href?: string
  onClick?: React.MouseEventHandler<HTMLAnchorElement>
}) {
  const { t } = useTranslation()
  return (
    <Link
      href={href}
      aria-label={t('Home')}
      title={t('Back to app')}
      prefetch={false}
      onClick={onClick}
      className={`inline-flex min-h-9 items-center gap-2 rounded-lg px-1.5 text-[var(--foreground)] transition-colors hover:bg-[var(--muted)]/55 ${className}`}
    >
      <Image src="/brand/coastaltutor-mark.svg" alt="" width={24} height={24} className="h-6 w-6" />
      <span className="text-sm font-semibold tracking-tight">{t('composer.tray.deeptutor')}</span>
    </Link>
  )
}
