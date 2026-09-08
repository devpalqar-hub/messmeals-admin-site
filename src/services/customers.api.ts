import api from "./axios";
import type { RegisterCustomerPayload } from "../types/customer.types";

/**
 * Registers a new customer (or reuses an existing one by phone/email) and creates
 * a subscription for the given plan — i.e. "add customer to mess with assigned plan".
 * The mess is derived server-side from the plan's messId.
 */
export const registerCustomer = (payload: RegisterCustomerPayload) => {
  return api.post("/customer/register-user", payload);
};
