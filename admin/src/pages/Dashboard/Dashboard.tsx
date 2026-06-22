import React, { useEffect, useState } from "react";
import api from "../../lib/axios";
import DatePicker from "react-datepicker";
import {
  Calendar, ShoppingCart, Package, TrendingUp, Clock,
  RefreshCw, DollarSign, ArrowDownLeft, ChevronDown
} from "lucide-react";
import { createPortal } from "react-dom";
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, Tooltip, Legend, Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend, Filler);

// ─── Types ───────────────────────────────────────────────
interface TrendPoint  { date: string; amount: number }
interface ProfitPoint { date: string; profit: number }
interface ReturnItem  { name: string; value: number }
interface DashboardData {
  cards: {
    totalSale: number; totalPurchase: number; totalProfit: number;
    totalSaleDue: number; totalPurchaseDue: number; totalSaleReturn: number;
    totalPurchaseReturn: number; totalSalePaid: number; totalPurchasePaid: number;
  };
  overview: {
    sale:           { count: number; total_amount: number; total_paid: number; total_due: number; total_qty: number; total_discount: number };
    purchase:       { count: number; total_amount: number; total_paid: number; total_due: number; total_qty: number; total_discount: number };
    saleReturn:     { count: number; total_amount: number; total_paid: number; total_qty: number };
    purchaseReturn: { count: number; total_amount: number; total_paid: number; total_qty: number };
  };
  charts: {
    salesTrend:       TrendPoint[];
    purchaseTrend:    TrendPoint[];
    profitTrend:      ProfitPoint[];
    returnsBreakdown: ReturnItem[];
    saleVsPurchase:   { date: string; sale: number; purchase: number }[];
  };
}

// ─── Preset ranges ───────────────────────────────────────
type PresetKey = "today" | "this_week" | "last_week" | "this_month" | "last_month" | "this_year" | "custom";

interface Preset { label: string; key: PresetKey }

const PRESETS: Preset[] = [
  { label: "Today",       key: "today"      },
  { label: "This week",   key: "this_week"  },
  { label: "Last week",   key: "last_week"  },
  { label: "This month",  key: "this_month" },
  { label: "Last month",  key: "last_month" },
  { label: "This year",   key: "this_year"  },
  { label: "Custom",      key: "custom"     },
];

const getPresetDates = (key: PresetKey): { from: Date; to: Date } => {
  const now   = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (key) {
    case "today":
      return { from: today, to: today };

    case "this_week": {
      const day = today.getDay(); // 0=Sun
      const mon = new Date(today); mon.setDate(today.getDate() - ((day + 6) % 7));
      const sun = new Date(mon);   sun.setDate(mon.getDate() + 6);
      return { from: mon, to: sun };
    }
    case "last_week": {
      const day = today.getDay();
      const thisMon = new Date(today); thisMon.setDate(today.getDate() - ((day + 6) % 7));
      const lastMon = new Date(thisMon); lastMon.setDate(thisMon.getDate() - 7);
      const lastSun = new Date(lastMon); lastSun.setDate(lastMon.getDate() + 6);
      return { from: lastMon, to: lastSun };
    }
    case "this_month":
      return {
        from: new Date(now.getFullYear(), now.getMonth(), 1),
        to:   new Date(now.getFullYear(), now.getMonth() + 1, 0),
      };
    case "last_month":
      return {
        from: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        to:   new Date(now.getFullYear(), now.getMonth(), 0),
      };
    case "this_year":
      return {
        from: new Date(now.getFullYear(), 0, 1),
        to:   new Date(now.getFullYear(), 11, 31),
      };
    default:
      return { from: today, to: today };
  }
};

// ─── Helpers ─────────────────────────────────────────────
const fmt = (n: number) =>
  "৳" + Math.abs(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });

const pct = (a: number, b: number) =>
  b === 0 ? 0 : Math.round((a / b) * 100);

// ─── StatCard ─────────────────────────────────────────────
interface StatCardProps {
  label: string; value: number; sub?: string;
  icon: React.ReactNode; variant?: "default" | "danger" | "success" | "warning";
}
const StatCard = ({ label, value, sub, icon, variant = "default" }: StatCardProps) => {
  const colorMap = {
    default: "text-gray-900 dark:text-white",
    danger:  "text-red-600 dark:text-red-400",
    success: "text-green-600 dark:text-green-400",
    warning: "text-amber-600 dark:text-amber-400",
  };
  return (
    <div className="bg-gray-50 dark:bg-zinc-800 rounded-lg p-4 flex flex-col gap-1">
      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-zinc-400">
        {icon}{label}
      </div>
      <div className={`text-xl font-medium ${colorMap[variant]}`}>
        {value < 0 ? "-" : ""}{ fmt(value)}
      </div>
      {sub && <div className="text-xs text-gray-400 dark:text-zinc-500">{sub}</div>}
    </div>
  );
};

// ─── MiniBar ──────────────────────────────────────────────
interface MiniBarProps {
  label: string; value: number; max: number; color: string; formatted?: string;
}
const MiniBar = ({ label, value, max, color, formatted }: MiniBarProps) => (
  <div className="flex items-center gap-2 text-xs mb-2">
    <div className="w-28 text-gray-500 dark:text-zinc-400 truncate shrink-0">{label}</div>
    <div className="flex-1 bg-gray-100 dark:bg-zinc-700 rounded h-2 overflow-hidden">
      <div className="h-full rounded" style={{ width: `${Math.round((value / max) * 100)}%`, background: color }} />
    </div>
    <div className="w-16 text-right font-medium text-gray-700 dark:text-zinc-200">{formatted ?? fmt(value)}</div>
  </div>
);

// ─── Dashboard ────────────────────────────────────────────
const Dashboard = () => {
  const [report,  setReport]  = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [preset,  setPreset]  = useState<PresetKey>("this_month");
  const [dropOpen, setDropOpen] = useState(false);

  const initDates = getPresetDates("this_month");
  const [fromDate, setFromDate] = useState<Date>(initDates.from);
  const [toDate,   setToDate]   = useState<Date>(initDates.to);

  const applyPreset = (key: PresetKey) => {
    setPreset(key);
    setDropOpen(false);
    if (key !== "custom") {
      const { from, to } = getPresetDates(key);
      setFromDate(from);
      setToDate(to);
    }
  };

  const fetchReport = async (from: Date, to: Date) => {
    setLoading(true);
    try {
      const res = await api("report/dashboard", { params: { fromDate: from, toDate: to } });
      if (res.data.success) setReport(res.data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReport(fromDate, toDate); }, [fromDate, toDate]);

  // ─── Chart ───────────────────────────────────────────
  const buildChartData = () => {
    if (!report) return null;
    const { salesTrend, purchaseTrend, profitTrend } = report.charts;
    const allDates = [...new Set([
      ...salesTrend.map(x => x.date),
      ...purchaseTrend.map(x => x.date),
      ...profitTrend.map(x => x.date),
    ])].sort();
    const sMap  = Object.fromEntries(salesTrend.map(x   => [x.date, x.amount]));
    const pMap  = Object.fromEntries(purchaseTrend.map(x => [x.date, x.amount]));
    const prMap = Object.fromEntries(profitTrend.map(x   => [x.date, x.profit]));
    return {
      labels: allDates.map(d => d.slice(5)),
      datasets: [
        { label: "Sale",         data: allDates.map(d => sMap[d]  ?? null), borderColor: "#378ADD", backgroundColor: "rgba(55,138,221,0.08)",  tension: 0.3, spanGaps: false, pointRadius: 4, borderWidth: 2, fill: true },
        { label: "Purchase",     data: allDates.map(d => pMap[d]  ?? null), borderColor: "#1D9E75", backgroundColor: "rgba(29,158,117,0.06)",   tension: 0.3, spanGaps: false, pointRadius: 4, borderWidth: 2, fill: true },
        { label: "Profit / Loss",data: allDates.map(d => prMap[d] ?? null), borderColor: "#D85A30", backgroundColor: "rgba(216,90,48,0.05)",    tension: 0.3, spanGaps: false, pointRadius: 4, borderWidth: 2, borderDash: [4, 3] },
      ],
    };
  };

  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx: any) => `${ctx.dataset.label}: ৳${ctx.parsed.y?.toLocaleString("en-IN") ?? "—"}` } },
    },
    scales: {
      x: { ticks: { font: { size: 11 }, maxRotation: 45, autoSkip: true, maxTicksLimit: 14 }, grid: { display: false } },
      y: { ticks: { callback: (v: any) => "৳" + (Math.abs(v) >= 1000 ? (Math.abs(v) / 1000).toFixed(0) + "k" : v), font: { size: 11 } }, grid: { color: "rgba(128,128,128,0.1)" } },
    },
  };

  const chartData   = buildChartData();
  const c           = report?.cards;
  const o           = report?.overview;
  const topSaleDays = report
    ? [...report.charts.salesTrend].filter(x => x.amount > 0).sort((a, b) => b.amount - a.amount).slice(0, 5)
    : [];

  const currentPresetLabel = PRESETS.find(p => p.key === preset)?.label ?? "Custom";

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-medium">Dashboard</h1>

        <div className="flex items-end gap-2 flex-wrap">

          {/* Preset dropdown */}
          <div className="relative">
            <label className="text-xs text-gray-500 dark:text-zinc-400 block mb-1">Period</label>
            <button
              onClick={() => setDropOpen(v => !v)}
              className="global_input flex items-center gap-2 text-sm min-w-32 justify-between"
            >
              {currentPresetLabel}
              <ChevronDown size={13} className={`transition-transform ${dropOpen ? "rotate-180" : ""}`} />
            </button>
            {dropOpen && (
              <div className="absolute top-full mt-1 left-0 z-50 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg shadow-lg overflow-hidden min-w-36">
                {PRESETS.map(p => (
                  <button
                    key={p.key}
                    onClick={() => applyPreset(p.key)}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors
                      ${preset === p.key ? "text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/20" : "text-gray-700 dark:text-zinc-300"}`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Custom date pickers — only when custom */}
          {preset === "custom" && (
            <>
              {[
                { label: "From", val: fromDate, set: setFromDate },
                { label: "To",   val: toDate,   set: setToDate   },
              ].map(({ label, val, set }) => (
                <div key={label} className="relative">
                  <label className="text-xs text-gray-500 dark:text-zinc-400 block mb-1">{label}</label>
                  <div className="relative">
                    <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                    <DatePicker
                      selected={val}
                      onChange={(d: Date | null) => d && set(d)}
                      dateFormat="dd-MM-yyyy"
                      className="global_input pl-8 text-sm w-36"
                      popperPlacement="bottom-end"
                      popperContainer={p => createPortal(<div {...p} />, document.body)}
                    />
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Refresh */}
          <div className="flex items-end">
            <button
              onClick={() => fetchReport(fromDate, toDate)}
              className="global_button flex items-center gap-1.5 text-sm"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* ── Stat cards ── */}
      {c && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Total sale"       value={c.totalSale}          icon={<ShoppingCart size={13}/>}  sub={`${o?.sale.count} transactions`} />
          <StatCard label="Total purchase"   value={c.totalPurchase}      icon={<Package size={13}/>}       sub={`${o?.purchase.count} transactions`} />
          <StatCard label="Profit / Loss"    value={c.totalProfit}        icon={<TrendingUp size={13}/>}    variant={c.totalProfit >= 0 ? "success" : "danger"} sub={c.totalProfit >= 0 ? "▲ Profit" : "▼ Loss"} />
          <StatCard label="Sale due"         value={c.totalSaleDue}       icon={<Clock size={13}/>}         sub="Receivable" variant="warning" />
          <StatCard label="Sale paid"        value={c.totalSalePaid}      icon={<DollarSign size={13}/>}    sub="Collected" />
          <StatCard label="Purchase paid"    value={c.totalPurchasePaid}  icon={<DollarSign size={13}/>}    sub="Paid out" />
          <StatCard label="Sale return"      value={c.totalSaleReturn}    icon={<ArrowDownLeft size={13}/>} sub={`${o?.saleReturn.count} returns`} />
          <StatCard label="Purchase return"  value={c.totalPurchaseReturn}icon={<ArrowDownLeft size={13}/>} sub={`${o?.purchaseReturn.count} returns`} />
        </div>
      )}

      {/* ── Trend chart ── */}
      {chartData && (
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-zinc-200">Sale vs purchase trend</span>
            <div className="flex gap-4 text-xs text-gray-500 dark:text-zinc-400">
              {[
                { label: "Sale",          color: "#378ADD" },
                { label: "Purchase",      color: "#1D9E75" },
                { label: "Profit / Loss", color: "#D85A30" },
              ].map(l => (
                <span key={l.label} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: l.color }} />
                  {l.label}
                </span>
              ))}
            </div>
          </div>
          <div style={{ height: 260 }}>
            <Line data={chartData} options={chartOptions as any} />
          </div>
        </div>
      )}

      {/* ── Bottom grid ── */}
      {o && c && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Overview table */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl p-4">
            <p className="text-sm font-medium text-gray-700 dark:text-zinc-200 mb-3">Overview</p>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-400 dark:text-zinc-500 border-b border-gray-100 dark:border-zinc-800">
                  <th className="text-left pb-2 font-normal">Type</th>
                  <th className="text-right pb-2 font-normal">Count</th>
                  <th className="text-right pb-2 font-normal">Amount</th>
                  <th className="text-right pb-2 font-normal">Paid</th>
                  <th className="text-right pb-2 font-normal">Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-zinc-800">
                {[
                  { label: "Sale",          d: o.sale,           due: o.sale.total_due },
                  { label: "Purchase",      d: o.purchase,       due: o.purchase.total_due },
                  { label: "Sale return",   d: o.saleReturn,     due: null },
                  { label: "Purch. return", d: o.purchaseReturn, due: null },
                ].map(({ label, d, due }) => (
                  <tr key={label} className="text-gray-700 dark:text-zinc-300">
                    <td className="py-2">{label}</td>
                    <td className="text-right">{d.count}</td>
                    <td className="text-right">{fmt(d.total_amount)}</td>
                    <td className="text-right">{fmt(d.total_paid)}</td>
                    <td className={`text-right ${due && due > 0 ? "text-red-500" : ""}`}>
                      {due !== null ? fmt(due) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mini bars */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl p-4 space-y-5">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-zinc-200 mb-3">Payment performance</p>
              <MiniBar label="Sale collected" value={pct(c.totalSalePaid, c.totalSale)}         max={100} color="#1D9E75" formatted={`${pct(c.totalSalePaid, c.totalSale)}%`} />
              <MiniBar label="Sale due"       value={pct(c.totalSaleDue, c.totalSale)}          max={100} color="#E24B4A" formatted={`${pct(c.totalSaleDue, c.totalSale)}%`} />
              <MiniBar label="Purch. paid"    value={pct(c.totalPurchasePaid, c.totalPurchase)} max={100} color="#378ADD" formatted={`${pct(c.totalPurchasePaid, c.totalPurchase)}%`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-zinc-200 mb-3">Returns breakdown</p>
              {(() => {
                const retMax = Math.max(...report!.charts.returnsBreakdown.map(x => x.value));
                return report!.charts.returnsBreakdown.map(r => (
                  <MiniBar key={r.name} label={r.name} value={r.value} max={retMax} color="#D85A30" />
                ));
              })()}
            </div>
          </div>

          {/* Top sale days */}
          {topSaleDays.length > 0 && (
            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl p-4 sm:col-span-2">
              <p className="text-sm font-medium text-gray-700 dark:text-zinc-200 mb-3">Top sale days</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                {topSaleDays.map(d => (
                  <MiniBar key={d.date} label={d.date} value={d.amount} max={topSaleDays[0].amount} color="#378ADD" />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;