import ExcelJS from "exceljs";

const COLUMNS = [
  { header: "ID",               key: "id",           width: 6  },
  { header: "SKU",              key: "sku",          width: 18 },
  { header: "Tytuł Allegro",    key: "allegroTitle", width: 40 },
  { header: "Opis",             key: "description",  width: 60 },
  { header: "Wymiary",          key: "dimensions",   width: 18 },
  { header: "Kolor",            key: "color",        width: 16 },
  { header: "Cena (PLN)",       key: "price",        width: 14 },
  { header: "Stan magazynowy",  key: "stock",        width: 18 },
  { header: "EAN",              key: "ean",          width: 16 },
  { header: "Nazwa oryginalna", key: "originalName", width: 44 },
];

export async function generateXlsx(products) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "vAutomate AI-Fixer";
  workbook.created = new Date();
  const sheet = workbook.addWorksheet("Produkty", { views: [{ state: "frozen", ySplit: 1 }] });
  sheet.columns = COLUMNS;

  const headerRow = sheet.getRow(1);
  headerRow.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0A0A0A" } };
    cell.font = { color: { argb: "FFFAFAFA" }, bold: true, size: 11 };
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });
  headerRow.height = 28;

  products.forEach((product, idx) => {
    const row = sheet.addRow(product);
    row.height = 20;
    if (idx % 2 === 0) row.eachCell((cell) => { cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF5F5F5" } }; });
    if (product.stock === 0) row.getCell("stock").font = { color: { argb: "FFDC2626" }, bold: true };
    if ((product.allegroTitle || "").length > 75) row.getCell("allegroTitle").font = { color: { argb: "FFDC2626" } };
  });

  sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: COLUMNS.length } };
  return workbook.xlsx.writeBuffer();
}

export function generateCsv(products) {
  const headers = COLUMNS.map(c => `"${c.header}"`).join(";");
  const rows    = products.map(p => COLUMNS.map(({ key }) => `"${String(p[key] ?? "").replace(/"/g, '""')}"`).join(";"));
  return "\uFEFF" + [headers, ...rows].join("\r\n");
}