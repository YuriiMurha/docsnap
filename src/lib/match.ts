import type { DetectedItem, LineItem, MatchRow } from "@/types";

export function buildMatchReport(
  ordered: LineItem[],
  detected: DetectedItem[],
): MatchRow[] {
  const orderedRows: MatchRow[] = ordered.map((o) => {
    const d = detected.find((x) => x.sku === o.sku);
    const detectedQty = d?.detectedQty ?? 0;
    let status: MatchRow["status"];
    if (detectedQty === 0) status = "MISSING";
    else if (detectedQty < o.orderedQty) status = "PARTIAL";
    else if (detectedQty > o.orderedQty) status = "EXTRA";
    else status = "OK";
    return {
      sku: o.sku,
      name: o.name,
      orderedQty: o.orderedQty,
      detectedQty,
      unit: o.unit,
      status,
      confidence: d?.confidence ?? 0,
    };
  });

  const extraRows: MatchRow[] = detected
    .filter((d) => d.sku && !ordered.find((o) => o.sku === d.sku))
    .map((d) => ({
      sku: d.sku!,
      name: d.name,
      orderedQty: 0,
      detectedQty: d.detectedQty,
      unit: "ks",
      status: "EXTRA",
      confidence: d.confidence,
    }));

  return [...orderedRows, ...extraRows];
}
