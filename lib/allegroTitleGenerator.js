import OpenAI from "openai";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Brak OPENAI_API_KEY w pliku .env.local — uzupełnij klucz i zrestartuj serwer");
}

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = readFileSync(
  path.join(__dirname, "prompts/allegroTitlePrompt.txt"),
  "utf-8"
);

const POLISH_CHARS  = /[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/;
const ENGLISH_WORDS = /\b(the|and|for|with|of|in|is|bath|rug|mat|anti|slip|grey|black|beige)\b/i;

function verifyPolish(title, index) {
  if (ENGLISH_WORDS.test(title) && !POLISH_CHARS.test(title)) {
    console.warn(`[titleGenerator] Tytuł #${index + 1} może być po angielsku: "${title}"`);
  }
  return title;
}

export async function generateAllegroTitles(products) {
  const productList = products
    .map((p, i) => `${i + 1}. Nazwa: "${p.originalName}" | Opis: "${p.description}" | Wymiary: "${p.dimensions}" | Kolor: "${p.color}"`)
    .join("\n");

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 1024,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `Wygeneruj tytuły Allegro (max 75 znaków) dla ${products.length} produktów.\nOdpowiedz TYLKO tablicą JSON np: ["Tytuł 1","Tytuł 2"]\n\nProdukty:\n${productList}` },
    ],
  });

  const usage = response.usage;
  if (usage) {
    const total = ((usage.prompt_tokens / 1000) * 0.0025 + (usage.completion_tokens / 1000) * 0.010).toFixed(5);
    console.log(`[OpenAI] Tokeny: ${usage.prompt_tokens} in + ${usage.completion_tokens} out = ~$${total}`);
  }

  const raw    = response.choices[0].message.content.trim();
  const titles = JSON.parse(raw.replace(/```json|```/g, "").trim());

  return products.map((p, i) => ({
    ...p,
    allegroTitle: verifyPolish(titles[i], i).slice(0, 75),
  }));
}
