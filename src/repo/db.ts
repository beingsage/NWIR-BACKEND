// Database repository wrapper – delegates to real DB adapter.
import * as db from '../db/index'

export const initDb = db.initDb
export const addUser = db.createUser
export const updateUser = db.updateUser
export const findUserByEmail = db.findUserByEmail
export const findUserById = db.findUserById
export const listUsers = db.listUsers
export const listWorkers = db.listWorkers
export const createVerification = db.createVerification
export const listVerifications = db.listVerifications
export const safeList = db.safeList

// Additional helpers used by verification engine
export const getAllContracts = db.getAllContracts
export const getDevicesByWorkerId = db.getDevicesByWorkerId
export const getAllTasks = db.getAllTasks
export const getAllIncidents = db.getAllIncidents
export const getEmployerById = db.getEmployerById
export const createAuditLog = db.createAuditLog
export const getWorkerById = db.findUserById // alias for existing function
