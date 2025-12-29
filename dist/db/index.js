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
exports.createCallLog = exports.findLastCallByPhone = exports.createCallHistory = exports.getWorkerById = exports.createAuditLog = exports.getEmployerById = exports.getAllIncidents = exports.getAllTasks = exports.getDevicesByWorkerId = exports.getAllContracts = exports.safeList = exports.listVerifications = exports.createVerification = exports.listWorkers = exports.listUsers = exports.updateUser = exports.findUserById = exports.findUserByEmail = exports.createUser = exports.initDb = void 0;
const mongo = __importStar(require("./mongo"));
exports.initDb = mongo.initDb;
exports.createUser = mongo.createUser;
exports.findUserByEmail = mongo.findUserByEmail;
exports.findUserById = mongo.findUserById;
exports.updateUser = mongo.updateUser;
exports.listUsers = mongo.listUsers;
exports.listWorkers = mongo.listWorkers;
exports.createVerification = mongo.createVerification;
exports.listVerifications = mongo.listVerifications;
exports.safeList = mongo.safeList;
exports.getAllContracts = mongo.getAllContracts;
exports.getDevicesByWorkerId = mongo.getDevicesByWorkerId;
exports.getAllTasks = mongo.getAllTasks;
exports.getAllIncidents = mongo.getAllIncidents;
exports.getEmployerById = mongo.getEmployerById;
exports.createAuditLog = mongo.createAuditLog;
exports.getWorkerById = mongo.findUserById; // alias
exports.createCallHistory = mongo.createCallHistory;
exports.findLastCallByPhone = mongo.findLastCallByPhone;
exports.createCallLog = mongo.createCallLog;
