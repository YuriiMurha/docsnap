import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { DetectedItem, LineItem } from "@/types";
import { DEMO_DETECTED, DEMO_LINE_ITEMS } from "./demo";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "anthropic/claude-sonnet-4";

const DELIVERY_NOTE_PROMPT = `You are an OCR system for warehouse delivery notes (German "Lieferschein" or Slovak "Dodací list").

Extract every line item from this delivery note image. Return ONLY a valid JSON array, nothing else.

Schema:
[
  { "sku": string, "name": string, "orderedQty": number, "unit": "ks" | "kartón" | "paleta" }
]

Rules:
- If SKU is missing on the document, generate a slug from the name (e.g., "gymbeam-whey-2kg")
- orderedQty must be a number (integer), not a string
- unit defaults to "ks" if unclear
- Strip currency, prices, taxes — only product identity and quantity matter
- If you cannot read the document at all, return []
- No text outside the JSON array. No markdown fences.`;

const PALLET_PROMPT = `You are a warehouse vision system. Identify products visible on this pallet and estimate their quantities.

These are the products expected from the delivery note:
{EXPECTED_ITEMS}

Return ONLY a valid JSON array:
[
  { "sku": string | null, "name": string, "detectedQty": number, "confidence": number }
]

Rules:
- When you recognize a product from the expected list, use its exact SKU
- If you see a product NOT on the expected list, include it with "sku": null
- detectedQty: count visible cartons/units. Estimate conservatively.
- confidence: 0.9+ when clearly visible with labels, 0.6-0.85 partial visibility, below 0.6 uncertain
- No text outside the JSON array. No markdown fences.`;

function extractJson<T>(text: string): T {
  const cleaned = text.replace(/```json\n?|```\n?/g, "").trim();
  // Be tolerant: find first '[' to last ']'
  const start = cleaned.indexOf("[");
  const end = cleaned.lastIndexOf("]");
  const slice = start !== -1 && end !== -1 ? cleaned.slice(start, end + 1) : cleaned;
  return JSON.parse(slice) as T;
}

async function callOpenRouter(prompt: string, imageBase64: string): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY_MISSING");
  const model = process.env.OPENROUTER_MODEL ?? DEFAULT_MODEL;

  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "X-Title": "DocSnap",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
            },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenRouter ${res.status}: ${body.slice(0, 500)}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content as string;
}

async function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export const extractDeliveryNote = createServerFn({ method: "POST" })
  .inputValidator(z.object({ imageBase64: z.string().min(1) }))
  .handler(async ({ data }): Promise<{ items: LineItem[]; mocked: boolean }> => {
    if (!process.env.OPENROUTER_API_KEY) {
      await delay(1000);
      return { items: DEMO_LINE_ITEMS, mocked: true };
    }
    const text = await callOpenRouter(DELIVERY_NOTE_PROMPT, data.imageBase64);
    const items = extractJson<LineItem[]>(text);
    return { items, mocked: false };
  });

export const detectPalletContents = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      imageBase64: z.string().min(1),
      expected: z.array(
        z.object({
          sku: z.string(),
          name: z.string(),
          orderedQty: z.number(),
          unit: z.string(),
        }),
      ),
    }),
  )
  .handler(
    async ({ data }): Promise<{ items: DetectedItem[]; mocked: boolean }> => {
      if (!process.env.OPENROUTER_API_KEY) {
        await delay(1000);
        return { items: DEMO_DETECTED, mocked: true };
      }
      const prompt = PALLET_PROMPT.replace(
        "{EXPECTED_ITEMS}",
        JSON.stringify(data.expected, null, 2),
      );
      const text = await callOpenRouter(prompt, data.imageBase64);
      const items = extractJson<DetectedItem[]>(text);
      return { items, mocked: false };
    },
  );
