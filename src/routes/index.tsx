import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { UploadCard } from "@/components/upload-card";
import { LoadingOverlay } from "@/components/loading-overlay";
import { ThemeToggle } from "@/components/theme-toggle";
import { useDelivery } from "@/context/delivery-context";
import { fileToBase64, fileToDataUrl } from "@/lib/file-to-base64";
import { buildDemoDelivery } from "@/lib/demo";
import { buildMatchReport } from "@/lib/match";
import { extractDeliveryNote, detectPalletContents } from "@/lib/ai.functions";
import type { Delivery } from "@/types";
import logoUrl from "@/assets/logo.png";


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
  const [palletFile, setPalletFile] = useState<File | null>(null);
  const [notePreview, setNotePreview] = useState<string | null>(null);
  const [palletPreview, setPalletPreview] = useState<string | null>(null);
  const [step, setStep] = useState<Step>(null);

  async function handleNoteFile(f: File) {
    setNoteFile(f);
    setNotePreview(await fileToDataUrl(f));
  }
  async function handlePalletFile(f: File) {
    setPalletFile(f);
    setPalletPreview(await fileToDataUrl(f));
  }

  async function handleSubmit() {
    if (!noteFile || !palletFile || !notePreview || !palletPreview) return;
    try {
      setStep("note");
      const noteB64 = await fileToBase64(noteFile);
      const { items } = await extractFn({ data: { imageBase64: noteB64 } });

      setStep("pallet");
      const palletB64 = await fileToBase64(palletFile);
      const { items: detected } = await detectFn({
        data: { imageBase64: palletB64, expected: items },
      });

      setStep("match");
      await new Promise((r) => setTimeout(r, 300));
      const matchRows = buildMatchReport(items, detected);
      const delivery: Delivery = {
        id: crypto.randomUUID(),
        deliveryNoteImage: notePreview,
        palletImage: palletPreview,
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

  const canSubmit = !!noteFile && !!palletFile && step === null;

  return (
    <div className="flex min-h-screen flex-col px-5 pb-32 pt-8">
      <header className="mb-8 relative">
        <div className="absolute right-0 top-0">
          <ThemeToggle />
        </div>
        <div className="text-center pt-1">
          <img src={logoUrl} alt="DocSnap" className="mx-auto h-16 w-auto dark:brightness-0 dark:invert-[.92]" />
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
        <UploadCard
          title="Paleta"
          hint="Odfoť paletu"
          file={palletFile}
          previewUrl={palletPreview}
          onFile={handlePalletFile}
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
