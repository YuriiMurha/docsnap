import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { UploadCard } from "@/components/upload-card";
import { MultiUploadCard } from "@/components/multi-upload-card";
import { LoadingOverlay } from "@/components/loading-overlay";
import { ThemeToggle } from "@/components/theme-toggle";
import { useDelivery } from "@/context/delivery-context";
import { fileToBase64, fileToDataUrl } from "@/lib/file-to-base64";
import { buildDemoDelivery } from "@/lib/demo";
import { buildMatchReport } from "@/lib/match";
import { mergeDetected } from "@/lib/merge-detected";
import { extractDeliveryNote, detectPalletContents } from "@/lib/ai.functions";
import type { Delivery } from "@/types";
import logoLight from "@/assets/logo-light.png";
import logoDark from "@/assets/logo-dark.png";


export const Route = createFileRoute("/")({
  component: Capture,
});

type Step = null | "note" | "pallet" | "match";
const STEP_LABEL: Record<Exclude<Step, null>, string> = {
  note: "Čítam dodací list…",
  pallet: "Identifikujem paletu…",
  match: "Porovnávam položky…",
};

function Capture() {
  const navigate = useNavigate();
  const { setDelivery } = useDelivery();
  const extractFn = useServerFn(extractDeliveryNote);
  const detectFn = useServerFn(detectPalletContents);

  const [noteFile, setNoteFile] = useState<File | null>(null);
  const [notePreview, setNotePreview] = useState<string | null>(null);
  const [palletFiles, setPalletFiles] = useState<File[]>([]);
  const [palletPreviews, setPalletPreviews] = useState<string[]>([]);
  const [step, setStep] = useState<Step>(null);

  async function handleNoteFile(f: File) {
    setNoteFile(f);
    setNotePreview(await fileToDataUrl(f));
  }
  async function handlePalletAdd(files: File[]) {
    const urls = await Promise.all(files.map(fileToDataUrl));
    setPalletFiles((prev) => [...prev, ...files]);
    setPalletPreviews((prev) => [...prev, ...urls]);
  }
  function handlePalletRemove(i: number) {
    setPalletFiles((prev) => prev.filter((_, idx) => idx !== i));
    setPalletPreviews((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSubmit() {
    if (!noteFile || !notePreview || palletFiles.length === 0) return;
    try {
      setStep("note");
      const noteB64 = await fileToBase64(noteFile);
      const { items } = await extractFn({ data: { imageBase64: noteB64 } });

      setStep("pallet");
      const palletB64s = await Promise.all(palletFiles.map(fileToBase64));
      // Call vision model on each pallet photo in parallel
      const batches = await Promise.all(
        palletB64s.map((b64) =>
          detectFn({ data: { imageBase64: b64, expected: items } }).then((r) => r.items),
        ),
      );
      const detected = mergeDetected(batches);

      setStep("match");
      await new Promise((r) => setTimeout(r, 200));
      const matchRows = buildMatchReport(items, detected);
      const delivery: Delivery = {
        id: crypto.randomUUID(),
        deliveryNoteImage: notePreview,
        palletImages: palletPreviews,
        lineItems: items,
        detected,
        matchRows,
        createdAt: new Date().toISOString(),
      };
      setDelivery(delivery);
      navigate({ to: "/match" });
    } catch (err) {
      console.error(err);
      toast.error("Nepodarilo sa spracovať fotky");
      setStep(null);
    }
  }

  function useDemoData() {
    setDelivery(buildDemoDelivery());
    navigate({ to: "/match" });
  }

  const canSubmit = !!noteFile && palletFiles.length > 0 && step === null;

  return (
    <div className="flex min-h-screen flex-col px-5 pb-32 pt-8">
      <header className="mb-8 relative">
        <div className="absolute right-0 top-0">
          <ThemeToggle />
        </div>
        <div className="text-center pt-1">
          <img src={logoLight} alt="DocSnap" className="mx-auto h-16 w-auto dark:hidden" />
          <img src={logoDark} alt="DocSnap" className="mx-auto hidden h-16 w-auto dark:block" />
          <p className="mt-2 text-sm font-semibold tracking-wide text-muted uppercase">Foto. Match. Hotovo.</p>
        </div>
      </header>

      <div className="flex flex-col gap-4">
        <UploadCard
          title="Dodací list"
          hint="Odfoť dodací list"
          file={noteFile}
          previewUrl={notePreview}
          onFile={handleNoteFile}
        />
        <MultiUploadCard
          title="Paleta"
          hint="Odfoť paletu"
          files={palletFiles}
          previewUrls={palletPreviews}
          onAdd={handlePalletAdd}
          onRemove={handlePalletRemove}
        />
      </div>

      <div className="mt-auto pt-8">
        <button
          type="button"
          disabled={!canSubmit}
          onClick={handleSubmit}
          className="w-full rounded-xl bg-brand py-4 text-base font-semibold text-brand-foreground shadow-sm transition disabled:cursor-not-allowed disabled:bg-muted/40 disabled:text-muted active:scale-[0.99]"
        >
          Skontrolovať dodávku
        </button>
        <button
          type="button"
          onClick={useDemoData}
          className="mt-4 w-full text-center text-sm text-brand underline-offset-4 hover:underline"
        >
          Vyskúšaj s ukážkovými dátami →
        </button>
      </div>

      {step !== null && <LoadingOverlay label={STEP_LABEL[step]} />}
    </div>
  );
}
