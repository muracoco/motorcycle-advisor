import assert from "node:assert/strict";
import { bikes } from "../data/bikes.js";
import {
  calculateRiderProfile,
  enrichBike,
  getBikeRank,
  getHeightRank,
  getRiderRank,
  getRohrerMultiplier
} from "../src/ranking.js";
import { buildRecommendationReasons, labels, recommendBikes } from "../src/recommendation.js";

const bikeIds = new Set();
for (const bike of bikes) {
  assert.ok(!bikeIds.has(bike.id), `duplicate bike id ${bike.id}`);
  bikeIds.add(bike.id);
  assert.equal(enrichBike(bike).diff, bike.power + bike.weight + bike.sheet + bike.style);
  assert.equal(enrichBike(bike).rank, getBikeRank(enrichBike(bike).diff));
  assert.ok(labels.gear[bike.gear], `missing gear label for ${bike.name}`);
  assert.ok(labels.displacement[bike.displacement], `missing displacement label for ${bike.name}`);
  assert.ok(labels.genre[bike.genre], `missing genre label for ${bike.name}`);
  assert.ok(labels.loading[bike.loading], `missing loading label for ${bike.name}`);
  assert.ok(labels.fuel[bike.fuel], `missing fuel label for ${bike.name}`);
  assert.ok(labels.wind[bike.wind], `missing wind label for ${bike.name}`);
}

for (const [height, expectedRank] of [
  [160, 1],
  [161, 2],
  [165, 2],
  [166, 3],
  [170, 3],
  [171, 4],
  [176, 4],
  [177, 5]
]) {
  assert.equal(getHeightRank(height), expectedRank, `height rank for ${height}cm`);
}

for (const [score, expectedRank] of [
  [30, "F"],
  [31, "E"],
  [42, "E"],
  [43, "D"],
  [46, "D"],
  [47, "C"],
  [52, "C"],
  [53, "B"],
  [70, "B"],
  [71, "A"]
]) {
  assert.equal(getRiderRank(score), expectedRank, `rider rank for score ${score}`);
}

for (const [diff, expectedRank] of [
  [9, "F"],
  [10, "E"],
  [12, "E"],
  [13, "D"],
  [15, "D"],
  [16, "C"],
  [17, "C"],
  [18, "B"],
  [20, "B"],
  [21, "A"]
]) {
  assert.equal(getBikeRank(diff), expectedRank, `bike rank for diff ${diff}`);
}

for (const [rohrerIndex, expectedMultiplier] of [
  [100, 0.8],
  [101, 0.9],
  [116, 0.9],
  [117, 1],
  [145, 1],
  [146, 0.9],
  [160, 0.9],
  [161, 0.8]
]) {
  assert.equal(
    getRohrerMultiplier(rohrerIndex),
    expectedMultiplier,
    `rohrer multiplier for ${rohrerIndex}`
  );
}

const profile = calculateRiderProfile({
  age: 24,
  gender: "male",
  heightCm: 179,
  weightKg: 73,
  exercise: "normal",
  riding: "low"
});

assert.equal(profile.riderRank, "C");
assert.equal(profile.heightRank, 5);
assert.equal(profile.bodyExperienceScore.toFixed(3), "44.948");
assert.equal(profile.score.toFixed(3), "49.948");

const femaleProfile = calculateRiderProfile({
  age: 24,
  gender: "female",
  heightCm: 179,
  weightKg: 73,
  exercise: "normal",
  riding: "low"
});

assert.equal(femaleProfile.genderMultiplier, 0.85);
assert.equal(femaleProfile.score.toFixed(3), "42.456");

const cbr1000rr = enrichBike(bikes.find((bike) => bike.name === "CBR1000RR"));
assert.equal(cbr1000rr.diff, 23);
assert.equal(cbr1000rr.rank, "A");

assert.equal(bikes.length, 88);

const sourceProfile = calculateRiderProfile({
  age: 24,
  gender: "male",
  heightCm: 179,
  weightKg: 73,
  exercise: "normal",
  riding: "normal"
});

assert.equal(sourceProfile.riderRank, "B");
assert.equal(sourceProfile.score.toFixed(3), "57.880");

const recommendations = recommendBikes(bikes, profile, {
  maker: "ホンダ",
  gear: "1",
  displacementMax: "7",
  genres: ["2", "3", "4", "5", "6"],
  loadingMin: "1",
  fuelMin: "1"
});

assert.deepEqual(
  recommendations.map((bike) => bike.name),
  [
    "CB1300 SF",
    "CB1300 SB",
    "CRF250L",
    "400X",
    "CBR400R",
    "CB400 SF",
    "CB400 SB",
    "NC750",
    "NM4",
    "VT1300",
    "CBR125R",
    "CBR250R",
    "シャドウ400",
    "CTX700N",
    "シャドウ750",
    "モンキー"
  ]
);

assert.ok(recommendations.every((bike) => Array.isArray(bike.reasons)));
assert.ok(recommendations.every((bike) => bike.reasons.length > 0));
assert.deepEqual(
  buildRecommendationReasons(recommendations[0], profile, {
    maker: "ホンダ",
    gear: "1",
    displacementMax: "7",
    genres: ["2", "3", "4", "5", "6"],
    loadingMin: "1",
    fuelMin: "1"
  }).slice(0, 2),
  ["車種ランクCでライダーランクC以内", "シート高ランク3が身長ランク5以内"]
);

const strictRecommendations = recommendBikes(bikes, profile, {
  maker: "ホンダ",
  gear: "1",
  displacementMax: "3",
  genres: ["4"],
  loadingMin: "1",
  fuelMin: "4"
});

assert.deepEqual(
  strictRecommendations.map((bike) => bike.name),
  ["CBR125R", "CBR250R"]
);

const loadingFilteredRecommendations = recommendBikes(bikes, profile, {
  maker: "ホンダ",
  gear: "any",
  displacementMax: "7",
  genres: ["1", "2", "3", "4", "5", "6"],
  loadingMin: "4",
  fuelMin: "1"
});

assert.deepEqual(
  loadingFilteredRecommendations.map((bike) => bike.name),
  ["ゴールドウィング", "フォルツァ", "SW GT400"]
);

console.log("logic tests passed");
