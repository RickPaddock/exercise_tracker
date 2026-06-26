import React, { useState } from 'react';
import GymLog from './GymTracker';
import GymProgress from './GymProgress';

// Styles adapted from Rick's Nutrition & Training plan, scoped under `.rick-plan`
// so they never clash with the Igor tracker (which uses Tailwind utilities).
const PLAN_CSS = `
.rick-plan { font-family: 'Segoe UI', system-ui, sans-serif; background: #f5f5f0; color: #1a1a1a; padding: 16px; max-width: 820px; margin: 0 auto; }
.rick-plan * { box-sizing: border-box; margin: 0; padding: 0; }
.rick-plan h1 { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
.rick-plan .subtitle { font-size: 13px; color: #666; margin-bottom: 18px; }
.rick-plan .section { background: white; border-radius: 12px; padding: 18px; margin-bottom: 16px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
.rick-plan .section-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #888; margin-bottom: 14px; }
.rick-plan .meal-card { border-left: 3px solid #2d6a4f; padding-left: 14px; margin-bottom: 18px; }
.rick-plan .meal-card:last-child { margin-bottom: 0; }
.rick-plan .meal-title { font-size: 16px; font-weight: 700; margin-bottom: 4px; }
.rick-plan .meal-title a { color: #b65a14; text-decoration: none; font-size: 12px; font-weight: 600; }
.rick-plan .meal-title a:hover { text-decoration: underline; }
.rick-plan .protein-badge { float: right; font-size: 12px; font-weight: 700; color: #2d6a4f; background: #d8f3dc; padding: 2px 10px; border-radius: 20px; }
.rick-plan .meal-items { list-style: none; margin-top: 6px; }
.rick-plan .meal-items li { font-size: 14px; padding: 3px 0; color: #333; padding-left: 14px; position: relative; }
.rick-plan .meal-items li::before { content: "\\00B7"; position: absolute; left: 2px; color: #2d6a4f; font-weight: bold; }
.rick-plan .day-tag { display: inline-block; font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 20px; margin-bottom: 6px; background: #fdecd8; color: #7c3a00; }
.rick-plan .step { display: flex; gap: 12px; margin-bottom: 14px; }
.rick-plan .step:last-child { margin-bottom: 0; }
.rick-plan .step-num { min-width: 26px; height: 26px; background: #2d6a4f; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0; margin-top: 1px; }
.rick-plan .step-content { flex: 1; }
.rick-plan .step-time { font-size: 11px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 3px; }
.rick-plan .step-text { font-size: 14px; color: #333; line-height: 1.5; }
.rick-plan .rule-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px 14px; margin-top: 12px; }
.rick-plan .rule-box p { font-size: 13px; color: #166534; line-height: 1.6; }
.rick-plan .warn-box { background: #fef9ec; border: 1px solid #f5e0a3; border-radius: 8px; padding: 12px 14px; margin-top: 12px; }
.rick-plan .warn-box p { font-size: 13px; color: #7c5e10; line-height: 1.6; }
.rick-plan .shop-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.rick-plan .shop-item { display: flex; align-items: center; gap: 10px; padding: 8px 10px; background: #f9f9f7; border-radius: 8px; }
.rick-plan .shop-item input { width: 16px; height: 16px; accent-color: #2d6a4f; flex-shrink: 0; }
.rick-plan .shop-name { font-size: 13px; color: #333; flex: 1; }
.rick-plan .shop-qty { font-size: 12px; font-weight: 600; color: #2d6a4f; }
.rick-plan table.workout { width: 100%; border-collapse: collapse; margin-top: 4px; }
.rick-plan table.workout th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; color: #888; padding: 6px 4px; border-bottom: 2px solid #eee; }
.rick-plan table.workout td { font-size: 13px; padding: 7px 4px; border-bottom: 1px solid #f2f2f2; color: #333; vertical-align: top; }
.rick-plan table.workout td.ex { font-weight: 600; }
.rick-plan table.workout td.sets { color: #2d6a4f; font-weight: 600; white-space: nowrap; }
.rick-plan .cue { font-size: 12px; color: #777; font-style: italic; }
.rick-plan .week-grid { display: grid; grid-template-columns: 70px 1fr; gap: 0; }
.rick-plan .week-day { font-weight: 700; font-size: 13px; padding: 9px 8px; border-bottom: 1px solid #f2f2f2; color: #2d6a4f; }
.rick-plan .week-act { font-size: 13px; padding: 9px 8px; border-bottom: 1px solid #f2f2f2; color: #333; }
.rick-plan .pill { display:inline-block; font-size: 11px; font-weight: 600; padding: 1px 8px; border-radius: 12px; background:#e7f0ea; color:#2d6a4f; margin-left:6px;}
@media (max-width: 480px) { .rick-plan .shop-grid { grid-template-columns: 1fr; } }
`;

const PlanStyles = () => <style>{PLAN_CSS}</style>;

// ============ NUTRITION PAGE ============
export const NutritionPage = () => (
  <div className="rick-plan">
    <PlanStyles />
    <h1>Nutrition — Sunday Batch Cook</h1>
    <p className="subtitle">~150–165g protein/day · No added sugar · No flour · No fast food · Recomp (lose fat + build muscle)</p>

    {/* BREAKFASTS */}
    <div className="section">
      <div className="section-title">Breakfast — rotate (made fresh)</div>

      <div className="meal-card">
        <div className="meal-title">Eggs, Yogurt &amp; Avocado <span className="protein-badge">~50g</span></div>
        <span className="day-tag">Gym mornings — protein + fat</span>
        <ul className="meal-items">
          <li>4 eggs scrambled in olive oil, smoked paprika, black pepper</li>
          <li>200g Kri Kri 0% yogurt</li>
          <li>½ avocado + handful blueberries</li>
        </ul>
      </div>

      <div className="meal-card">
        <div className="meal-title">Peanut Butter Overnight Oats <span className="protein-badge">~45g</span></div>
        <span className="day-tag">Futsal / jog mornings — carbs, grab-and-go</span>
        <ul className="meal-items">
          <li>60g oats + ½ cup milk + 120g Kri Kri yogurt</li>
          <li>1 scoop whey (optional but recommended)</li>
          <li>1 spoon peanut butter, banana, blueberries, cinnamon</li>
          <li>Mix in a tub the night before, fridge overnight. NO maple syrup.</li>
        </ul>
      </div>

      <div className="meal-card">
        <div className="meal-title">Spinach &amp; Feta Omelette <span className="protein-badge">~35g</span></div>
        <span className="day-tag">Variety day</span>
        <ul className="meal-items">
          <li>4 eggs, handful spinach, small crumble of feta, cherry tomatoes</li>
          <li>Cook flat in olive oil, fold over</li>
        </ul>
      </div>
    </div>

    {/* LUNCHES */}
    <div className="section">
      <div className="section-title">Lunch — carbs included (batch, 5 containers)</div>
      <p className="subtitle" style={{ marginBottom: '14px' }}>Cook 1 big chicken batch, split into two flavours on two trays. Real recipes adapted to your rules (no flour, no added sugar).</p>

      <div className="meal-card">
        <div className="meal-title">Cajun Chicken &amp; Rice <span className="protein-badge">~50g</span></div>
        <a href="https://www.thecookingtwins.com/high-protein-creamy-cajun-chicken-and-rice/" target="_blank" rel="noopener noreferrer">recipe ↗</a>
        <ul className="meal-items">
          <li>Chicken coated in homemade Cajun mix: smoked paprika, garlic powder, onion powder, oregano, cayenne, salt, pepper, olive oil</li>
          <li>Bake 200°C, 23–25 min. Serve over basmati + roasted peppers</li>
          <li><em>Skip the creamy sauce for meal-prep, or make a light version with skimmed milk + a little parmesan</em></li>
        </ul>
      </div>

      <div className="meal-card">
        <div className="meal-title">Greek Lemon-Oregano Chicken &amp; Rice <span className="protein-badge">~50g</span></div>
        <a href="https://beefsteakveg.com/high-protein-meal-prep-for-muscle-gain/" target="_blank" rel="noopener noreferrer">recipe ↗</a>
        <ul className="meal-items">
          <li>Chicken marinated in lemon juice, oregano, garlic, olive oil (30 min+)</li>
          <li>Bake 200°C, 22–25 min. Serve over rice with cucumber + cherry tomato</li>
          <li>Add a dollop of Kri Kri yogurt as a tzatziki-style dip</li>
        </ul>
      </div>

      <div className="meal-card">
        <div className="meal-title">Beef &amp; Broccoli Rice Bowl <span className="protein-badge">~48g</span></div>
        <a href="https://beefsteakveg.com/high-protein-meal-prep-for-muscle-gain/" target="_blank" rel="noopener noreferrer">recipe ↗</a>
        <ul className="meal-items">
          <li>Brown lean beef mince. Add soy sauce, fresh ginger, garlic</li>
          <li>Add broccoli, simmer 3–4 min. Serve over basmati</li>
          <li><em>Skip cornstarch/sugar from the original — soy + ginger carries it</em></li>
        </ul>
      </div>

      <div className="meal-card">
        <div className="meal-title">Spicy Salsa-Roast Chicken &amp; Rice <span className="protein-badge">~52g</span></div>
        <a href="https://beatthebudget.com/recipe/best-chicken-meal-prep/" target="_blank" rel="noopener noreferrer">recipe ↗</a>
        <ul className="meal-items">
          <li>Chicken rubbed with cumin, paprika, garlic powder, salt</li>
          <li>Roast veg (peppers, courgette, onion) under a blitzed salsa of plum tomatoes, chilli, garlic, coriander</li>
          <li>Sear chicken, serve over rice with the saucy veg</li>
        </ul>
      </div>

      <div className="meal-card">
        <div className="meal-title">Moroccan Beef &amp; Rice <span className="protein-badge">~46g</span></div>
        <ul className="meal-items">
          <li>Beef mince with cumin, smoked paprika, cinnamon, diced tomatoes</li>
          <li>Simmer until thick. Serve over rice with roasted courgette</li>
        </ul>
      </div>
    </div>

    {/* DINNERS */}
    <div className="section">
      <div className="section-title">Dinner — NO carbs (batch, 5 containers)</div>

      <div className="meal-card">
        <div className="meal-title">Garlic Herb Salmon <span className="protein-badge">~42g</span></div>
        <span className="day-tag" style={{ background: '#dbeafe', color: '#1e3a8a' }}>Tue / Thu</span>
        <ul className="meal-items">
          <li>Salmon with olive oil, garlic powder, dried dill, lemon zest</li>
          <li>Bake 180°C, 18 min. Eat cold — do NOT microwave</li>
          <li>Serve with roasted veg + wilted spinach</li>
        </ul>
      </div>

      <div className="meal-card">
        <div className="meal-title">Cajun Garlic-Herb Chicken Thighs <span className="protein-badge">~45g</span></div>
        <a href="https://www.tiktok.com/@jalalsamfit/video/7436472441423105313" target="_blank" rel="noopener noreferrer">recipe ↗</a>
        <ul className="meal-items">
          <li>Thighs with salt, Italian herbs, chilli flakes, parsley, garlic + onion powder, paprika, olive oil</li>
          <li>Bake/air-fry 200°C, 22–25 min. Serve with greens (skip the mash for dinner)</li>
        </ul>
      </div>

      <div className="meal-card">
        <div className="meal-title">Spiced Beef Chilli (low-bean) <span className="protein-badge">~40g</span></div>
        <span className="day-tag" style={{ background: '#dbeafe', color: '#1e3a8a' }}>Mon / Wed / Fri</span>
        <ul className="meal-items">
          <li>Beef mince, cumin, paprika, chilli, garlic, diced tomatoes</li>
          <li>Small handful chickpeas if cooked. Serve over greens, not rice</li>
        </ul>
      </div>

      <div className="meal-card">
        <div className="meal-title">Lemon Rosemary Chicken <span className="protein-badge">~44g</span></div>
        <ul className="meal-items">
          <li>Chicken with lemon, fresh rosemary (garden), garlic, olive oil</li>
          <li>Roast. Serve with courgette + broccoli</li>
        </ul>
      </div>

      <div className="meal-card">
        <div className="meal-title">Basil &amp; Garlic Chicken <span className="protein-badge">~44g</span></div>
        <ul className="meal-items">
          <li>Chicken with fresh basil (garden), garlic, olive oil, black pepper</li>
          <li>Roast. Serve over wilted spinach</li>
        </ul>
      </div>
    </div>

    {/* SNACKS */}
    <div className="section">
      <div className="section-title">Allowed Snacks</div>
      <ul className="meal-items">
        <li><strong>2 boiled eggs</strong> (+12g) — boil 10 Sunday, keep in shell</li>
        <li><strong>200g cottage cheese</strong> (+24g) — ideal post-futsal / before bed (slow casein)</li>
        <li><strong>Kri Kri yogurt + berries</strong> (+10g) — if genuinely hungry</li>
        <li><strong>Whey shake</strong> (+25-30g) — fastest way to top up the daily target</li>
      </ul>
      <div className="rule-box"><p>❌ No added sugar · No flour · No fast food. ✅ Snack only when hungry, not from habit.</p></div>
    </div>

    {/* COOK SEQUENCE */}
    <div className="section">
      <div className="section-title">Sunday Cook — Master Sequence (~60 min)</div>
      <div className="step"><div className="step-num">1</div><div className="step-content"><div className="step-time">Night before</div><div className="step-text">Defrost any frozen protein in the fridge. Soak chickpeas overnight if using (150g dried in cold water).</div></div></div>
      <div className="step"><div className="step-num">2</div><div className="step-content"><div className="step-time">0:00 — Eggs + Rice</div><div className="step-text">Boil 10 eggs (9 min simmer, cool, fridge). Rinse 500g basmati, cook with 750ml water — boil, lid on lowest heat 12 min, rest 10 min off heat.</div></div></div>
      <div className="step"><div className="step-num">3</div><div className="step-content"><div className="step-time">0:10 — Chicken, two flavours</div><div className="step-text">Split chicken into 2 bowls. Bowl 1: Cajun mix + olive oil, rub in. Bowl 2: lemon-oregano-garlic + olive oil, rub in. Lay separately on tray(s). Bake 200°C, 23–25 min (75°C internal). Rest 5 min, then slice.</div></div></div>
      <div className="step"><div className="step-num">4</div><div className="step-content"><div className="step-time">0:15 — Roast veg</div><div className="step-text">Courgette, peppers, half the broccoli — olive oil, paprika, garlic, salt. Oven 200°C, 20 min.</div></div></div>
      <div className="step"><div className="step-num">5</div><div className="step-content"><div className="step-time">0:20 — Beef</div><div className="step-text">Brown mince, add cumin/paprika + diced tomatoes, simmer 8–10 min until thick. Cool.</div></div></div>
      <div className="step"><div className="step-num">6</div><div className="step-content"><div className="step-time">0:35 — Greens</div><div className="step-text">Wilt spinach in olive oil + garlic, 5–7 min if frozen (drain off water). Lemon + fresh basil to finish.</div></div></div>
      <div className="step"><div className="step-num">7</div><div className="step-content"><div className="step-time">0:45 — Portion + cool</div><div className="step-text">Fill 5 lunch + 5 dinner containers. Leave open 20–30 min before sealing. Salmon goes in fresh the morning after if cooking separately. Good Mon–Fri.</div></div></div>
      <div className="warn-box"><p><strong>Frozen spinach + broccoli:</strong> cook broccoli first (2–3 min, firm), spinach after (drain water), or the broccoli goes soggy. <strong>Salmon:</strong> always eat cold, never reheat.</p></div>
    </div>

    {/* SHOPPING */}
    <div className="section">
      <div className="section-title">Weekly Shopping List</div>
      <div className="shop-grid">
        <div className="shop-item"><input type="checkbox" /><span className="shop-name">Chicken breast fillets</span><span className="shop-qty">1.5kg</span></div>
        <div className="shop-item"><input type="checkbox" /><span className="shop-name">Chicken thighs (boneless)</span><span className="shop-qty">600g</span></div>
        <div className="shop-item"><input type="checkbox" /><span className="shop-name">Beef mince (lean)</span><span className="shop-qty">650g</span></div>
        <div className="shop-item"><input type="checkbox" /><span className="shop-name">Salmon fillets</span><span className="shop-qty">2–3</span></div>
        <div className="shop-item"><input type="checkbox" /><span className="shop-name">Eggs</span><span className="shop-qty">36</span></div>
        <div className="shop-item"><input type="checkbox" /><span className="shop-name">Kri Kri 0% yogurt</span><span className="shop-qty">1kg</span></div>
        <div className="shop-item"><input type="checkbox" /><span className="shop-name">Cottage cheese</span><span className="shop-qty">500g</span></div>
        <div className="shop-item"><input type="checkbox" /><span className="shop-name">Oats</span><span className="shop-qty">500g</span></div>
        <div className="shop-item"><input type="checkbox" /><span className="shop-name">Peanut butter (natural)</span><span className="shop-qty">1 jar</span></div>
        <div className="shop-item"><input type="checkbox" /><span className="shop-name">Whey protein (optional)</span><span className="shop-qty">1 tub</span></div>
        <div className="shop-item"><input type="checkbox" /><span className="shop-name">Basmati rice</span><span className="shop-qty">500g</span></div>
        <div className="shop-item"><input type="checkbox" /><span className="shop-name">Chickpeas (dried)</span><span className="shop-qty">150g</span></div>
        <div className="shop-item"><input type="checkbox" /><span className="shop-name">Broccoli</span><span className="shop-qty">1.3kg</span></div>
        <div className="shop-item"><input type="checkbox" /><span className="shop-name">Spinach</span><span className="shop-qty">1kg</span></div>
        <div className="shop-item"><input type="checkbox" /><span className="shop-name">Courgette</span><span className="shop-qty">2</span></div>
        <div className="shop-item"><input type="checkbox" /><span className="shop-name">Red peppers</span><span className="shop-qty">2</span></div>
        <div className="shop-item"><input type="checkbox" /><span className="shop-name">Cherry tomatoes</span><span className="shop-qty">1 punnet</span></div>
        <div className="shop-item"><input type="checkbox" /><span className="shop-name">Cucumber</span><span className="shop-qty">1</span></div>
        <div className="shop-item"><input type="checkbox" /><span className="shop-name">Avocados</span><span className="shop-qty">5–6</span></div>
        <div className="shop-item"><input type="checkbox" /><span className="shop-name">Bananas</span><span className="shop-qty">6</span></div>
        <div className="shop-item"><input type="checkbox" /><span className="shop-name">Blueberries</span><span className="shop-qty">1–2 punnets</span></div>
        <div className="shop-item"><input type="checkbox" /><span className="shop-name">Lemons</span><span className="shop-qty">3–4</span></div>
        <div className="shop-item"><input type="checkbox" /><span className="shop-name">Diced tomatoes (canned)</span><span className="shop-qty">2 cans</span></div>
        <div className="shop-item"><input type="checkbox" /><span className="shop-name">Feta</span><span className="shop-qty">small block</span></div>
        <div className="shop-item"><input type="checkbox" /><span className="shop-name">Milk</span><span className="shop-qty">1 carton</span></div>
        <div className="shop-item"><input type="checkbox" /><span className="shop-name">Soy sauce</span><span className="shop-qty">1 bottle</span></div>
        <div className="shop-item"><input type="checkbox" /><span className="shop-name">Fresh ginger</span><span className="shop-qty">1 piece</span></div>
        <div className="shop-item"><input type="checkbox" /><span className="shop-name">Spices: paprika, cumin, cayenne, oregano, onion powder, garlic powder, cinnamon, chilli flakes</span><span className="shop-qty">as needed</span></div>
        <div className="shop-item"><input type="checkbox" /><span className="shop-name">Basil + rosemary</span><span className="shop-qty">garden ✅</span></div>
        <div className="shop-item"><input type="checkbox" /><span className="shop-name">Olive oil</span><span className="shop-qty">1 bottle</span></div>
      </div>
    </div>
  </div>
);

// ============ WORKOUT / GYM OVERVIEW ============
const GymOverview = () => (
  <div className="rick-plan">
    <PlanStyles />
    <h1>Training — 3 Strength + 2 Futsal</h1>
    <p className="subtitle">Full-body ×3 · Futsal Thu &amp; Sun · Goal: all-round strength, legs, posture, visible muscle</p>

    {/* WEEK */}
    <div className="section">
      <div className="section-title">Your Week</div>
      <div className="week-grid">
        <div className="week-day">Mon</div><div className="week-act">Strength — Full body <span className="pill">upper-biased</span></div>
        <div className="week-day">Tue</div><div className="week-act">Light jog or rest</div>
        <div className="week-day">Wed</div><div className="week-act">Strength — Full body <span className="pill">heaviest legs</span></div>
        <div className="week-day">Thu</div><div className="week-act">Futsal 9pm</div>
        <div className="week-day">Fri</div><div className="week-act">Strength — Full body</div>
        <div className="week-day">Sat</div><div className="week-act">Active recovery / walk <span className="pill">protect this</span></div>
        <div className="week-day">Sun</div><div className="week-act">Futsal 9pm</div>
      </div>
      <div className="warn-box"><p><strong>Heaviest squat/RDL on Wednesday</strong> — furthest from both futsal nights so your legs are fresh to play and recovered after. Keep Monday more upper-body if legs feel beaten from Sunday futsal.</p></div>
    </div>

    {/* MONDAY */}
    <div className="section">
      <div className="section-title">Monday — Full Body (upper-biased)</div>
      <table className="workout">
        <tbody>
          <tr><th>Exercise</th><th>Sets×Reps</th></tr>
          <tr><td className="ex">Incline chest press<div className="cue">elbows ~45°, control down, press up</div></td><td className="sets">2 × 6–8</td></tr>
          <tr><td className="ex">Cable fly<div className="cue">slight bend in elbow, squeeze chest</div></td><td className="sets">2 × 10–12</td></tr>
          <tr><td className="ex">Chest-supported row<div className="cue">pull to ribs, shoulder blades back</div></td><td className="sets">1×6–8, 1×8–10</td></tr>
          <tr><td className="ex">Lat pulldown<div className="cue">chest up, drive elbows down</div></td><td className="sets">1×6–8, 1×8–10</td></tr>
          <tr><td className="ex">Leg extension</td><td className="sets">1×8–10, 1×10–12</td></tr>
          <tr><td className="ex">Leg press<div className="cue">feet shoulder-width, don't lock knees hard</div></td><td className="sets">2 × 6–8</td></tr>
          <tr><td className="ex">Superset: bicep curl + tricep pushdown</td><td className="sets">3 × 10–12</td></tr>
        </tbody>
      </table>
    </div>

    {/* WEDNESDAY */}
    <div className="section">
      <div className="section-title">Wednesday — Full Body (heaviest legs)</div>
      <table className="workout">
        <tbody>
          <tr><th>Exercise</th><th>Sets×Reps</th></tr>
          <tr><td className="ex">Shoulder press<div className="cue">don't flare, press slightly forward of head</div></td><td className="sets">2 × 6–8</td></tr>
          <tr><td className="ex">Chest-supported lateral raise<div className="cue">lead with elbows, pinky high</div></td><td className="sets">2 × 10–12</td></tr>
          <tr><td className="ex">Seated row</td><td className="sets">1×6–8, 1×8–10</td></tr>
          <tr><td className="ex">DB row<div className="cue">flat back, pull to hip</div></td><td className="sets">1×6–8, 1×8–10</td></tr>
          <tr><td className="ex">Hamstring curl</td><td className="sets">1×8–10, 1×10–12</td></tr>
          <tr><td className="ex">⚑ Romanian deadlift<div className="cue">hinge at hips, soft knees, bar close, flat back — GET FORM CHECKED</div></td><td className="sets">2 × 6–8</td></tr>
          <tr><td className="ex">Superset: DB curl + skullcrushers</td><td className="sets">3 × 10–12</td></tr>
        </tbody>
      </table>
    </div>

    {/* FRIDAY */}
    <div className="section">
      <div className="section-title">Friday — Full Body</div>
      <table className="workout">
        <tbody>
          <tr><th>Exercise</th><th>Sets×Reps</th></tr>
          <tr><td className="ex">Pec dec fly</td><td className="sets">1×8–10, 1×10–12</td></tr>
          <tr><td className="ex">Seated lateral raise</td><td className="sets">2 × 10–12</td></tr>
          <tr><td className="ex">Close-grip pulldown</td><td className="sets">1×6–8, 1×8–10</td></tr>
          <tr><td className="ex">Low row</td><td className="sets">1×6–8, 1×8–10</td></tr>
          <tr><td className="ex">⚑ Squat variation<div className="cue">chest up, knees track over toes, sit back, full depth — GET FORM CHECKED</div></td><td className="sets">6–8, 8–10, 10–12</td></tr>
          <tr><td className="ex">Lying hamstring curl</td><td className="sets">6–8, 8–10, 10–12</td></tr>
          <tr><td className="ex">Superset: hammer curls + tricep dips</td><td className="sets">to failure</td></tr>
        </tbody>
      </table>
    </div>

    {/* RULES */}
    <div className="section">
      <div className="section-title">The Rules That Actually Matter</div>
      <ul className="meal-items">
        <li><strong>Last set to failure, not every set.</strong> Leave 1–2 reps in reserve on earlier sets — protects recovery at 44 while still building muscle.</li>
        <li><strong>Progressive overload weekly.</strong> Add a little weight or 1 rep each week. This is THE driver of growth. Log it.</li>
        <li><strong>Control the weight.</strong> Slow on the way down (2–3 sec), full range of motion. Half-reps build half-muscle.</li>
        <li><strong>10k steps daily.</strong> Drives the fat loss without touching recovery.</li>
        <li><strong>Sunday-to-Monday is your tightest turnaround.</strong> Sunday futsal → Monday strength. Keep Monday upper-biased.</li>
      </ul>
      <div className="warn-box"><p><strong>⚑ Get these two checked in person</strong> (gym staff or experienced lifter): <strong>Romanian deadlift</strong> and <strong>squat</strong>. These are the only two where bad form risks real injury. The machines are low-risk — one good Jeff Nippard / Athlean-X video each is enough.</p></div>
    </div>

    {/* COVERAGE */}
    <div className="section">
      <div className="section-title">Why This Covers Everything</div>
      <ul className="meal-items">
        <li><strong>Chest:</strong> incline press, cable/pec fly</li>
        <li><strong>Back / posture:</strong> rows + pulldowns every session (your priority)</li>
        <li><strong>Shoulders:</strong> press + lateral raises</li>
        <li><strong>Legs:</strong> leg press, extension, ham curl, RDL, squat — quads, hams, glutes all hit</li>
        <li><strong>Arms:</strong> curls + tricep work supersetted daily</li>
        <li><strong>Conditioning:</strong> covered by 2× futsal — no extra cardio sessions needed</li>
      </ul>
    </div>
  </div>
);

// ============ GYM PAGE (Workout Log + Overview subtabs) ============
const GYM_SUBTABS = [
  { id: 'log', label: '🏋️ Workout Log' },
  { id: 'progress', label: '📈 Progress' },
  { id: 'overview', label: '📋 Overview' },
];

export const GymPage = () => {
  const [sub, setSub] = useState('log');

  return (
    <div>
      <div
        style={{
          display: 'flex',
          gap: '6px',
          padding: '8px 10px',
          background: '#0b1220',
        }}
      >
        {GYM_SUBTABS.map((t) => {
          const isActive = sub === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setSub(t.id)}
              style={{
                flex: 1,
                padding: '9px 10px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: isActive ? '#2d6a4f' : '#1f2937',
                color: isActive ? '#ffffff' : '#9ca3af',
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>
      {sub === 'log' && <GymLog />}
      {sub === 'progress' && <GymProgress />}
      {sub === 'overview' && <GymOverview />}
    </div>
  );
};
