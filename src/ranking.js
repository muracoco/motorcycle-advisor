export const rankScore = {
  A: 6,
  B: 5,
  C: 4,
  D: 3,
  E: 2,
  F: 1
};

const baseScores = [
  { age: 20, score: 52.88 },
  { age: 25, score: 51.12 },
  { age: 30, score: 49.7 },
  { age: 35, score: 48.43 },
  { age: 40, score: 47.38 },
  { age: 45, score: 45.68 },
  { age: 50, score: 44.11 },
  { age: 55, score: 40.6 },
  { age: 60, score: 37.84 },
  { age: 65, score: 35.08 },
  { age: 70, score: 31.32 },
  { age: 75, score: 26.56 },
  { age: 80, score: 20.8 }
];

export const exerciseMultipliers = {
  veryLow: 0.7,
  low: 0.85,
  normal: 1,
  high: 1.1,
  veryHigh: 1.2
};

export const ridingMultipliers = {
  veryLow: 0.7,
  low: 0.85,
  normal: 1,
  high: 1.1,
  veryHigh: 1.4
};

export const genderMultipliers = {
  male: 1,
  female: 0.88
};

export function getBaseScore(age) {
  const normalizedAge = Number(age);
  if (!Number.isFinite(normalizedAge)) return baseScores[0].score;

  let selected = baseScores[0];
  for (const entry of baseScores) {
    if (normalizedAge >= entry.age) {
      selected = entry;
    }
  }
  return selected.score;
}

export function calculateRohrerIndex(heightCm, weightKg) {
  const height = Number(heightCm);
  const weight = Number(weightKg);
  if (!height || !weight) return 0;
  return (weight / Math.pow(height, 3)) * 10000000;
}

export function getRohrerMultiplier(rohrerIndex) {
  if (rohrerIndex < 100 || rohrerIndex >= 160) return 0.8;
  if (rohrerIndex < 115 || rohrerIndex >= 145) return 0.9;
  return 1;
}

export function getHeightRank(heightCm) {
  const height = Number(heightCm);
  if (height >= 176) return 5;
  if (height >= 170) return 4;
  if (height >= 165) return 3;
  if (height >= 161) return 2;
  return 1;
}

export function getRiderRank(score) {
  if (score >= 70) return "A";
  if (score >= 52) return "B";
  if (score >= 46) return "C";
  if (score >= 38) return "D";
  if (score >= 31) return "E";
  return "F";
}

export function calculateRiderProfile(input) {
  const baseScore = getBaseScore(input.age);
  const rohrerIndex = calculateRohrerIndex(input.heightCm, input.weightKg);
  const rohrerMultiplier = getRohrerMultiplier(rohrerIndex);
  const genderMultiplier = genderMultipliers[input.gender] ?? 1;
  const exerciseMultiplier = exerciseMultipliers[input.exercise] ?? 1;
  const ridingMultiplier = ridingMultipliers[input.riding] ?? 1;
  const score = baseScore * genderMultiplier * rohrerMultiplier * exerciseMultiplier * ridingMultiplier;

  return {
    baseScore,
    rohrerIndex,
    genderMultiplier,
    rohrerMultiplier,
    exerciseMultiplier,
    ridingMultiplier,
    score,
    riderRank: getRiderRank(score),
    heightRank: getHeightRank(input.heightCm)
  };
}

export function calculateBikeDifficulty(bike) {
  return bike.power + bike.weight + bike.sheet + bike.style;
}

export function getBikeRank(diff) {
  if (diff >= 21) return "A";
  if (diff >= 18) return "B";
  if (diff >= 16) return "C";
  if (diff >= 13) return "D";
  if (diff >= 10) return "E";
  return "F";
}

export function enrichBike(bike) {
  const diff = calculateBikeDifficulty(bike);
  return {
    ...bike,
    diff,
    rank: getBikeRank(diff)
  };
}
