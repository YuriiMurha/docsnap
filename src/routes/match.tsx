import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { StatusDot } from "@/components/status-dot";
import { useDelivery } from "@/context/delivery-context";

export const Route = createFileRoute("/match")({
  component: MatchReport,
});

function MatchReport() {
  const { delivery } = useDelivery();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"all" | "issues">("all");

  useEffect(() => {
    if (!delivery) navigate({ to: "/" });
  }, [delivery, navigate]);

  const stats = useMemo(() => {
    if (!delivery) return { ok: 0, missing: 0, extra: 0, total: 0 };
    const rows = delivery.matchRows;
    return {
      ok: rows.filter((r) => r.status === "OK").length,
      missing: rows.filter((r) => r.status === "MISSING" || r.status === "PARTIAL").length,
      extra: rows.filter((r) => r.status === "EXTRA").length,
      total: rows.length,
    };
  }, [delivery]);

  if (!delivery) return null;

  const rows = filter === "all"
    ? delivery.matchRows
    : delivery.matchRows.filter((r) => r.status !== "OK");

  return (
    <div className="flex min-h-screen flex-col pb-28">
      <header className="flex items-center gap-2 px-4 pb-2 pt-6">
        <Link to="/" className="-ml-2 rounded-full p-2 text-ink hover:bg-surf">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-serif text-xl font-bold text-ink">Match report</h1>
      </header>

      <section className="mx-4 mt-2 rounded-2xl border border-line bg-card p-5 shadow-sm">
        <p className="font-serif text-[32px] font-bold leading-tight text-ink">
          {stats.ok} z {stats.total} sedí
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Pill color="ok" label={`${stats.ok} OK`} />
          <Pill color="missing" label={`${stats.missing} chýba`} />
          <Pill color="extra" label={`${stats.extra} navyše`} />
        </div>
      </section>

      <div className="mx-4 mt-5 flex gap-2">
        <Chip active={filter === "all"} onClick={() => setFilter("all")}>Všetko</Chip>
        <Chip active={filter === "issues"} onClick={() => setFilter("issues")}>Iba problémy</Chip>
      </div>

      <ul className="mt-3 flex flex-col divide-y divide-line border-y border-line bg-card">
        {rows.map((row) => (
          <li key={row.sku}>
            <Link
              to="/match/$sku"
              params={{ sku: row.sku }}
              className="flex items-center gap-3 px-4 py-4 active:bg-surf"
            >
              <StatusDot status={row.status} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-ink">{row.name}</p>
                <p className="truncate text-xs text-muted">{row.sku}</p>
              </div>
              <p className="whitespace-nowrap text-sm text-ink">
                <span className="font-bold">{row.detectedQty}</span>
                <span className="text-muted"> / {row.orderedQty} {row.unit}</span>
              </p>
              <ChevronRight className="h-4 w-4 text-muted" />
            </Link>
          </li>
        ))}
      </ul>

      <div className="fixed inset-x-0 bottom-0 z-10 mx-auto w-full max-w-[480px] border-t border-line bg-card/95 p-4 backdrop-blur">
        <button
          type="button"
          onClick={() => toast.success("Príjem zaznamenaný (demo)")}
          className="w-full rounded-xl bg-brand py-4 text-base font-semibold text-brand-foreground active:scale-[0.99]"
        >
          Podpísať príjem
        </button>
      </div>
    </div>
  );
}

function Pill({ color, label }: { color: "ok" | "missing" | "extra"; label: string }) {
  const cls = {
    ok: "bg-status-ok/15 text-status-ok",
    missing: "bg-status-missing/15 text-status-missing",
    extra: "bg-status-extra/15 text-status-extra",
  }[color];
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${cls}`}>
      {label}
    </span>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
        active
          ? "border-brand bg-brand text-brand-foreground"
          : "border-line bg-card text-ink"
      }`}
    >
      {children}
    </button>
  );
}
