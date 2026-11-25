export interface HeroQuoteSlide {
  id: number;
  quote: string;
  image: string;
  fallbackImage: string;
  theme: string;
  subtext: string;
  tag: string;
}

export const HERO_QUOTES: HeroQuoteSlide[] = [
  {
    id: 1,
    quote: "All-Terrain Clogs — Built for Every Step",
    image: "/uploads/bec/bec_all_terrain_clogs_1795581066361.jpg",
    fallbackImage: "/uploads/bec/bec_all_terrain_clogs_1795581066361.jpg",
    theme: "All-terrain clogs",
    subtext: "Khaki molded EVA clogs with crimson & navy woven heel straps and lugged grip soles.",
    tag: "Collection 01"
  },
  {
    id: 2,
    quote: "Studded Slides — Sharp Hardware Comfort",
    image: "/uploads/bec/bec_studded_slides_1795581066443.jpg",
    fallbackImage: "/uploads/bec/bec_studded_slides_1795581066443.jpg",
    theme: "Studded slides",
    subtext: "Onyx H-band silhouettes finished with metallic pyramid studs and walnut stitched soles.",
    tag: "Collection 02"
  },
  {
    id: 3,
    quote: "Classic Slides — Clean Cushioned Craft",
    image: "/uploads/bec/bec_classic_slides_1795581065464.jpg",
    fallbackImage: "/uploads/bec/bec_classic_slides_1795581065464.jpg",
    theme: "Classic slides",
    subtext: "Ivory wide-strap comfort slides topped with crest embroidery on a deep black base.",
    tag: "Collection 03"
  },
  {
    id: 4,
    quote: "Double-Strap Sandals — Heritage Tartan Weave",
    image: "/uploads/bec/bec_double_strap_sandals_1795581066438.jpg",
    fallbackImage: "/uploads/bec/bec_double_strap_sandals_1795581066438.jpg",
    theme: "Double-strap sandals",
    subtext: "Adjustable twin-buckle cream and crimson tartan sandals for effortless warm-weather wear.",
    tag: "Collection 04"
  },
  {
    id: 5,
    quote: "Designer Clogs — Sculpted Street Silhouette",
    image: "/uploads/bec/bec_designer_clogs_1795581067141.jpg",
    fallbackImage: "/uploads/bec/bec_designer_clogs_1795581067141.jpg",
    theme: "Designer clogs",
    subtext: "Matte obsidian web-cutout clogs with cushioned crimson insoles and pivot backstraps.",
    tag: "Collection 05"
  },
  {
    id: 6,
    quote: "Double-Band Slippers — Tartan & Star Editions",
    image: "/uploads/bec/bec_double_band_slippers_1795581068033.jpg",
    fallbackImage: "/uploads/bec/bec_double_band_slippers_1795581068033.jpg",
    theme: "Double-band slippers",
    subtext: "Heritage check twill bands and glossy star medallions delivered nationwide across Ghana.",
    tag: "Collection 06"
  }
];

export function getRandomSessionHeroSlides(count: number = 6): HeroQuoteSlide[] {
  return HERO_QUOTES.slice(0, count);
}
