"use client";

import { useRouter } from "next/navigation";
import FigmaComponent from "@/components/imports/教师干预仪表盘与班级分析-1/教师干预仪表盘与班级分析";

/**
 * Teacher Intervention Dashboard Page
 *
 * Sidebar nav items (same pattern as student dashboard):
 *   Sidebar: absolute left-0 top-0 w-[200px] h-[full]
 *   Nav items use a similar layout to student dashboard.
 *   From the teacher dashboard screenshot, items appear similar.
 *
 * Main content shows priority interventions and class roster.
 */
export default function TeacherDashboardPage() {
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
        {/* Teacher dashboard sidebar similar layout */}

        {/* Dashboard (active) */}
        <button
          style={sidebarItemStyle(120)}
          className="cursor-pointer pointer-events-auto opacity-0 hover:opacity-5 hover:bg-blue-600 rounded-lg transition-opacity"
          onClick={() => router.push("/teacher")}
          aria-label="Dashboard"
        />

        {/* My Learning / My Classes */}
        <button
          style={sidebarItemStyle(180)}
          className="cursor-pointer pointer-events-auto opacity-0 hover:opacity-5 hover:bg-gray-400 rounded-lg transition-opacity"
          onClick={() => router.push("/teacher")}
          aria-label="My Classes"
        />

        {/* AP Prep */}
        <button
          style={sidebarItemStyle(240)}
          className="cursor-pointer pointer-events-auto opacity-0 hover:opacity-5 hover:bg-gray-400 rounded-lg transition-opacity"
          onClick={() => router.push("/teacher")}
          aria-label="AP Prep"
        />

        {/* Mastery Reports */}
        <button
          style={sidebarItemStyle(300)}
          className="cursor-pointer pointer-events-auto opacity-0 hover:opacity-5 hover:bg-gray-400 rounded-lg transition-opacity"
          onClick={() => router.push("/teacher")}
          aria-label="Mastery Reports"
        />

        {/* Community */}
        <button
          style={sidebarItemStyle(360)}
          className="cursor-pointer pointer-events-auto opacity-0 hover:opacity-5 hover:bg-gray-400 rounded-lg transition-opacity"
          onClick={() => router.push("/teacher")}
          aria-label="Community"
        />

        {/* Start AI Tutor button */}
        <button
          style={{ position: "absolute", top: 848, left: 12, width: 180, height: 44 }}
          className="cursor-pointer pointer-events-auto opacity-0 hover:opacity-10 hover:bg-blue-900 rounded-lg transition-opacity"
          onClick={() => router.push("/student/lesson")}
          aria-label="Start AI Tutor"
        />

        {/* ── Main Content Actions ── */}

        {/* "Assign Tutor" button in Priority Interventions for Maya Lin */}
        <button
          style={{ position: "absolute", top: 284, left: 330, width: 130, height: 40 }}
          className="cursor-pointer pointer-events-auto opacity-0 hover:opacity-10 hover:bg-blue-900 rounded-lg transition-opacity"
          onClick={() => router.push("/student/lesson")}
          aria-label="Assign Tutor"
        />

        {/* "Message" button for Maya Lin */}
        <button
          style={{ position: "absolute", top: 284, left: 254, width: 68, height: 40 }}
          className="cursor-pointer pointer-events-auto opacity-0 hover:opacity-10 hover:bg-gray-200 rounded-lg transition-opacity"
          onClick={() => router.push("/teacher")}
          aria-label="Message"
        />

        {/* "Send Check-in" button for David Chen */}
        <button
          style={{ position: "absolute", top: 284, left: 470, width: 150, height: 40 }}
          className="cursor-pointer pointer-events-auto opacity-0 hover:opacity-10 hover:bg-gray-200 rounded-lg transition-opacity"
          onClick={() => router.push("/teacher")}
          aria-label="Send Check-in"
        />

        {/* "Intervene" button in Class Roster for Maya Lin */}
        <button
          style={{ position: "absolute", top: 820, right: 100, width: 100, height: 36 }}
          className="cursor-pointer pointer-events-auto opacity-0 hover:opacity-10 hover:bg-blue-900 rounded-lg transition-opacity"
          onClick={() => router.push("/teacher")}
          aria-label="Intervene"
        />
      </div>
    </div>
  );
}