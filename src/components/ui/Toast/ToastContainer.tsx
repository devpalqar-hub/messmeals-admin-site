import { createContext, useContext, useState } from "react";
import Toast from "./Toast";

type ToastType = {
  message: string;
  type: "success" | "error" | "info";
};

type ToastContextType = {
  showToast: (msg: string, type: ToastType["type"]) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {

  const [toast, setToast] = useState<ToastType | null>(null);

  const showToast = (message: string, type: ToastType["type"]) => {
    setToast({ message, type });

    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && <Toast {...toast} />}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
};
