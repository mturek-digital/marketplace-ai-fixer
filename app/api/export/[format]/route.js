"use client";
import { useState } from "react";
import TitleModal from "./TitleModal";

function ScorePill({ product }) {
  const [pos, setPos]   = useState({ x: 0, y: 0 });
  const [show, setShow] = useState(false);
  const q = product.quality;
  const barColor   = q.grade === "A" ? "#16a34a" : q.grade === "B" ? "#15803d" : q.grade === "C" ? "#d97706" : "#dc2626";
  const gradeColor = q.grade === "A" || q.grade === "B" ? "text-green-700" : q.grade === "C" ? "text-amber-600" : "text-red-600";

  return (
    <>
      <div
        className="inline-flex items-center gap-1.5 px-2 py-1 border border-neutral-200 cursor-pointer hover:border-neutral-900 hover:bg-neutral-50 transition-colors whitespace-nowrap"
        onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}
        onMouseMove={(e) => setPos({ x: e.clientX, y: e.clientY })}
      >
        <span className={`font-mono text-sm font-bold ${gradeColor}`}>{q.grade}</span>
        <div className="w-8 h-0.5 bg-neutral-200 overflow-hidden">
          <div className="h-full" style={{ width: `${q.score}%`, background: barColor }} />
        </div>
        <span className="font-mono text-xs text-neutral-400">{q.score}</span>
      </div>
      {show && (
        <div className="fixed z-50 bg-neutral-900 text-white border border-neutral-900 p-3.5 w-52 pointer-events-none text-xs"
          style={{ left: Math.min(pos.x + 14, window.innerWidth - 220), top: Math.min(pos.y - 10, window.innerHeight - 200) }}>
          <div className="font-bold tracking-widest uppercase text-neutral-400 mb-2.5 text-[10px]">Jakość · {q.score}/100</div>
          {q.breakdown.map((b) => (
            <div key={b.label} className="flex items-center gap-2 mb-1.5">
              <span className="text-white/80 w-12 flex-shrink-0">{b.label}</span>
              <div className="flex-1 h-0.5 bg-white/20 overflow-hidden">
                <div className="h-full" style={{ width: `${Math.round((b.pts/b.max)*100)}%`, background: b.ok ? "#4ade80" : "#f87171" }} />
              </div>
              <span className="font-mono text-white/50 text-[10px] whitespace-nowrap">{b.pts}/{b.max}</span>
            </div>
          ))}
          {q.breakdown.filter(b => !b.ok && b.hint).length > 0 && (
            <div className="mt-2 pt-2 border-t border-white/20 font-mono text-[10px] text-amber-300 leading-relaxed">
              {q.breakdown.filter(b => !b.ok && b.hint).map(b => b.hint).join("\n")}
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default function ProductTable({ products, onUpdateProduct, onExport }) {
  const [sortKey, setSortKey]           = useState(null);
  const [sortDir, setSortDir]           = useState(null);
  const [editing, setEditing]           = useState(null);
  const [showDupsOnly, setShowDupsOnly] = useState(false);

  const handleSort = (key) => {
    if (sortKey === key) {
      const next = sortDir === "asc" ? "desc" : sortDir === "desc" ? null : "asc";
      setSortDir(next);
      if (!next) setSortKey(null);
    } else { setSortKey(key); setSortDir("asc"); }
  };

  const filtered = showDupsOnly ? products.filter(p => p.isDuplicate) : products;
  const sorted   = [...filtered].sort((a, b) => {
    if (!sortKey || !sortDir) return 0;
    const av = sortKey === "score" ? a.quality.score : a[sortKey] ?? "";
    const bv = sortKey === "score" ? b.quality.score : b[sortKey] ?? "";
    const cmp = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv), "pl");
    return sortDir === "asc" ? cmp : -cmp;
  });

  const dupCount = products.filter(p => p.isDuplicate).length;
  const cols = [
    { key: "sku", label: "SKU" }, { key: "allegroTitle", label: "Tytuł Allegro" },
    { key: null, label: "Opis" }, { key: "dimensions", label: "Wymiary" },
    { key: "color", label: "Kolor" }, { key: "price", label: "Cena" },
    { key: "stock", label: "Stan" }, { key: null, label: "EAN" }, { key: "score", label: "Jakość" },
  ];

  const SortIcon = ({ col }) => {
    if (!col) return null;
    if (sortKey !== col) return <span className="ml-1 opacity-40 text-[9px]">↕</span>;
    return <span className="ml-1 text-[9px]">{sortDir === "asc" ? "↑" : "↓"}</span>;
  };

  return (
    <>
      {/* Actions bar */}
      <div className="flex items-center justify-between py-2.5 border-b border-neutral-200 flex-shrink-0 gap-3">
        <div className="flex gap-2">
          {["csv", "xlsx"].map(fmt => (
            <button key={fmt} onClick={() => onExport(fmt)}
              className="px-3 py-1.5 bg-neutral-900 text-white text-xs font-bold tracking-widest uppercase flex items-center gap-1.5 hover:opacity-80 transition-opacity border border-neutral-900">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"/>
              </svg>
              Pobierz {fmt.toUpperCase()}
            </button>
          ))}
        </div>

        {dupCount > 0 && (
          <button onClick={() => setShowDupsOnly(!showDupsOnly)}
            className={`px-3 py-1.5 text-xs font-bold tracking-widest uppercase flex items-center gap-1.5 border transition-colors
              ${showDupsOnly ? "bg-amber-500 border-amber-500 text-white" : "border-amber-400 text-amber-700 hover:bg-amber-50"}`}>
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            </svg>
            {showDupsOnly ? "Pokaż wszystkie" : `Tylko duplikaty (${dupCount})`}
          </button>
        )}
      </div>

      {/* Table */}
      <div className="border border-t-0 border-neutral-200 overflow-auto flex-1">
        <table className="w-full text-xs border-collapse">
          <thead className="sticky top-0 z-10">
            <tr>
              {cols.map(({ key, label }) => (
                <th key={label} onClick={() => key && handleSort(key)}
                  className={`bg-neutral-900 text-white px-3 py-2.5 text-left font-bold tracking-widest uppercase text-[10px] whitespace-nowrap border-r border-white/10 last:border-r-0 ${key ? "cursor-pointer hover:bg-neutral-800" : ""}`}>
                  {label}<SortIcon col={key} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((p, rowIdx) => {
              const realIdx  = products.indexOf(p);
              const titleLen = (p.allegroTitle || "").length;
              const stockCls = p.stock === 0 ? "border-red-500 text-red-600" : p.stock <= 5 ? "border-amber-500 text-amber-600" : "border-green-600 text-green-700";
              const stockLbl = p.stock === 0 ? "Brak" : p.stock >= 99 ? "99" : p.stock;
              const isDup    = p.isDuplicate;
              const even     = rowIdx % 2 === 0;

              return (
                <tr key={p.sku + rowIdx}
                  className={`border-b border-neutral-200 last:border-b-0 transition-colors
                    ${isDup ? "bg-amber-50 hover:bg-amber-100" : even ? "bg-white hover:bg-neutral-100" : "bg-neutral-50 hover:bg-neutral-100"}`}>
                  <td className="px-3 py-2 border-r border-neutral-200 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      {isDup && (
                        <svg className="w-3 h-3 text-amber-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                        </svg>
                      )}
                      <span className="font-mono text-neutral-500">{p.sku}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 border-r border-neutral-200 max-w-[220px]">
                    <div className="font-medium leading-snug mb-1 truncate" title={p.allegroTitle}>{p.allegroTitle || "—"}</div>
                    <div className="flex items-center gap-1.5">
                      <span className={`font-mono text-[10px] px-1 border ${titleLen > 75 ? "border-red-500 text-red-600" : "border-green-600 text-green-700"}`}>{titleLen}/75</span>
                      <button onClick={() => setEditing(realIdx)}
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 border border-neutral-300 text-[10px] font-bold tracking-wider uppercase text-neutral-500 hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition-colors">
                        <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"/>
                        </svg>
                        Edytuj
                      </button>
                    </div>
                  </td>
                  <td className="px-3 py-2 border-r border-neutral-200 max-w-[160px] text-neutral-500 text-[11px] leading-snug">
                    {(p.description || "").slice(0, 75)}{(p.description||"").length > 75 ? "…" : ""}
                  </td>
                  <td className="px-3 py-2 border-r border-neutral-200 font-mono text-neutral-500 whitespace-nowrap">{p.dimensions || "—"}</td>
                  <td className="px-3 py-2 border-r border-neutral-200">
                    {p.color ? <span className="px-2 py-0.5 border border-neutral-200 bg-white text-[11px] whitespace-nowrap">{p.color}</span> : "—"}
                  </td>
                  <td className="px-3 py-2 border-r border-neutral-200 font-mono font-semibold whitespace-nowrap">{p.price ? `${p.price} PLN` : "—"}</td>
                  <td className="px-3 py-2 border-r border-neutral-200">
                    <span className={`inline-flex items-center px-2 py-0.5 border font-mono font-semibold text-[11px] ${stockCls}`}>{stockLbl}</span>
                  </td>
                  <td className="px-3 py-2 border-r border-neutral-200 font-mono text-[11px] text-neutral-400">{p.ean || <span className="italic">—</span>}</td>
                  <td className="px-3 py-2"><ScorePill product={p} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between py-2 font-mono text-[10px] text-neutral-400 tracking-wider border-t border-neutral-200 flex-shrink-0">
        <span>Wyświetlono {sorted.length} z {products.length} produktów</span>
        {showDupsOnly && <span className="text-amber-600">Filtr: tylko duplikaty</span>}
      </div>

      {editing !== null && (
        <TitleModal product={products[editing]} index={editing}
          onSave={(idx, title) => { onUpdateProduct(idx, title); setEditing(null); }}
          onClose={() => setEditing(null)} />
      )}
    </>
  );
}