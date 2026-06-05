import { enrichBike, rankScore } from "./ranking.js";

export const labels = {
  gear: {
    1: "MT",
    2: "AT"
  },
  displacement: {
    1: "50cc以下",
    2: "125cc以下",
    3: "250cc以下",
    4: "400cc以下",
    5: "750cc以下",
    6: "1000cc以下",
    7: "無制限"
  },
  genre: {
    1: "スクーター",
    2: "アメリカン",
    3: "ネイキッド",
    4: "スポーツ",
    5: "オフロード",
    6: "ツアラー"
  },
  loading: {
    1: "少ない",
    2: "やや少ない",
    3: "普通",
    4: "多い",
    5: "かなり多い"
  },
  fuel: {
    1: "低い",
    2: "やや低い",
    3: "普通",
    4: "良い",
    5: "とても良い"
  },
  wind: {
    1: "低い",
    2: "やや低い",
    3: "普通",
    4: "高い",
    5: "かなり高い"
  }
};

export function recommendBikes(bikes, riderProfile, preferences) {
  return bikes
    .map(enrichBike)
    .filter((bike) => matchesPreferences(bike, preferences))
    .filter((bike) => rankScore[bike.rank] <= rankScore[riderProfile.riderRank])
    .filter((bike) => bike.sheet <= riderProfile.heightRank)
    .map((bike) => ({
      ...bike,
      reasons: buildRecommendationReasons(bike, riderProfile, preferences)
    }))
    .sort((a, b) => {
      const rankDiff = rankScore[b.rank] - rankScore[a.rank];
      if (rankDiff !== 0) return rankDiff;
      return b.fuel - a.fuel;
    });
}

export function buildRecommendationReasons(bike, riderProfile, preferences) {
  const reasons = [];
  const rankMargin = rankScore[riderProfile.riderRank] - rankScore[bike.rank];
  const heightMargin = riderProfile.heightRank - bike.sheet;

  reasons.push(`車種ランク${bike.rank}でライダーランク${riderProfile.riderRank}以内`);
  reasons.push(`シート高ランク${bike.sheet}が身長ランク${riderProfile.heightRank}以内`);

  if (preferences.maker !== "any") {
    reasons.push(`${bike.maker}を選択`);
  }
  if (preferences.gear !== "any") {
    reasons.push(`${labels.gear[bike.gear]}条件に一致`);
  }

  reasons.push(`${labels.displacement[bike.displacement]}が排気量上限内`);

  if (Number(preferences.loadingMin) > 1) {
    reasons.push(`積載性が${labels.loading[bike.loading]}`);
  }
  if (Number(preferences.fuelMin) > 1) {
    reasons.push(`燃費が${labels.fuel[bike.fuel]}`);
  }
  if (rankMargin > 0) {
    reasons.push(`ランク余裕 +${rankMargin}`);
  }
  if (heightMargin > 0) {
    reasons.push(`足つき余裕 +${heightMargin}`);
  }

  return reasons.slice(0, 5);
}

function matchesPreferences(bike, preferences) {
  if (preferences.maker !== "any" && bike.maker !== preferences.maker) return false;
  if (preferences.gear !== "any" && bike.gear !== Number(preferences.gear)) return false;
  if (bike.displacement > Number(preferences.displacementMax)) return false;
  if (!preferences.genres.includes(String(bike.genre))) return false;
  if (bike.loading < Number(preferences.loadingMin)) return false;
  if (bike.fuel < Number(preferences.fuelMin)) return false;
  return true;
}
