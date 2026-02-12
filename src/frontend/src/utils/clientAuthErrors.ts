export function getClientAuthErrorMessage(error: any): string {
  if (!error) {
    return 'An unexpected error occurred';
  }

  // If error already has a user-friendly message, use it
  if (typeof error === 'string') {
    return error;
  }

  if (error.message && typeof error.message === 'string') {
    const msg = error.message.toLowerCase();

    // Backend-provided English messages - pass through
    if (
      msg.includes('invalid') ||
      msg.includes('exists') ||
      msg.includes('expired') ||
      msg.includes('not found') ||
      msg.includes('rate limit') ||
      msg.includes('too many') ||
      msg.includes('contact') ||
      msg.includes('linked') ||
      msg.includes('session')
    ) {
      return error.message;
    }

    // Method not found / service unavailable
    if (
      msg.includes('has no method') ||
      msg.includes('not available') ||
      msg.includes('service') ||
      msg.includes('backend')
    ) {
      return 'Service temporarily unavailable. Please try again later.';
    }

    // Network errors
    if (msg.includes('network') || msg.includes('fetch')) {
      return 'Network error. Please check your connection and try again.';
    }

    // Timeout errors
    if (msg.includes('timeout')) {
      return 'Request timed out. Please try again.';
    }

    // Generic trap/rejection
    if (msg.includes('trap') || msg.includes('reject')) {
      return 'Operation failed. Please try again or contact support.';
    }

    // If we have a message but it doesn't match patterns, return it
    return error.message;
  }

  // Variant-style errors from backend
  if (error.__kind__) {
    switch (error.__kind__) {
      case 'invalidCredentials':
        return 'Invalid email/mobile or password';
      case 'rateLimited':
        return 'Too many attempts. Please try again later.';
      case 'emailExists':
        return 'An account with this email already exists';
      case 'mobileExists':
        return 'An account with this mobile number already exists';
      case 'invalidInput':
        return error.invalidInput || 'Invalid input provided';
      case 'invalidOtp':
        return 'Invalid OTP. Please check and try again.';
      case 'expired':
        return 'OTP has expired. Please request a new one.';
      case 'notFound':
        return 'Account not found';
      case 'noSessionToken':
        return 'Session expired. Please log in again.';
      case 'notLinked':
        return 'Your account is not linked. Please contact the administrator.';
      case 'invalidPhone':
        return 'Invalid phone number';
      default:
        return 'An error occurred. Please try again.';
    }
  }

  // Fallback for unknown errors
  return 'An unexpected error occurred. Please try again.';
}
