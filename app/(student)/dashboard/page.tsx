"use client";

import { useRouter } from "next/navigation";
import FigmaComponent from "@/components/imports/学生核心仪表盘探索/学生核心仪表盘探索";

/**
 * Student Dashboard Page
 *
 * Sidebar nav item positions (absolute within SideNavBarDesktop, top-0 left-0):
 *   SideNavBarDesktop: absolute left-0 top-0 w-[256px] h-[1024px]
 *   Margin1 (Student Portal heading block): ~96px (24px sidebar-pt → items start at y:24)
 *   List1 (flex-[1_0_0], starts after Margin1): y:120 from page top
 *   ItemActiveDashboardLink: top-[0]  → page y:120
 *   ItemLink (My Learning):  top-[60] → page y:180
 *   ItemLink1 (AP Prep):     top-[120]→ page y:240
 *   ItemLink2 (Mastery):     top-[180]→ page y:300
 *   ItemLink3 (Community):   top-[240]→ page y:360
 *   Container49 (bottom):    ~y:800
 *   Button5 (Start AI Tutor):y:848 (Container49 + pt-[48px])
 *
 * "Start Lesson" button position:
 *   DashboardCanvas: absolute inset-[65px_0_189px_0] p-[64px]
 *   Heading: 72px, gap:24px → BentoGrid starts at y:225
 *   AiSmartPathHeroComponent: row-1 (280px height), card py-[24px] pl-[28px]
 *   Container2 (~128px) + justify-between gap (~34px) + Margin pt-[24px] = 186px from card top
 *   Button y from page top: 225 + 24(card-top-pad) + 128 + 34 + 24 = 435px
 *   Button x: 256(sidebar) + 64(DC-pad) + 28(card-pad) = 348px
 */
export default function StudentDashboardPage() {
  const router = useRouter();

  const sidebarItemStyle = (topOffset: number) => ({
    position: "absolute" as const,
    top: topOffset,
    left: 0,
    width: 256,
    height: 44,
  });

  return (
    <div className="relative w-full min-h-screen overflow-x-hidden">
      {/* Figma visual layer */}
      <div className="w-full min-h-screen pointer-events-none select-none">
        <FigmaComponent />
      </div>

      {/* Interactive overlay */}
      <div className="absolute inset-0 pointer-events-none">

        {/* ── Sidebar Navigation ── */}

        {/* Dashboard (current page) — clicking reloads dashboard */}
        <button
          style={sidebarItemStyle(120)}
          className="cursor-pointer pointer-events-auto opacity-0 hover:opacity-5 hover:bg-blue-600 rounded-lg transition-opacity"
          onClick={() => router.push("/student")}
          aria-label="Dashboard"
        />

        {/* My Learning */}
        <button
          style={sidebarItemStyle(180)}
          className="cursor-pointer pointer-events-auto opacity-0 hover:opacity-5 hover:bg-gray-400 rounded-lg transition-opacity"
          onClick={() => router.push("/student")}
          aria-label="My Learning"
        />

        {/* AP Prep */}
        <button
          style={sidebarItemStyle(240)}
          className="cursor-pointer pointer-events-auto opacity-0 hover:opacity-5 hover:bg-gray-400 rounded-lg transition-opacity"
          onClick={() => router.push("/student/ap-prep")}
          aria-label="AP Prep"
        />

        {/* Mastery Reports */}
        <button
          style={sidebarItemStyle(300)}
          className="cursor-pointer pointer-events-auto opacity-0 hover:opacity-5 hover:bg-gray-400 rounded-lg transition-opacity"
          onClick={() => router.push("/student")}
          aria-label="Mastery Reports"
        />

        {/* Community */}
        <button
          style={sidebarItemStyle(360)}
          className="cursor-pointer pointer-events-auto opacity-0 hover:opacity-5 hover:bg-gray-400 rounded-lg transition-opacity"
          onClick={() => router.push("/student")}
          aria-label="Community"
        />

        {/* Start AI Tutor button */}
        <button
          style={{ position: "absolute", top: 848, left: 12, width: 232, height: 44 }}
          className="cursor-pointer pointer-events-auto opacity-0 hover:opacity-10 hover:bg-blue-900 rounded-lg transition-opacity"
          onClick={() => router.push("/student/lesson")}
          aria-label="Start AI Tutor"
        />

        {/* ── Main Content ── */}

        {/* "Start Lesson →" button in AI Smart Path card */}
        <button
          style={{ position: "absolute", top: 435, left: 348, width: 148, height: 46 }}
          className="cursor-pointer pointer-events-auto opacity-0 hover:opacity-10 hover:bg-blue-600 rounded-lg transition-opacity"
          onClick={() => router.push("/student/lesson")}
          aria-label="Start Lesson"
        />

        {/* "Review Notes" button */}
        <button
          style={{ position: "absolute", top: 435, left: 508, width: 120, height: 46 }}
          className="cursor-pointer pointer-events-auto opacity-0 hover:opacity-10 hover:bg-gray-200 rounded-lg transition-opacity"
          onClick={() => router.push("/student")}
          aria-label="Review Notes"
        />

        {/* Top nav "AP Prep" link in header */}
        <button
          style={{ position: "absolute", top: 0, left: 256, height: 65, width: 120 }}
          className="cursor-pointer pointer-events-auto opacity-0"
          onClick={() => router.push("/student/ap-prep")}
          aria-label="AP Prep (nav)"
        />

        {/* CoastalTutor original entry point */}
        <button
          style={{ position: "fixed", bottom: 20, right: 20, zIndex: 100 }}
          className="bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors pointer-events-auto cursor-pointer"
          onClick={() => router.push("/openmaic")}
        >
          自由探索模式
        </button>
      </div>
    </div>
  );
}
