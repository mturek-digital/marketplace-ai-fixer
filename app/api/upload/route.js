import { NextResponse } from "next/server";
import { cleanProducts } from "@/lib/cleaner";
import { generateAllegroTitles } from "@/lib/allegroTitleGenerator";
import { scoreProducts } from "@/lib/scorer";
import { detectDuplicates } from "@/lib/duplicates";

const MAX_PRODUCTS = 500;

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) return NextResponse.json({ error: "Brak pliku" }, { status: 400 });
    if (!file.name.endsWith(".json"))
      return NextResponse.json({ error: "Tylko pliki JSON są obsługiwane" }, { status: 400 });
    if (file.size > 5 * 1024 * 1024)
      return NextResponse.json({ error: "Plik przekracza limit 5MB" }, { status: 400 });

    let rawData;
    try { rawData = JSON.parse(await file.text()); }
    catch { return NextResponse.json({ error: "Nieprawidłowy format JSON" }, { status: 400 }); }

    if (!Array.isArray(rawData))
      return NextResponse.json({ error: "Plik JSON musi zawierać tablicę produktów [ ... ]" }, { status: 400 });
    if (rawData.length === 0)
      return NextResponse.json({ error: "Plik nie zawiera żadnych produktów" }, { status: 400 });
    if (rawData.length > MAX_PRODUCTS)
      return NextResponse.json({ error: `Limit to ${MAX_PRODUCTS} produktów.` }, { status: 400 });

    const cleaned    = cleanProducts(rawData);
    const withTitles = await generateAllegroTitles(cleaned);
    const scored     = scoreProducts(withTitles);

    const dupsResult = detectDuplicates(scored);

    const flaggedSet = new Set(dupsResult.flaggedIndices);
    const withDupFlags = scored.map((p, i) => ({ ...p, isDuplicate: flaggedSet.has(i) }));

    const stats = {
      total:          scored.length,
      withEan:        scored.filter(p => p.ean).length,
      outOfStock:     scored.filter(p => p.stock === 0).length,
      withDimensions: scored.filter(p => p.dimensions).length,
      avgScore:       Math.round(scored.reduce((s, p) => s + p.quality.score, 0) / scored.length),
      duplicates:     dupsResult.total,
    };

    return NextResponse.json({
      products:   withDupFlags,
      stats,
      duplicates: { ean: dupsResult.ean, name: dupsResult.name },
    });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: err.message || "Błąd przetwarzania" }, { status: 500 });
  }
}