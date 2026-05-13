'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calculator,
  Check,
  Clock,
  Compass,
  Loader2,
  Palette,
  Sparkles,
  Target,
  UserRound,
} from 'lucide-react';

const GRADES = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9'];
const SUBJECTS = [
  { id: 'Math', label: 'Math', icon: Calculator },
  { id: 'Language Arts', label: 'English Language Arts', icon: BookOpen },
  { id: 'Arts', label: 'Arts Education', icon: Palette },
  { id: 'ADST', label: 'ADST', icon: Compass },
];
const GOALS = ['Catch up', 'Stay on track', 'Get ahead', 'Build confidence'];
const TUTOR_STYLES = ['Patient coach', 'Playful guide', 'Challenge mode'];
const DAILY_MINUTES = [15, 20, 30, 45];

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState('');
  const [firstName, setFirstName] = useState('Student');
  const [profile, setProfile] = useState({
    grade: 'Grade 1',
    subjects: ['Math'],
    goal: 'Build confidence',
    favoriteColor: 'Ocean blue',
    tutorStyle: 'Patient coach',
    dailyMinutes: 20,
    reminderTime: '21:00',
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace('/login');
        return;
      }

      const metadata = data.user.user_metadata ?? {};
      setUserId(data.user.id);
      setFirstName(metadata.first_name ?? metadata.preferred_name ?? 'Student');
      setProfile((current) => ({
        ...current,
        grade: metadata.grade ?? current.grade,
        subjects: metadata.subjects ?? current.subjects,
        goal: metadata.learning_goal ?? current.goal,
        favoriteColor: metadata.favorite_color ?? current.favoriteColor,
        tutorStyle: metadata.tutor_style ?? current.tutorStyle,
        dailyMinutes: metadata.daily_minutes ?? current.dailyMinutes,
        reminderTime: metadata.parent_report_time ?? current.reminderTime,
      }));
      setLoading(false);
    });
  }, [router, supabase.auth]);

  const progress = useMemo(() => ((step + 1) / 5) * 100, [step]);

  const toggleSubject = (subject: string) => {
    setProfile((current) => {
      const subjects = current.subjects.includes(subject)
        ? current.subjects.filter((item) => item !== subject)
        : [...current.subjects, subject];

      return { ...current, subjects: subjects.length ? subjects : ['Math'] };
    });
  };

  const saveAndContinue = async () => {
    if (step < 4) {
      setStep((current) => current + 1);
      return;
    }

    setSaving(true);
    setError('');

    try {
      const gradeLevel = Number(profile.grade.replace('Grade ', ''));
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          onboarding_complete: true,
          grade: profile.grade,
          subjects: profile.subjects,
          learning_goal: profile.goal,
          favorite_color: profile.favoriteColor,
          tutor_style: profile.tutorStyle,
          daily_minutes: profile.dailyMinutes,
          parent_report_time: profile.reminderTime,
        },
      });

      if (updateError) throw updateError;

      await supabase.from('profiles').upsert({
        id: userId,
        role: 'student',
        full_name: firstName,
        preferred_name: firstName,
        language_preference: 'en',
      });

      await supabase.from('students').upsert({
        id: userId,
        grade_level: gradeLevel,
        avatar_preferences: {
          favorite_color: profile.favoriteColor,
          teacher_style: profile.tutorStyle,
        },
        daily_target_minutes: profile.dailyMinutes,
      });

      router.push('/student');
    } catch (err) {
      setError((err as Error).message || 'Could not save onboarding.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f9fa]">
        <Loader2 className="h-8 w-8 animate-spin text-[#003461]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#191c1d]">
      <header className="border-b border-[#e7e8e9] bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#003461] text-sm font-bold text-white">
              C
            </div>
            <div>
              <p className="text-sm font-semibold text-[#003461]">CoastalTutor</p>
              <p className="text-xs text-[#727781]">Student onboarding</p>
            </div>
          </div>
          <button
            onClick={() => router.push('/')}
            className="rounded-md px-3 py-2 text-sm font-medium text-[#424750] hover:bg-[#f0f4ff]"
          >
            Save & exit
          </button>
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl gap-8 px-6 py-8 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-5">
          <div>
            <p className="text-sm font-semibold text-[#003461]">Step {step + 1} of 5</p>
            <div className="mt-3 h-2 rounded-full bg-[#e7e8e9]">
              <div
                className="h-full rounded-full bg-[#003461] transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="space-y-2">
            {['Learner', 'Grade & subject', 'Goals', 'Tutor style', 'Schedule'].map((label, index) => (
              <button
                key={label}
                onClick={() => setStep(index)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium',
                  index === step ? 'bg-[#003461] text-white' : 'text-[#424750] hover:bg-white',
                )}
              >
                <span
                  className={cn(
                    'flex h-5 w-5 items-center justify-center rounded-full text-[11px]',
                    index < step
                      ? 'bg-emerald-500 text-white'
                      : index === step
                        ? 'bg-white text-[#003461]'
                        : 'bg-[#e7e8e9] text-[#727781]',
                  )}
                >
                  {index < step ? <Check className="h-3 w-3" /> : index + 1}
                </span>
                {label}
              </button>
            ))}
          </div>
        </aside>

        <section className="rounded-lg border border-[#e7e8e9] bg-white p-6 shadow-sm">
          {step === 0 && (
            <StepShell icon={UserRound} title={`Hi ${firstName}, let's tune your tutor.`}>
              <p className="max-w-xl text-[#424750]">
                CoastalTutor will use these choices to plan a small daily path, choose BC curriculum
                targets, and personalize the lesson prompt.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {['Ocean blue', 'Forest green', 'Sunset coral', 'Deep purple'].map((color) => (
                  <Choice
                    key={color}
                    selected={profile.favoriteColor === color}
                    onClick={() => setProfile((current) => ({ ...current, favoriteColor: color }))}
                  >
                    {color}
                  </Choice>
                ))}
              </div>
            </StepShell>
          )}

          {step === 1 && (
            <StepShell icon={BookOpen} title="Choose grade and BC subject.">
              <div>
                <p className="mb-3 text-sm font-semibold text-[#424750]">Grade</p>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {GRADES.map((grade) => (
                    <Choice
                      key={grade}
                      selected={profile.grade === grade}
                      onClick={() => setProfile((current) => ({ ...current, grade }))}
                    >
                      {grade}
                    </Choice>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-3 text-sm font-semibold text-[#424750]">Subjects</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {SUBJECTS.map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => toggleSubject(id)}
                      className={cn(
                        'flex items-center gap-3 rounded-lg border p-4 text-left transition-all',
                        profile.subjects.includes(id)
                          ? 'border-[#003461] bg-[#f0f4ff]'
                          : 'border-[#e7e8e9] hover:border-[#003461]',
                      )}
                    >
                      <Icon className="h-5 w-5 text-[#003461]" />
                      <span className="text-sm font-semibold">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </StepShell>
          )}

          {step === 2 && (
            <StepShell icon={Target} title="Set the learning priority.">
              <div className="grid gap-3 sm:grid-cols-2">
                {GOALS.map((goal) => (
                  <Choice
                    key={goal}
                    selected={profile.goal === goal}
                    onClick={() => setProfile((current) => ({ ...current, goal }))}
                  >
                    {goal}
                  </Choice>
                ))}
              </div>
            </StepShell>
          )}

          {step === 3 && (
            <StepShell icon={Sparkles} title="Pick the tutor personality.">
              <div className="grid gap-3">
                {TUTOR_STYLES.map((style) => (
                  <Choice
                    key={style}
                    selected={profile.tutorStyle === style}
                    onClick={() => setProfile((current) => ({ ...current, tutorStyle: style }))}
                  >
                    {style}
                  </Choice>
                ))}
              </div>
            </StepShell>
          )}

          {step === 4 && (
            <StepShell icon={Clock} title="Choose the daily rhythm.">
              <div>
                <p className="mb-3 text-sm font-semibold text-[#424750]">Daily target</p>
                <div className="grid grid-cols-4 gap-2">
                  {DAILY_MINUTES.map((minutes) => (
                    <Choice
                      key={minutes}
                      selected={profile.dailyMinutes === minutes}
                      onClick={() => setProfile((current) => ({ ...current, dailyMinutes: minutes }))}
                    >
                      {minutes} min
                    </Choice>
                  ))}
                </div>
              </div>
              <label className="flex max-w-xs flex-col gap-2 text-sm font-semibold text-[#424750]">
                Parent daily report time
                <input
                  type="time"
                  value={profile.reminderTime}
                  onChange={(event) =>
                    setProfile((current) => ({ ...current, reminderTime: event.target.value }))
                  }
                  className="h-11 rounded-lg border border-[#c2c6d1] bg-white px-3 text-[#191c1d] focus:border-[#003461] focus:outline-none focus:ring-2 focus:ring-[#003461]/20"
                />
              </label>
              <div className="rounded-lg border border-[#e7e8e9] bg-[#f8f9fa] p-4 text-sm text-[#424750]">
                First path: {firstName} starts with {profile.grade} {profile.subjects[0]}. The
                dashboard will read mastery, choose today&apos;s 3 goals, and reuse generated lessons
                when a matching session already exists.
              </div>
            </StepShell>
          )}

          {error && (
            <div className="mt-5 rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between border-t border-[#e7e8e9] pt-5">
            <button
              disabled={step === 0}
              onClick={() => setStep((current) => Math.max(0, current - 1))}
              className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-[#424750] hover:bg-[#f0f4ff] disabled:opacity-40"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <button
              onClick={saveAndContinue}
              disabled={saving}
              className="inline-flex h-11 items-center gap-2 rounded-md bg-[#003461] px-5 text-sm font-semibold text-white hover:bg-[#002b50] disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {step === 4 ? 'Enter dashboard' : 'Continue'}
              {!saving ? <ArrowRight className="h-4 w-4" /> : null}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

function StepShell({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="animate-fadeIn space-y-6">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#003461]/10 text-[#003461]">
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#191c1d]">{title}</h1>
        </div>
      </div>
      {children}
    </div>
  );
}

function Choice({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex min-h-11 items-center justify-between rounded-lg border px-4 py-3 text-left text-sm font-semibold transition-all',
        selected
          ? 'border-[#003461] bg-[#f0f4ff] text-[#003461]'
          : 'border-[#e7e8e9] bg-white text-[#424750] hover:border-[#003461]',
      )}
    >
      {children}
      {selected ? <Check className="h-4 w-4" /> : null}
    </button>
  );
}
