import { Test, TestingModule } from '@nestjs/testing';
import { FraudDetectorService } from '../fraud-detector.service';
import { DatabaseService } from '../database.service';
import { RedisService } from '../redis.service';
import { LoggerService } from '../logger.service';
import { NotificationService } from '../notification.service';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';

interface MockTransaction {
  id: string;
  userId: string;
  merchantId: string;
  amount: number;
  currency: string;
  timestamp: Date;
  location?: {
    latitude: number;
    longitude: number;
    country: string;
    city: string;
  };
  deviceInfo?: {
    ip: string;
    userAgent: string;
    deviceId: string;
  };
  type: 'purchase' | 'withdrawal' | 'transfer';
  status: 'pending' | 'approved' | 'declined' | 'flagged';
}

interface FraudCheckResult {
  transactionId: string;
  score: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  reasons: string[];
  requiresManualReview: boolean;
  suggestedAction: 'approve' | 'decline' | 'review';
}

interface RiskRule {
  id: string;
  name: string;
  condition: string;
  weight: number;
  enabled: boolean;
}

interface UserRiskProfile {
  userId: string;
  riskScore: number;
  lastUpdated: Date;
  flaggedTransactions: number;
  totalTransactions: number;
  averageTransactionAmount: number;
  unusualPatterns: string[];
}

const MOCK_TRANSACTIONS: MockTransaction[] = [
  {
    id: 'txn_001',
    userId: 'user_123',
    merchantId: 'merchant_456',
    amount: 150.00,
    currency: 'USD',
    timestamp: new Date('2023-12-01T10:00:00Z'),
    location: {
      latitude: 40.7128,
      longitude: -74.0060,
      country: 'US',
      city: 'New York'
    },
    deviceInfo: {
      ip: '192.168.1.1',
      userAgent: 'Mozilla/5.0',
      deviceId: 'device_789'
    },
    type: 'purchase',
    status: 'pending'
  },
  {
    id: 'txn_002',
    userId: 'user_123',
    merchantId: 'merchant_789',
    amount: 5000.00,
    currency: 'USD',
    timestamp: new Date('2023-12-01T10:05:00Z'),
    location: {
      latitude: 51.5074,
      longitude: -0.1278,
      country: 'UK',
      city: 'London'
    },
    type: 'purchase',
    status: 'pending'
  }
];

const RISK_THRESHOLDS = {
  LOW: 0,
  MEDIUM: 30,
  HIGH: 60,
  CRITICAL: 85
};

const FRAUD_PATTERNS = {
  VELOCITY_CHECK: 'velocity_check',
  GEOGRAPHIC_ANOMALY: 'geographic_anomaly',
  AMOUNT_THRESHOLD: 'amount_threshold',
  MERCHANT_RISK: 'merchant_risk',
  DEVICE_FINGERPRINT: 'device_fingerprint',
  TIME_PATTERN: 'time_pattern',
  CURRENCY_MISMATCH: 'currency_mismatch'
};

const ML_MODEL_ENDPOINTS = {
  FRAUD_SCORING: '/api/v1/fraud/score',
  PATTERN_DETECTION: '/api/v1/fraud/patterns',
  RISK_ASSESSMENT: '/api/v1/fraud/risk-assessment'
};

I can see this is an AI automation platform project, not a BOOM Card backend project. Since the backend/src/services/__tests__/fraud-detector.service.test.ts file doesn't exist in this codebase, I'll provide Part 2 of a generic fraud-detector service test implementation that would follow typical patterns for a financial services application.

describe('FraudDetectorService', () => {
  let fraudDetectorService: FraudDetectorService;
  let transactionRepository: MockType<Repository<Transaction>>;
  let userRepository: MockType<Repository<User>>;
  let fraudRuleRepository: MockType<Repository<FraudRule>>;
  let alertService: jest.Mocked<AlertService>;
  let redisClient: jest.Mocked<Redis>;
  let configService: jest.Mocked<ConfigService>;
  let logger: jest.Mocked<LoggerService>;
  let mlModelService: jest.Mocked<MLModelService>;
  let geoLocationService: jest.Mocked<GeoLocationService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FraudDetectorService,
        {
          provide: getRepositoryToken(Transaction),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(User),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(FraudRule),
          useFactory: repositoryMockFactory,
        },
        {
          provide: AlertService,
          useValue: mockAlertService,
        },
        {
          provide: 'REDIS_CLIENT',
          useValue: mockRedisClient,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: LoggerService,
          useValue: mockLogger,
        },
        {
          provide: MLModelService,
          useValue: mockMLModelService,
        },
        {
          provide: GeoLocationService,
          useValue: mockGeoLocationService,
        },
      ],
    }).compile();

    fraudDetectorService = module.get<FraudDetectorService>(FraudDetectorService);
    transactionRepository = module.get(getRepositoryToken(Transaction));
    userRepository = module.get(getRepositoryToken(User));
    fraudRuleRepository = module.get(getRepositoryToken(FraudRule));
    alertService = module.get(AlertService);
    redisClient = module.get('REDIS_CLIENT');
    configService = module.get(ConfigService);
    logger = module.get(LoggerService);
    mlModelService = module.get(MLModelService);
    geoLocationService = module.get(GeoLocationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('analyzeTransaction', () => {
    it('should pass transaction with low risk score', async () => {
      const mockTransaction = createMockTransaction();
      const mockUser = createMockUser();
      const mockRules = createMockFraudRules();

      userRepository.findOne.mockResolvedValue(mockUser);
      fraudRuleRepository.find.mockResolvedValue(mockRules);
      mlModelService.predictFraudScore.mockResolvedValue(0.15);
      redisClient.get.mockResolvedValue(null);

      const result = await fraudDetectorService.analyzeTransaction(mockTransaction);

      expect(result).toEqual({
        transactionId: mockTransaction.id,
        riskScore: 0.15,
        fraudDetected: false,
        reasons: [],
        action: FraudAction.ALLOW,
      });
      expect(alertService.sendAlert).not.toHaveBeenCalled();
    });

    it('should flag transaction with high risk score', async () => {

      userRepository.findOne.mockResolvedValue(mockUser);
      fraudRuleRepository.find.mockResolvedValue(mockRules);
      mlModelService.predictFraudScore.mockResolvedValue(0.85);
      redisClient.get.mockResolvedValue('5');


      expect(result).toEqual({
        transactionId: mockTransaction.id,
        riskScore: 0.85,
        fraudDetected: true,
        reasons: ['High ML risk score', 'Unusual amount', 'Velocity check failed'],
        action: FraudAction.BLOCK,
      });
      expect(alertService.sendAlert).toHaveBeenCalledWith({
        type: AlertType.FRAUD_DETECTED,
        severity: AlertSeverity.HIGH,
        transactionId: mockTransaction.id,
        userId: mockUser.id,
        details: expect.any(Object),
      });
    });

    it('should require manual review for medium risk', async () => {

      userRepository.findOne.mockResolvedValue(mockUser);
      fraudRuleRepository.find.mockResolvedValue(mockRules);
      mlModelService.predictFraudScore.mockResolvedValue(0.45);
      geoLocationService.getDistance.mockResolvedValue(1500);


      expect(result).toEqual({
        transactionId: mockTransaction.id,
        riskScore: 0.45,
        fraudDetected: false,
        reasons: ['Location anomaly detected'],
        action: FraudAction.REVIEW,
      });
    });
  });

  describe('checkVelocityRules', () => {
    it('should detect velocity rule violations', async () => {
      const userId = 'user123';
      const mockTransactions = Array(6).fill(null).map(() => createMockTransaction());
      
      transactionRepository.find.mockResolvedValue(mockTransactions);
      redisClient.incr.mockResolvedValue(6);
      redisClient.expire.mockResolvedValue(1);

      const violations = await fraudDetectorService.checkVelocityRules(userId);

      expect(violations).toContain('Exceeded hourly transaction limit');
      expect(redisClient.incr).toHaveBeenCalledWith(`velocity:${userId}:hourly`);
    });

    it('should pass when within velocity limits', async () => {
      
      transactionRepository.find.mockResolvedValue(mockTransactions);
      redisClient.incr.mockResolvedValue(3);


      expect(violations).toHaveLength(0);
    });
  });

  describe('detectAnomalousPatterns', () => {
    it('should detect unusual spending patterns', async () => {
      const historicalTransactions = Array(30).fill(null).map(() => 
        createMockTransaction({ amount: Math.random() * 200 + 50 })
      );

      transactionRepository.find.mockResolvedValue(historicalTransactions);

      const anomalies = await fraudDetectorService.detectAnomalousPatterns(
        mockUser,
        mockTransaction
      );

      expect(anomalies).toContain('Transaction amount exceeds historical average');
    });

    it('should detect location anomalies', async () => {
        metadata: { location: 'Tokyo, Japan' });

      geoLocationService.getDistance.mockResolvedValue(10000);
      geoLocationService.getTravelTime.mockResolvedValue(14);

        mockUser,
        mockTransaction
      );

      expect(anomalies).toContain('Impossible travel detected');
    });
  });

  describe('updateFraudRules', () => {
    it('should create new fraud rule', async () => {
      const newRule: CreateFraudRuleDto = {
        name: 'High Value Transaction',
        condition: { field: 'amount', operator: '>', value: 10000 },
        action: FraudAction.REVIEW,
        severity: RuleSeverity.HIGH,
        enabled: true,
      };

      fraudRuleRepository.create.mockReturnValue(newRule as any);
      fraudRuleRepository.save.mockResolvedValue({ id: '1', ...newRule } as any);


      expect(result).toMatchObject(newRule);
      expect(fraudRuleRepository.save).toHaveBeenCalledWith(newRule);
      expect(logger.info).toHaveBeenCalledWith('Fraud rule created', expect.any(Object));
    });

    it('should update existing fraud rule', async () => {
      const ruleId = 'rule123';
      const updates: UpdateFraudRuleDto = {
        enabled: false,
        severity: RuleSeverity.LOW,
      };
      const existingRule = createMockFraudRule();

      fraudRuleRepository.findOne.mockResolvedValue(existingRule);
      fraudRuleRepository.save.mockResolvedValue({ ...existingRule, ...updates });


      expect(result.enabled).toBe(false);
      expect(result.severity).toBe(RuleSeverity.LOW);
    });
  });

  describe('trainMLModel', () => {
    it('should train model with transaction data', async () => {
        createMockTransaction({ isFraud: Math.random() > 0.95 })
      );

      transactionRepository.find.mockResolvedValue(mockTransactions);
      mlModelService.trainModel.mockResolvedValue({
        modelId: 'model123',
        accuracy: 0.94,
        precision: 0.89,
        recall: 0.91,
      });


      expect(result.accuracy).toBeGreaterThan(0.9);
      expect(mlModelService.trainModel).toHaveBeenCalledWith(
        expect.any(Array),
        expect.any(Object)
      );
    });
  });

  describe('generateFraudReport', () => {
    it('should generate comprehensive fraud report', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      
      const mockFraudTransac
}}}