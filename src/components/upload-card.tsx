import { Camera, Check } from "lucide-react";
import { useRef } from "react";

type Props = {
  title: string;
  hint: string;
  file: File | null;
  previewUrl: string | null;
  onFile: (file: File) => void;
};

export function UploadCard({ title, hint, file, previewUrl, onFile }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const hasFile = !!file && !!previewUrl;

  return (
    <div className="rounded-2xl border border-line bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="font-serif text-lg font-bold text-ink">{title}</h2>
        {hasFile && (
          <span className="inline-flex items-center gap-1 text-sm text-status-ok">
            <Check className="h-4 w-4" /> hotovo
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-line bg-surf px-4 py-8 text-center transition active:scale-[0.99]"
      >
        {hasFile ? (
          <>
            <img
              src={previewUrl!}
              alt={title}
              className="h-40 w-full rounded-lg object-cover"
            />
            <span className="truncate text-sm text-muted">{file.name}</span>
            <span className="text-sm font-medium text-brand">Vymeniť fotku</span>
          </>
        ) : (
          <>
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-soft text-brand">
              <Camera className="h-7 w-7" />
            </span>
            <span className="text-base font-semibold text-ink">{hint}</span>
            <span className="text-xs text-muted">Klepni pre fotoaparát</span>
          </>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}
