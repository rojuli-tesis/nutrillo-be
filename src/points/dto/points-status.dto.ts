export class PointsStatusDto {
  totalPoints: number;
  streaks: {
    mealLogging: {
      currentStreak: number;
      longestStreak: number;
      multiplier: number;
    };
    plateBuilder: {
      currentStreak: number;
      longestStreak: number;
      multiplier: number;
    };
  };
}

export class PointTransactionDto {
  id: number;
  activityType: string;
  pointsEarned: number;
  streakMultiplier: number;
  basePoints: number;
  description: string;
  createdAt: Date;
}

export class PointsHistoryDto {
  transactions: PointTransactionDto[];
  total: number;
}
