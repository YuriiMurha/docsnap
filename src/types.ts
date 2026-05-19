export type Unit = "ks" | "kartón" | "paleta";

export type LineItem = {
  sku: string;
  name: string;
  orderedQty: number;
  unit: Unit;
};

export type DetectedItem = {
  sku: string | null;
  name: string;
  detectedQty: number;
  confidence: number;
};

export type MatchStatus = "OK" | "MISSING" | "EXTRA" | "PARTIAL";

export type MatchRow = {
  sku: string;
  name: string;
  orderedQty: number;
  detectedQty: number;
  unit: string;
  status: MatchStatus;
  confidence: number;
};

export type Delivery = {
  id: string;
  deliveryNoteImage: string;
  palletImage: string;
  lineItems: LineItem[];
  detected: DetectedItem[];
  matchRows: MatchRow[];
  createdAt: string;
};
