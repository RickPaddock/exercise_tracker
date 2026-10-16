import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Plus, Minus } from 'lucide-react';

// Simple building blocks you count in everyday portions — no exact weighing needed.
// Protein/kcal per unit are honest rough estimates; nudge the targets to suit.
const FOOD_GROUPS = [
  {
    category: 'Protein',
    items: [
      { key: 'eggs', name: 'Eggs', unit: 'per egg', protein: 6, kcal: 75 },
      { key: 'chicken', name: 'Chicken breast', unit: 'palm ~150g', protein: 45, kcal: 250 },
      { key: 'beef', name: 'Lean beef mince', unit: 'portion ~150g', protein: 38, kcal: 280 },
      { key: 'salmon', name: 'Salmon', unit: 'fillet ~150g', protein: 42, kcal: 300 },
      { key: 'yogurt', name: 'Kri Kri 0% yogurt', unit: '200g', protein: 20, kcal: 110 },
      { key: 'cottage', name: 'Cottage cheese', unit: '200g', protein: 24, kcal: 160 },
      { key: 'whey', name: 'Whey shake', unit: '1 scoop', protein: 24, kcal: 120 },
      { key: 'proteindrink', name: 'Lidl protein drink', unit: '1 bottle 330ml', protein: 35, kcal: 202 },
    ],
  },
  {
    category: 'Carbs',
    items: [
      { key: 'rice', name: 'Rice', unit: 'cooked bowl', protein: 5, kcal: 260 },
      { key: 'oats', name: 'Oats', unit: '60g dry', protein: 9, kcal: 230 },
      { key: 'banana', name: 'Banana', unit: '1', protein: 1, kcal: 105 },
    ],
  },
  {
    category: 'Veg & fruit',
    items: [
      { key: 'veg', name: 'Veg', unit: 'big serving', protein: 3, kcal: 50 },
      { key: 'berries', name: 'Blueberries', unit: 'handful', protein: 0, kcal: 40 },
    ],
  },
  {
    category: 'Fats & extras',
    items: [
      { key: 'avocado', name: 'Avocado', unit: 'half', protein: 2, kcal: 160 },
      { key: 'pb', name: 'Peanut butter', unit: '1 tbsp', protein: 4, kcal: 95 },
      { key: 'oliveoil', name: 'Olive oil', unit: '1 tbsp', protein: 0, kcal: 120 },
      { key: 'feta', name: 'Feta', unit: 'small', protein: 5, kcal: 70 },
    ],
  },
];

const FOOD_BY_KEY = {};
FOOD_GROUPS.forEach((g) => g.items.forEach((i) => { FOOD_BY_KEY[i.key] = i; }));

const toIso = (d) => d.toISOString().split('T')[0];
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

// A day is { items: {foodKey: qty}, custom: [{id,name,protein,kcal}] }.
const normalizeDay = (raw) => {
  if (!raw) return { items: {}, custom: [] };
  if (Array.isArray(raw)) return { items: {}, custom: raw }; // migrate old format
  return { items: raw.items || {}, custom: Array.isArray(raw.custom) ? raw.custom : [] };
};

export default function NutritionTracker() {
  const [date, setDate] = useState(() => toIso(new Date()));
  const [log, setLog] = useState(() => {
    try { return JSON.parse(localStorage.getItem('nutri_log')) || {}; } catch (e) { return {}; }
  });
  const [targets, setTargets] = useState(() => {
    try { return JSON.parse(localStorage.getItem('nutri_targets')) || { protein: 150, kcal: 2050 }; } catch (e) { return { protein: 150, kcal: 2050 }; }
  });
  const [custom, setCustom] = useState({ name: '', protein: '', kcal: '' });
  const [showTargets, setShowTargets] = useState(false);
  const [navH, setNavH] = useState(64);

  // Measure the app's top nav so the totals card can stick just below it.
  useEffect(() => {
    const measure = () => { const n = document.querySelector('nav'); if (n) setNavH(Math.round(n.getBoundingClientRect().height)); };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  useEffect(() => { try { localStorage.setItem('nutri_log', JSON.stringify(log)); } catch (e) {} }, [log]);
  useEffect(() => { try { localStorage.setItem('nutri_targets', JSON.stringify(targets)); } catch (e) {} }, [targets]);

  const day = normalizeDay(log[date]);
  const items = day.items;
  const customs = day.custom;

  let totalP = 0;
  let totalK = 0;
  Object.keys(items).forEach((k) => {
    const f = FOOD_BY_KEY[k];
    if (f && items[k] > 0) { totalP += f.protein * items[k]; totalK += f.kcal * items[k]; }
  });
  customs.forEach((c) => { totalP += parseFloat(c.protein) || 0; totalK += parseFloat(c.kcal) || 0; });

  const tP = parseFloat(targets.protein) || 0;
  const tK = parseFloat(targets.kcal) || 0;

  const setDay = (updater) => setLog((prev) => ({ ...prev, [date]: updater(normalizeDay(prev[date])) }));
  const bump = (key, delta) =>
    setDay((d) => {
      const n = Math.max(0, (d.items[key] || 0) + delta);
      const nextItems = { ...d.items };
      if (n === 0) delete nextItems[key]; else nextItems[key] = n;
      return { ...d, items: nextItems };
    });
  const addCustom = () => {
    if (!custom.name.trim()) return;
    setDay((d) => ({ ...d, custom: [...d.custom, { id: uid(), name: custom.name.trim(), protein: parseFloat(custom.protein) || 0, kcal: parseFloat(custom.kcal) || 0 }] }));
    setCustom({ name: '', protein: '', kcal: '' });
  };
  const removeCustom = (id) => setDay((d) => ({ ...d, custom: d.custom.filter((c) => c.id !== id) }));
  const clearDay = () => setLog((prev) => ({ ...prev, [date]: { items: {}, custom: [] } }));
  const shiftDay = (n) => { const d = new Date(date); d.setDate(d.getDate() + n); setDate(toIso(d)); };

  const isToday = date === toIso(new Date());
  const dateLabel = new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const anyLogged = Object.keys(items).length > 0 || customs.length > 0;

  // 7-day average (only counting days that actually have entries, so missed days don't drag it to 0).
  const dayTotals = (dk) => {
    const d = normalizeDay(log[dk]);
    let P = 0; let K = 0;
    Object.keys(d.items).forEach((k) => { const f = FOOD_BY_KEY[k]; if (f) { P += f.protein * d.items[k]; K += f.kcal * d.items[k]; } });
    d.custom.forEach((c) => { P += parseFloat(c.protein) || 0; K += parseFloat(c.kcal) || 0; });
    return { P, K, has: Object.keys(d.items).length > 0 || d.custom.length > 0 };
  };
  let wkP = 0; let wkK = 0; let wkN = 0;
  for (let i = 0; i < 7; i += 1) {
    const d = new Date(date); d.setDate(d.getDate() - i);
    const t = dayTotals(toIso(d));
    if (t.has) { wkP += t.P; wkK += t.K; wkN += 1; }
  }
  const avgP = wkN ? Math.round(wkP / wkN) : 0;
  const avgK = wkN ? Math.round(wkK / wkN) : 0;

  const Bar = ({ value, target, unit, over }) => {
    const pct = target > 0 ? Math.min(100, (value / target) * 100) : 0;
    const isOver = over && value > target;
    return (
      <div>
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-sm font-semibold text-gray-700">
            {Math.round(value)}<span className="text-gray-400 font-normal"> / {target}{unit}</span>
          </span>
          {target > 0 && (isOver
            ? <span className="text-xs font-semibold text-red-600">+{Math.round(value - target)}{unit} over</span>
            : <span className="text-xs text-gray-500">{Math.max(0, Math.round(target - value))}{unit} left</span>)}
        </div>
        <div className="h-2.5 rounded-full bg-gray-200 overflow-hidden">
          <div className={`h-full rounded-full ${isOver ? 'bg-red-500' : 'bg-green-600'}`} style={{ width: `${pct}%` }} />
        </div>
      </div>
    );
  };

  const card = 'bg-white border border-gray-200 rounded-xl';
  const Stepper = ({ k }) => {
    const qty = items[k] || 0;
    return (
      <div className="flex items-center gap-1.5 shrink-0">
        <button type="button" onClick={() => bump(k, -1)} disabled={qty === 0} className="w-7 h-7 rounded-md border border-gray-300 flex items-center justify-center text-gray-600 disabled:opacity-30 hover:bg-gray-100"><Minus className="w-3.5 h-3.5" /></button>
        <span className={`w-6 text-center text-sm font-semibold ${qty > 0 ? 'text-green-700' : 'text-gray-400'}`}>{qty}</span>
        <button type="button" onClick={() => bump(k, 1)} className="w-7 h-7 rounded-md border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-green-50 hover:border-green-500"><Plus className="w-3.5 h-3.5" /></button>
      </div>
    );
  };

  return (
    <div className="min-h-screen" style={{ background: '#f5f5f0' }}>
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 text-gray-900">
        <h1 className="text-xl sm:text-2xl font-bold mb-1">Daily Intake</h1>
        <p className="text-xs text-gray-500 mb-4">Count portions as you eat — tap + for each egg, palm of chicken, serving of veg, etc. Totals are rough estimates to keep you on track, not gram-perfect.</p>

        {/* Date nav */}
        <div className="flex items-center justify-between mb-3">
          <button type="button" onClick={() => shiftDay(-1)} className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300"><ChevronLeft className="w-4 h-4" /></button>
          <div className="text-center">
            <div className="font-semibold text-sm">{dateLabel}</div>
            {!isToday && <button type="button" onClick={() => setDate(toIso(new Date()))} className="text-green-700 text-xs underline">Jump to today</button>}
          </div>
          <button type="button" onClick={() => shiftDay(1)} className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300"><ChevronRight className="w-4 h-4" /></button>
        </div>

        {/* Totals */}
        <div className={`${card} p-4 mb-4 space-y-3 shadow-md`} style={{ position: 'sticky', top: navH, zIndex: 30 }}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wide text-gray-500">Today's totals</span>
            <button type="button" onClick={() => setShowTargets((s) => !s)} className="text-xs text-gray-500 underline">{showTargets ? 'done' : 'edit targets'}</button>
          </div>
          {showTargets ? (
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <label className="flex items-center gap-1">Protein
                <input type="number" value={targets.protein} onChange={(e) => setTargets((t) => ({ ...t, protein: e.target.value }))} className="w-16 px-2 py-1 border border-gray-300 rounded-md" />g
              </label>
              <label className="flex items-center gap-1">Calories
                <input type="number" value={targets.kcal} onChange={(e) => setTargets((t) => ({ ...t, kcal: e.target.value }))} className="w-20 px-2 py-1 border border-gray-300 rounded-md" />kcal
              </label>
            </div>
          ) : (
            <>
              <div><div className="text-xs text-gray-500 mb-0.5">Protein</div><Bar value={totalP} target={tP} unit="g" /></div>
              <div><div className="text-xs text-gray-500 mb-0.5">Calories</div><Bar value={totalK} target={tK} unit="" over /></div>
            </>
          )}
        </div>

        {/* 7-day average */}
        <div className={`${card} p-4 mb-4`}>
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wide text-gray-500">7-day average</span>
            <span className="text-xs text-gray-400">{wkN > 0 ? `${wkN} day${wkN === 1 ? '' : 's'} logged` : 'no days logged'}</span>
          </div>
          {wkN === 0 ? (
            <div className="text-sm text-gray-400">Log a few days and your averages show here — that's what to judge progress on, not any single day.</div>
          ) : (
            <div className="flex gap-6">
              <div>
                <div className="text-2xl font-bold text-gray-900">{avgP}<span className="text-base font-normal text-gray-400">g</span></div>
                <div className={`text-xs font-semibold ${avgP >= tP * 0.95 ? 'text-green-600' : 'text-amber-600'}`}>protein/day{tP ? ` · target ${tP}g` : ''}</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{avgK}</div>
                <div className={`text-xs font-semibold ${tK && avgK > tK ? 'text-red-600' : 'text-green-600'}`}>kcal/day{tK ? ` · target ${tK}` : ''}</div>
              </div>
            </div>
          )}
        </div>

        {/* Building blocks with steppers */}
        {FOOD_GROUPS.map((g) => (
          <div key={g.category} className={`${card} p-3 sm:p-4 mb-3`}>
            <div className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">{g.category}</div>
            <div className="divide-y divide-gray-100">
              {g.items.map((f) => (
                <div key={f.key} className="flex items-center gap-3 py-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-800">{f.name} <span className="text-xs text-gray-400 font-normal">· {f.unit}</span></div>
                    <div className="text-[11px] text-gray-500">{f.protein}g · {f.kcal} kcal each</div>
                  </div>
                  <Stepper k={f.key} />
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Custom add */}
        <div className={`${card} p-4 mb-3`}>
          <div className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">Anything else</div>
          <div className="flex flex-wrap items-center gap-2">
            <input type="text" placeholder="food" value={custom.name} onChange={(e) => setCustom((c) => ({ ...c, name: e.target.value }))} className="flex-1 min-w-[120px] px-2 py-1.5 border border-gray-300 rounded-md text-sm" />
            <input type="number" inputMode="decimal" placeholder="protein g" value={custom.protein} onChange={(e) => setCustom((c) => ({ ...c, protein: e.target.value }))} className="w-24 px-2 py-1.5 border border-gray-300 rounded-md text-sm" />
            <input type="number" inputMode="numeric" placeholder="kcal" value={custom.kcal} onChange={(e) => setCustom((c) => ({ ...c, kcal: e.target.value }))} className="w-20 px-2 py-1.5 border border-gray-300 rounded-md text-sm" />
            <button type="button" onClick={addCustom} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-green-600 hover:bg-green-700 text-white text-sm font-semibold"><Plus className="w-4 h-4" /> Add</button>
          </div>
          {customs.length > 0 && (
            <div className="mt-3 divide-y divide-gray-100">
              {customs.map((c) => (
                <div key={c.id} className="flex items-center gap-2 py-1.5">
                  <span className="flex-1 text-sm text-gray-800">{c.name}</span>
                  <span className="text-xs text-gray-500 whitespace-nowrap">{Math.round(parseFloat(c.protein) || 0)}g · {Math.round(parseFloat(c.kcal) || 0)} kcal</span>
                  <button type="button" onClick={() => removeCustom(c.id)} className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50"><X className="w-3.5 h-3.5" /></button>
                </div>
              ))}
            </div>
          )}
        </div>

        {anyLogged && (
          <button type="button" onClick={clearDay} className="text-xs text-gray-400 hover:text-red-600 underline mb-10">clear this day</button>
        )}
      </div>
    </div>
  );
}
