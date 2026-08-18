import api from "./axios";

export const loginSuperAdmin = (email: string, password: string) => {
  return api.post("/auth/superadmin/login", {
    email,
    password,
  });
};
