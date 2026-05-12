"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FigmaComponent from "@/components/imports/注册与角色选择-1/注册与角色选择";

type Role = "student" | "teacher" | "parent";

export default function RegisterPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<Role>("student");

  const handleSubmit = () => {
    if (selectedRole === "student") router.push("/onboarding");
    else if (selectedRole === "teacher") router.push("/teacher");
    else router.push("/parent");
  };

  return (
    <div className="relative w-full min-h-screen">
      {/* Figma visual layer — pointer-events disabled so overlays work */}
      <div className="w-full min-h-screen pointer-events-none select-none">
        <FigmaComponent />
      </div>

      {/* Interactive overlay — mirrors the Figma layout exactly */}
      <div className="absolute inset-0 flex pointer-events-none">
        {/* Left brand panel — no interactions */}
        <div className="flex-1" />

        {/* Right form panel — mirrors the Figma right panel layout */}
        <div className="flex-1 flex flex-col justify-center overflow-auto">
          <div className="flex flex-col items-center justify-center size-full px-5">
            {/* Mirrors max-w-[600px] MainFormContainer */}
            <div className="w-full max-w-[600px]" style={{ padding: "64px" }}>
              {/* Mirrors Container3 with gap-[80px] */}
              <div className="flex flex-col" style={{ gap: "80px" }}>
                {/* Header placeholder (Heading "Create your account" + subtitle) */}
                <div className="h-[68px]" />

                {/* Role selection cards overlay */}
                {/* FieldsetRoleSelectionBentoGridStyle: pt-[12px] + grid-rows-[132px] */}
                <div
                  className="grid pointer-events-none"
                  style={{
                    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                    gap: "12px",
                    paddingTop: "12px",
                  }}
                >
                  {/* Student card */}
                  <button
                    className="h-[132px] rounded-xl cursor-pointer pointer-events-auto opacity-0 hover:opacity-5 hover:bg-blue-600 transition-opacity"
                    onClick={() => setSelectedRole("student")}
                    aria-label="Select Student role"
                  />
                  {/* Teacher card */}
                  <button
                    className="h-[132px] rounded-xl cursor-pointer pointer-events-auto opacity-0 hover:opacity-5 hover:bg-blue-600 transition-opacity"
                    onClick={() => setSelectedRole("teacher")}
                    aria-label="Select Teacher role"
                  />
                  {/* Parent card */}
                  <button
                    className="h-[132px] rounded-xl cursor-pointer pointer-events-auto opacity-0 hover:opacity-5 hover:bg-blue-600 transition-opacity"
                    onClick={() => setSelectedRole("parent")}
                    aria-label="Select Parent role"
                  />
                </div>

                {/* Form fields area */}
                {/* FormFields: gap-[24px] between Container11/Email/Password/SubmitButton */}
                <div className="flex flex-col pointer-events-none" style={{ gap: "24px" }}>
                  {/* First Name + Last Name grid: grid-rows-[74px] */}
                  <div className="h-[74px]" />
                  {/* Email: label(20px) + gap(4px) + input(52px) = 76px */}
                  <div className="h-[76px]" />
                  {/* Password: label(20px) + gap(4px) + input(52px) + gap(4px) + hint(16px) + pb(12px) = 108px */}
                  <div className="h-[108px]" />
                  {/* Create Account button: py-[16px]*2 + text(20px) = 52px */}
                  <button
                    className="h-[52px] w-full rounded-full cursor-pointer pointer-events-auto opacity-0 hover:opacity-5 hover:bg-blue-900 transition-opacity"
                    onClick={handleSubmit}
                    aria-label="Create Account"
                  />
                </div>

                {/* Login link: pt-[25px] + paragraph(24px) */}
                <div className="pt-[25px] pointer-events-none">
                  <button
                    className="w-full h-6 cursor-pointer pointer-events-auto opacity-0 hover:opacity-5 hover:bg-blue-100 transition-opacity"
                    onClick={() => router.push("/student")}
                    aria-label="Sign in here"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Role indicator badge — shows selected role at bottom right */}
      <div className="fixed bottom-6 right-6 z-50 bg-[#003461] text-white text-sm px-4 py-2 rounded-full shadow-lg pointer-events-none select-none">
        Role: <span className="font-semibold capitalize">{selectedRole}</span>
      </div>
    </div>
  );
}