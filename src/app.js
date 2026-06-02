import { bikes } from "../data/bikes.js";
import { calculateRiderProfile } from "./ranking.js";
import { labels, recommendBikes } from "./recommendation.js";

const form = document.querySelector("#advisor-form");
const resultSummary = document.querySelector("#result-summary");
const resultList = document.querySelector("#result-list");
const emptyState = document.querySelector("#empty-state");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  render();
});

render();

function render() {
  const formData = new FormData(form);
  const riderProfile = calculateRiderProfile({
    age: formData.get("age"),
    gender: formData.get("gender"),
    heightCm: formData.get("heightCm"),
    weightKg: formData.get("weightKg"),
    exercise: formData.get("exercise"),
    riding: formData.get("riding")
  });
  const preferences = {
    maker: formData.get("maker"),
    gear: formData.get("gear"),
    displacementMax: formData.get("displacementMax"),
    genres: formData.getAll("genres"),
    loadingMin: formData.get("loadingMin"),
    fuelMin: formData.get("fuelMin")
  };
  const recommendations = recommendBikes(bikes, riderProfile, preferences);

  renderSummary(riderProfile, recommendations.length);
  renderResults(recommendations);
}

function renderSummary(profile, count) {
  resultSummary.innerHTML = `
    <div>
      <span class="metric-label">ライダーランク</span>
      <strong>${profile.riderRank}</strong>
    </div>
    <div>
      <span class="metric-label">身長ランク</span>
      <strong>${profile.heightRank}</strong>
    </div>
    <div>
      <span class="metric-label">算出スコア</span>
      <strong>${profile.score.toFixed(2)}</strong>
    </div>
    <div>
      <span class="metric-label">ローレル指数</span>
      <strong>${profile.rohrerIndex.toFixed(1)}</strong>
    </div>
    <div>
      <span class="metric-label">候補数</span>
      <strong>${count}</strong>
    </div>
  `;
}

function renderResults(recommendations) {
  resultList.innerHTML = "";
  emptyState.hidden = recommendations.length > 0;

  for (const bike of recommendations) {
    const item = document.createElement("article");
    item.className = "bike-card";
    item.innerHTML = `
      <div>
        <p class="maker">${bike.maker}</p>
        <h3>${bike.name}</h3>
      </div>
      <dl>
        <div><dt>車種ランク</dt><dd>${bike.rank}</dd></div>
        <div><dt>難易度</dt><dd>${bike.diff}</dd></div>
        <div><dt>ギア</dt><dd>${labels.gear[bike.gear]}</dd></div>
        <div><dt>排気量</dt><dd>${labels.displacement[bike.displacement]}</dd></div>
        <div><dt>タイプ</dt><dd>${labels.genre[bike.genre]}</dd></div>
        <div><dt>積載</dt><dd>${labels.loading[bike.loading]}</dd></div>
        <div><dt>燃費</dt><dd>${labels.fuel[bike.fuel]}</dd></div>
        <div><dt>シート高</dt><dd>${bike.sheet}</dd></div>
      </dl>
    `;
    resultList.append(item);
  }
}
