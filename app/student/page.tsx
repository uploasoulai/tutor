"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  BookOpen, FlaskConical, Globe, Music, Palette, Dumbbell,
  ChevronRight, Sparkles, BarChart3, Calendar, LogOut,
  GraduationCap, Zap, Home, BookMarked, Users, Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── BC Curriculum Data ────────────────────────────────────────────────────
const GRADES = [
  "Kindergarten", "Grade 1", "Grade 2", "Grade 3", "Grade 4",
  "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9",
  "Grade 10", "Grade 11", "Grade 12",
];

const AP_COURSES = [
  "AP Calculus BC", "AP Physics C", "AP Chemistry", "AP Biology",
  "AP English Literature", "AP English Language", "AP World History",
  "AP Computer Science A", "AP Statistics", "AP Economics",
];

const SUBJECTS_BY_GRADE: Record<string, { name: string; icon: React.FC<any>; color: string }[]> = {
  "Kindergarten": [
    { name: "Reading & Writing", icon: BookOpen, color: "bg-blue-100 text-blue-600" },
    { name: "Math", icon: BookMarked, color: "bg-green-100 text-green-600" },
    { name: "Science", icon: FlaskConical, color: "bg-purple-100 text-purple-600" },
    { name: "Social Studies", icon: Globe, color: "bg-orange-100 text-orange-600" },
    { name: "Art", icon: Palette, color: "bg-pink-100 text-pink-600" },
    { name: "PE", icon: Dumbbell, color: "bg-red-100 text-red-600" },
  ],
  "Grade 1": [
    { name: "Language Arts", icon: BookOpen, color: "bg-blue-100 text-blue-600" },
    { name: "Math", icon: BookMarked, color: "bg-green-100 text-green-600" },
    { name: "Science", icon: FlaskConical, color: "bg-purple-100 text-purple-600" },
    { name: "Social Studies", icon: Globe, color: "bg-orange-100 text-orange-600" },
    { name: "Music", icon: Music, color: "bg-yellow-100 text-yellow-600" },
    { name: "PE", icon: Dumbbell, color: "bg-red-100 text-red-600" },
  ],
};

// Grades 2-7: same core subjects
["Grade 2","Grade 3","Grade 4","Grade 5","Grade 6","Grade 7"].forEach(g => {
  SUBJECTS_BY_GRADE[g] = [
    { name: "Language Arts", icon: BookOpen, color: "bg-blue-100 text-blue-600" },
    { name: "Math", icon: BookMarked, color: "bg-green-100 text-green-600" },
    { name: "Science", icon: FlaskConical, color: "bg-purple-100 text-purple-600" },
    { name: "Social Studies", icon: Globe, color: "bg-orange-100 text-orange-600" },
    { name: "Music", icon: Music, color: "bg-yellow-100 text-yellow-600" },
    { name: "Art", icon: Palette, color: "bg-pink-100 text-pink-600" },
    { name: "PE", icon: Dumbbell, color: "bg-red-100 text-red-600" },
  ];
});

// Grades 8-12: departmentalized
["Grade 8","Grade 9","Grade 10","Grade 11","Grade 12"].forEach(g => {
  SUBJECTS_BY_GRADE[g] = [
    { name: "English", icon: BookOpen, color: "bg-blue-100 text-blue-600" },
    { name: "Math", icon: BookMarked, color: "bg-green-100 text-green-600" },
    { name: "Science", icon: FlaskConical, color: "bg-purple-100 text-purple-600" },
    { name: "Social Studies", icon: Globe, color: "bg-orange-100 text-orange-600" },
    { name: "French / Mandarin", icon: Globe, color: "bg-teal-100 text-teal-600" },
    { name: "PE & Health", icon: Dumbbell, color: "bg-red-100 text-red-600" },
    { name: "Arts", icon: Palette, color: "bg-pink-100 text-pink-600" },
  ];
});

// ─── Component ─────────────────────────────────────────────────────────────
export default function StudentDashboard() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [apMode, setApMode] = useState(false);
  const [activeNav, setActiveNav] = useState("dashboard");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.replace("/login"); return; }
      setUser(data.user);
      // Restore saved grade from metadata if exists
      const savedGrade = data.user.user_metadata?.grade;
      if (savedGrade) setSelectedGrade(savedGrade);
      setLoading(false);
    });
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  const handleSelectGrade = async (grade: string) => {
    setSelectedGrade(grade);
    setApMode(false);
    // Persist grade choice to Supabase metadata
    await supabase.auth.updateUser({ data: { grade } });
  };

  const handleStartLesson = (subject: string) => {
    const params = new URLSearchParams({ grade: selectedGrade!, subject });
    router.push(`/student/lesson?${params.toString()}`);
  };

  const handleStartApCourse = (course: string) => {
    const params = new URLSearchParams({ grade: "AP", subject: course });
    router.push(`/student/lesson?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f8f9fa]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#003461] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#424750] text-sm">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  const firstName = user?.user_metadata?.first_name ?? "Student";
  const subjects = selectedGrade ? (SUBJECTS_BY_GRADE[selectedGrade] ?? []) : [];

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "learning", label: "My Learning", icon: BookOpen },
    { id: "ap", label: "AP Prep", icon: GraduationCap },
    { id: "mastery", label: "Mastery", icon: BarChart3 },
    { id: "schedule", label: "Schedule", icon: Calendar },
    { id: "community", label: "Community", icon: Users },
  ];

  return (
    <div className="flex min-h-screen bg-[#f8f9fa] font-sans">
      {/* ─── Sidebar ─────────────────────────────────────────── */}
      <aside className="w-64 shrink-0 bg-white border-r border-[#e7e8e9] flex flex-col sticky top-0 h-screen">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-[#e7e8e9]">
          <img src="/logo-horizontal.png" alt="CoastalTutor" className="h-8" />
          <p className="text-[10px] text-[#727781] mt-1 font-medium uppercase tracking-widest">Student Portal</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <div className="flex flex-col gap-0.5">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => { setActiveNav(id); if (id === "ap") setApMode(true); else setApMode(false); }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium w-full text-left transition-all",
                  activeNav === id
                    ? "bg-[#003461] text-white"
                    : "text-[#424750] hover:bg-[#f0f4ff] hover:text-[#003461]"
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </button>
            ))}
          </div>
        </nav>

        {/* Bottom actions */}
        <div className="px-3 py-4 border-t border-[#e7e8e9] flex flex-col gap-2">
          <button
            onClick={() => router.push("/openmaic")}
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-[#003461] bg-blue-50 hover:bg-blue-100 transition-all w-full"
          >
            <Sparkles className="w-4 h-4" />
            自由探索模式
          </button>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-[#727781] hover:bg-red-50 hover:text-red-500 transition-all w-full"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ─── Main Content ────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        {/* Top Header */}
        <header className="bg-white border-b border-[#e7e8e9] px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-xl font-semibold text-[#191c1d]">
              {apMode ? "AP Exam Prep" : selectedGrade ? `${selectedGrade} — Choose a Subject` : "Welcome back! Choose your grade."}
            </h1>
            <p className="text-sm text-[#727781]">Hello, {firstName} 👋</p>
          </div>
          <div className="flex items-center gap-3">
            {selectedGrade && !apMode && (
              <button
                onClick={() => { setSelectedGrade(null); setApMode(false); }}
                className="text-sm text-[#003461] hover:underline font-medium"
              >
                ← Change Grade
              </button>
            )}
            {apMode && (
              <button
                onClick={() => setApMode(false)}
                className="text-sm text-[#003461] hover:underline font-medium"
              >
                ← Back to Dashboard
              </button>
            )}
            <button onClick={() => router.push("/settings")} className="p-2 rounded-full hover:bg-[#f0f4ff] text-[#727781] transition-all">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </header>

        <div className="p-8">

          {/* ── AP Mode ─────────────────────────────── */}
          {apMode && (
            <div className="animate-fadeIn">
              <p className="text-[#424750] mb-6 max-w-2xl">
                Choose an AP course to start a focused AI-powered prep session aligned with College Board standards.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {AP_COURSES.map((course) => (
                  <button
                    key={course}
                    onClick={() => handleStartApCourse(course)}
                    className="group flex items-center justify-between gap-3 bg-white border border-[#e7e8e9] rounded-xl p-5 text-left hover:border-[#003461] hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#003461]/10 flex items-center justify-center shrink-0">
                        <Zap className="w-5 h-5 text-[#003461]" />
                      </div>
                      <span className="font-semibold text-sm text-[#191c1d] leading-tight">{course}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#c2c6d1] group-hover:text-[#003461] shrink-0 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Grade Selector ───────────────────────── */}
          {!apMode && !selectedGrade && (
            <div className="animate-fadeIn">
              <p className="text-[#424750] mb-6 max-w-2xl">
                Select your grade to see your BC curriculum subjects and start an AI-powered lesson.
              </p>

              {/* K-12 Grade grid */}
              <div className="mb-8">
                <h2 className="text-sm font-semibold text-[#727781] uppercase tracking-wider mb-3">K – Grade 12</h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                  {GRADES.map((grade) => (
                    <button
                      key={grade}
                      onClick={() => handleSelectGrade(grade)}
                      className="group flex flex-col items-center justify-center bg-white border border-[#e7e8e9] rounded-xl p-4 hover:border-[#003461] hover:shadow-md transition-all aspect-square"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#003461]/10 flex items-center justify-center mb-2 group-hover:bg-[#003461] transition-colors">
                        <GraduationCap className="w-5 h-5 text-[#003461] group-hover:text-white transition-colors" />
                      </div>
                      <span className="text-xs font-semibold text-[#191c1d] text-center leading-tight">{grade}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* AP Section */}
              <div>
                <h2 className="text-sm font-semibold text-[#727781] uppercase tracking-wider mb-3">Advanced Placement (AP)</h2>
                <button
                  onClick={() => { setApMode(true); setActiveNav("ap"); }}
                  className="group flex items-center gap-4 bg-gradient-to-r from-[#003461] to-[#0057a8] text-white rounded-xl p-5 w-full max-w-sm hover:shadow-lg transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-base">AP Exam Prep</p>
                    <p className="text-sm text-white/70">{AP_COURSES.length} courses available</p>
                  </div>
                  <ChevronRight className="w-5 h-5 ml-auto text-white/60 group-hover:text-white transition-colors" />
                </button>
              </div>
            </div>
          )}

          {/* ── Subject Grid ─────────────────────────── */}
          {!apMode && selectedGrade && (
            <div className="animate-fadeIn">
              <p className="text-[#424750] mb-6">
                Your BC curriculum subjects for <span className="font-semibold text-[#191c1d]">{selectedGrade}</span>. Tap a subject to start your AI lesson.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
                {subjects.map(({ name, icon: Icon, color }) => (
                  <button
                    key={name}
                    onClick={() => handleStartLesson(name)}
                    className="group flex flex-col gap-4 bg-white border border-[#e7e8e9] rounded-xl p-6 text-left hover:border-[#003461] hover:shadow-md transition-all"
                  >
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", color)}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#191c1d] text-sm">{name}</p>
                      <p className="text-xs text-[#727781] mt-0.5">{selectedGrade} · BC Curriculum</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-[#003461] font-medium mt-auto group-hover:gap-2 transition-all">
                      Start Lesson <ChevronRight className="w-3 h-3" />
                    </div>
                  </button>
                ))}
              </div>

              {/* Quick AP access from subject page */}
              <div className="border-t border-[#e7e8e9] pt-6">
                <button
                  onClick={() => { setApMode(true); setActiveNav("ap"); }}
                  className="flex items-center gap-2 text-sm text-[#003461] font-medium hover:underline"
                >
                  <Zap className="w-4 h-4" />
                  Switch to AP Prep instead
                </button>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
