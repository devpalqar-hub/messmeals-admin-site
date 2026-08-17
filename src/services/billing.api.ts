import api from "./axios";
import type {
  BillingMessConfigApiResponse,
  BillingMessConfigPayload,
  BillingGlobalConfigApiResponse,
  BillingGlobalConfigPayload,
  BillingMessInvoiceApiResponse,
  SettleMessInvoicePayload,
} from "../types/billing.types";

export const getBillingGlobalConfig = () => {
  return api.get<BillingGlobalConfigApiResponse>("/billing/global-config");
};

export const updateBillingGlobalConfig = (
  payload: BillingGlobalConfigPayload
) => {
  return api.patch<BillingGlobalConfigApiResponse>(
    "/billing/global-config",
    payload,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};

export const getMessBillingInvoice = (
  messId: string,
  usageMonth?: string
) => {
  return api.get<BillingMessInvoiceApiResponse>(
    `/billing/mess/${messId}/invoice`,
    {
      params: {
        ...(usageMonth && { usageMonth }),
      },
    }
  );
};

export const settleMessBillingInvoice = (
  messId: string,
  payload: SettleMessInvoicePayload
) => {
  return api.post<BillingMessInvoiceApiResponse>(
    `/billing/mess/${messId}/settle`,
    payload,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};

export const updateMessBillingConfig = (
  messId: string,
  payload: BillingMessConfigPayload
) => {
  return api.patch<BillingMessConfigApiResponse>(
    `/billing/mess/${messId}/config`,
    payload,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};
