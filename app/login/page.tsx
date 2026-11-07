'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, Mail, Smartphone } from 'lucide-react';

import { AnimatedCharacters } from '@/components/auth-animated-characters';
import { GoogleMark } from '@/components/google-mark';
import { formatAuthError } from '@/lib/auth/client-errors';
import {
  PHONE_COUNTRIES,
  type PhoneCountryCode,
  isLikelyE164Phone,
  normalizePhoneNumber,
} from '@/lib/auth/phone';
import { createClient } from '@/lib/supabase/client';

type LoginMethod = 'email' | 'phone';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [method, setMethod] = useState<LoginMethod>('email');
  const [email, setEmail] = useState('');
  const [phoneCountryCode, setPhoneCountryCode] = useState<PhoneCountryCode>('CA');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('account') === 'teacher-inactive') {
      setError('Teacher accounts are temporarily unavailable in this version.');
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedPhone = normalizePhoneNumber(phoneCountryCode, phone);
    if ((method === 'email' && !email) || (method === 'phone' && !normalizedPhone) || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (method === 'phone' && !isLikelyE164Phone(normalizedPhone)) {
      setError('Enter a valid phone number with country code.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        ...(method === 'email' ? { email } : { phone: normalizedPhone }),
        password,
      });
      if (authError) throw authError;

      const response = await fetch('/api/auth/role');
      if (!response.ok) throw new Error('Could not verify your account role.');
      const roleData = (await response.json()) as { role?: string };
      const role = roleData.role ?? 'student';
      if (role === 'admin') router.push('/admin');
      else if (role === 'teacher' || data.user?.user_metadata?.role === 'teacher') {
        await supabase.auth.signOut();
        setError('Teacher accounts are temporarily unavailable in this version.');
      } else if (role === 'parent') router.push('/parent');
      else router.push('/student');
    } catch (err: unknown) {
      setError(formatAuthError(err, 'Invalid email, phone, or password.'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/`,
        },
      });
      if (authError) throw authError;
    } catch (err: unknown) {
      setError(formatAuthError(err, 'Google sign in failed.'));
      setGoogleLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setMethod('email');
      setError('Enter your email address first, then request a reset link.');
      return;
    }

    setResetLoading(true);
    setResetMessage('');
    setError('');
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      });
      if (resetError) throw resetError;

      setResetMessage('Password reset link sent. Check your email inbox.');
    } catch (err: unknown) {
      setError(formatAuthError(err, 'Password reset email failed.'));
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="flex w-full min-h-screen bg-[#eef6f7]">
      <div className="relative hidden lg:flex w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-[#eaf8f5] via-[#f2f8ff] to-[#f8f1ff] px-12 py-10 text-slate-800">
        <div className="relative z-10 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#003461] text-lg font-bold text-white shadow-lg shadow-blue-900/15">
            C
          </div>
          <div>
            <div className="text-lg font-bold tracking-tight">CoastalTutor</div>
            <div className="text-xs text-slate-500">A brighter way to learn</div>
          </div>
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center py-8">
          <div className="mb-6 max-w-md text-center">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.24em] text-teal-700">
              Welcome to your learning space
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-800">
              Learning is better together.
            </h2>
          </div>
          <div className="flex h-[390px] w-full items-end justify-center overflow-hidden">
            <div className="origin-bottom scale-[0.82]">
              <AnimatedCharacters
                isTyping={isTyping}
                showPassword={showPassword}
                passwordLength={password.length}
              />
            </div>
          </div>
          <p className="mt-3 text-sm text-slate-500">
            Little helpers are keeping an eye on your sign in.
          </p>
        </div>
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-500">
          <span>Curiosity starts here</span>
          <span>CoastalTutor · Learn at your pace</span>
        </div>
        <div className="pointer-events-none absolute -right-28 top-20 h-80 w-80 rounded-full bg-teal-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-violet-200/40 blur-3xl" />
      </div>
      <div
        className="relative w-full lg:w-1/2 flex flex-col justify-center items-center overflow-hidden p-8"
        style={{
          backgroundColor: '#f8fbfb',
          backgroundImage:
            'linear-gradient(135deg, rgba(0,52,97,0.055) 0 1px, transparent 1px 18px), linear-gradient(90deg, rgba(52,168,83,0.06), transparent 38%), linear-gradient(180deg, rgba(66,133,244,0.06), transparent 44%)',
        }}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#4285F4_0_25%,#EA4335_25%_50%,#FBBC05_50%_75%,#34A853_75%_100%)] opacity-80" />
        <div className="relative w-full max-w-[400px] flex flex-col gap-8">
          <div className="relative h-[170px] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-[#eaf8f5] via-[#f2f8ff] to-[#f8f1ff] lg:hidden">
            <p className="absolute inset-x-0 top-3 z-10 text-center text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">
              Learning is better together.
            </p>
            <div
              className="absolute left-1/2 top-0"
              style={{ transform: 'translateX(-50%) scale(0.42)', transformOrigin: 'top center' }}
            >
              <AnimatedCharacters
                isTyping={isTyping}
                showPassword={showPassword}
                passwordLength={password.length}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="text-[32px] font-semibold text-[#191c1d] tracking-tight">
              Welcome back
            </h1>
            <p className="text-[#424750]">Sign in to your CoastalTutor account.</p>
          </div>
          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-2 rounded-lg bg-[#f8f9fa] p-1">
              <AuthMethodButton
                active={method === 'email'}
                icon={<Mail className="h-4 w-4" />}
                label="Email"
                onClick={() => setMethod('email')}
              />
              <AuthMethodButton
                active={method === 'phone'}
                icon={<Smartphone className="h-4 w-4" />}
                label="Phone"
                onClick={() => setMethod('phone')}
              />
            </div>

            {method === 'email' ? (
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-sm font-semibold text-[#191c1d]">
                  Email Address
                </label>
                <input
                  id="email"
                  type="text"
                  inputMode="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setIsTyping(true)}
                  onBlur={() => setIsTyping(false)}
                  placeholder="student@example.com"
                  className="w-full h-12 bg-[#f8f9fa] border border-[#c2c6d1] rounded-lg px-4 text-[#191c1d] placeholder:text-[#727781] focus:outline-none focus:ring-2 focus:ring-[#003461] transition-all"
                />
              </div>
            ) : (
              <PhoneField
                countryCode={phoneCountryCode}
                phone={phone}
                onCountryChange={(value) => setPhoneCountryCode(value as PhoneCountryCode)}
                onPhoneChange={setPhone}
              />
            )}

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-3">
                <label htmlFor="password" className="text-sm font-semibold text-[#191c1d]">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => void handlePasswordReset()}
                  disabled={resetLoading}
                  className="text-sm font-semibold text-[#003461] hover:underline disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {resetLoading ? 'Sending...' : 'Forgot password?'}
                </button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setIsTyping(true)}
                  onBlur={() => setIsTyping(false)}
                  placeholder="Password"
                  className="w-full h-12 bg-[#f8f9fa] border border-[#c2c6d1] rounded-lg px-4 pr-12 text-[#191c1d] placeholder:text-[#727781] focus:outline-none focus:ring-2 focus:ring-[#003461] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 hover:text-slate-800"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            {error && (
              <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100">
                {error}
              </div>
            )}
            {resetMessage && (
              <div className="text-green-700 text-sm bg-green-50 p-3 rounded-lg border border-green-100">
                {resetMessage}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-[52px] bg-[#003461] hover:bg-[#002b50] active:scale-[0.99] transition-all text-white font-semibold rounded-full shadow-[0px_4px_6px_rgba(0,43,135,0.08)] flex items-center justify-center disabled:opacity-70"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
            </button>
            <button
              type="button"
              onClick={() => void handleGoogleLogin()}
              disabled={googleLoading || loading}
              className="w-full h-12 rounded-full border border-[#dadce0] bg-white text-[#191c1d] font-semibold shadow-[0_1px_2px_rgba(60,64,67,0.08)] hover:bg-[#f8fbff] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {googleLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <GoogleMark />}
              Continue with Google
            </button>
          </form>
          <div className="pt-4 border-t border-[#e7e8e9] text-center">
            <p className="text-[#424750]">
              Don&apos;t have an account?{' '}
              <button
                onClick={() => window.location.assign('/signup')}
                className="text-[#003461] font-semibold hover:underline"
              >
                Create one here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AuthMethodButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-md text-sm font-semibold transition-all ${
        active ? 'bg-white text-[#003461] shadow-sm' : 'text-[#424750] hover:text-[#003461]'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function PhoneField({
  countryCode,
  phone,
  onCountryChange,
  onPhoneChange,
}: {
  countryCode: string;
  phone: string;
  onCountryChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="phone" className="text-sm font-semibold text-[#191c1d]">
        Phone Number
      </label>
      <div className="grid grid-cols-[132px_1fr] gap-2">
        <select
          value={countryCode}
          onChange={(e) => onCountryChange(e.target.value)}
          className="h-12 rounded-lg border border-[#c2c6d1] bg-[#f8f9fa] px-3 text-sm text-[#191c1d] focus:outline-none focus:ring-2 focus:ring-[#003461]"
        >
          {PHONE_COUNTRIES.map((country) => (
            <option key={country.code} value={country.code}>
              {country.code} {country.dialCode}
            </option>
          ))}
        </select>
        <input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
          placeholder="604 555 0123"
          className="h-12 min-w-0 rounded-lg border border-[#c2c6d1] bg-[#f8f9fa] px-4 text-[#191c1d] placeholder:text-[#727781] focus:outline-none focus:ring-2 focus:ring-[#003461]"
        />
      </div>
    </div>
  );
}
