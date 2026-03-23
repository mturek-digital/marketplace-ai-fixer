"use client";
import { useState, useEffect } from "react";
import UploadZone from "@/components/UploadZone";
import StatsGrid from "@/components/StatsGrid";
import ProductTable from "@/components/ProductTable";
import DuplicatesAlert from "@/components/DuplicatesAlert";
import { scoreProduct } from "@/lib/scorer";

const STORAGE_KEY  = "vautomate_products";
const FILENAME_KEY = "vautomate_filename";

function calcStats(products) {
  return {
    total:          products.length,
    withEan:        products.filter(p => p.ean).length,
    outOfStock:     products.filter(p => p.stock === 0).length,
    withDimensions: products.filter(p => p.dimensions).length,
    avgScore:       Math.round(products.reduce((s, p) => s + p.quality.score, 0) / products.length),
    duplicates:     products.filter(p => p.isDuplicate).length,
  };
}

export default function Home() {
  const [view, setView]           = useState("upload");
  const [products, setProducts]   = useState([]);
  const [stats, setStats]         = useState(null);
  const [duplicates, setDuplicates] = useState(null);
  const [fileName, setFileName]   = useState("");
  const [loadStep, setLoadStep]   = useState("");
  const [loadPct, setLoadPct]     = useState(0);
  const [toast, setToast]         = useState(null);
  const [statusMsg, setStatusMsg] = useState(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const name  = localStorage.getItem(FILENAME_KEY);
      if (saved) {
        const prods = JSON.parse(saved);
        if (prods.length) {
          setProducts(prods);
          setStats(calcStats(prods));
          setFileName(name || "");
          setStatusMsg({ type: "ok", text: `Przywrócono sesję: ${name} — ${prods.length} produktów` });
          setView("products");
        }
      }
    } catch {}
  }, []);

  const showToast = (msg, type = "") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const animateProgress = () => {
    const steps = [
      { pct: 20, text: "Parsowanie JSON..." },
      { pct: 45, text: "Normalizacja wymiarów i kolorów..." },
      { pct: 70, text: "Czyszczenie opisów..." },
      { pct: 88, text: "Generowanie tytułów Allegro (OpenAI) + wykrywanie duplikatów..." },
    ];
    let i = 0;
    const tick = setInterval(() => {
      if (i >= steps.length) { clearInterval(tick); return; }
      setLoadPct(steps[i].pct);
      setLoadStep(steps[i].text);
      i++;
    }, 600);
  };

  const handleFile = async (file) => {
    if (!file.name.endsWith(".json")) { showToast("Tylko pliki .json są obsługiwane", "error"); return; }
    if (file.size > 5 * 1024 * 1024)  { showToast("Plik przekracza limit 5MB", "error"); return; }

    try {
      const preview = JSON.parse(await file.text());
      if (!Array.isArray(preview))    { showToast("Plik musi zawierać tablicę produktów", "error"); return; }
      if (preview.length === 0)        { showToast("Plik nie zawiera żadnych produktów", "error"); return; }
      if (preview.length > 500)        { showToast("Limit to 500 produktów", "error"); return; }
    } catch { showToast("Nieprawidłowy format JSON", "error"); return; }

    setFileName(file.name);
    setView("loading");
    setLoadPct(0);
    animateProgress();

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res  = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Błąd serwera");

      setProducts(data.products);
      setStats(data.stats);
      setDuplicates(data.duplicates);
      setStatusMsg({ type: "ok", text: `Wczytano: ${file.name} — ${data.products.length} produktów` });
      setView("products");

      const msg = data.stats.duplicates > 0
        ? `Przetworzono ${data.products.length} produktów · ${data.stats.duplicates} duplikatów`
        : `Przetworzono ${data.products.length} produktów`;
      showToast(msg, data.stats.duplicates > 0 ? "" : "success");

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data.products));
        localStorage.setItem(FILENAME_KEY, file.name);
      } catch {}
    } catch (err) {
      setView("upload");
      setStatusMsg({ type: "error", text: err.message });
    }
  };

  const handleUpdateProduct = (idx, newTitle) => {
    const updated = products.map((p, i) =>
      i === idx ? { ...p, allegroTitle: newTitle, quality: scoreProduct({ ...p, allegroTitle: newTitle }) } : p
    );
    setProducts(updated);
    setStats(calcStats(updated));
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
    showToast("Tytuł zaktualizowany", "success");
  };

  const handleExport = async (format) => {
    try {
      const res = await fetch(`/api/export/${format}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products }),
      });
      if (!res.ok) throw new Error("Błąd eksportu");
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      const date = new Date().toISOString().slice(0, 10);
      a.href     = url;
      a.download = `produkty_${date}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      showToast(`Pobrano .${format.toUpperCase()}`, "success");
    } catch (err) { showToast(err.message, "error"); }
  };

  const handleClear = () => {
    setProducts([]); setStats(null); setDuplicates(null);
    setFileName(""); setStatusMsg(null); setView("upload");
    try { localStorage.removeItem(STORAGE_KEY); localStorage.removeItem(FILENAME_KEY); } catch {}
  };

  const navItems = [
    { id: "upload",   label: "Import",   icon: <path d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/> },
    { id: "products", label: "Produkty", icon: <path d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"/> },
  ];

  const activeView = view === "loading" ? "upload" : view;

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50">
    
      <aside className="w-[200px] flex-shrink-0 bg-white border-r border-neutral-200 flex flex-col">
        <div className="flex items-center gap-2 px-4 py-5 border-b border-neutral-200">
          <span className="w-6 h-6 bg-neutral-900 text-white flex items-center justify-center font-mono text-sm font-bold flex-shrink-0">v</span>
          <span className="text-sm text-neutral-500">AI-<strong className="text-neutral-900 font-bold">Fixer</strong></span>
        </div>
        <nav className="flex-1 p-2.5 flex flex-col gap-0.5">
          {navItems.map(({ id, label, icon }) => (
            <button key={id}
              disabled={id === "products" && !products.length}
              onClick={() => { if (id === "products" && !products.length) return; setView(id); }}
              className={`flex items-center gap-2.5 px-2.5 py-2 text-xs font-bold tracking-widest uppercase transition-colors border
                ${activeView === id
                  ? "bg-neutral-900 text-white border-neutral-900"
                  : "text-neutral-500 border-transparent hover:bg-neutral-50 hover:text-neutral-900 disabled:opacity-30 disabled:cursor-not-allowed"}`}
            >
              <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">{icon}</svg>
              {label}
            </button>
          ))}
        </nav>
        
      </aside>

      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-start justify-between px-7 py-5 border-b-2 border-neutral-900 bg-white flex-shrink-0">
          <div>
            <h1 className="text-sm font-bold tracking-widest uppercase text-neutral-900">
              {activeView === "products" ? "Produkty" : "Przetwarzanie danych produktów"}
            </h1>
            <p className="font-mono text-xs text-neutral-400 mt-0.5 tracking-wider">
              {activeView === "products"
                ? `${products.length} produktów po przetworzeniu`
                : "Panel AI-Fixer — czyszczenie i normalizacja eksportu partnera"}
            </p>
          </div>
          {activeView === "products" && (
            <div className="flex gap-2">
              <button onClick={() => handleExport("csv")}
                className="px-3 py-2 border border-neutral-400 text-xs font-bold tracking-widest uppercase flex items-center gap-1.5 hover:bg-neutral-50 transition-colors">
                CSV
              </button>
              <button onClick={() => handleExport("xlsx")}
                className="px-3 py-2 border border-neutral-400 text-xs font-bold tracking-widest uppercase flex items-center gap-1.5 hover:bg-neutral-50 transition-colors">
                XLSX
              </button>

            </div>
          )}
        </header>

        <div className="flex-1 overflow-y-auto p-7 flex flex-col">
        
          {view === "upload" && (
            <div className="flex flex-col gap-0">
              <UploadZone onFile={handleFile} />
              {statusMsg && (
                <div className={`max-w-2xl flex items-center justify-between px-3 py-2 border border-t-0 font-mono text-xs
                  ${statusMsg.type === "error" ? "border-neutral-900 text-red-600" : "border-neutral-200 text-neutral-600"}`}>
                  <span>{statusMsg.type === "ok" ? "✓ " : "✗ "}{statusMsg.text}</span>
                  <button onClick={handleClear} className="text-neutral-400 hover:text-neutral-900 ml-3">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                </div>
              )}
            </div>
          )}

          {view === "loading" && (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <div className="w-8 h-8 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
              <p className="text-sm font-bold tracking-widest uppercase">Przetwarzam dane</p>
              <p className="font-mono text-xs text-neutral-400">{loadStep}</p>
              <div className="w-52 h-0.5 bg-neutral-200 overflow-hidden mt-1">
                <div className="h-full bg-neutral-900 transition-all duration-500" style={{ width: `${loadPct}%` }} />
              </div>
            </div>
          )}

          {view === "products" && stats && (
            <div className="flex flex-col flex-1 gap-0 overflow-hidden">
              <StatsGrid stats={stats} />
              <DuplicatesAlert duplicates={duplicates} products={products} />
              <ProductTable
                products={products}
                onUpdateProduct={handleUpdateProduct}
                onExport={handleExport}
              />
            </div>
          )}
        </div>
      </div>

  
      {toast && (
        <div className={`fixed bottom-5 right-5 px-4 py-2.5 font-mono text-xs font-bold tracking-wider z-50 border shadow-[4px_4px_0_rgba(0,0,0,0.15)]
          ${toast.type === "error"   ? "bg-red-600 border-red-600 text-white"
          : toast.type === "success" ? "bg-green-700 border-green-700 text-white"
          : "bg-neutral-900 border-neutral-900 text-white"}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}