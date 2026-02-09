import { useInternetIdentity } from '@/hooks/useInternetIdentity';

// This component is deprecated and no longer used in the UI
// Kept for compatibility but not rendered anywhere
export function LoginButton() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();

  // Component is not used in the new password-only admin flow
  return null;
}
