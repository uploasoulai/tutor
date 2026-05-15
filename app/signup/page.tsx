'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, GraduationCap, Loader2, Mail, Presentation, Smartphone, Users } from 'lucide-react';

import { LeftPanelBrandAcademicImageryHiddenOnMobile } from '@/components/auth-left-panel';
import { GoogleMark } from '@/components/google-mark';
import { formatAuthError } from '@/lib/auth/client-errors';
import {
  PHONE_COUNTRIES,
  type PhoneCountryCode,
  isLikelyE164Phone,
  normalizePhoneNumber,
} from '@/lib/auth/phone';
import { buildAuthCallbackUrl, getRoleLandingPath } from '@/lib/auth/redirect';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

type Role = 'student' | 'teacher' | 'parent';
type SignupMethod = 'email' | 'phone';

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  const [selectedRole, setSelectedRole] = useState<Role>('student');
  const [method, setMethod] = useState<SignupMethod>('email');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneCountryCode, setPhoneCountryCode] = useState<PhoneCountryCode>('CA');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [phoneCode, setPhoneCode] = useState('');
  const [pendingPhone, setPendingPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedPhone = normalizePhoneNumber(phoneCountryCode, phone);
    const missingIdentity = method === 'email' ? !email : !normalizedPhone;
    if (missingIdentity || !password || !firstName || !lastName) {
      setError('Please fill in all fields.');
      return;
    }
    if (method === 'phone' && !isLikelyE164Phone(normalizedPhone)) {
      setError('Enter a valid phone number with country code.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const next = getRoleLandingPath(selectedRole);
      const { error: signUpError } = await supabase.auth.signUp({
        ...(method === 'email' ? { email } : { phone: normalizedPhone }),
        password,
        options: {
          emailRedirectTo: buildAuthCallbackUrl({
            origin: window.location.origin,
            next,
            role: selectedRole,
          }),
          data: {
            first_name: firstName,
            last_name: lastName,
            role: selectedRole,
          },
        },
      });

      if (signUpError) throw signUpError;

      if (method === 'email') {
        setMessage(
          'Account created. Check your email and click the verification link to continue.',
        );
        return;
      }

      setPendingPhone(normalizedPhone);
      setMessage('Verification code sent. Enter the SMS code to finish registration.');
    } catch (err: unknown) {
      setError(formatAuthError(err, 'An error occurred during signup.'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPhone = async () => {
    if (!pendingPhone || !phoneCode.trim()) {
      setError('Enter the SMS verification code.');
      return;
    }

    setVerifyLoading(true);
    setError('');
    setMessage('');
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        phone: pendingPhone,
        token: phoneCode.trim(),
        type: 'sms',
      });
      if (verifyError) throw verifyError;

      router.push(getRoleLandingPath(selectedRole));
    } catch (err: unknown) {
      setError(formatAuthError(err, 'Phone verification failed.'));
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleResendPhoneCode = async () => {
    const normalizedPhone = pendingPhone || normalizePhoneNumber(phoneCountryCode, phone);
    if (!isLikelyE164Phone(normalizedPhone)) {
      setError('Enter a valid phone number before resending the code.');
      return;
    }

    setVerifyLoading(true);
    setError('');
    setMessage('');
    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'sms',
        phone: normalizedPhone,
      });
      if (resendError) throw resendError;

      setPendingPhone(normalizedPhone);
      setMessage('Verification code resent. Check your SMS messages.');
    } catch (err: unknown) {
      setError(formatAuthError(err, 'Could not resend the verification code.'));
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      const next = getRoleLandingPath(selectedRole);
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: buildAuthCallbackUrl({
            origin: window.location.origin,
            next,
            role: selectedRole,
          }),
        },
      });
      if (authError) throw authError;
    } catch (err: unknown) {
      setError(formatAuthError(err, 'Google signup failed.'));
      setGoogleLoading(false);
    }
  };

  return (
    <div className="flex w-full min-h-screen bg-[#eef6f7]">
      <div className="hidden lg:flex w-1/2 flex-col">
        <LeftPanelBrandAcademicImageryHiddenOnMobile />
      </div>

      <div
        className="relative w-full lg:w-1/2 flex flex-col justify-center items-center overflow-y-auto overflow-x-hidden p-8"
        style={{
          backgroundColor: '#f8fbfb',
          backgroundImage:
            'linear-gradient(135deg, rgba(0,52,97,0.055) 0 1px, transparent 1px 18px), linear-gradient(90deg, rgba(52,168,83,0.06), transparent 38%), linear-gradient(180deg, rgba(66,133,244,0.06), transparent 44%)',
        }}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#4285F4_0_25%,#EA4335_25%_50%,#FBBC05_50%_75%,#34A853_75%_100%)] opacity-80" />
        <div className="relative w-full max-w-[500px] flex flex-col gap-10">
          <div className="flex flex-col gap-2">
            <h1 className="text-[32px] font-semibold text-[#191c1d] tracking-tight">
              Create your account
            </h1>
            <p className="text-[#424750] text-base">Select your role to get started.</p>
          </div>

          <form onSubmit={handleSignup} className="flex flex-col gap-8">
            <div className="grid grid-cols-3 gap-3">
              <RoleCard
                title="Student"
                selected={selectedRole === 'student'}
                onClick={() => setSelectedRole('student')}
                icon={
                  <GraduationCap
                    className={cn(
                      'w-6 h-6',
                      selectedRole === 'student' ? 'text-[#003461]' : 'text-[#424750]',
                    )}
                  />
                }
              />
              <RoleCard
                title="Teacher"
                selected={selectedRole === 'teacher'}
                onClick={() => setSelectedRole('teacher')}
                icon={
                  <Presentation
                    className={cn(
                      'w-6 h-6',
                      selectedRole === 'teacher' ? 'text-[#003461]' : 'text-[#424750]',
                    )}
                  />
                }
              />
              <RoleCard
                title="Parent"
                selected={selectedRole === 'parent'}
                onClick={() => setSelectedRole('parent')}
                icon={
                  <Users
                    className={cn(
                      'w-6 h-6',
                      selectedRole === 'parent' ? 'text-[#003461]' : 'text-[#424750]',
                    )}
                  />
                }
              />
            </div>

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

            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-2 gap-6">
                <InputField
                  label="First Name"
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Jane"
                />
                <InputField
                  label="Last Name"
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                />
              </div>

              {method === 'email' ? (
                <InputField
                  label="Email Address"
                  id="email"
                  inputMode="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@example.com"
                />
              ) : (
                <PhoneField
                  countryCode={phoneCountryCode}
                  phone={phone}
                  onCountryChange={(value) => setPhoneCountryCode(value as PhoneCountryCode)}
                  onPhoneChange={setPhone}
                />
              )}

              <div className="flex flex-col gap-2">
                <InputField
                  label="Password"
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                />
                <p className="text-xs text-[#424750]">Must be at least 8 characters long.</p>
              </div>

              {pendingPhone && (
                <div className="rounded-lg border border-[#c2c6d1] bg-[#f8f9fa] p-4">
                  <label htmlFor="phoneCode" className="text-sm font-semibold text-[#191c1d]">
                    SMS Verification Code
                  </label>
                  <div className="mt-2 grid grid-cols-[1fr_auto] gap-2">
                    <input
                      id="phoneCode"
                      type="text"
                      inputMode="numeric"
                      value={phoneCode}
                      onChange={(e) => setPhoneCode(e.target.value)}
                      placeholder="123456"
                      className="h-11 rounded-lg border border-[#c2c6d1] bg-white px-4 text-[#191c1d] placeholder:text-[#727781] focus:outline-none focus:ring-2 focus:ring-[#003461]"
                    />
                    <button
                      type="button"
                      onClick={() => void handleVerifyPhone()}
                      disabled={verifyLoading}
                      className="inline-flex h-11 items-center justify-center rounded-lg bg-[#003461] px-4 text-sm font-semibold text-white hover:bg-[#002b50] disabled:opacity-70"
                    >
                      {verifyLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify'}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleResendPhoneCode()}
                    disabled={verifyLoading}
                    className="mt-3 text-sm font-semibold text-[#003461] hover:underline disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Resend code
                  </button>
                </div>
              )}

              {error && (
                <div className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-100">
                  {error}
                </div>
              )}
              {message && (
                <div className="text-green-700 text-sm font-medium bg-green-50 p-3 rounded-lg border border-green-100">
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full h-[52px] bg-[#003461] hover:bg-[#002b50] active:scale-[0.99] transition-all text-white font-semibold rounded-full shadow-[0px_4px_6px_rgba(0,43,135,0.08)] flex items-center justify-center disabled:opacity-70"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
              </button>
              <button
                type="button"
                onClick={() => void handleGoogleSignup()}
                disabled={googleLoading || loading}
                className="w-full h-12 rounded-full border border-[#dadce0] bg-white text-[#191c1d] font-semibold shadow-[0_1px_2px_rgba(60,64,67,0.08)] hover:bg-[#f8fbff] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {googleLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <GoogleMark />}
                Continue with Google
              </button>
            </div>
          </form>

          <div className="pt-6 border-t border-[#e7e8e9] text-center">
            <p className="text-[#424750]">
              Already have an account?{' '}
              <button
                onClick={() => router.push('/login')}
                className="text-[#003461] font-semibold hover:underline"
              >
                Sign in here
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
      className={cn(
        'inline-flex h-10 items-center justify-center gap-2 rounded-md text-sm font-semibold transition-all',
        active ? 'bg-white text-[#003461] shadow-sm' : 'text-[#424750] hover:text-[#003461]',
      )}
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

function RoleCard({
  title,
  selected,
  onClick,
  icon,
}: {
  title: string;
  selected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative flex flex-col items-center justify-center p-6 gap-3 rounded-xl transition-all h-[132px]',
        selected
          ? 'bg-[rgba(211,228,255,0.3)] shadow-[0px_4px_12px_0px_rgba(0,43,135,0.08)] ring-2 ring-[#003461] ring-inset'
          : 'bg-[#f8f9fa] border border-[#c2c6d1] hover:bg-gray-100',
      )}
    >
      <div
        className={cn(
          'w-12 h-12 rounded-full flex items-center justify-center',
          selected ? 'bg-[#003461]/10' : 'bg-[#e1e3e4]',
        )}
      >
        {icon}
      </div>
      <span className={cn('font-semibold text-sm', selected ? 'text-[#191c1d]' : 'text-[#424750]')}>
        {title}
      </span>

      <div
        className={cn(
          'absolute bottom-[14px] right-[14px] w-4 h-4 rounded-full flex items-center justify-center transition-all',
          selected
            ? 'bg-[#003461] text-white scale-100'
            : 'border border-gray-400 bg-white scale-0 opacity-0',
        )}
      >
        <Check className="w-2.5 h-2.5" strokeWidth={3} />
      </div>
    </button>
  );
}

function InputField({
  label,
  id,
  type = 'text',
  inputMode,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  id: string;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label htmlFor={id} className="text-sm font-semibold text-[#191c1d]">
        {label}
      </label>
      <input
        id={id}
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full h-12 bg-[#f8f9fa] border border-[#c2c6d1] rounded-lg px-4 text-[#191c1d] placeholder:text-[#727781] focus:outline-none focus:ring-2 focus:ring-[#003461] focus:border-transparent transition-all"
      />
    </div>
  );
}
