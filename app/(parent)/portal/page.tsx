"use client";

import { useRouter } from "next/navigation";
import FigmaComponent from "@/components/imports/家长数据中心与分析报告-1/家长数据中心与分析报告";

/**
 * Parent Data Center Page
 *
 * Left sidebar: same pattern as student dashboard (width ~200px)
 * Main content shows: Today's Summary, Subject Mastery chart, Quick Links, Actionable Insights
 *
 * Key interactive elements:
 * - Sidebar nav items (Dashboard highlighted)
 * - "Review AI Recommendations" button
 * - "Detailed Progress Report" quick link
 * - "Teacher Communication" quick link
 * - "Start AI Tutor" button
 */
export default function ParentDashboardPage() {
  const router = useRouter();

  const sidebarItemStyle = (topOffset: number) => ({
    position: "absolute" as const,
    top: topOffset,
    left: 0,
    width: 200,
    height: 44,
  });

  return (
    <div className="relative w-full min-h-screen">
      {/* Figma visual layer */}
      <div className="w-full min-h-screen pointer-events-none select-none">
        <FigmaComponent />
      </div>

      {/* Interactive overlay */}
      <div className="absolute inset-0 pointer-events-none">

        {/* ── Sidebar Navigation ── */}

        {/* Dashboard (active) */}
        <button
          style={sidebarItemStyle(120)}
          className="cursor-pointer pointer-events-auto opacity-0 hover:opacity-5 hover:bg-blue-600 rounded-lg transition-opacity"
          onClick={() => router.push("/parent")}
          aria-label="Dashboard"
        />

        {/* My Learning */}
        <button
          style={sidebarItemStyle(180)}
          className="cursor-pointer pointer-events-auto opacity-0 hover:opacity-5 hover:bg-gray-400 rounded-lg transition-opacity"
          onClick={() => router.push("/parent")}
          aria-label="My Learning"
        />

        {/* AP Prep */}
        <button
          style={sidebarItemStyle(240)}
          className="cursor-pointer pointer-events-auto opacity-0 hover:opacity-5 hover:bg-gray-400 rounded-lg transition-opacity"
          onClick={() => router.push("/parent")}
          aria-label="AP Prep"
        />

        {/* Mastery Reports */}
        <button
          style={sidebarItemStyle(300)}
          className="cursor-pointer pointer-events-auto opacity-0 hover:opacity-5 hover:bg-gray-400 rounded-lg transition-opacity"
          onClick={() => router.push("/parent")}
          aria-label="Mastery Reports"
        />

        {/* Community */}
        <button
          style={sidebarItemStyle(360)}
          className="cursor-pointer pointer-events-auto opacity-0 hover:opacity-5 hover:bg-gray-400 rounded-lg transition-opacity"
          onClick={() => router.push("/parent")}
          aria-label="Community"
        />

        {/* Start AI Tutor button */}
        <button
          style={{ position: "absolute", top: 848, left: 12, width: 180, height: 44 }}
          className="cursor-pointer pointer-events-auto opacity-0 hover:opacity-10 hover:bg-blue-900 rounded-lg transition-opacity"
          onClick={() => router.push("/student/lesson")}
          aria-label="Start AI Tutor"
        />

        {/* ── Main Content ── */}

        {/* "Review AI Recommendations" button (Actionable Insights panel) */}
        <button
          style={{ position: "absolute", top: 650, right: 24, width: 240, height: 44 }}
          className="cursor-pointer pointer-events-auto opacity-0 hover:opacity-10 hover:bg-blue-900 rounded-lg transition-opacity"
          onClick={() => router.push("/parent")}
          aria-label="Review AI Recommendations"
        />

        {/* "Detailed Progress Report" quick link */}
        <button
          style={{ position: "absolute", top: 724, left: 210, width: 400, height: 80 }}
          className="cursor-pointer pointer-events-auto opacity-0 hover:opacity-5 hover:bg-gray-100 rounded-lg transition-opacity"
          onClick={() => router.push("/parent")}
          aria-label="Detailed Progress Report"
        />

        {/* "Teacher Communication" quick link */}
        <button
          style={{ position: "absolute", top: 724, right: 24, width: 400, height: 80 }}
          className="cursor-pointer pointer-events-auto opacity-0 hover:opacity-5 hover:bg-gray-100 rounded-lg transition-opacity"
          onClick={() => router.push("/parent")}
          aria-label="Teacher Communication"
        />
      </div>
    </div>
  );
}