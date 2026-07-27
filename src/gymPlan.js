// Shared gym plan: editable weekly schedule + workout definitions, plus date helpers.
// No React here so both the log and the progress view can import freely.

export const DAY_MS = 24 * 60 * 60 * 1000;
// Mon → Sun, by index. (JS getDay weekday for each position.)
export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];
export const WEEK_DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const DAY_NAMES = { 0: 'Sun', 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat' };

export const getMonday = (input) => {
  const date = new Date(input);
  date.setHours(0, 0, 0, 0);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
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

// Default exercise definitions for the three strength sessions.
export const DEFAULT_WORKOUTS = {
  monday: {
    title: 'Full Body (upper-biased)',
    note: 'If legs are heavy from Sunday futsal, reduce leg press/extension weight or skip leg extensions — scheduling, not failure.',
    exercises: [
      { name: 'Incline chest press', target: '2 × 6–8', sets: 2, cue: 'elbows ~45°, control down, press up' },
      { name: 'Cable fly', target: '2 × 10–12', sets: 2, cue: 'slight bend in elbow, squeeze chest' },
      { name: 'Chest-supported row', target: '1×6–8, 1×8–10', sets: 2, cue: 'pull to ribs, shoulder blades back' },
      { name: 'Lat pulldown', target: '1×6–8, 1×8–10', sets: 2, cue: 'chest up, drive elbows down' },
      { name: 'Leg extension', target: '1×8–10, 1×10–12', sets: 2 },
      { name: 'Leg press', target: '2 × 6–8', sets: 2, cue: "feet shoulder-width, don't lock knees hard" },
      { name: 'Standing calf raise', target: '3 × 12–15', sets: 3, cue: 'full stretch at the bottom, pause and squeeze at the top, no bouncing' },
      { name: 'Bicep curl', target: '3 × 10–12', sets: 3, tag: 'superset', cue: 'superset with tricep pushdown — alternate, minimal rest' },
      { name: 'Tricep pushdown', target: '3 × 10–12', sets: 3, tag: 'superset' },
      { name: 'Plank', target: '3 × 45 sec', sets: 3, cue: "straight line shoulders to heels, squeeze glutes, don't let hips sag" },
    ],
  },
  wednesday: {
    title: 'Full Body (heaviest legs)',
    exercises: [
      { name: 'Shoulder press', target: '2 × 6–8', sets: 2, cue: "don't flare, press slightly forward of head" },
      { name: 'Chest-supported lateral raise', target: '2 × 10–12', sets: 2, cue: 'lead with elbows, pinky high' },
      { name: 'Seated row', target: '1×6–8, 1×8–10', sets: 2 },
      { name: 'DB row', target: '1×6–8, 1×8–10', sets: 2, cue: 'flat back, pull to hip' },
      { name: 'Face pull', target: '2 × 15', sets: 2, cue: 'pull rope to forehead, elbows high, squeeze shoulder blades — posture priority' },
      { name: 'Hamstring curl', target: '1×8–10, 1×10–12', sets: 2 },
      { name: '⚑ Romanian deadlift', target: '2 × 6–8', sets: 2, cue: 'hinge at hips, soft knees, bar close, flat back — GET FORM CHECKED' },
      { name: 'Standing calf raise', target: '3 × 12–15', sets: 3, cue: 'full stretch at the bottom, pause and squeeze at the top, no bouncing' },
      { name: 'DB curl', target: '3 × 10–12', sets: 3, tag: 'superset', cue: 'superset with skullcrushers — alternate, minimal rest' },
      { name: 'Skullcrushers', target: '3 × 10–12', sets: 3, tag: 'superset' },
    ],
  },
  friday: {
    title: 'Full Body',
    exercises: [
      { name: 'Pec dec fly', target: '1×8–10, 1×10–12', sets: 2 },
      { name: 'Seated lateral raise', target: '2 × 10–12', sets: 2 },
      { name: 'Close-grip pulldown', target: '1×6–8, 1×8–10', sets: 2 },
      { name: 'Low row', target: '1×6–8, 1×8–10', sets: 2 },
      { name: '⚑ Squat variation', target: '6–8, 8–10, 10–12', sets: 3, cue: 'chest up, knees track over toes, sit back, full depth — GET FORM CHECKED' },
      { name: 'Lying hamstring curl', target: '6–8, 8–10, 10–12', sets: 3 },
      { name: 'Seated calf raise', target: '3 × 12–15', sets: 3, cue: 'full stretch at the bottom, pause at the top; seated hits the lower calf (soleus)' },
      { name: 'Hammer curls', target: 'to failure', sets: 3, tag: 'superset', cue: 'superset with tricep dips — alternate, minimal rest' },
      { name: 'Tricep dips', target: 'to failure', sets: 3, tag: 'superset' },
      { name: 'Hanging knee raise', target: '3 × 10–12', sets: 3, cue: 'hang from a pull-up bar, lift knees to chest with control, no swinging' },
    ],
  },
};

// Metadata for each activity that can sit on a day.
export const ACTIVITY_META = {
  monday: { type: 'strength', label: 'Strength — Full body', pill: 'upper-biased', letter: 'S' },
  wednesday: { type: 'strength', label: 'Strength — Full body', pill: 'heaviest legs', letter: 'S' },
  friday: { type: 'strength', label: 'Strength — Full body', pill: '', letter: 'S' },
  futsal: { type: 'futsal', label: 'Futsal 9pm', pill: '', letter: 'F' },
  rest: { type: 'rest', label: 'Light jog or rest', pill: '', letter: 'J' },
  recovery: { type: 'recovery', label: 'Active recovery / walk', pill: 'protect this', letter: 'W' },
};

// Default week, Mon → Sun. Each slot has a stable id so drag reordering is robust
// even though "futsal" appears twice.
export const DEFAULT_WEEK = [
  { id: 'd1', activityId: 'monday' },
  { id: 'd2', activityId: 'rest' },
  { id: 'd3', activityId: 'wednesday' },
  { id: 'd4', activityId: 'futsal' },
  { id: 'd5', activityId: 'friday' },
  { id: 'd6', activityId: 'recovery' },
  { id: 'd7', activityId: 'futsal' },
];

const clone = (obj) => JSON.parse(JSON.stringify(obj));

export const defaultPlan = () => ({
  week: clone(DEFAULT_WEEK),
  workouts: clone(DEFAULT_WORKOUTS),
});

export const loadPlan = () => {
  try {
    const raw = JSON.parse(localStorage.getItem('gym_plan'));
    if (raw && Array.isArray(raw.week) && raw.week.length === 7 && raw.workouts) {
      const workouts = {};
      ['monday', 'wednesday', 'friday'].forEach((k) => {
        const w = raw.workouts[k];
        workouts[k] =
          w && Array.isArray(w.exercises) && w.exercises.length
            ? { title: w.title || DEFAULT_WORKOUTS[k].title, exercises: w.exercises }
            : clone(DEFAULT_WORKOUTS[k]);
      });
      // Make sure every slot references a known activity.
      const week = raw.week.map((slot, i) => ({
        id: slot && slot.id ? slot.id : `d${i + 1}`,
        activityId: ACTIVITY_META[slot && slot.activityId] ? slot.activityId : DEFAULT_WEEK[i].activityId,
      }));
      return { week, workouts };
    }
  } catch (e) {}
  return defaultPlan();
};

export const savePlan = (plan) => {
  try {
    localStorage.setItem('gym_plan', JSON.stringify(plan));
  } catch (e) {}
};

// Per-week day-arrangement overrides, keyed by that week's Monday date (toKey).
// Value is a 7-slot array like plan.week. Weeks without an override use plan.week.
export const loadWeekPlans = () => {
  try {
    const r = JSON.parse(localStorage.getItem('gym_weekPlans'));
    return r && typeof r === 'object' && !Array.isArray(r) ? r : {};
  } catch (e) {
    return {};
  }
};

export const saveWeekPlans = (wp) => {
  try {
    localStorage.setItem('gym_weekPlans', JSON.stringify(wp));
  } catch (e) {}
};

// The day arrangement in effect for a given week's Monday key.
export const weekArrangement = (plan, weekPlans, mondayKey) => {
  const o = weekPlans[mondayKey];
  return Array.isArray(o) && o.length === 7 ? o : plan.week;
};
