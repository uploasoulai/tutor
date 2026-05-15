export function validateNewPassword(password: string, confirmPassword: string) {
  if (!password || !confirmPassword) {
    return 'Please fill in both password fields.';
  }
  if (password.length < 8) {
    return 'Password must be at least 8 characters long.';
  }
  if (password !== confirmPassword) {
    return 'Passwords do not match.';
  }

  return '';
}
