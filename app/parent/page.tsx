"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Home, BarChart3, Calendar, Settings,
  LogOut, Sparkles, MessageSquare, BookOpen,
  TrendingUp, Clock, Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SettingsDialog } from "@/components/settings";
import { useSettingsStore } from "@/lib/store/settings";

export default function ParentDashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState("dashboard");
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.replace("/login"); return; }
      if (data.user.user_metadata?.role !== "parent") { router.replace("/student"); return; }
      setUser(data.user);
      setLoading(false);
    });
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f8f9fa]">
        <div className="w-8 h-8 border-4 border-[#003461] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const firstName = user?.user_metadata?.first_name ?? "Parent";

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "progress", label: "Progress Reports", icon: BarChart3 },
    { id: "messages", label: "Teacher Messages", icon: MessageSquare },
    { id: "schedule", label: "Schedule", icon: Calendar },
    { id: "resources", label: "Resources", icon: BookOpen },
  ];

  return (
    <div className="flex min-h-screen bg-[#f8f9fa] font-sans">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-white border-r border-[#e7e8e9] flex flex-col sticky top-0 h-screen">
        <div className="px-6 py-5 border-b border-[#e7e8e9]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#003461] rounded flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="text-lg font-bold text-[#003461] tracking-tight">Coastal<span className="text-[#0057a8]">Tutor</span></span>
          </div>
          <p className="text-[10px] text-[#727781] mt-1 font-medium uppercase tracking-widest">Parent Portal</p>
        </div>
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <div className="flex flex-col gap-0.5">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setActiveNav(id)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium w-full text-left transition-all",
                  activeNav === id ? "bg-[#003461] text-white" : "text-[#424750] hover:bg-[#f0f4ff] hover:text-[#003461]"
                )}>
                <Icon className="w-4 h-4 shrink-0" /> {label}
              </button>
            ))}
          </div>
        </nav>
        <div className="px-3 py-4 border-t border-[#e7e8e9] flex flex-col gap-2">
          <button onClick={() => router.push("/openmaic")}
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-[#003461] bg-blue-50 hover:bg-blue-100 transition-all w-full">
            <Sparkles className="w-4 h-4" /> 自由探索模式
          </button>
          <button onClick={handleSignOut}
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-[#727781] hover:bg-red-50 hover:text-red-500 transition-all w-full">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-[#e7e8e9] px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-xl font-semibold text-[#191c1d]">Parent Dashboard</h1>
            <p className="text-sm text-[#727781]">Hello, {firstName} 👋</p>
          </div>
          <button onClick={() => setSettingsOpen(true)} className="p-2 rounded-full hover:bg-[#f0f4ff] text-[#727781]">
            <Settings className="w-4 h-4" />
          </button>
        </header>

        <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />

        <div className="p-8">
          {/* Today's summary */}
          <h2 className="text-lg font-semibold text-[#191c1d] mb-4">Today&apos;s Summary</h2>
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: "Learning Time", value: "45 mins", icon: Clock, color: "text-blue-600 bg-blue-50" },
              { label: "Mastery Score", value: "78%", icon: TrendingUp, color: "text-green-600 bg-green-50" },
              { label: "Streak", value: "5 days", icon: Star, color: "text-orange-500 bg-orange-50" },
            ].map(s => (
              <div key={s.label} className="bg-white border border-[#e7e8e9] rounded-xl p-5 flex items-center gap-4">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", s.color)}>
                  <s.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-[#727781]">{s.label}</p>
                  <p className="text-2xl font-bold text-[#191c1d]">{s.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* AI Insights */}
          <h2 className="text-lg font-semibold text-[#191c1d] mb-4">AI Insights</h2>
          <div className="bg-white border border-[#e7e8e9] rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-[#003461]/10 rounded-full flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-[#003461]" />
              </div>
              <div>
                <p className="font-semibold text-[#191c1d]">Your child is making great progress!</p>
                <p className="text-sm text-[#424750] mt-1 leading-relaxed">
                  Math mastery has improved 12% this week. Reading consistency is strong with 5 consecutive days of practice.
                  Consider encouraging exploration of the Science curriculum which hasn&apos;t been visited recently.
                </p>
              </div>
            </div>
          </div>

          <p className="text-sm text-[#727781] text-center">More features coming soon — detailed reports, teacher chat, weekly summaries.</p>
        </div>
      </main>
    </div>
  );
}