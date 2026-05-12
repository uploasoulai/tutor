"use client";

import { useRouter } from "next/navigation";
import FigmaComponent from "@/components/imports/互动课堂引擎与Ai辅导界面-1/互动课堂引擎与Ai辅导界面";

/**
 * Classroom / AI Tutor Lesson Page
 *
 * Header (TaskFocusedHeaderSuppressesGlobalNav): h-[64px]
 *   Left: X close button (Button: p-[8px] = ~30px) at x:~24
 *   Right: "Save Progress" button (Button1: px-16 py-8) at x: near right edge
 */
export default function ClassroomPage() {
  const router = useRouter();

  return (
    <div className="relative w-full min-h-screen">
      {/* Figma visual layer */}
      <div className="w-full min-h-screen pointer-events-none select-none">
        <FigmaComponent />
      </div>

      {/* Interactive overlay */}
      <div className="absolute inset-0 pointer-events-none">

        {/* ── Header bar (h-[64px]) ── */}

        {/* X close button — top left of header */}
        <button
          style={{ position: "absolute", top: 12, left: 16, width: 40, height: 40 }}
          className="cursor-pointer pointer-events-auto opacity-0 hover:opacity-10 hover:bg-gray-200 rounded-full transition-opacity"
          onClick={() => router.push("/student")}
          aria-label="Close and go back to dashboard"
        />

        {/* "Save Progress" button — top right of header */}
        <button
          style={{ position: "absolute", top: 12, right: 24, width: 140, height: 40 }}
          className="cursor-pointer pointer-events-auto opacity-0 hover:opacity-10 hover:bg-gray-200 rounded-lg transition-opacity"
          onClick={() => router.push("/student")}
          aria-label="Save Progress"
        />

        {/* "Hint" link at the bottom of AI chat */}
        <button
          style={{ position: "absolute", bottom: 20, right: 100, width: 60, height: 28 }}
          className="cursor-pointer pointer-events-auto opacity-0"
          onClick={() => {/* stay on page */}}
          aria-label="Hint"
        />

        {/* "Explain Formula" link */}
        <button
          style={{ position: "absolute", bottom: 20, right: 30, width: 130, height: 28 }}
          className="cursor-pointer pointer-events-auto opacity-0"
          onClick={() => {/* stay on page */}}
          aria-label="Explain Formula"
        />
      </div>
    </div>
  );
}