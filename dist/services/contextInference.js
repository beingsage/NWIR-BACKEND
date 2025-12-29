"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inferFromText = inferFromText;
const PLACE_KEYWORDS = {
    muJ: 'Jaipur',
    muj: 'Jaipur',
    manipal: 'Jaipur',
    iit: 'Delhi',
    airport: 'Nearby Airport',
};
function inferFromText(text) {
    if (!text)
        return null;
    text = text.toLowerCase();
    for (const key in PLACE_KEYWORDS) {
        if (text.includes(key)) {
            return { region: PLACE_KEYWORDS[key], confidence: 0.45 };
        }
    }
    return null;
}
