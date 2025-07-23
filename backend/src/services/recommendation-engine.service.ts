import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not, IsNull, MoreThan, Between } from 'typeorm';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import { Partner } from '../entities/partner.entity';
import { User } from '../entities/user.entity';
import { Transaction } from '../entities/transaction.entity';
import { UserPreference } from '../entities/user-preference.entity';
import { PartnerCategory } from '../entities/partner-category.entity';
import { Review } from '../entities/review.entity';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as geolib from 'geolib';
import { subDays, startOfDay, endOfDay } from 'date-fns';

interface RecommendationScore {
  partnerId: string;
  score: number;
  reasons: string[];
  category: string;
  distance?: number;
}

interface UserBehavior {
  userId: string;
  visitedPartners: string[];
  categories: Map<string, number>;
  averageSpending: number;
  preferredTimes: number[];
  lastVisits: Map<string, Date>;
}

interface RecommendationRequest {
  userId: string;
  latitude?: number;
  longitude?: number;
  category?: string;
  limit?: number;
  excludeVisited?: boolean;
  timeOfDay?: number;
  priceRange?: 'budget' | 'mid' | 'premium';
}

interface TrendingPartner {
  partnerId: string;
  trendScore: number;
  visitCount: number;
  growthRate: number;
}

@Injectable()
export class RecommendationEngineService {
  private readonly logger = new Logger(RecommendationEngineService.name);
  private readonly CACHE_TTL = 3600; // 1 hour
  private readonly MAX_DISTANCE_KM = 50;
  private readonly TRENDING_WINDOW_DAYS = 7;
  private readonly MIN_REVIEWS_FOR_SCORE = 3;

  constructor(
    @InjectRepository(Partner)
    private readonly partnerRepository: Repository<Partner>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(UserPreference)
    private readonly userPreferenceRepository: Repository<UserPreference>,
    @InjectRepository(PartnerCategory)
    private readonly categoryRepository: Repository<PartnerCategory>,
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRedis() private readonly redis: Redis,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Get personalized recommendations for a user
   */
  async getRecommendations(request: RecommendationRequest): Promise<Partner[]> {
    try {
      const cacheKey = this.generateCacheKey('recommendations', request);
      const cached = await this.redis.get(cacheKey);
      
      if (cached) {
        return JSON.parse(cached);
      }

      // Fetch user behavior and preferences
      const userBehavior = await this.analyzeUserBehavior(request.userId);
      const userPreferences = await this.getUserPreferences(request.userId);

      // Get eligible partners
      const eligiblePartners = await this.getEligiblePartners(request, userBehavior);

      // Calculate recommendation scores
      const scores = await this.calculateRecommendationScores(
        eligiblePartners,
        userBehavior,
        userPreferences,
        request
      );

      // Sort by score and apply limit
      const sortedScores = scores.sort((a, b) => b.score - a.score);
      const limit = request.limit || 20;
      const topScores = sortedScores.slice(0, limit);

      // Fetch full partner data
      const partnerIds = topScores.map(s => s.partnerId);
      const partners = await this.partnerRepository.find({
        where: { id: In(partnerIds), isActive: true },
        relations: ['categories', 'reviews', 'media'],
      });

      // Sort partners according to scores
      const sortedPartners = partnerIds
        .map(id => partners.find(p => p.id === id))
        .filter(Boolean) as Partner[];

      // Cache results
      await this.redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(sortedPartners));

      // Emit event for analytics
      this.eventEmitter.emit('recommendations.generated', {
        userId: request.userId,
        count: sortedPartners.length,
        categories: [...new Set(sortedPartners.map(p => p.categories[0]?.name))],
      });

      return sortedPartners;
    } catch (error) {
      this.logger.error('Failed to generate recommendations', error);
      throw error;
    }

  /**
   * Get trending partners based on recent activity
   */
  async getTrendingPartners(
    category?: string,
    limit: number = 10
  ): Promise<Partner[]> {
    try {

      if (cached) {
        return JSON.parse(cached);
      }

      const startDate = startOfDay(subDays(new Date(), this.TRENDING_WINDOW_DAYS));
      const endDate = endOfDay(new Date());

      // Get transaction counts for the trending window
      const query = this.transactionRepository
        .createQueryBuilder('transaction')
        .select('transaction.partnerId', 'partnerId')
        .addSelect('COUNT(*)', 'visitCount')
        .where('transaction.createdAt BETWEEN :startDate AND :endDate', {
          startDate,
          endDate,
        })
        .andWhere('transaction.status = :status', { status: 'completed' })
        .groupBy('transaction.partnerId')
        .having('COUNT(*) > :minVisits', { minVisits: 5 })
        .orderBy('visitCount', 'DESC')
        .limit(limit * 2); // Get more to filter by category if needed

      const trendingData = await query.getRawMany();

      // Calculate growth rates
      const trendingPartners = await this.calculateTrendingScores(trendingData);

      // Filter by category if specified
      let partnerIds = trendingPartners.map(t => t.partnerId);
      
      if (category) {
        const categoryPartners = await this.partnerRepository
          .createQueryBuilder('partner')
          .leftJoin('partner.categories', 'category')
          .where('partner.id IN (:...ids)', { ids: partnerIds })
          .andWhere('category.slug = :category', { category })
          .select('partner.id')
          .getMany();
        
        partnerIds = categoryPartners.map(p => p.id);
      }

      // Fetch full partner data
        where: { id: In(partnerIds.slice(0, limit)), isActive: true },
        relations: ['categories', 'reviews', 'media'],
      });

      // Sort by trending score
        const scoreA = trendingPartners.find(t => t.partnerId === a.id)?.trendScore || 0;
        const scoreB = trendingPartners.find(t => t.partnerId === b.id)?.trendScore || 0;
        return scoreB - scoreA;
      });

      // Cache results
      await this.redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(sortedPartners));

      return sortedPartners;
    } catch (error) {
      this.logger.error('Failed to get trending partners', error);
      throw error;
    }

  /**
   * Get similar partners based on various factors
   */
  async getSimilarPartners(partnerId: string, limit: number = 6): Promise<Partner[]> {
    try {

      if (cached) {
        return JSON.parse(cached);
      }

      // Get the reference partner
      const referencePartner = await this.partnerRepository.findOne({
        where: { id: partnerId },
        relations: ['categories'],
      });

      if (!referencePartner) {
        return [];
      }

      // Find partners with similar categories
      const categoryIds = referencePartner.categories.map(c => c.id);
      
      const similarPartners = await this.partnerRepository
        .createQueryBuilder('partner')
        .leftJoinAndSelect('partner.categories', 'category')
        .leftJoinAndSelect('partner.reviews', 'review')
        .leftJoinAndSelect('partner.media', 'media')
        .where('category.id IN (:...categoryIds)', { categoryIds })
        .andWhere('partner.id != :partnerId', { partnerId })
        .andWhere('partner.isActive = :isActive', { isActive: true })
        .andWhere('partner.priceRange = :priceRange', { 
          priceRange: referencePartner.priceRange 
        })
        .take(limit * 2) // Get more for scoring
        .getMany();

      // Calculate similarity scores
      const scoredPartners = await this.calculateSimilarityScores(
        referencePartner,
        similarPartners
      );

      // Sort by similarity score and return top matches
      const topSimilar = scoredPartners
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(sp => sp.partner);

      // Cache results
      await this.redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(topSimilar));

      return topSimilar;
    } catch (error) {
      this.logger.error('Failed to get similar partners', error);
      throw error;
    }

  /**
   * Analyze user behavior from transaction history
   */
  private async analyzeUserBehavior(userId: string): Promise<UserBehavior> {
    const transactions = await this.transactionRepository.find({
      where: {
        userId,
        status: 'completed',
        createdAt: MoreThan(subDays(new Date(), 90)), // Last 90 days
      },
      relations: ['partner', 'partner.categories'],
      order: { createdAt: 'DESC' },
    });

    const behavior: UserBehavior = {
      userId,
      visitedPartners: [],
      categories: new Map(),
      averageSpending: 0,
      preferredTimes: [],
      lastVisits: new Map(),
    };

    if (transactions.length === 0) {
      return behavior;
    }

    let totalSpending = 0;
    const timeSlots = new Map<number, number>();

    transactions.forEach(transaction => {
      // Track visited partners
      behavior.visitedPartners.push(transaction.partnerId);
      behavior.lastVisits.set(transaction.partnerId, transaction.createdAt);

      // Track category preferences
      transaction.partner.categories.forEach(category => {)
        const count = behavior.categories.get(category.slug) || 0;
        behavior.categories.set(category.slug, count + 1);
      });

      // Track spending
      totalSpending += transaction.amount;

      // Track time preferences (hour of day)
      const hour = transaction.createdAt.getHours();
      timeSlots.set(hour, (timeSlots.get(hour) || 0) + 1);
    });

    // Calculate averages
    behavior.averageSpending = totalSpending / transactions.length;

    // Find preferred time slots
    const sortedTimeSlots = Array.from(timeSlots.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([hour]) => hour);
    behavior.preferredTimes = sortedTimeSlots;

    return behavior;
  }

  /**
   * Get user preferences
   */
  private async getUserPreferences(userId: string): Promise<UserPreference | null> {
    return await this.userPreferenceRepository.findOne({
      where: { userId },
      relations: ['preferredCategories', 'dietaryRestrictions'],
    });
  }

  /**
   * Get eligible partners based on filters
   */
  private async getEligiblePartners(
    request: RecommendationRequest,
    userBehavior: UserBehavior
  ): Promise<Partner[]> {
      .createQueryBuilder('partner')
      .leftJoinAndSelect('partner.categories', 'category')
      .leftJoinAndSelect('partner.reviews', 'review')
      .where('partner.isActive = :isActive', { isActive: true });

    // Apply category filter
    if (request.category) {
      query.andWhere('category.slug = :category', { category: request.category });
    }

    // Apply price range filter
    if (request.priceRange) {
      query.andWhe
}}}
}
