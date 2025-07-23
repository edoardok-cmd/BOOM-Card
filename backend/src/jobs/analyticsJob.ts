import { CronJob } from 'cron';
import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';
import { logger } from '../utils/logger';
import { Decimal } from '@prisma/client/runtime/library';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

interface AnalyticsMetrics {
  totalTransactions: number;
  totalSavings: Decimal;
  averageTransactionValue: Decimal;
  peakHour: number;
  topCategories: Array<{ category: string; count: number }>;
  topPartners: Array<{ partnerId: string; name: string; transactions: number }>;
}

interface PartnerAnalytics {
  partnerId: string;
  period: string;
  totalTransactions: number;
  totalRevenue: Decimal;
  totalSavings: Decimal;
  uniqueCustomers: number;
  averageTransactionValue: Decimal;
  peakHours: number[];
  categoryBreakdown: Record<string, number>;
  customerRetentionRate: number;
  newCustomers: number;
  returningCustomers: number;
}

interface PlatformAnalytics {
  period: string;
  activeUsers: number;
  newUsers: number;
  totalTransactions: number;
  totalRevenue: Decimal;
  totalSavings: Decimal;
  averageTransactionValue: Decimal;
  userEngagementRate: number;
  partnerGrowthRate: number;
  categoryPerformance: Array<{
    category: string;
    transactions: number;
    revenue: Decimal;
    growth: number;
  }>;
  geographicDistribution: Array<{
    city: string;
    transactions: number;
    users: number;
  }>;
}

export class AnalyticsProcessor {
  private static instance: AnalyticsProcessor;
  private dailyJob: CronJob;
  private hourlyJob: CronJob;
  private realtimeJob: CronJob;

  private constructor() {
    // Process real-time analytics every 5 minutes
    this.realtimeJob = new CronJob('*/5 * * * *', this.processRealtimeAnalytics.bind(this));
    
    // Process hourly analytics
    this.hourlyJob = new CronJob('0 * * * *', this.processHourlyAnalytics.bind(this));
    
    // Process daily analytics at 2 AM
    this.dailyJob = new CronJob('0 2 * * *', this.processDailyAnalytics.bind(this));
  }

  public static getInstance(): AnalyticsProcessor {
    if (!AnalyticsProcessor.instance) {
      AnalyticsProcessor.instance = new AnalyticsProcessor();
    }
    return AnalyticsProcessor.instance;
  }

  public start(): void {
    this.realtimeJob.start();
    this.hourlyJob.start();
    this.dailyJob.start();
    logger.info('Analytics jobs started');
  }

  public stop(): void {
    this.realtimeJob.stop();
    this.hourlyJob.stop();
    this.dailyJob.stop();
    logger.info('Analytics jobs stopped');
  }

  private async processRealtimeAnalytics(): Promise<void> {
    try {
      const startTime = Date.now();
      logger.info('Starting real-time analytics processing');

      // Get transactions from last 5 minutes
      const fiveMinutesAgo = dayjs().subtract(5, 'minutes').toDate();
      const transactions = await prisma.transaction.findMany({
        where: {
          createdAt: { gte: fiveMinutesAgo },
          status: 'COMPLETED'
        },
        include: {
          partner: true,
          user: true
        });

      // Update real-time metrics in Redis
      const metrics: AnalyticsMetrics = {
        totalTransactions: transactions.length,
        totalSavings: transactions.reduce((sum, t) => sum.add(t.savingsAmount), new Decimal(0)),
        averageTransactionValue: transactions.length > 0 
          ? transactions.reduce((sum, t) => sum.add(t.amount), new Decimal(0)).div(transactions.length)
          : new Decimal(0),
        peakHour: this.calculatePeakHour(transactions),
        topCategories: await this.getTopCategories(transactions),
        topPartners: await this.getTopPartners(transactions)
      };

      await redis.setex(
        'analytics:realtime:metrics',
        300, // 5 minutes TTL
        JSON.stringify(metrics, this.decimalReplacer)
      );

      // Update partner-specific real-time metrics
      const partnerMetrics = new Map<string, any[]>();
      transactions.forEach(transaction => {)
        if (!partnerMetrics.has(transaction.partnerId)) {
          partnerMetrics.set(transaction.partnerId, []);
        }
        partnerMetrics.get(transaction.partnerId)!.push(transaction);
      });

      for (const [partnerId, partnerTransactions] of partnerMetrics) {
        const partnerRealtime = {
          transactions: partnerTransactions.length,
          revenue: partnerTransactions.reduce((sum, t) => sum.add(t.amount), new Decimal(0)),
          savings: partnerTransactions.reduce((sum, t) => sum.add(t.savingsAmount), new Decimal(0)),
          uniqueCustomers: new Set(partnerTransactions.map(t => t.userId)).size
        };

        await redis.setex(
          `analytics:realtime:partner:${partnerId}`,
          300,
          JSON.stringify(partnerRealtime, this.decimalReplacer)
        );
      }

      const processingTime = Date.now() - startTime;
      logger.info(`Real-time analytics processed in ${processingTime}ms`);
    } catch (error) {
      logger.error('Error processing real-time analytics:', error);
    }

  private async processHourlyAnalytics(): Promise<void> {
    try {
      logger.info('Starting hourly analytics processing');

      const hourStart = dayjs().startOf('hour').toDate();
      const hourEnd = dayjs().endOf('hour').toDate();

      // Process platform-wide hourly metrics
      const hourlyTransactions = await prisma.transaction.findMany({
        where: {
          createdAt: {
            gte: hourStart,
            lte: hourEnd
          },
          status: 'COMPLETED'
        },
        include: {
          partner: true,
          user: true
        });

      const hourlyMetrics = {
        hour: dayjs().hour(),
        date: dayjs().format('YYYY-MM-DD'),
        totalTransactions: hourlyTransactions.length,
        totalRevenue: hourlyTransactions.reduce((sum, t) => sum.add(t.amount), new Decimal(0)),
        totalSavings: hourlyTransactions.reduce((sum, t) => sum.add(t.savingsAmount), new Decimal(0)),
        uniqueUsers: new Set(hourlyTransactions.map(t => t.userId)).size,
        uniquePartners: new Set(hourlyTransactions.map(t => t.partnerId)).size,
        averageTransactionValue: hourlyTransactions.length > 0
          ? hourlyTransactions.reduce((sum, t) => sum.add(t.amount), new Decimal(0)).div(hourlyTransactions.length)
          : new Decimal(0)
      };

      // Store hourly metrics
      await prisma.analyticsHourly.create({
        data: {
          hour: hourlyMetrics.hour,
          date: new Date(hourlyMetrics.date),
          totalTransactions: hourlyMetrics.totalTransactions,
          totalRevenue: hourlyMetrics.totalRevenue,
          totalSavings: hourlyMetrics.totalSavings,
          uniqueUsers: hourlyMetrics.uniqueUsers,
          uniquePartners: hourlyMetrics.uniquePartners,
          averageTransactionValue: hourlyMetrics.averageTransactionValue
        });

      // Process partner-specific hourly analytics
      await this.processPartnerHourlyAnalytics(hourlyTransactions);

      // Update Redis cache with latest hourly data
      await redis.setex(
        `analytics:hourly:${dayjs().format('YYYY-MM-DD-HH')}`,
        86400, // 24 hours TTL
        JSON.stringify(hourlyMetrics, this.decimalReplacer)
      );

      logger.info(`Hourly analytics processed in ${processingTime}ms`);
    } catch (error) {
      logger.error('Error processing hourly analytics:', error);
    }

  private async processDailyAnalytics(): Promise<void> {
    try {
      logger.info('Starting daily analytics processing');

      const yesterday = dayjs().subtract(1, 'day');
      const dayStart = yesterday.startOf('day').toDate();
      const dayEnd = yesterday.endOf('day').toDate();

      // Get all transactions for the day
      const dailyTransactions = await prisma.transaction.findMany({
        where: {
          createdAt: {
            gte: dayStart,
            lte: dayEnd
          },
          status: 'COMPLETED'
        },
        include: {
          partner: {
            include: {
              businessCategory: true
            },
          user: true
        });

      // Calculate platform analytics
      const platformAnalytics: PlatformAnalytics = await this.calculatePlatformAnalytics(
        dailyTransactions,
        yesterday.format('YYYY-MM-DD')
      );

      // Store daily platform analytics
      await prisma.analyticsDaily.create({
        data: {
          date: dayStart,
          activeUsers: platformAnalytics.activeUsers,
          newUsers: platformAnalytics.newUsers,
          totalTransactions: platformAnalytics.totalTransactions,
          totalRevenue: platformAnalytics.totalRevenue,
          totalSavings: platformAnalytics.totalSavings,
          averageTransactionValue: platformAnalytics.averageTransactionValue,
          userEngagementRate: platformAnalytics.userEngagementRate,
          partnerGrowthRate: platformAnalytics.partnerGrowthRate,
          categoryPerformance: platformAnalytics.categoryPerformance,
          geographicDistribution: platformAnalytics.geographicDistribution
        });

      // Process partner analytics
      await this.processPartnerDailyAnalytics(dailyTransactions, yesterday.format('YYYY-MM-DD'));

      // Generate and store reports
      await this.generateDailyReports(platformAnalytics, yesterday.format('YYYY-MM-DD'));

      // Clean up old data
      await this.cleanupOldAnalytics();

      logger.info(`Daily analytics processed in ${processingTime}ms`);
    } catch (error) {
      logger.error('Error processing daily analytics:', error);
    }

  private async processPartnerHourlyAnalytics(transactions: any[]): Promise<void> {
    const partnerGroups = new Map<string, any[]>();
    
    transactions.forEach(transaction => {)
      if (!partnerGroups.has(transaction.partnerId)) {
        partnerGroups.set(transaction.partnerId, []);
      }
      partnerGroups.get(transaction.partnerId)!.push(transaction);
    });

    for (const [partnerId, partnerTransactions] of partnerGroups) {
      const metrics = {
        partnerId,
        hour: dayjs().hour(),
        date: dayjs().format('YYYY-MM-DD'),
        transactions: partnerTransactions.length,
        revenue: partnerTransactions.reduce((sum, t) => sum.add(t.amount), new Decimal(0)),
        savings: partnerTransactions.reduce((sum, t) => sum.add(t.savingsAmount), new Decimal(0)),
        uniqueCustomers: new Set(partnerTransactions.map(t => t.userId)).size
      };

      await prisma.partnerAnalyticsHourly.create({
        data: metrics
      });
    }

  private async processPartnerDailyAnalytics(transactions: any[], date: string): Promise<void> {
    
    transactions.forEach(transaction => {)
      if (!partnerGroups.has(transaction.partnerId)) {
        partnerGroups.set(transaction.partnerId, []);
      }
      partnerGroups.get(transaction.partnerId)!.push(transaction);
    });

    for (const [partnerId, partnerTransactions] of partnerGroups) {
      const analytics: PartnerAnalytics = await this.calculatePartnerAnalytics(
        partnerId,
        partnerTransactions,
        date
      );

      await prisma.partnerAnalyticsDaily.create({
        data: {
          partnerId: analytics.partnerId,
          date: new Date(analytics.period),
          totalTransactions: analytics.totalTransactions,
          totalRevenue: analytics.totalRevenue,
          totalSavings: analytics.totalSavings,
          uniqueCustomers: analytics.uniqueCustomers,
          averageTransactionValue: analytics.averageTransactionValue,
          peakHours: analytics.peakHours,
          categoryBreakdown: analytics.categoryBreakdown,
          customerRetentionRate: analytics.customerRetentionRate,
          newCustomers: analytics.newCustomers,
          returningCustomers: analytics.returningCustomers
        });

      // Cache partner analytics
      await redis.setex(
        `analytics:partner:daily:${partnerId}:${date}`,
        604800, // 7 days TTL
        JSON.stringify(analytics, this.decimalReplacer)
      );
    }

  private async calculatePlatformAnalytics(
    transactions: any[],
    date: string
  ): Promise<PlatformAnalytics> {
    const uniqueUsers = new Set(transactions.map(t => t.userId));
    const userIds = Array.from(uniqueUsers);

    // Get new users count
    const newUsersCount = await prisma.user.count({
      where: {
        id: { in: userIds },
        createdAt: {
          gte: dayjs(date).startOf('day').toDate(),
          lte: dayjs(date).endOf('day').toDate()
        }
    });

    // Calculate category performance
    const categoryMap = new Map<string, { transactions: number; revenue: Decimal }>();
    transactions.forEach(transaction => {)
      const category = transaction.partner.businessCategory?.name || 'Other';
      if (!categoryMap.has(category)) {
        categoryMap.set(category, { transactions: 0, revenue: new Decimal(0) });
      }
      const cat = categoryMap.get(category)!;
      cat.transactions++;
      cat.revenue = cat.revenue.add(transaction.amount);
    });

    // Get previous day's data for growth calculation
    const previousDayCategories = await this.getPreviousDayCategoryData(date);
    const categoryPerformance = Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      transactions: data.transactions,
      revenue: data.revenue,
      growth: this.calculateGrowthRate(
        data.transactions,
        previousDayCategories.get(category) || 0
      )
    }));

    // Calculate geographic distribution
    const geoMap = new Map<string, { transactions: 
}}}
}
}
}
}
}
}
}
}
}
}
}
}
}
