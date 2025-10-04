// Simple validation functions
export const validateUsername = (username: string): string | null => {
  if (!username.trim()) return 'Username is required';
  if (username.length < 3) return 'Username must be at least 3 characters';
  if (username.length > 20) return 'Username must be less than 20 characters';
  if (!/^[a-zA-Z0-9_]+$/.test(username)) return 'Username can only contain letters, numbers, and underscores';
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  if (password.length > 100) return 'Password must be less than 100 characters';
  return null;
};

export const validateDisplayName = (displayName: string): string | null => {
  if (!displayName.trim()) return 'Display name is required';
  if (displayName.length < 2) return 'Display name must be at least 2 characters';
  if (displayName.length > 50) return 'Display name must be less than 50 characters';
  return null;
};

export const validateConfirmPassword = (password: string, confirmPassword: string): string | null => {
  if (!confirmPassword) return 'Please confirm your password';
  if (password !== confirmPassword) return "Passwords don't match";
  return null;
};
