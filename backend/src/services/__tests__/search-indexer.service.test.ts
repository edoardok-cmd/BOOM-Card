import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { SearchIndexerService } from '../search-indexer.service';
import { Card } from '../../entities/card.entity';
import { User } from '../../entities/user.entity';
import { Collection } from '../../entities/collection.entity';
import { Trade } from '../../entities/trade.entity';
import { SearchResult, SearchFilters, SearchSortOptions } from '../../interfaces/search.interface';
import { IndexingStatus, IndexingJob } from '../../interfaces/indexing.interface';
import { ElasticsearchError } from '../../errors/elasticsearch.error';
import { IndexingError } from '../../errors/indexing.error';

interface MockElasticsearchResponse {
  body: {
    hits: {
      total: { value: number };
      hits: Array<{
        _id: string;
        _score: number;
        _source: any;
        highlight?: Record<string, string[]>;
      }>;
    };
    aggregations?: Record<string, any>;
  };
}

interface MockBulkResponse {
  body: {
    took: number;
    errors: boolean;
    items: Array<{
      index?: {
        _id: string;
        status: number;
        error?: any;
      };
      update?: {
        _id: string;
        status: number;
        error?: any;
      };
      delete?: {
        _id: string;
        status: number;
        error?: any;
      };
    }>;
  };
}

interface TestCard extends Partial<Card> {
  id: string;
  name: string;
  rarity: string;
  set: string;
  condition: string;
  marketPrice: number;
  createdAt: Date;
  updatedAt: Date;
}

interface TestUser extends Partial<User> {
  id: string;
  username: string;
  email: string;
  rating: number;
  tradesCompleted: number;
  createdAt: Date;
}

interface TestCollection extends Partial<Collection> {
  id: string;
  name: string;
  description: string;
  userId: string;
  cardCount: number;
  totalValue: number;
  createdAt: Date;
}

interface IndexingMetrics {
  totalDocuments: number;
  successfulIndexed: number;
  failedIndexed: number;
  duration: number;
  averageIndexTime: number;
}

const ELASTICSEARCH_INDICES = {
  CARDS: 'boom-cards',
  USERS: 'boom-users',
  COLLECTIONS: 'boom-collections',
  TRADES: 'boom-trades',
} as const;

const DEFAULT_SEARCH_OPTIONS = {
  from: 0,
  size: 20,
  includeHighlights: true,
  includeAggregations: false,
} as const;

const BULK_OPERATION_SIZE = 100;
const INDEX_REFRESH_INTERVAL = '1s';
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000;

const TEST_TIMEOUT = 30000;

describe('SearchIndexerService', () => {
  let service: SearchIndexerService;
  let mockElasticsearchService: jest.Mocked<ElasticsearchService>;
  let mockRedisService: jest.Mocked<RedisService>;
  let mockLogger: jest.Mocked<Logger>;
  let mockEventEmitter: jest.Mocked<EventEmitter>;

  const mockCard: Card = {
    id: 'card-123',
    title: 'Test Card',
    description: 'Test Description',
    content: 'Test Content',
    type: CardType.STANDARD,
    status: CardStatus.ACTIVE,
    visibility: CardVisibility.PUBLIC,
    tags: ['test', 'card'],
    metadata: {
      views: 100,
      likes: 50,
      shares: 10,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02')
    },
    authorId: 'user-123',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-02')
  };

  const mockSearchQuery: SearchQuery = {
    query: 'test',
    filters: {
      type: [CardType.STANDARD],
      status: [CardStatus.ACTIVE],
      tags: ['test']
    },
    sort: {
      field: 'relevance',
      order: 'desc'
    },
    pagination: {
      page: 1,
      limit: 20
    };

  const mockIndexSettings: IndexSettings = {
    indexName: 'cards',
    numberOfShards: 3,
    numberOfReplicas: 1,
    mappings: {
      properties: {
        title: { type: 'text', analyzer: 'standard' },
        description: { type: 'text' },
        content: { type: 'text' },
        tags: { type: 'keyword' },
        type: { type: 'keyword' },
        status: { type: 'keyword' }
    };

  beforeEach(() => {
    mockElasticsearchService = {
      index: jest.fn(),
      search: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      bulk: jest.fn(),
      createIndex: jest.fn(),
      deleteIndex: jest.fn(),
      indexExists: jest.fn(),
      updateMapping: jest.fn(),
      getMapping: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn()
    } as unknown as jest.Mocked<ElasticsearchService>;

    mockRedisService = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      exists: jest.fn(),
      expire: jest.fn(),
      ttl: jest.fn(),
      hget: jest.fn(),
      hset: jest.fn(),
      hdel: jest.fn(),
      hgetall: jest.fn()
    } as unknown as jest.Mocked<RedisService>;

    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn()
    } as unknown as jest.Mocked<Logger>;

    mockEventEmitter = new EventEmitter() as jest.Mocked<EventEmitter>;
    jest.spyOn(mockEventEmitter, 'emit');
    jest.spyOn(mockEventEmitter, 'on');

    service = new SearchIndexerService(
      mockElasticsearchService,
      mockRedisService,
      mockLogger,
      mockEventEmitter
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('indexCard', () => {
    it('should successfully index a card', async () => {
      mockElasticsearchService.index.mockResolvedValue({
        _id: mockCard.id,
        _index: 'cards',
        result: 'created'
      });

      await service.indexCard(mockCard);

      expect(mockElasticsearchService.index).toHaveBeenCalledWith({
        index: 'cards',
        id: mockCard.id,
        body: expect.objectContaining({
          title: mockCard.title,
          description: mockCard.description,
          content: mockCard.content,
          type: mockCard.type,
          status: mockCard.status,
          tags: mockCard.tags
        })
      });

      expect(mockRedisService.del).toHaveBeenCalledWith(
        expect.stringContaining('search:')
      );

      expect(mockEventEmitter.emit).toHaveBeenCalledWith('card:indexed', {
        cardId: mockCard.id
      });

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Card indexed successfully',
        { cardId: mockCard.id }
      );
    });

    it('should handle indexing errors', async () => {
      const error = new Error('Elasticsearch error');
      mockElasticsearchService.index.mockRejectedValue(error);

      await expect(service.indexCard(mockCard)).rejects.toThrow(
        'Failed to index card'
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to index card',
        expect.objectContaining({
          cardId: mockCard.id,
          error: error.message
        })
      );
    });

    it('should skip indexing for private cards', async () => {
      const privateCard = {
        ...mockCard,
        visibility: CardVisibility.PRIVATE
      };

      await service.indexCard(privateCard);

      expect(mockElasticsearchService.index).not.toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Skipping indexing for private card',
        { cardId: privateCard.id }
      );
    });
  });

  describe('searchCards', () => {
    const mockSearchResults: SearchResults<Card> = {
      items: [mockCard],
      total: 1,
      page: 1,
      limit: 20,
      aggregations: {
        types: [{ key: CardType.STANDARD, count: 1 }],
        tags: [{ key: 'test', count: 1 }]
      };

    it('should return cached results if available', async () => {
      const cacheKey = service['generateCacheKey'](mockSearchQuery);
      mockRedisService.get.mockResolvedValue(JSON.stringify(mockSearchResults));

      const results = await service.searchCards(mockSearchQuery);

      expect(results).toEqual(mockSearchResults);
      expect(mockRedisService.get).toHaveBeenCalledWith(cacheKey);
      expect(mockElasticsearchService.search).not.toHaveBeenCalled();
    });

    it('should perform search and cache results', async () => {
      mockRedisService.get.mockResolvedValue(null);
      mockElasticsearchService.search.mockResolvedValue({
        hits: {
          total: { value: 1 },
          hits: [{
            _id: mockCard.id,
            _source: mockCard
          }]
        },
        aggregations: {
          types: {
            buckets: [{ key: CardType.STANDARD, doc_count: 1 }]
          },
          tags: {
            buckets: [{ key: 'test', doc_count: 1 }]
          }
      });


      expect(results).toEqual(mockSearchResults);
      expect(mockElasticsearchService.search).toHaveBeenCalledWith({
        index: 'cards',
        body: expect.objectContaining({
          query: expect.any(Object),
          sort: expect.any(Array),
          from: 0,
          size: 20,
          aggs: expect.any(Object)
        })
      });

      expect(mockRedisService.set).toHaveBeenCalledWith(
        expect.any(String),
        JSON.stringify(mockSearchResults),
        300 // 5 minutes TTL
      );
    });

    it('should handle search errors', async () => {
      mockRedisService.get.mockResolvedValue(null);
      mockElasticsearchService.search.mockRejectedValue(error);

      await expect(service.searchCards(mockSearchQuery)).rejects.toThrow(
        'Failed to search cards'
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to search cards',
        expect.objectContaining({
          query: mockSearchQuery,
          error: error.message
        })
      );
    });

    it('should build complex queries with filters', async () => {
      const complexQuery: SearchQuery = {
        ...mockSearchQuery,
        filters: {
          type: [CardType.STANDARD, CardType.PREMIUM],
          status: [CardStatus.ACTIVE],
          tags: ['test', 'demo'],
          dateRange: {
            start: new Date('2024-01-01'),
            end: new Date('2024-01-31')
          }
      };

      mockRedisService.get.mockResolvedValue(null);
      mockElasticsearchService.search.mockResolvedValue({
        hits: { total: { value: 0 }, hits: [] });

      await service.searchCards(complexQuery);

      expect(mockElasticsearchService.search).toHaveBeenCalledWith({
        index: 'cards',
        body: {
          query: {
            bool: {
              must: [
                { match: { _all: 'test' } }
              ],
              filter: [
                { terms: { type: [CardType.STANDARD, CardType.PREMIUM] } },
                { terms: { status: [CardStatus.ACTIVE] } },
                { terms: { tags: ['test', 'demo'] } },
                {
                  range: {
                    createdAt: {
                      gte: complexQuery.filters.dateRange.start,
                      lte: complexQuery.filters.dateRange.end
                    }
                }
              ]
            },
          sort: [{ _score: { order: 'desc' } }],
          from: 0,
          size: 20,
          aggs: expect.any(Object)
        });
    });
  });

  describe('updateCard', () => {
    it('should update card in index', async () => {
      mockElasticsearchService.update.mockResolvedValue({
        _id: mockCard.id,
        result: 'updated'
      });

      await service.updateCard(mockCard.id, { title: 'Updated Title' });

      expect(mockElasticsearchService.update).toHaveBeenCalledWith({
        index: 'cards',
        id: mockCard.id,
        body: {
          doc: { title: 'Updated Title' }
      });

      expect(mockRedisService.del).toHaveBeenCalledWith(
        expect.stringContaining('search:')
      );

      expect(mockEventEmitter.emit).toHaveBeenCalledWith('card:updated', {
        cardId: mockCard.id
      });
    });

    it('should handle update errors', async () => {
      mockElasticsearchService.update.mockRejectedValue(error);

      await expect(
        service.updateCard(mockCard.id, { title: 'Updated' })
      ).rejects.toThrow('Failed to update card');

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to update card',
        expect.objectContaini
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
