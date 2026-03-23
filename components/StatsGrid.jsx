"use client";

export default function StatsGrid({ stats }) {
  const sc = stats.avgScore;
  const scoreClass = sc >= 85 ? "text-green-700" : sc >= 60 ? "text-amber-600" : "text-red-600";
  const barColor   = sc >= 85 ? "#16a34a" : sc >= 60 ? "#d97706" : "#dc2626";
  const dups       = stats.duplicates ?? 0;

  const cards = [
    { label: "Razem produktów", value: stats.total,      cls: "text-neutral-900" },
    { label: "Z kodem EAN",     value: stats.withEan,    cls: stats.withEan < stats.total ? "text-amber-600" : "text-green-700" },
    { label: "Brak stanu",      value: stats.outOfStock, cls: stats.outOfStock > 0 ? "text-red-600" : "text-green-700" },
    { label: "Duplikaty",       value: dups,             cls: dups > 0 ? "text-amber-600" : "text-green-700" },
  ];

  return (
    <div className="grid grid-cols-5 border border-neutral-200 flex-shrink-0">
      {cards.map(({ label, value, cls }) => (
        <div key={label} className="p-4 border-r border-neutral-200">
          <div className="text-xs font-bold tracking-widest uppercase text-neutral-400 mb-2">{label}</div>
          <div className={`font-mono text-3xl font-bold ${cls}`}>{value}</div>
        </div>
      ))}
      <div className="p-4">
        <div className="text-xs font-bold tracking-widest uppercase text-neutral-400 mb-2">Jakość listingów</div>
        <div className={`font-mono text-3xl font-bold ${scoreClass}`}>
          {sc}<span className="text-sm font-normal text-neutral-400">/100</span>
        </div>
        <div className="h-1 bg-neutral-200 mt-2 overflow-hidden">
          <div className="h-full transition-all duration-500" style={{ width: `${sc}%`, background: barColor }} />
        </div>
      </div>
    </div>
  );
}