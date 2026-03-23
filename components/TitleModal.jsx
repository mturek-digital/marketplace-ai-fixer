"use client";
import { useEffect, useState } from "react";
import { scoreProduct } from "@/lib/scorer";

export default function TitleModal({ product, index, onSave, onClose }) {
  const [title, setTitle] = useState(product?.allegroTitle || "");

  useEffect(() => {
    if (product) setTitle(product.allegroTitle || "");
  }, [product]);

  if (!product) return null;

  const len      = title.length;
  const barPct   = Math.min((len / 75) * 100, 100);
  const barColor = len > 75 ? "#dc2626" : len >= 50 ? "#16a34a" : "#d97706";
  const hint     = !len ? "Wpisz tytuł produktu"
    : len < 30  ? "Za krótki — dodaj więcej szczegółów"
    : len < 50  ? "Dobry start, cel to 50–75 znaków"
    : len <= 75 ? "✓ Optymalna długość"
    : `⚠ Przekroczono limit o ${len - 75} znaków`;

  const preview = scoreProduct({ ...product, allegroTitle: title });

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white border-2 border-neutral-900 w-[500px] max-w-[95vw] shadow-[8px_8px_0_#0a0a0a]">
        <div className="flex items-start justify-between p-5 border-b border-neutral-200">
          <div>
            <p className="text-xs font-bold tracking-widest uppercase">Edycja tytułu Allegro</p>
            <p className="font-mono text-xs text-neutral-400 mt-0.5">{product.sku}</p>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-900 p-0.5">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="p-5">
          <label className="block text-xs font-bold tracking-widest uppercase text-neutral-400 mb-1.5">Tytuł</label>
          <div className="relative">
            <textarea
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={75}
              rows={2}
              className={`w-full bg-neutral-50 border text-sm p-3 resize-none outline-none font-sans leading-relaxed transition-colors
                ${len > 75 ? "border-red-500" : "border-neutral-400 focus:border-neutral-900"}`}
              placeholder="Wpisz tytuł..."
            />
            <span className="absolute bottom-2 right-3 font-mono text-xs text-neutral-400">{len}/75</span>
          </div>
          <div className="h-0.5 bg-neutral-200 overflow-hidden mt-1">
            <div className="h-full transition-all duration-100" style={{ width: `${barPct}%`, background: barColor }} />
          </div>
          <p className="font-mono text-xs text-neutral-400 mt-1.5 min-h-4">{hint}</p>

          <div className="mt-5 pt-5 border-t border-neutral-200">
            <label className="block text-xs font-bold tracking-widest uppercase text-neutral-400 mb-2">Podgląd jakości</label>
            <div className="flex flex-wrap gap-1.5">
              {preview.breakdown.map((b) => (
                <span key={b.label} className={`inline-flex items-center gap-1 px-2 py-0.5 border font-mono text-xs font-semibold
                  ${b.ok ? "border-green-600 text-green-700" : "border-red-500 text-red-600"}`}>
                  {b.ok ? "✓" : "✗"} {b.label} {b.pts}/{b.max}
                </span>
              ))}
            </div>
          </div>
        </div>

  
        <div className="flex justify-end gap-2 px-5 pb-5">
          <button onClick={onClose} className="px-4 py-2 border border-neutral-400 text-xs font-bold tracking-widest uppercase hover:bg-neutral-50 transition-colors">
            Anuluj
          </button>
          <button onClick={() => onSave(index, title.trim().slice(0, 75))}
            className="px-4 py-2 bg-neutral-900 text-white text-xs font-bold tracking-widest uppercase hover:opacity-80 transition-opacity">
            Zapisz tytuł
          </button>
        </div>
      </div>
    </div>
  );
}