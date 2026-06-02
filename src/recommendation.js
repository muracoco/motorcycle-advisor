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
  }
};

export function recommendBikes(bikes, riderProfile, preferences) {
  return bikes
    .map(enrichBike)
    .filter((bike) => matchesPreferences(bike, preferences))
    .filter((bike) => rankScore[bike.rank] <= rankScore[riderProfile.riderRank])
    .filter((bike) => bike.sheet <= riderProfile.heightRank)
    .sort((a, b) => {
      const rankDiff = rankScore[b.rank] - rankScore[a.rank];
      if (rankDiff !== 0) return rankDiff;
      return b.fuel - a.fuel;
    });
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
