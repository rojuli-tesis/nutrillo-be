export class DailyActivityDto {
  id: number;
  activityDate: string;
  activityType: string;
  mealLogCount: number;
  plateEvaluationCount: number;
  totalPointsEarned: number;
  averageMultiplier: number;
}

export class CalendarMonthDto {
  year: number;
  month: number;
  activities: DailyActivityDto[];
}

export class StreakHistoryDto {
  streakId: number;
  startDate: string;
  endDate: string;
  duration: number;
  activityType: string;
  totalPoints: number;
}

export class ActivityHistoryDto {
  dailyActivities: DailyActivityDto[];
  streakHistory: StreakHistoryDto[];
  totalActiveDays: number;
  longestStreak: number;
  averagePointsPerDay: number;
}
