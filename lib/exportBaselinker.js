const BL_COLUMNS = [
  { header: "sku",                key: "sku" },
  { header: "ean",                key: "ean" },
  { header: "name",               key: "allegroTitle" },
  { header: "price_netto",        key: "price" },
  { header: "quantity",           key: "stock" },
  { header: "description",        key: "description" },
  { header: "weight",             key: "_empty" },
  { header: "category",           key: "_category" },
  { header: "manufacturer",       key: "_empty" },
  { header: "manufacturer_sku",   key: "sku" },
  { header: "additional_field_1", key: "dimensions" },
  { header: "additional_field_2", key: "color" },
  { header: "additional_field_3", key: "originalName" },
];

export function generateBaselinkerCsv(products) {
  const headers = BL_COLUMNS.map(c => `"${c.header}"`).join(";");
  const rows = products.map(p =>
    BL_COLUMNS.map(({ key }) => {
      if (key === "_empty")    return `""`;
      if (key === "_category") return `"Dywany i maty"`;
      const val = p[key] ?? "";
      const str = key === "stock" && val >= 99 ? "99" : String(val);
      return `"${str.replace(/"/g, '""')}"`;
    }).join(";")
  );
  return "\uFEFF" + [headers, ...rows].join("\r\n");
}