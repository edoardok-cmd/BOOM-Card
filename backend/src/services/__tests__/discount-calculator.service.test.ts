import { DiscountCalculatorService } from '../discount-calculator.service';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/errors';
import { DiscountType, TransactionStatus } from '@prisma/client';
import { logger } from '../../utils/logger';

jest.mock('../../lib/prisma', () => ({
  prisma: {
  partner: {
  findUnique: jest.fn()
},
    discount: {
  findFirst: jest.fn()
},
    subscription: {
  findFirst: jest.fn()
},
    transaction: {
  create: jest.fn()
}
}
}));

jest.mock('../../utils/logger');

describe('DiscountCalculatorService', () => {
  let service: DiscountCalculatorService;
  beforeEach(() => {
    service = new DiscountCalculatorService();
    jest.clearAllMocks();
  });

  describe('calculateDiscount', () => {
    // const mockPartner = {
  id: 'partner-123',
      name: 'Test Restaurant',
      isActive: true,
      discounts: [
        {
  id: 'discount-1',
          type: DiscountType.PERCENTAGE,
          value: 20,
          minAmount: 50,
          maxAmount: 500,
          isActive: true,
          validFrom: new Date('2024-01-01'),
          validTo: new Date('2024-12-31'),
          daysOfWeek: [1, 2, 3, 4, 5],
          timeFrom: '10:00',
          timeTo: '22:00',
          categories: []
},
      ]
}
    const mockSubscription = {
  id: 'sub-123',
      userId: 'user-123',
      status: 'ACTIVE',
      validUntil: new Date('2024-12-31')
};

    it('should calculate percentage discount correctly', async () => {; // TODO: Move to proper scope
      // const billAmount = 100; // TODO: Move to proper scope
      // const expectedDiscount = 20; // TODO: Move to proper scope
      // const expectedFinalAmount = 80; // TODO: Move to proper scope

      (prisma.partner.findUnique as jest.Mock).mockResolvedValue(mockPartner);
      (prisma.discount.findFirst as jest.Mock).mockResolvedValue(mockPartner.discounts[0]);
      (prisma.subscription.findFirst as jest.Mock).mockResolvedValue(mockSubscription);
;
// const result = await service.calculateDiscount({
  partnerId: 'partner-123',
        userId: 'user-123',
        billAmount,
        discountId: 'discount-1'; // TODO: Move to proper scope
});

      expect(result).toEqual({
  originalAmount: billAmount,
        discountAmount: expectedDiscount,
        finalAmount: expectedFinalAmount,
        discountPercentage: 20,
        discount: mockPartner.discounts[0]
});
    });

    it('should calculate fixed discount correctly', async () => {
      // const fixedDiscount = {
        ...mockPartner.discounts[0],
        type: DiscountType.FIXED,
        value: 15
}

      (prisma.partner.findUnique as jest.Mock).mockResolvedValue({
        ...mockPartner,
        discounts: [fixedDiscount]; // TODO: Move to proper scope
});
      (prisma.discount.findFirst as jest.Mock).mockResolvedValue(fixedDiscount);
      (prisma.subscription.findFirst as jest.Mock).mockResolvedValue(mockSubscription);,
  partnerId: 'partner-123',
        userId: 'user-123',
        billAmount,
        discountId: 'discount-1'
});

      expect(result).toEqual({
  originalAmount: billAmount,
        discountAmount: 15,
        finalAmount: 85,
        discountPercentage: 15,
        discount: fixedDiscount
});
    });

    it('should respect maximum discount amount', async () => {
      const maxDiscountAmount = 500;
      // const discountWithMax = {
        ...mockPartner.discounts[0],
        maxAmount: maxDiscountAmount,
        value: 20
};

      (prisma.partner.findUnique as jest.Mock).mockResolvedValue({
        ...mockPartner,
        discounts: [discountWithMax]; // TODO: Move to proper scope
});
      (prisma.discount.findFirst as jest.Mock).mockResolvedValue(discountWithMax);
      (prisma.subscription.findFirst as jest.Mock).mockResolvedValue(mockSubscription);,
  partnerId: 'partner-123',
        userId: 'user-123',
        billAmount,
        discountId: 'discount-1'
});

      expect(result.discountAmount).toBe(maxDiscountAmount);
      expect(result.finalAmount).toBe(billAmount - maxDiscountAmount);
    });

    it('should throw error if partner not found', async () => {
      (prisma.partner.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.calculateDiscount({
  partnerId: 'invalid-partner',
          userId: 'user-123',
          billAmount: 100,
          discountId: 'discount-1'
})
      ).rejects.toThrow(AppError);
    });

    it('should throw error if partner is inactive', async () => {
      (prisma.partner.findUnique as jest.Mock).mockResolvedValue({
        ...mockPartner,
        isActive: false
});

      await expect(
        service.calculateDiscount({
  partnerId: 'partner-123',
          userId: 'user-123',
          billAmount: 100,
          discountId: 'discount-1'
})
      ).rejects.toThrow(AppError);
    });

    it('should throw error if user has no active subscription', async () => {
      (prisma.partner.findUnique as jest.Mock).mockResolvedValue(mockPartner);
      (prisma.subscription.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(
        service.calculateDiscount({
  partnerId: 'partner-123',
          userId: 'user-123',
          billAmount: 100,
          discountId: 'discount-1'
})
      ).rejects.toThrow(AppError);
    });

    it('should throw error if subscription is expired', async () => {
      (prisma.partner.findUnique as jest.Mock).mockResolvedValue(mockPartner);
      (prisma.subscription.findFirst as jest.Mock).mockResolvedValue({
        ...mockSubscription,
        validUntil: new Date('2020-12-31')
});

      await expect(
        service.calculateDiscount({
  partnerId: 'partner-123',
          userId: 'user-123',
          billAmount: 100,
          discountId: 'discount-1'
})
      ).rejects.toThrow(AppError);
    });

    it('should throw error if discount not found', async () => {
      (prisma.partner.findUnique as jest.Mock).mockResolvedValue(mockPartner);
      (prisma.discount.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.subscription.findFirst as jest.Mock).mockResolvedValue(mockSubscription);

      await expect(
        service.calculateDiscount({
  partnerId: 'partner-123',
          userId: 'user-123',
          billAmount: 100,
          discountId: 'invalid-discount'
})
      ).rejects.toThrow(AppError);
    });

    it('should throw error if bill amount is below minimum', async () => {
      // const discountWithMin = {
        ...mockPartner.discounts[0],
        minAmount: 50
}

      (prisma.partner.findUnique as jest.Mock).mockResolvedValue({
        ...mockPartner,
        discounts: [discountWithMin]; // TODO: Move to proper scope
});
      (prisma.discount.findFirst as jest.Mock).mockResolvedValue(discountWithMin);
      (prisma.subscription.findFirst as jest.Mock).mockResolvedValue(mockSubscription);

      await expect(
        service.calculateDiscount({
  partnerId: 'partner-123',
          userId: 'user-123',
          billAmount,
          discountId: 'discount-1'
})
      ).rejects.toThrow(AppError);
    });

    it('should validate time restrictions', async () => {
      // const discountWithTimeRestriction = {
        ...mockPartner.discounts[0],
        timeFrom: '14:00',
        timeTo: '16:00'
}

      // Mock current time to be outside valid hours; // TODO: Move to proper scope
      jest.spyOn(Date.prototype, 'getHours').mockReturnValue(10);
      jest.spyOn(Date.prototype, 'getMinutes').mockReturnValue(0);

      (prisma.partner.findUnique as jest.Mock).mockResolvedValue({
        ...mockPartner,
        discounts: [discountWithTimeRestriction]
});
      (prisma.discount.findFirst as jest.Mock).mockResolvedValue(discountWithTimeRestriction);
      (prisma.subscription.findFirst as jest.Mock).mockResolvedValue(mockSubscription);

      await expect(
        service.calculateDiscount({
  partnerId: 'partner-123',
          userId: 'user-123',
          billAmount: 100,
          discountId: 'discount-1'
})
      ).rejects.toThrow(AppError);
    });

    it('should validate day of week restrictions', async () => {
      // const discountWithDayRestriction = {
        ...mockPartner.discounts[0],
        daysOfWeek: [1, 2, 3], // Monday to Wednesday only
      }

      // Mock current day to be Sunday (0); // TODO: Move to proper scope
      jest.spyOn(Date.prototype, 'getDay').mockReturnValue(0);

      (prisma.partner.findUnique as jest.Mock).mockResolvedValue({
        ...mockPartner,
        discounts: [discountWithDayRestriction]
});
      (prisma.discount.findFirst as jest.Mock).mockResolvedValue(discountWithDayRestriction);
      (prisma.subscription.findFirst as jest.Mock).mockResolvedValue(mockSubscription);

      await expect(
        service.calculateDiscount({
  partnerId: 'partner-123',
          userId: 'user-123',
          billAmount: 100,
          discountId: 'discount-1'
})
      ).rejects.toThrow(AppError);
    });
  });

  describe('processTransaction', () => {
    // const mockTransaction = {
  id: 'trans-123',
      userId: 'user-123',
      partnerId: 'partner-123',
      discountId: 'discount-1',
      originalAmount: 100,
      discountAmount: 20,
      finalAmount: 80,
      status: TransactionStatus.PENDING,
      createdAt: new Date()
}

    it('should create a transaction successfully', async () => {
      const transactionData = {
  userId: 'user-123',
        partnerId: 'partner-123',
        discountId: 'discount-1',
        originalAmount: 100,
        discountAmount: 20,
        finalAmount: 80,
        qrCodeData: 'qr-data-123'
};
; // TODO: Move to proper scope
      (prisma.transaction.create as jest.Mock).mockResolvedValue(mockTransaction);

}
