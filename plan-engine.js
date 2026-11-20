/**
 * PACE 2.0 — Intelligent Plan Engine
 * Generates personalised workout + diet plans based on:
 * - Goal (weight_loss / weight_gain / muscle_gain / endurance / maintenance)
 * - Intensity (calculated from kg to change + days to deadline)
 * - Workout preference (gym / home)
 * - Diet preference (veg / non-veg / vegan / eggetarian)
 * - Gender, current weight, target weight
 * Randomness: exercises picked from large pools so every athlete feels unique
 */

// ─────────────────────────────────────────────
// EXERCISE POOLS — GYM
// ─────────────────────────────────────────────
const GYM_POOLS = {
  chest: [
    { name: "Barbell Bench Press",        sets: "4", reps: "8",  rest: "90s" },
    { name: "Incline Dumbbell Press",     sets: "4", reps: "10", rest: "75s" },
    { name: "Decline Bench Press",        sets: "3", reps: "10", rest: "75s" },
    { name: "Cable Fly",                  sets: "3", reps: "15", rest: "45s" },
    { name: "Dumbbell Fly",               sets: "3", reps: "12", rest: "45s" },
    { name: "Pec Deck Machine",           sets: "3", reps: "15", rest: "45s" },
    { name: "Push Ups (weighted)",        sets: "3", reps: "15", rest: "30s" },
    { name: "Close Grip Bench Press",     sets: "3", reps: "10", rest: "60s" },
    { name: "Chest Dips",                 sets: "3", reps: "12", rest: "60s" },
    { name: "Landmine Press",             sets: "3", reps: "12", rest: "60s" },
  ],
  back: [
    { name: "Barbell Row",                sets: "4", reps: "10", rest: "75s" },
    { name: "Pull Ups",                   sets: "4", reps: "8",  rest: "90s" },
    { name: "Lat Pulldown",               sets: "4", reps: "12", rest: "60s" },
    { name: "Seated Cable Row",           sets: "3", reps: "12", rest: "60s" },
    { name: "Single Arm DB Row",          sets: "3", reps: "12", rest: "45s" },
    { name: "T-Bar Row",                  sets: "4", reps: "10", rest: "75s" },
    { name: "Wide Grip Lat Pulldown",     sets: "3", reps: "12", rest: "60s" },
    { name: "Face Pulls",                 sets: "3", reps: "15", rest: "30s" },
    { name: "Straight Arm Pulldown",      sets: "3", reps: "15", rest: "30s" },
    { name: "Deadlift",                   sets: "4", reps: "6",  rest: "120s"},
  ],
  shoulders: [
    { name: "Overhead Press (Barbell)",   sets: "4", reps: "8",  rest: "90s" },
    { name: "Dumbbell Shoulder Press",    sets: "4", reps: "10", rest: "75s" },
    { name: "Lateral Raises",             sets: "4", reps: "15", rest: "30s" },
    { name: "Front Raises",               sets: "3", reps: "12", rest: "30s" },
    { name: "Reverse Fly (Cable)",        sets: "3", reps: "15", rest: "30s" },
    { name: "Arnold Press",               sets: "3", reps: "12", rest: "60s" },
    { name: "Upright Row",                sets: "3", reps: "12", rest: "45s" },
    { name: "Machine Shoulder Press",     sets: "3", reps: "12", rest: "60s" },
    { name: "Seated DB Press",            sets: "4", reps: "10", rest: "60s" },
    { name: "Cable Lateral Raise",        sets: "3", reps: "15", rest: "30s" },
  ],
  biceps: [
    { name: "Barbell Curl",               sets: "4", reps: "10", rest: "60s" },
    { name: "Hammer Curls",               sets: "3", reps: "12", rest: "45s" },
    { name: "EZ Bar Curl",                sets: "4", reps: "10", rest: "60s" },
    { name: "Incline DB Curl",            sets: "3", reps: "12", rest: "45s" },
    { name: "Preacher Curl",              sets: "3", reps: "12", rest: "45s" },
    { name: "Cable Curl",                 sets: "3", reps: "15", rest: "30s" },
    { name: "Concentration Curl",         sets: "3", reps: "12", rest: "30s" },
    { name: "Reverse Curl",               sets: "3", reps: "12", rest: "30s" },
    { name: "Zottman Curl",               sets: "3", reps: "10", rest: "45s" },
    { name: "Spider Curl",                sets: "3", reps: "12", rest: "30s" },
  ],
  triceps: [
    { name: "Tricep Pushdown (Cable)",    sets: "4", reps: "15", rest: "45s" },
    { name: "Skull Crushers",             sets: "4", reps: "10", rest: "60s" },
    { name: "Overhead Tricep Extension",  sets: "3", reps: "12", rest: "45s" },
    { name: "Close Grip Bench Press",     sets: "4", reps: "10", rest: "75s" },
    { name: "Dips (Tricep)",              sets: "3", reps: "12", rest: "60s" },
    { name: "Rope Pushdown",              sets: "3", reps: "15", rest: "30s" },
    { name: "Single Arm Pushdown",        sets: "3", reps: "15", rest: "30s" },
    { name: "DB Kickback",                sets: "3", reps: "15", rest: "30s" },
    { name: "Bench Dips",                 sets: "3", reps: "15", rest: "30s" },
    { name: "Machine Tricep Press",       sets: "3", reps: "12", rest: "45s" },
  ],
  legs: [
    { name: "Barbell Squat",              sets: "4", reps: "8",  rest: "120s"},
    { name: "Leg Press",                  sets: "4", reps: "12", rest: "90s" },
    { name: "Romanian Deadlift",          sets: "3", reps: "10", rest: "90s" },
    { name: "Leg Curl (Machine)",         sets: "4", reps: "12", rest: "60s" },
    { name: "Leg Extension",              sets: "3", reps: "15", rest: "45s" },
    { name: "Walking Lunges",             sets: "3", reps: "12", rest: "60s" },
    { name: "Hack Squat",                 sets: "3", reps: "10", rest: "90s" },
    { name: "Sumo Squat",                 sets: "3", reps: "12", rest: "75s" },
    { name: "Calf Raises (Standing)",     sets: "4", reps: "20", rest: "30s" },
    { name: "Bulgarian Split Squat",      sets: "3", reps: "10", rest: "75s" },
    { name: "Hip Thrust",                 sets: "4", reps: "12", rest: "75s" },
    { name: "Seated Calf Raises",         sets: "4", reps: "20", rest: "30s" },
  ],
  core: [
    { name: "Plank",                      sets: "3", reps: "60s hold", rest: "30s" },
    { name: "Cable Crunches",             sets: "3", reps: "15", rest: "30s" },
    { name: "Hanging Leg Raises",         sets: "3", reps: "12", rest: "45s" },
    { name: "Russian Twists",             sets: "3", reps: "20", rest: "30s" },
    { name: "Ab Wheel Rollout",           sets: "3", reps: "10", rest: "45s" },
    { name: "Decline Crunches",           sets: "3", reps: "15", rest: "30s" },
    { name: "Side Plank",                 sets: "3", reps: "45s hold", rest: "30s" },
    { name: "Mountain Climbers",          sets: "3", reps: "30", rest: "30s" },
  ],
  cardio_gym: [
    { name: "Treadmill Run",              sets: "1", reps: "20 mins", rest: "—" },
    { name: "Stationary Bike",            sets: "1", reps: "20 mins", rest: "—" },
    { name: "Rowing Machine",             sets: "1", reps: "15 mins", rest: "—" },
    { name: "Stair Climber",              sets: "1", reps: "15 mins", rest: "—" },
    { name: "Elliptical",                 sets: "1", reps: "20 mins", rest: "—" },
    { name: "Jump Rope",                  sets: "5", reps: "2 mins",  rest: "30s" },
    { name: "Battle Ropes",               sets: "5", reps: "30s",     rest: "30s" },
    { name: "Box Jumps",                  sets: "4", reps: "10",      rest: "45s" },
  ],
};

// ─────────────────────────────────────────────
// EXERCISE POOLS — HOME (bodyweight / minimal)
// ─────────────────────────────────────────────
const HOME_POOLS = {
  chest: [
    { name: "Push Ups",                   sets: "4", reps: "20", rest: "45s" },
    { name: "Wide Push Ups",              sets: "4", reps: "15", rest: "45s" },
    { name: "Diamond Push Ups",           sets: "3", reps: "15", rest: "45s" },
    { name: "Decline Push Ups",           sets: "3", reps: "15", rest: "45s" },
    { name: "Incline Push Ups",           sets: "3", reps: "20", rest: "30s" },
    { name: "Archer Push Ups",            sets: "3", reps: "10", rest: "60s" },
    { name: "Clap Push Ups",              sets: "3", reps: "10", rest: "60s" },
  ],
  back: [
    { name: "Pull Ups",                   sets: "4", reps: "8",  rest: "90s" },
    { name: "Chin Ups",                   sets: "3", reps: "10", rest: "75s" },
    { name: "Inverted Rows (table)",      sets: "4", reps: "12", rest: "60s" },
    { name: "Superman Hold",              sets: "3", reps: "12", rest: "30s" },
    { name: "Good Mornings (BW)",         sets: "3", reps: "15", rest: "30s" },
  ],
  shoulders: [
    { name: "Pike Push Ups",              sets: "4", reps: "12", rest: "45s" },
    { name: "Handstand Push Ups",         sets: "3", reps: "8",  rest: "75s" },
    { name: "Wall Handstand Hold",        sets: "3", reps: "30s hold", rest: "45s" },
    { name: "Lateral Raises (bottles)",   sets: "4", reps: "15", rest: "30s" },
    { name: "Front Raises (bottles)",     sets: "3", reps: "15", rest: "30s" },
  ],
  biceps: [
    { name: "Chin Ups",                   sets: "4", reps: "10", rest: "75s" },
    { name: "Towel Curls",                sets: "3", reps: "15", rest: "30s" },
    { name: "Isometric Curl Hold",        sets: "3", reps: "30s hold", rest: "30s" },
    { name: "Backpack Curls",             sets: "3", reps: "12", rest: "45s" },
  ],
  triceps: [
    { name: "Diamond Push Ups",           sets: "4", reps: "15", rest: "45s" },
    { name: "Bench Dips",                 sets: "4", reps: "15", rest: "45s" },
    { name: "Chair Dips",                 sets: "3", reps: "15", rest: "45s" },
    { name: "Close Grip Push Ups",        sets: "3", reps: "15", rest: "30s" },
  ],
  legs: [
    { name: "Bodyweight Squat",           sets: "4", reps: "20", rest: "45s" },
    { name: "Jump Squats",                sets: "4", reps: "15", rest: "45s" },
    { name: "Lunges",                     sets: "3", reps: "15", rest: "45s" },
    { name: "Reverse Lunges",             sets: "3", reps: "15", rest: "45s" },
    { name: "Glute Bridge",               sets: "4", reps: "20", rest: "30s" },
    { name: "Single Leg Squat",           sets: "3", reps: "10", rest: "60s" },
    { name: "Wall Sit",                   sets: "3", reps: "60s hold", rest: "45s" },
    { name: "Step Ups (chair)",           sets: "3", reps: "15", rest: "45s" },
    { name: "Calf Raises (BW)",           sets: "4", reps: "25", rest: "30s" },
    { name: "Sumo Squat (BW)",            sets: "3", reps: "20", rest: "30s" },
  ],
  core: [
    { name: "Plank",                      sets: "3", reps: "60s hold", rest: "30s" },
    { name: "Crunches",                   sets: "3", reps: "25", rest: "30s" },
    { name: "Leg Raises",                 sets: "3", reps: "15", rest: "30s" },
    { name: "Bicycle Crunches",           sets: "3", reps: "20", rest: "30s" },
    { name: "Russian Twists",             sets: "3", reps: "20", rest: "30s" },
    { name: "Mountain Climbers",          sets: "3", reps: "30", rest: "30s" },
    { name: "Side Plank",                 sets: "3", reps: "45s hold", rest: "30s" },
    { name: "V-Ups",                      sets: "3", reps: "15", rest: "30s" },
  ],
  cardio_home: [
    { name: "Jumping Jacks",              sets: "3", reps: "60s", rest: "30s" },
    { name: "High Knees",                 sets: "4", reps: "45s", rest: "15s" },
    { name: "Burpees",                    sets: "4", reps: "10", rest: "45s" },
    { name: "Jump Rope (imaginary)",      sets: "5", reps: "2 mins", rest: "30s" },
    { name: "Skaters",                    sets: "3", reps: "20", rest: "30s" },
    { name: "Sprint in Place",            sets: "5", reps: "30s", rest: "30s" },
    { name: "Bear Crawls",                sets: "3", reps: "30s", rest: "30s" },
  ],
};

// ─────────────────────────────────────────────
// FOOD POOLS — by diet type
// ─────────────────────────────────────────────
const FOOD = {
  protein_nonveg: [
    "Chicken Breast 200g", "Chicken Breast 150g", "Eggs 3 boiled", "Eggs 2 boiled + 1 white",
    "Tuna 150g", "Fish (Rohu/Pomfret) 200g", "Egg Bhurji (3 eggs)", "Chicken Tikka 150g",
    "Grilled Fish 200g", "Boiled Chicken 200g", "Chicken Soup", "Egg Omelette 3 eggs",
  ],
  protein_veg: [
    "Paneer 150g", "Paneer 100g", "Tofu 150g", "Dal (Masoor) 2 katori",
    "Dal (Chana) 2 katori", "Rajma 1.5 katori", "Chole 1.5 katori",
    "Soya Chunks 100g dry", "Peanut Butter 2 tbsp", "Greek Yogurt 200g",
    "Cottage Cheese 150g", "Sprouts 1 katori",
  ],
  protein_vegan: [
    "Tofu 200g", "Soya Chunks 100g dry", "Tempeh 150g", "Lentils 2 katori",
    "Chickpeas 1.5 katori", "Black Beans 1.5 katori", "Edamame 150g",
    "Peanut Butter 2 tbsp", "Hemp Seeds 2 tbsp", "Nutritional Yeast",
  ],
  protein_eggetarian: [
    "Eggs 3 boiled", "Egg Omelette 3 eggs", "Egg Bhurji (3 eggs)", "Paneer 100g",
    "Greek Yogurt 200g", "Egg White 4 nos", "Boiled Eggs 2 + Paneer 75g",
    "Soya Chunks 75g dry", "Dal 2 katori", "Tofu 150g",
  ],
  carbs_low: [
    "Oats 60g", "Brown Rice 100g cooked", "Sweet Potato 150g",
    "Roti 1.5", "Quinoa 80g cooked", "Multigrain Bread 2 slices",
  ],
  carbs_medium: [
    "Oats 80g", "Brown Rice 150g cooked", "Sweet Potato 200g",
    "Roti 2.5", "Rice 150g cooked", "Multigrain Bread 3 slices",
    "Poha 1 plate", "Upma 1 plate", "Dalia 1 bowl",
  ],
  carbs_high: [
    "Oats 100g", "Rice 200g cooked", "Roti 4", "Brown Rice 200g cooked",
    "Sweet Potato 250g", "Banana 2", "Bread 4 slices", "Pasta 150g cooked",
  ],
  fats_healthy: [
    "Almonds 10-12 nos", "Walnuts 4-5 nos", "Peanuts handful",
    "Groundnut Oil 1 tsp (cooking)", "Ghee 1 tsp", "Coconut 1 tbsp",
    "Flaxseeds 1 tbsp", "Chia Seeds 1 tbsp",
  ],
  veggies: [
    "Salad (cucumber + tomato + onion)", "Spinach sabzi",
    "Mixed Veg sabzi", "Broccoli steamed", "Green beans",
    "Bhindi (Okra)", "Palak", "Gobhi sabzi", "Gajar + Matar",
    "Zucchini", "Bell peppers", "Mushrooms",
  ],
  breakfast_base: [
    "Oats + Banana + Milk",
    "Poha + Peanuts + Lemon",
    "Upma + Coconut chutney",
    "Paratha 2 (less ghee) + Dahi",
    "Dalia + Milk + Fruits",
    "Bread + Peanut Butter + Banana",
    "Idli 3 + Sambar",
    "Besan Chilla 2 + Green chutney",
    "Oats Chilla 2 + Dahi",
    "Cornflakes + Milk + Banana",
  ],
  pre_workout: [
    "Banana 1 + Black Coffee",
    "Banana 2",
    "Dates 3-4 + Coffee",
    "Apple + Peanut Butter",
    "Rice cakes 3 + Honey",
    "Bread 1 slice + Peanut Butter",
  ],
  post_workout_nonveg: [
    "Whey Protein 1 scoop + Milk 300ml",
    "Boiled Eggs 3 + Banana",
    "Chicken Breast 200g + Rice 100g",
    "Whey Protein + Banana shake",
    "Egg White Omelette 4 eggs + Toast",
  ],
  post_workout_veg: [
    "Whey Protein 1 scoop + Milk 300ml",
    "Paneer 100g + Banana + Milk shake",
    "Greek Yogurt + Banana + Honey",
    "Sprouts 1 katori + Buttermilk",
    "Soya Chunks cooked 100g + Roti 1",
  ],
  post_workout_vegan: [
    "Plant Protein 1 scoop + Oat Milk",
    "Tofu scramble + Banana",
    "Soya Milk + Banana shake",
    "Edamame + Fruit bowl",
  ],
  drinks: [
    "Lassi (sweet, 1 glass)", "Lassi (salted, 1 glass)",
    "Chaas (Buttermilk)", "Coconut water",
    "Nimbu Paani (lemon water)", "Haldi doodh (turmeric milk)",
    "Buffalo milk 300ml", "Toned milk 300ml", "Almond milk 250ml",
  ],
  pre_sleep: [
    "150ml buffalo milk + warm water with lemon",
    "Haldi doodh (turmeric milk) 200ml",
    "Casein protein shake 1 scoop",
    "Dahi 1 katori + Honey",
    "Warm milk 200ml + Ashwagandha",
    "Paneer 50g (small piece)",
  ],
};

// ─────────────────────────────────────────────
// HELPER: pick N random items from array
// ─────────────────────────────────────────────
function pick(arr, n, seed=0) {
  // Seeded shuffle so same athlete gets same plan in same week
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor((Math.sin(i * 9301 + seed * 49297 + 233995) * 0.5 + 0.5) * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

function rand(arr, seed=0) {
  const idx = Math.floor((Math.sin(seed * 12345.6789) * 0.5 + 0.5) * arr.length);
  return arr[Math.abs(idx) % arr.length];
}

// ─────────────────────────────────────────────
// CALORIE + MACRO CALCULATOR
// ─────────────────────────────────────────────
function calcMacros(profile) {
  const { current_weight, target_weight, gender, goal, days_to_goal, age } = profile;
  const w = parseFloat(current_weight) || 75;
  const t = parseFloat(target_weight) || 70;
  const daysLeft = parseInt(days_to_goal) || 90;
  const isMale = (gender || 'male').toLowerCase() !== 'female';

  // BMR (Mifflin-St Jeor)
  const h = isMale ? 175 : 162;
  const a = parseInt(age) || 25;
  const bmr = isMale
    ? 10 * w + 6.25 * h - 5 * a + 5
    : 10 * w + 6.25 * h - 5 * a - 161;

  // Activity multiplier based on goal
  const activityMap = {
    weight_loss: 1.4, weight_gain: 1.6,
    muscle_gain: 1.55, endurance: 1.65, maintenance: 1.45,
  };
  const tdee = bmr * (activityMap[goal] || 1.5);

  // kg diff
  const kgDiff = Math.abs(t - w);
  const kgPerDay = kgDiff / Math.max(daysLeft, 30);
  // 1 kg fat ≈ 7700 kcal
  const dailyAdjust = Math.min(kgPerDay * 7700, 700); // cap at 700 kcal deficit/surplus

  let calories, protein, carbs, fat;

  if (goal === 'weight_loss') {
    calories = Math.round(tdee - dailyAdjust);
    protein  = Math.round(w * 2.2);           // high protein to preserve muscle
    fat      = Math.round(calories * 0.25 / 9);
    carbs    = Math.round((calories - protein * 4 - fat * 9) / 4);
  } else if (goal === 'weight_gain' || goal === 'muscle_gain') {
    calories = Math.round(tdee + dailyAdjust);
    protein  = Math.round(w * 2.0);
    fat      = Math.round(calories * 0.28 / 9);
    carbs    = Math.round((calories - protein * 4 - fat * 9) / 4);
  } else if (goal === 'endurance') {
    calories = Math.round(tdee + 100);
    protein  = Math.round(w * 1.6);
    carbs    = Math.round(w * 5);             // high carb for endurance
    fat      = Math.round((calories - protein * 4 - carbs * 4) / 9);
  } else { // maintenance
    calories = Math.round(tdee);
    protein  = Math.round(w * 1.8);
    fat      = Math.round(calories * 0.28 / 9);
    carbs    = Math.round((calories - protein * 4 - fat * 9) / 4);
  }

  // Clamp
  calories = Math.max(1200, Math.min(4500, calories));
  carbs    = Math.max(50, carbs);
  fat      = Math.max(30, fat);
  protein  = Math.max(60, protein);

  // Intensity label
  let intensity = 'moderate';
  if (kgPerDay > 0.05) intensity = 'aggressive';
  else if (kgPerDay < 0.02) intensity = 'light';

  return { calories, protein, carbs, fat, intensity };
}

// ─────────────────────────────────────────────
// WORKOUT PLAN GENERATOR
// ─────────────────────────────────────────────
function generateWorkoutPlan(profile, macros) {
  const { goal, workout_preference, gender } = profile;
  const isGym = (workout_preference || 'gym').toLowerCase() !== 'home';
  const P = isGym ? GYM_POOLS : HOME_POOLS;
  const cardioPool = isGym ? P.cardio_gym : P.cardio_home;
  const seed = (profile.phone || '').split('').reduce((a,c)=>a+c.charCodeAt(0),0);
  const { intensity } = macros;

  // Determine split based on goal + intensity
  // Returns array of 7 day objects (index 0=Sun ... 6=Sat)
  const plan = {};

  if (goal === 'weight_loss') {
    // 5 days on, 2 rest — circuit + cardio focus
    // Mon: Full Body A, Tue: Cardio, Wed: Full Body B, Thu: Cardio, Fri: Full Body C, Sat: Rest, Sun: Rest
    const schedules = [
      [null, 'full_a', 'cardio', 'full_b', 'cardio', 'full_c', null],   // normal
      [null, 'upper', 'cardio', 'lower', 'cardio', 'full_a', null],      // variant 2
      [null, 'full_a', 'lower', 'cardio', 'upper', 'full_b', null],      // variant 3
    ];
    const sched = schedules[seed % schedules.length];
    for (let d = 0; d < 7; d++) {
      const type = sched[d];
      if (!type) { plan[d] = restDay(); continue; }
      if (type === 'cardio') { plan[d] = cardioDay(cardioPool, seed+d, intensity); continue; }
      plan[d] = weightLossDay(type, P, cardioPool, seed+d, intensity);
    }

  } else if (goal === 'weight_gain' || goal === 'muscle_gain') {
    // PPL split — 6 days
    // Mon:Push Tue:Pull Wed:Legs Thu:Push Fri:Pull Sat:Legs Sun:Rest
    const pushDays  = [1, 4];
    const pullDays  = [2, 5];
    const legDays   = [3, 6];
    for (let d = 0; d < 7; d++) {
      if (d === 0) { plan[d] = restDay(); continue; }
      if (pushDays.includes(d)) { plan[d] = pushDay(P, seed+d, intensity, d===4); continue; }
      if (pullDays.includes(d)) { plan[d] = pullDay(P, seed+d, intensity, d===5); continue; }
      if (legDays.includes(d))  { plan[d] = legDay(P, seed+d, intensity, d===6); continue; }
    }

  } else if (goal === 'endurance') {
    // 5 days cardio/HIIT + 2 light strength
    const sched = [null, 'cardio_long', 'strength_light', 'cardio_hiit', 'strength_light', 'cardio_long', null];
    for (let d = 0; d < 7; d++) {
      const type = sched[d];
      if (!type) { plan[d] = restDay(); continue; }
      if (type === 'cardio_long') { plan[d] = cardioDay(cardioPool, seed+d, 'aggressive'); continue; }
      if (type === 'cardio_hiit') { plan[d] = hiitDay(cardioPool, seed+d); continue; }
      plan[d] = lightStrengthDay(P, seed+d);
    }

  } else {
    // Maintenance — 4 days training, 3 rest
    const sched = [null, 'upper', null, 'lower', null, 'full_a', null];
    for (let d = 0; d < 7; d++) {
      const type = sched[d];
      if (!type) { plan[d] = restDay(); continue; }
      plan[d] = maintenanceDay(type, P, seed+d);
    }
  }

  return plan;
}

function restDay() {
  return {
    title: "Rest Day 🛋️",
    note: "Active recovery. Light walk, stretching, or yoga.",
    tags: ["Recovery"],
    exercises: []
  };
}

function cardioDay(pool, seed, intensity) {
  const duration = intensity === 'aggressive' ? '30 mins' : '20 mins';
  const ex = pick(pool, intensity === 'aggressive' ? 4 : 3, seed);
  return {
    title: "Cardio Day 🏃",
    note: `${duration} of steady-state cardio. Keep heart rate at 65-75% max.`,
    tags: ["Cardio", "Fat Burn"],
    exercises: ex
  };
}

function hiitDay(pool, seed) {
  const ex = pick(pool, 5, seed);
  return {
    title: "HIIT Session ⚡",
    note: "30s ON, 30s OFF. Push hard on every round.",
    tags: ["HIIT", "Cardio", "Endurance"],
    exercises: ex
  };
}

function weightLossDay(type, P, cardioPool, seed, intensity) {
  const titles = {
    full_a: ["Full Body Burn A 🔥", "Total Body Circuit A"],
    full_b: ["Full Body Burn B 🔥", "Total Body Circuit B"],
    full_c: ["Full Body Burn C 🔥", "Total Body Finisher"],
    upper:  ["Upper Body + Cardio 💪", "Upper Body Burn"],
    lower:  ["Lower Body + Cardio 🦵", "Lower Body Burn"],
  };
  const titleArr = titles[type] || ["Training Day"];
  const title = titleArr[seed % titleArr.length];

  let exercises = [];
  if (type === 'full_a') {
    exercises = [
      ...pick(P.chest, 2, seed),
      ...pick(P.back, 2, seed+1),
      ...pick(P.legs, 2, seed+2),
      ...pick(P.core, 2, seed+3),
      ...pick(cardioPool, 1, seed+4),
    ];
  } else if (type === 'full_b') {
    exercises = [
      ...pick(P.shoulders, 2, seed),
      ...pick(P.biceps, 1, seed+1),
      ...pick(P.triceps, 1, seed+2),
      ...pick(P.legs, 2, seed+3),
      ...pick(P.core, 2, seed+4),
      ...pick(cardioPool, 1, seed+5),
    ];
  } else if (type === 'full_c') {
    exercises = [
      ...pick(P.chest, 1, seed),
      ...pick(P.back, 1, seed+1),
      ...pick(P.shoulders, 1, seed+2),
      ...pick(P.legs, 2, seed+3),
      ...pick(P.core, 3, seed+4),
      ...pick(cardioPool, 2, seed+5),
    ];
  } else if (type === 'upper') {
    exercises = [
      ...pick(P.chest, 2, seed),
      ...pick(P.back, 2, seed+1),
      ...pick(P.shoulders, 2, seed+2),
      ...pick(P.core, 1, seed+3),
      ...pick(cardioPool, 1, seed+4),
    ];
  } else {
    exercises = [
      ...pick(P.legs, 4, seed),
      ...pick(P.core, 2, seed+1),
      ...pick(cardioPool, 2, seed+2),
    ];
  }

  return { title, note: "Keep rest short. This is a circuit-style session.", tags: ["Fat Burn", "Circuit"], exercises };
}

function pushDay(P, seed, intensity, isVolume=false) {
  const title = isVolume ? "Push Day — Volume 🏋️" : "Push Day — Strength 🏋️";
  const note  = isVolume ? "Higher reps today. Mind-muscle connection." : "Heavier weight, controlled reps.";
  const exercises = [
    ...pick(P.chest, 3, seed),
    ...pick(P.shoulders, 2, seed+1),
    ...pick(P.triceps, 2, seed+2),
    ...(intensity === 'aggressive' ? pick(P.core, 1, seed+3) : []),
  ];
  return { title, note, tags: ["Chest", "Shoulders", "Triceps"], exercises };
}

function pullDay(P, seed, intensity, isVolume=false) {
  const title = isVolume ? "Pull Day — Volume 💪" : "Pull Day — Strength 💪";
  const note  = isVolume ? "Squeeze the back on every rep." : "Heavy rows and pulls today.";
  const exercises = [
    ...pick(P.back, 3, seed),
    ...pick(P.biceps, 3, seed+1),
    ...(intensity === 'aggressive' ? pick(P.core, 1, seed+2) : []),
  ];
  return { title, note, tags: ["Back", "Biceps"], exercises };
}

function legDay(P, seed, intensity, isVolume=false) {
  const title = isVolume ? "Leg Day — Volume 🦵" : "Leg Day — Strength 🦵";
  const note  = isVolume ? "Full depth. No ego squatting." : "Heavy compound movements.";
  const exercises = [
    ...pick(P.legs, intensity === 'aggressive' ? 6 : 5, seed),
    ...(intensity !== 'light' ? pick(P.core, 1, seed+1) : []),
  ];
  return { title, note, tags: ["Quads", "Hamstrings", "Glutes", "Calves"], exercises };
}

function lightStrengthDay(P, seed) {
  const exercises = [
    ...pick(P.chest, 2, seed),
    ...pick(P.back, 2, seed+1),
    ...pick(P.legs, 2, seed+2),
    ...pick(P.core, 2, seed+3),
  ];
  return { title: "Light Strength 🏃", note: "Moderate weight, full range of motion.", tags: ["Full Body", "Strength"], exercises };
}

function maintenanceDay(type, P, seed) {
  let exercises = [];
  let title = "Training Day 💪";
  if (type === 'upper') {
    title = "Upper Body 💪";
    exercises = [...pick(P.chest, 2, seed), ...pick(P.back, 2, seed+1), ...pick(P.shoulders, 2, seed+2), ...pick(P.biceps, 1, seed+3), ...pick(P.triceps, 1, seed+4)];
  } else if (type === 'lower') {
    title = "Lower Body 🦵";
    exercises = [...pick(P.legs, 5, seed), ...pick(P.core, 2, seed+1)];
  } else {
    title = "Full Body 🔥";
    exercises = [...pick(P.chest, 2, seed), ...pick(P.back, 2, seed+1), ...pick(P.legs, 2, seed+2), ...pick(P.core, 2, seed+3)];
  }
  return { title, note: "Maintenance mode. Train smart.", tags: ["Balanced"], exercises };
}

// ─────────────────────────────────────────────
// DIET PLAN GENERATOR
// ─────────────────────────────────────────────
function generateDietPlan(profile, macros) {
  const { diet_preference, goal } = profile;
  const seed = (profile.phone || '').split('').reduce((a,c)=>a+c.charCodeAt(0),0);
  const { calories, protein, carbs, fat, intensity } = macros;

  const dietType = (diet_preference || 'non-veg').toLowerCase()
    .replace('-','_').replace(' ','_');

  const proteinPool = FOOD['protein_' + dietType] || FOOD.protein_nonveg;
  const postPool    = FOOD['post_workout_' + (dietType === 'non_veg' ? 'nonveg' : (dietType==='vegan'?'vegan':'veg'))];
  const carbPool    = intensity === 'aggressive' && goal === 'weight_loss'
    ? FOOD.carbs_low
    : (goal === 'weight_gain' || goal === 'muscle_gain' ? FOOD.carbs_high : FOOD.carbs_medium);

  // Build 7 days (randomised selections)
  const plan = {};
  for (let d = 0; d < 7; d++) {
    const s = seed + d * 37;
    const isRestDay = d === 0 || d === 6;

    // Meal calorie split
    const breakfastCal   = Math.round(calories * 0.22);
    const midMorningCal  = Math.round(calories * 0.12);
    const lunchCal       = Math.round(calories * 0.28);
    const preWorkoutCal  = isRestDay ? 0 : Math.round(calories * 0.08);
    const postWorkoutCal = isRestDay ? 0 : Math.round(calories * 0.14);
    const dinnerCal      = Math.round(calories * (isRestDay ? 0.30 : 0.16));
    const preSleepCal    = Math.round(calories * 0.06);

    const meals = [];

    // Breakfast
    meals.push({
      name: "Breakfast",
      time: "7:30 AM",
      items: [rand(FOOD.breakfast_base, s), rand(proteinPool, s+1)],
      calories: breakfastCal,
      protein: Math.round(protein * 0.22),
      carbs: Math.round(carbs * 0.25),
      fat: Math.round(fat * 0.20),
    });

    // Mid morning
    meals.push({
      name: "Mid Morning Snack",
      time: "10:30 AM",
      items: [rand(FOOD.fats_healthy, s+2), rand(FOOD.drinks, s+3)],
      calories: midMorningCal,
      protein: Math.round(protein * 0.08),
      carbs: Math.round(carbs * 0.10),
      fat: Math.round(fat * 0.20),
    });

    // Lunch
    meals.push({
      name: "Lunch",
      time: "1:30 PM",
      items: [rand(carbPool, s+4), rand(proteinPool, s+5), rand(FOOD.veggies, s+6), "Dahi 1 katori"],
      calories: lunchCal,
      protein: Math.round(protein * 0.28),
      carbs: Math.round(carbs * 0.30),
      fat: Math.round(fat * 0.25),
    });

    // Pre workout (skip on rest days)
    if (!isRestDay) {
      meals.push({
        name: "Pre-Workout",
        time: "4:30 PM",
        items: [rand(FOOD.pre_workout, s+7)],
        calories: preWorkoutCal,
        protein: Math.round(protein * 0.05),
        carbs: Math.round(carbs * 0.12),
        fat: Math.round(fat * 0.05),
      });
    } else {
      // On rest day — afternoon snack instead
      meals.push({
        name: "Afternoon Snack",
        time: "4:30 PM",
        items: [rand(FOOD.fats_healthy, s+7), rand(FOOD.drinks, s+8)],
        calories: Math.round(calories * 0.10),
        protein: Math.round(protein * 0.05),
        carbs: Math.round(carbs * 0.08),
        fat: Math.round(fat * 0.15),
      });
    }

    // Post workout (skip on rest days)
    if (!isRestDay) {
      meals.push({
        name: "Post-Workout",
        time: "7:00 PM",
        items: [rand(postPool, s+9)],
        calories: postWorkoutCal,
        protein: Math.round(protein * 0.22),
        carbs: Math.round(carbs * 0.10),
        fat: Math.round(fat * 0.05),
      });
    }

    // Dinner
    meals.push({
      name: "Dinner",
      time: "9:00 PM",
      items: [rand(carbPool, s+10), rand(proteinPool, s+11), rand(FOOD.veggies, s+12)],
      calories: dinnerCal,
      protein: Math.round(protein * 0.25),
      carbs: Math.round(carbs * 0.20),
      fat: Math.round(fat * 0.25),
    });

    // Pre sleep
    meals.push({
      name: "Before Sleep",
      time: "10:30 PM",
      items: [rand(FOOD.pre_sleep, s+13)],
      calories: preSleepCal,
      protein: Math.round(protein * 0.08),
      carbs: Math.round(carbs * 0.03),
      fat: Math.round(fat * 0.10),
    });

    plan[d] = { meals, total_calories: calories };
  }

  return plan;
}

// ─────────────────────────────────────────────
// MAIN EXPORT — generatePlans(profile)
// profile = { name, phone, goal, current_weight, target_weight,
//             gender, age, workout_preference, diet_preference,
//             goal_date (ISO string), days_to_goal (number) }
// Returns { workout_plan, diet_plan, macros }
// ─────────────────────────────────────────────
function generatePlans(profile) {
  // Calculate days to goal if not provided
  if (!profile.days_to_goal && profile.goal_date) {
    const diff = new Date(profile.goal_date) - new Date();
    profile.days_to_goal = Math.max(30, Math.round(diff / 86400000));
  }
  profile.days_to_goal = profile.days_to_goal || 90;

  const macros       = calcMacros(profile);
  const workout_plan = generateWorkoutPlan(profile, macros);
  const diet_plan    = generateDietPlan(profile, macros);

  return { workout_plan, diet_plan, macros };
}

// Export for Node.js / browser
if (typeof module !== 'undefined') module.exports = { generatePlans, calcMacros };
if (typeof window !== 'undefined') window.PaceEngine = { generatePlans, calcMacros };
