'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Sparkles } from 'lucide-react';

function LessonContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const grade = searchParams.get('grade') ?? 'Grade 1';
  const subject = searchParams.get('subject') ?? 'Math';
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace('/login');
        return;
      }
      setUser(data.user);
    });
  }, []);

  const firstName = user?.user_metadata?.first_name ?? 'Student';

  const handleOpenFreeExplore = () => {
    // Pass context to the generation engine
    const prompt = `I am a ${grade} student. Please create an interactive lesson on ${subject} aligned with the BC Ministry of Education curriculum.`;
    sessionStorage.setItem('coastaltutor_lesson_prompt', prompt);
    router.push('/openmaic');
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-[#e7e8e9] px-8 py-4 flex items-center gap-4 sticky top-0 z-10">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full hover:bg-[#f0f4ff] text-[#727781] transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-[#191c1d]">{subject}</h1>
          <p className="text-sm text-[#727781]">{grade} · BC Curriculum</p>
        </div>
        <div className="flex items-center gap-1.5 ml-auto">
          <div className="w-6 h-6 bg-[#003461] rounded flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-xs">C</span>
          </div>
          <span className="text-base font-bold text-[#003461] tracking-tight">
            Coastal<span className="text-[#0057a8]">Tutor</span>
          </span>
        </div>
      </header>

      {/* Main */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-2xl w-full text-center flex flex-col items-center gap-8">
          <div className="w-24 h-24 rounded-2xl bg-[#003461] flex items-center justify-center shadow-xl shadow-[#003461]/20">
            <Sparkles className="w-12 h-12 text-white" />
          </div>

          <div>
            <h2 className="text-3xl font-bold text-[#191c1d] mb-3">Ready to learn {subject}?</h2>
            <p className="text-[#424750] text-lg leading-relaxed">
              Hi {firstName}! Your AI tutor will guide you through <strong>{grade}</strong>{' '}
              {subject} topics aligned with the BC Ministry of Education curriculum.
            </p>
          </div>

          <button
            onClick={handleOpenFreeExplore}
            className="flex items-center gap-3 bg-[#003461] hover:bg-[#002b50] text-white font-semibold px-8 py-4 rounded-2xl shadow-lg shadow-[#003461]/20 hover:shadow-xl transition-all text-lg active:scale-[0.98]"
          >
            <Sparkles className="w-5 h-5" />
            Start AI Lesson
          </button>

          <p className="text-sm text-[#727781]">
            Powered by CoastalTutor AI · Aligned with BC curriculum standards
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LessonPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-[#f8f9fa]">
          <div className="w-8 h-8 border-4 border-[#003461] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LessonContent />
    </Suspense>
  );
}
