/**
 * Utility to extract user-friendly error messages from React Query errors
 * for display in the UI. Leverages existing clientAuthErrors mapping when appropriate.
 */

import { getClientAuthErrorMessage } from './clientAuthErrors';

/**
 * Converts a React Query error into a safe, user-facing English message.
 * 
 * Strategy:
 * 1. Extract the error message from various error formats
 * 2. Use getClientAuthErrorMessage for auth-related errors
 * 3. Return user-friendly messages for common error patterns
 * 4. Provide a safe generic fallback for unknown errors
 */
export function getQueryErrorMessage(error: unknown): string {
  // Handle null/undefined
  if (!error) {
    return 'An unexpected error occurred. Please try again.';
  }

  // Extract error message from various formats
  let errorMessage = '';
  
  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else if (typeof error === 'object' && 'message' in error) {
    errorMessage = String((error as any).message);
  } else {
    errorMessage = String(error);
  }

  // Empty or whitespace-only message
  if (!errorMessage.trim()) {
    return 'An unexpected error occurred. Please try again.';
  }

  // Use existing auth error mapping for auth-related errors
  // This handles session expiration, linkage errors, rate limiting, etc.
  const authErrorPatterns = [
    'session',
    'token',
    'authentication',
    'login',
    'password',
    'OTP',
    'linked principal',
    'account not found',
    'credentials',
    'rate limit',
  ];

  const isAuthError = authErrorPatterns.some((pattern) =>
    errorMessage.toLowerCase().includes(pattern.toLowerCase())
  );

  if (isAuthError) {
    return getClientAuthErrorMessage(error);
  }

  // Service unavailability
  if (
    errorMessage.includes('not a function') ||
    errorMessage.includes('has no method') ||
    errorMessage.includes('method not found') ||
    errorMessage.includes('Service unavailable')
  ) {
    return 'Service unavailable. Please contact support.';
  }

  // Network/connection errors
  if (
    errorMessage.includes('network') ||
    errorMessage.includes('fetch failed') ||
    errorMessage.includes('connection')
  ) {
    return 'Network error. Please check your connection and try again.';
  }

  // Actor/backend not available
  if (
    errorMessage.includes('Actor not available') ||
    errorMessage.includes('Backend not available')
  ) {
    return 'Service is initializing. Please wait a moment and try again.';
  }

  // If the error message is already user-friendly (no technical jargon), use it
  const technicalTerms = [
    'trap',
    'reject',
    'canister',
    'call failed',
    'actor',
    'candid',
    'wasm',
    'principal',
    'undefined',
    'null',
  ];

  const hasTechnicalJargon = technicalTerms.some((term) =>
    errorMessage.toLowerCase().includes(term.toLowerCase())
  );

  // If it looks user-friendly and reasonably short, use it
  if (!hasTechnicalJargon && errorMessage.length < 200) {
    return errorMessage;
  }

  // Generic fallback for truly technical/unknown errors
  console.error('Unmapped query error:', errorMessage);
  return 'An error occurred while loading data. Please try again or contact support.';
}
