import { Loader2 } from "lucide-react";

export function LoadingOverlay({ label }: { label: string }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-background/95 px-6 text-center">
      <Loader2 className="h-10 w-10 animate-spin text-brand" />
      <p className="font-serif text-xl font-bold text-ink">{label}</p>
    </div>
  );
}
