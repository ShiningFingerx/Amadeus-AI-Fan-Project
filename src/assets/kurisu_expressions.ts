
type ExpressionMap = {
  [key: string]: string[];
};

const IMAGE_PATH = 'images/'; 

export const kurisuExpressions: ExpressionMap = {
    // --- STATİK DURUMLAR ---
    'angry':                [`${IMAGE_PATH}kurisu_angry1.png`, `${IMAGE_PATH}kurisu_angry2.png`],
    'annoyed':              [`${IMAGE_PATH}kurisu_annoyed1.png`],
    'blush':                [`${IMAGE_PATH}kurisu_blush1.png`],
    'disappointed':         [`${IMAGE_PATH}kurisu_disappointed1.png`],
    'eyes_closed':          [`${IMAGE_PATH}kurisu_eyes_closed1.png`],
    'happy':                [`${IMAGE_PATH}kurisu_happy1.png`],
    'indifferent':          [`${IMAGE_PATH}kurisu_indifferent1.png`],
    'normal':               [`${IMAGE_PATH}kurisu_normal1.png`],
    'pissed':               [`${IMAGE_PATH}kurisu_pissed1.png`],
    'sad':                  [`${IMAGE_PATH}kurisu_sad1.png`],
    'side':                 [`${IMAGE_PATH}kurisu_side1.png`],
    'sided_angry':          [`${IMAGE_PATH}kurisu_sided_angry1.png`],
    'sided_blush':          [`${IMAGE_PATH}kurisu_sided_blush1.png`],
    'sided_eyes_closed':    [`${IMAGE_PATH}kurisu_sided_eyes_closed1.png`],
    'sided_pleasant':       [`${IMAGE_PATH}kurisu_sided_pleasant1.png`],
    'sided_surprised':      [`${IMAGE_PATH}kurisu_sided_surprised1.png`],
    'sided_thinking':       [`${IMAGE_PATH}kurisu_sided_thinking1.png`],
    'sided_worried':        [`${IMAGE_PATH}kurisu_sided_worried1.png`],
    'winking':              [`${IMAGE_PATH}kurisu_winking1.png`],
    'thinking':             [`${IMAGE_PATH}kurisu_sided_thinking1.png`], 
    'glitching':            [`${IMAGE_PATH}kurisu_pissed1.png`, `${IMAGE_PATH}kurisu_angry1.png`],

    // --- KONUŞMA ANİMASYONLARI ---
    'speaking-angry':       [`${IMAGE_PATH}kurisu_angry1.png`, `${IMAGE_PATH}kurisu_angry2.png`],
    'speaking-annoyed':     [`${IMAGE_PATH}kurisu_annoyed1.png`, `${IMAGE_PATH}kurisu_annoyed2.png`, `${IMAGE_PATH}kurisu_annoyed3.png`],
    'speaking-blush':       [`${IMAGE_PATH}kurisu_blush1.png`, `${IMAGE_PATH}kurisu_blush2.png`, `${IMAGE_PATH}kurisu_blush3.png`],
    'speaking-disappointed':[`${IMAGE_PATH}kurisu_disappointed1.png`, `${IMAGE_PATH}kurisu_disappointed2.png`, `${IMAGE_PATH}kurisu_disappointed3.png`],
    'speaking-eyes_closed': [`${IMAGE_PATH}kurisu_eyes_closed1.png`, `${IMAGE_PATH}kurisu_eyes_closed2.png`, `${IMAGE_PATH}kurisu_eyes_closed3.png`],
    'speaking-happy':       [`${IMAGE_PATH}kurisu_happy1.png`, `${IMAGE_PATH}kurisu_happy2.png`, `${IMAGE_PATH}kurisu_happy3.png`],
    'speaking-indifferent': [`${IMAGE_PATH}kurisu_indifferent1.png`, `${IMAGE_PATH}kurisu_indifferent2.png`, `${IMAGE_PATH}kurisu_indifferent3.png`],
    'speaking-normal':      [`${IMAGE_PATH}kurisu_normal1.png`, `${IMAGE_PATH}kurisu_normal2.png`, `${IMAGE_PATH}kurisu_normal3.png`],
    'speaking-pissed':      [`${IMAGE_PATH}kurisu_pissed1.png`, `${IMAGE_PATH}kurisu_pissed2.png`, `${IMAGE_PATH}kurisu_pissed3.png`],
    'speaking-sad':         [`${IMAGE_PATH}kurisu_sad1.png`, `${IMAGE_PATH}kurisu_sad2.png`, `${IMAGE_PATH}kurisu_sad3.png`],
    'speaking-side':        [`${IMAGE_PATH}kurisu_side1.png`, `${IMAGE_PATH}kurisu_side2.png`, `${IMAGE_PATH}kurisu_side3.png`],
    'speaking-sided_angry': [`${IMAGE_PATH}kurisu_sided_angry1.png`, `${IMAGE_PATH}kurisu_sided_angry2.png`, `${IMAGE_PATH}kurisu_sided_angry3.png`],
    'speaking-sided_blush': [`${IMAGE_PATH}kurisu_sided_blush1.png`, `${IMAGE_PATH}kurisu_sided_blush2.png`, `${IMAGE_PATH}kurisu_sided_blush3.png`],
    'speaking-sided_eyes_closed': [`${IMAGE_PATH}kurisu_sided_eyes_closed1.png`, `${IMAGE_PATH}kurisu_sided_eyes_closed2.png`, `${IMAGE_PATH}kurisu_sided_eyes_closed3.png`],
    'speaking-sided_pleasant':    [`${IMAGE_PATH}kurisu_sided_pleasant1.png`, `${IMAGE_PATH}kurisu_sided_pleasant2.png`, `${IMAGE_PATH}kurisu_sided_pleasant3.png`],
    'speaking-sided_surprised':   [`${IMAGE_PATH}kurisu_sided_surprised1.png`, `${IMAGE_PATH}kurisu_sided_surprised2.png`, `${IMAGE_PATH}kurisu_sided_surprised3.png`],
    'speaking-sided_thinking':    [`${IMAGE_PATH}kurisu_sided_thinking1.png`, `${IMAGE_PATH}kurisu_sided_thinking2.png`, `${IMAGE_PATH}kurisu_sided_thinking3.png`],
    'speaking-sided_worried':     [`${IMAGE_PATH}kurisu_sided_worried1.png`, `${IMAGE_PATH}kurisu_sided_worried2.png`, `${IMAGE_PATH}kurisu_sided_worried3.png`],
    'speaking-winking':           [`${IMAGE_PATH}kurisu_winking1.png`, `${IMAGE_PATH}kurisu_winking2.png`, `${IMAGE_PATH}kurisu_winking3.png`],
};
