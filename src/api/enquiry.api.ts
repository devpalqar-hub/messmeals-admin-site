import api from "./axios";



export type EnquiryType = "USER" | "MESS_OWNER";

export interface Enquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  enquiryType: "USER" | "MESS_OWNER";
  messname: string | null;
  district: string | null;
  pincode: string | null;
  createdAt: string;
  mess: {
    id: string;
    name: string;
  } | null;
}



export interface EnquiryResponse {
  data: Enquiry[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const getEnquiries = (
  enquiryType: EnquiryType,
  page: number,
  limit: number
) => {
  return api.get<EnquiryResponse>("/contact-form", {
    params: {
      enquiryType,
      page,
      limit,
    },
  });
};
