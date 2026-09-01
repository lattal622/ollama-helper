import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";

import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const PredictInput = z.object({
  prompt: z.string().min(10),
  source: z.enum(["lovable", "gemini"]).default("lovable"),
  geminiApiKey: z.string().optional(),
});

const GEMINI_MODEL = "gemini-2.5-flash";
const LOVABLE_MODEL = "google/gemini-3.6-flash";

async function predictWithUserGemini(prompt: string, apiKey: string): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1200,
          responseMimeType: "application/json",
        },
      }),
    },
  );

  const raw = await res.text();

  if (!res.ok) {
    if (res.status === 400 && raw.includes("API_KEY_INVALID")) {
      throw new Error("Gemini ključ nije valjan. Provjerite ga u postavkama.");
    }
    if (res.status === 429) {
      throw new Error("Gemini dnevni limit je potrošen. Pokušajte kasnije ili koristite ugrađeni AI.");
    }
    throw new Error(`Gemini greška (${res.status}): ${raw.slice(0, 200)}`);
  }

  let data: {
    candidates?: { content?: { parts?: { text?: string }[] }; finishReason?: string }[];
    promptFeedback?: { blockReason?: string };
  };
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error("Gemini je vratio neočekivan odgovor (nije JSON).");
  }

  const candidate = data.candidates?.[0];
  const text = (candidate?.content?.parts ?? [])
    .map((p) => p.text ?? "")
    .join("")
    .trim();

  if (!text) {
    const reason = data.promptFeedback?.blockReason || candidate?.finishReason || "nepoznat razlog";
    throw new Error(`Gemini nije vratio tekst (${reason}). Pokušajte s ugrađenim AI izvorom.`);
  }

  return text;
}

async function predictWithLovableAi(prompt: string): Promise<string> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) {
    throw new Error("Ugrađeni AI nije konfiguriran na poslužitelju.");
  }

  const gateway = createLovableAiGatewayProvider(apiKey);

  try {
    const { text } = await generateText({
      model: gateway(LOVABLE_MODEL),
      prompt,
      temperature: 0.7,
    });

    const trimmed = text.trim();
    if (!trimmed) throw new Error("AI nije vratio odgovor. Pokušajte ponovno.");
    return trimmed;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("402")) {
      throw new Error("Potrošeni su AI krediti radnog prostora. Nadopunite ih u Lovable postavkama.");
    }
    if (message.includes("429")) {
      throw new Error("Previše zahtjeva prema AI-u. Pričekajte trenutak pa pokušajte ponovno.");
    }
    throw new Error(`AI greška: ${message.slice(0, 200)}`);
  }
}

export const predictMatch = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => PredictInput.parse(input))
  .handler(async ({ data }) => {
    if (data.source === "gemini") {
      const key = data.geminiApiKey?.trim();
      if (!key) {
        throw new Error("Nedostaje Google Gemini API ključ. Dodajte ga u postavkama ili odaberite ugrađeni AI.");
      }
      return { text: await predictWithUserGemini(data.prompt, key) };
    }

    return { text: await predictWithLovableAi(data.prompt) };
  });
