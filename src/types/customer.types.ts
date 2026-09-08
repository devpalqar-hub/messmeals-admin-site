/**
 * Customer registration + plan assignment types.
 * Backend: POST /customer/register-user (see CreateCustomerDto).
 */

export type ScheduleType = "EVERYDAY" | "CUSTOM" | "MONTHLY";

export const DAYS_OF_WEEK = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
] as const;

export interface RegisterCustomerPayload {
  name: string;
  phone: string;
  email?: string;
  address: string;
  walletAmount: string;
  planId: string;
  deliveryPartnerId?: string;
  start_date: string;
  end_date?: string;
  scheduleType?: ScheduleType;
  selectedDays?: string[];
  discount?: string;
}
