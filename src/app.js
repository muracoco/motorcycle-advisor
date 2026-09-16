import { bikes } from "../data/bikes.js";
import { calculateRiderProfile, rankScore } from "./ranking.js";
import { labels, recommendBikes } from "./recommendation.js";

const form = document.querySelector("#advisor-form");
const inputStatus = document.querySelector("#input-status");
const resultSummary = document.querySelector("#result-summary");
const resultList = document.querySelector("#result-list");
const emptyState = document.querySelector("#empty-state");
const rankTrack = document.querySelector("#rank-track");
const sortOrder = document.querySelector("#sort-order");

form.addEventListener("input", render);
form.addEventListener("change", render);
form.addEventListener("reset", () => {
  requestAnimationFrame(render);
});
sortOrder.addEventListener("change", render);

form.addEventListener("submit", (event) => {
  event.preventDefault();
  render();
});

render();

function render() {
  if (!form.checkValidity()) {
    const invalidInput = form.querySelector("input:invalid");
    inputStatus.textContent = `${invalidInput.labels[0].textContent.trim()}は${invalidInput.min}～${invalidInput.max}の整数で入力してください。`;
    inputStatus.hidden = false;
    resultSummary.replaceChildren();
    rankTrack.replaceChildren();
    resultList.replaceChildren();
    emptyState.hidden = true;
    return;
  }
  inputStatus.textContent = "";
  inputStatus.hidden = true;

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
  const recommendations = sortRecommendations(
    recommendBikes(bikes, riderProfile, preferences),
    riderProfile,
    sortOrder.value
  );

  renderSummary(riderProfile, recommendations.length);
  renderRankTrack(riderProfile);
  renderResults(recommendations, riderProfile);
}

function renderSummary(profile, count) {
  const scorePercent = Math.min(100, Math.max(0, (profile.score / 80) * 100));
  resultSummary.innerHTML = `
    <div class="metric primary">
      <span class="metric-label">ライダーランク</span>
      <strong>${profile.riderRank}</strong>
      <span class="metric-note">総合スコア ${profile.score.toFixed(2)}</span>
    </div>
    <div class="metric">
      <span class="metric-label">身長ランク</span>
      <strong>${profile.heightRank}</strong>
      <span class="metric-note">身長による加点 +${profile.heightRank}</span>
    </div>
    <div class="metric wide">
      <span class="metric-label">身体・経験スコア</span>
      <strong>${profile.bodyExperienceScore.toFixed(2)}</strong>
      <span class="meter"><span style="width: ${scorePercent}%"></span></span>
    </div>
    <div class="metric">
      <span class="metric-label">ローレル指数</span>
      <strong>${profile.rohrerIndex.toFixed(1)}</strong>
      <span class="metric-note">補正 ${profile.rohrerMultiplier}</span>
    </div>
    <div class="metric">
      <span class="metric-label">候補数</span>
      <strong>${count}</strong>
      <span class="metric-note">全${bikes.length}車種から抽出</span>
    </div>
  `;
}

function renderRankTrack(profile) {
  const ranks = ["F", "E", "D", "C", "B", "A"];
  rankTrack.innerHTML = ranks
    .map((rank) => {
      const active = rankScore[rank] <= rankScore[profile.riderRank] ? "active" : "";
      const current = rank === profile.riderRank ? "current" : "";
      return `<span class="${active} ${current}">${rank}</span>`;
    })
    .join("");
}

function renderResults(recommendations, riderProfile) {
  resultList.innerHTML = "";
  emptyState.hidden = recommendations.length > 0;

  for (const bike of recommendations) {
    const fitScore = calculateFitScore(bike, riderProfile);
    const fitPercent = Math.min(100, Math.max(8, fitScore));
    const rankMargin = rankScore[riderProfile.riderRank] - rankScore[bike.rank];
    const item = document.createElement("article");
    item.className = "bike-card";
    item.innerHTML = `
      <div class="bike-card-head">
        <div>
          <p class="maker">${bike.maker}</p>
          <h3>${bike.name}</h3>
        </div>
        <span class="rank-badge rank-${bike.rank}">${bike.rank}</span>
      </div>
      <div class="fit-row">
        <span>目安スコア</span>
        <div class="fit-bar"><span style="width: ${fitPercent}%"></span></div>
        <strong>${fitScore}</strong>
      </div>
      <div class="reason-block">
        <p>条件との一致</p>
        <ul>
          ${bike.reasons.map((reason) => `<li>${reason}</li>`).join("")}
        </ul>
      </div>
      <dl>
        <div><dt>難易度指数</dt><dd>${bike.diff}</dd></div>
        <div><dt>ランク差</dt><dd>${rankMargin >= 0 ? `+${rankMargin}` : rankMargin}</dd></div>
        <div><dt>ギア</dt><dd>${labels.gear[bike.gear]}</dd></div>
        <div><dt>排気量</dt><dd>${labels.displacement[bike.displacement]}</dd></div>
        <div><dt>タイプ</dt><dd>${labels.genre[bike.genre]}</dd></div>
        <div><dt>積載</dt><dd>${labels.loading[bike.loading]}</dd></div>
        <div><dt>燃費</dt><dd>${labels.fuel[bike.fuel]}</dd></div>
        <div><dt>風防</dt><dd>${labels.wind[bike.wind]}</dd></div>
        <div><dt>シート高ランク</dt><dd>${bike.sheet}</dd></div>
      </dl>
    `;
    resultList.append(item);
  }
}

function sortRecommendations(recommendations, riderProfile, order) {
  const sorted = [...recommendations];
  if (order === "fuel") {
    return sorted.sort((a, b) => b.fuel - a.fuel || calculateFitScore(b, riderProfile) - calculateFitScore(a, riderProfile));
  }
  if (order === "displacement") {
    return sorted.sort((a, b) => b.displacement - a.displacement || calculateFitScore(b, riderProfile) - calculateFitScore(a, riderProfile));
  }
  if (order === "difficulty") {
    return sorted.sort((a, b) => b.diff - a.diff || b.fuel - a.fuel);
  }
  return sorted.sort((a, b) => calculateFitScore(b, riderProfile) - calculateFitScore(a, riderProfile) || b.fuel - a.fuel);
}

function calculateFitScore(bike, riderProfile) {
  const rankMargin = rankScore[riderProfile.riderRank] - rankScore[bike.rank];
  const heightMargin = riderProfile.heightRank - bike.sheet;
  const difficultyBalance = Math.max(0, 24 - bike.diff);
  return Math.round(45 + rankMargin * 12 + heightMargin * 7 + bike.fuel * 3 + bike.loading * 2 + difficultyBalance);
}
