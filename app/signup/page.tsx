'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, GraduationCap, Loader2, Mail, Presentation, Smartphone, Users } from 'lucide-react';

import { LeftPanelBrandAcademicImageryHiddenOnMobile } from '@/components/auth-left-panel';
import { formatAuthError } from '@/lib/auth/client-errors';
import { PHONE_COUNTRIES, isLikelyE164Phone, normalizePhoneNumber } from '@/lib/auth/phone';
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
  const [countryDialCode, setCountryDialCode] = useState('+1');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedPhone = normalizePhoneNumber(countryDialCode, phone);
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

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        ...(method === 'email' ? { email } : { phone: normalizedPhone }),
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            role: selectedRole,
          },
        },
      });

      if (signUpError) throw signUpError;

      if (selectedRole === 'student') {
        router.push('/onboarding');
      } else if (selectedRole === 'teacher') {
        router.push('/teacher');
      } else {
        router.push('/parent');
      }
    } catch (err: unknown) {
      setError(formatAuthError(err, 'An error occurred during signup.'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      const next =
        selectedRole === 'student'
          ? '/onboarding'
          : selectedRole === 'teacher'
            ? '/teacher'
            : '/parent';
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(
            next,
          )}&role=${selectedRole}`,
        },
      });
      if (authError) throw authError;
    } catch (err: unknown) {
      setError(formatAuthError(err, 'Google signup failed.'));
      setGoogleLoading(false);
    }
  };

  return (
    <div className="flex w-full min-h-screen bg-white">
      <div className="hidden lg:flex w-1/2 flex-col">
        <LeftPanelBrandAcademicImageryHiddenOnMobile />
      </div>

      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 overflow-y-auto">
        <div className="w-full max-w-[500px] flex flex-col gap-10">
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
                  countryDialCode={countryDialCode}
                  phone={phone}
                  onCountryChange={setCountryDialCode}
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

              {error && (
                <div className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-100">
                  {error}
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
