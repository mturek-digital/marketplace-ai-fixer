"use client";
import { useState } from "react";

export default function DuplicatesAlert({ duplicates, products }) {
  const [open, setOpen] = useState(true);
  if (!duplicates || (duplicates.ean.length === 0 && duplicates.name.length === 0)) return null;
  if (!open) return null;
  const total = duplicates.ean.length + duplicates.name.length;

  return (
    <div className="border-2 border-amber-500 bg-amber-50 p-4 flex-shrink-0">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
          </svg>
          <div>
            <p className="text-xs font-bold tracking-widest uppercase text-amber-800 mb-2">
              Wykryto {total} {total === 1 ? "duplikat" : "duplikaty/ów"} — sprawdź przed eksportem
            </p>
            {duplicates.ean.length > 0 && (
              <div className="mb-2">
                <p className="text-xs font-bold text-amber-700 mb-1">Identyczny EAN:</p>
                {duplicates.ean.map((d, i) => (
                  <div key={i} className="text-xs font-mono text-amber-700 mb-0.5">
                    EAN <span className="font-bold">{d.ean}</span> → {d.indices.map(idx => products[idx]?.sku).join(", ")}
                  </div>
                ))}
              </div>
            )}
            {duplicates.name.length > 0 && (
              <div>
                <p className="text-xs font-bold text-amber-700 mb-1">Podobna nazwa:</p>
                {duplicates.name.map((d, i) => (
                  <div key={i} className="text-xs font-mono text-amber-700 mb-0.5">
                    <span className="font-bold">{d.similarity}%</span> podobieństwo → {d.indices.map(idx => products[idx]?.sku).join(" ≈ ")}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <button onClick={() => setOpen(false)} className="text-amber-500 hover:text-amber-800 flex-shrink-0">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
    </div>
  );
}