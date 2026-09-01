import api from "./axios";

export const MENU_WEEKDAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

export type MenuWeekday = (typeof MENU_WEEKDAYS)[number];

export interface MenuDayEntry {
  variationId: string;
  items: string;
}

export interface MenuResponse {
  id: string;
  messId: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  monday?: MenuDayEntry[];
  tuesday?: MenuDayEntry[];
  wednesday?: MenuDayEntry[];
  thursday?: MenuDayEntry[];
  friday?: MenuDayEntry[];
  saturday?: MenuDayEntry[];
  sunday?: MenuDayEntry[];
}

export interface MenuSchedulePayload {
  name: string;
  isActive?: boolean;
  monday?: MenuDayEntry[];
  tuesday?: MenuDayEntry[];
  wednesday?: MenuDayEntry[];
  thursday?: MenuDayEntry[];
  friday?: MenuDayEntry[];
  saturday?: MenuDayEntry[];
  sunday?: MenuDayEntry[];
}

/** All menus for a mess. */
export const getMenusByMess = (messId: string, page = 1, limit = 50) => {
  return api.get("/menus", { params: { messId, page, limit } });
};

export const createMenu = (messId: string, data: MenuSchedulePayload) => {
  return api.post("/menus", { messId, ...data }, {
    headers: { "Content-Type": "application/json" },
  });
};

export const updateMenu = (id: string, data: MenuSchedulePayload) => {
  return api.patch(`/menus/${id}`, data, {
    headers: { "Content-Type": "application/json" },
  });
};

export const deleteMenu = (id: string) => {
  return api.delete(`/menus/${id}`);
};
