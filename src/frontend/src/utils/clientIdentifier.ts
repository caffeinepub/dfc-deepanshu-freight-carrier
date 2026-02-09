/**
 * Utility to validate and normalize client identifiers (email or mobile).
 * Returns validation result with user-facing English error messages.
 */

export interface IdentifierValidationResult {
  isValid: boolean;
  normalized: string;
  errorMessage?: string;
}

/**
 * Validates and normalizes a client identifier (email or mobile number).
 * 
 * Email validation:
 * - Must contain '@' symbol
 * - Basic format check
 * 
 * Mobile validation:
 * - Must be exactly 10 digits
 * - Only numeric characters allowed
 */
export function validateClientIdentifier(input: string): IdentifierValidationResult {
  const trimmed = input.trim();

  if (!trimmed) {
    return {
      isValid: false,
      normalized: '',
      errorMessage: 'Email or mobile number is required.',
    };
  }

  // Check if input looks like an email (contains @)
  if (trimmed.includes('@')) {
    // Email validation
    if (!trimmed.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return {
        isValid: false,
        normalized: trimmed,
        errorMessage: 'Please enter a valid email address (e.g., user@example.com).',
      };
    }

    return {
      isValid: true,
      normalized: trimmed,
    };
  }

  // Check if input looks like it should be an email but is missing @
  if (trimmed.match(/[a-zA-Z]+\.[a-zA-Z]+/) || trimmed.includes('.com') || trimmed.includes('.in')) {
    return {
      isValid: false,
      normalized: trimmed,
      errorMessage: 'Email address must include "@" symbol (e.g., user@example.com).',
    };
  }

  // Mobile number validation (10 digits only)
  const digitsOnly = trimmed.replace(/\D/g, '');

  if (digitsOnly.length !== 10) {
    return {
      isValid: false,
      normalized: trimmed,
      errorMessage: 'Mobile number must be exactly 10 digits.',
    };
  }

  if (trimmed !== digitsOnly) {
    return {
      isValid: false,
      normalized: trimmed,
      errorMessage: 'Mobile number must contain only digits (0-9).',
    };
  }

  return {
    isValid: true,
    normalized: digitsOnly,
  };
}
