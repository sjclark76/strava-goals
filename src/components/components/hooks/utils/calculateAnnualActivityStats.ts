import { hoursToSeconds } from 'date-fns';
import {
  ActivityStatsResult,
  InternalSportType,
  SportsStatistic
} from '@/components/components/hooks/types';
import { time } from '@/shared/types/time';
import calculateCommon from '@/components/components/hooks/utils/calculateCommon';
import { SportType } from '@/shared/types/strava/sportType';
import { ActivitySummary } from '@/shared/types/ActivitySummary';
import {
  calculateActivityStreak,
  calculateMovingTime,
  fromBeginningOfYear
} from '@/shared/utils';

function calculateSportsStatistics(
  sports: Record<
    SportType | 'unknown',
    {
      totalTimeSeconds: number;
      count: number;
    }
  >,
  totalMovingTimeSeconds: number
) {
  const sportStatistics: SportsStatistic[] = [];
  for (const sportsType in sports) {
    const sportsStats = sports[sportsType];
    sportStatistics.push({
      sportType: sportsType as InternalSportType,
      totalMovingTime: time(sportsStats.totalTimeSeconds),
      percentage: (sportsStats.totalTimeSeconds / totalMovingTimeSeconds) * 100,
      activityCount: sportsStats.count
    });
  }
  return sportStatistics;
}

const calculateAnnualActivityStats = (
  targetGoalHours: number,
  today: Date,
  activityStats: ActivitySummary[]
): ActivityStatsResult['year'] => {
  const {
    dayOfYear,
    secondsPerDay,
    daysInYear,
    targetGoalSeconds,
    daysRemaining
  } = calculateCommon(targetGoalHours, today);

  const { totalMovingTime: totalMovingTimeSeconds, sports } =
    calculateMovingTime(activityStats);
  const expectedSecondsPerDay = dayOfYear * secondsPerDay;
  const timeAheadForYear = totalMovingTimeSeconds - expectedSecondsPerDay;
  const percentageAhead = Math.round(
    (timeAheadForYear / expectedSecondsPerDay) * 100
  );

  const percentageComplete = Math.round(
    (totalMovingTimeSeconds / hoursToSeconds(targetGoalHours)) * 100
  );
  const averageDailySeconds = totalMovingTimeSeconds / dayOfYear;
  const projectedTotal = averageDailySeconds * daysInYear;

  const secondsPerDayToComplete =
    (targetGoalSeconds - totalMovingTimeSeconds) / daysRemaining;

  const sportStatistics = calculateSportsStatistics(
    sports,
    totalMovingTimeSeconds
  );

  const {
    maxStreak,
    currentStreak,
    currentStreakStartDate,
    maxStreakStartDate,
    activeDayCount
  } = calculateActivityStreak(activityStats, fromBeginningOfYear);

  return {
    secondsPerDayToComplete: time(secondsPerDayToComplete),
    totalMovingTime: time(totalMovingTimeSeconds),
    expectedTotal: time(expectedSecondsPerDay),
    timeAhead: time(timeAheadForYear),
    actualDailyAverage: time(averageDailySeconds),
    projectedTotal: time(projectedTotal),
    percentageComplete,
    percentageAhead,
    sportStatistics,
    activeDays: {
      active: activeDayCount,
      total: dayOfYear
    },
    streaks: {
      currentStreakDays: currentStreak,
      maxStreakDays: maxStreak,
      currentStreakStartDate,
      maxStreakStartDate
    }
  };
};

export default calculateAnnualActivityStats;
