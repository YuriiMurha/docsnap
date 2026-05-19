import type { DetectedItem } from "@/types";

/**
 * Merge detected items from multiple pallet photos.
 * Same SKU (or same name when SKU is null) → sum quantities, average confidence weighted by qty.
 */
export function mergeDetected(batches: DetectedItem[][]): DetectedItem[] {
  const map = new Map<string, DetectedItem & { _confSum: number; _qtySum: number }>();

  for (const batch of batches) {
    for (const item of batch) {
      const key = item.sku ?? `name:${item.name.toLowerCase().trim()}`;
      const existing = map.get(key);
      if (existing) {
        existing.detectedQty += item.detectedQty;
        existing._confSum += item.confidence * Math.max(item.detectedQty, 1);
        existing._qtySum += Math.max(item.detectedQty, 1);
        existing.confidence = existing._confSum / existing._qtySum;
      } else {
        map.set(key, {
          ...item,
          _confSum: item.confidence * Math.max(item.detectedQty, 1),
          _qtySum: Math.max(item.detectedQty, 1),
        });
      }
    }
  }

  return Array.from(map.values()).map(({ _confSum, _qtySum, ...rest }) => rest);
}
