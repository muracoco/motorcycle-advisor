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

assert.equal(profile.riderRank, "D");
assert.equal(profile.heightRank, 5);
assert.equal(profile.score.toFixed(3), "44.948");

const femaleProfile = calculateRiderProfile({
  age: 24,
  gender: "female",
  heightCm: 179,
  weightKg: 73,
  exercise: "normal",
  riding: "low"
});

assert.equal(femaleProfile.genderMultiplier, 0.88);
assert.equal(femaleProfile.score.toFixed(3), "39.554");

const cbr1000rr = enrichBike(bikes.find((bike) => bike.name === "CBR1000RR"));
assert.equal(cbr1000rr.diff, 21);
assert.equal(cbr1000rr.rank, "A");

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
  ["CB400 SUPER FOUR", "CBR250R"]
);

console.log("logic tests passed");
