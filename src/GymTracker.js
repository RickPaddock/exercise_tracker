import React, { useState, useEffect } from 'react';
import { Calendar, Dumbbell, Check, Moon, Sun, ChevronDown, ChevronRight } from 'lucide-react';

// The three strength sessions, with their exercises and how many sets to log.
export const WORKOUTS = {
  monday: {
    title: 'Monday — Full Body (upper-biased)',
    exercises: [
      { name: 'Incline chest press', target: '2 × 6–8', sets: 2, cue: 'elbows ~45°, control down, press up' },
      { name: 'Cable fly', target: '2 × 10–12', sets: 2, cue: 'slight bend in elbow, squeeze chest' },
      { name: 'Chest-supported row', target: '1×6–8, 1×8–10', sets: 2, cue: 'pull to ribs, shoulder blades back' },
      { name: 'Lat pulldown', target: '1×6–8, 1×8–10', sets: 2, cue: 'chest up, drive elbows down' },
      { name: 'Leg extension', target: '1×8–10, 1×10–12', sets: 2 },
      { name: 'Leg press', target: '2 × 6–8', sets: 2, cue: "feet shoulder-width, don't lock knees hard" },
      { name: 'Bicep curl + tricep pushdown (superset)', target: '3 × 10–12', sets: 3 },
    ],
  },
  wednesday: {
    title: 'Wednesday — Full Body (heaviest legs)',
    exercises: [
      { name: 'Shoulder press', target: '2 × 6–8', sets: 2, cue: "don't flare, press slightly forward of head" },
      { name: 'Chest-supported lateral raise', target: '2 × 10–12', sets: 2, cue: 'lead with elbows, pinky high' },
      { name: 'Seated row', target: '1×6–8, 1×8–10', sets: 2 },
      { name: 'DB row', target: '1×6–8, 1×8–10', sets: 2, cue: 'flat back, pull to hip' },
      { name: 'Hamstring curl', target: '1×8–10, 1×10–12', sets: 2 },
      { name: '⚑ Romanian deadlift', target: '2 × 6–8', sets: 2, cue: 'hinge at hips, soft knees, bar close, flat back — GET FORM CHECKED' },
      { name: 'DB curl + skullcrushers (superset)', target: '3 × 10–12', sets: 3 },
    ],
  },
  friday: {
    title: 'Friday — Full Body',
    exercises: [
      { name: 'Pec dec fly', target: '1×8–10, 1×10–12', sets: 2 },
      { name: 'Seated lateral raise', target: '2 × 10–12', sets: 2 },
      { name: 'Close-grip pulldown', target: '1×6–8, 1×8–10', sets: 2 },
      { name: 'Low row', target: '1×6–8, 1×8–10', sets: 2 },
      { name: '⚑ Squat variation', target: '6–8, 8–10, 10–12', sets: 3, cue: 'chest up, knees track over toes, sit back, full depth — GET FORM CHECKED' },
      { name: 'Lying hamstring curl', target: '6–8, 8–10, 10–12', sets: 3 },
      { name: 'Hammer curls + tricep dips (superset)', target: 'to failure', sets: 3 },
    ],
  },
};

// Weekly schedule keyed by JS weekday (0 = Sunday … 6 = Saturday).
export const SCHEDULE = {
  1: { type: 'strength', workout: 'monday', label: 'Strength — Full body', pill: 'upper-biased' },
  2: { type: 'rest', label: 'Light jog or rest' },
  3: { type: 'strength', workout: 'wednesday', label: 'Strength — Full body', pill: 'heaviest legs' },
  4: { type: 'futsal', label: 'Futsal 9pm' },
  5: { type: 'strength', workout: 'friday', label: 'Strength — Full body' },
  6: { type: 'recovery', label: 'Active recovery / walk', pill: 'protect this' },
  0: { type: 'futsal', label: 'Futsal 9pm' },
};

// Mon → Sun ordering for display.
export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];
export const DAY_NAMES = { 0: 'Sun', 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat' };
export const DAY_MS = 24 * 60 * 60 * 1000;

export const getMonday = (input) => {
  const date = new Date(input);
  date.setHours(0, 0, 0, 0);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day; // shift back to Monday
  date.setDate(date.getDate() + diff);
  return date;
};

export const addDays = (date, n) => {
  const out = new Date(date);
  out.setDate(out.getDate() + n);
  return out;
};

export const toKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const GymLog = () => {
  const todayIso = new Date().toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(() => {
    try {
      return localStorage.getItem('gym_startDate') || todayIso;
    } catch (e) {
      return todayIso;
    }
  });
  const [log, setLog] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('gym_log')) || {};
    } catch (e) {
      return {};
    }
  });
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('gym_isDarkMode')) ?? true;
    } catch (e) {
      return true;
    }
  });

  const computeOffset = (start) => {
    const w = Math.round((getMonday(new Date()).getTime() - getMonday(new Date(start)).getTime()) / (7 * DAY_MS));
    return w > 0 ? w : 0;
  };
  const [weekOffset, setWeekOffset] = useState(() => computeOffset(startDate));
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    try { localStorage.setItem('gym_startDate', startDate); } catch (e) {}
  }, [startDate]);
  useEffect(() => {
    try { localStorage.setItem('gym_log', JSON.stringify(log)); } catch (e) {}
  }, [log]);
  useEffect(() => {
    try { localStorage.setItem('gym_isDarkMode', JSON.stringify(isDarkMode)); } catch (e) {}
  }, [isDarkMode]);

  const startMonday = getMonday(startDate);
  const weekStart = addDays(startMonday, weekOffset * 7);
  const days = WEEK_ORDER.map((_, i) => addDays(weekStart, i));

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

  const resetAll = () => {
    if (window.confirm('Reset the gym log? This clears every logged set and cannot be undone.')) {
      setStartDate(todayIso);
      setLog({});
      setIsDarkMode(true);
      setWeekOffset(0);
      try {
        localStorage.removeItem('gym_startDate');
        localStorage.removeItem('gym_log');
        localStorage.removeItem('gym_isDarkMode');
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

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} transition-colors`}>
      <div className="max-w-3xl mx-auto px-3 sm:px-4">
        {/* Header */}
        <div className="text-center p-4 sm:p-6 relative">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4">
            <Dumbbell className="w-6 h-6 sm:w-8 sm:h-8" />
            <h1 className="text-2xl sm:text-3xl font-bold">Gym Workout Log</h1>
            <button
              type="button"
              onClick={() => setIsDarkMode((p) => !p)}
              className={`p-2 rounded-lg ${theme.button} transition-colors`}
            >
              {isDarkMode ? <Sun className="w-4 h-4 sm:w-5 sm:h-5" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
          </div>

          <button
            type="button"
            onClick={resetAll}
            className={`absolute top-4 right-4 px-3 py-2 rounded-lg ${theme.button} hover:bg-red-600 hover:text-white transition-colors text-sm`}
          >
            Reset All
          </button>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-3">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
            <label className="font-medium text-sm sm:text-base">Start Date:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setWeekOffset(0);
              }}
              className={`px-3 py-2 rounded-lg ${theme.input} border focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base`}
            />
          </div>
          <div className={`mb-2 ${theme.textMuted} text-xs sm:text-sm`}>Today: {getCurrentDate()}</div>
        </div>

        {/* Week navigation */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <button
            type="button"
            onClick={() => setWeekOffset((w) => Math.max(0, w - 1))}
            disabled={weekOffset === 0}
            className={`px-3 py-2 rounded-lg ${theme.button} transition-colors text-sm disabled:opacity-40`}
          >
            ← Prev
          </button>
          <div className="text-center">
            <div className="font-semibold text-sm sm:text-base">Week {weekOffset + 1}</div>
            <div className={`text-xs ${theme.textMuted}`}>{weekLabel}</div>
            <button
              type="button"
              onClick={() => setWeekOffset(computeOffset(startDate))}
              className="text-green-500 hover:text-green-400 text-xs underline mt-0.5"
            >
              Jump to this week
            </button>
          </div>
          <button
            type="button"
            onClick={() => setWeekOffset((w) => w + 1)}
            className={`px-3 py-2 rounded-lg ${theme.button} transition-colors text-sm`}
          >
            Next →
          </button>
        </div>

        {/* Day cards */}
        <div className="space-y-3 pb-8">
          {days.map((date) => {
            const wd = date.getDay();
            const sched = SCHEDULE[wd];
            const dateKey = toKey(date);
            const isToday = dateKey === todayKey;
            const isStrength = sched.type === 'strength';
            const isOpen = !!expanded[dateKey];
            const done = !!(log[dateKey] && log[dateKey]._done);

            return (
              <div
                key={dateKey}
                className={`rounded-xl border ${theme.border} ${theme.cardBg} ${isToday ? 'ring-2 ring-green-500' : ''} overflow-hidden`}
              >
                <div className="flex items-center gap-3 p-3 sm:p-4">
                  <div className="text-center min-w-[44px]">
                    <div className="font-bold text-sm">{DAY_NAMES[wd]}</div>
                    <div className={`text-xs ${theme.textMuted}`}>
                      {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={!isStrength}
                    onClick={() => isStrength && setExpanded((p) => ({ ...p, [dateKey]: !p[dateKey] }))}
                    className={`flex-1 text-left flex items-center gap-2 ${isStrength ? 'cursor-pointer' : 'cursor-default'}`}
                  >
                    {isStrength && (isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />)}
                    <span className="text-sm sm:text-base font-medium">{sched.label}</span>
                    {sched.pill && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-900 text-green-200">
                        {sched.pill}
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleDone(dateKey)}
                    title="Mark done"
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                      done
                        ? 'bg-green-500 border-green-500 text-white hover:bg-green-600'
                        : isDarkMode
                          ? 'border-gray-600 hover:border-green-400'
                          : 'border-gray-300 hover:border-green-400'
                    }`}
                  >
                    {done && <Check className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </button>
                </div>

                {/* Strength workout log */}
                {isStrength && isOpen && (
                  <div className={`border-t ${theme.border} p-3 sm:p-4 space-y-4`}>
                    {WORKOUTS[sched.workout].exercises.map((ex) => (
                      <div key={ex.name}>
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="font-semibold text-sm">{ex.name}</span>
                          <span className="text-xs text-green-500 font-semibold whitespace-nowrap">{ex.target}</span>
                        </div>
                        {ex.cue && <div className={`text-xs italic ${theme.textMuted} mb-1`}>{ex.cue}</div>}
                        <div className="space-y-1.5 mt-1.5">
                          {Array.from({ length: ex.sets }, (_, i) => i).map((setIdx) => (
                            <div key={setIdx} className="flex items-center gap-2">
                              <span className={`text-xs ${theme.textMuted} w-12`}>Set {setIdx + 1}</span>
                              <input
                                type="number"
                                inputMode="decimal"
                                placeholder="kg"
                                value={getEntry(dateKey, ex.name, setIdx, 'weight')}
                                onChange={(e) => setEntry(dateKey, ex.name, setIdx, 'weight', e.target.value)}
                                className={`w-20 px-2 py-1 rounded-md ${theme.input} border text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                              />
                              <span className={`text-xs ${theme.textMuted}`}>kg ×</span>
                              <input
                                type="number"
                                inputMode="numeric"
                                placeholder="reps"
                                value={getEntry(dateKey, ex.name, setIdx, 'reps')}
                                onChange={(e) => setEntry(dateKey, ex.name, setIdx, 'reps', e.target.value)}
                                className={`w-20 px-2 py-1 rounded-md ${theme.input} border text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                              />
                              <span className={`text-xs ${theme.textMuted}`}>reps</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GymLog;
