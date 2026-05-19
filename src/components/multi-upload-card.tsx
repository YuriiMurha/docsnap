import { Camera, Plus, X } from "lucide-react";
import { useRef } from "react";

type Props = {
  title: string;
  hint: string;
  files: File[];
  previewUrls: string[];
  onAdd: (files: File[]) => void;
  onRemove: (index: number) => void;
};

export function MultiUploadCard({ title, hint, files, previewUrls, onAdd, onRemove }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const hasFiles = files.length > 0;

  return (
    <div className="rounded-2xl border border-line bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="font-serif text-lg font-bold text-ink">{title}</h2>
        {hasFiles && (
          <span className="text-sm text-muted">
            {files.length} {files.length === 1 ? "fotka" : files.length < 5 ? "fotky" : "fotiek"}
          </span>
        )}
      </div>

      {hasFiles ? (
        <>
          <div className="grid grid-cols-3 gap-2">
            {previewUrls.map((url, i) => (
              <div key={i} className="relative aspect-square overflow-hidden rounded-lg border border-line">
                <img src={url} alt={`${title} ${i + 1}`} className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => onRemove(i)}
                  className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white"
                  aria-label="Odstrániť"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-line bg-surf text-brand active:scale-[0.99]"
            >
              <Plus className="h-6 w-6" />
              <span className="text-xs font-medium">Pridať</span>
            </button>
          </div>
        </>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-line bg-surf px-4 py-8 text-center transition active:scale-[0.99]"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-soft text-brand">
            <Camera className="h-7 w-7" />
          </span>
          <span className="text-base font-semibold text-ink">{hint}</span>
          <span className="text-xs text-muted">Klepni pre fotoaparát · môžeš pridať viac</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        className="hidden"
        onChange={(e) => {
          const list = e.target.files;
          if (list && list.length > 0) onAdd(Array.from(list));
          e.target.value = "";
        }}
      />
    </div>
  );
}
