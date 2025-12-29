"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ok = ok;
exports.err = err;
function ok(res, data, status = 200) {
    return res.status(status).json({ success: true, data });
}
function err(res, status = 400, error = 'Bad Request') {
    return res.status(status).json({ success: false, error });
}
