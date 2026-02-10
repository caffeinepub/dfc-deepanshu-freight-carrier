/**
 * Utility to convert backend errors into user-friendly English messages
 * for client authentication flows while preserving original errors for debugging.
 */

export function getClientAuthErrorMessage(error: unknown): string {
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  // Map backend trap messages to user-friendly messages
  
  // Signup-specific errors
  if (errorMessage.includes('An account with this email already exists')) {
    return 'Email already registered. Please use a different email or log in.';
  }
  
  if (errorMessage.includes('account already exists')) {
    return 'An account with this email or mobile already exists. Please log in instead.';
  }
  
  if (errorMessage.includes('Password must be at least 8 characters')) {
    return 'Password must be at least 8 characters long.';
  }
  
  // Account not found - specific message
  if (errorMessage.includes('account not found') || errorMessage.includes('Account not found')) {
    return 'Account not found. Please check your credentials or contact support.';
  }
  
  // Invalid credentials / wrong password
  if (errorMessage.includes('Invalid email/mobile or password')) {
    return 'Invalid email/mobile or password. Please check your credentials and try again.';
  }
  
  if (errorMessage.includes('Invalid credentials')) {
    return 'Invalid email/mobile or password. Please check your credentials and try again.';
  }
  
  // Rate limiting
  if (errorMessage.includes('Too many login attempts')) {
    return 'Too many login attempts. Please try again in 15 minutes.';
  }
  
  if (errorMessage.includes('Too many OTP')) {
    return 'Too many OTP attempts. Please try again later.';
  }
  
  // Session errors
  if (errorMessage.includes('Invalid or expired client session token')) {
    return 'Your session has expired. Please log in again.';
  }
  
  // Password validation
  if (errorMessage.includes('Invalid current password')) {
    return 'Current password is incorrect. Please try again.';
  }
  
  if (errorMessage.includes('New password must be at least 8 characters')) {
    return 'New password must be at least 8 characters long.';
  }
  
  // OTP errors
  if (errorMessage.includes('OTP verification failed')) {
    return 'Invalid OTP. Please check the code and try again.';
  }
  
  if (errorMessage.includes('MSG91 API key not configured')) {
    return 'OTP service is not available. Please use password login or contact support.';
  }
  
  // Generic fallback for unknown errors
  console.error('Unmapped client auth error:', errorMessage);
  return 'An error occurred. Please try again or contact support if the problem persists.';
}
