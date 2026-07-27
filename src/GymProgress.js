import React, { useState } from 'react';
import { TrendingUp, Moon, Sun, Trash2 } from 'lucide-react';
import {
  loadPlan,
  loadWeekPlans,
  weekArrangement,
  ACTIVITY_META,
  WEEK_ORDER,
  WEEK_DAY_NAMES,
  DAY_MS,
  getMonday,
  addDays,
  toKey,
} from './gymPlan';

const num = (v) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : null;
};
const bestWeight = (sets) => {
  if (!Array.isArray(sets)) return null;
  let best = null;
  sets.forEach((s) => {
    const w = num(s && s.weight);
    if (w !== null && (best === null || w > best)) best = w;
  });
  return best;
};
const hasAnyEntry = (sets) =>
  Array.isArray(sets) && sets.some((s) => s && (num(s.weight) !== null || num(s.reps) !== null));

const GymProgress = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try { return JSON.parse(localStorage.getItem('gym_isDarkMode')) ?? true; } catch (e) { return true; }
  });

  const startDate = (() => {
    try { return localStorage.getItem('gym_startDate') || new Date().toISOString().split('T')[0]; }
    catch (e) { return new Date().toISOString().split('T')[0]; }
  })();
  const [log, setLog] = useState(() => {
    try { return JSON.parse(localStorage.getItem('gym_log')) || {}; } catch (e) { return {}; }
  });
  const plan = loadPlan();
  const weekPlans = loadWeekPlans();

  const toggleDark = () => {
    setIsDarkMode((p) => {
      const next = !p;
      try { localStorage.setItem('gym_isDarkMode', JSON.stringify(next)); } catch (e) {}
      return next;
    });
  };

  const startMonday = getMonday(startDate);
  const offsetOf = (d) => Math.round((getMonday(d).getTime() - startMonday.getTime()) / (7 * DAY_MS));

  const currentOffset = Math.max(0, offsetOf(new Date()));
  let maxOffset = currentOffset;
  let minWeek = 0;
  Object.keys(log).forEach((dateKey) => {
    const d = new Date(dateKey);
    if (Number.isNaN(d.getTime())) return;
    const off = offsetOf(d);
    if (off > maxOffset) maxOffset = off;
    if (off < minWeek) minWeek = off; // include pre-start weeks so they can be deleted
  });
  const weeks = Array.from({ length: maxOffset - minWeek + 1 }, (_, i) => minWeek + i);
  const weekStartFor = (w) => addDays(startMonday, w * 7);

  const weekHasData = (w) =>
    Object.keys(log).some((k) => {
      const d = new Date(k);
      if (Number.isNaN(d.getTime()) || offsetOf(d) !== w) return false;
      const day = log[k];
      return day && (day._done || Object.keys(day).some((ex) => ex !== '_done' && ex !== '_swaps' && hasAnyEntry(day[ex])));
    });

  const deleteWeek = (w) => {
    const label = weekStartFor(w).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (!window.confirm(`Delete all logged data for the week of ${label} (Wk ${w + 1})? This can't be undone.`)) return;
    const next = { ...log };
    Object.keys(next).forEach((k) => {
      const d = new Date(k);
      if (!Number.isNaN(d.getTime()) && offsetOf(d) === w) delete next[k];
    });
    setLog(next);
    try { localStorage.setItem('gym_log', JSON.stringify(next)); } catch (e) {}
  };

  const theme = {
    bg: isDarkMode ? 'bg-black' : 'bg-white',
    text: isDarkMode ? 'text-white' : 'text-black',
    textMuted: isDarkMode ? 'text-gray-400' : 'text-gray-600',
    border: isDarkMode ? 'border-gray-700' : 'border-gray-200',
    cardBg: isDarkMode ? 'bg-gray-900' : 'bg-gray-50',
    cellEmpty: isDarkMode ? 'bg-gray-800 text-gray-500' : 'bg-gray-100 text-gray-400',
    button: isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300',
  };
  const todayKey = toKey(new Date());

  const anyData = Object.keys(log).some((k) => {
    const day = log[k];
    return day && (day._done || Object.keys(day).some((ex) => ex !== '_done' && hasAnyEntry(day[ex])));
  });

  // The strength sessions, in the order they sit in the week.
  const sessions = [];
  const seen = new Set();
  plan.week.forEach((slot) => {
    const meta = ACTIVITY_META[slot.activityId];
    if (meta.type === 'strength' && !seen.has(slot.activityId)) {
      seen.add(slot.activityId);
      sessions.push({ key: slot.activityId, workout: plan.workouts[slot.activityId] });
    }
  });

  // All logged dates that contain a given exercise, sorted, grouped to weeks.
  const rowsForExercise = (exName) =>
    Object.keys(log)
      .filter((k) => hasAnyEntry(log[k] && log[k][exName]))
      .map((k) => {
        const d = new Date(k);
        const swap = (log[k]._swaps && log[k]._swaps[exName]) || '';
        return { dateKey: k, date: d, w: offsetOf(d), sets: log[k][exName], best: bestWeight(log[k][exName]), swap };
      })
      .sort((a, b) => a.date - b.date);

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} transition-colors`}>
      <div className="max-w-4xl mx-auto px-3 sm:px-4 pb-10">
        <div className="text-center p-4 sm:p-6">
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7" />
            <h1 className="text-2xl sm:text-3xl font-bold">Progress</h1>
            <button type="button" onClick={toggleDark} className={`p-2 rounded-lg ${theme.button} transition-colors`}>
              {isDarkMode ? <Sun className="w-4 h-4 sm:w-5 sm:h-5" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
          </div>
          <p className={`mt-2 text-xs sm:text-sm ${theme.textMuted}`}>Are the weights going up? Log sets in the Workout Log, then track them here.</p>
        </div>

        {!anyData && (
          <div className={`text-center py-10 ${theme.textMuted}`}>
            <p className="text-base sm:text-lg">No workouts logged yet.</p>
            <p className="text-sm mt-1">Head to the Workout Log tab, expand a strength day, and record your sets.</p>
          </div>
        )}

        {anyData && (
          <>
            {/* Consistency grid */}
            <div className={`rounded-xl border ${theme.border} ${theme.cardBg} p-3 sm:p-4 mb-6 overflow-x-auto`}>
              <div className="text-xs font-bold uppercase tracking-wide mb-3 opacity-70">Weekly consistency</div>
              <table className="w-full border-collapse" style={{ minWidth: '520px' }}>
                <thead>
                  <tr>
                    <th className="text-left text-xs font-semibold p-1.5">Week</th>
                    {WEEK_DAY_NAMES.map((n) => (
                      <th key={n} className="text-center text-xs font-semibold p-1.5">{n}</th>
                    ))}
                    <th className="p-1.5"></th>
                  </tr>
                </thead>
                <tbody>
                  {weeks.map((w) => {
                    const ws = weekStartFor(w);
                    const arrangement = weekArrangement(plan, weekPlans, toKey(ws));
                    return (
                      <tr key={w}>
                        <td className={`text-xs p-1.5 whitespace-nowrap ${theme.textMuted}`}>
                          <span className={`${theme.text} font-semibold`}>Wk {w + 1}</span>
                          <span className="hidden sm:inline"> · {ws.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </td>
                        {WEEK_ORDER.map((wd, i) => {
                          const date = addDays(ws, i);
                          const dateKey = toKey(date);
                          const slot = arrangement[i];
                          const meta = ACTIVITY_META[slot.activityId];
                          const day = log[dateKey] || {};
                          const logged = meta.type === 'strength'
                            ? Object.keys(day).some((ex) => ex !== '_done' && hasAnyEntry(day[ex])) || !!day._done
                            : !!day._done;
                          const isStrength = meta.type === 'strength';
                          const isToday = dateKey === todayKey;
                          return (
                            <td key={i} className="p-1 text-center">
                              <div
                                title={`${WEEK_DAY_NAMES[i]} ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — ${meta.label}`}
                                className={`mx-auto w-7 h-7 sm:w-8 sm:h-8 rounded-md flex items-center justify-center text-xs font-bold ${
                                  logged ? 'bg-green-500 text-white' : isStrength ? (isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-300 text-gray-700') : theme.cellEmpty
                                } ${isToday ? 'ring-2 ring-green-400' : ''}`}
                              >
                                {meta.letter}
                              </div>
                            </td>
                          );
                        })}
                        <td className="p-1 text-center">
                          {weekHasData(w) && (
                            <button
                              type="button"
                              onClick={() => deleteWeek(w)}
                              title={`Delete Wk ${w + 1}'s logged data`}
                              className={`p-1 rounded ${isDarkMode ? 'text-gray-400 hover:bg-red-900 hover:text-red-300' : 'text-gray-400 hover:bg-red-100 hover:text-red-600'}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className={`mt-3 text-xs ${theme.textMuted} flex flex-wrap gap-x-4 gap-y-1`}>
                <span><span className="inline-block w-3 h-3 rounded-sm bg-green-500 align-middle mr-1" />done / logged</span>
                <span>S = strength · F = futsal · J = jog/rest · W = walk/recovery</span>
                <span className="inline-flex items-center gap-1"><Trash2 className="w-3 h-3" /> delete a week's data</span>
              </div>
            </div>

            {/* Per-exercise progression */}
            {sessions.map((sess) => (
              <div key={sess.key} className="mb-7">
                <h2 className="text-base sm:text-lg font-bold mb-3">{ACTIVITY_META[sess.key].label} — {sess.workout.title}</h2>
                <div className="space-y-4">
                  {sess.workout.exercises.map((ex) => {
                    const rows = rowsForExercise(ex.name);
                    return (
                      <div key={ex.name} className={`rounded-lg border ${theme.border} ${theme.cardBg} p-3`}>
                        <div className="flex items-baseline justify-between gap-2 mb-2">
                          <span className="font-semibold text-sm">{ex.name}</span>
                          <span className="text-xs text-green-500 font-semibold whitespace-nowrap">target {ex.target}</span>
                        </div>
                        {rows.length === 0 ? (
                          <div className={`text-xs ${theme.textMuted}`}>No entries yet.</div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-sm">
                              <thead>
                                <tr className={`${theme.textMuted}`}>
                                  <th className="text-left text-xs font-semibold p-1.5">Week</th>
                                  {Array.from({ length: ex.sets }, (_, i) => i).map((i) => (
                                    <th key={i} className="text-left text-xs font-semibold p-1.5">Set {i + 1}</th>
                                  ))}
                                  <th className="text-left text-xs font-semibold p-1.5">Top</th>
                                </tr>
                              </thead>
                              <tbody>
                                {rows.map((r, idx) => {
                                  const prevBest = idx > 0 ? rows[idx - 1].best : null;
                                  let trend = null;
                                  if (r.best !== null && prevBest !== null) {
                                    if (r.best > prevBest) trend = { sym: '▲', cls: 'text-green-500' };
                                    else if (r.best < prevBest) trend = { sym: '▼', cls: 'text-red-500' };
                                    else trend = { sym: '=', cls: theme.textMuted };
                                  }
                                  return (
                                    <tr key={r.dateKey} className={`border-t ${theme.border}`}>
                                      <td className="text-xs p-1.5 whitespace-nowrap">
                                        <span className="font-semibold">Wk {r.w + 1}</span>
                                        <span className={`${theme.textMuted}`}> · {r.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                        {r.swap && <div className={`text-[10px] italic ${isDarkMode ? 'text-amber-300' : 'text-amber-700'}`}>↳ {r.swap}</div>}
                                      </td>
                                      {Array.from({ length: ex.sets }, (_, i) => i).map((i) => {
                                        const s = Array.isArray(r.sets) ? r.sets[i] : null;
                                        const w = num(s && s.weight);
                                        const reps = num(s && s.reps);
                                        return (
                                          <td key={i} className="p-1.5 whitespace-nowrap text-xs">
                                            {w !== null || reps !== null ? (
                                              <span>{w !== null ? `${w}kg` : '—'}{reps !== null ? <span className={theme.textMuted}> × {reps}</span> : null}</span>
                                            ) : (
                                              <span className={theme.textMuted}>—</span>
                                            )}
                                          </td>
                                        );
                                      })}
                                      <td className="p-1.5 whitespace-nowrap text-xs font-semibold">
                                        {r.best !== null ? `${r.best}kg` : '—'}
                                        {trend ? <span className={`ml-1 ${trend.cls}`}>{trend.sym}</span> : null}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default GymProgress;
