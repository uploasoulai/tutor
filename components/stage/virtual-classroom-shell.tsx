'use client';

import { useState, type ReactNode } from 'react';
import { useI18n } from '@/lib/hooks/use-i18n';
import { CoastalMark } from '@/components/coastal-mark';
import './virtual-classroom-shell.css';

/** A decorative room around the live DOM lesson; never transforms its interactive screen. */
export function VirtualClassroomShell({
  children,
  speaking,
  presenting,
}: {
  children: ReactNode;
  speaking: boolean;
  presenting: boolean;
}) {
  const { locale } = useI18n();
  const zh = locale.startsWith('zh');
  const [room, setRoom] = useState(true);
  const active = room && !presenting;
  return (
    <div className="ct-room" data-room={active} data-speaking={speaking && active}>
      {!presenting && (
        <div className="ct-room-bar">
          <span className="ct-room-label">
            <CoastalMark className="size-4" />
            {zh ? '一起探索，慢慢学会' : 'Explore together. Learn one step at a time.'}
          </span>
          <button
            type="button"
            className="ct-room-toggle"
            aria-pressed={room}
            onClick={() => setRoom(!room)}
          >
            {room
              ? zh
                ? '切换专注模式'
                : 'Switch to focus view'
              : zh
                ? '进入教室'
                : 'Enter classroom'}
          </button>
        </div>
      )}
      <div className="ct-room-body">
        <div className="ct-room-decor" aria-hidden="true">
          <div className="ct-room-window" />
          <div className="ct-room-floor" />
          <svg className="ct-room-teacher" viewBox="0 0 100 210" fill="none">
            <ellipse cx="49" cy="201" rx="34" ry="7" fill="#122d37" opacity=".18" />
            <path
              d="M33 145L30 192M62 145L67 192"
              stroke="#203a50"
              strokeWidth="15"
              strokeLinecap="round"
            />
            <path
              d="M20 198H38M60 198H79"
              stroke="#152d40"
              strokeWidth="10"
              strokeLinecap="round"
            />
            <path d="M29 77Q50 65 70 77L74 148H24Z" fill="#138c94" />
            <path d="M30 79L19 124" stroke="#138c94" strokeWidth="15" strokeLinecap="round" />
            <path d="M18 123L22 147" stroke="#f2c6a4" strokeWidth="11" strokeLinecap="round" />
            <g className="ct-room-pointing">
              <path
                d="M68 83L82 107L92 87"
                stroke="#138c94"
                strokeWidth="13"
                strokeLinecap="round"
              />
              <path d="M92 87L95 72" stroke="#f2c6a4" strokeWidth="10" strokeLinecap="round" />
            </g>
            <path d="M43 66V78L51 86L59 77V65" fill="#f2c6a4" />
            <ellipse cx="50" cy="43" rx="25" ry="29" fill="#f2c6a4" />
            <path d="M25 43Q16 8 49 9Q82 7 75 43L67 30Q47 38 33 26L29 45Z" fill="#263b4c" />
            <circle cx="41" cy="45" r="2" fill="#263b4c" />
            <circle cx="59" cy="45" r="2" fill="#263b4c" />
            <path d="M42 56Q50 62 58 56" stroke="#9f5c43" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          <div className="ct-room-desk ct-room-desk-left" />
          <div className="ct-room-desk ct-room-desk-right" />
        </div>
        <div className="ct-room-screen">{children}</div>
      </div>
    </div>
  );
}
