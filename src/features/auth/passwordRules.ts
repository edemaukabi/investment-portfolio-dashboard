/**
 * Password rules for the (simulated) sign-in form. Kept as pure data +
 * functions so the checklist UI and the submit guard share one source of
 * truth and it can be unit-tested.
 */

export interface PasswordRule {
  id: string;
  label: string;
  test: (value: string) => boolean;
}

export const PASSWORD_RULES: PasswordRule[] = [
  { id: 'length', label: 'At least 8 characters', test: (v) => v.length >= 8 },
  { id: 'upper', label: 'An uppercase letter', test: (v) => /[A-Z]/.test(v) },
  { id: 'lower', label: 'A lowercase letter', test: (v) => /[a-z]/.test(v) },
  { id: 'number', label: 'A number', test: (v) => /\d/.test(v) },
];

export interface PasswordStrength {
  passed: number;
  total: number;
  score: 0 | 1 | 2 | 3;
  label: 'Weak' | 'Fair' | 'Good' | 'Strong';
  isValid: boolean;
}

const STRENGTH_LABELS = ['Weak', 'Fair', 'Good', 'Strong'] as const;

export function evaluatePassword(value: string): PasswordStrength {
  const passed = PASSWORD_RULES.filter((rule) => rule.test(value)).length;
  const total = PASSWORD_RULES.length;

  // A bonus tier for length rewards genuinely long passphrases.
  let tier = passed;
  if (value.length >= 12 && passed === total) tier = total + 1;

  const score = Math.min(3, Math.max(0, tier - 1)) as PasswordStrength['score'];

  return {
    passed,
    total,
    score,
    label: STRENGTH_LABELS[score],
    isValid: passed === total,
  };
}
