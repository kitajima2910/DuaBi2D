// ============================================================
// Countries Marble Race — Country Flag Configurations
// ============================================================

import type { CountryData } from "@/types";

export const COUNTRIES: CountryData[] = [
  // ---- Asia (Southeast Asia) ----
  {
    id: 'vn',
    name: 'Việt Nam',
    nameEn: 'Vietnam',
    flagColors: ['#da251d', '#ffff00'],
    flagPattern: 'star',
    starCount: 1,
  },
  {
    id: 'th',
    name: 'Thái Lan',
    nameEn: 'Thailand',
    flagColors: ['#00247d', '#ffffff', '#ed1c24', '#ffffff', '#00247d'],
    flagPattern: 'tricolor',
    stripes: 'horizontal',
  },
  {
    id: 'id',
    name: 'Indonesia',
    nameEn: 'Indonesia',
    flagColors: ['#ed1c24', '#ffffff'],
    flagPattern: 'bicolor',
    stripes: 'horizontal',
  },
  {
    id: 'ph',
    name: 'Philippines',
    nameEn: 'Philippines',
    flagColors: ['#0038a8', '#ce1126', '#ffffff', '#fcd116'],
    flagPattern: 'tricolor',
    stripes: 'horizontal',
  },
  {
    id: 'my',
    name: 'Malaysia',
    nameEn: 'Malaysia',
    flagColors: ['#cc0001', '#ffffff', '#010066', '#fce300'],
    flagPattern: 'stripe',
    stripes: 'horizontal',
  },
  {
    id: 'sg',
    name: 'Singapore',
    nameEn: 'Singapore',
    flagColors: ['#ed1c24', '#ffffff'],
    flagPattern: 'bicolor',
    stripes: 'horizontal',
    starCount: 5,
  },

  // ---- Asia (East) ----
  {
    id: 'jp',
    name: 'Nhật Bản',
    nameEn: 'Japan',
    flagColors: ['#ffffff', '#bc002d'],
    flagPattern: 'circle',
  },
  {
    id: 'cn',
    name: 'Trung Quốc',
    nameEn: 'China',
    flagColors: ['#de2910', '#ffde00'],
    flagPattern: 'star',
    starCount: 5,
  },
  {
    id: 'kr',
    name: 'Hàn Quốc',
    nameEn: 'South Korea',
    flagColors: ['#ffffff', '#003478', '#cd2e3a', '#000000'],
    flagPattern: 'circle',
  },

  // ---- Asia (South) ----
  {
    id: 'in',
    name: 'Ấn Độ',
    nameEn: 'India',
    flagColors: ['#ff9933', '#ffffff', '#138808', '#000080'],
    flagPattern: 'tricolor',
    stripes: 'horizontal',
    starCount: 1,
  },

  // ---- Middle East ----
  {
    id: 'sa',
    name: 'Ả Rập Saudi',
    nameEn: 'Saudi Arabia',
    flagColors: ['#006c35', '#ffffff'],
    flagPattern: 'bicolor',
    stripes: 'horizontal',
  },
  {
    id: 'ae',
    name: 'UAE',
    nameEn: 'United Arab Emirates',
    flagColors: ['#009e49', '#ffffff', '#000000', '#ce1126'],
    flagPattern: 'tricolor',
    stripes: 'vertical',
  },
  {
    id: 'tr',
    name: 'Thổ Nhĩ Kỳ',
    nameEn: 'Turkey',
    flagColors: ['#e30a17', '#ffffff'],
    flagPattern: 'star',
    starCount: 1,
  },

  // ---- Europe (Western) ----
  {
    id: 'gb',
    name: 'Vương quốc Anh',
    nameEn: 'United Kingdom',
    flagColors: ['#012169', '#ffffff', '#c8102e'],
    flagPattern: 'cross',
  },
  {
    id: 'fr',
    name: 'Pháp',
    nameEn: 'France',
    flagColors: ['#002395', '#ffffff', '#ed2939'],
    flagPattern: 'tricolor',
    stripes: 'vertical',
  },
  {
    id: 'de',
    name: 'Đức',
    nameEn: 'Germany',
    flagColors: ['#000000', '#dd0000', '#ffce00'],
    flagPattern: 'tricolor',
    stripes: 'horizontal',
  },
  {
    id: 'it',
    name: 'Ý',
    nameEn: 'Italy',
    flagColors: ['#009246', '#ffffff', '#ce2b37'],
    flagPattern: 'tricolor',
    stripes: 'vertical',
  },
  {
    id: 'es',
    name: 'Tây Ban Nha',
    nameEn: 'Spain',
    flagColors: ['#aa151b', '#f1bf00', '#aa151b'],
    flagPattern: 'tricolor',
    stripes: 'horizontal',
  },
  {
    id: 'pt',
    name: 'Bồ Đào Nha',
    nameEn: 'Portugal',
    flagColors: ['#006600', '#ff0000', '#ffff00'],
    flagPattern: 'bicolor',
    stripes: 'vertical',
  },
  {
    id: 'nl',
    name: 'Hà Lan',
    nameEn: 'Netherlands',
    flagColors: ['#ae1c28', '#ffffff', '#21468b'],
    flagPattern: 'tricolor',
    stripes: 'horizontal',
  },
  {
    id: 'be',
    name: 'Bỉ',
    nameEn: 'Belgium',
    flagColors: ['#000000', '#fae042', '#ed2939'],
    flagPattern: 'tricolor',
    stripes: 'vertical',
  },
  {
    id: 'ch',
    name: 'Thụy Sĩ',
    nameEn: 'Switzerland',
    flagColors: ['#ff0000', '#ffffff'],
    flagPattern: 'cross',
  },
  {
    id: 'at',
    name: 'Áo',
    nameEn: 'Austria',
    flagColors: ['#ed2939', '#ffffff', '#ed2939'],
    flagPattern: 'tricolor',
    stripes: 'horizontal',
  },

  // ---- Europe (Nordic) ----
  {
    id: 'se',
    name: 'Thụy Điển',
    nameEn: 'Sweden',
    flagColors: ['#005baa', '#fecb00'],
    flagPattern: 'cross',
  },
  {
    id: 'no',
    name: 'Na Uy',
    nameEn: 'Norway',
    flagColors: ['#ba0c2f', '#ffffff', '#002664'],
    flagPattern: 'cross',
  },
  {
    id: 'dk',
    name: 'Đan Mạch',
    nameEn: 'Denmark',
    flagColors: ['#c8102e', '#ffffff'],
    flagPattern: 'cross',
  },
  {
    id: 'fi',
    name: 'Phần Lan',
    nameEn: 'Finland',
    flagColors: ['#003580', '#ffffff'],
    flagPattern: 'cross',
  },

  // ---- Europe (Eastern) ----
  {
    id: 'pl',
    name: 'Ba Lan',
    nameEn: 'Poland',
    flagColors: ['#ffffff', '#dc143c'],
    flagPattern: 'bicolor',
    stripes: 'horizontal',
  },
  {
    id: 'cz',
    name: 'Séc',
    nameEn: 'Czech Republic',
    flagColors: ['#11457e', '#ffffff', '#d7141a'],
    flagPattern: 'tricolor',
    stripes: 'horizontal',
  },
  {
    id: 'hu',
    name: 'Hungary',
    nameEn: 'Hungary',
    flagColors: ['#ce2b37', '#ffffff', '#008b45'],
    flagPattern: 'tricolor',
    stripes: 'horizontal',
  },
  {
    id: 'ro',
    name: 'Romania',
    nameEn: 'Romania',
    flagColors: ['#002b7f', '#fcd116', '#ce1126'],
    flagPattern: 'tricolor',
    stripes: 'vertical',
  },
  {
    id: 'ua',
    name: 'Ukraine',
    nameEn: 'Ukraine',
    flagColors: ['#0057b7', '#ffd700'],
    flagPattern: 'bicolor',
    stripes: 'horizontal',
  },
  {
    id: 'ru',
    name: 'Nga',
    nameEn: 'Russia',
    flagColors: ['#ffffff', '#0033a0', '#da291c'],
    flagPattern: 'tricolor',
    stripes: 'horizontal',
  },

  // ---- Europe (South) ----
  {
    id: 'gr',
    name: 'Hy Lạp',
    nameEn: 'Greece',
    flagColors: ['#0d5eaf', '#ffffff'],
    flagPattern: 'cross',
  },

  // ---- Americas (North) ----
  {
    id: 'us',
    name: 'Hoa Kỳ',
    nameEn: 'United States',
    flagColors: ['#b22234', '#ffffff', '#3c3b6e'],
    flagPattern: 'stripe',
    stripes: 'horizontal',
    starCount: 50,
  },
  {
    id: 'ca',
    name: 'Canada',
    nameEn: 'Canada',
    flagColors: ['#ff0000', '#ffffff', '#ff0000'],
    flagPattern: 'tricolor',
    stripes: 'vertical',
  },
  {
    id: 'mx',
    name: 'Mexico',
    nameEn: 'Mexico',
    flagColors: ['#006341', '#ffffff', '#ce1126'],
    flagPattern: 'tricolor',
    stripes: 'vertical',
  },

  // ---- Americas (South) ----
  {
    id: 'br',
    name: 'Brazil',
    nameEn: 'Brazil',
    flagColors: ['#009739', '#fedd00', '#002776', '#ffffff'],
    flagPattern: 'circle',
  },
  {
    id: 'ar',
    name: 'Argentina',
    nameEn: 'Argentina',
    flagColors: ['#75aadb', '#ffffff', '#75aadb'],
    flagPattern: 'tricolor',
    stripes: 'horizontal',
  },

  // ---- Oceania ----
  {
    id: 'au',
    name: 'Úc',
    nameEn: 'Australia',
    flagColors: ['#00008b', '#ffffff', '#ed1c24'],
    flagPattern: 'cross',
    starCount: 6,
  },

  // ---- Africa ----
  {
    id: 'za',
    name: 'Nam Phi',
    nameEn: 'South Africa',
    flagColors: ['#de3831', '#ffffff', '#002395', '#ffb612', '#009b3a'],
    flagPattern: 'tricolor',
    stripes: 'horizontal',
  },
  {
    id: 'ng',
    name: 'Nigeria',
    nameEn: 'Nigeria',
    flagColors: ['#008751', '#ffffff', '#008751'],
    flagPattern: 'tricolor',
    stripes: 'vertical',
  },
  {
    id: 'ke',
    name: 'Kenya',
    nameEn: 'Kenya',
    flagColors: ['#000000', '#ffffff', '#bb0000', '#009a44'],
    flagPattern: 'stripe',
    stripes: 'horizontal',
  },
  {
    id: 'eg',
    name: 'Ai Cập',
    nameEn: 'Egypt',
    flagColors: ['#ce1126', '#ffffff', '#000000'],
    flagPattern: 'tricolor',
    stripes: 'horizontal',
  },
];

/** Map country id → CountryData */
export const COUNTRY_MAP = new Map<string, CountryData>(
  COUNTRIES.map((c) => [c.id, c]),
);

/** Get n random countries (deterministic by seed) */
export function getRandomCountries(
  count: number,
  seed: number,
  exclude?: string[],
): CountryData[] {
  const pool = exclude
    ? COUNTRIES.filter((c) => !exclude!.includes(c.id))
    : [...COUNTRIES];

  // Fisher-Yates shuffle with seed
  let s = seed | 0;
  const nextRand = (): number => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(nextRand() * (i + 1));
    [pool[i], pool[j]] = [pool[j]!, pool[i]!];
  }

  return pool.slice(0, Math.min(count, pool.length));
}

/** Get country display name by locale */
export function getCountryName(country: CountryData, lang: 'vi' | 'en'): string {
  return lang === 'vi' ? country.name : country.nameEn;
}
