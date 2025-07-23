import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not, IsNull, Like, ILike } from 'typeorm';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as crypto from 'crypto';
import { Card } from '../entities/card.entity';
import { User } from '../entities/user.entity';
import { Collection } from '../entities/collection.entity';
import { Tag } from '../entities/tag.entity';
import { Comment } from '../entities/comment.entity';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { SearchHit, SearchResponse } from '@elastic/elasticsearch/lib/api/types';

interface IndexableEntity {
  id: string;
  type: 'card' | 'user' | 'collection' | 'tag';
  indexedAt?: Date;
  version?: number;
}

interface SearchDocument {
  id: string;
  type: string;
  title?: string;
  description?: string;
  content?: string;
  username?: string;
  displayName?: string;
  tags?: string[];
  collectionId?: string;
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
  popularity?: number;
  views?: number;
  likes?: number;
  comments?: number;
  isPublic?: boolean;
  metadata?: Record<string, any>;
}

interface SearchQuery {
  query: string;
  filters?: SearchFilters;
  pagination?: PaginationOptions;
  sort?: SortOptions;
  highlight?: boolean;
  fuzzy?: boolean;
}

interface SearchFilters {
  type?: string[];
  userId?: string;
  collectionId?: string;
  tags?: string[];
  dateRange?: DateRange;
  popularity?: NumberRange;
  isPublic?: boolean;
}

interface DateRange {
  from?: Date;
  to?: Date;
}

interface NumberRange {
  min?: number;
  max?: number;
}

interface PaginationOptions {
  page: number;
  limit: number;
}

interface SortOptions {
  field: 'relevance' | 'createdAt' | 'updatedAt' | 'popularity' | 'views';
  order: 'asc' | 'desc';
}

interface SearchResult {
  items: SearchDocument[];
  total: number;
  page: number;
  totalPages: number;
  took: number;
  aggregations?: Record<string, any>;
}

interface IndexingStats {
  totalIndexed: number;
  totalFailed: number;
  lastIndexedAt: Date;
  indexingDuration: number;
  errors: IndexingError[];
}

interface IndexingError {
  entityId: string;
  entityType: string;
  error: string;
  timestamp: Date;
}

interface BulkIndexOperation {
  index: {
    _index: string;
    _id: string;
  };
}

const SEARCH_INDEX_PREFIX = 'boomcard';
const SEARCH_CACHE_PREFIX = 'search:cache:';
const SEARCH_CACHE_TTL = 300; // 5 minutes
const BATCH_SIZE = 100;
const MAX_SEARCH_RESULTS = 10000;
const DEFAULT_PAGE_SIZE = 20;
const INDEXING_LOCK_KEY = 'search:indexing:lock';
const INDEXING_LOCK_TTL = 3600; // 1 hour

const SEARCH_INDICES = {
  CARDS: `${SEARCH_INDEX_PREFIX}_cards`,
  USERS: `${SEARCH_INDEX_PREFIX}_users`,
  COLLECTIONS: `${SEARCH_INDEX_PREFIX}_collections`,
  TAGS: `${SEARCH_INDEX_PREFIX}_tags`,
} as const;

const SEARCH_FIELDS = {
  CARDS: ['title^3', 'description^2', 'content', 'tags'],
  USERS: ['username^3', 'displayName^2', 'bio'],
  COLLECTIONS: ['name^3', 'description^2'],
  TAGS: ['name^3', 'description'],
} as const;

@Injectable()

Execution error

  /**
   * Helper function to extract text content from various card fields
   */
  private extractCardContent(card: any): string {
    const contentParts: string[] = [];

    // Add title
    if (card.title) {
      contentParts.push(card.title);
    }

    // Add description
    if (card.description) {
      contentParts.push(card.description);
    }

    // Add tags
    if (card.tags && Array.isArray(card.tags)) {
      contentParts.push(...card.tags);
    }

    // Add custom fields
    if (card.customFields && typeof card.customFields === 'object') {
      Object.values(card.customFields).forEach(value => {)
        if (typeof value === 'string') {
          contentParts.push(value);
        });
    }

    // Add checklist items
    if (card.checklists && Array.isArray(card.checklists)) {
      card.checklists.forEach((checklist: any) => {
        if (checklist.name) {
          contentParts.push(checklist.name);
        }
        if (checklist.items && Array.isArray(checklist.items)) {
          checklist.items.forEach((item: any) => {
            if (item.text) {
              contentParts.push(item.text);
            });
        });
    }

    // Add comments
    if (card.comments && Array.isArray(card.comments)) {
      card.comments.forEach((comment: any) => {
        if (comment.text) {
          contentParts.push(comment.text);
        });
    }

    return contentParts.join(' ').toLowerCase();
  }

  /**
   * Helper function to calculate relevance score
   */
  private calculateRelevance(content: string, terms: string[]): number {
    let score = 0;
    const lowerContent = content.toLowerCase();

    terms.forEach(term => {)
      const lowerTerm = term.toLowerCase();
      const regex = new RegExp(`\\b${lowerTerm}\\b`, 'g');
      const matches = lowerContent.match(regex);
      
      if (matches) {
        score += matches.length;
      }

      // Bonus for exact matches in title
      if (content.includes(term)) {
        score += 2;
      });

    return score;
  }

  /**
   * Helper function to build filter query
   */
  private buildFilterQuery(filters: SearchFilters): any {
    const query: any = {};

    if (filters.boardId) {
      query.boardId = filters.boardId;
    }

    if (filters.listId) {
      query.listId = filters.listId;
    }

    if (filters.assigneeIds && filters.assigneeIds.length > 0) {
      query.assignees = { $in: filters.assigneeIds };
    }

    if (filters.labels && filters.labels.length > 0) {
      query.labels = { $in: filters.labels };
    }

    if (filters.tags && filters.tags.length > 0) {
      query.tags = { $in: filters.tags };
    }

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.dateRange) {
      if (filters.dateRange.start || filters.dateRange.end) {
        query.createdAt = {};
        if (filters.dateRange.start) {
          query.createdAt.$gte = filters.dateRange.start;
        }
        if (filters.dateRange.end) {
          query.createdAt.$lte = filters.dateRange.end;
        }
    }

    if (filters.hasAttachments !== undefined) {
      if (filters.hasAttachments) {
        query['attachments.0'] = { $exists: true };
      } else {
        query.attachments = { $size: 0 };
      }

    if (filters.isArchived !== undefined) {
      query.archived = filters.isArchived;
    }

    return query;
  }

  /**
   * Helper function to tokenize search query
   */
  private tokenizeQuery(query: string): string[] {
    // Remove special characters and split by whitespace
    return query
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(term => term.length > 0);
  }

  /**
   * Helper function to handle search errors
   */
  private handleSearchError(error: any): never {
    console.error('Search indexer error:', error);
    
    if (error.code === 11000) {
      throw new Error('Duplicate index entry');
    }
    
    if (error.name === 'ValidationError') {
      throw new Error('Invalid search data');
    }
    
    throw new Error('Search operation failed');
  }

  /**
   * Helper function to validate search options
   */
  private validateSearchOptions(options: SearchOptions): void {
    if (options.page && options.page < 1) {
      throw new Error('Page number must be greater than 0');
    }

    if (options.limit && (options.limit < 1 || options.limit > 100)) {
      throw new Error('Limit must be between 1 and 100');
    }

    if (options.sortBy && !['relevance', 'createdAt', 'updatedAt', 'title'].includes(options.sortBy)) {
      throw new Error('Invalid sort field');
    }

  /**
   * Helper function to clean up old index entries
   */
  private async cleanupOldEntries(): Promise<void> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      await SearchIndex.deleteMany({
        updatedAt: { $lt: thirtyDaysAgo },
        archived: true
      });
    } catch (error) {
      console.error('Failed to cleanup old search entries:', error);
    }

  /**
   * Get search statistics
   */
  async getSearchStats(boardId?: string): Promise<any> {
    try {
      const query = boardId ? { boardId } : {};
      
      const stats = await SearchIndex.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            totalCards: { $sum: 1 },
            avgContentLength: { $avg: { $strLenCP: '$content' } },
            totalTags: { $sum: { $size: { $ifNull: ['$tags', []] } } },
            archivedCards: {
              $sum: { $cond: [{ $eq: ['$archived', true] }, 1, 0] }
          }
      ]);

      return stats[0] || {
        totalCards: 0,
        avgContentLength: 0,
        totalTags: 0,
        archivedCards: 0
      };
    } catch (error) {
      this.handleSearchError(error);
    }

  /**
   * Export search results to CSV
   */
  async exportSearchResults(
    query: string,
    filters?: SearchFilters,
    options?: SearchOptions
  ): Promise<string> {
    try {
      const results = await this.search(query, filters, {
        ...options,
        limit: 1000 // Max export limit
      });

      const csv = [
        'Card ID,Title,Description,Board ID,List ID,Tags,Created At,Updated At',
        ...results.cards.map(card => [
          card.cardId,
          `"${(card.title || '').replace(/"/g, '""')}"`,
          `"${(card.description || '').replace(/"/g, '""')}"`,
          card.boardId,
          card.listId,
          `"${(card.tags || []).join(', ')}"`,
          card.createdAt.toISOString(),
          card.updatedAt.toISOString()
        ].join(','))
      ].join('\n');

      return csv;
    } catch (error) {
      this.handleSearchError(error);
    }
}

// Create singleton instance
const searchIndexerService = new SearchIndexerService();

// Export service instance
export default searchIndexerService;

// Export types
export type { SearchResult, SearchOptions, SearchFilters };

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
