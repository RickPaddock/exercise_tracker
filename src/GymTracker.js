import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Dumbbell, Check, Moon, Sun, ChevronDown, ChevronRight, GripVertical, ArrowUp, ArrowDown, Pencil, Download, Upload, ExternalLink, Scale } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ACTIVITY_META,
  WEEK_DAY_NAMES,
  WEEK_ORDER,
  DAY_NAMES,
  DAY_MS,
  getMonday,
  addDays,
  toKey,
  loadPlan,
  savePlan,
  defaultPlan,
  loadWeekPlans,
  saveWeekPlans,
  weekArrangement,
} from './gymPlan';

export { getMonday, addDays, toKey, DAY_NAMES, WEEK_ORDER, DAY_MS } from './gymPlan';

// Render-prop sortable row: lets us put the drag handle exactly where we want.
function Sortable({ id, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    touchAction: 'none',
  };
  return children({ setNodeRef, style, handleProps: { ...attributes, ...listeners } });
}

const GymLog = () => {
  const todayIso = new Date().toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(() => {
    try { return localStorage.getItem('gym_startDate') || todayIso; } catch (e) { return todayIso; }
  });
  const [log, setLog] = useState(() => {
    try { return JSON.parse(localStorage.getItem('gym_log')) || {}; } catch (e) { return {}; }
  });
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try { return JSON.parse(localStorage.getItem('gym_isDarkMode')) ?? true; } catch (e) { return true; }
  });
  const [plan, setPlan] = useState(() => loadPlan());
  const [weekPlans, setWeekPlans] = useState(() => loadWeekPlans());
  const [bodyweight, setBodyweight] = useState(() => {
    try { return JSON.parse(localStorage.getItem('gym_bodyweight')) || {}; } catch (e) { return {}; }
  });
  const [editMode, setEditMode] = useState(false);

  const computeOffset = (start) => {
    const w = Math.round((getMonday(new Date()).getTime() - getMonday(new Date(start)).getTime()) / (7 * DAY_MS));
    return w > 0 ? w : 0;
  };
  const [weekOffset, setWeekOffset] = useState(() => computeOffset(startDate));
  const [expanded, setExpanded] = useState({});
  const fileInputRef = useRef(null);

  useEffect(() => { try { localStorage.setItem('gym_startDate', startDate); } catch (e) {} }, [startDate]);
  useEffect(() => { try { localStorage.setItem('gym_log', JSON.stringify(log)); } catch (e) {} }, [log]);
  useEffect(() => { try { localStorage.setItem('gym_isDarkMode', JSON.stringify(isDarkMode)); } catch (e) {} }, [isDarkMode]);
  useEffect(() => { try { localStorage.setItem('gym_bodyweight', JSON.stringify(bodyweight)); } catch (e) {} }, [bodyweight]);

  const persistPlan = (next) => { setPlan(next); savePlan(next); };
  const persistWeekPlans = (next) => { setWeekPlans(next); saveWeekPlans(next); };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const startMonday = getMonday(startDate);
  const weekStart = addDays(startMonday, weekOffset * 7);
  const weekKey = toKey(weekStart);
  const days = WEEK_ORDER.map((_, i) => addDays(weekStart, i));
  const effectiveWeek = weekArrangement(plan, weekPlans, weekKey);
  const hasOverride = Array.isArray(weekPlans[weekKey]) && weekPlans[weekKey].length === 7;

  const getCurrentDate = () =>
    new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const setEntry = (dateKey, exName, setIdx, field, value) => {
    setLog((prev) => {
      const day = { ...(prev[dateKey] || {}) };
      const sets = Array.isArray(day[exName]) ? day[exName].map((s) => ({ ...s })) : [];
      while (sets.length <= setIdx) sets.push({ weight: '', reps: '' });
      sets[setIdx] = { ...sets[setIdx], [field]: value };
      day[exName] = sets;
      return { ...prev, [dateKey]: day };
    });
  };
  const getEntry = (dateKey, exName, setIdx, field) => {
    const sets = log[dateKey] && log[dateKey][exName];
    if (!Array.isArray(sets) || !sets[setIdx]) return '';
    return sets[setIdx][field] ?? '';
  };
  const toggleDone = (dateKey) => {
    setLog((prev) => ({ ...prev, [dateKey]: { ...(prev[dateKey] || {}), _done: !(prev[dateKey] && prev[dateKey]._done) } }));
  };
  const getSwap = (dateKey, exName) =>
    (log[dateKey] && log[dateKey]._swaps && log[dateKey]._swaps[exName]) || '';
  const setSwap = (dateKey, exName, value) => {
    setLog((prev) => {
      const day = { ...(prev[dateKey] || {}) };
      const swaps = { ...(day._swaps || {}) };
      if (value) swaps[exName] = value;
      else delete swaps[exName];
      day._swaps = swaps;
      return { ...prev, [dateKey]: day };
    });
  };

  // Most recent earlier date this exercise was logged (for the "previous" reference).
  const num = (v) => { const n = parseFloat(v); return Number.isFinite(n) ? n : null; };
  const setsHaveData = (sets) =>
    Array.isArray(sets) && sets.some((s) => s && (num(s.weight) !== null || num(s.reps) !== null || num(s.secs) !== null));
  const prevSession = (dateKey, exName) => {
    let bestKey = null;
    Object.keys(log).forEach((k) => {
      if (k >= dateKey) return; // ISO dates sort chronologically as strings; only earlier days
      if (!setsHaveData(log[k] && log[k][exName])) return;
      if (bestKey === null || k > bestKey) bestKey = k;
    });
    return bestKey ? { key: bestKey, sets: log[bestKey][exName] } : null;
  };
  const fmtPrevSet = (s, unit) => {
    if (!s) return null;
    if (unit === 'sec') { const v = num(s.secs); return v !== null ? `${v}s` : null; }
    const w = num(s.weight);
    const r = num(s.reps);
    if (w === null && r === null) return null;
    return `${w !== null ? `${w}kg` : '—'}${r !== null ? ` × ${r}` : ''}`;
  };

  // ---- per-week day arrangement ----
  const setWeekArrangement = (newWeek) => {
    persistWeekPlans({ ...weekPlans, [weekKey]: newWeek });
  };
  const moveDay = (oldIndex, newIndex) => {
    if (newIndex < 0 || newIndex > 6) return;
    setWeekArrangement(arrayMove(effectiveWeek, oldIndex, newIndex));
  };
  const onWeekDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const oldIndex = effectiveWeek.findIndex((s) => s.id === active.id);
    const newIndex = effectiveWeek.findIndex((s) => s.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) moveDay(oldIndex, newIndex);
  };
  const resetThisWeek = () => {
    const next = { ...weekPlans };
    delete next[weekKey];
    persistWeekPlans(next);
  };

  // ---- global exercise order ----
  const moveExercise = (workoutKey, oldIndex, newIndex) => {
    if (newIndex < 0) return;
    const list = plan.workouts[workoutKey].exercises;
    if (newIndex > list.length - 1) return;
    const workouts = { ...plan.workouts, [workoutKey]: { ...plan.workouts[workoutKey], exercises: arrayMove(list, oldIndex, newIndex) } };
    persistPlan({ ...plan, workouts });
  };
  const onExerciseDragEnd = (workoutKey) => ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const list = plan.workouts[workoutKey].exercises;
    const oldIndex = list.findIndex((e) => e.name === active.id);
    const newIndex = list.findIndex((e) => e.name === over.id);
    if (oldIndex !== -1 && newIndex !== -1) moveExercise(workoutKey, oldIndex, newIndex);
  };
  const resetExerciseOrder = () => {
    if (window.confirm('Reset exercise order in all workouts back to the original? Your logged sets are kept.')) {
      persistPlan(defaultPlan());
    }
  };

  // ---- export / import ----
  const exportData = () => {
    const payload = { version: 4, exportedAt: new Date().toISOString(), startDate, plan, weekPlans, bodyweight, log };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gym-log-${todayIso}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  const importData = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (data.log && typeof data.log === 'object') setLog(data.log);
        if (data.startDate) setStartDate(data.startDate);
        if (data.plan && Array.isArray(data.plan.week) && data.plan.workouts) persistPlan(data.plan);
        if (data.weekPlans && typeof data.weekPlans === 'object') persistWeekPlans(data.weekPlans);
        if (data.bodyweight && typeof data.bodyweight === 'object') setBodyweight(data.bodyweight);
        setWeekOffset(computeOffset(data.startDate || startDate));
        window.alert('Workout log imported.');
      } catch (err) {
        window.alert('Could not read that file — make sure it is a gym-log export.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const resetAll = () => {
    if (window.confirm('Reset everything (plan, per-week changes, and all logged sets)? This cannot be undone.')) {
      setStartDate(todayIso);
      setLog({});
      setIsDarkMode(true);
      setWeekOffset(0);
      persistPlan(defaultPlan());
      persistWeekPlans({});
      setBodyweight({});
      try {
        localStorage.removeItem('gym_startDate');
        localStorage.removeItem('gym_log');
        localStorage.removeItem('gym_isDarkMode');
        localStorage.removeItem('gym_plan');
        localStorage.removeItem('gym_weekPlans');
        localStorage.removeItem('gym_bodyweight');
      } catch (e) {}
    }
  };

  const theme = {
    bg: isDarkMode ? 'bg-black' : 'bg-white',
    text: isDarkMode ? 'text-white' : 'text-black',
    textMuted: isDarkMode ? 'text-gray-400' : 'text-gray-600',
    border: isDarkMode ? 'border-gray-700' : 'border-gray-200',
    cardBg: isDarkMode ? 'bg-gray-900' : 'bg-gray-50',
    input: isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-black',
    button: isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300',
  };

  const todayKey = toKey(new Date());
  const weekLabel = `${days[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${days[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

  // Bodyweight: current week's value + change vs the most recent earlier recorded week.
  const bwCurrent = parseFloat(bodyweight[weekKey]);
  const bwPrevKey = Object.keys(bodyweight)
    .filter((k) => k < weekKey && parseFloat(bodyweight[k]) >= 0 && bodyweight[k] !== '')
    .sort()
    .pop();
  const bwPrev = bwPrevKey ? parseFloat(bodyweight[bwPrevKey]) : null;
  const bwDelta = Number.isFinite(bwCurrent) && bwPrev !== null ? bwCurrent - bwPrev : null;

  const pillEl = (txt) =>
    txt ? <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-900 text-green-200">{txt}</span> : null;

  const MoveBtns = ({ onUp, onDown, upDisabled, downDisabled }) => (
    <div className="flex flex-col">
      <button type="button" onClick={onUp} disabled={upDisabled} className={`p-0.5 rounded ${theme.button} disabled:opacity-30`} title="Move up">
        <ArrowUp className="w-3.5 h-3.5" />
      </button>
      <button type="button" onClick={onDown} disabled={downDisabled} className={`p-0.5 rounded ${theme.button} disabled:opacity-30 mt-0.5`} title="Move down">
        <ArrowDown className="w-3.5 h-3.5" />
      </button>
    </div>
  );

  const WeekNav = () => (
    <div className="flex items-center justify-between gap-2 mb-4">
      <button type="button" onClick={() => setWeekOffset((w) => Math.max(0, w - 1))} disabled={weekOffset === 0} className={`px-3 py-2 rounded-lg ${theme.button} transition-colors text-sm disabled:opacity-40`}>← Prev</button>
      <div className="text-center">
        <div className="font-semibold text-sm sm:text-base">Week {weekOffset + 1}</div>
        <div className={`text-xs ${theme.textMuted}`}>{weekLabel}{hasOverride ? ' · customised' : ''}</div>
        <button type="button" onClick={() => setWeekOffset(computeOffset(startDate))} className="text-green-500 hover:text-green-400 text-xs underline mt-0.5">Jump to this week</button>
      </div>
      <button type="button" onClick={() => setWeekOffset((w) => w + 1)} className={`px-3 py-2 rounded-lg ${theme.button} transition-colors text-sm`}>Next →</button>
    </div>
  );

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} transition-colors`}>
      <div className="max-w-3xl mx-auto px-3 sm:px-4">
        {/* Header */}
        <div className="text-center p-4 sm:p-6 relative">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4">
            <Dumbbell className="w-6 h-6 sm:w-8 sm:h-8" />
            <h1 className="text-2xl sm:text-3xl font-bold">Gym Workout Log</h1>
            <button type="button" onClick={() => setIsDarkMode((p) => !p)} className={`p-2 rounded-lg ${theme.button} transition-colors`}>
              {isDarkMode ? <Sun className="w-4 h-4 sm:w-5 sm:h-5" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
          </div>

          <button type="button" onClick={resetAll} className={`absolute top-4 right-4 px-3 py-2 rounded-lg ${theme.button} hover:bg-red-600 hover:text-white transition-colors text-sm`}>
            Reset All
          </button>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-3">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
            <label className="font-medium text-sm sm:text-base">Start Date:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setWeekOffset(0); }}
              className={`px-3 py-2 rounded-lg ${theme.input} border focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base`}
            />
          </div>
          <div className={`mb-3 ${theme.textMuted} text-xs sm:text-sm`}>Today: {getCurrentDate()}</div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setEditMode((p) => !p)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors ${editMode ? 'bg-green-600 hover:bg-green-700 text-white' : theme.button}`}
            >
              <Pencil className="w-4 h-4" /> {editMode ? 'Done editing' : 'Edit plan'}
            </button>
            <button type="button" onClick={exportData} className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm ${theme.button} transition-colors`}>
              <Download className="w-4 h-4" /> Export
            </button>
            <button type="button" onClick={() => fileInputRef.current && fileInputRef.current.click()} className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm ${theme.button} transition-colors`}>
              <Upload className="w-4 h-4" /> Import
            </button>
            <input ref={fileInputRef} type="file" accept="application/json,.json" onChange={importData} className="hidden" />
          </div>
        </div>

        <WeekNav />

        {/* Weekly bodyweight */}
        <div className={`rounded-xl border ${theme.border} ${theme.cardBg} p-3 sm:p-4 mb-4 flex items-center gap-3 flex-wrap`}>
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4" />
            <span className="text-sm font-medium">Bodyweight</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number" inputMode="decimal" step="0.1" placeholder="kg"
              value={bodyweight[weekKey] || ''}
              onChange={(e) => setBodyweight((prev) => ({ ...prev, [weekKey]: e.target.value }))}
              className={`w-24 px-2 py-1 rounded-md ${theme.input} border text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent`}
            />
            <span className={`text-xs ${theme.textMuted}`}>kg · week of {days[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>
          {bwDelta !== null && Math.abs(bwDelta) > 0.001 && (
            <span className={`text-xs font-semibold ${bwDelta < 0 ? 'text-green-500' : 'text-amber-500'}`}>
              {bwDelta > 0 ? '▲' : '▼'} {Math.abs(bwDelta).toFixed(1)} kg{' '}
              <span className={`font-normal ${theme.textMuted}`}>vs {new Date(bwPrevKey).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </span>
          )}
        </div>

        {editMode ? (
          /* ============ PLAN EDITOR (current week) ============ */
          <div className="pb-10">
            <div className={`rounded-xl border ${theme.border} ${theme.cardBg} p-3 sm:p-4 mb-4`}>
              <div className="flex items-center justify-between mb-1 gap-2">
                <h2 className="font-bold text-base sm:text-lg">Edit week of {weekLabel}</h2>
                <button type="button" onClick={resetThisWeek} disabled={!hasOverride} className={`text-xs px-2 py-1 rounded ${theme.button} disabled:opacity-40`}>Reset this week</button>
              </div>
              <p className={`text-xs ${theme.textMuted} mb-3`}>
                Drag the <GripVertical className="inline w-3.5 h-3.5" /> handle or use ↑ ↓ to move a day’s activity — <strong>this week only</strong>.
                Reordering exercises inside a strength day applies to <strong>all weeks</strong>.
              </p>

              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onWeekDragEnd}>
                <SortableContext items={effectiveWeek.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2">
                    {effectiveWeek.map((slot, idx) => {
                      const meta = ACTIVITY_META[slot.activityId];
                      const isStrength = meta.type === 'strength';
                      const isOpen = !!expanded[`edit-${slot.id}`];
                      const date = days[idx];
                      return (
                        <Sortable key={slot.id} id={slot.id}>
                          {({ setNodeRef, style, handleProps }) => (
                            <div ref={setNodeRef} style={style} className={`rounded-lg border ${theme.border} ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                              <div className="flex items-center gap-2 p-2.5">
                                <button type="button" {...handleProps} className="cursor-grab active:cursor-grabbing touch-none p-1" title="Drag to move">
                                  <GripVertical className="w-4 h-4" />
                                </button>
                                <div className="w-12">
                                  <div className="font-bold text-sm leading-tight">{WEEK_DAY_NAMES[idx]}</div>
                                  <div className={`text-[10px] ${theme.textMuted}`}>{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                                </div>
                                <button
                                  type="button"
                                  disabled={!isStrength}
                                  onClick={() => isStrength && setExpanded((p) => ({ ...p, [`edit-${slot.id}`]: !p[`edit-${slot.id}`] }))}
                                  className={`flex-1 text-left flex items-center gap-2 ${isStrength ? 'cursor-pointer' : 'cursor-default'}`}
                                >
                                  {isStrength && (isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />)}
                                  <span className="text-sm font-medium">{meta.label}</span>
                                  {pillEl(meta.pill)}
                                </button>
                                <MoveBtns onUp={() => moveDay(idx, idx - 1)} onDown={() => moveDay(idx, idx + 1)} upDisabled={idx === 0} downDisabled={idx === 6} />
                              </div>

                              {isStrength && isOpen && (
                                <div className={`border-t ${theme.border} p-2.5`}>
                                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onExerciseDragEnd(slot.activityId)}>
                                    <SortableContext items={plan.workouts[slot.activityId].exercises.map((e) => e.name)} strategy={verticalListSortingStrategy}>
                                      <div className="space-y-1.5">
                                        {plan.workouts[slot.activityId].exercises.map((ex, exIdx) => (
                                          <Sortable key={ex.name} id={ex.name}>
                                            {({ setNodeRef, style, handleProps }) => (
                                              <div ref={setNodeRef} style={style} className={`flex items-center gap-2 rounded-md border ${theme.border} ${theme.cardBg} px-2 py-1.5`}>
                                                <button type="button" {...handleProps} className="cursor-grab active:cursor-grabbing touch-none p-0.5" title="Drag to reorder">
                                                  <GripVertical className="w-4 h-4" />
                                                </button>
                                                <div className="flex-1 min-w-0">
                                                  <div className="text-sm font-medium truncate">{ex.name}</div>
                                                  <div className="text-xs text-green-500 font-semibold">{ex.target}</div>
                                                </div>
                                                <MoveBtns
                                                  onUp={() => moveExercise(slot.activityId, exIdx, exIdx - 1)}
                                                  onDown={() => moveExercise(slot.activityId, exIdx, exIdx + 1)}
                                                  upDisabled={exIdx === 0}
                                                  downDisabled={exIdx === plan.workouts[slot.activityId].exercises.length - 1}
                                                />
                                              </div>
                                            )}
                                          </Sortable>
                                        ))}
                                      </div>
                                    </SortableContext>
                                  </DndContext>
                                </div>
                              )}
                            </div>
                          )}
                        </Sortable>
                      );
                    })}
                  </div>
                </SortableContext>
              </DndContext>
              <button type="button" onClick={resetExerciseOrder} className={`mt-3 text-xs underline ${theme.textMuted}`}>Reset exercise order (all weeks)</button>
            </div>
          </div>
        ) : (
          /* ============ LOGGING VIEW ============ */
          <div className="space-y-3 pb-8">
            {days.map((date, i) => {
              const wd = date.getDay();
              const slot = effectiveWeek[i];
              const meta = ACTIVITY_META[slot.activityId];
              const dateKey = toKey(date);
              const isToday = dateKey === todayKey;
              const isStrength = meta.type === 'strength';
              const isOpen = !!expanded[dateKey];
              const done = !!(log[dateKey] && log[dateKey]._done);
              const exercises = isStrength ? plan.workouts[slot.activityId].exercises : [];

              return (
                <div key={dateKey} className={`rounded-xl border ${theme.border} ${theme.cardBg} ${isToday ? 'ring-2 ring-green-500' : ''} overflow-hidden`}>
                  <div className="flex items-center gap-3 p-3 sm:p-4">
                    <div className="text-center min-w-[44px]">
                      <div className="font-bold text-sm">{DAY_NAMES[wd]}</div>
                      <div className={`text-xs ${theme.textMuted}`}>{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                    </div>
                    <button
                      type="button"
                      disabled={!isStrength}
                      onClick={() => isStrength && setExpanded((p) => ({ ...p, [dateKey]: !p[dateKey] }))}
                      className={`flex-1 text-left flex items-center gap-2 ${isStrength ? 'cursor-pointer' : 'cursor-default'}`}
                    >
                      {isStrength && (isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />)}
                      <span className="text-sm sm:text-base font-medium">{meta.label}</span>
                      {pillEl(meta.pill)}
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleDone(dateKey)}
                      title="Mark done"
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                        done ? 'bg-green-500 border-green-500 text-white hover:bg-green-600' : isDarkMode ? 'border-gray-600 hover:border-green-400' : 'border-gray-300 hover:border-green-400'
                      }`}
                    >
                      {done && <Check className="w-4 h-4 sm:w-5 sm:h-5" />}
                    </button>
                  </div>

                  {isStrength && isOpen && (
                    <div className={`border-t ${theme.border} p-3 sm:p-4 space-y-4`}>
                      {plan.workouts[slot.activityId].note && (
                        <div className={`text-xs rounded-md p-2 border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-yellow-50 border-yellow-200 text-yellow-800'}`}>
                          {plan.workouts[slot.activityId].note}
                        </div>
                      )}
                      {exercises.map((ex) => {
                        const prev = prevSession(dateKey, ex.name);
                        return (
                        <div key={ex.name}>
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="font-semibold text-sm">
                              {ex.link ? (
                                <a href={ex.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 underline decoration-dotted underline-offset-2 hover:text-green-500">
                                  {ex.name}
                                  <ExternalLink className="w-3 h-3 opacity-60" />
                                </a>
                              ) : (
                                ex.name
                              )}
                              {ex.tag === 'superset' && (
                                <span className={`ml-1.5 align-middle text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded ${isDarkMode ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-700'}`}>superset</span>
                              )}
                            </span>
                            <span className="text-xs text-green-500 font-semibold whitespace-nowrap">{ex.target}</span>
                          </div>
                          {ex.cue && <div className={`text-xs italic ${theme.textMuted} mb-1`}>{ex.cue}</div>}
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className={`text-xs ${theme.textMuted} whitespace-nowrap`}>Did instead:</span>
                            <input
                              type="text"
                              value={getSwap(dateKey, ex.name)}
                              onChange={(e) => setSwap(dateKey, ex.name, e.target.value)}
                              placeholder="same as plan — or note a machine/variation"
                              className={`flex-1 min-w-0 px-2 py-1 rounded-md border text-xs focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                                getSwap(dateKey, ex.name)
                                  ? isDarkMode ? 'bg-amber-900/40 border-amber-700 text-amber-100' : 'bg-amber-50 border-amber-300 text-amber-900'
                                  : theme.input
                              }`}
                            />
                          </div>
                          <div className="space-y-1.5 mt-1.5">
                            {Array.from({ length: ex.sets }, (_, i2) => i2).map((setIdx) => (
                              <div key={setIdx} className="flex items-center gap-2">
                                <span className={`text-xs ${theme.textMuted} w-12`}>Set {setIdx + 1}</span>
                                {ex.unit === 'sec' ? (
                                  <>
                                    <input
                                      type="number" inputMode="numeric" placeholder="sec"
                                      value={getEntry(dateKey, ex.name, setIdx, 'secs')}
                                      onChange={(e) => setEntry(dateKey, ex.name, setIdx, 'secs', e.target.value)}
                                      className={`w-24 px-2 py-1 rounded-md ${theme.input} border text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                                    />
                                    <span className={`text-xs ${theme.textMuted}`}>seconds</span>
                                  </>
                                ) : (
                                  <>
                                    <input
                                      type="number" inputMode="decimal" placeholder="kg"
                                      value={getEntry(dateKey, ex.name, setIdx, 'weight')}
                                      onChange={(e) => setEntry(dateKey, ex.name, setIdx, 'weight', e.target.value)}
                                      className={`w-20 px-2 py-1 rounded-md ${theme.input} border text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                                    />
                                    <span className={`text-xs ${theme.textMuted}`}>kg ×</span>
                                    <input
                                      type="number" inputMode="numeric" placeholder="reps"
                                      value={getEntry(dateKey, ex.name, setIdx, 'reps')}
                                      onChange={(e) => setEntry(dateKey, ex.name, setIdx, 'reps', e.target.value)}
                                      className={`w-20 px-2 py-1 rounded-md ${theme.input} border text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                                    />
                                    <span className={`text-xs ${theme.textMuted}`}>reps</span>
                                  </>
                                )}
                                {(() => {
                                  const t = prev && fmtPrevSet(prev.sets && prev.sets[setIdx], ex.unit);
                                  return t ? (
                                    <span
                                      className={`text-xs ${theme.textMuted} ml-auto whitespace-nowrap`}
                                      title={`Previous session · ${new Date(prev.key).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                                    >
                                      prev {t}
                                    </span>
                                  ) : null;
                                })()}
                              </div>
                            ))}
                          </div>
                        </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default GymLog;
