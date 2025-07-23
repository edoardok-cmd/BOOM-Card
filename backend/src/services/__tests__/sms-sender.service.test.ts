import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { SmsSenderService } from '../sms-sender.service';
import { SmsProvider } from '../../interfaces/sms-provider.interface';
import { SmsMessage, SmsDeliveryStatus, SmsProviderType } from '../../interfaces/sms.interface';
import { RedisService } from '../redis.service';
import { MetricsService } from '../metrics.service';
import { CircuitBreakerService } from '../circuit-breaker.service';
import { RateLimiterService } from '../rate-limiter.service';
import * as twilio from 'twilio';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

interface MockSmsProvider extends SmsProvider {
  sendSms: jest.MockedFunction<(message: SmsMessage) => Promise<SmsDeliveryStatus>>;
  getDeliveryStatus: jest.MockedFunction<(messageId: string) => Promise<SmsDeliveryStatus>>;
  validatePhoneNumber: jest.MockedFunction<(phoneNumber: string) => Promise<boolean>>;
  getBalance: jest.MockedFunction<() => Promise<number>>;
}

interface TestSmsMessage extends SmsMessage {
  testId?: string;
  mockDelay?: number;
  shouldFail?: boolean;
}

interface SmsTestCase {
  name: string;
  message: TestSmsMessage;
  expectedStatus: SmsDeliveryStatus['status'];
  expectedProvider?: SmsProviderType;
  expectRetry?: boolean;
  expectFallback?: boolean;
}

const TEST_PHONE_NUMBERS = {
  VALID_US: '+1234567890',
  VALID_UK: '+441234567890',
  VALID_CA: '+16134567890',
  INVALID_FORMAT: '1234567890',
  BLOCKED: '+19999999999',
  RATE_LIMITED: '+18888888888',
} as const;

const TEST_MESSAGES = {
  OTP: 'Your BOOM Card verification code is: 123456',
  TRANSACTION_ALERT: 'BOOM Card: Transaction of $50.00 at Merchant XYZ',
  BALANCE_UPDATE: 'Your BOOM Card balance is now $1,234.56',
  SECURITY_ALERT: 'BOOM Card Security: New login detected from IP 192.168.1.1',
  PROMOTIONAL: 'BOOM Card: Earn 2x rewards this weekend!',
} as const;

const MOCK_DELIVERY_STATUSES: Record<string, SmsDeliveryStatus> = {
  SENT: {
    messageId: uuidv4(),
    status: 'sent',
    provider: 'twilio',
    sentAt: new Date(),
    deliveredAt: null,
    errorMessage: null,
  },
  DELIVERED: {
    messageId: uuidv4(),
    status: 'delivered',
    provider: 'twilio',
    sentAt: new Date(),
    deliveredAt: new Date(),
    errorMessage: null,
  },
  FAILED: {
    messageId: uuidv4(),
    status: 'failed',
    provider: 'twilio',
    sentAt: new Date(),
    deliveredAt: null,
    errorMessage: 'Invalid phone number',
  },
  QUEUED: {
    messageId: uuidv4(),
    status: 'queued',
    provider: 'vonage',
    sentAt: null,
    deliveredAt: null,
    errorMessage: null,
  },
};

const SMS_RATE_LIMITS = {
  PER_PHONE_HOURLY: 5,
  PER_PHONE_DAILY: 20,
  GLOBAL_HOURLY: 1000,
  GLOBAL_DAILY: 10000,
} as const;

const CIRCUIT_BREAKER_CONFIG = {
  FAILURE_THRESHOLD: 5,
  RECOVERY_TIMEOUT: 60000, // 1 minute
  MONITORING_PERIOD: 300000, // 5 minutes
} as const;

const RETRY_CONFIG = {
  MAX_ATTEMPTS: 3,
  INITIAL_DELAY: 1000,
  MAX_DELAY: 10000,
  BACKOFF_MULTIPLIER: 2,
} as const;

Execution error