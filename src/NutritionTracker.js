import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Plus } from 'lucide-react';

// Your plan's meals with protein (from the Nutrition plan) and estimated calories.
// Calories are approximate — tweak the targets to suit.
const FOOD_GROUPS = [
  {
    category: 'Breakfast',
    items: [
      { name: 'Eggs, Yogurt & Avocado', protein: 50, kcal: 650 },
      { name: 'PB Overnight Oats', protein: 45, kcal: 700 },
      { name: 'Spinach & Feta Omelette', protein: 35, kcal: 450 },
    ],
  },
  {
    category: 'Lunch',
    items: [
      { name: 'Cajun Chicken & Rice', protein: 50, kcal: 750 },
      { name: 'Greek Chicken & Rice', protein: 50, kcal: 750 },
      { name: 'Beef & Broccoli Rice Bowl', protein: 48, kcal: 760 },
      { name: 'Salsa-Roast Chicken & Rice', protein: 52, kcal: 760 },
      { name: 'Moroccan Beef & Rice', protein: 46, kcal: 740 },
    ],
  },
  {
    category: 'Dinner',
    items: [
      { name: 'Garlic Herb Salmon', protein: 42, kcal: 450 },
      { name: 'Spiced Beef Chilli', protein: 40, kcal: 430 },
      { name: 'Lemon Rosemary Chicken', protein: 44, kcal: 400 },
      { name: 'Basil & Garlic Chicken', protein: 44, kcal: 400 },
    ],
  },
  {
    category: 'Snacks & supps',
    items: [
      { name: '2 boiled eggs', protein: 12, kcal: 140 },
      { name: '200g cottage cheese', protein: 24, kcal: 160 },
      { name: 'Kri Kri yogurt + berries', protein: 10, kcal: 150 },
      { name: 'Whey shake (1 scoop)', protein: 24, kcal: 120 },
    ],
  },
];

const toIso = (d) => d.toISOString().split('T')[0];
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export default function NutritionTracker() {
  const [date, setDate] = useState(() => toIso(new Date()));
  const [log, setLog] = useState(() => {
    try { return JSON.parse(localStorage.getItem('nutri_log')) || {}; } catch (e) { return {}; }
  });
  const [targets, setTargets] = useState(() => {
    try { return JSON.parse(localStorage.getItem('nutri_targets')) || { protein: 160, kcal: 2000 }; } catch (e) { return { protein: 160, kcal: 2000 }; }
  });
  const [custom, setCustom] = useState({ name: '', protein: '', kcal: '' });
  const [showTargets, setShowTargets] = useState(false);

  useEffect(() => { try { localStorage.setItem('nutri_log', JSON.stringify(log)); } catch (e) {} }, [log]);
  useEffect(() => { try { localStorage.setItem('nutri_targets', JSON.stringify(targets)); } catch (e) {} }, [targets]);

  const entries = log[date] || [];
  const totalP = entries.reduce((s, e) => s + (parseFloat(e.protein) || 0), 0);
  const totalK = entries.reduce((s, e) => s + (parseFloat(e.kcal) || 0), 0);
  const tP = parseFloat(targets.protein) || 0;
  const tK = parseFloat(targets.kcal) || 0;

  const addFood = (item) =>
    setLog((prev) => ({ ...prev, [date]: [...(prev[date] || []), { id: uid(), name: item.name, protein: item.protein, kcal: item.kcal }] }));
  const removeFood = (id) =>
    setLog((prev) => ({ ...prev, [date]: (prev[date] || []).filter((e) => e.id !== id) }));
  const addCustom = () => {
    if (!custom.name.trim()) return;
    addFood({ name: custom.name.trim(), protein: parseFloat(custom.protein) || 0, kcal: parseFloat(custom.kcal) || 0 });
    setCustom({ name: '', protein: '', kcal: '' });
  };
  const shiftDay = (n) => {
    const d = new Date(date);
    d.setDate(d.getDate() + n);
    setDate(toIso(d));
  };

  const isToday = date === toIso(new Date());
  const dateLabel = new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  const Bar = ({ value, target, unit, over }) => {
    const pct = target > 0 ? Math.min(100, (value / target) * 100) : 0;
    const isOver = over && value > target;
    return (
      <div>
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-sm font-semibold text-gray-700">
            {Math.round(value)}<span className="text-gray-400 font-normal"> / {target}{unit}</span>
          </span>
          {target > 0 && (
            isOver
              ? <span className="text-xs font-semibold text-red-600">+{Math.round(value - target)}{unit} over</span>
              : <span className="text-xs text-gray-500">{Math.max(0, Math.round(target - value))}{unit} left</span>
          )}
        </div>
        <div className="h-2.5 rounded-full bg-gray-200 overflow-hidden">
          <div className={`h-full rounded-full ${isOver ? 'bg-red-500' : 'bg-green-600'}`} style={{ width: `${pct}%` }} />
        </div>
      </div>
    );
  };

  const card = 'bg-white border border-gray-200 rounded-xl';

  return (
    <div className="min-h-screen" style={{ background: '#f5f5f0' }}>
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 text-gray-900">
        <h1 className="text-xl sm:text-2xl font-bold mb-1">Daily Intake</h1>
        <p className="text-xs text-gray-500 mb-4">Tap the meals you ate — protein &amp; calories tally toward your targets. Calories are estimates.</p>

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
        <div className={`${card} p-4 mb-4 space-y-3`}>
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

        {/* Quick add from plan */}
        <div className={`${card} p-4 mb-4`}>
          <div className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">Add from your plan</div>
          <div className="space-y-3">
            {FOOD_GROUPS.map((g) => (
              <div key={g.category}>
                <div className="text-xs font-semibold text-gray-600 mb-1.5">{g.category}</div>
                <div className="flex flex-wrap gap-2">
                  {g.items.map((item) => (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => addFood(item)}
                      className="text-left px-2.5 py-1.5 rounded-lg border border-gray-200 bg-gray-50 hover:border-green-500 hover:bg-green-50 transition-colors"
                    >
                      <div className="text-xs font-medium text-gray-800">{item.name}</div>
                      <div className="text-[11px] text-gray-500">{item.protein}g · {item.kcal} kcal</div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Custom add */}
        <div className={`${card} p-4 mb-4`}>
          <div className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">Quick add (off-plan)</div>
          <div className="flex flex-wrap items-center gap-2">
            <input type="text" placeholder="food" value={custom.name} onChange={(e) => setCustom((c) => ({ ...c, name: e.target.value }))} className="flex-1 min-w-[120px] px-2 py-1.5 border border-gray-300 rounded-md text-sm" />
            <input type="number" inputMode="decimal" placeholder="protein g" value={custom.protein} onChange={(e) => setCustom((c) => ({ ...c, protein: e.target.value }))} className="w-24 px-2 py-1.5 border border-gray-300 rounded-md text-sm" />
            <input type="number" inputMode="numeric" placeholder="kcal" value={custom.kcal} onChange={(e) => setCustom((c) => ({ ...c, kcal: e.target.value }))} className="w-20 px-2 py-1.5 border border-gray-300 rounded-md text-sm" />
            <button type="button" onClick={addCustom} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-green-600 hover:bg-green-700 text-white text-sm font-semibold"><Plus className="w-4 h-4" /> Add</button>
          </div>
        </div>

        {/* Today's log */}
        <div className={`${card} p-4 mb-10`}>
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-bold uppercase tracking-wide text-gray-500">Logged ({entries.length})</div>
            {entries.length > 0 && <button type="button" onClick={() => setLog((prev) => ({ ...prev, [date]: [] }))} className="text-xs text-gray-400 hover:text-red-600 underline">clear day</button>}
          </div>
          {entries.length === 0 ? (
            <div className="text-sm text-gray-400">Nothing logged yet — tap a meal above or quick-add.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {entries.map((e) => (
                <div key={e.id} className="flex items-center gap-2 py-1.5">
                  <span className="flex-1 text-sm text-gray-800">{e.name}</span>
                  <span className="text-xs text-gray-500 whitespace-nowrap">{Math.round(parseFloat(e.protein) || 0)}g · {Math.round(parseFloat(e.kcal) || 0)} kcal</span>
                  <button type="button" onClick={() => removeFood(e.id)} className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50"><X className="w-3.5 h-3.5" /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
