/**
 * KURISU EXPRESSIONS — 56 Frame, 19 Duygusal Durum
 * Her durum 3 frame içerir. Animasyon sistemi bunlar arasında geçiş yapar.
 */

const IMAGE_PATH = '/images/';

export const kurisuExpressions: Record<string, string[]> = {
  // ── Temel duygular ───────────────────────────────────────────────────
  'normal':              [`${IMAGE_PATH}kurisu_normal1.png`,             `${IMAGE_PATH}kurisu_normal2.png`,             `${IMAGE_PATH}kurisu_normal3.png`],
  'happy':               [`${IMAGE_PATH}kurisu_happy1.png`,              `${IMAGE_PATH}kurisu_happy2.png`,              `${IMAGE_PATH}kurisu_happy3.png`],
  'sad':                 [`${IMAGE_PATH}kurisu_sad1.png`,                `${IMAGE_PATH}kurisu_sad2.png`,                `${IMAGE_PATH}kurisu_sad3.png`],
  'angry':               [`${IMAGE_PATH}kurisu_angry1.png`,              `${IMAGE_PATH}kurisu_angry2.png`,              `${IMAGE_PATH}kurisu_normal1.png`],
  'annoyed':             [`${IMAGE_PATH}kurisu_annoyed1.png`,            `${IMAGE_PATH}kurisu_annoyed2.png`,            `${IMAGE_PATH}kurisu_annoyed3.png`],
  'blush':               [`${IMAGE_PATH}kurisu_blush1.png`,              `${IMAGE_PATH}kurisu_blush2.png`,              `${IMAGE_PATH}kurisu_blush3.png`],
  'disappointed':        [`${IMAGE_PATH}kurisu_disappointed1.png`,       `${IMAGE_PATH}kurisu_disappointed2.png`,       `${IMAGE_PATH}kurisu_disappointed3.png`],
  'indifferent':         [`${IMAGE_PATH}kurisu_indifferent1.png`,        `${IMAGE_PATH}kurisu_indifferent2.png`,        `${IMAGE_PATH}kurisu_indifferent3.png`],
  'pissed':              [`${IMAGE_PATH}kurisu_pissed1.png`,             `${IMAGE_PATH}kurisu_pissed2.png`,             `${IMAGE_PATH}kurisu_pissed3.png`],
  'eyes_closed':         [`${IMAGE_PATH}kurisu_eyes_closed1.png`,        `${IMAGE_PATH}kurisu_eyes_closed2.png`,        `${IMAGE_PATH}kurisu_eyes_closed3.png`],
  'winking':             [`${IMAGE_PATH}kurisu_winking1.png`,            `${IMAGE_PATH}kurisu_winking2.png`,            `${IMAGE_PATH}kurisu_winking3.png`],

  // ── Yan duruşlar ─────────────────────────────────────────────────────
  'side':                [`${IMAGE_PATH}kurisu_side1.png`,               `${IMAGE_PATH}kurisu_side2.png`,               `${IMAGE_PATH}kurisu_side3.png`],
  'sided_angry':         [`${IMAGE_PATH}kurisu_sided_angry1.png`,        `${IMAGE_PATH}kurisu_sided_angry2.png`,        `${IMAGE_PATH}kurisu_sided_angry3.png`],
  'sided_blush':         [`${IMAGE_PATH}kurisu_sided_blush1.png`,        `${IMAGE_PATH}kurisu_sided_blush2.png`,        `${IMAGE_PATH}kurisu_sided_blush3.png`],
  'sided_pleasant':      [`${IMAGE_PATH}kurisu_sided_pleasant1.png`,     `${IMAGE_PATH}kurisu_sided_pleasant2.png`,     `${IMAGE_PATH}kurisu_sided_pleasant3.png`],
  'sided_surprised':     [`${IMAGE_PATH}kurisu_sided_surprised1.png`,    `${IMAGE_PATH}kurisu_sided_surprised2.png`,    `${IMAGE_PATH}kurisu_sided_surprised3.png`],
  'sided_thinking':      [`${IMAGE_PATH}kurisu_sided_thinking1.png`,     `${IMAGE_PATH}kurisu_sided_thinking2.png`,     `${IMAGE_PATH}kurisu_sided_thinking3.png`],
  'sided_worried':       [`${IMAGE_PATH}kurisu_sided_worried1.png`,      `${IMAGE_PATH}kurisu_sided_worried2.png`,      `${IMAGE_PATH}kurisu_sided_worried3.png`],
  'sided_eyes_closed':   [`${IMAGE_PATH}kurisu_sided_eyes_closed1.png`,  `${IMAGE_PATH}kurisu_sided_eyes_closed2.png`,  `${IMAGE_PATH}kurisu_sided_eyes_closed3.png`],

  // ── Takma adlar (prompt uyumluluğu) ──────────────────────────────────
  'thinking':            [`${IMAGE_PATH}kurisu_sided_thinking1.png`,     `${IMAGE_PATH}kurisu_sided_thinking2.png`,     `${IMAGE_PATH}kurisu_sided_thinking3.png`],
  'surprised':           [`${IMAGE_PATH}kurisu_sided_surprised1.png`,    `${IMAGE_PATH}kurisu_sided_surprised2.png`,    `${IMAGE_PATH}kurisu_sided_surprised3.png`],
  'pleasant':            [`${IMAGE_PATH}kurisu_sided_pleasant1.png`,     `${IMAGE_PATH}kurisu_sided_pleasant2.png`,     `${IMAGE_PATH}kurisu_sided_pleasant3.png`],
  'worried':             [`${IMAGE_PATH}kurisu_sided_worried1.png`,      `${IMAGE_PATH}kurisu_sided_worried2.png`,      `${IMAGE_PATH}kurisu_sided_worried3.png`],
};

/**
 * Returns a random frame from the given expression's 3-frame set.
 * Used for variety within the same emotion.
 */
export const getRandomFrame = (expression: string): string => {
  const frames = kurisuExpressions[expression] ?? kurisuExpressions['normal'];
  return frames[Math.floor(Math.random() * frames.length)];
};

/**
 * Returns all 3 frames for animation cycling.
 */
export const getFrames = (expression: string): string[] =>
  kurisuExpressions[expression] ?? kurisuExpressions['normal'];

export type KurisuExpression = keyof typeof kurisuExpressions;
