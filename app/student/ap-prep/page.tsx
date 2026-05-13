'use client';

import { useRouter } from 'next/navigation';
import FigmaComponent from '@/components/imports/Ap备考专项模块界面-1/Ap备考专项模块界面';

/**
 * AP Preparation Center Page
 *
 * The AP Prep page has a sidebar similar to the student dashboard.
 * AP Prep item is the active/highlighted one.
 *
 * Sidebar layout (left sidebar, absolute top-0 left-0):
 *   The AP Prep page sidebar may differ slightly — it shows:
 *   - "Coastal AI" logo at the top
 *   - Student avatar + "Student Portal" + grade
 *   - Dashboard, My Learning, AP Prep (active), Mastery Reports, Community
 *
 * Based on the screenshot, the nav items appear at slightly different y positions
 * because the header content is different (avatar + name below logo).
 * Estimating from the AP Prep screenshot:
 *   - Logo area: ~60px
 *   - Avatar + Portal text: ~120px
 *   - Nav items start at: ~260px
 *   - Dashboard: y:260, My Learning: y:310, AP Prep: y:360 (active), etc.
 */
export default function ApPrepPage() {
  const router = useRouter();

  return (
    <div className="relative w-full min-h-screen">
      {/* Figma visual layer */}
      <div className="w-full min-h-screen pointer-events-none select-none">
        <FigmaComponent />
      </div>

      {/* Interactive overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* ── Sidebar Navigation ── */}
        {/* The AP Prep page sidebar has a different structure than the student dashboard */}
        {/* From the screenshot, sidebar width is ~200px and nav items appear lower */}

        {/* Dashboard nav link */}
        <button
          style={{ position: 'absolute', top: 248, left: 0, width: 200, height: 44 }}
          className="cursor-pointer pointer-events-auto opacity-0 hover:opacity-5 hover:bg-gray-400 rounded-lg transition-opacity"
          onClick={() => router.push('/student')}
          aria-label="Dashboard"
        />

        {/* My Learning */}
        <button
          style={{ position: 'absolute', top: 298, left: 0, width: 200, height: 44 }}
          className="cursor-pointer pointer-events-auto opacity-0 hover:opacity-5 hover:bg-gray-400 rounded-lg transition-opacity"
          onClick={() => router.push('/student')}
          aria-label="My Learning"
        />

        {/* AP Prep (current — active) */}
        <button
          style={{ position: 'absolute', top: 312, left: 0, width: 200, height: 44 }}
          className="cursor-pointer pointer-events-auto opacity-0 hover:opacity-5 hover:bg-blue-600 rounded-lg transition-opacity"
          onClick={() => router.push('/student/ap-prep')}
          aria-label="AP Prep"
        />

        {/* Mastery Reports */}
        <button
          style={{ position: 'absolute', top: 348, left: 0, width: 200, height: 44 }}
          className="cursor-pointer pointer-events-auto opacity-0 hover:opacity-5 hover:bg-gray-400 rounded-lg transition-opacity"
          onClick={() => router.push('/student')}
          aria-label="Mastery Reports"
        />

        {/* Community */}
        <button
          style={{ position: 'absolute', top: 395, left: 0, width: 200, height: 44 }}
          className="cursor-pointer pointer-events-auto opacity-0 hover:opacity-5 hover:bg-gray-400 rounded-lg transition-opacity"
          onClick={() => router.push('/student')}
          aria-label="Community"
        />

        {/* Start AI Tutor button (bottom of sidebar) */}
        <button
          style={{ position: 'absolute', bottom: 130, left: 8, width: 190, height: 44 }}
          className="cursor-pointer pointer-events-auto opacity-0 hover:opacity-10 hover:bg-blue-900 rounded-lg transition-opacity"
          onClick={() => router.push('/student/lesson')}
          aria-label="Start AI Tutor"
        />

        {/* ── Main Content ── */}

        {/* "Start Diagnostic" button */}
        <button
          style={{ position: 'absolute', top: 400, right: 24, width: 170, height: 44 }}
          className="cursor-pointer pointer-events-auto opacity-0 hover:opacity-10 hover:bg-blue-900 rounded-lg transition-opacity"
          onClick={() => router.push('/student/lesson')}
          aria-label="Start Diagnostic"
        />

        {/* "Start Exam" button (Practice Exam A) */}
        <button
          style={{ position: 'absolute', top: 608, left: 240, width: 150, height: 40 }}
          className="cursor-pointer pointer-events-auto opacity-0 hover:opacity-10 hover:bg-gray-200 rounded-lg transition-opacity"
          onClick={() => router.push('/student/lesson')}
          aria-label="Start Exam"
        />

        {/* "Start Section" button (Section 1 Focus) */}
        <button
          style={{ position: 'absolute', top: 608, left: 440, width: 150, height: 40 }}
          className="cursor-pointer pointer-events-auto opacity-0 hover:opacity-10 hover:bg-gray-200 rounded-lg transition-opacity"
          onClick={() => router.push('/student/lesson')}
          aria-label="Start Section"
        />
      </div>
    </div>
  );
}
