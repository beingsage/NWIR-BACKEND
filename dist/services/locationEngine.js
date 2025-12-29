"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.inferLocation = inferLocation;
const numberMetadata_1 = require("./numberMetadata");
const contextInference_1 = require("./contextInference");
const historyInference_1 = require("./historyInference");
const repo = __importStar(require("../repo/db"));
async function inferLocation({ phone, text }) {
    const signals = [];
    // number
    const numberSignal = (0, numberMetadata_1.inferFromNumber)(phone);
    signals.push({ region: numberSignal.region, confidence: numberSignal.confidence, source: 'number_metadata' });
    // context text
    if (text) {
        const contextSignal = (0, contextInference_1.inferFromText)(text);
        if (contextSignal)
            signals.push({ region: contextSignal.region, confidence: contextSignal.confidence, source: 'user_context' });
    }
    // history
    const historySignal = await (0, historyInference_1.inferFromHistory)(phone);
    if (historySignal)
        signals.push({ region: historySignal.region, confidence: historySignal.confidence, source: 'history' });
    // Fusion
    const scoreMap = {};
    let totalConfidence = 0;
    signals.forEach((s) => {
        if (!scoreMap[s.region])
            scoreMap[s.region] = 0;
        scoreMap[s.region] += s.confidence;
        totalConfidence += s.confidence;
    });
    let bestRegion = 'Unknown';
    let bestScore = 0;
    for (const region in scoreMap) {
        if (scoreMap[region] > bestScore) {
            bestRegion = region;
            bestScore = scoreMap[region];
        }
    }
    const result = {
        estimated_location: bestRegion,
        confidence: Math.min(bestScore, 1),
        sources: signals.reduce((acc, s) => {
            acc[s.source] = s.confidence;
            return acc;
        }, {}),
        raw_signals: signals,
    };
    // Save history so system learns
    try {
        await repo.createCallHistory({ phone, inferredLocation: result.estimated_location, timestamp: new Date() });
    }
    catch (e) {
        // don't block inference if saving fails
        // eslint-disable-next-line no-console
        console.warn('Failed to save call history:', e.message);
    }
    return result;
}
