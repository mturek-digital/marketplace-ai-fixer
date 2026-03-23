const COLOR_MAP = {
  "j. szary": "Jasnoszary", "j.szary": "Jasnoszary", "jasny szary": "Jasnoszary",
  "c. szary": "Ciemnoszary", "c.szary": "Ciemnoszary", "ciemny szary": "Ciemnoszary",
  "czarny": "Czarny", "blk": "Czarny", "black": "Czarny",
  "beg": "Beżowy", "beż": "Beżowy", "bezowy": "Beżowy",
  "biały": "Biały", "white": "Biały",
  "granat": "Granatowy", "navy": "Granatowy",
  "brąz": "Brązowy", "brown": "Brązowy",
  "szary": "Szary", "grey": "Szary", "gray": "Szary",
};

function stripHtml(str) {
  return str.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\s{2,}/g, " ").trim();
}

function parseDescription(raw) {
  if (!raw) return "";
  const trimmed = raw.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      const texts = [];
      const extractText = (node) => {
        if (typeof node === "string") texts.push(node);
        else if (Array.isArray(node)) node.forEach(extractText);
        else if (typeof node === "object" && node !== null) {
          if (node.type === "TEXT" && node.content) texts.push(node.content);
          else Object.values(node).forEach(extractText);
        }
      };
      extractText(parsed);
      return texts.join(" ").replace(/\s{2,}/g, " ").trim();
    } catch {}
  }
  return stripHtml(trimmed);
}

function parseDimensions(nameOrDesc) {
  const regex = /(\d{2,4})\s*[*xX×]\s*(\d{2,4})\s*(cm|mm)?/i;
  const match = `${nameOrDesc}`.match(regex);
  if (!match) return "";
  let w = parseInt(match[1], 10), h = parseInt(match[2], 10);
  const unit = (match[3] || "").toLowerCase();
  if (unit === "mm" || (w >= 100 && h >= 100 && !unit)) { w = Math.round(w/10); h = Math.round(h/10); }
  return `${w} x ${h} cm`;
}

function parseColor(name, description) {
  const combined = `${name} ${description}`.toLowerCase();
  for (const [key, value] of Object.entries(COLOR_MAP)) {
    if (combined.includes(key.toLowerCase())) return value;
  }
  const m = combined.match(/kolor[:\s]+([a-ząćęłńóśźż\s.]+?)(?:[,.]|$)/i);
  if (m) { const raw = m[1].trim().toLowerCase(); return COLOR_MAP[raw] || capitalize(raw); }
  return "";
}

function parsePrice(raw) {
  if (!raw) return "";
  return String(raw).replace(/[^0-9.,]/g, "").replace(",", ".").trim();
}

function parseStock(raw) {
  if (typeof raw === "number") return raw;
  const str = String(raw).toLowerCase().trim();
  if (str === "dużo" || str === "duzo") return 99;
  const parsed = parseInt(str, 10);
  return isNaN(parsed) ? 0 : parsed;
}

function parseEan(raw) {
  if (!raw || String(raw).includes("BŁĄD") || String(raw).includes("ERROR")) return "";
  return String(raw).trim();
}

function capitalize(str) { return str.charAt(0).toUpperCase() + str.slice(1); }

export function cleanProducts(rawArray) {
  return rawArray.map((item, index) => {
    const name        = item["NAZWA ORG"] || "";
    const descRaw     = item["Opis ofe"] || "";
    const description = parseDescription(descRaw);
    const dimensions  = parseDimensions(name + " " + description);
    const color       = parseColor(name, description);
    const price       = parsePrice(item["Cena"]);
    const stock       = parseStock(item["Stany"]);
    const ean         = parseEan(item["EAN"]);
    return { id: index + 1, sku: item["SKU"] || "", originalName: name, description, dimensions, color, price, stock, ean, allegroTitle: "" };
  });
}