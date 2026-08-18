export interface BillingGlobalConfig {
  id: string;
  defaultPerCustomerRate: string;
  defaultTrialDays: number;
  dueDaysBeforePeriodEnd: number;
  graceDaysAfterDue: number;
  createdAt: string;
  updatedAt: string;
}

export interface BillingGlobalConfigPayload {
  defaultPerCustomerRate: number;
  defaultTrialDays: number;
  dueDaysBeforePeriodEnd: number;
  graceDaysAfterDue: number;
}

export type BillingGlobalConfigApiResponse =
  | BillingGlobalConfig
  | {
      data: BillingGlobalConfig;
    };

export interface BillingMessInvoice {
  id: string;
  messId: string;
  periodStart: string;
  periodEnd: string;
  dueDate: string;
  customerCount: number;
  rate: string;
  amount: string;
  status: string;
  paidAt: string | null;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  razorpaySignature: string | null;
  razorpayPaymentMeta: Record<string, unknown> | null;
  paymentProcessedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type BillingMessInvoiceApiResponse =
  | BillingMessInvoice
  | {
      data: BillingMessInvoice;
    };

export interface SettleMessInvoicePayload {
  month: string;
}

export interface BillingMessConfigPayload {
  trialEndsAt: string;
  perCustomerRateOverride: number;
}

export interface BillingMessConfig {
  id: string;
  messId: string;
  trialEndsAt: string;
  perCustomerRateOverride: string;
  createdAt: string;
  updatedAt: string;
}

export type BillingMessConfigApiResponse =
  | BillingMessConfig
  | {
      data: BillingMessConfig;
    };
