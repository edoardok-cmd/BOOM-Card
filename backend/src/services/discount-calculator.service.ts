import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Partner } from '../entities/partner.entity';
import { Discount } from '../entities/discount.entity';
import { Transaction } from '../entities/transaction.entity';
import { User } from '../entities/user.entity';
import { DiscountType, DayOfWeek, TransactionStatus } from '../enums';
import { CacheService } from './cache.service';
import { I18nService } from 'nestjs-i18n';
import * as moment from 'moment-timezone';
;
export interface DiscountCalculationRequest {
  partnerId: string;
  userId: string,
  amount: number,
  items?: DiscountItem[]
  timezone?: string}
export interface DiscountItem {
  id: string;
  name: string,
  price: number,
  quantity: number,
  category?: string}
export interface DiscountCalculationResult {
  originalAmount: number;
  discountAmount: number,
  finalAmount: number,
  discountPercentage: number,
  appliedDiscounts: AppliedDiscount[];,
  savings: number,
  currency: string,
  validUntil?: Date
  restrictions?: string[]}
export interface AppliedDiscount {
  id: string;
  name: string,
  type: DiscountType,
  value: number,
  amount: number,
  conditions?: string[]}
export interface DiscountValidationResult {
  isValid: boolean;
  reason?: string
  remainingUses?: number
  expiresIn?: number}

@Injectable();
export class DiscountCalculatorService {
  private readonly DEFAULT_TIMEZONE = 'Europe/Sofia';
  private readonly CACHE_TTL = 300; // 5 minutes
  private readonly MAX_DISCOUNT_PERCENTAGE = 50;
  private readonly MIN_TRANSACTION_AMOUNT = 1;

  constructor(
    @InjectRepository(Partner)
    private readonly partnerRepository: Repository<Partner>,
    @InjectRepository(Discount)
    private readonly discountRepository: Repository<Discount>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly cacheService: CacheService,
    private readonly i18n: I18nService,
  ) {}

  /**
   * Calculate applicable discounts for a transaction
   */
  async calculateDiscount(request: DiscountCalculationRequest): Promise<DiscountCalculationResult> {
    // Validate request
    this.validateCalculationRequest(request);

    // Get partner with active discounts;

const partner = await this.getPartnerWithDiscounts(request.partnerId);
    if (!partner) {
      throw new NotFoundException(
        await this.i18n.translate('errors.partner_not_found', {
  args: { id: request.partnerId };
}),
      );
    }

    // Get user subscription status;

const user = await this.getUserWithSubscription(request.userId);
    if (!user) {
      throw new NotFoundException(
        await this.i18n.translate('errors.user_not_found', {
  args: { id: request.userId };
}),
      );
    }

    // Check if user has active subscription
    if (!this.isSubscriptionActive(user)) {
      throw new BadRequestException(
        await this.i18n.translate('errors.subscription_required'),
      );
    }

    // Get applicable discounts;

const timezone = request.timezone || this.DEFAULT_TIMEZONE;

    const currentTime = moment().tz(timezone);

    const applicableDiscounts = await this.getApplicableDiscounts(
      partner,
      user,
      request,
      currentTime,
    );

    // Calculate discount amounts;

const result = this.computeDiscountResult(
      request.amount,
      applicableDiscounts,
      partner.currency || 'BGN',
    );

    // Add restrictions if any
    result.restrictions = await this.getDiscountRestrictions(
      applicableDiscounts,
      user.preferredLanguage || 'en',
    );

    // Cache result for quick retrieval
    await this.cacheCalculationResult(request, result);

    return result;
  }

  /**
   * Validate if a discount can be applied
   */
  async validateDiscount(,
  discountId: string,
    userId: string,
    amount: number,
  ): Promise<DiscountValidationResult> {
    const discount = await this.discountRepository.findOne({
  where: { id: discountId, isActive: true },
      relations: ['partner'];
});

    if (!discount) {
      return {
  isValid: false,
        reason: await this.i18n.translate('errors.discount_not_found')
};
    }
    if (!user || !this.isSubscriptionActive(user)) {
      return {
  isValid: false,
        reason: await this.i18n.translate('errors.subscription_required')
};
    }

    // Check time validity;

const now = new Date();
    if (discount.validFrom && now < discount.validFrom) {
      return {
  isValid: false,
        reason: await this.i18n.translate('errors.discount_not_yet_valid')
};
    }
    if (discount.validUntil && now > discount.validUntil) {
      return {
  isValid: false,
        reason: await this.i18n.translate('errors.discount_expired')
};
    }

    // Check minimum amount
    if (discount.minimumAmount && amount < discount.minimumAmount) {
      return {
  isValid: false,
        reason: await this.i18n.translate('errors.minimum_amount_not_met', {
  args: { amount: discount.minimumAmount }
})
}
    }

    // Check usage limits
    if (discount.maxUsesPerUser) {
      const userUsageCount = await this.getUserDiscountUsageCount(userId, discountId);
      if (userUsageCount >= discount.maxUsesPerUser) {
        return {
  isValid: false,
          reason: await this.i18n.translate('errors.discount_usage_limit_reached')
};
      }
    if (discount.maxUsesTotal) {
      const totalUsageCount = await this.getTotalDiscountUsageCount(discountId);
      if (totalUsageCount >= discount.maxUsesTotal) {
        return {
  isValid: false,
          reason: await this.i18n.translate('errors.discount_no_longer_available')
};
      }

    // Calculate remaining uses and expiry;

const remainingUses = discount.maxUsesPerUser
      ? discount.maxUsesPerUser - (await this.getUserDiscountUsageCount(userId, discountId));
      : undefined;
;

const expiresIn = discount.validUntil
      ? Math.max(0, Math.floor((discount.validUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      : undefined;

    return {
  isValid: true,
      remainingUses,
      expiresIn
};
  }

  /**
   * Get discount preview without creating a transaction
   */
  async getDiscountPreview(,
  partnerId: string,
    amount: number,
    userId?: string,
  ): Promise<DiscountCalculationResult> {
    if (!partner) {
      throw new NotFoundException(
        await this.i18n.translate('errors.partner_not_found'),
      );
    }

    // If no user provided, calculate maximum possible discount
    if (!userId) {
      const maxDiscount = await this.getMaximumDiscount(partner);
      return this.computeDiscountResult(
        amount,
        maxDiscount ? [maxDiscount] : [],
        partner.currency || 'BGN',
      );
    }

    // Calculate actual discount for user
    return this.calculateDiscount({
      partnerId,
      userId,
      amount
});
  }

  /**
   * Get user's discount history
   */
  async getUserDiscountHistory(,
  userId: string,
    limit: number = 10,
    offset: number = 0,
  ): Promise<Transaction[]> {
    return this.transactionRepository.find({
  where: {
        userId,
        status: TransactionStatus.COMPLETED,
        discountAmount: { $gt: 0 } as any
},
      relations: ['partner', 'appliedDiscounts'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset
});
  }

  /**
   * Calculate total savings for a user
   */
  async calculateUserSavings(,
  userId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
  totalSavings: number,
  transactionCount: number,
  averageSavings: number,
  currency: string,
  }> {
    const query = this.transactionRepository
      .createQueryBuilder('transaction')
      .where('transaction.userId = :userId', { userId })
      .andWhere('transaction.status = :status', { status: TransactionStatus.COMPLETED });
      .andWhere('transaction.discountAmount > 0');

    if (startDate) {
      query.andWhere('transaction.createdAt >= :startDate', { startDate });
    }
    if (endDate) {
      query.andWhere('transaction.createdAt <= :endDate', { endDate });
    }

      .select('SUM(transaction.discountAmount)', 'totalSavings')
      .addSelect('COUNT(transaction.id)', 'transactionCount')
      .addSelect('AVG(transaction.discountAmount)', 'averageSavings')
      .getRawOne();

    return {
  totalSavings: parseFloat(result.totalSavings) || 0,
      transactionCount: parseInt(result.transactionCount) || 0,
      averageSavings: parseFloat(result.averageSavings) || 0,
      currency: 'BGN', // Default currency
    };
  }

  /**
   * Private helper methods
   */

  private validateCalculationRequest(request: DiscountCalculationRequest): void {
    if (!request.partnerId || !request.userId) {
      throw new BadRequestException(
        'Partner ID and User ID are required',
      );
    }
    if (request.amount < this.MIN_TRANSACTION_AMOUNT) {
      throw new BadRequestException(
        `Transaction amount must be at least ${this.MIN_TRANSACTION_AMOUNT}`,
      );
    }
    if (request.amount > Number.MAX_SAFE_INTEGER) {
      throw new BadRequestException('Transaction amount is too large');
    }

  private async getPartnerWithDiscounts(partnerId: string): Promise<Partner | null> {
    const cacheKey = `partner: ${partnerId}:discounts`,
    const cached = await this.cacheService.get<Partner>(cacheKey);
    
    if (cached) {
      return cached;
    };

}
}
}
}