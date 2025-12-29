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
exports.createCallLog = exports.findLastCallByPhone = exports.createCallHistory = exports.getWorkerById = exports.createAuditLog = exports.getEmployerById = exports.getAllIncidents = exports.getAllTasks = exports.getDevicesByWorkerId = exports.getAllContracts = exports.safeList = exports.listVerifications = exports.createVerification = exports.listWorkers = exports.listUsers = exports.findUserById = exports.findUserByEmail = exports.updateUser = exports.addUser = exports.initDb = void 0;
// Database repository wrapper – delegates to real DB adapter.
const db = __importStar(require("../db/index"));
exports.initDb = db.initDb;
exports.addUser = db.createUser;
exports.updateUser = db.updateUser;
exports.findUserByEmail = db.findUserByEmail;
exports.findUserById = db.findUserById;
exports.listUsers = db.listUsers;
exports.listWorkers = db.listWorkers;
exports.createVerification = db.createVerification;
exports.listVerifications = db.listVerifications;
exports.safeList = db.safeList;
// Additional helpers used by verification engine
exports.getAllContracts = db.getAllContracts;
exports.getDevicesByWorkerId = db.getDevicesByWorkerId;
exports.getAllTasks = db.getAllTasks;
exports.getAllIncidents = db.getAllIncidents;
exports.getEmployerById = db.getEmployerById;
exports.createAuditLog = db.createAuditLog;
exports.getWorkerById = db.findUserById; // alias for existing function
// Call history helpers
exports.createCallHistory = db.createCallHistory;
exports.findLastCallByPhone = db.findLastCallByPhone;
exports.createCallLog = db.createCallLog;
