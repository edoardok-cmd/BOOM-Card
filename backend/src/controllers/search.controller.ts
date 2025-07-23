// 1. All import statements
import { Request, Response, NextFunction } from 'express';
import * as searchService from '../services/search.service'; // Assuming a service layer handles the core search logic
import { asyncHandler } from '../utils/asyncHandler'; // Utility for wrapping async Express handlers
import { ApiError } from '../utils/ApiError'; // Custom error class for API responses
import { HttpStatusCode } from '../utils/httpStatusCodes'; // Enum for HTTP status codes
import config from '../config/config'; // For general application configuration

// 2. All TypeScript interfaces and types

/**
 * Defines the possible types of content that can be searched.
 */
type SearchContentType = 'cards' | 'users' | 'decks' | 'all';

/**
 * Interface for the expected query parameters for a search request.
 */
export interface ISearchQueryParams {
    q?: string; // The search query string (e.g., 'Boom card')
    type?: SearchContentType; // The type of content to search within (e.g., 'cards', 'users', 'decks', 'all')
    page?: string; // Current page number for pagination (string as it comes from query params)
    limit?: string; // Number of items per page for pagination (string)
    sort?: string; // Sorting criteria (e.g., 'createdAt:desc', 'name:asc')
    filters?: string; // JSON string or comma-separated key-value pairs of filters (e.g., 'rarity:legendary,color:red')
}

/**
 * Interface for a single search result item.
 * This is a generic structure; specific result types (Card, User, Deck) might extend this or be detailed within the service.
 */
export interface ISearchResultItem {
    id: string;
    type: 'card' | 'user' | 'deck'; // The actual type of the returned item
    name: string; // Common field for display (e.g., card name, username, deck name)
    description?: string; // Common field for display (e.g., card description, user bio, deck description)
    imageUrl?: string; // Common field for display (e.g., card art, user avatar, deck cover)
    // Additional fields might be present based on the 'type'
    // For 'card': rarity, attack, defense, color, etc.
    // For 'user': username, email, followersCount, etc.
    // For 'deck': ownerId, cardCount, etc.
}

/**
 * Interface for the paginated search results response structure.
 */
export interface ISearchResultsResponse {
    totalResults: number;
    currentPage: number;
    limit: number;
    totalPages: number;
    results: ISearchResultItem[];
}

// 3. All constants and configuration

// Default and maximum limits for search results per page, loaded from application config
const DEFAULT_SEARCH_LIMIT = config.search?.defaultLimit || 20;
const MAX_SEARCH_LIMIT = config.search?.maxLimit || 100;
const DEFAULT_SEARCH_PAGE = 1;

// Define the supported content types for search queries
const SUPPORTED_SEARCH_TYPES: SearchContentType[] = ['cards', 'users', 'decks', 'all'];

// 4. Any decorators or metadata
// (Standard Express controllers typically do not use decorators for routing or dependency injection
// in the same way as frameworks like NestJS or Angular. If custom validation or authorization
// decorators were used, they would be defined or imported here. For this project,
// we assume such decorators are either not used or are handled by middleware functions.)

import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { SearchQuery, SearchResult } from '../types/search.types'; // Assuming these types are defined in Part 1 or a common type file
import { searchService } from '../services/search.service'; // Assuming searchService instance is exported from its service file

/**
 * Defines the allowed types of entities that can be searched within the BOOM Card system.
 * This constant ensures strong typing and helps validate against unsupported search categories.
 */
const ALLOWED_SEARCH_TYPES = ['user', 'card', 'transaction', 'merchant'] as const;
type AllowedSearchType = typeof ALLOWED_SEARCH_TYPES[number];

/**
 * @desc Handles general search queries across different entities in the BOOM Card system.
 * This endpoint allows users to search for various data types based on a query string
 * and an optional entity type filter.
 *
 * @route GET /api/v1/search
 * @access Private (requires authentication and appropriate authorization)
 *
 * @queryParam {string} q - **Required**. The main search query string (e.g., a username, transaction ID, card number snippet, merchant name). Must be non-empty.
 * @queryParam {AllowedSearchType} [type] - **Optional**. The specific type of entity to search for (e.g., 'user', 'card', 'transaction', 'merchant'). If omitted, the service layer might perform a broader, multi-type search or default to a common type.
 * @queryParam {number} [page=1] - **Optional**. The page number for pagination. Defaults to 1. Must be a positive integer.
 * @queryParam {number} [limit=10] - **Optional**. The number of results per page. Defaults to 10. Must be a positive integer between 1 and 100.
 *
 * @returns {Promise<Response>} A JSON response containing the search results, including pagination information.
 *
 * @throws {ApiError}
 * - 400: If the search query 'q' is missing or invalid.
 * - 400: If the 'type' parameter is provided but is not one of the `ALLOWED_SEARCH_TYPES`.
 * - 400: If 'page' or 'limit' parameters are invalid (e.g., not integers, out of range).
 * - Other errors: Propagated from `searchService` if database or business logic issues occur.
 */
const search = asyncHandler(async (req: Request, res: Response) => {
    // Extract and initial validation of query parameters
    const {
        q,
        type,
        page = '1', // Default to '1' as a string to be parsed later
        limit = '10' // Default to '10' as a string to be parsed later
    } = req.query;

    // 1. Validate the search query 'q'
    if (!q || typeof q !== 'string' || q.trim() === '') {
        throw new ApiError(400, "Search query 'q' is required and must be a non-empty string.");
    }

    // 2. Validate the search type 'type'
    let searchType: AllowedSearchType | undefined;
    if (type) {
        const typeStr = String(type).toLowerCase();
        if (!ALLOWED_SEARCH_TYPES.includes(typeStr as AllowedSearchType)) {
            throw new ApiError(
                400,
                `Invalid search type '${type}'. Allowed types are: ${ALLOWED_SEARCH_TYPES.join(', ')}.`
            );
        }
        searchType = typeStr as AllowedSearchType;
    }

    // 3. Parse and validate pagination parameters
    const pageNum = parseInt(String(page), 10);
    const limitNum = parseInt(String(limit), 10);

    if (isNaN(pageNum) || pageNum < 1) {
        throw new ApiError(400, "Page number must be a positive integer.");
    }
    // Enforce a reasonable upper limit for 'limit' to prevent overly large queries
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
        throw new ApiError(400, "Limit must be a positive integer between 1 and 100.");
    }

    // Construct the search query object to be passed to the service layer
    // This abstraction allows the service to handle the actual data retrieval logic.
    const searchQuery: SearchQuery = {
        query: q.trim(),
        type: searchType, // Will be `undefined` if not specified by the client, allowing broader search
        page: pageNum,
        limit: limitNum,
        // Optionally, pass the authenticated user's ID for personalized or scoped searches
        // For example, a user should only see their own transactions unless they are an admin.
        // userId: req.user?._id // Assuming `req.user` is populated by an authentication middleware
    };

    // Call the dedicated search service to perform the core search operation.
    // The service layer handles database queries, filtering, and potentially complex search algorithms.
    const results: SearchResult = await searchService.performSearch(searchQuery);

    // Respond with a success message and the search results.
    // ApiResponse utility ensures a consistent response structure.
    return res
        .status(200)
        .json(new ApiResponse(200, results, "Search results fetched successfully."));
});

// Export the search controller function for use in routes.
export { search };

import { Request, Response, NextFunction } from 'express';
import Card from '../models/card.model'; // Assuming a Mongoose model for cards
import { BoomError } from '../utils/boomError'; // Assuming a custom error class for consistent error handling

/**
 * Helper function to construct a Mongoose query object based on search term and filters.
 * @param searchQuery The main search term for card name or description.
 * @param filters An object containing various filter criteria (e.g., rarity, type, color, setId).
 * @returns A Mongoose query object.
 */
const buildMongooseQuery = (searchQuery: string | undefined, filters: any): any => {
    const query: any = {};

    if (searchQuery && typeof searchQuery === 'string' && searchQuery.trim().length > 0) {
        // Case-insensitive regex search on card name and/or description
        query.$or = [
            { name: { $regex: searchQuery, $options: 'i' } },
            { description: { $regex: searchQuery, $options: 'i' } } // Assuming cards have a description field
        ];
    }

    // Apply filters
    if (filters) {
        if (filters.rarity && typeof filters.rarity === 'string') {
            // Allow multiple rarities separated by commas
            query.rarity = { $in: filters.rarity.split(',').map((r: string) => r.trim()) };
        }
        if (filters.type && typeof filters.type === 'string') {
            // Allow multiple types separated by commas
            query.type = { $in: filters.type.split(',').map((t: string) => t.trim()) };
        }
        if (filters.color && typeof filters.color === 'string') {
            // Allow multiple colors separated by commas
            query.color = { $in: filters.color.split(',').map((c: string) => c.trim()) };
        }
        if (filters.setId && typeof filters.setId === 'string') {
            query.setId = filters.setId; // Assuming 'setId' refers to a specific set ID
        }
        // Numerical filters
        if (filters.attack && !isNaN(parseInt(filters.attack as string))) {
            query.attack = parseInt(filters.attack as string);
        }
        if (filters.defense && !isNaN(parseInt(filters.defense as string))) {
            query.defense = parseInt(filters.defense as string);
        }
        if (filters.cost && !isNaN(parseInt(filters.cost as string))) {
            query.cost = parseInt(filters.cost as string);
        }
        // Add more filters as needed based on the Card model schema (e.g., minAttack, maxCost, etc.)
    }

    return query;
};

/**
 * @desc Search for BOOM Cards based on query, filters, and pagination
 * @route GET /api/cards/search
 * @access Public
 * @returns {object} JSON response with cards, count, total, page, and pages
 */
export const search = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { query: searchQuery, rarity, type, color, setId, attack, defense, cost, page = '1', limit = '10' } = req.query;

        const parsedPage = parseInt(page as string);
        const parsedLimit = parseInt(limit as string);

        if (isNaN(parsedPage) || parsedPage < 1 || isNaN(parsedLimit) || parsedLimit < 1) {
            return next(new BoomError('Invalid pagination parameters. Page and limit must be positive numbers.', 400));
        }

        const filters = { rarity, type, color, setId, attack, defense, cost };
        const mongooseQuery = buildMongooseQuery(searchQuery as string, filters);

        const totalCards = await Card.countDocuments(mongooseQuery);
        const cards = await Card.find(mongooseQuery)
            .skip((parsedPage - 1) * parsedLimit)
            .limit(parsedLimit)
            .lean(); // Return plain JavaScript objects for performance

        res.status(200).json({
            success: true,
            count: cards.length,
            total: totalCards,
            page: parsedPage,
            pages: Math.ceil(totalCards / parsedLimit),
            data: cards,
        });

    } catch (error: any) {
        // Pass the error to the next error-handling middleware
        next(new BoomError(`Failed to perform search: ${error.message}`, 500));
    };

/**
 * @desc Get search suggestions for BOOM Card names
 * @route GET /api/cards/suggestions
 * @access Public
 * @returns {object} JSON response with a list of suggested card names
 */
export const getSuggestions = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { query } = req.query;

        if (!query || typeof query !== 'string' || query.trim().length === 0) {
            // If no query or empty query, return an empty suggestions array
            return res.status(200).json({ success: true, suggestions: [] });
        }

        const suggestions = await Card.find(
            { name: { $regex: query, $options: 'i' } }, // Case-insensitive regex search
            { name: 1, _id: 0 } // Project only the 'name' field, exclude '_id'
        )
            .limit(10) // Limit the number of suggestions returned
            .lean();

        // Extract unique names to avoid duplicates, especially with partial matches
        const uniqueSuggestions = Array.from(new Set(suggestions.map((s: any) => s.name)));

        res.status(200).json({
            success: true,
            suggestions: uniqueSuggestions,
        });

    } catch (error: any) {
        // Pass the error to the next error-handling middleware
        next(new BoomError(`Failed to fetch suggestions: ${error.message}`, 500));
    };

}
}
