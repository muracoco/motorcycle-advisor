import assert from "node:assert/strict";
import { bikes } from "../data/bikes.js";
import { calculateRiderProfile, enrichBike } from "../src/ranking.js";
import { recommendBikes } from "../src/recommendation.js";

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

console.log("logic tests passed");
