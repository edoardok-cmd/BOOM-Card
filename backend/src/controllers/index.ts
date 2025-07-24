import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

// Services
import * as authService from '../services/authService';
import * as userService from '../services/userService';
import * as cardService from '../services/cardService';
import * as transactionService from '../services/transactionService';

// Utilities
import { ApiResponse } from '../utils/apiResponse';
import { AppError } from '../utils/appError';
import { HTTP_STATUS_CODES } from '../utils/httpStatusCodes';

// Types
import { IUserPayload } from '../types/user';

/**
 * Extends the Express Request interface to include a 'user' property,
 * typically populated by authentication middleware.
 */
interface RequestWithUser extends Request {
    user?: IUserPayload;
}

/**
 * Generic type for an asynchronous controller function.
 */
type ControllerFunction = (req: Request, res: Response, next: NextFunction) => Promise<void>;

/**
 * Generic type for an asynchronous controller function that requires authentication.
 */
type AuthenticatedControllerFunction = (req: RequestWithUser, res: Response, next: NextFunction) => Promise<void>;

// No specific constants or configuration are globally required for this controller index file.

// No decorators are used in standard Express/TypeScript for route handling.

import { Request, Response, NextFunction } from 'express';

// Assuming these types were defined in Part 1 or a shared types file.
// If not, they would typically be here or in a '../types/index.ts' file.
interface Card {
    id: string;
    cardType: string; // e.g., 'Gift Card', 'Loyalty Card', 'Promo Card'
    initialValue: number;
    currentValue: number;
    customerId: string; // ID of the customer who owns/uses the card
    expiryDate: Date | null;
    status: 'active' | 'inactive' | 'expired' | 'used';
    createdAt: Date;
    updatedAt: Date;
    notes?: string;
}

interface CardCreationData {
    cardType: string;
    initialValue: number;
    customerId: string;
    expiryDate?: string; // String format for input (e.g., 'YYYY-MM-DD')
    notes?: string;
}

interface CardUpdateData {
    cardType?: string;
    currentValue?: number;
    status?: 'active' | 'inactive' | 'expired' | 'used';
    expiryDate?: string;
    notes?: string;
}

// In a real application, you would typically inject a service layer here
// (e.g., CardService) which handles business logic and data persistence.
// For this example, we'll use an in-memory array to simulate a database.

class CardController {
    // In-memory store for demonstration purposes
    private cards: Card[] = [];

    constructor() {
        // Initialize with some mock data for testing
        this.cards.push({
            id: 'boom_card_001',
            cardType: 'Gift Card',
            initialValue: 100.00,
            currentValue: 75.50,
            customerId: 'customer_A1',
            expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 2)),
            status: 'active',
            createdAt: new Date('2023-01-15T10:00:00Z'),
            updatedAt: new Date('2023-02-20T14:30:00Z'),
            notes: 'Issued as holiday gift'
        });
        this.cards.push({
            id: 'boom_card_002',
            cardType: 'Loyalty Card',
            initialValue: 0.00,
            currentValue: 250.75,
            customerId: 'customer_B2',
            expiryDate: null, // Loyalty cards might not expire
            status: 'active',
            createdAt: new Date('2022-05-01T08:00:00Z'),
            updatedAt: new Date('2023-03-01T09:15:00Z'),
            notes: 'Standard loyalty program member'
        });
        this.cards.push({
            id: 'boom_card_003',
            cardType: 'Gift Card',
            initialValue: 50.00,
            currentValue: 0.00,
            customerId: 'customer_C3',
            expiryDate: new Date('2023-01-01T23:59:59Z'), // Already expired
            status: 'used',
            createdAt: new Date('2022-10-10T11:00:00Z'),
            updatedAt: new Date('2022-12-25T16:00:00Z'),
            notes: 'Fully redeemed and expired'
        });

        // Bind 'this' to all public methods to ensure correct context when used as Express route handlers
        this.createCard = this.createCard.bind(this);
        this.getCardById = this.getCardById.bind(this);
        this.getAllCards = this.getAllCards.bind(this);
        this.updateCard = this.updateCard.bind(this);
        this.deleteCard = this.deleteCard.bind(this);
        this.activateCard = this.activateCard.bind(this);
        this.deactivateCard = this.deactivateCard.bind(this);
        this.redeemCard = this.redeemCard.bind(this);
        this.addValueToCard = this.addValueToCard.bind(this);
    }

    /**
     * Middleware function to validate data for new card creation.
     * This ensures required fields are present and correctly formatted before hitting the main logic.
     * @param req The Express request object.
     * @param res The Express response object.
     * @param next The next middleware function in the stack.
     */
    public validateCardCreation = (req: Request, res: Response, next: NextFunction) => {
        const { cardType, initialValue, customerId, expiryDate } = req.body as CardCreationData;

        if (!cardType || typeof cardType !== 'string' || cardType.trim() === '') {
            return res.status(400).json({ message: 'Card type is required and must be a non-empty string.' });
        }
        if (typeof initialValue !== 'number' || initialValue < 0) {
            return res.status(400).json({ message: 'Initial value must be a non-negative number.' });
        }
        if (!customerId || typeof customerId !== 'string' || customerId.trim() === '') {
            return res.status(400).json({ message: 'Customer ID is required and must be a non-empty string.' });
        }
        if (expiryDate && isNaN(new Date(expiryDate).getTime())) {
            return res.status(400).json({ message: 'Invalid expiry date format. Use a valid date string.' });
        }
        next();
    };

    /**
     * @route POST /api/cards
     * @desc Create a new Boom Card
     * @access Private (e.g., Admin, or internal system for card issuance)
     * @body { cardType: string, initialValue: number, customerId: string, expiryDate?: string, notes?: string }
     */
    public async createCard(req: Request, res: Response, next: NextFunction) {
        try {
            // Assumes `validateCardCreation` middleware has already run
            const { cardType, initialValue, customerId, expiryDate, notes } = req.body as CardCreationData;

            const newCard: Card = {
                id: `boom_card_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`, // Generate a unique ID
                cardType,
                initialValue,
                currentValue: initialValue,
                customerId,
                expiryDate: expiryDate ? new Date(expiryDate) : null,
                status: 'active', // New cards are typically active by default
                createdAt: new Date(),
                updatedAt: new Date(),
                notes: notes || null
            };

            this.cards.push(newCard); // Add to our mock store

            res.status(201).json({ message: 'Boom Card created successfully', card: newCard });
        } catch (error) {
            console.error('Error creating Boom Card:', error);
            // Pass the error to the Express error handling middleware
            next(error);
        }

    /**
     * @route GET /api/cards/:id
     * @desc Retrieve a single Boom Card by its ID
     * @access Private (e.g., Admin, or the customer associated with the card)
     * @param {string} id - The unique ID of the Boom Card
     */
    public async getCardById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const card = this.cards.find(c => c.id === id);

            if (!card) {
                return res.status(404).json({ message: `Boom Card with ID "${id}" not found.` });
            }

            res.status(200).json({ card });
        } catch (error) {
            console.error('Error retrieving Boom Card by ID:', error);
            next(error);
        }
    }

    /**
     * @route GET /api/cards
     * @desc Retrieve all Boom Cards (typically for administrative purposes, supports filtering/pagination)
     * @access Private (Admin only)
     * @query { customerId?: string, status?: 'active' | 'inactive' | 'expired' | 'used' } // Example query params
     */
    public async getAllCards(req: Request, res: Response, next: NextFunction) {
        try {
            let filteredCards = [...this.cards]; // Start with all cards

            // Example: Basic filtering by query parameters
            const { customerId, status } = req.query;
            if (customerId) {
                filteredCards = filteredCards.filter(card => card.customerId === customerId);
            }
            if (status && ['active', 'inactive', 'expired', 'used'].includes(status as string)) {
                filteredCards = filteredCards.filter(card => card.status === status);
            }

            // In a real app, you would also implement pagination (e.g., limit, offset)

            res.status(200).json({ cards: filteredCards, count: filteredCards.length });
        } catch (error) {
            console.error('Error retrieving all Boom Cards:', error);
            next(error);
        }
    }

    /**
     * @route PUT /api/cards/:id
     * @desc Update details of an existing Boom Card
     * @access Private (e.g., Admin, or authorized system)
     * @param {string} id - The ID of the card to update
     * @body { status?: string, currentValue?: number, expiryDate?: string, notes?: string }
     */
    public async updateCard(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const updateData = req.body as CardUpdateData;

            const cardIndex = this.cards.findIndex(c => c.id === id);

            if (cardIndex === -1) {
                return res.status(404).json({ message: `Boom Card with ID "${id}" not found.` });
            }

            const existingCard = this.cards[cardIndex];

            // Basic validation for status and value
            if (updateData.status && !['active', 'inactive', 'expired', 'used'].includes(updateData.status)) {
                return res.status(400).json({ message: 'Invalid card status provided.' });
            }
            if (updateData.currentValue !== undefined && (typeof updateData.currentValue !== 'number' || updateData.currentValue < 0)) {
                return res.status(400).json({ message: 'Current value must be a non-negative number.' });
            }
            if (updateData.expiryDate && isNaN(new Date(updateData.expiryDate).getTime())) {
                return res.status(400).json({ message: 'Invalid expiry date format for update.' });
            }

            // Apply updates, ensuring original ID, initialValue, customerId are not changed via this route
            const updatedCard: Card = {
                ...existingCard,
                ...updateData,
                expiryDate: updateData.expiryDate ? new Date(updateData.expiryDate) : existingCard.expiryDate,
                updatedAt: new Date()
            };

            this.cards[cardIndex] = updatedCard; // Update in mock store

            res.status(200).json({ message: 'Boom Card updated successfully', card: updatedCard });
        } catch (error) {
            console.error('Error updating Boom Card:', error);
            next(error);
        }
    }

    /**
     * @route DELETE /api/cards/:id
     * @desc Delete a Boom Card (In real apps, prefer soft delete by updating status to 'deleted')
     * @access Private (Admin only)
     * @param {string} id - The ID of the card to delete
     */
    public async deleteCard(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const initialLength = this.cards.length;
            this.cards = this.cards.filter(card => card.id !== id);

            if (this.cards.length === initialLength) {
                return res.status(404).json({ message: `Boom Card with ID "${id}" not found.` });
            }

            // 204 No Content - successful deletion with no response body
            res.status(204).send();
        } catch (error) {
            console.error('Error deleting Boom Card:', error);
            next(error);
        }
    }

    /**
     * @route PATCH /api/cards/:id/activate
     * @desc Activate a Boom Card (sets its status to 'active')
     * @access Private (Admin or system)
     * @param {string} id - The ID of the card to activate
     */
    public async activateCard(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;

            if (cardIndex === -1) {
                return res.status(404).json({ message: `Boom Card with ID "${id}" not found.` });
            }

            if (card.status === 'active') {
                return res.status(200).json({ message: 'Card is already active.', card });
            }

            // Prevent activating expired or fully used cards (business logic decision)
            if (card.status === 'expired' || card.status === 'used') {
                 return res.status(400).json({ message: `Cannot activate a card with status '${card.status}'.` });
            }

            card.status = 'active';
            card.updatedAt = new Date();
            this.cards[cardIndex] = card;

            res.status(200).json({ message: 'Boom Card activated successfully.', card });
        } catch (error) {
            console.error('Error activating Boom Card:', error);
            next(error);
        }
    }

    /**
     * @route PATCH /api/cards/:id/deactivate
     * @desc Deactivate a Boom Card (sets its status to 'inactive')
     * @access Private (Admin or system)
     * @param {string} id - The ID of the card to deactivate
     */
    public async deactivateCard(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;

            if (cardIndex === -1) {
                return res.status(404).json({ message: `Boom Card with ID "${id}" not found.` });
            }

            if (card.status === 'inactive') {
                return res.status(200).json({ message: 'Card is already inactive.', card });
            }
            // Cannot deactivate if already used or expired, or perhaps an admin must intervene
            if (card.status === 'used' || card.status === 'expired') {
                return res.status(400).json({ message: `Cannot deactivate a card with status '${card.status}'.` });
            }

            card.status = 'inactive';
            card.updatedAt = new Date();
            this.cards[cardIndex] = card;

            res.status(200).json({ message: 'Boom Card deactivated successfully.', card });
        } catch (error) {
            console.error('Error deactivating Boom Card:', error);
            next(error);
        }
    }

    /**
     * @route POST /api/cards/:id/redeem
     * @desc Redeem value from a Boom Card (e.g., use gift card balance, spend loyalty points)
     * @access Private (e.g., Merchant, authorized application user)
     * @param {string} id - The ID of the card
     * @body { amount: number, transactionId?: string, merchantId?: string }
     */
    public async redeemCard(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { amount, transactionId, merchantId } = req.body;

            if (typeof amount !== 'number' || amount <= 0) {
                return res.status(400).json({ message: 'Redemption amount must be a positive number.' });
            }


            if (cardIndex === -1) {
                return res.status(404).json({ message: `Boom Card with ID "${id}" not found.` });
            }


            // Business logic for redemption
            if (card.status !== 'active') {
                return res.status(400).json({ message: `Cannot redeem from a card with status '${card.status}'. Only active cards can be redeemed.` });
            }
            if (card.expiryDate && new Date() > card.expiryDate) {
                card.status = 'expired'; // Update status if expired on redemption attempt
                this.cards[cardIndex] = card;
                return res.status(400).json({ message: 'Cannot redeem from an expired card. Status updated to expired.' });
            }
            if (card.currentValue < amount) {
                return res.status(400).json({ message: `Insufficient card balance. Current: ${card.currentValue.toFixed(2)}, Attempted: ${amount.toFixed(2)}` });
            }

            card.currentValue -= amount;
            card.updatedAt = new Date();
            if (card.currentValue === 0) {
                card.status = 'used'; // Mark as used if balance reaches zero
            }

            this.cards[cardIndex] = card;

            // In a real application, you would also persist this transaction (e.g., to a `Transactions` table)
            // Example: await transactionService.createTransaction({ cardId: card.id, amount, type: 'redeem', transactionId, merchantId });

            res.status(200).json({
                message: `Successfully redeemed ${amount.toFixed(2)} from card ${id}. New balance: ${card.currentValue.toFixed(2)}`,
                card: card,
                transactionId: transactionId || `txn_${Date.now()}_${Math.random().toString(36).substring(2, 5)}` // Mock transaction ID
            });
        } catch (error) {
            console.error('Error redeeming value from Boom Card:', error);
            next(error);
        }
    }

    /**
     * @route POST /api/cards/:id/add-value
     * @desc Add value to a Boom Card (e.g., recharge gift card, add loyalty points)
     * @access Private (e.g., Admin, Merchant, or authorized user for self-recharge)
     * @param {string} id - The ID of the card
     * @body { amount: number, transactionId?: string, merchantId?: string }
     */
    public async addValueToCard(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { amount, transactionId, merchantId } = req.body;

            if (typeof amount !== 'number' || amount <= 0) {
                return res.status(400).json({ message: 'Amount to add must be a positive number.' });
            }


            if (cardIndex === -1) {
                return res.status(404).json({ message: `Boom Card with ID "${id}" not found.` });
            }


            // Business logic for adding value
            if (card.status === 'expired') {
                return res.status(400).json({ message: 'Cannot add value to an expired card.' });
            }
            // You might have a max value limit here:
            // if (card.currentValue + amount > MAX_CARD_VALUE) { ... }

            card.currentValue += amount;
            card.updatedAt = new Date();
            // If card was 'used' (balance 0) but now has value, set it back to active (if not expired)
            if (card.status === 'used' && card.currentValue > 0) {
                card.status = 'active';
            }
            // If an inactive card receives value, you might activate it automatically
            // if (card.status === 'inactive' && card.currentValue > 0) { card.status = 'active'; }

            this.cards[cardIndex] = card;

            // Persist transaction
            // Example: await transactionService.createTransaction({ cardId: card.id, amount, type: 'add_value', transactionId, merchantId });

            res.status(200).json({
                message: `Successfully added ${amount.toFixed(2)} to card ${id}. New balance: ${card.currentValue.toFixed(2)}`,
                card: card,
                transactionId: transactionId || `txn_${Date.now()}_${Math.random().toString(36).substring(2, 5)}` // Mock transaction ID
            });
        } catch (error) {
            console.error('Error adding value to Boom Card:', error);
            next(error);
        }
    }
}

// Export an instance of the CardController.
// This is the common pattern for Express applications when using classes for controllers.
export const cardController = new CardController();

// If there were other controller files (e.g., for users, transactions),
// you would typically import them and re-export them from this index.ts file
// to create a single, clean entry point for all controllers:
// export * from './userController';
// export * from './transactionController';

}
}
}
}
}
}
}
}
}
