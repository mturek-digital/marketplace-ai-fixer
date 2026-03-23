export function scoreProduct(p) {
  let score = 0;
  const breakdown = [];

  if (p.ean && p.ean.trim()) { score += 20; breakdown.push({ label: "EAN", pts: 20, max: 20, ok: true }); }
  else breakdown.push({ label: "EAN", pts: 0, max: 20, ok: false, hint: "Brak kodu EAN" });

  if (p.dimensions) { score += 15; breakdown.push({ label: "Wymiary", pts: 15, max: 15, ok: true }); }
  else breakdown.push({ label: "Wymiary", pts: 0, max: 15, ok: false, hint: "Brak wymiarów" });

  if (p.color) { score += 10; breakdown.push({ label: "Kolor", pts: 10, max: 10, ok: true }); }
  else breakdown.push({ label: "Kolor", pts: 0, max: 10, ok: false, hint: "Brak koloru" });

  const descLen = (p.description || "").length;
  const descPts = Math.min(20, Math.round((descLen / 120) * 20));
  score += descPts;
  breakdown.push({ label: "Opis", pts: descPts, max: 20, ok: descPts >= 15, hint: descPts < 15 ? `Opis za krótki (${descLen} znaków, cel: 120+)` : null });

  const titleLen = (p.allegroTitle || "").length;
  let titlePts = 0;
  if (titleLen >= 50 && titleLen <= 75) titlePts = 20;
  else if (titleLen >= 30 && titleLen < 50) titlePts = 12;
  else if (titleLen > 0) titlePts = 6;
  score += titlePts;
  breakdown.push({ label: "Tytuł", pts: titlePts, max: 20, ok: titlePts >= 15, hint: titleLen === 0 ? "Brak tytułu" : titleLen < 50 ? `Tytuł za krótki (${titleLen} znaków)` : titleLen > 75 ? `Tytuł za długi (${titleLen}/75)` : null });

  if (p.stock > 0) { score += 10; breakdown.push({ label: "Stan", pts: 10, max: 10, ok: true }); }
  else breakdown.push({ label: "Stan", pts: 0, max: 10, ok: false, hint: "Brak towaru" });

  const priceVal = parseFloat(p.price);
  if (p.price && !isNaN(priceVal) && priceVal > 0) { score += 5; breakdown.push({ label: "Cena", pts: 5, max: 5, ok: true }); }
  else breakdown.push({ label: "Cena", pts: 0, max: 5, ok: false, hint: "Brak ceny" });

  const grade = score >= 85 ? "A" : score >= 70 ? "B" : score >= 50 ? "C" : "D";
  return { score, grade, breakdown };
}

export function scoreProducts(products) {
  return products.map(p => ({ ...p, quality: scoreProduct(p) }));
}