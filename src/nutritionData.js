// Nutrition data shared by the Daily Intake tracker and the backup export.

// Simple building blocks you count in everyday portions — no exact weighing needed.
// Protein/kcal per unit are honest rough estimates; nudge the targets to suit.
export const FOOD_GROUPS = [
  {
    category: 'Protein',
    items: [
      { key: 'eggs', name: 'Eggs', unit: 'per egg', protein: 6, kcal: 75 },
      { key: 'chicken', name: 'Chicken breast', unit: 'palm ~150g', protein: 45, kcal: 250 },
      { key: 'beef', name: 'Lean beef mince', unit: 'portion ~150g', protein: 38, kcal: 280 },
      { key: 'salmon', name: 'Salmon', unit: 'fillet ~150g', protein: 42, kcal: 300 },
      { key: 'yogurt', name: 'Kri Kri 0% yogurt', unit: '200g', protein: 20, kcal: 110 },
      { key: 'cottage', name: 'Cottage cheese', unit: '200g', protein: 24, kcal: 160 },
      { key: 'whey', name: 'Whey shake (with milk)', unit: '1 scoop + 250ml', protein: 32, kcal: 245 },
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

export const FOOD_BY_KEY = {};
FOOD_GROUPS.forEach((g) => g.items.forEach((i) => { FOOD_BY_KEY[i.key] = i; }));

// A day is { items: {foodKey: qty}, custom: [{id,name,protein,kcal}], burn, steps }.
// burn = Garmin "Total calories" for the day; steps = Garmin steps (both typed in, as strings).
export const normalizeDay = (raw) => {
  if (!raw) return { items: {}, custom: [], burn: '', steps: '' };
  if (Array.isArray(raw)) return { items: {}, custom: raw, burn: '', steps: '' }; // migrate old format
  return {
    items: raw.items || {},
    custom: Array.isArray(raw.custom) ? raw.custom : [],
    burn: raw.burn ?? '',
    steps: raw.steps ?? '',
  };
};

// Protein/kcal eaten for a (raw or normalized) day; `has` = any food logged.
export const dayTotals = (raw) => {
  const d = normalizeDay(raw);
  let P = 0;
  let K = 0;
  Object.keys(d.items).forEach((k) => {
    const f = FOOD_BY_KEY[k];
    if (f && d.items[k] > 0) { P += f.protein * d.items[k]; K += f.kcal * d.items[k]; }
  });
  d.custom.forEach((c) => { P += parseFloat(c.protein) || 0; K += parseFloat(c.kcal) || 0; });
  return { P, K, has: Object.keys(d.items).length > 0 || d.custom.length > 0 };
};

// Parse a typed number; '' / junk → null.
export const numOrNull = (v) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : null;
};
