import type { Delivery } from "@/types";
import { buildMatchReport } from "./match";

const lineItems = [
  { sku: "GB-WHEY-2000-CHOC", name: "GymBeam True Whey Protein 2000g Chocolate", orderedQty: 12, unit: "ks" as const },
  { sku: "GB-WHEY-2000-VAN", name: "GymBeam True Whey Protein 2000g Vanilla", orderedQty: 8, unit: "ks" as const },
  { sku: "GB-CREATINE-500", name: "GymBeam Creatine Monohydrate 500g", orderedQty: 24, unit: "ks" as const },
  { sku: "GB-BCAA-2-1-1-500", name: "GymBeam BCAA 2:1:1 500g Watermelon", orderedQty: 6, unit: "ks" as const },
  { sku: "GB-SHAKER-700", name: "GymBeam Shaker Blend 700ml Black", orderedQty: 50, unit: "ks" as const },
];

const detected = [
  { sku: "GB-WHEY-2000-CHOC", name: "GymBeam True Whey Protein 2000g Chocolate", detectedQty: 12, confidence: 0.95 },
  { sku: "GB-WHEY-2000-VAN", name: "GymBeam True Whey Protein 2000g Vanilla", detectedQty: 6, confidence: 0.92 },
  { sku: "GB-CREATINE-500", name: "GymBeam Creatine Monohydrate 500g", detectedQty: 24, confidence: 0.88 },
  { sku: "GB-BCAA-2-1-1-500", name: "GymBeam BCAA 2:1:1 500g Watermelon", detectedQty: 0, confidence: 0.0 },
  { sku: "GB-SHAKER-700", name: "GymBeam Shaker Blend 700ml Black", detectedQty: 52, confidence: 0.85 },
];

export const DEMO_LINE_ITEMS = lineItems;
export const DEMO_DETECTED = detected;

export function buildDemoDelivery(): Delivery {
  return {
    id: "demo-001",
    deliveryNoteImage: "/demo/lieferschein-sample.svg",
    palletImages: ["/demo/pallet-sample.svg"],
    lineItems,
    detected,
    matchRows: buildMatchReport(lineItems, detected),
    createdAt: new Date().toISOString(),
  };
}
