/* PACE nutrition estimates — micronutrients per 100 g (approximate, from standard food tables).
   Plans only carry calories/protein/carbs/fat, so fibre, sugar and micros are estimated here
   from the food text, e.g. "Oats 80g", "Eggs 3 boiled", "Dal 2 katori". */
(function () {
  // [match, grams per "unit" (1 egg, 1 roti…), default portion in g, nutrients per 100 g]
  // fib g · sug g · na mg · k mg · ca mg · fe mg · mg mg · zn mg · va µg · vc mg · vd µg · b12 µg · fol µg
  const F = (fib, sug, na, k, ca, fe, mg, zn, va, vc, vd, b12, fol) => ({ fib, sug, na, k, ca, fe, mg, zn, va, vc, vd, b12, fol });
  const DB = [
    [/egg\s*white/i,                 33, 132, F(0, .7, 166, 163, 7, .1, 11, 0, 0, 0, 0, .09, 4)],
    [/egg|bhurji|omelette/i,         50, 100, F(0, 1.1, 140, 126, 50, 1.75, 10, 1.3, 160, 0, 2.0, .9, 47)],
    [/chicken soup/i,               250, 250, F(.5, 1, 350, 150, 10, .5, 8, .4, 20, 2, 0, .1, 5)],
    [/chicken/i,                    100, 150, F(0, 0, 74, 256, 15, .7, 29, 1, 9, 0, .1, .34, 4)],
    [/tuna/i,                       100, 150, F(0, 0, 50, 323, 8, 1, 50, .6, 18, 0, 2.0, 2.2, 2)],
    [/fish|rohu|pomfret/i,          100, 150, F(0, 0, 60, 380, 30, 1, 30, .6, 30, 0, 5.0, 2.5, 10)],
    [/paneer|cottage cheese/i,      100, 100, F(0, 2.6, 30, 100, 480, .2, 25, 2.7, 200, 0, .1, .7, 10)],
    [/tofu scramble|tofu/i,         100, 150, F(.3, .6, 7, 121, 350, 5.4, 30, 1, 0, 0, 0, 0, 15)],
    [/tempeh/i,                     100, 150, F(5, 0, 9, 412, 111, 2.7, 81, 1.1, 0, 0, 0, .1, 24)],
    [/soya milk|soy milk/i,         250, 250, F(.6, 3, 50, 120, 120, .4, 15, .2, 50, 0, 1.2, 1.1, 20)],
    [/soya|soy chunk/i,              10,  50, F(13, 7, 20, 2400, 350, 21, 290, 4, 0, 0, 0, 0, 300)],
    [/edamame/i,                    100, 150, F(5.2, 2.2, 6, 436, 63, 2.3, 64, 1.4, 9, 6, 0, 0, 311)],
    [/sprouts/i,                    100, 150, F(1.8, 4, 6, 149, 13, .9, 21, .4, 1, 13, 0, 0, 61)],
    [/rajma|kidney|black bean/i,    150, 150, F(6.4, .3, 250, 405, 35, 2.9, 45, 1, 0, 1.2, 0, 0, 130)],
    [/chole|chickpea|chana/i,       150, 150, F(7.6, 4.8, 250, 291, 49, 2.9, 48, 1.5, 1, 1.3, 0, 0, 172)],
    [/\bdal\b|lentil|sambar/i,          150, 150, F(7.9, 1.8, 250, 369, 19, 3.3, 36, 1.3, 1, 1.5, 0, 0, 181)],
    [/peanut butter/i,               16,  32, F(6, 9, 430, 650, 45, 1.9, 170, 2.8, 0, 0, 0, 0, 87)],
    [/greek yogurt|yogurt|dahi|curd/i,150,150, F(0, 4, 40, 150, 120, .1, 12, .6, 25, .5, .1, .4, 7)],
    [/lassi \(sweet|sweet lassi/i,  250, 250, F(0, 12, 45, 150, 110, .1, 11, .5, 25, .5, 0, .3, 7)],
    [/lassi|chaas|buttermilk/i,     250, 250, F(0, 3, 180, 150, 110, .1, 11, .4, 10, .5, 0, .2, 5)],
    [/whey|casein|plant protein/i,   30,  30, F(1, 7, 170, 500, 450, 1, 170, 3, 0, 0, 0, 1, 0)],
    [/almond milk/i,                250, 250, F(.2, 0, 70, 70, 180, .3, 7, .2, 60, 0, 1, .4, 0)],
    [/oat milk/i,                   250, 250, F(.8, 3, 40, 160, 120, .3, 8, .1, 60, 0, 1, .4, 0)],
    [/haldi|turmeric milk|milk/i,   250, 250, F(0, 5, 44, 150, 120, .05, 11, .4, 46, 0, .1, .45, 5)],
    [/coconut water/i,              250, 250, F(1.1, 2.6, 105, 250, 24, .3, 25, .1, 0, 2.4, 0, 0, 3)],
    [/nimbu|lemon/i,                250, 250, F(.1, 6, 5, 30, 3, .02, 2, 0, 0, 10, 0, 0, 3)],
    [/coconut/i,                     10,  10, F(9, 6, 20, 356, 14, 2.4, 32, 1.1, 0, 3.3, 0, 0, 26)],
    [/oats? chilla/i,                70, 140, F(5, 1, 300, 300, 50, 2.5, 90, 2, 0, 0, 0, .1, 30)],
    [/oats?\b|oat\b/i,               40,  50, F(10, 1, 2, 429, 54, 4.7, 177, 4, 0, 0, 0, 0, 32)],
    [/dalia/i,                      200, 200, F(4.5, 1, 150, 150, 20, 1.5, 50, 1, 0, 0, 0, 0, 20)],
    [/poha/i,                       150, 150, F(1.5, 1, 300, 80, 10, 2.5, 20, .5, 5, 2, 0, 0, 10)],
    [/upma/i,                       150, 150, F(2, 1, 350, 100, 15, 1, 20, .5, 10, 1, 0, 0, 15)],
    [/idli/i,                        40, 120, F(1.5, .5, 200, 60, 15, .6, 15, .4, 0, 0, 0, 0, 10)],
    [/besan|chilla/i,                70, 140, F(5, 2, 300, 380, 40, 2.5, 70, 1.5, 5, 2, 0, 0, 200)],
    [/paratha/i,                     80, 160, F(5, 1, 350, 200, 25, 2.5, 60, 1.3, 40, 0, 0, 0, 30)],
    [/cornflakes/i,                  30,  30, F(3, 8, 700, 100, 5, 28, 15, .3, 0, 0, 0, 1.5, 330)],
    [/brown rice/i,                 150, 150, F(1.8, .4, 5, 86, 10, .4, 39, .6, 0, 0, 0, 0, 4)],
    [/quinoa/i,                     150, 150, F(2.8, .9, 7, 172, 17, 1.5, 64, 1.1, 0, 0, 0, 0, 42)],
    [/rice cake/i,                    9,  27, F(4, .8, 30, 290, 11, 1.5, 130, 3, 0, 0, 0, 0, 20)],
    [/rice/i,                       150, 150, F(.4, .1, 5, 35, 10, .2, 12, .5, 0, 0, 0, 0, 3)],
    [/roti|chapati/i,                40,  80, F(9.7, 2, 5, 290, 30, 3.2, 100, 2, 0, 0, 0, 0, 40)],
    [/toast|bread/i,                 30,  60, F(7, 6, 450, 230, 100, 2.5, 75, 1.5, 0, 0, 0, 0, 50)],
    [/pasta/i,                      150, 150, F(1.8, .6, 6, 44, 7, .5, 18, .5, 0, 0, 0, 0, 7)],
    [/sweet potato/i,               150, 150, F(3, 4.2, 55, 337, 30, .6, 25, .3, 709, 2.4, 0, 0, 11)],
    [/banana/i,                     118, 118, F(2.6, 12, 1, 358, 5, .26, 27, .15, 3, 8.7, 0, 0, 20)],
    [/apple/i,                      180, 180, F(2.4, 10, 1, 107, 6, .12, 5, .04, 3, 4.6, 0, 0, 3)],
    [/dates?\b/i,                     8,  32, F(8, 63, 2, 696, 64, 1, 54, .4, 0, 0, 0, 0, 15)],
    [/fruit/i,                      150, 150, F(2.2, 10, 2, 200, 12, .3, 12, .1, 30, 30, 0, 0, 20)],
    [/honey/i,                       21,  21, F(.2, 82, 4, 52, 6, .4, 2, .2, 0, .5, 0, 0, 2)],
    [/almond/i,                     1.2,  14, F(12.5, 4.4, 1, 733, 269, 3.7, 270, 3.1, 0, 0, 0, 0, 44)],
    [/walnut/i,                       4,  20, F(6.7, 2.6, 2, 441, 98, 2.9, 158, 3.1, 1, 1.3, 0, 0, 98)],
    [/peanut|groundnut(?! oil)/i,    30,  30, F(8.5, 4, 18, 705, 92, 4.6, 168, 3.3, 0, 0, 0, 0, 240)],
    [/flax/i,                        10,  10, F(27, 1.6, 30, 813, 255, 5.7, 392, 4.3, 0, .6, 0, 0, 87)],
    [/chia/i,                        10,  10, F(34, 0, 16, 407, 631, 7.7, 335, 4.6, 0, 1.6, 0, 0, 49)],
    [/hemp/i,                        10,  20, F(4, 1.5, 5, 1200, 70, 8, 700, 10, 1, .5, 0, 0, 110)],
    [/nutritional yeast/i,           10,  10, F(20, 0, 50, 1800, 30, 3, 100, 6, 0, 0, 0, 24, 2300)],
    [/ghee/i,                         5,   5, F(0, 0, 2, 5, 4, 0, 0, 0, 684, 0, 0, 0, 0)],
    [/oil/i,                          5,   5, F(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)],
    [/palak|spinach/i,              150, 150, F(2.5, .4, 300, 466, 99, 2.7, 79, .5, 469, 28, 0, 0, 194)],
    [/broccoli/i,                   100, 150, F(2.6, 1.7, 33, 316, 47, .7, 21, .4, 31, 89, 0, 0, 63)],
    [/green beans|beans/i,          150, 150, F(2.7, 3.3, 6, 211, 37, 1, 25, .2, 35, 12, 0, 0, 33)],
    [/bhindi|okra/i,                150, 150, F(3.2, 1.5, 250, 299, 82, .6, 57, .6, 36, 23, 0, 0, 60)],
    [/gobhi|cauliflower/i,          150, 150, F(2, 1.9, 250, 299, 22, .4, 15, .3, 0, 48, 0, 0, 57)],
    [/gajar|carrot|matar|peas/i,    150, 150, F(4, 5, 250, 300, 30, 1, 25, .6, 600, 15, 0, 0, 40)],
    [/zucchini/i,                   150, 150, F(1, 2.5, 8, 261, 16, .4, 18, .3, 10, 18, 0, 0, 24)],
    [/bell pepper|capsicum/i,       150, 150, F(2.1, 4.2, 4, 211, 7, .4, 12, .3, 157, 128, 0, 0, 46)],
    [/mushroom/i,                   150, 150, F(1, 2, 5, 318, 3, .5, 9, .5, 0, 2, .2, .04, 17)],
    [/salad|cucumber|tomato|onion/i,150, 150, F(1.5, 3, 5, 220, 20, .3, 12, .2, 25, 12, 0, 0, 15)],
    [/sabzi|veg/i,                  150, 150, F(3, 3, 300, 250, 30, 1, 20, .4, 300, 15, 0, 0, 30)],
    [/coffee|green tea|tea/i,       200, 200, F(0, 0, 2, 49, 2, .01, 3, 0, 0, 0, 0, 0, 2)],
    [/ashwagandha/i,                  3,   3, F(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)],
  ];

  // Daily reference values (adults)
  const RDA = {
    fib: { label: 'Fibre', unit: 'g', dv: 30 },
    sug: { label: 'Sugar', unit: 'g', dv: 50, limit: true },
    na:  { label: 'Sodium', unit: 'mg', dv: 2300, limit: true },
    k:   { label: 'Potassium', unit: 'mg', dv: 3500 },
    ca:  { label: 'Calcium', unit: 'mg', dv: 1000 },
    fe:  { label: 'Iron', unit: 'mg', dv: 18 },
    mg:  { label: 'Magnesium', unit: 'mg', dv: 400 },
    zn:  { label: 'Zinc', unit: 'mg', dv: 11 },
    va:  { label: 'Vitamin A', unit: 'µg', dv: 900 },
    vc:  { label: 'Vitamin C', unit: 'mg', dv: 90 },
    vd:  { label: 'Vitamin D', unit: 'µg', dv: 15 },
    b12: { label: 'Vitamin B12', unit: 'µg', dv: 2.4 },
    fol: { label: 'Folate', unit: 'µg', dv: 400 },
  };
  const KEYS = Object.keys(RDA);

  function grams(part, unitG, defG) {
    const num = s => { const m = s.match(/(\d+(?:\.\d+)?)(?:\s*-\s*(\d+(?:\.\d+)?))?/); return m ? (m[2] ? (+m[1] + +m[2]) / 2 : +m[1]) : null; };
    let m;
    if ((m = part.match(/(\d+(?:\.\d+)?)(?:\s*-\s*\d+)?\s*(g|ml)\b/i))) return +m[1];
    const n = num(part);
    if (/katori/i.test(part)) return (n || 1) * 150;
    if (/tbsp/i.test(part)) return (n || 1) * 15;
    if (/tsp/i.test(part)) return (n || 1) * 5;
    if (/scoop/i.test(part)) return (n || 1) * 30;
    if (/slice/i.test(part)) return (n || 1) * 30;
    if (/glass/i.test(part)) return (n || 1) * 250;
    if (/bowl/i.test(part)) return (n || 1) * 200;
    if (/plate/i.test(part)) return (n || 1) * 150;
    if (/handful/i.test(part)) return 30;
    if (n !== null) return n * unitG;
    return defG;
  }

  function estimateItem(text) {
    const out = Object.fromEntries(KEYS.map(k => [k, 0]));
    let known = 0, total = 0;
    String(text).replace(/\([^)]*\)/g, m => m.replace(/\+/g, '&')).replace(/gajar\s*\+\s*matar/i, 'gajar matar').split(/\s\+\s|,|\bwith\b/i).map(s => s.trim()).filter(Boolean).forEach(part => {
      total++;
      const e = DB.find(([re]) => re.test(part));
      if (!e) return;
      known++;
      const g = grams(part, e[1], e[2]);
      KEYS.forEach(k => (out[k] += (e[3][k] || 0) * g / 100));
    });
    return { n: out, known, total };
  }

  function estimateMeals(meals) {
    const n = Object.fromEntries(KEYS.map(k => [k, 0]));
    let known = 0, total = 0;
    (meals || []).forEach(m => {
      const items = Array.isArray(m.items) ? m.items : String(m.items || '').split(',');
      items.forEach(it => { const r = estimateItem(it); KEYS.forEach(k => (n[k] += r.n[k])); known += r.known; total += r.total; });
    });
    return { n, coverage: total ? known / total : 0 };
  }

  window.PaceNutrition = { RDA, KEYS, estimateItem, estimateMeals };
})();
