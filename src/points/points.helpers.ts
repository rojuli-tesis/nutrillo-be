/**
 * Calculate streak multiplier based on current streak
 * Base: 1.0x, +0.1x per day, max 3.0x
 */
export const calculateStreakMultiplier = (streakDays: number): number => {
  const multiplier = 1.0 + streakDays * 0.1;
  return Math.min(multiplier, 3.0);
};

/**
 * Check if two dates are consecutive days
 */
export const areConsecutiveDays = (date1: Date, date2: Date): boolean => {
  const day1 = new Date(date1);
  const day2 = new Date(date2);

  day1.setHours(0, 0, 0, 0);
  day2.setHours(0, 0, 0, 0);

  const dayDiff = Math.floor(
    (day2.getTime() - day1.getTime()) / (1000 * 60 * 60 * 24),
  );
  return dayDiff === 1;
};

/**
 * Check if two dates are the same day
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  const day1 = new Date(date1);
  const day2 = new Date(date2);

  day1.setHours(0, 0, 0, 0);
  day2.setHours(0, 0, 0, 0);

  return day1.getTime() === day2.getTime();
};

/**
 * Calculate days difference between two dates
 */
export const getDaysDifference = (date1: Date, date2: Date): number => {
  const day1 = new Date(date1);
  const day2 = new Date(date2);

  day1.setHours(0, 0, 0, 0);
  day2.setHours(0, 0, 0, 0);

  return Math.floor((day2.getTime() - day1.getTime()) / (1000 * 60 * 60 * 24));
};
