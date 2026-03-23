"use client";
import { useRef, useState } from "react";

export default function UploadZone({ onFile }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);
  const handle = (file) => { if (file) onFile(file); };

  return (
    <div className="max-w-2xl w-full">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handle(e.dataTransfer.files[0]); }}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed p-12 flex flex-col items-center gap-3 cursor-pointer transition-colors
          ${dragging ? "border-neutral-900 bg-neutral-100" : "border-neutral-400 hover:border-neutral-900 hover:bg-neutral-50"}`}
      >
        <svg className="w-10 h-10 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
          <path d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.338-2.32 5.75 5.75 0 011.344 11.096"/>
        </svg>
        <p className="text-sm font-bold tracking-widest uppercase text-neutral-900">Przeciągnij plik JSON lub kliknij, aby wybrać</p>
        <p className="text-xs text-neutral-400 font-mono">Tablica produktów lub obiekt z kluczem <code className="bg-neutral-100 px-1 border border-neutral-200">products</code></p>
        <button type="button" onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
          className="mt-1 px-4 py-2 bg-neutral-900 text-white text-xs font-bold tracking-widest uppercase flex items-center gap-2 hover:opacity-80 transition-opacity">
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/>
          </svg>
          Wgraj plik JSON
        </button>
        <input ref={inputRef} type="file" accept=".json" className="hidden" onChange={(e) => handle(e.target.files?.[0])} />
      </div>
      <div className="grid grid-cols-2 border border-t-0 border-neutral-200">
        {[
          ["Czyszczenie HTML & JSON", "Usuwa tagi, parsuje zagnieżdżone struktury"],
          ["Normalizacja wymiarów",   "040*060cm → 40 x 60 cm"],
          ["Kolory rynkowe",          "j. szary → Jasnoszary"],
          ["Tytuły Allegro AI",       "Max 75 znaków, zoptymalizowane pod SEO"],
        ].map(([label, desc], i) => (
          <div key={i} className={`p-4 flex flex-col gap-1 border-neutral-200 ${i % 2 === 0 ? "border-r" : ""} ${i < 2 ? "border-b" : ""}`}>
            <span className="text-xs font-bold tracking-widest uppercase text-neutral-900">{label}</span>
            <span className="text-xs text-neutral-400 font-mono">{desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}