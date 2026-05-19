import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Package } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { useDelivery } from "@/context/delivery-context";
import { getProductImage } from "@/lib/product-images";
import type { MatchRow } from "@/types";

export const Route = createFileRoute("/match_/$sku")({
  component: Detail,
});

function Detail() {
  const { sku } = Route.useParams();
  const { delivery } = useDelivery();
  const navigate = useNavigate();

  useEffect(() => {
    if (!delivery) navigate({ to: "/" });
  }, [delivery, navigate]);

  if (!delivery) return null;
  const row = delivery.matchRows.find((r) => r.sku === sku);
  if (!row) {
    return (
      <div className="px-5 py-10">
        <p className="text-muted">Položka sa nenašla.</p>
        <Link to="/match" className="mt-4 inline-block text-brand">← Späť</Link>
      </div>
    );
  }

  const detectedItem = delivery.detected.find((d) => d.sku === sku);

  const productImage = getProductImage(row.sku);

  return (
    <div className="flex min-h-screen flex-col pb-28">
      <header className="flex items-center gap-2 px-4 pb-2 pt-6">
        <Link to="/match" className="-ml-2 rounded-full p-2 text-ink hover:bg-surf">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="truncate font-serif text-xl font-bold text-ink">{row.name}</h1>
      </header>

      <StatusBanner row={row} />

      <section className="mx-4 mt-5">
        <h2 className="text-xs font-bold uppercase tracking-wide text-muted">Produkt</h2>
        <div className="mt-2 overflow-hidden rounded-xl border border-line bg-card">
          {productImage ? (
            <img
              src={productImage}
              alt={row.name}
              className="h-56 w-full bg-white object-contain p-4"
            />
          ) : (
            <div className="flex h-56 w-full items-center justify-center bg-surf text-muted">
              <Package className="h-12 w-12" />
            </div>
          )}
        </div>
      </section>

      <section className="mx-4 mt-5">
        <h2 className="text-xs font-bold uppercase tracking-wide text-muted">Z dodacieho listu</h2>
        <div className="mt-2 rounded-xl border border-line bg-card p-4">
          <p className="text-sm text-muted">SKU</p>
          <p className="mb-2 font-mono text-sm text-ink">{row.sku}</p>
          <p className="text-sm text-muted">Názov</p>
          <p className="mb-2 font-semibold text-ink">{row.name}</p>
          <p className="text-sm text-muted">Objednané množstvo</p>
          <p className="font-semibold text-ink">{row.orderedQty} {row.unit}</p>
        </div>
      </section>

      <section className="mx-4 mt-5">
        <h2 className="text-xs font-bold uppercase tracking-wide text-muted">Detegované na palete</h2>
        <div className="mt-2 rounded-xl border border-line bg-card p-4">
          <p className="text-2xl font-bold text-ink">
            {row.detectedQty} {row.unit}
            <span className="ml-2 text-sm font-normal text-muted">
              · {Math.round((detectedItem?.confidence ?? row.confidence) * 100)}% istota
            </span>
          </p>
          <p className="mt-1 text-xs text-muted">
            Súčet z {delivery.palletImages.length} {delivery.palletImages.length === 1 ? "fotky" : "fotiek"} palety
          </p>
        </div>
      </section>

      <section className="mx-4 mt-5">
        <h2 className="text-xs font-bold uppercase tracking-wide text-muted">Fotky palety</h2>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {delivery.palletImages.map((url, i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-line bg-card">
              <img src={url} alt={`Paleta ${i + 1}`} className="h-32 w-full object-cover" />
            </div>
          ))}
        </div>
      </section>


      <div className="fixed inset-x-0 bottom-0 z-10 mx-auto w-full max-w-[480px] border-t border-line bg-card/95 p-4 backdrop-blur">
        <button
          type="button"
          onClick={() => toast.success("Rozdiel nahlásený (demo)")}
          className="w-full rounded-xl bg-brand py-4 text-base font-semibold text-brand-foreground active:scale-[0.99]"
        >
          Nahlásiť rozdiel dodávateľovi
        </button>
      </div>
    </div>
  );
}

function StatusBanner({ row }: { row: MatchRow }) {
  const diff = row.detectedQty - row.orderedQty;
  let label: string;
  let cls: string;
  switch (row.status) {
    case "OK":
      label = "Sedí";
      cls = "bg-status-ok";
      break;
    case "MISSING":
      label = `Chýba ${row.orderedQty} ${row.unit}`;
      cls = "bg-status-missing";
      break;
    case "EXTRA":
      label = `Navyše ${Math.abs(diff)} ${row.unit}`;
      cls = "bg-status-extra";
      break;
    case "PARTIAL":
      label = `Čiastočná dodávka — chýba ${Math.abs(diff)} ${row.unit}`;
      cls = "bg-status-partial";
      break;
  }
  return (
    <div className={`mt-2 px-5 py-4 text-center text-base font-bold text-white ${cls}`}>
      {label}
    </div>
  );
}
