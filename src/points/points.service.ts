import { Injectable, Inject, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserPoints } from './user-points.entity';
import { UserStreaks, StreakType } from './user-streaks.entity';
import { PointTransactions, ActivityType } from './point-transactions.entity';
import {
  DailyActivity,
  ActivityType as DailyActivityType,
} from './daily-activity.entity';
import { PointsStatusDto, PointsHistoryDto } from './dto/points-status.dto';
import {
  ActivityHistoryDto,
  CalendarMonthDto,
} from './dto/activity-history.dto';
import {
  calculateStreakMultiplier,
  areConsecutiveDays,
  isSameDay,
} from './points.helpers';

@Injectable()
export class PointsService {
  private readonly logger = new Logger(PointsService.name);

  constructor(
    @Inject('USER_POINTS_REPOSITORY')
    private userPointsRepository: Repository<UserPoints>,
    @Inject('USER_STREAKS_REPOSITORY')
    private userStreaksRepository: Repository<UserStreaks>,
    @Inject('POINT_TRANSACTIONS_REPOSITORY')
    private pointTransactionsRepository: Repository<PointTransactions>,
    @Inject('DAILY_ACTIVITY_REPOSITORY')
    private dailyActivityRepository: Repository<DailyActivity>,
  ) {}

  /**
   * Update or create user streak
   */
  private async updateStreak(
    userId: number,
    streakType: StreakType,
    activityDate: Date,
  ): Promise<{ currentStreak: number; multiplier: number }> {
    let streak = await this.userStreaksRepository.findOne({
      where: { user: { id: userId }, streakType },
    });

    if (!streak) {
      streak = this.userStreaksRepository.create({
        user: { id: userId } as any,
        streakType,
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: null,
      });
    }

    // Check if this is a consecutive day
    if (streak.lastActivityDate) {
      if (isSameDay(activityDate, streak.lastActivityDate)) {
        // Same day, don't change streak
      } else if (areConsecutiveDays(streak.lastActivityDate, activityDate)) {
        // Consecutive day
        streak.currentStreak += 1;
      } else {
        // Streak broken
        streak.currentStreak = 1;
      }
    } else {
      // First activity
      streak.currentStreak = 1;
    }

    // Update longest streak if current is longer
    if (streak.currentStreak > streak.longestStreak) {
      streak.longestStreak = streak.currentStreak;
    }

    streak.lastActivityDate = activityDate;
    await this.userStreaksRepository.save(streak);

    const multiplier = calculateStreakMultiplier(streak.currentStreak);

    return {
      currentStreak: streak.currentStreak,
      multiplier,
    };
  }

  /**
   * Award points for meal logging
   */
  async awardMealLogPoints(
    userId: number,
    hasPhoto: boolean = false,
    relatedEntityId?: number,
  ): Promise<{
    pointsEarned: number;
    multiplier: number;
    currentStreak: number;
  }> {
    const today = new Date();

    // Update streak
    const { currentStreak, multiplier } = await this.updateStreak(
      userId,
      StreakType.MEAL_LOGGING,
      today,
    );

    // Calculate base points
    let basePoints = 10; // Base points for meal log
    if (hasPhoto) {
      basePoints += 5; // Photo bonus
    }

    // Apply multiplier
    const pointsEarned = Math.round(basePoints * multiplier);

    // Update user's total points
    await this.addPointsToUser(userId, pointsEarned);

    // Record transaction
    await this.recordTransaction(
      userId,
      ActivityType.MEAL_LOG,
      pointsEarned,
      multiplier,
      basePoints,
      `Meal log${hasPhoto ? ' with photo' : ''}`,
      relatedEntityId,
    );

    // Update daily activity
    await this.updateDailyActivity(
      userId,
      today,
      'meal_log',
      pointsEarned,
      multiplier,
    );

    this.logger.log(
      `Awarded ${pointsEarned} points to user ${userId} for meal log (streak: ${currentStreak}, multiplier: ${multiplier}x)`,
    );

    return {
      pointsEarned,
      multiplier,
      currentStreak,
    };
  }

  /**
   * Award points for plate evaluation
   */
  async awardPlateEvaluationPoints(
    userId: number,
    score?: number,
    relatedEntityId?: number,
  ): Promise<{
    pointsEarned: number;
    multiplier: number;
    currentStreak: number;
  }> {
    const today = new Date();

    // Update streak
    const { currentStreak, multiplier } = await this.updateStreak(
      userId,
      StreakType.PLATE_BUILDER,
      today,
    );

    // Calculate base points
    let basePoints = 15; // Base points for plate evaluation

    // High score bonus (8+ score)
    if (score && score >= 8) {
      basePoints += 5;
    }

    // Apply multiplier
    const pointsEarned = Math.round(basePoints * multiplier);

    // Update user's total points
    await this.addPointsToUser(userId, pointsEarned);

    // Record transaction
    await this.recordTransaction(
      userId,
      ActivityType.PLATE_EVALUATION,
      pointsEarned,
      multiplier,
      basePoints,
      `Plate evaluation${score && score >= 8 ? ' (high score)' : ''}`,
      relatedEntityId,
    );

    // Update daily activity
    await this.updateDailyActivity(
      userId,
      today,
      'plate_evaluation',
      pointsEarned,
      multiplier,
    );

    this.logger.log(
      `Awarded ${pointsEarned} points to user ${userId} for plate evaluation (streak: ${currentStreak}, multiplier: ${multiplier}x)`,
    );

    return {
      pointsEarned,
      multiplier,
      currentStreak,
    };
  }

  /**
   * Add points to user's total
   */
  private async addPointsToUser(userId: number, points: number): Promise<void> {
    let userPoints = await this.userPointsRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!userPoints) {
      userPoints = this.userPointsRepository.create({
        user: { id: userId } as any,
        totalPoints: 0,
      });
    }

    userPoints.totalPoints += points;
    await this.userPointsRepository.save(userPoints);
  }

  /**
   * Deduct points from user's total
   */
  private async deductPointsFromUser(
    userId: number,
    points: number,
  ): Promise<void> {
    const userPoints = await this.userPointsRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!userPoints) {
      throw new Error('User points record not found');
    }

    if (userPoints.totalPoints < points) {
      throw new Error(
        `Insufficient points. You have ${userPoints.totalPoints} points, but need ${points} points.`,
      );
    }

    userPoints.totalPoints -= points;
    await this.userPointsRepository.save(userPoints);
  }

  /**
   * Spend points for a specific activity
   */
  async spendPoints(
    userId: number,
    points: number,
    activityType: ActivityType,
    description: string,
    relatedEntityId?: number,
  ): Promise<void> {
    this.logger.log(
      `User ${userId} spending ${points} points for ${activityType}`,
    );

    // Deduct points from user's total
    await this.deductPointsFromUser(userId, points);

    // Record the transaction (negative points for spending)
    await this.recordTransaction(
      userId,
      activityType,
      -points, // Negative to indicate spending
      1.0, // No multiplier for spending
      points,
      description,
      relatedEntityId,
    );

    this.logger.log(`Successfully spent ${points} points for user ${userId}`);
  }

  /**
   * Record a point transaction
   */
  private async recordTransaction(
    userId: number,
    activityType: ActivityType,
    pointsEarned: number,
    streakMultiplier: number,
    basePoints: number,
    description: string,
    relatedEntityId?: number,
  ): Promise<void> {
    const transaction = this.pointTransactionsRepository.create({
      user: { id: userId } as any,
      activityType,
      pointsEarned,
      streakMultiplier,
      basePoints,
      description,
      relatedEntityId,
    });

    await this.pointTransactionsRepository.save(transaction);
  }

  /**
   * Update or create daily activity record
   */
  private async updateDailyActivity(
    userId: number,
    activityDate: Date,
    activityType: 'meal_log' | 'plate_evaluation',
    pointsEarned: number,
    multiplier: number,
  ): Promise<void> {
    const dateOnly = new Date(activityDate);
    dateOnly.setHours(0, 0, 0, 0);

    let dailyActivity = await this.dailyActivityRepository.findOne({
      where: { user: { id: userId }, activityDate: dateOnly },
    });

    if (!dailyActivity) {
      dailyActivity = this.dailyActivityRepository.create({
        user: { id: userId } as any,
        activityDate: dateOnly,
        activityType:
          activityType === 'meal_log'
            ? DailyActivityType.MEAL_LOG
            : DailyActivityType.PLATE_EVALUATION,
        mealLogCount: 0,
        plateEvaluationCount: 0,
        totalPointsEarned: 0,
        averageMultiplier: 0,
      });
    }

    // Update counts and points
    if (activityType === 'meal_log') {
      dailyActivity.mealLogCount += 1;
    } else {
      dailyActivity.plateEvaluationCount += 1;
    }

    dailyActivity.totalPointsEarned += pointsEarned;

    // Update activity type if both activities occurred
    if (
      dailyActivity.mealLogCount > 0 &&
      dailyActivity.plateEvaluationCount > 0
    ) {
      dailyActivity.activityType = DailyActivityType.BOTH;
    }

    // Calculate average multiplier
    const totalActivities =
      dailyActivity.mealLogCount + dailyActivity.plateEvaluationCount;
    dailyActivity.averageMultiplier =
      (dailyActivity.averageMultiplier * (totalActivities - 1) + multiplier) /
      totalActivities;

    await this.dailyActivityRepository.save(dailyActivity);
  }

  /**
   * Get user's points status
   */
  async getPointsStatus(userId: number): Promise<PointsStatusDto> {
    // Get total points
    const userPoints = await this.userPointsRepository.findOne({
      where: { user: { id: userId } },
    });

    // Get streaks
    const mealLoggingStreak = await this.userStreaksRepository.findOne({
      where: { user: { id: userId }, streakType: StreakType.MEAL_LOGGING },
    });

    const plateBuilderStreak = await this.userStreaksRepository.findOne({
      where: { user: { id: userId }, streakType: StreakType.PLATE_BUILDER },
    });

    return {
      totalPoints: userPoints?.totalPoints || 0,
      streaks: {
        mealLogging: {
          currentStreak: mealLoggingStreak?.currentStreak || 0,
          longestStreak: mealLoggingStreak?.longestStreak || 0,
          multiplier: calculateStreakMultiplier(
            mealLoggingStreak?.currentStreak || 0,
          ),
        },
        plateBuilder: {
          currentStreak: plateBuilderStreak?.currentStreak || 0,
          longestStreak: plateBuilderStreak?.longestStreak || 0,
          multiplier: calculateStreakMultiplier(
            plateBuilderStreak?.currentStreak || 0,
          ),
        },
      },
    };
  }

  /**
   * Get user's point transaction history
   */
  async getPointsHistory(
    userId: number,
    limit: number = 50,
  ): Promise<PointsHistoryDto> {
    const transactions = await this.pointTransactionsRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      take: limit,
    });

    const total = await this.pointTransactionsRepository.count({
      where: { user: { id: userId } },
    });

    return {
      transactions: transactions.map((t) => ({
        id: t.id,
        activityType: t.activityType,
        pointsEarned: t.pointsEarned,
        streakMultiplier: Number(t.streakMultiplier),
        basePoints: t.basePoints,
        description: t.description,
        createdAt: t.createdAt,
      })),
      total,
    };
  }

  /**
   * Get calendar data for a specific month
   */
  async getCalendarMonth(
    userId: number,
    year: number,
    month: number,
  ): Promise<CalendarMonthDto> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Last day of the month

    const activities = await this.dailyActivityRepository.find({
      where: {
        user: { id: userId },
        activityDate: {
          $gte: startDate,
          $lte: endDate,
        } as any,
      },
      order: { activityDate: 'ASC' },
    });

    return {
      year,
      month,
      activities: activities.map((a) => ({
        id: a.id,
        activityDate: a.activityDate.toISOString().split('T')[0],
        activityType: a.activityType,
        mealLogCount: a.mealLogCount,
        plateEvaluationCount: a.plateEvaluationCount,
        totalPointsEarned: a.totalPointsEarned,
        averageMultiplier: Number(a.averageMultiplier),
      })),
    };
  }

  /**
   * Get comprehensive activity history
   */
  async getActivityHistory(
    userId: number,
    limit: number = 100,
  ): Promise<ActivityHistoryDto> {
    const dailyActivities = await this.dailyActivityRepository.find({
      where: { user: { id: userId } },
      order: { activityDate: 'DESC' },
      take: limit,
    });

    // Calculate statistics
    const totalActiveDays = dailyActivities.length;
    const totalPoints = dailyActivities.reduce(
      (sum, activity) => sum + activity.totalPointsEarned,
      0,
    );
    const averagePointsPerDay =
      totalActiveDays > 0 ? totalPoints / totalActiveDays : 0;

    // Get longest streak from streaks table
    const mealStreak = await this.userStreaksRepository.findOne({
      where: { user: { id: userId }, streakType: StreakType.MEAL_LOGGING },
    });
    const plateStreak = await this.userStreaksRepository.findOne({
      where: { user: { id: userId }, streakType: StreakType.PLATE_BUILDER },
    });

    const longestStreak = Math.max(
      mealStreak?.longestStreak || 0,
      plateStreak?.longestStreak || 0,
    );

    return {
      dailyActivities: dailyActivities.map((a) => ({
        id: a.id,
        activityDate:
          a.activityDate instanceof Date
            ? a.activityDate.toISOString().split('T')[0]
            : String(a.activityDate).split('T')[0],
        activityType: a.activityType,
        mealLogCount: a.mealLogCount,
        plateEvaluationCount: a.plateEvaluationCount,
        totalPointsEarned: a.totalPointsEarned,
        averageMultiplier: Number(a.averageMultiplier),
      })),
      streakHistory: [], // TODO: Implement streak history calculation
      totalActiveDays,
      longestStreak,
      averagePointsPerDay,
    };
  }
}
