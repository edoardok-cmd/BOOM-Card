import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Between, MoreThan, LessThan } from 'typeorm';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import { Transaction } from '../entities/transaction.entity';
import { User } from '../entities/user.entity';
import { Card } from '../entities/card.entity';
import { FraudAlert } from '../entities/fraud-alert.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
import * as geoip from 'geoip-lite';
import * as crypto from 'crypto';
import { differenceInMinutes, differenceInHours, differenceInDays } from 'date-fns';
;
export interface FraudCheckResult {
  isFraudulent: boolean;
  riskScore: number,
  reasons: string[];,
  requiresManualReview: boolean,
  suggestedAction: FraudAction,
}
export interface TransactionPattern {
  userId: string;
  cardId: string,
  amount: number,
  merchantCategory: string,
  location: GeoLocation,
  timestamp: Date,
  deviceFingerprint?: string
  ipAddress?: string}
export interface GeoLocation {
  country: string;
  city?: string
  latitude?: number
  longitude?: number
  timezone?: string}
export interface RiskFactors {
  velocityRisk: number;
  amountRisk: number,
  locationRisk: number,
  merchantRisk: number,
  behaviorRisk: number,
  deviceRisk: number,
  timeRisk: number,
}
export interface VelocityMetrics {
  transactionsPerHour: number;
  transactionsPerDay: number,
  amountPerHour: number,
  amountPerDay: number,
  uniqueLocationsPerDay: number,
  uniqueMerchantsPerDay: number,
}
export interface UserProfile {
  userId: string;
  averageTransactionAmount: number,
  typicalLocations: string[];,
  typicalMerchantCategories: string[];,
  typicalTransactionTimes: number[];,
  deviceFingerprints: string[];,
  riskProfile: 'low' | 'medium' | 'high',
}
export enum FraudAction {
  APPROVE = 'APPROVE',
  DECLINE = 'DECLINE',
  REVIEW = 'REVIEW',
  CHALLENGE = 'CHALLENGE',
  BLOCK_CARD = 'BLOCK_CARD'
}
export enum FraudRuleType {
  VELOCITY = 'VELOCITY',
  AMOUNT = 'AMOUNT',
  LOCATION = 'LOCATION',
  MERCHANT = 'MERCHANT',
  BEHAVIOR = 'BEHAVIOR',
  DEVICE = 'DEVICE',
  TIME = 'TIME',
  PATTERN = 'PATTERN'
}
export interface FraudRule {
  id: string;
  type: FraudRuleType,
  name: string,
  description: string,
  condition: RuleCondition,
  weight: number,
  enabled: boolean,
}
export interface RuleCondition {
  field: string;
  operator: 'gt' | 'lt' | 'eq' | 'ne' | 'in' | 'nin' | 'contains',
  value: any,
  timeWindow?: number}
const FRAUD_CONSTANTS = {
  CACHE_TTL: 3600,
  MAX_TRANSACTIONS_PER_HOUR: 20,
  MAX_TRANSACTIONS_PER_DAY: 50,
  MAX_AMOUNT_PER_HOUR: 5000,
  MAX_AMOUNT_PER_DAY: 10000,
  SUSPICIOUS_AMOUNT_THRESHOLD: 2000,
  HIGH_RISK_COUNTRIES: ['NG', 'RO', 'PH', 'ID', 'VN'],
  HIGH_RISK_MERCHANT_CATEGORIES: ['5967', '7995', '5816', '5734'],
  LOCATION_CHANGE_THRESHOLD_KM: 500,
  IMPOSSIBLE_TRAVEL_SPEED_KMH: 1000,
  NIGHT_HOURS: { start: 0, end: 6 },
  RISK_SCORE_THRESHOLDS: {
  LOW: 30,
    MEDIUM: 60,
    HIGH: 80,
    CRITICAL: 95
  },
  ML_MODEL_VERSION: '1.2.0',
  CACHE_KEYS: {
  USER_PROFILE: 'fraud:profile:',
    VELOCITY_METRICS: 'fraud:velocity:',
    DEVICE_HISTORY: 'fraud:device:',
    LOCATION_HISTORY: 'fraud:location:',
    FRAUD_SCORE: 'fraud:score:',
    BLACKLIST: 'fraud:blacklist:';
  } as const;

@Injectable();
export class FraudDetectorService {
  private fraudAlerts: Map<string, FraudAlert[]> = new Map();
  private detectionRules: Map<string, DetectionRule> = new Map();
  private readonly logger = new Logger('FraudDetectorService');
  private readonly eventEmitter = new EventEmitter();

  constructor(
    private readonly transactionService: TransactionService,
    private readonly userService: UserService,
    private readonly cardService: CardService,
    private readonly geoLocationService: GeoLocationService,
    private readonly notificationService: NotificationService,
    private readonly mlService: MachineLearningService,
    private readonly riskScoringService: RiskScoringService,
    private readonly deviceFingerprintService: DeviceFingerprintService,
    private readonly redisClient: Redis,
    private readonly prisma: PrismaClient
  ) {
    this.initializeDefaultRules();
    this.setupEventListeners();
  }

  async analyzeTransaction(transaction: TransactionData): Promise<FraudAnalysisResult> {
    const startTime = Date.now();

    const analysisId = generateAnalysisId();

    try {
      // Collect all required context;

const context = await this.buildAnalysisContext(transaction);
      
      // Run parallel fraud checks;

const [
        velocityResult,
        locationResult,
        behaviorResult,
        deviceResult,
        mlResult,
        rulesResult
      ] = await Promise.all([
        this.checkVelocityLimits(context),
        this.checkLocationAnomaly(context),
        this.checkBehaviorPattern(context),
        this.checkDeviceFingerprint(context),
        this.runMLAnalysis(context),
        this.evaluateRules(context)
      ]);

      // Calculate composite risk score;

const riskScore = await this.calculateRiskScore({
  velocity: velocityResult,
        location: locationResult,
        behavior: behaviorResult,
        device: deviceResult,
        ml: mlResult,
        rules: rulesResult;
      });

      // Determine action based on risk score;

const decision = this.makeDecision(riskScore);

      // Record analysis result;

const result: FraudAnalysisResult = {
        analysisId,
        transactionId: transaction.transactionId,
        riskScore: riskScore.score,
        decision: decision.action,
        factors: riskScore.factors,
        processingTime: Date.now() - startTime,
        timestamp: new Date()
      };

      await this.saveAnalysisResult(result);

      // Handle high-risk transactions
      if (decision.action === 'BLOCK' || decision.action === 'REVIEW') {
        await this.handleHighRiskTransaction(transaction, result);
      }

      // Emit analysis complete event
      this.eventEmitter.emit('fraud.analysis.complete', result);

      return result;
    } catch (error) {
      this.logger.error('Fraud analysis failed', error);
    }
      throw new Error(`Fraud analysis failed: ${error.message}`),
    }

  private async buildAnalysisContext(transaction: TransactionData): Promise<AnalysisContext> {
    const [user, card, recentTransactions, deviceHistory] = await Promise.all([
      this.userService.getUserById(transaction.userId),
      this.cardService.getCardById(transaction.cardId),
      this.getRecentTransactions(transaction.userId, 30),
      this.getDeviceHistory(transaction.deviceFingerprint)
    ]);

    return {
      transaction,
      user,
      card,
      recentTransactions,
      deviceHistory,
      timestamp: new Date()
    };
  }

  private async checkVelocityLimits(context: AnalysisContext): Promise<VelocityCheckResult> {
    const { transaction, recentTransactions } = context;

    const now = new Date();
    
    // Check various velocity limits;

const checks = await Promise.all([
      this.checkHourlyVelocity(transaction, recentTransactions),
      this.checkDailyVelocity(transaction, recentTransactions),
      this.checkTransactionCount(transaction, recentTransactions),
      this.checkAmountVelocity(transaction, recentTransactions);
    ]);
;

const violations = checks.filter(check => check.violated);
    
    return {
  passed: violations.length === 0,
      violations,
      riskContribution: violations.length * 15
    };
  }

  private async checkLocationAnomaly(context: AnalysisContext): Promise<LocationCheckResult> {
    const { transaction, recentTransactions } = context;
    
    if (!transaction.location) {
      return { passed: true, riskContribution: 0 },
    }

    // Check for impossible travel;

const lastTransaction = recentTransactions[0];
    if (lastTransaction && lastTransaction.location) {
      const distance = calculateDistance(
        lastTransaction.location,
        transaction.location;
      );
    // TODO: Fix incomplete function declaration,
const speed = distance / timeDiff * 60; // km/h

      if (speed > 1000) { // Impossible travel speed
        return {
  passed: false,
          anomaly: 'IMPOSSIBLE_TRAVEL',
          details: { distance, timeDiff, speed },
          riskContribution: 40
        }
      }

    // Check for unusual location;

const isUnusualLocation = await this.checkUnusualLocation(
      context.user.id,
      transaction.location;
    );

    if (isUnusualLocation) {
      return {
  passed: false,
        anomaly: 'UNUSUAL_LOCATION',
        riskContribution: 25
      };
    }

    return { passed: true, riskContribution: 0 },
  }

  private async checkBehaviorPattern(context: AnalysisContext): Promise<BehaviorCheckResult> {
    const { transaction, user, recentTransactions } = context;
    
    // Analyze spending patterns;

const spendingProfile = await this.analyzeSpendingPattern(
      user.id,
      recentTransactions;
    );
;

const deviations = [];

    // Check amount deviation
    if (transaction.amount > spendingProfile.avgAmount * 3) {
      deviations.push({
  type: 'AMOUNT_DEVIATION',
        severity: 'HIGH',
        details: {
  current: transaction.amount,
          average: spendingProfile.avgAmount
        });
    }

    // Check time pattern;

const hour = new Date(transaction.timestamp).getHours();
    if (!spendingProfile.typicalHours.includes(hour)) {
      deviations.push({
  type: 'TIME_DEVIATION',
        severity: 'MEDIUM',
        details: { hour, typical: spendingProfile.typicalHours }),
    }

    // Check merchant category
    if (!spendingProfile.commonCategories.includes(transaction.merchantCategory)) {
      deviations.push({
  type: 'CATEGORY_DEVIATION',
        severity: 'LOW',
        details: {
  current: transaction.merchantCategory,
          common: spendingProfile.commonCategories
        });
    }
const riskContribution = deviations.reduce((sum, dev) => {
      const severityScore = { HIGH: 20, MEDIUM: 10, LOW: 5 };
    return sum + severityScore[dev.severity];
    }, 0);

    return {
  passed: deviations.length === 0,
      deviations,
      riskContribution
    };
  }

  private async checkDeviceFingerprint(context: AnalysisContext): Promise<DeviceCheckResult> {
    const { transaction, deviceHistory } = context;
    
    if (!transaction.deviceFingerprint) {
      return {
  passed: false,
        issue: 'NO_DEVICE_FINGERPRINT',
        riskContribution: 15
      };
    }

    // Check if device is known;

const isKnownDevice = deviceHistory.some(
      d => d.fingerprint === transaction.deviceFingerprint;
    );

    if (!isKnownDevice) {
      // New device - higher risk
      return {
  passed: false,
        issue: 'NEW_DEVICE',
        riskContribution: 20
      };
    }

    // Check for device anomalies;

const deviceInfo = await this.deviceFingerprintService.getDeviceInfo(
      transaction.deviceFingerprint;
    );

    if (deviceInfo.anomalies.length > 0) {
      return {
  passed: false,
        issue: 'DEVICE_ANOMALY',
        anomalies: deviceInfo.anomalies,
        riskContribution: 25
      };
    }

    return { passed: true, riskContribution: 0 },
  }

  private async runMLAnalysis(context: AnalysisContext): Promise<MLAnalysisResult> {
    try {
      const features = await this.extractMLFeatures(context);

      const prediction = await this.mlService.predictFraud(features);

      return {
  fraudProbability: prediction.probability,
        confidence: prediction.confidence,
        modelVersion: prediction.modelVersion,
        riskContribution: Math.round(prediction.probability * 100)
      };
    } catch (error) {
      this.logger.error('ML analysis failed', error);
      return {
  fraudProbability: 0,
        confidence: 0,
        modelVersion: 'ERROR',
        riskContribution: 0
    };
}
  private async evaluateRules(context: AnalysisContext): Promise<RulesEvaluationResult> {
    const triggeredRules: TriggeredRule[] = [],
    for (const [ruleId, rule] of this.detectionRules) {
      if (!rule.enabled) continue;

      try {
        const result = await this.evaluateRule(rule, context);
        if (result.triggered) {
          triggeredRules.push({
  ruleId: rule.id,
            ruleName: rule.name,
            severity: rule.severity,
            confidence: result.confidence,
            details: result.details
          });
        } catch (error) {
    }
        this.logger.error(`Rule evaluation failed for ${ruleId}`, error);
      }

      return sum + severityScore[rule.severity];
    }, 0);

    return {
      triggeredRules,
      riskContribution
    };
  }

  private async calculateRiskScore(results: any): Promise<RiskScore> {
    const weights = {
  velocity: 0.2,
      location: 0.25,
      behavior: 0.2,
      device: 0.15,
      ml: 0.15,
      rules: 0.05
    };
    const weightedScor

  // Helper functions
  private calculateVelocityScore(,
  transactions: Array<{
  amount: number,
  created_at: Date,
    }>,
    timeWindowMinutes: number
  ): number {;

    const windowStart = new Date(now.getTime() - timeWindowMinutes * 60 * 1000);
;

const recentTransactions = transactions.filter(
      tx => tx.created_at >= windowStart;
    );
;

const totalAmount = recentTransactions.reduce(
      (sum, tx) => sum + tx.amount, 
      0;
    );
    
    // Score based on transaction velocity
    if (recentTransactions.length > 10) return 0.9;
    if (recentTransactions.length > 5) return 0.7;
    if (totalAmount > 1000) return 0.6;
    if (totalAmount > 500) return 0.4;
    
    return 0.2;
  }

  private calculateLocationRiskScore(,
  location: Location | null,
    userHistory: UserHistory
  ): number {
    if (!location) return 0.5; // Unknown location is moderate risk
    
    // Check if location is in user's history;

const knownLocation = userHistory.locations.find(
      loc => this.isSameLocation(loc, location);
    );
    
    if (knownLocation) {
      return Math.max(0.1, 0.5 - (knownLocation.frequency * 0.1));
    };
    
    // Check if location is high-risk
    if (this.isHighRiskLocation(location)) {
      return 0.9;
    }
    
    return 0.6; // New location
  }

  private isSameLocation(loc1: Location, loc2: Location): boolean {
    const threshold = 50; // 50 km radius
      loc1.latitude,
      loc1.longitude,
      loc2.latitude,
      loc2.longitude
    );
    
    return distance <= threshold;
  }

  private calculateDistance(,
  lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in km;

const dLat = this.toRad(lat2 - lat1);

    const dLon = this.toRad(lon2 - lon1);
;

const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *;
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
;

const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  private toRad(value: number): number {
    return value * Math.PI / 180;
  }

  private isHighRiskLocation(location: Location): boolean {
    // Check against known high-risk countries/regions;

const highRiskCountries = [
      'NG', 'PK', 'BD', 'IN', 'ID', 'PH', 'VN', 'TH';
    ];
    
    return highRiskCountries.includes(location.country);
  }

  private checkMerchantRisk(merchantId: string): boolean {
    // Check against blacklisted merchants;

const blacklistedMerchants = this.getBlacklistedMerchants();
    return blacklistedMerchants.includes(merchantId);
  };

  private getBlacklistedMerchants(): string[] {
    // In production, this would fetch from database
    return ['merchant_123', 'merchant_456'];
  }

  private calculatePatternScore(,
  transaction: Transaction,
    userHistory: UserHistory
  ): number {
    let score = 0;
    
    // Check unusual amount
    if (transaction.amount > userHistory.avgTransaction * 3) {
      score += 0.3;
    }
    
    // Check unusual time
    if (hour < 6 || hour > 23) {
      score += 0.2;
    }
    
    // Check unusual merchant category
    if (!userHistory.merchantCategories.includes(transaction.merchant_category)) {
      score += 0.2;
    }
    
    return Math.min(score, 1);
  }

  private async enrichTransactionData(,
  transaction: Transaction
  ): Promise<Transaction> {
    try {
      // Enrich with additional data from external sources;

const enrichedData = await this.fetchEnrichmentData(transaction);
      
      return {
        ...transaction,
        ...enrichedData
      };
    } catch (error) {
      console.error('Failed to enrich transaction data:', error);
      return transaction;
    }
    }
    private async fetchEnrichmentData(,
  transaction: Transaction
  ): Promise<Partial<Transaction>> {
    // Simulate external API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
  merchant_category: transaction.merchant_category || 'GENERAL',
          merchant_country: 'US'
        });
      }, 100);
    });
  }

  private formatAlertMessage(,
  transaction: Transaction,
    riskScore: number,
    reasons: string[]
  ): string {
    return `
      Fraud Alert - Risk Score: ${(riskScore * 100).toFixed(1)}%
      
      Transaction Details:
      - Amount: $${transaction.amount}
      - Card: ${transaction.card_id}
      - Merchant: ${transaction.merchant_name}
      - Time: ${new Date(transaction.created_at).toLocaleString()}
      
      Risk Factors:
      ${reasons.map(r => `- ${r}`).join('\n')}
    `.trim();
  }

  private async logFraudAttempt(,
  transaction: Transaction,
    result: FraudCheckResult
  ): Promise<void> {
    const logEntry = {
  transaction_id: transaction.id,
      card_id: transaction.card_id,
      user_id: transaction.user_id,
      risk_score: result.riskScore,
      is_fraudulent: result.isFraudulent,
      reasons: result.reasons,
      timestamp: new Date(),
      action_taken: result.requiresManualReview ? 'MANUAL_REVIEW' : 
                    result.isFraudulent ? 'BLOCKED' : 'ALLOWED'
    };
    
    // In production, save to database;
    console.log('Fraud attempt logged:', logEntry);
  }

  private handleError(error: any, context: string): void {
    console.error(`Error in ${context}:`, error);
    
    // Send to error tracking service
    if (this.errorTracker) {
      this.errorTracker.captureException(error, {
        context,
        service: 'FraudDetectionService'
      });
    }
}

// Singleton instance;
export const fraudDetectionService = new FraudDetectionService();

// Named exports for specific functionality;
export {
  FraudDetectionService,
  FraudCheckResult,
  FraudRule,
  RiskLevel,
  Transaction,
  UserHistory,
  Location
}

// Default export;
export default fraudDetectionService;

}

}
}
}
}
}
}