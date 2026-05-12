"use client";

import { useRouter } from "next/navigation";
import FigmaComponent from "@/components/imports/学生入职引导/学生入职引导";

export default function OnboardingPage() {
  const router = useRouter();

  return (
    // Use relative so the absolute overlay spans the full natural height of the page
    <div className="relative w-full">
      {/* Figma visual layer */}
      <div className="w-full pointer-events-none select-none">
        <FigmaComponent />
      </div>

      {/* Interactive overlay — absolute covers full rendered height */}
      <div className="absolute inset-0 pointer-events-none">

        {/* ── Header area ── */}
        {/* GlobalNav header: pt-[48px] + centered max-w-[800px] row */}
        {/* "Save & Exit" button — top right of centered 800px header */}
        {/* Approximate position: within the first 96px of the page, right side */}
        <div
          className="absolute flex items-center justify-end"
          style={{ top: 48, left: "50%", transform: "translateX(-50%)", width: "800px", height: "28px" }}
        >
          <button
            className="h-[28px] px-4 cursor-pointer pointer-events-auto opacity-0 hover:opacity-10 hover:bg-gray-200 rounded transition-opacity"
            onClick={() => router.push("/")}
            aria-label="Save & Exit"
            style={{ minWidth: "80px" }}
          />
        </div>

        {/* ── "Continue to Goals" button inside Step 2 ── */}
        {/*
          Vertical position calculation from page top:
          - pt-[48px]: 48
          - Header row: 28px
          - Header pb-[48px] (GlobalNavMargin): 48 → total header block: 124px
          - ProgressBarMargin: pb-[12px] + 8px = 20px → running: 144px
          - gap-[24px] (MainWizardContainer): first gap between items
          - Step1 (collapsed card): ~90px → 144 + 24 + 90 = 258
          - gap-[24px]: 24 → 282
          - Step2 card starts at 282
          - Step2 content: pt-[52px] → 334
          - Container7 (title+desc ~68px): 334 + 68 = 402
          - gap-[24px]: 426
          - BentoGrid (2 rows×152px + gap-y-12 + pb-24): 340px → 766
          - gap-[24px]: 790
          - ActionButton: pt-[25px] → 815
          - Button within ActionButton: right-aligned, ~36px height
        */}
        <div
          className="absolute flex items-center justify-end"
          style={{ top: 815, left: "50%", transform: "translateX(-50%)", width: "800px", height: "36px", paddingRight: "48px" }}
        >
          <button
            className="h-[36px] cursor-pointer pointer-events-auto opacity-0 hover:opacity-10 hover:bg-blue-100 rounded-lg transition-opacity"
            onClick={() => router.push("/student")}
            aria-label="Continue to Goals"
            style={{ minWidth: "200px" }}
          />
        </div>

        {/* Edit button in Step 1 (collapsed) — allows going back */}
        {/*
          Step1 is at y: 144+24=168 from page top
          Edit button is on the right side of the Step1 card
        */}
        <div
          className="absolute flex items-center justify-end"
          style={{ top: 168, left: "50%", transform: "translateX(-50%)", width: "800px", height: "90px" }}
        >
          <button
            className="h-10 px-4 cursor-pointer pointer-events-auto opacity-0 hover:opacity-10 hover:bg-gray-100 rounded-lg transition-opacity mr-6"
            onClick={() => router.push("/")}
            aria-label="Edit Step 1"
            style={{ minWidth: "60px" }}
          />
        </div>
      </div>
    </div>
  );
}
