import wheyChoc from "@/assets/products/whey-choc.jpg";
import wheyVan from "@/assets/products/whey-van.png";
import creatine from "@/assets/products/creatine.jpg";
import bcaa from "@/assets/products/bcaa.jpg";
import shaker from "@/assets/products/shaker.jpg";

export const PRODUCT_IMAGES: Record<string, string> = {
  "GB-WHEY-2000-CHOC": wheyChoc,
  "GB-WHEY-2000-VAN": wheyVan,
  "GB-CREATINE-500": creatine,
  "GB-BCAA-2-1-1-500": bcaa,
  "GB-SHAKER-700": shaker,
};

export function getProductImage(sku: string): string | null {
  return PRODUCT_IMAGES[sku] ?? null;
}
