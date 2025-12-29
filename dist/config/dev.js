"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TELECOM_MODE = void 0;
// Dev config for toggling telecom mock mode
exports.TELECOM_MODE = process.env.TELECOM_MODE || 'MOCK';
exports.default = {
    TELECOM_MODE: exports.TELECOM_MODE,
};
