/** Age helpers for onboarding and search scoring */

export type AgeRangeSlug = 'under_18' | '18_24' | '25_34' | '35_44' | '45_plus';

const RANGE_MIDPOINTS: Record<string, number> = {
  under_18: 16,
  '18_24': 21,
  '18-24': 21,
  '25_34': 30,
  '25-34': 30,
  '35_44': 40,
  '35-44': 40,
  '45_plus': 52,
  '45-54': 50,
  '55+': 60,
};

export function ageToRange(age: number): AgeRangeSlug {
  if (age < 18) return 'under_18';
  if (age <= 24) return '18_24';
  if (age <= 34) return '25_34';
  if (age <= 44) return '35_44';
  return '45_plus';
}

export function rangeToMidpoint(range?: string | null): number | null {
  if (!range) return null;
  return RANGE_MIDPOINTS[range] ?? null;
}

export function resolveUserAge(profile?: {
  age?: number | null;
  age_range?: string | null;
  ageRange?: string | null;
} | null): number | null {
  if (!profile) return null;
  if (typeof profile.age === 'number' && profile.age > 0) return profile.age;
  return rangeToMidpoint(profile.age_range ?? profile.ageRange);
}

/** Higher score = closer in age (used in /search discovery feed) */
export function ageProximityScore(userAge: number, authorAge: number | null): number {
  if (authorAge == null) return 0;
  const diff = Math.abs(userAge - authorAge);
  if (diff <= 3) return 8;
  if (diff <= 7) return 5;
  if (diff <= 12) return 3;
  if (diff <= 20) return 1;
  return 0;
}
