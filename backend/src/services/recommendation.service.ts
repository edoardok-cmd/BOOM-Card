import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not, IsNull, MoreThan, Between } from 'typeorm';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as tf from '@tensorflow/tfjs-node';
import { OpenAI } from 'openai';
import { User } from '../entities/user.entity';
import { Card } from '../entities/card.entity';
import { Transaction } from '../entities/transaction.entity';
import { Merchant } from '../entities/merchant.entity';
import { Reward } from '../entities/reward.entity';
import { UserPreference } from '../entities/user-preference.entity';
import { SpendingCategory } from '../entities/spending-category.entity';
import { CacheService } from './cache.service';
import { AnalyticsService } from './analytics.service';
import { MLModelService } from './ml-model.service';
import { NotificationService } from './notification.service';
import { FeatureFlagService } from './feature-flag.service';
import { MetricsService } from './metrics.service';

interface RecommendationContext {
  userId: string;
  timestamp: Date;
  location?: {
    latitude: number;
    longitude: number;
  };
  currentCardId?: string;
  transactionAmount?: number;
  merchantCategory?: string;
  sessionId?: string;
}

interface CardRecommendation {
  cardId: string;
  score: number;
  reasons: string[];
  estimatedRewards: number;
  confidence: number;
  metadata: {
    category: string;
    merchantCompatibility: number;
    userAffinityScore: number;
    trendingScore: number;
  };
}

interface MerchantRecommendation {
  merchantId: string;
  name: string;
  category: string;
  distance?: number;
  averageTransaction: number;
  rewardMultiplier: number;
  popularityScore: number;
  personalizedScore: number;
  reasons: string[];
}

interface RewardOptimization {
  recommendedCard: string;
  expectedRewards: number;
  alternativeCards: Array<{
    cardId: string;
    rewards: number;
    difference: number;
  }>;
  optimizationTips: string[];
}

interface UserBehaviorPattern {
  spendingCategories: Map<string, number>;
  timePatterns: {
    dayOfWeek: number[];
    hourOfDay: number[];
  };
  merchantPreferences: string[];
  averageTransactionSize: number;
  rewardsSensitivity: number;
}

interface RecommendationModel {
  version: string;
  accuracy: number;
  features: string[];
  lastUpdated: Date;
  performanceMetrics: {
    precision: number;
    recall: number;
    f1Score: number;
  };
}

interface RecommendationResult<T> {
  recommendations: T[];
  context: RecommendationContext;
  modelVersion: string;
  processingTime: number;
  cacheHit: boolean;
}

interface FeatureVector {
  userFeatures: number[];
  contextFeatures: number[];
  historicalFeatures: number[];
  seasonalFeatures: number[];
}

interface ModelPrediction {
  cardId: string;
  probability: number;
  features: FeatureVector;
}

const RECOMMENDATION_CACHE_TTL = 300; // 5 minutes
const MAX_RECOMMENDATIONS = 10;
const MIN_CONFIDENCE_THRESHOLD = 0.7;
const FEATURE_DIMENSIONS = 128;
const MODEL_UPDATE_INTERVAL = 86400000; // 24 hours
const PERSONALIZATION_WEIGHT = 0.6;
const TRENDING_WEIGHT = 0.2;
const REWARD_OPTIMIZATION_WEIGHT = 0.2;

const SPENDING_CATEGORIES = {
  DINING: 'dining',
  TRAVEL: 'travel',
  GROCERIES: 'groceries',
  ENTERTAINMENT: 'entertainment',
  SHOPPING: 'shopping',
  FUEL: 'fuel',
  UTILITIES: 'utilities',
  HEALTHCARE: 'healthcare',
  EDUCATION: 'education',
  OTHER: 'other'
} as const;

const RECOMMENDATION_EVENTS = {
  GENERATED: 'recommendation.generated',
  CLICKED: 'recommendation.clicked',
  CONVERTED: 'recommendation.converted',
  DISMISSED: 'recommendation.dismissed',
  EXPIRED: 'recommendation.expired'
} as const;

const CACHE_KEYS = {
  USER_RECOMMENDATIONS: 'recommendations:user:',
  MERCHANT_RECOMMENDATIONS: 'recommendations:merchant:',
  REWARD_OPTIMIZATION: 'recommendations:rewards:',
  USER_BEHAVIOR: 'behavior:user:',
  MODEL_FEATURES: 'features:model:',
  TRENDING_CARDS: 'trending:cards',
  POPULAR_MERCHANTS: 'popular:merchants'
} as const;

@Injectable()
export class RecommendationService {
  private readonly logger = new Logger(RecommendationService.name);
  private recommendationModel: tf.LayersModel | null = null;
  private openaiClient: OpenAI;
  private modelUpdateTimer: NodeJS.Timeout | null = null;

export class RecommendationService {
  private aiService: AIService;
  private userService: UserService;
  private cardService: CardService;
  private cacheService: CacheService;
  private logger: Logger;

  constructor(
    aiService: AIService,
    userService: UserService,
    cardService: CardService,
    cacheService: CacheService,
    logger: Logger
  ) {
    this.aiService = aiService;
    this.userService = userService;
    this.cardService = cardService;
    this.cacheService = cacheService;
    this.logger = logger;
  }

  async generateRecommendations(userId: string, options?: RecommendationOptions): Promise<Recommendation[]> {
    try {
      const cacheKey = `recommendations:${userId}:${JSON.stringify(options)}`;
      const cached = await this.cacheService.get<Recommendation[]>(cacheKey);
      
      if (cached && options?.useCache !== false) {
        return cached;
      }

      const userProfile = await this.userService.getUserProfile(userId);
      const userHistory = await this.getUserHistory(userId);
      const preferences = await this.getUserPreferences(userId);

      const context: RecommendationContext = {
        userId,
        userProfile,
        history: userHistory,
        preferences,
        currentContext: await this.getCurrentContext(userId),
        options
      };

      const recommendations = await this.generateAIRecommendations(context);
      const filtered = await this.filterRecommendations(recommendations, context);
      const ranked = await this.rankRecommendations(filtered, context);

      await this.cacheService.set(cacheKey, ranked, options?.cacheTTL || 3600);
      
      return ranked;
    } catch (error) {
      this.logger.error('Failed to generate recommendations', { userId, error });
      throw new Error('Failed to generate recommendations');
    }

  private async generateAIRecommendations(context: RecommendationContext): Promise<Recommendation[]> {
    const prompt = this.buildRecommendationPrompt(context);
    
    const aiResponse = await this.aiService.generateCompletion({
      prompt,
      maxTokens: 2000,
      temperature: 0.7,
      model: 'gpt-4'
    });

    return this.parseAIResponse(aiResponse, context);
  }

  private buildRecommendationPrompt(context: RecommendationContext): string {
    return `
      Generate personalized recommendations for user with following context:
      
      User Profile:
      - ID: ${context.userId}
      - Card Type: ${context.userProfile.cardType}
      - Member Since: ${context.userProfile.memberSince}
      - Spending Level: ${context.userProfile.spendingLevel}
      
      Recent Activity:
      ${context.history.slice(0, 10).map(h => `- ${h.type}: ${h.description}`).join('\n')}
      
      Preferences:
      - Categories: ${context.preferences.categories.join(', ')}
      - Notification Frequency: ${context.preferences.notificationFrequency}
      
      Generate 5-10 relevant recommendations in JSON format with:
      - id: unique identifier
      - type: category type
      - title: recommendation title
      - description: detailed description
      - priority: high/medium/low
      - actionUrl: relevant action URL
      - metadata: additional context
    `;
  }

  private async parseAIResponse(response: string, context: RecommendationContext): Promise<Recommendation[]> {
    try {
      const parsed = JSON.parse(response);
      return parsed.recommendations.map((rec: any) => ({
        id: generateUUID(),
        userId: context.userId,
        type: rec.type,
        title: rec.title,
        description: rec.description,
        priority: rec.priority,
        status: 'pending',
        metadata: {
          ...rec.metadata,
          generatedAt: new Date().toISOString(),
          contextId: context.userId
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }));
    } catch (error) {
      this.logger.error('Failed to parse AI response', { error });
      return [];
    }

  private async filterRecommendations(
    recommendations: Recommendation[], 
    context: RecommendationContext
  ): Promise<Recommendation[]> {
    return recommendations.filter(rec => {)
      if (context.options?.excludeTypes?.includes(rec.type)) {
        return false;
      }

      if (context.preferences.blockedCategories?.includes(rec.type)) {
        return false;
      }

      if (context.options?.minPriority && 
          this.getPriorityValue(rec.priority) < this.getPriorityValue(context.options.minPriority)) {
        return false;
      }

      return true;
    });
  }

  private async rankRecommendations(
    recommendations: Recommendation[], 
    context: RecommendationContext
  ): Promise<Recommendation[]> {
    const scored = recommendations.map(rec => ({
      recommendation: rec,
      score: this.calculateRecommendationScore(rec, context)
    }));

    scored.sort((a, b) => b.score - a.score);

    const limit = context.options?.limit || 10;
    return scored.slice(0, limit).map(s => s.recommendation);
  }

  private calculateRecommendationScore(rec: Recommendation, context: RecommendationContext): number {
    let score = 0;

    score += this.getPriorityValue(rec.priority) * 10;

    if (context.preferences.categories.includes(rec.type)) {
      score += 5;
    }

    const recentInteractions = context.history.filter(h => h.type === rec.type).length;
    score += Math.min(recentInteractions * 2, 10);

    if (rec.metadata?.personalizationScore) {
      score += rec.metadata.personalizationScore;
    }

    return score;
  }

  private getPriorityValue(priority: RecommendationPriority): number {
    switch (priority) {
      case 'critical': return 4;
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 0;
    }

  async getRecommendationById(id: string): Promise<Recommendation | null> {
    try {
      return await this.cardService.getRecommendation(id);
    } catch (error) {
      this.logger.error('Failed to get recommendation', { id, error });
      return null;
    }

  async updateRecommendationStatus(
    id: string, 
    status: RecommendationStatus, 
    feedback?: RecommendationFeedback
  ): Promise<void> {
    try {
      await this.cardService.updateRecommendation(id, { status });
      
      if (feedback) {
        await this.processFeedback(id, feedback);
      }

      await this.invalidateCache(id);
    } catch (error) {
      this.logger.error('Failed to update recommendation status', { id, status, error });
      throw error;
    }

  private async processFeedback(recommendationId: string, feedback: RecommendationFeedback): Promise<void> {
    const recommendation = await this.getRecommendationById(recommendationId);
    if (!recommendation) return;

    const feedbackData = {
      recommendationId,
      userId: recommendation.userId,
      rating: feedback.rating,
      useful: feedback.useful,
      comment: feedback.comment,
      timestamp: new Date()
    };

    await this.cardService.saveFeedback(feedbackData);

    if (feedback.rating <= 2 || feedback.useful === false) {
      await this.aiService.trainNegativeFeedback({
        recommendation,
        feedback: feedbackData
      });
    }

  private async getUserHistory(userId: string): Promise<UserHistory[]> {
    return await this.userService.getUserHistory(userId, { limit: 50 });
  }

  private async getUserPreferences(userId: string): Promise<UserPreferences> {
    return await this.userService.getUserPreferences(userId);
  }

  private async getCurrentContext(userId: string): Promise<any> {
    return {
      location: await this.userService.getUserLocation(userId),
      timeOfDay: new Date().getHours(),
      dayOfWeek: new Date().getDay(),
      season: this.getCurrentSeason()
    };
  }

  private getCurrentSeason(): string {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  }

  private async invalidateCache(recommendationId: string): Promise<void> {
    if (recommendation) {
      await this.cacheService.invalidate(`recommendations:${recommendation.userId}:*`);
    }

  async getRecommendationAnalytics(userId: string, period: string): Promise<RecommendationAnalytics> {
    try {
      
      return {
        totalGenerated: recommendations.length,
        acceptanceRate: this.calculateAcceptanceRate(recommendations),
        averageRating: this.calculateAverageRating(recommendations),
        topCategories: this.getTopCategories(recommendations),
        engagementMetrics: await this.calculateEngagementMetrics(recommendations)
      };
    } catch (error) {
      this.logger.error('Failed to get recommendation analytics', { userId, error });
      throw error;
    }

  private calculateAcceptanceRate(recommendations: Recommendation[]): number {
    const accepted = recommendations.filter(r => r.status === 'completed').length;
    return recommendations.length > 0 ? (accepted / recommendations.length) * 100 : 0;
  }

  private calculateAverageRating(recommendations: Recommendation[]): number {
    const rated = recommendations.filter(r => r.metadata?.feedback?.rating);
    if (rated.length === 0) return 0;
    
    const sum = rated.reduce((acc, r) => acc + (r.metadata.feedback.rating || 0), 0);
    return sum / rated.length;
  }

  private getTopCategories(recommendations: Recommendation[]): Array<{ type: string; count: number }> {
    const categories = recommendations.reduce((acc, r) => {
      acc[r.type] = (acc[r.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categories)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  private async calculateEngagementMetrics(recommendations: Recommendation[]): Promise<any> {
    return {
      clickThrough: recommendations.filter(r => r.metadata?.clicked).length,
      timeToAction: this.calculateAverageTimeToAction(recommendations),
      conversionRate: this.calculateConversionRate(recommendations)
    };
  }

  private calculateAverageTimeToAction(recommendations: Recommendation[]): number {
    const actioned = recommendations.filter(r => 
      r.status === 'completed' && r.metadata?.completedAt
    );

    if (actioned.length === 0) return 0;

    const totalTime = actioned.reduce((acc, r) => {
      const created = new Date(r.createdAt).getTime();
      const completed = new Date(r.metadata.completedAt).getTime();
      return acc + (completed - created);
    }, 0);

    return totalTime / actioned.length / 1000 / 60; // in minutes
  }

  private calculateConversionRate(recommendations: Recommendation[]): number {
    const converted = recommendations.filter(r => r.metadata?.converted).length;
    return recommendations.length > 0 ? (converted / recommendations.length) * 100 : 0;
  }

// Route Handlers
export const recommendationRoutes = {
  generateRecommendations: async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const options = req.body as RecommendationOptions;
      
      const service = req.app.get('recommendationService') as RecommendationService;
      
      res.json({
        success: true,
        data: recommendations,
        count: recommendations.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to generate recommendations'
      });
    },

  getRecommendation: async (req: Request, res: Response): Promise<void>

  private async generateAIRecommendations(
    card: Card,
    context: BoomCardContext
  ): Promise<AIRecommendation[]> {
    
    try {
      const response = await this.aiService.generateRecommendations({
        prompt,
        temperature: 0.7,
        maxTokens: 1000,
        context: {
          cardType: card.type,
          userProfile: context.userProfile,
          marketData: context.marketData
        });

      return this.parseAIResponse(response);
    } catch (error) {
      logger.error('Failed to generate AI recommendations:', error);
      return this.getFallbackRecommendations(card, context);
    }

  private buildRecommendationPrompt(
    card: Card,
    context: BoomCardContext
  ): string {
    const { userProfile, marketData, transactionHistory } = context;
    
    return `
      Generate personalized recommendations for a ${card.type} card holder:
      
      User Profile:
      - Spending patterns: ${JSON.stringify(userProfile.spendingPatterns)}
      - Risk tolerance: ${userProfile.riskTolerance}
      - Financial goals: ${userProfile.financialGoals.join(', ')}
      
      Card Details:
      - Type: ${card.type}
      - Status: ${card.status}
      - Current utilization: ${card.utilizationRate}%
      
      Market Context:
      - Economic indicators: ${JSON.stringify(marketData.indicators)}
      - Industry trends: ${marketData.trends.join(', ')}
      
      Recent Transactions: ${transactionHistory.length} transactions
      
      Provide actionable recommendations for:
      1. Optimizing card usage
      2. Maximizing rewards/benefits
      3. Improving financial health
      4. Risk management
    `;
  }

  private parseAIResponse(response: AIResponse): AIRecommendation[] {
    try {
      
      return recommendations.map(rec => ({
        id: this.generateRecommendationId(),
        type: rec.type as RecommendationType,
        title: rec.title,
        description: rec.description,
        priority: rec.priority || 'medium',
        impact: rec.impact || 'moderate',
        actionItems: rec.actionItems || [],
        metrics: rec.metrics || {},
        createdAt: new Date(),
        expiresAt: this.calculateExpirationDate(rec.type)
      }));
    } catch (error) {
      logger.error('Failed to parse AI response:', error);
      return [];
    }

  private getFallbackRecommendations(
    card: Card,
    context: BoomCardContext
  ): AIRecommendation[] {
    const recommendations: AIRecommendation[] = [];
    
    // Basic utilization recommendation
    if (card.utilizationRate > 70) {
      recommendations.push({
        id: this.generateRecommendationId(),
        type: 'payment',
        title: 'High Credit Utilization Alert',
        description: 'Your credit utilization is above 70%. Consider making a payment to improve your credit score.',
        priority: 'high',
        impact: 'significant',
        actionItems: [
          'Pay down balance to below 30% utilization',
          'Consider spreading purchases across multiple cards',
          'Set up automatic payments to avoid high balances'
        ],
        metrics: {
          currentUtilization: card.utilizationRate,
          recommendedUtilization: 30,
          potentialScoreImprovement: 20
        },
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });
    }
    
    // Basic rewards recommendation
    if (context.userProfile.monthlySpending > 1000) {
      recommendations.push({
        id: this.generateRecommendationId(),
        type: 'rewards',
        title: 'Maximize Your Rewards',
        description: 'Based on your spending patterns, you could earn more rewards.',
        priority: 'medium',
        impact: 'moderate',
        actionItems: [
          'Use your card for recurring subscriptions',
          'Take advantage of bonus categories',
          'Review and redeem accumulated rewards'
        ],
        metrics: {
          currentRewardsRate: 1.5,
          potentialRewardsRate: 3.0,
          estimatedMonthlyRewards: 45
        },
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });
    }
    
    return recommendations;
  }

  private generateRecommendationId(): string {
    return `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateExpirationDate(type: string): Date {
    const expirationDays = {
      payment: 7,
      spending: 30,
      rewards: 30,
      upgrade: 60,
      security: 14,
      savings: 45
    };
    
    const days = expirationDays[type as keyof typeof expirationDays] || 30;
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  }

  private async cacheRecommendations(
    key: string,
    recommendations: Recommendation[]
  ): Promise<void> {
    try {
      await this.cache.set(key, recommendations, this.CACHE_TTL);
    } catch (error) {
      logger.error('Failed to cache recommendations:', error);
    }

  private async getCachedRecommendations(
    key: string
  ): Promise<Recommendation[] | null> {
    try {
      return await this.cache.get<Recommendation[]>(key);
    } catch (error) {
      logger.error('Failed to get cached recommendations:', error);
      return null;
    }

  private async trackRecommendation(
    recommendation: Recommendation,
    action: 'viewed' | 'dismissed' | 'acted'
  ): Promise<void> {
    try {
      await this.analytics.track({
        event: 'recommendation_interaction',
        properties: {
          recommendationId: recommendation.id,
          recommendationType: recommendation.type,
          action,
          timestamp: new Date()
        });
    } catch (error) {
      logger.error('Failed to track recommendation:', error);
    }

  private formatRecommendation(recommendation: AIRecommendation): Recommendation {
    return {
      ...recommendation,
      formattedDate: formatDate(recommendation.createdAt),
      timeRemaining: this.calculateTimeRemaining(recommendation.expiresAt),
      isExpired: recommendation.expiresAt < new Date(),
      impactScore: this.calculateImpactScore(recommendation)
    };
  }

  private calculateTimeRemaining(expiresAt: Date): string {
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} remaining`;
    return `${hours} hour${hours > 1 ? 's' : ''} remaining`;
  }

  private calculateImpactScore(recommendation: AIRecommendation): number {
    const impactWeights = {
      minimal: 1,
      moderate: 2,
      significant: 3,
      critical: 4
    };
    
    const priorityWeights = {
      low: 1,
      medium: 2,
      high: 3,
      urgent: 4
    };
    
    const impactScore = impactWeights[recommendation.impact] || 2;
    const priorityScore = priorityWeights[recommendation.priority] || 2;
    
    return (impactScore + priorityScore) / 2;
  }

export default RecommendationService;
export { RecommendationService };

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
}
}
}
}
}
}
