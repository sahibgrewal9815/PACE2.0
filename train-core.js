/* PACE Train core — sorts exercises into types and estimates calories burned.
   Calories use the standard MET method: kcal/min = MET × 3.5 × bodyweight(kg) ÷ 200.
   Work time comes from sets × reps (≈3.5 s per rep) or timed sets ("15 mins", "30s");
   rest between sets counts at a light 1.8 MET. A coach can set ex.type to override the guess. */
(function (root) {
  const TYPES = {
    strength: { label: 'Body workout', short: 'STR' },
    landmine: { label: 'Landmine', short: 'LMN' },
    core:     { label: 'Core', short: 'COR' },
    cardio:   { label: 'Cardio', short: 'CAR' },
    mobility: { label: 'Mobility', short: 'MOB' },
  };
  const ORDER = ['strength', 'landmine', 'core', 'cardio', 'mobility'];

  const RE = {
    landmine: /landmine/i,
    mobility: /stretch|mobility|foam roll|yoga|warm.?up|cool.?down/i,
    cardio: /stair|rowing machine|rower|stationary bike|\bbike\b|cycl|treadmill|\brun\b|running|jog|jump rope|skipping|battle rope|burpee|high knees|sprint|mountain climber|jumping jack|bear crawl|elliptical|swim|brisk walk|\bwalk\b|hiit|cardio|zumba|shadow box/i,
    core: /crunch|plank|twist|leg raise|ab wheel|\bv-?ups?\b|superman|sit.?ups?|hollow|dead ?bug|bird ?dog|flutter|pallof|wood ?chop|toes to bar|knee raise|\bcore\b|\babs?\b/i,
  };
  const MUSCLE = [
    ['Legs', /squat|lunge|leg press|leg curl|leg extension|calf|step.?up|wall sit|hack|pistol|single leg/i],
    ['Glutes', /hip thrust|glute|good morning|romanian|\brdl\b/i],
    ['Back', /deadlift|row|pull.?ups?|chin.?ups?|pulldown|lat\b|straight arm|t-bar|superman|reverse fly|face pull|shrug/i],
    ['Shoulders', /shoulder|overhead|military|arnold|lateral raise|front raise|handstand|seated db press|landmine press/i],
    ['Arms', /curl|tricep|pushdown|skull|extension|kickback|close grip|diamond|zottman|isometric|chair dips|bench dips/i],
    ['Chest', /bench|chest|fly|push.?ups?|dips?|incline.*press|decline.*press|clap/i],
  ];
  const MET = [
    [/stair/i, 9], [/jump rope|skipping/i, 11], [/battle rope/i, 10], [/sprint/i, 10], [/burpee|high knees|mountain climber|bear crawl/i, 8],
    [/rowing|rower/i, 7], [/bike|cycl/i, 7], [/treadmill|\brun\b|running|jog/i, 9.5], [/walk/i, 4], [/swim/i, 8],
    [/jump squat|clap/i, 8], [/deadlift|squat|lunge|thrust|clean|snatch|pull.?ups?|chin.?ups?|handstand/i, 6],
    [/press|row|dips?\b|push.?ups?|step.?up/i, 5.5],
    [/curl|raise|fly|extension|pushdown|kickback|calf|shrug|isometric|hold/i, 3.5],
  ];
  const TYPE_MET = { strength: 5, landmine: 5.5, core: 3.8, cardio: 8, mobility: 2.5 };

  function type(ex) {
    if (ex.type && TYPES[ex.type]) return ex.type;
    const n = ex.name || '';
    for (const t of ['landmine', 'mobility', 'core', 'cardio']) if (RE[t].test(n)) return t;
    return 'strength';
  }
  function muscle(ex) {
    if (ex.muscle) return ex.muscle;
    const t = type(ex);
    if (t === 'cardio') return 'Conditioning';
    if (t === 'core') return 'Core';
    if (t === 'mobility') return 'Mobility';
    const m = MUSCLE.find(([, re]) => re.test(ex.name || ''));
    return m ? m[0] : 'Full body';
  }
  function met(ex) {
    const t = type(ex);
    if (t === 'core' || t === 'mobility') return TYPE_MET[t];
    const m = MET.find(([re]) => re.test(ex.name || ''));
    return m ? m[1] : TYPE_MET[t];
  }
  const num = v => { const m = String(v ?? '').match(/(\d+(?:\.\d+)?)(?:\s*-\s*(\d+(?:\.\d+)?))?/); return m ? (m[2] ? (+m[1] + +m[2]) / 2 : +m[1]) : null; };
  function secondsOf(v) {
    const s = String(v ?? '');
    let m;
    if ((m = s.match(/(\d+(?:\.\d+)?)\s*(?:mins?|minutes?)\b/i))) return +m[1] * 60;
    if ((m = s.match(/(\d+(?:\.\d+)?)\s*(?:s|sec|secs|seconds?)\b/i))) return +m[1];
    return null;
  }
  // { sets, workSec, restSec, minutes }
  function timing(ex) {
    const sets = Math.max(1, num(ex.sets) || 1);
    const t = type(ex);
    const timed = secondsOf(ex.reps);
    const reps = num(ex.reps) || 10;
    const perSet = timed ?? reps * (t === 'cardio' ? 2 : 3.5);
    const rest = secondsOf(ex.rest) ?? (num(ex.rest) || 0);
    const workSec = sets * perSet, restSec = (sets - 1) * rest;
    return { sets, workSec, restSec, minutes: (workSec + restSec) / 60 };
  }
  function kcal(ex, kg) {
    const { workSec, restSec } = timing(ex), k = (kg || 70) * 3.5 / 200;
    return Math.round((met(ex) * workSec / 60 + 1.8 * restSec / 60) * k);
  }
  function describe(ex) {
    const s = num(ex.sets), r = String(ex.reps ?? '').trim();
    const timed = secondsOf(r) !== null;
    return { setsReps: s && r ? `${s}×${timed ? r.replace(/\s*mins?/i, 'm').replace(/\s*hold/i, '') : r}` : r || (s ? s + ' sets' : ''), rest: ex.rest && ex.rest !== '—' ? String(ex.rest) : '' };
  }
  // Whole session summary
  function session(exercises, kg, doneMap) {
    const list = (exercises || []).map((ex, i) => ({ i, ex, type: type(ex), muscle: muscle(ex), kcal: kcal(ex, kg), min: timing(ex).minutes, done: !!(doneMap && doneMap[i]) }));
    const sum = (a, k) => a.reduce((s, x) => s + x[k], 0);
    const byType = ORDER.map(t => { const xs = list.filter(x => x.type === t); return { type: t, ...TYPES[t], items: xs, total: xs.length, done: xs.filter(x => x.done).length, kcal: sum(xs, 'kcal'), min: sum(xs, 'min') }; }).filter(g => g.total);
    return { list, byType, kcal: sum(list, 'kcal'), burned: sum(list.filter(x => x.done), 'kcal'), minutes: Math.round(sum(list, 'min') + list.length), done: list.filter(x => x.done).length };
  }

  root.PaceTrain = { TYPES, ORDER, type, muscle, met, timing, kcal, describe, session };
})(typeof window !== 'undefined' ? window : globalThis);
