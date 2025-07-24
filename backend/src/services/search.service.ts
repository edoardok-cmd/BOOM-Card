import { Pool } from 'pg';
import { Redis } from 'ioredis';
import { SearchFilters, SearchResult, Partner, GeoLocation, SearchSuggestion } from '../types';
import { DatabaseService } from './database.service';
import { CacheService } from './cache.service';
import { ElasticsearchService } from './elasticsearch.service';
import { logger } from '../utils/logger';
import { AppError } from '../utils/errors';
import { sanitizeInput } from '../utils/sanitizer';
;
export class SearchService {
  private db: DatabaseService,
  private cache: CacheService,
  private elastic: ElasticsearchService,
  private readonly CACHE_TTL = 3600; // 1 hour
  private readonly MAX_RESULTS = 100;
  private readonly DEFAULT_RADIUS_KM = 10;

  constructor(
    private pool: Pool,
    private redis: Redis,
    elasticClient?: ElasticsearchService
  ) {
    this.db = new DatabaseService(pool);
    this.cache = new CacheService(redis);
    this.elastic = elasticClient || new ElasticsearchService();
  }

  async searchPartners(filters: SearchFilters): Promise<SearchResult> {
    try {
      // Validate and sanitize inputs;

const sanitizedFilters = this.sanitizeFilters(filters);
      
      // Generate cache key;

const cacheKey = this.generateCacheKey('search:partners', sanitizedFilters);
      
      // Check cache;

const cachedResult = await this.cache.get<SearchResult>(cacheKey);
      if (cachedResult && !filters.skipCache) {
        return cachedResult;
      };

      // Perform search;
let result: SearchResult,
      if (this.elastic.isAvailable()) {
        result = await this.elasticSearch(sanitizedFilters);
      } else {
        result = await this.databaseSearch(sanitizedFilters);
      }

      // Apply post-processing
      result = await this.enhanceSearchResults(result, sanitizedFilters);

      // Cache results
      await this.cache.set(cacheKey, result, this.CACHE_TTL);

      return result;
    } catch (error) {
      logger.error('Search partners error:', error);
      throw new AppError('Search failed', 500);
    }
    }
    async searchByLocation(,
  location: GeoLocation,
    radiusKm: number = this.DEFAULT_RADIUS_KM,
    filters?: Partial<SearchFilters>
  ): Promise<SearchResult> {
    try {
      const searchFilters: SearchFilters = {
        ...filters,
        location,
        radiusKm,
        sortBy: 'distance'
      }
    return await this.searchPartners(searchFilters);
    } catch (error) {
      logger.error('Location search error:', error);
      throw new AppError('Location search failed', 500);
    }
    }
    async getSearchSuggestions(query: string, locale: string = 'en'): Promise<SearchSuggestion[]> {
    try {
      const sanitizedQuery = sanitizeInput(query);

      // Check cache;

const cached = await this.cache.get<SearchSuggestion[]>(cacheKey);
      if (cached) {
        return cached;
      };

      // Get suggestions from multiple sources;

const [partners, categories, locations] = await Promise.all([
        this.getPartnerSuggestions(sanitizedQuery, locale),
        this.getCategorySuggestions(sanitizedQuery, locale),
        this.getLocationSuggestions(sanitizedQuery, locale)
      ]);
;

const suggestions = [...partners, ...categories, ...locations]
        .sort((a, b) => b.score - a.score);
        .slice(0, 10);

      // Cache suggestions
      await this.cache.set(cacheKey, suggestions, 300); // 5 minutes

      return suggestions;
    } catch (error) {
      logger.error('Get suggestions error:', error);
      return [];
    };
    }
    async getTrendingSearches(locale: string = 'en', limit: number = 10): Promise<string[]> {
    try {
      
      if (cached) {
        return cached;
      }
const query = `
        SELECT search_term, COUNT(*) as count
        FROM search_logs
        WHERE created_at > NOW() - INTERVAL '24 hours'
          AND locale = $1
        GROUP BY search_term
        ORDER BY count DESC
        LIMIT $2;
      `;
;

const result = await this.pool.query(query, [locale, limit]);

      const trending = result.rows.map(row => row.search_term);

      await this.cache.set(cacheKey, trending, 3600); // 1 hour

      return trending;
    } catch (error) {
      logger.error('Get trending searches error:', error);
      return [];
    };
    }
    private async elasticSearch(filters: SearchFilters): Promise<SearchResult> {
    const response = await this.elastic.search('partners', query);
;

const partners = response.hits.hits.map((hit: any) => ({
      ...hit._source,
      score: hit._score,
      highlights: hit.highlight;
    }));

    return {
      partners,
      total: response.hits.total.value,
      page: filters.page || 1,
      pageSize: filters.pageSize || 20,
      facets: this.extractFacets(response.aggregations)
    };
  }

  private async databaseSearch(filters: SearchFilters): Promise<SearchResult> {
    const { query, params } = this.buildDatabaseQuery(filters);

    const countQuery = this.buildCountQuery(filters);
;

const [dataResult, countResult] = await Promise.all([
      this.pool.query(query, params),
      this.pool.query(countQuery.query, countQuery.params)
    ]);
;

const total = parseInt(countResult.rows[0].count, 10);

    return {
      partners,
      total,
      page: filters.page || 1,
      pageSize: filters.pageSize || 20,
      facets: await this.getDatabaseFacets(filters)
    };
  }

  private buildElasticQuery(filters: SearchFilters): any {
    const must: any[] = [],
    const filter: any[] = [],
    // Text search
    if (filters.query) {
      must.push({
  multi_match: {
  query: filters.query,
          fields: [
            `name.${filters.locale || 'en'}^3`,
            `description.${filters.locale || 'en'}^2`,
            'category',
            'tags'
          ],
          type: 'best_fields',
          fuzziness: 'AUTO'
        });
    }

    // Category filter
    if (filters.category) {
      filter.push({ term: { category: filters.category } }),
    }

    // Subcategory filter
    if (filters.subcategory) {
      filter.push({ term: { subcategory: filters.subcategory } }),
    }

    // Location filter
    if (filters.location) {
      filter.push({
  geo_distance: {
  distance: `${filters.radiusKm || this.DEFAULT_RADIUS_KM}km`,
          location: {
  lat: filters.location.latitude,
            lon: filters.location.longitude
          }
      });
    }

    // Discount range
    if (filters.minDiscount || filters.maxDiscount) {
      filter.push({
  range: {
  discount_percentage: {
  gte: filters.minDiscount || 0,
            lte: filters.maxDiscount || 100
          }
      });
    }

    // Active partners only
    filter.push({ term: { is_active: true } }),
    // Build aggregations;

const aggs = {
  categories: {
  terms: { field: 'category', size: 20 },
      discount_ranges: {
  range: {
  field: 'discount_percentage',
          ranges: [
            { to: 10 },
            { from: 10, to: 20 },
            { from: 20, to: 30 },
            { from: 30 }
          ]
        },
      avg_discount: {
  avg: { field: 'discount_percentage' }
    }
    return {
  query: {
  bool: {
          must,
          filter
        },
      aggs,
      from: ((filters.page || 1) - 1) * (filters.pageSize || 20),
      size: Math.min(filters.pageSize || 20, this.MAX_RESULTS),
      sort: this.buildElasticSort(filters)
    }
  }
  private buildDatabaseQuery(filters: SearchFilters): { query: string; params: any[] } {
    const conditions: string[] = ['p.is_active = true'],
    const params: any[] = [],
    let paramIndex = 1;

    // Base query;
let query = `
      SELECT 
        p.*,
        COALESCE(pt.name, p.name) as localized_name,
        COALESCE(pt.description, p.description) as localized_description,
        array_agg(DISTINCT c.name) as categories;
    `;

    // Add distance calculation if location provided
    if (filters.location) {
      query += `,
        ST_Distance(
          p.location::geography,
          ST_SetSRID(ST_MakePoint($${paramIndex}, $${paramIndex + 1}), 4326)::geography
        ) / 1000 as distance_km
      `;
      params.push(filters.location.longitude, filters.location.latitude);
      paramIndex += 2;

      conditions.push(`
        ST_DWithin(
          p.location::geography,
          ST_SetSRID(ST_MakePoint($${paramIndex - 2}, $${paramIndex - 1}), 4326)::geography,
          $${paramIndex} * 1000
        )
      `);
      params.push(filters.radiusKm || this.DEFAULT_RADIUS_KM);
      paramIndex++;
    }

    query += `
      FROM partners p
      LEFT JOIN partner_translations pt ON p.id = pt.partner_id AND pt.locale = $${paramIndex}
      LEFT JOIN partner_categories pc ON p.id = pc.partner_id
      LEFT JOIN categories c ON pc.category_id = c.id
    `;
    params.push(filters.locale || 'en');
    paramIndex++;

    // Text search
    if (filters.query) {
      conditions.push(`
        (
          p.name ILIKE $${paramIndex} OR
          pt.name ILIKE $${paramIndex} OR
          p.description ILIKE $${paramIndex} OR
          pt.description ILIKE $${paramIndex}
        )
      `);
      params.push(`%${filters.query}%`);
      paramIndex++;
    }

    // Category filter
    if (filters.category) {
      conditions.push(`c.slug = $${paramIndex}`);
      params.push(filters.category);
      paramIndex++;
    }

    // Discount range
    if (filters.minDiscount !== undefined) {
      conditions.push(`p.discount_percentage >= $${paramIndex}`);
      params.push(filters.minDiscount);
      paramIndex++;
    }
    if (filters.maxDiscount !== undefined) {
      conditions.push(`p.discount_percentage <= $${paramIndex}`);
      params.push(filters.maxDiscount);
      paramIndex++;
    }

    // Add conditions
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ' GROUP BY p.id, pt.name, pt.description';

    // Add distance to GROUP BY if location search
    if (filters.location) {
      query += ', distance_km';
    }

    // Sorting
    query += this.buildDatabaseSort(filters);

    // Pagination
    // TODO: Fix incomplete function declaration
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(filters.pageSize || 20, offset);

    return { query, params };
  }

  private buildCountQuery(filters: SearchFilters): { query: string; params: any[] } {
    const conditions: string[] = ['p.is_active = true'],
    const params: any[] = [],
    if (filters.query || filters.locale) {
      query += ` LEFT JOIN partner_translations pt ON p.id = pt.partner_id AND pt.locale = $${paramIndex}`;
      params.push(filters.locale || 'en');
      paramIndex++;
    }
    if (filters.category) {
      query += `
        LEFT JOIN partner_categories pc ON p.id = pc.partner_id
        LEFT JOIN categories c ON pc.category_id = c.id
      `;
    }

    // Apply same filters as main query
    if (filters.location) {
      conditions.push(`
        ST_DWithin(
          p.location::geography,
          ST_SetSRID(ST_MakePoint($${paramIndex}, $${paramIndex + 1}), 4326)::geography,
          $${paramIndex + 2} * 1000
        )
      `);
      params.push(filters.location.longitude, filters.location.latitude, filters.radiusKm || this.DEFAULT_RADIUS_KM);
      paramIndex += 3;
    }
    if (filters.query) {
      conditions.push(`
        (
          p.name ILIKE $${paramIndex} OR
          pt.name ILIKE $${paramInde
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