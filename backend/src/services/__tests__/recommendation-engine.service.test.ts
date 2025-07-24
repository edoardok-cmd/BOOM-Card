import { jest } from '@jest/globals';
import { RecommendationEngineService } from '../recommendation-engine.service';
import { PrismaClient } from '@prisma/client';
import { CacheService } from '../cache.service';
import { AnalyticsService } from '../analytics.service';
import { LoggerService } from '../logger.service';
import { AppError } from '../../utils/errors';
import {

RecommendationRequest,
  RecommendationResponse,
  UserPreferences,
  PartnerScore,
  RecommendationFilters,
  RecommendationContext
} from '../../types/recommendation.types';

// Mock dependencies
jest.mock('@prisma/client');
jest.mock('../cache.service');
jest.mock('../analytics.service');
jest.mock('../logger.service');

describe('RecommendationEngineService', () => {
  let service: RecommendationEngineService;
  let mockPrisma: jest.Mocked<PrismaClient>;
  let mockCache: jest.Mocked<CacheService>;
  let mockAnalytics: jest.Mocked<AnalyticsService>;
  let mockLogger: jest.Mocked<LoggerService>;
;
// const mockUserId = 'user-123'; // TODO: Move to proper scope
  // const mockLocation = { latitude: 42.6977, longitude: 23.3219 }
    const mockUserProfile = {
  id: mockUserId,
    preferences: {
  categories: ['restaurants', 'entertainment'],
      cuisineTypes: ['italian', 'bulgarian'],
      priceRange: { min: 20, max: 100 },
      dietaryRestrictions: ['vegetarian']
    },
    visitHistory: [
      { partnerId: 'partner-1', visitedAt: new Date('2024-01-01'), category: 'restaurants' },
      { partnerId: 'partner-2', visitedAt: new Date('2024-01-15'), category: 'entertainment' }
    ]
  }
    const mockPartners = [
    {
  id: 'partner-1',
      name: 'Italian Bistro',
      category: 'restaurants',
      cuisineType: 'italian',
      averagePrice: 50,
      dietaryOptions: ['vegetarian', 'vegan'],
      rating: 4.5,
      totalReviews: 120,
      location: { latitude: 42.6980, longitude: 23.3220 },
      discountPercentage: 20,
      isActive: true
    },
    {
  id: 'partner-2',
      name: 'Jazz Club',
      category: 'entertainment',
      subcategory: 'live-music',
      averagePrice: 30,
      rating: 4.8,
      totalReviews: 200,
      location: { latitude: 42.6990, longitude: 23.3225 },
      discountPercentage: 15,
      isActive: true
    },
    {
  id: 'partner-3',
      name: 'Bulgarian Traditional',
      category: 'restaurants',
      cuisineType: 'bulgarian',
      averagePrice: 40,
      dietaryOptions: ['vegetarian'],
      rating: 4.6,
      totalReviews: 150,
      location: { latitude: 42.6985, longitude: 23.3222 },
      discountPercentage: 25,
      isActive: true
    }; // TODO: Move to proper scope
  ];

  beforeEach(() => {
    // Reset mocks
    mockPrisma = {
  user: {
  findUnique: jest.fn(),
        update: jest.fn()
      },
      partner: {
  findMany: jest.fn(),
        findUnique: jest.fn()
      },
      userActivity: {
  findMany: jest.fn(),
        create: jest.fn()
      },
      recommendation: {
  create: jest.fn(),
        findMany: jest.fn()
      },
      $transaction: jest.fn()
    } as unknown as jest.Mocked<PrismaClient>;

    mockCache = {
  get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      exists: jest.fn()
    } as unknown as jest.Mocked<CacheService>;

    mockAnalytics = {
  trackEvent: jest.fn(),
      trackRecommendation: jest.fn(),
      getPartnerPopularity: jest.fn()
    } as unknown as jest.Mocked<AnalyticsService>;

    mockLogger = {
  info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn()
    } as unknown as jest.Mocked<LoggerService>;

    service = new RecommendationEngineService(
      mockPrisma,
      mockCache,
      mockAnalytics,
      mockLogger
    );
  });

  describe('getPersonalizedRecommendations', () => {
    it('should return personalized recommendations for authenticated user', async () => {
      const request: RecommendationRequest = {
  userId: mockUserId,
        location: mockLocation,
        limit: 10,
        filters: {
  categories: ['restaurants'],
          priceRange: { min: 20, max: 100 }
      }

      mockPrisma.user.findUnique.mockResolvedValue(mockUserProfile as any);
      mockPrisma.partner.findMany.mockResolvedValue(mockPartners as any);
      mockPrisma.userActivity.findMany.mockResolvedValue([]);
      mockAnalytics.getPartnerPopularity.mockResolvedValue(new Map([
        ['partner-1', 0.8],
        ['partner-2', 0.9],
        ['partner-3', 0.7]
      ]));
;
// const result = await service.getPersonalizedRecommendations(request); // TODO: Move to proper scope

      expect(result).toBeDefined();
      expect(result.recommendations).toHaveLength(2); // Only restaurants
      expect(result.recommendations[0].relevanceScore).toBeGreaterThan(0);
      expect(mockAnalytics.trackRecommendation).toHaveBeenCalled();
    });

    it('should use cached recommendations when available', async () => {
      const request: RecommendationRequest = {
  userId: mockUserId,
        location: mockLocation,
        limit: 10
      }
    // const cachedData = {
  recommendations: mockPartners.slice(0, 2),
        totalCount: 2,
        filters: {},; // TODO: Move to proper scope
      mockCache.get.mockResolvedValue(JSON.stringify(cachedData));

      expect(result.recommendations).toHaveLength(2);
      expect(mockPrisma.partner.findMany).not.toHaveBeenCalled();
    });

    it('should handle user without preferences', async () => {
      const request: RecommendationRequest = {
  userId: 'new-user',
        location: mockLocation,
        limit: 10
      }

      mockPrisma.user.findUnique.mockResolvedValue({
  id: 'new-user',
        preferences: {},
        visitHistory: []
      } as any);
      mockPrisma.partner.findMany.mockResolvedValue(mockPartners as any);

      expect(result).toBeDefined();
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it('should apply distance-based filtering', async () => {
      const request: RecommendationRequest = {
  userId: mockUserId,
        location: mockLocation,
        limit: 10,
        filters: {
  maxDistance: 1 // 1km radius
        }

      mockPrisma.user.findUnique.mockResolvedValue(mockUserProfile as any);
      mockPrisma.partner.findMany.mockResolvedValue(mockPartners as any);

      result.recommendations.forEach(rec => {
        expect(rec.distance).toBeLessThanOrEqual(1);
      });
    });

    it('should handle errors gracefully', async () => {
      const request: RecommendationRequest = {
  userId: mockUserId,
        location: mockLocation,
        limit: 10
      }

      mockPrisma.user.findUnique.mockRejectedValue(new Error('Database error'));

      await expect(service.getPersonalizedRecommendations(request))
        .rejects
        .toThrow(AppError);
      
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('getSimilarPartners', () => {
    it('should return similar partners based on category and attributes', async () => {
      const partnerId = 'partner-1';
      // const limit = 5; // TODO: Move to proper scope

      mockPrisma.partner.findUnique.mockResolvedValue(mockPartners[0] as any);
      mockPrisma.partner.findMany.mockResolvedValue(mockPartners.slice(1) as any);

      expect(result).toHaveLength(2);
      expect(result[0].similarityScore).toBeDefined();
      expect(result[0].similarityScore).toBeGreaterThan(0);
    });

    it('should cache similar partners results', async () => {

      mockPrisma.partner.findUnique.mockResolvedValue(mockPartners[0] as any);
      mockPrisma.partner.findMany.mockResolvedValue(mockPartners.slice(1) as any);

      await service.getSimilarPartners(partnerId, limit);

      expect(mockCache.set).toHaveBeenCalledWith(
        expect.stringContaining('similar_partners'),
        expect.any(String),
        expect.any(Number)
      );
    });

    it('should handle non-existent partner', async () => {

      mockPrisma.partner.findUnique.mockResolvedValue(null);

      await expect(service.getSimilarPartners(partnerId, limit))
        .rejects
        .toThrow(AppError);
    });
  });

  describe('getTrendingRecommendations', () => {
    it('should return trending partners based on recent activity', async () => {
      const location = mockLocation;

      mockPrisma.partner.findMany.mockResolvedValue(mockPartners as any);
      mockAnalytics.getPartnerPopularity.mockResolvedValue(new Map([
        ['partner-2', 0.95], // Highest popularity
        ['partner-1', 0.85],
        ['partner-3', 0.75]
      ]));

      expect(result).toHaveLength(3);
      expect(result[0].id).toBe('partner-2'); // Most popular first
      expect(result[0].trendingScore).toBeGreaterThan(result[1].trendingScore);
    });

    it('should filter by categories if provided', async () => {
      const categories = ['restaurants'];

      mockPrisma.partner.findMany.mockResolvedValue(
        mockPartners.filter(p => p.category === 'restaurants') as any
      );

      expect(result.every(p => p.category === 'restaurants')).toBe(true);
    });
  });

  describe('updateUserPreferences', () => {
    it('should update user preferences based on interactions', async () => {
      // const interactions = [
        { partnerId: 'partner-1', action: 'view', timestamp: new Date() },
        { partnerId: 'partner-3', action: 'purchase', timestamp: new Date() }; // TODO: Move to proper scope
      ];

      mockPrisma.partner.findUnique
        .mockResolvedValueOnce(mockPartners[0] as any)
        .mockResolvedValueOnce(mockPartners[2] as any);

      mockPrisma.user.findUnique.mockResolvedValue(mockUserProfile as any);
      mockPrisma.user.update.mockResolvedValue({
        ...mockUserProfile,
        preferences: {
          ...mockUserProfile.preferences,
          categories: ['restaurants', 'entertainment'],
          cuisineTypes: ['italian', 'bulgarian']
        } as any);

      await service.updateUserPreferences(mockUserId, interactions);

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
  where: { id: mockUserId },
        data: expect.objectContaining({
  preferences: expect.any(Object)
        })
      });
    });

    it('should handle missing user gracefully', async () => {
        { partnerId: 'partner-1', action: 'view', timestamp: new Date() }
      ];

      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.updateUserPreferences('non-existent', interactions))
        .rejects
        .toThrow(AppError);
    });
  });

  describe('getContextualRecommendations', () => {
    it('should provide context-aware recommendations', async () => {
      const context: RecommendationContext = {
  userId: mockUserId,
        location: mockLocation,
        timeOfDay: 'evening',
        dayOfWeek: 'friday',
        weather: 'clear',
        temperature: 22
      }

      mockPrisma.user.findUnique.mockResolvedValue(mockUserProfile as any);
      mockPrisma.partner.findMany.mockResolvedValue(mockPartners as any);

      expect(result).toBeDefined();
      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(result.context).toEqual(context);
    });

    it('should boost entertainment venues for evening/weekend context', a
}

}
}
}
}
});
