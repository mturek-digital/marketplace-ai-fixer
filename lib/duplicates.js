function normalizeName(name) {
  return name
    .toLowerCase()
    .replace(/\d+\s*[x*×]\s*\d+\s*(cm|mm)?/gi, "")
    .replace(/[^a-ząćęłńóśźż\s]/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function detectDuplicates(products) {
  const eanGroups  = {};
  const nameGroups = {};

  products.forEach((p, i) => {
    if (p.ean) {
      if (!eanGroups[p.ean]) eanGroups[p.ean] = [];
      eanGroups[p.ean].push(i);
    }
    const norm = normalizeName(p.originalName || "");
    if (norm) {
      if (!nameGroups[norm]) nameGroups[norm] = [];
      nameGroups[norm].push(i);
    }
  });

  const eanDuplicates = Object.entries(eanGroups)
    .filter(([, indices]) => indices.length > 1)
    .map(([ean, indices]) => ({ type: "ean", ean, indices }));

  const nameDuplicates = Object.entries(nameGroups)
    .filter(([, indices]) => indices.length > 1)
    .map(([, indices]) => ({ type: "name", indices, similarity: 100 }));

  const filteredNameDups = nameDuplicates.filter((nd) =>
    !eanDuplicates.some((ed) => nd.indices.every((i) => ed.indices.includes(i)))
  );

  const allDups = [...eanDuplicates, ...filteredNameDups];

  const flaggedIndices = [...new Set(allDups.flatMap((d) => d.indices))];

  return {
    ean:   eanDuplicates,
    name:  filteredNameDups,
    total: allDups.length,
    flaggedIndices, 
  };
}