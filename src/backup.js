// One backup file for the whole app: gym log + plan, bodyweight/waist, and
// nutrition (food + targets). Read straight from localStorage so it
// can be exported from any page.
import { loadPlan, loadWeekPlans } from './gymPlan';
import { FOOD_BY_KEY, dayTotals } from './nutritionData';

const readJson = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch (e) { return fallback; }
};

// Per-day nutrition summary so the numbers can be read without re-adding up the food.
const dailySummary = (nutriLog) => {
  const out = {};
  Object.keys(nutriLog).sort().forEach((dk) => {
    const t = dayTotals(nutriLog[dk]);
    if (!t.has) return;
    out[dk] = { protein: Math.round(t.P), kcalEaten: Math.round(t.K) };
  });
  return out;
};

export const buildBackup = () => {
  const gymLog = readJson('gym_log', {});
  const nutriLog = readJson('nutri_log', {});
  let startDate = null;
  try { startDate = localStorage.getItem('gym_startDate'); } catch (e) {}
  return {
    version: 6,
    exportedAt: new Date().toISOString(),
    // Gym (same keys as the v5 gym export, so older files still import)
    startDate,
    plan: loadPlan(),
    weekPlans: loadWeekPlans(),
    bodyweight: readJson('gym_bodyweight', {}),
    waist: readJson('gym_waist', {}),
    log: gymLog,
    // Nutrition
    nutrition: {
      targets: readJson('nutri_targets', { protein: 150, kcal: 2050 }),
      foods: FOOD_BY_KEY,
      log: nutriLog,
    },
    daily: dailySummary(nutriLog),
  };
};

export const downloadBackup = () => {
  const blob = new Blob([JSON.stringify(buildBackup(), null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `fitness-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Write whatever a backup file contains into localStorage. Pages that are open
// also update their own state from the same data; closed pages read it on mount.
export const writeBackupToStorage = (data) => {
  const set = (k, v) => { try { localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v)); } catch (e) {} };
  if (data.log && typeof data.log === 'object') set('gym_log', data.log);
  if (data.startDate) set('gym_startDate', data.startDate);
  if (data.plan && Array.isArray(data.plan.week) && data.plan.workouts) set('gym_plan', data.plan);
  if (data.weekPlans && typeof data.weekPlans === 'object') set('gym_weekPlans', data.weekPlans);
  if (data.bodyweight && typeof data.bodyweight === 'object') set('gym_bodyweight', data.bodyweight);
  if (data.waist && typeof data.waist === 'object') set('gym_waist', data.waist);
  const n = data.nutrition;
  if (n && n.log && typeof n.log === 'object') set('nutri_log', n.log);
  if (n && n.targets && typeof n.targets === 'object') set('nutri_targets', n.targets);
};
