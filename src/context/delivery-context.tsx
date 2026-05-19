import { createContext, useContext, useState, type ReactNode } from "react";
import type { Delivery } from "@/types";

type Ctx = {
  delivery: Delivery | null;
  setDelivery: (d: Delivery | null) => void;
};

const DeliveryContext = createContext<Ctx | null>(null);

export function DeliveryProvider({ children }: { children: ReactNode }) {
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  return (
    <DeliveryContext.Provider value={{ delivery, setDelivery }}>
      {children}
    </DeliveryContext.Provider>
  );
}

export function useDelivery() {
  const ctx = useContext(DeliveryContext);
  if (!ctx) throw new Error("useDelivery must be used inside DeliveryProvider");
  return ctx;
}
