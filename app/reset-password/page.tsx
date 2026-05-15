'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';

import { LeftPanelBrandAcademicImageryHiddenOnMobile } from '@/components/auth-left-panel';
import { formatAuthError } from '@/lib/auth/client-errors';
import { validateNewPassword } from '@/lib/auth/password';
import { createClient } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [callbackError, setCallbackError] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const resetError = new URLSearchParams(window.location.search).get('error') ?? '';
    setCallbackError(resetError);
    setError(resetError);
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const validationError = validateNewPassword(password, confirmPassword);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;

      setMessage('Password updated. Redirecting to sign in...');
      await supabase.auth.signOut();
      window.setTimeout(() => router.replace('/login'), 900);
    } catch (err: unknown) {
      setError(formatAuthError(err, 'Password update failed.'));
    } finally {
      setLoading(false);
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
              Reset password
            </h1>
            <p className="text-[#424750]">Create a new password for your CoastalTutor account.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <PasswordField
              id="newPassword"
              label="New Password"
              value={password}
              onChange={setPassword}
            />
            <PasswordField
              id="confirmPassword"
              label="Confirm Password"
              value={confirmPassword}
              onChange={setConfirmPassword}
            />

            {error && (
              <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100">
                {error}
              </div>
            )}
            {message && (
              <div className="flex items-center gap-2 text-green-700 text-sm bg-green-50 p-3 rounded-lg border border-green-100">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !!callbackError}
              className="w-full h-[52px] bg-[#003461] hover:bg-[#002b50] active:scale-[0.99] transition-all text-white font-semibold rounded-full shadow-[0px_4px_6px_rgba(0,43,135,0.08)] flex items-center justify-center disabled:opacity-70"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Update Password'}
            </button>
          </form>

          <div className="pt-4 border-t border-[#e7e8e9] text-center">
            <button
              onClick={() => router.push('/login')}
              className="text-[#003461] font-semibold hover:underline"
            >
              Back to sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PasswordField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-[#191c1d]">
        {label}
      </label>
      <input
        id={id}
        type="password"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Password"
        className="w-full h-12 bg-[#f8f9fa] border border-[#c2c6d1] rounded-lg px-4 text-[#191c1d] placeholder:text-[#727781] focus:outline-none focus:ring-2 focus:ring-[#003461] transition-all"
      />
    </div>
  );
}
