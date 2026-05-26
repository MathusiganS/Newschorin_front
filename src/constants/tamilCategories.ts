/** Must match backend classifier labels (`category_ta` in DB). */
export const TAMIL_NEWS_CATEGORIES = [
  "அரசியல்",
  "பொருளாதாரம்",
  "வணிகம்",
  "விளையாட்டு",
  "சுகாதாரம்",
  "தொழில்நுட்பம்",
  "சர்வதேசம்",
  "குற்றம் & சட்டம்",
  "கல்வி",
  "விபத்து & அனர்த்தம்",
  "போக்குவரத்து",
  "அரசு அறிவிப்பு",
  "சுற்றுலா & குடிவரவு",
  "மதம் & கலாச்சாரம்",
] as const;

export type TamilNewsCategory = (typeof TAMIL_NEWS_CATEGORIES)[number];
