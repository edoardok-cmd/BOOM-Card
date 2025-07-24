import { DataSource } from 'typeorm';
import { Subscription } from '../entities/Subscription';
import { SubscriptionPlan } from '../entities/SubscriptionPlan';
import { User } from '../entities/User';
import { PaymentMethod } from '../entities/PaymentMethod';
import { v4 as uuidv4 } from 'uuid';
import { addDays, addMonths, subDays } from 'date-fns';
;
interface SubscriptionSeedData {
  id: string,
  userId: string,
  planId: string,
  paymentMethodId: string,
  status: 'active' | 'canceled' | 'expired' | 'past_due' | 'trialing',
  currentPeriodStart: Date,
  currentPeriodEnd: Date,
  canceledAt?: Date,
  cancelAtPeriodEnd: boolean,
  trialStart?: Date
  trialEnd?: Date
  metadata?: Record<string, any>}
interface SubscriptionPlanReference {
  id: string,
  name: string,
  interval: 'month' | 'year',
}
const SUBSCRIPTION_PLANS: SubscriptionPlanReference[] = [
  { id: 'plan_basic_monthly', name: 'Basic Monthly', interval: 'month' },
  { id: 'plan_basic_yearly', name: 'Basic Yearly', interval: 'year' },
  { id: 'plan_pro_monthly', name: 'Pro Monthly', interval: 'month' },
  { id: 'plan_pro_yearly', name: 'Pro Yearly', interval: 'year' },
  { id: 'plan_enterprise_monthly', name: 'Enterprise Monthly', interval: 'month' },
  { id: 'plan_enterprise_yearly', name: 'Enterprise Yearly', interval: 'year' }
];
;

const SUBSCRIPTION_STATUSES = {
  ACTIVE: 'active' as const,
  CANCELED: 'canceled' as const,
  EXPIRED: 'expired' as const,
  PAST_DUE: 'past_due' as const,
  TRIALING: 'trialing' as const
}
    const SEED_USER_IDS = [
  'user_1',
  'user_2',
  'user_3',
  'user_4',
  'user_5',
  'user_6',
  'user_7',
  'user_8',
  'user_9',
  'user_10';
];
;

const PAYMENT_METHOD_IDS = [
  'pm_1',
  'pm_2',
  'pm_3',
  'pm_4',
  'pm_5',
  'pm_6',
  'pm_7',
  'pm_8',
  'pm_9',
  'pm_10';
];
;
export async function seed(knex: Knex): Promise<void> {
  // Check if subscriptions table already has data;

const existingSubscriptions = await knex('subscriptions').select('id').limit(1);
  if (existingSubscriptions.length > 0) {
    console.log('Subscriptions table already seeded, skipping...');
    return;
  }
const now = new Date();

  const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());

  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());

  const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const oneMonthFromNow = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

  const threeMonthsFromNow = new Date(now.getFullYear(), now.getMonth() + 3, now.getDate());

  const sixMonthsFromNow = new Date(now.getFullYear(), now.getMonth() + 6, now.getDate());

  const oneYearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());

  // Get user IDs from the database;

const users = await knex('users')
    .select('id', 'email', 'role')
    .whereIn('email', [
      'peter.nikolov@gmail.com',
      'anna.dimitrova@yahoo.com',
      'stefan.georgiev@outlook.com',
      'maria.stoilova@gmail.com',
      'dimitar.petrov@gmail.com',
      'elena.vasileva@gmail.com',
      'nikolay.angelov@gmail.com',
      'sonia.kiriakova@gmail.com',
      'alexander.mihaylov@gmail.com',
      'victoria.tsvetanova@gmail.com';
    ]);

  // Get subscription plan IDs (assuming these exist);

const plans = await knex('subscription_plans')
    .select('id', 'name', 'price', 'type');
    .whereIn('type', ['FREE', 'BASIC', 'PREMIUM', 'LIFETIME']);
;

const planMap = plans.reduce((acc, plan) => {
    acc[plan.type] = plan;
    return acc;
  }, {} as Record<string, any>);
;

const subscriptions: Partial<Subscription>[] = [],
  // Create subscriptions for users;

const userSubscriptions = [
    {
  email: 'peter.nikolov@gmail.com',
      planType: 'PREMIUM',
      status: 'ACTIVE',
      startDate: sixMonthsAgo,
      endDate: sixMonthsFromNow,
      nextBillingDate: oneMonthFromNow,
      autoRenew: true,
      trialUsed: true,
      paymentMethod: 'credit_card',
      metadata: { source: 'web', campaignId: 'summer2023' },
    {
  email: 'anna.dimitrova@yahoo.com',
      planType: 'BASIC',
      status: 'ACTIVE',
      startDate: threeMonthsAgo,
      endDate: threeMonthsFromNow,
      nextBillingDate: oneMonthFromNow,
      autoRenew: true,
      trialUsed: false,
      paymentMethod: 'paypal',
      metadata: { source: 'mobile', referralCode: 'FRIEND20' },
    {
  email: 'stefan.georgiev@outlook.com',
      planType: 'PREMIUM',
      status: 'CANCELLED',
      startDate: oneYearAgo,
      endDate: oneMonthAgo,
      cancellationDate: oneMonthAgo,
      cancellationReason: 'Too expensive',
      autoRenew: false,
      trialUsed: true,
      paymentMethod: 'credit_card',
      metadata: { source: 'web' },
    {
  email: 'maria.stoilova@gmail.com',
      planType: 'FREE',
      status: 'ACTIVE',
      startDate: sixMonthsAgo,
      autoRenew: true,
      trialUsed: false,
      metadata: { source: 'web', limitedFeatures: true },
    {
  email: 'dimitar.petrov@gmail.com',
      planType: 'LIFETIME',
      status: 'ACTIVE',
      startDate: oneYearAgo,
      autoRenew: false,
      trialUsed: false,
      paymentMethod: 'bank_transfer',
      metadata: { source: 'special_offer', price: 999.99 },
    {
  email: 'elena.vasileva@gmail.com',
      planType: 'PREMIUM',
      status: 'TRIALING',
      startDate: oneWeekAgo,
      endDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now,
  trialEndDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      autoRenew: true,
      trialUsed: true,
      metadata: { source: 'web', trialDays: 14 },
    {
  email: 'nikolay.angelov@gmail.com',
      planType: 'BASIC',
      status: 'PAST_DUE',
      startDate: threeMonthsAgo,
      endDate: oneMonthFromNow,
      nextBillingDate: oneWeekAgo,
      autoRenew: true,
      trialUsed: true,
      paymentMethod: 'credit_card',
      metadata: { source: 'web', failedPaymentAttempts: 3 },
    {
  email: 'sonia.kiriakova@gmail.com',
      planType: 'PREMIUM',
      status: 'EXPIRED',
      startDate: oneYearAgo,
      endDate: oneMonthAgo,
      autoRenew: false,
      trialUsed: true,
      paymentMethod: 'credit_card',
      metadata: { source: 'partner', partnerId: 'HOTEL001' },
    {
  email: 'alexander.mihaylov@gmail.com',
      planType: 'BASIC',
      status: 'ACTIVE',
      startDate: oneMonthAgo,
      endDate: oneMonthFromNow,
      nextBillingDate: oneMonthFromNow,
      autoRenew: true,
      trialUsed: true,
      paymentMethod: 'debit_card',
      metadata: { source: 'mobile', appVersion: '2.1.0' },
    {
  email: 'victoria.tsvetanova@gmail.com',
      planType: 'PREMIUM',
      status: 'PENDING',
      startDate: now,
      endDate: oneMonthFromNow,
      autoRenew: true,
      trialUsed: false,
      paymentMethod: 'credit_card',
      metadata: { source: 'web', pendingVerification: true }
  ];

  // Map user subscriptions to actual subscription records
  for (const subData of userSubscriptions) {
    const user = users.find(u => u.email === subData.email);

    const plan = planMap[subData.planType];

    if (user && plan) {
      const subscription: Partial<Subscription> = {
  id: uuidv4(),
        user_id: user.id,
        plan_id: plan.id,
        type: subData.planType as SubscriptionType,
        status: subData.status as SubscriptionStatus,
        start_date: subData.startDate,
        end_date: subData.endDate || null,
        next_billing_date: subData.nextBillingDate || null,
        trial_end_date: subData.trialEndDate || null,
        cancellation_date: subData.cancellationDate || null,
        cancellation_reason: subData.cancellationReason || null,
        auto_renew: subData.autoRenew,
        trial_used: subData.trialUsed,
        price: plan.price,
        currency: 'BGN',
        payment_method: subData.paymentMethod || null,
        payment_provider_subscription_id: subData.paymentMethod ? `${subData.paymentMethod}_${uuidv4().substring(0, 8)}` : null,
        stripe_customer_id: subData.paymentMethod === 'credit_card' ? `cus_${uuidv4().substring(0, 14)}` : null,
        stripe_subscription_id: subData.paymentMethod === 'credit_card' && subData.status === 'ACTIVE' ? `sub_${uuidv4().substring(0, 14)}` : null,
        discount_percentage: subData.metadata?.referralCode ? 20 : 0,
        discount_amount: subData.metadata?.referralCode ? plan.price * 0.2 : 0,
        final_price: subData.metadata?.referralCode ? plan.price * 0.8 : plan.price,
        renewal_count: subData.status === 'ACTIVE' && subData.startDate < threeMonthsAgo ? Math.floor((now.getTime() - subData.startDate.getTime()) / (30 * 24 * 60 * 60 * 1000)) : 0,
        last_payment_date: subData.status === 'ACTIVE' ? oneMonthAgo : null,
        last_payment_amount: subData.status === 'ACTIVE' ? plan.price : null,
        failed_payment_count: subData.status === 'PAST_DUE' ? 3 : 0,
        metadata: subData.metadata || {},
        created_at: subData.startDate,
        updated_at: now
      }

      subscriptions.push(subscription);
    }

  // Add some historical subscriptions for analytics;

const historicalSubscriptions = [
    {
  user_email: 'peter.nikolov@gmail.com',
      planType: 'BASIC',
      status: 'EXPIRED',
      startDate: new Date(now.getFullYear() - 2, now.getMonth(), now.getDate()),
      endDate: oneYearAgo
    },
    {
  user_email: 'anna.dimitrova@yahoo.com',
      planType: 'FREE',
      status: 'EXPIRED',
      startDate: new Date(now.getFullYear() - 1, now.getMonth() - 6, now.getDate()),
      endDate: threeMonthsAgo
    }
  ];

  for (const histData of historicalSubscriptions) {

    if (user && plan) {
      subscriptions.push({
  id: uuidv4(),
        user_id: user.id,
        plan_id: plan.id,
        type: histData.planType as SubscriptionType,
        status: histData.status as SubscriptionStatus,
        start_date: histData.startDate,
        end_date: histData.endDate,
        auto_renew: false,
        trial_used: histData.planType !== 'FREE',
        price: plan.price,
        currency: 'BGN',
        final_price: plan.price,
        renewal_count: Math.floor((histData.endDate.getTime() - histData.startDate.getTime()) / (30 * 24 * 60 * 60 * 1000)),
        metadata: { archived: true },
        created_at: histData.startDate,
        updated_at: histData.endDate
      });
    }

  // Insert all subscriptions
  if (subscriptions.length > 0) {
    await knex('subscriptions').insert(subscriptions);
    console.log(`✅ Seeded ${subscriptions.length} subscriptions`);
  }

  // Create subscription transaction history;

const transactions = [];
  for (const sub of subscriptions.filter(s => s.status === 'ACTIVE' && s.payment_method)) {
    const transactionCount = sub.renewal_count || 1;
    for (let i = 0; i < transactionCount; i++) {
      const transactionDate = new Date(sub.start_date);
      transactionDate.setMonth(transactionDate.getMonth() + i);
      
      transactions.push({
  id: uuidv4(),
        subscription_id: sub.id,
        user_id: sub.user_id,
        amount: sub.final_price,
        currency: sub.currency,
        type: 'subscription_payment',
        status: 'completed',
        payment_method: sub.payment_method,
        stripe_payment_intent_id: sub.stripe_customer_id ? `pi_${uuidv4().substring(0, 14)}` : null,
        description: `Subscription payment for ${su
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
}
}
}
}
}