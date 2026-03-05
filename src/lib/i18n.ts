export type Lang = "en" | "rw" | "fr";

const dict: Record<Lang, Record<string, string>> = {
  en: {
    browse_workers: "Browse Workers",
    post_job: "Post a Job",
    category: "Category",
    district: "District",
    availability: "Availability",
    min_years: "Min years",
    live_in: "Live-in",
    apply: "Apply",
    reset: "Reset",
    call: "Call",
  },
  rw: {
    browse_workers: "Shakisha abakozi",
    post_job: "Tangaza akazi",
    category: "Icyiciro",
    district: "Akarere",
    availability: "Kuboneka",
    min_years: "Imyaka min",
    live_in: "Kubana",
    apply: "Shyira mu bikorwa",
    reset: "Subiramo",
    call: "Hamagara",
  },
  fr: {
    browse_workers: "Parcourir les travailleurs",
    post_job: "Publier une offre",
    category: "Catégorie",
    district: "District",
    availability: "Disponibilité",
    min_years: "Années min",
    live_in: "Logé",
    apply: "Appliquer",
    reset: "Réinitialiser",
    call: "Appeler",
  },
};

export function t(key: string, lang: Lang = "en") {
  return dict[lang][key] ?? dict.en[key] ?? key;
}

