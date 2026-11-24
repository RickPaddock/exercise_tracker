import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Plus, Minus, Download, Upload, Watch } from 'lucide-react';
import { FOOD_GROUPS, normalizeDay, dayTotals, numOrNull } from './nutritionData';
import { downloadBackup, writeBackupToStorage } from './backup';

const toIso = (d) => d.toISOString().split('T')[0];
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

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
  const fileInputRef = useRef(null);

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
  const { P: totalP, K: totalK } = dayTotals(day);
  const burn = numOrNull(day.burn);

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
  const setActivity = (field, value) => setDay((d) => ({ ...d, [field]: value }));
  // Clears the food only — Garmin burn/steps for the day are kept.
  const clearDay = () => setDay((d) => ({ ...d, items: {}, custom: [] }));
  const shiftDay = (n) => { const d = new Date(date); d.setDate(d.getDate() + n); setDate(toIso(d)); };

  const isToday = date === toIso(new Date());
  const dateLabel = new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const anyLogged = Object.keys(items).length > 0 || customs.length > 0;

  // 7-day averages (each only over days that have that entry, so missed days don't drag it to 0).
  let wkP = 0; let wkK = 0; let wkN = 0;
  let wkBurn = 0; let wkBurnN = 0; let wkSteps = 0; let wkStepsN = 0;
  let wkBal = 0; let wkBalN = 0;
  for (let i = 0; i < 7; i += 1) {
    const d = new Date(date); d.setDate(d.getDate() - i);
    const raw = normalizeDay(log[toIso(d)]);
    const t = dayTotals(raw);
    const b = numOrNull(raw.burn);
    const st = numOrNull(raw.steps);
    if (t.has) { wkP += t.P; wkK += t.K; wkN += 1; }
    if (b !== null) { wkBurn += b; wkBurnN += 1; }
    if (st !== null) { wkSteps += st; wkStepsN += 1; }
    if (t.has && b !== null) { wkBal += t.K - b; wkBalN += 1; }
  }
  const avgP = wkN ? Math.round(wkP / wkN) : 0;
  const avgK = wkN ? Math.round(wkK / wkN) : 0;
  const avgBurn = wkBurnN ? Math.round(wkBurn / wkBurnN) : null;
  const avgSteps = wkStepsN ? Math.round(wkSteps / wkStepsN) : null;
  const avgBal = wkBalN ? Math.round(wkBal / wkBalN) : null;
  const fmtBal = (v) => (v <= 0 ? `${Math.abs(v)} deficit` : `${v} surplus`);

  const importData = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        writeBackupToStorage(data);
        if (data.nutrition && data.nutrition.log) setLog(data.nutrition.log);
        if (data.nutrition && data.nutrition.targets) setTargets(data.nutrition.targets);
        window.alert(data.nutrition ? 'Workouts and nutrition imported.' : 'Workout log imported (that file has no nutrition data).');
      } catch (err) {
        window.alert('Could not read that file — make sure it is an export from this app.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

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

        {/* Garmin activity */}
        <div className={`${card} p-4 mb-4`}>
          <div className="flex items-center gap-1.5 mb-2">
            <Watch className="w-4 h-4 text-gray-500" />
            <span className="text-xs font-bold uppercase tracking-wide text-gray-500">Activity (from Garmin)</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            <label className="flex items-center gap-1.5">Burned
              <input type="number" inputMode="numeric" placeholder="total" value={day.burn} onChange={(e) => setActivity('burn', e.target.value)} className="w-20 px-2 py-1 border border-gray-300 rounded-md" />kcal
            </label>
            <label className="flex items-center gap-1.5">Steps
              <input type="number" inputMode="numeric" placeholder="steps" value={day.steps} onChange={(e) => setActivity('steps', e.target.value)} className="w-24 px-2 py-1 border border-gray-300 rounded-md" />
            </label>
          </div>
          {burn !== null && anyLogged && (
            <div className="mt-2 text-sm">
              Eaten {Math.round(totalK)} − burned {Math.round(burn)} ={' '}
              <span className={`font-semibold ${totalK - burn <= 0 ? 'text-green-700' : 'text-amber-600'}`}>{fmtBal(Math.round(totalK - burn))}</span>
            </div>
          )}
          <div className="mt-1.5 text-[11px] text-gray-500">Enter Garmin Connect's <strong>Total calories</strong> (resting + active) at the end of the day. Garmin tends to run a little high, so treat a small deficit here as roughly maintenance.</div>
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
          {(avgBurn !== null || avgSteps !== null) && (
            <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-700">
              {avgBurn !== null && <span><strong>{avgBurn}</strong> <span className="text-gray-500">kcal burned/day</span></span>}
              {avgSteps !== null && <span><strong>{avgSteps.toLocaleString()}</strong> <span className="text-gray-500">steps/day</span></span>}
              {avgBal !== null && <span className={avgBal <= 0 ? 'text-green-700' : 'text-amber-600'}><strong>{fmtBal(avgBal)}</strong> <span className="text-gray-500">avg</span></span>}
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
          <button type="button" onClick={clearDay} className="text-xs text-gray-400 hover:text-red-600 underline">clear this day's food</button>
        )}

        {/* Backup */}
        <div className={`${card} p-4 mt-4 mb-10`}>
          <div className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Backup / send to coach</div>
          <div className="text-[11px] text-gray-500 mb-3">One file with everything — workouts, bodyweight, waist, food, Garmin burn and steps. Same file as Export on the Gym page.</div>
          <div className="flex gap-2">
            <button type="button" onClick={downloadBackup} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm bg-gray-200 hover:bg-gray-300"><Download className="w-4 h-4" /> Export everything</button>
            <button type="button" onClick={() => fileInputRef.current && fileInputRef.current.click()} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm bg-gray-200 hover:bg-gray-300"><Upload className="w-4 h-4" /> Import</button>
            <input ref={fileInputRef} type="file" accept="application/json,.json" onChange={importData} className="hidden" />
          </div>
        </div>
      </div>
    </div>
  );
}
