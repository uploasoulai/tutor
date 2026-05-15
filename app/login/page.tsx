'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Mail, Smartphone } from 'lucide-react';

import { LeftPanelBrandAcademicImageryHiddenOnMobile } from '@/components/auth-left-panel';
import { formatAuthError } from '@/lib/auth/client-errors';
import { PHONE_COUNTRIES, isLikelyE164Phone, normalizePhoneNumber } from '@/lib/auth/phone';
import { createClient } from '@/lib/supabase/client';

type LoginMethod = 'email' | 'phone';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [method, setMethod] = useState<LoginMethod>('email');
  const [email, setEmail] = useState('');
  const [countryDialCode, setCountryDialCode] = useState('+1');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedPhone = normalizePhoneNumber(countryDialCode, phone);
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
      const roleData = response.ok ? ((await response.json()) as { role?: string }) : null;
      const role = roleData?.role ?? data.user?.user_metadata?.role ?? 'student';
      if (role === 'admin') router.push('/admin');
      else if (role === 'teacher') router.push('/teacher');
      else if (role === 'parent') router.push('/parent');
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
    <div className="flex w-full min-h-screen bg-white">
      <div className="hidden lg:flex w-1/2 flex-col">
        <LeftPanelBrandAcademicImageryHiddenOnMobile />
      </div>
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8">
        <div className="w-full max-w-[400px] flex flex-col gap-8">
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
                  placeholder="student@example.com"
                  className="w-full h-12 bg-[#f8f9fa] border border-[#c2c6d1] rounded-lg px-4 text-[#191c1d] placeholder:text-[#727781] focus:outline-none focus:ring-2 focus:ring-[#003461] transition-all"
                />
              </div>
            ) : (
              <PhoneField
                countryDialCode={countryDialCode}
                phone={phone}
                onCountryChange={setCountryDialCode}
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
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full h-12 bg-[#f8f9fa] border border-[#c2c6d1] rounded-lg px-4 text-[#191c1d] placeholder:text-[#727781] focus:outline-none focus:ring-2 focus:ring-[#003461] transition-all"
              />
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
              className="w-full h-12 rounded-full border border-[#c2c6d1] bg-white text-[#191c1d] font-semibold hover:bg-[#f8f9fa] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {googleLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[#c2c6d1] text-xs font-bold">
                  G
                </span>
              )}
              Continue with Google
            </button>
          </form>
          <div className="pt-4 border-t border-[#e7e8e9] text-center">
            <p className="text-[#424750]">
              Don&apos;t have an account?{' '}
              <button
                onClick={() => router.push('/signup')}
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
  countryDialCode,
  phone,
  onCountryChange,
  onPhoneChange,
}: {
  countryDialCode: string;
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
          value={countryDialCode}
          onChange={(e) => onCountryChange(e.target.value)}
          className="h-12 rounded-lg border border-[#c2c6d1] bg-[#f8f9fa] px-3 text-sm text-[#191c1d] focus:outline-none focus:ring-2 focus:ring-[#003461]"
        >
          {PHONE_COUNTRIES.map((country) => (
            <option key={country.code} value={country.dialCode}>
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
