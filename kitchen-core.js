/* PACE Kitchen core — turns meal text ("Oats 80g", "Dal 1 katori", "Whey 1 scoop")
   into ingredient amounts, and compares them with what's in the kitchen.
   Plain JS with no DOM: used by the app (window.PaceKitchen) and the reminder server (globalThis.PaceKitchen). */
(function (root) {
  // unit = base unit we store: g | ml | pcs | scoop | sachet | slice
  // per = grams (or ml) in one piece/serving when text gives a count; cooked = raw ÷ cooked weight
  // def = amount used when the text gives no quantity (already raw)
  const C = (key, name, emoji, cat, unit, re, o = {}) => ({ key, name, emoji, cat, unit, re, per: o.per, def: o.def ?? 1, cooked: o.cooked, tbsp: o.tbsp, tsp: o.tsp, fixed: o.fixed });
  const CATALOG = [
    // ── protein
    C('eggs', 'Eggs', '🥚', 'protein', 'pcs', /egg\s*whites?|\beggs?\b|omelette|\banda\b/i, { per: 50, def: 2 }),
    C('chicken', 'Chicken', '🍗', 'protein', 'g', /chicken/i, { def: 150 }),
    C('tuna', 'Tuna', '🐟', 'protein', 'g', /tuna/i, { def: 100 }),
    C('fish', 'Fish', '🐟', 'protein', 'g', /fish|rohu|pomfret|salmon|basa/i, { def: 150 }),
    C('paneer', 'Paneer', '🧀', 'protein', 'g', /paneer|cottage cheese/i, { def: 100 }),
    C('tofu', 'Tofu', '⬜', 'protein', 'g', /tofu/i, { def: 150 }),
    C('tempeh', 'Tempeh', '🟫', 'protein', 'g', /tempeh/i, { def: 100 }),
    C('soya_chunks', 'Soya chunks', '🟤', 'protein', 'g', /soya chunks?|soy chunks?|nutrela/i, { per: 50, def: 50 }),
    C('whey', 'Protein powder', '🥤', 'supplements', 'scoop', /whey|protein powder|plant protein|casein/i, { per: 30, def: 1 }),
    C('sprouts', 'Sprouts', '🌱', 'protein', 'g', /sprouts/i, { def: 100 }),
    C('edamame', 'Edamame', '🫛', 'protein', 'g', /edamame/i, { def: 100 }),
    C('rajma', 'Rajma (dry)', '🫘', 'grains', 'g', /rajma|kidney beans?/i, { cooked: 0.4, def: 60 }),
    C('black_beans', 'Black beans (dry)', '🫘', 'grains', 'g', /black beans?/i, { cooked: 0.4, def: 60 }),
    C('chole', 'Chickpeas (dry)', '🫘', 'grains', 'g', /chole|chickpeas?|kabuli|\bchana\b(?!\s*dal)/i, { cooked: 0.4, def: 60 }),
    C('dal', 'Dal (dry)', '🟡', 'grains', 'g', /\bdal\b|lentils?|moong|masoor|toor|arhar/i, { cooked: 0.4, def: 60 }),
    // ── dairy & drinks
    C('soy_milk', 'Soy milk', '🥛', 'dairy', 'ml', /soya? milk/i, { def: 250 }),
    C('almond_milk', 'Almond milk', '🥛', 'dairy', 'ml', /almond milk/i, { def: 250 }),
    C('oat_milk', 'Oat milk', '🥛', 'dairy', 'ml', /oat milk/i, { def: 250 }),
    C('coconut_water', 'Coconut water', '🥥', 'other', 'pcs', /coconut water|nariyal pani/i, { per: 250, def: 1 }),
    C('greek_yogurt', 'Greek yogurt', '🥣', 'dairy', 'g', /greek yogh?urt/i, { def: 150 }),
    C('curd', 'Curd', '🥣', 'dairy', 'g', /chaas|buttermilk|lassi/i, { fixed: 125 }),
    C('curd', 'Curd', '🥣', 'dairy', 'g', /yogh?urt|dahi|curd|raita/i, { def: 150 }),
    C('milk', 'Milk', '🥛', 'dairy', 'ml', /milk|doodh/i, { def: 250 }),
    C('coffee', 'Coffee', '☕', 'other', 'sachet', /coffee/i, { def: 1 }),
    C('green_tea', 'Green tea', '🍵', 'other', 'sachet', /green tea/i, { def: 1 }),
    // ── grains
    C('oats', 'Oats', '🌾', 'grains', 'g', /\boats?\b/i, { per: 40, def: 50 }),
    C('besan', 'Besan', '🟨', 'grains', 'g', /besan|gram flour/i, { per: 30, def: 60 }),
    C('poha', 'Poha', '🍚', 'grains', 'g', /poha/i, { cooked: 1 / 3, def: 50 }),
    C('suji', 'Suji / rava', '🍚', 'grains', 'g', /upma|suji|sooji|rava/i, { cooked: 1 / 3, def: 50 }),
    C('dalia', 'Dalia', '🌾', 'grains', 'g', /dalia|daliya|broken wheat/i, { cooked: 0.25, def: 50 }),
    C('cornflakes', 'Cornflakes / muesli', '🥣', 'grains', 'g', /cornflakes|corn flakes|muesli|granola/i, { def: 30 }),
    C('rice_cakes', 'Rice cakes', '🍘', 'grains', 'pcs', /rice cakes?/i, { per: 9, def: 2 }),
    C('brown_rice', 'Brown rice', '🍚', 'grains', 'g', /brown rice/i, { cooked: 1 / 3, def: 50 }),
    C('rice', 'Rice', '🍚', 'grains', 'g', /\brice\b/i, { cooked: 1 / 3, def: 50 }),
    C('quinoa', 'Quinoa', '🌾', 'grains', 'g', /quinoa/i, { cooked: 1 / 3, def: 50 }),
    C('pasta', 'Pasta', '🍝', 'grains', 'g', /pasta|macaroni|spaghetti/i, { cooked: 0.4, def: 60 }),
    C('atta', 'Atta', '🫓', 'grains', 'g', /paratha/i, { per: 45, def: 90 }),
    C('atta', 'Atta', '🫓', 'grains', 'g', /roti|chapati|phulka/i, { per: 30, def: 60 }),
    C('bread', 'Bread', '🍞', 'grains', 'slice', /bread|toast/i, { per: 30, def: 2 }),
    C('sweet_potato', 'Sweet potato', '🍠', 'veg', 'g', /sweet potato|shakarkandi/i, { def: 150 }),
    // ── nuts, seeds, fats
    C('peanut_butter', 'Peanut butter', '🥜', 'other', 'g', /peanut butter/i, { tbsp: 16, tsp: 5, def: 32 }),
    C('peanuts', 'Peanuts', '🥜', 'other', 'g', /peanuts?|groundnuts?(?!\s*oil)/i, { def: 30 }),
    C('almonds', 'Almonds', '🌰', 'other', 'g', /almonds?|badam/i, { per: 1.2, def: 12 }),
    C('walnuts', 'Walnuts', '🌰', 'other', 'g', /walnuts?|akhrot/i, { per: 4, def: 12 }),
    C('dates', 'Dates', '🟤', 'fruit', 'g', /\bdates?\b|khajur/i, { per: 8, def: 16 }),
    C('chia', 'Chia seeds', '⚫', 'other', 'g', /chia/i, { tbsp: 10, def: 10 }),
    C('flax', 'Flax seeds', '🟫', 'other', 'g', /flax|alsi/i, { tbsp: 10, def: 10 }),
    C('honey', 'Honey', '🍯', 'other', 'g', /honey|shehad/i, { tbsp: 21, tsp: 7, def: 15 }),
    C('ghee', 'Ghee', '🧈', 'other', 'g', /ghee/i, { tbsp: 14, tsp: 5, def: 5 }),
    C('oil', 'Cooking oil', '🫗', 'other', 'ml', /\boil\b/i, { tbsp: 15, tsp: 5, def: 5 }),
    // ── fruit & veg
    C('banana', 'Banana', '🍌', 'fruit', 'pcs', /banana|kela/i, { per: 118, def: 1 }),
    C('apple', 'Apple', '🍎', 'fruit', 'pcs', /apple|seb/i, { per: 180, def: 1 }),
    C('orange', 'Orange', '🍊', 'fruit', 'pcs', /orange|santra|mosambi/i, { per: 150, def: 1 }),
    C('papaya', 'Papaya', '🧡', 'fruit', 'g', /papaya/i, { def: 150 }),
    C('lemon', 'Lemon', '🍋', 'fruit', 'pcs', /lemon|nimbu/i, { per: 50, fixed: 0.5 }),
    C('spinach', 'Spinach', '🥬', 'veg', 'g', /palak|spinach/i, { def: 150 }),
    C('broccoli', 'Broccoli', '🥦', 'veg', 'g', /broccoli/i, { def: 100 }),
    C('mushrooms', 'Mushrooms', '🍄', 'veg', 'g', /mushrooms?/i, { def: 100 }),
    C('capsicum', 'Capsicum', '🫑', 'veg', 'g', /capsicum|bell peppers?/i, { def: 100 }),
    C('beans', 'Green beans', '🫛', 'veg', 'g', /green beans|french beans/i, { def: 150 }),
    C('bhindi', 'Bhindi', '🟢', 'veg', 'g', /bhindi|okra/i, { def: 150 }),
    C('cauliflower', 'Cauliflower', '🥦', 'veg', 'g', /gobhi|cauliflower/i, { def: 150 }),
    C('carrot', 'Carrot', '🥕', 'veg', 'g', /gajar|carrots?/i, { def: 100 }),
    C('peas', 'Peas', '🟢', 'veg', 'g', /matar|peas/i, { def: 80 }),
    C('zucchini', 'Zucchini', '🥒', 'veg', 'g', /zucchini/i, { def: 150 }),
  ];
  const CATS = { protein: 'Protein', dairy: 'Dairy', grains: 'Grains & dals', fruit: 'Fruits', veg: 'Vegetables', supplements: 'Supplements', other: 'Other' };
  const byKey = {};
  CATALOG.forEach(c => { if (!byKey[c.key]) byKey[c.key] = c; });
  const UNTRACKED = /^\s*(salad|mixed veg|sabzi|veg curry|curry|sambar|soup(?! chicken))/i;

  const GRAMMY = { kg: 1000, g: 1, gm: 1, gms: 1, gram: 1, grams: 1, ml: 1, l: 1000, ltr: 1000, litre: 1000, litres: 1000, liter: 1000, liters: 1000 };
  const COOKED_VOL = { katori: 150, katoris: 150, bowl: 200, bowls: 200, plate: 150, plates: 150, cup: 200, cups: 200, glass: 250, glasses: 250 };
  const QTY = /(\d+(?:\.\d+)?)\s*(?:-\s*(\d+(?:\.\d+)?))?\s*(kg|gms?|grams?|g|ml|ltr|litres?|liters?|l|scoops?|sachets?|slices?|katoris?|bowls?|plates?|glass(?:es)?|cups?|tbsp|tsp|nos|pcs|pieces?|eggs?|whites?)?\b/i;

  function amountFor(entry, part) {
    if (entry.fixed) return entry.fixed;
    const text = part.replace(/\([^)]*\)/g, ' ');
    const raw = /\b(raw|dry|uncooked)\b/i.test(text);
    const cook = v => (entry.cooked && !raw ? v * entry.cooked : v);
    const fromWeight = w => entry.unit === 'g' || entry.unit === 'ml' ? cook(w) : w / (entry.per || 1);
    const m = text.match(QTY);
    if (/handful/i.test(text) && !m) return fromWeight(30);
    if (!m) return entry.def;
    const n = m[2] ? (+m[1] + +m[2]) / 2 : +m[1];
    const u = (m[3] || '').toLowerCase();
    if (GRAMMY[u] !== undefined) return fromWeight(n * GRAMMY[u]);
    if (COOKED_VOL[u] !== undefined) return fromWeight(n * COOKED_VOL[u]);
    if (u === 'tbsp') { const w = n * (entry.tbsp || 15); return entry.unit === 'g' || entry.unit === 'ml' ? w : w / (entry.per || 1); }
    if (u === 'tsp') { const w = n * (entry.tsp || 5); return entry.unit === 'g' || entry.unit === 'ml' ? w : w / (entry.per || 1); }
    // a plain count: "Banana 2", "Eggs 3", "Roti 3", "Almonds 10-12 nos", "1 scoop"
    if (entry.unit === 'g' || entry.unit === 'ml') return n * (entry.per || entry.def);
    return n;
  }
  const round = (v, unit) => unit === 'g' || unit === 'ml' ? Math.round(v) : Math.round(v * 2) / 2;

  // One item string → [{key, amt}] (tracked) or untracked text
  function parseItem(text, pantry) {
    const out = [], untracked = [];
    const safe = String(text || '').replace(/\([^)]*\)/g, m => m.replace(/[+,]/g, '&'));
    safe.split(/\s\+\s|,|\bwith\b/i).map(s => s.trim()).filter(Boolean).forEach(part => {
      if (UNTRACKED.test(part)) { untracked.push(part); return; }
      const e = CATALOG.find(c => c.re.test(part));
      if (e) { out.push({ key: e.key, amt: round(amountFor(e, part), e.unit) }); return; }
      // custom kitchen items match by name ("Makhana 30g" ↔ custom "Makhana")
      const c = (pantry || []).find(p => p.key.startsWith('c:') && new RegExp('\\b' + p.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i').test(part));
      if (c) {
        const m = part.match(QTY), n = m ? (m[2] ? (+m[1] + +m[2]) / 2 : +m[1]) : 1, u = m && (m[3] || '').toLowerCase();
        const amt = GRAMMY[u] !== undefined && (c.unit === 'g' || c.unit === 'ml') ? n * GRAMMY[u] : (c.unit === 'g' || c.unit === 'ml') && !u ? 0 : n;
        if (amt) out.push({ key: c.key, amt: round(amt, c.unit) }); else untracked.push(part);
        return;
      }
      untracked.push(part);
    });
    return { items: out, untracked };
  }

  function mealNeeds(meal, pantry) {
    const items = Array.isArray(meal.items) ? meal.items : String(meal.items || '').split(',');
    const need = {}, untracked = [];
    items.forEach(t => { const r = parseItem(t, pantry); r.items.forEach(i => (need[i.key] = (need[i.key] || 0) + i.amt)); untracked.push(...r.untracked); });
    return { need, untracked };
  }

  function needsForMeals(meals, pantry) {
    const need = {}, untracked = new Set();
    (meals || []).forEach(m => { const r = mealNeeds(m, pantry); Object.entries(r.need).forEach(([k, v]) => (need[k] = (need[k] || 0) + v)); r.untracked.forEach(u => untracked.add(u)); });
    return { need, untracked: [...untracked] };
  }

  // Compare needs with stock → rows with status 'ok' | 'short' | 'missing'
  function compare(need, pantry) {
    return Object.entries(need).map(([key, amt]) => {
      const p = (pantry || []).find(x => x.key === key);
      const info = p ? { name: p.name, emoji: byKey[key]?.emoji || '🛒', unit: p.unit, cat: p.category } : { name: byKey[key]?.name || key, emoji: byKey[key]?.emoji || '🛒', unit: byKey[key]?.unit || 'pcs', cat: byKey[key]?.cat || 'other' };
      const have = p ? +p.qty : 0;
      const status = have >= amt - 1e-9 ? 'ok' : have > 0 ? 'short' : 'missing';
      return { key, ...info, need: round(amt, info.unit), have, short: Math.max(0, round(amt - have, info.unit)), status };
    }).sort((a, b) => ({ missing: 0, short: 1, ok: 2 }[a.status] - { missing: 0, short: 1, ok: 2 }[b.status]) || a.name.localeCompare(b.name));
  }

  // Sensible amount to buy for a shortfall
  function buyAmount(short, unit) {
    if (short <= 0) return 0;
    if (unit === 'g') return short <= 250 ? Math.ceil(short / 50) * 50 : short <= 1000 ? Math.ceil(short / 250) * 250 : Math.ceil(short / 500) * 500;
    if (unit === 'ml') return Math.ceil(short / 500) * 500;
    return Math.ceil(short);
  }
  function fmt(v, unit) {
    v = +v || 0;
    const t = x => (Math.round(x * 10) / 10).toString();
    if (unit === 'g') return v >= 1000 ? t(v / 1000) + ' kg' : Math.round(v) + ' g';
    if (unit === 'ml') return v >= 1000 ? t(v / 1000) + ' L' : Math.round(v) + ' ml';
    const word = { pcs: ['pc', 'pcs'], scoop: ['scoop', 'scoops'], sachet: ['sachet', 'sachets'], slice: ['slice', 'slices'], packet: ['packet', 'packets'] }[unit] || [unit, unit];
    return t(v) + ' ' + (v === 1 ? word[0] : word[1]);
  }
  const step = unit => unit === 'g' ? 50 : unit === 'ml' ? 250 : 1;

  root.PaceKitchen = { CATALOG, CATS, byKey, parseItem, mealNeeds, needsForMeals, compare, buyAmount, fmt, step };
})(typeof window !== 'undefined' ? window : globalThis);
