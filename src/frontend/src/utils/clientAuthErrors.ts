/**
 * Utility to convert backend errors into user-friendly English messages
 * for client authentication flows while preserving original errors for debugging.
 * 
 * Strategy:
 * 1. Prefer returning already-English, user-actionable backend error messages when present
 * 2. Detect method-missing / service-unavailable cases and return consistent message
 * 3. Reduce overly-generic fallbacks that hide the backend reason
 */

export function getClientAuthErrorMessage(error: unknown): string {
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  // Method-missing / service-unavailability detection
  // These indicate the backend method doesn't exist yet
  if (
    errorMessage.includes('not a function') ||
    errorMessage.includes('has no method') ||
    errorMessage.includes('method not found')
  ) {
    return 'Service unavailable. Please contact support.';
  }
  
  // If backend explicitly says "not available", preserve that
  if (errorMessage.includes('not available')) {
    return 'Service unavailable. Please contact support.';
  }
  
  // Service unavailability (generic)
  if (errorMessage.includes('Service unavailable')) {
    return 'Service unavailable. Please try again later or contact support.';
  }
  
  // ===== Preserve specific backend auth error messages =====
  // These are controlled, user-friendly messages from the backend
  // We should pass them through directly
  
  // Account existence errors
  if (
    errorMessage.includes('account with this email already exists') ||
    errorMessage.includes('account with this mobile already exists') ||
    errorMessage.includes('account already exists')
  ) {
    // Backend provided specific message - use it
    return errorMessage;
  }
  
  // Password validation errors
  if (
    errorMessage.includes('Password must be at least') ||
    errorMessage.includes('password must be')
  ) {
    // Backend provided specific validation message - use it
    return errorMessage;
  }
  
  // Account not found
  if (errorMessage.includes('Account not found') || errorMessage.includes('account not found')) {
    return 'Account not found. Please check your credentials or sign up.';
  }
  
  // Invalid credentials / wrong password
  if (
    errorMessage.includes('Invalid email/mobile or password') ||
    errorMessage.includes('Invalid credentials') ||
    errorMessage.includes('Incorrect password')
  ) {
    // Backend provided specific auth failure message - use it
    return errorMessage;
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
  
  if (errorMessage.includes('session') && errorMessage.includes('expired')) {
    return 'Your session has expired. Please log in again.';
  }
  
  // Linkage errors
  if (
    errorMessage.includes('no linked principal') ||
    errorMessage.includes('Client account has no linked principal')
  ) {
    return 'Your account is not linked to a client profile. Please contact the administrator.';
  }
  
  // Password change errors
  if (errorMessage.includes('Invalid current password')) {
    return 'Current password is incorrect. Please try again.';
  }
  
  if (errorMessage.includes('New password must be at least')) {
    return errorMessage; // Backend provided specific validation
  }
  
  // OTP errors
  if (errorMessage.includes('OTP verification failed') || errorMessage.includes('Invalid OTP')) {
    return 'Invalid OTP. Please check the code and try again.';
  }
  
  if (
    errorMessage.includes('MSG91 API key not configured') ||
    errorMessage.includes('OTP service is not available')
  ) {
    return 'OTP service is not available. Please use password login or contact support.';
  }
  
  if (errorMessage.includes('OTP login is not available')) {
    return 'OTP login is not available. Please use password login.';
  }
  
  // Login/Signup service errors
  if (errorMessage.includes('Login service is not available')) {
    return 'Login service is not available. Please contact support.';
  }
  
  if (errorMessage.includes('Signup service is not available')) {
    return 'Signup service is not available. Please contact support.';
  }
  
  // ===== Preserve user-friendly backend messages =====
  // If the error message looks like it's already user-friendly
  // (doesn't contain technical jargon), pass it through
  const technicalTerms = [
    'trap',
    'reject',
    'canister',
    'call failed',
    'actor',
    'principal',
    'candid',
    'wasm',
  ];
  
  const hasTechnicalJargon = technicalTerms.some((term) =>
    errorMessage.toLowerCase().includes(term.toLowerCase())
  );
  
  if (!hasTechnicalJargon && errorMessage.length < 200) {
    // Looks like a user-friendly message from backend - use it
    return errorMessage;
  }
  
  // Generic fallback only for truly unknown/technical errors
  console.error('Unmapped client auth error:', errorMessage);
  return 'An error occurred. Please try again or contact support if the problem persists.';
}
