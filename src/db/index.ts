import * as mongo from './mongo'

export const initDb = mongo.initDb

export const createUser = mongo.createUser
export const findUserByEmail = mongo.findUserByEmail
export const findUserById = mongo.findUserById
export const updateUser = mongo.updateUser
export const listUsers = mongo.listUsers
export const listWorkers = mongo.listWorkers

export const createVerification = mongo.createVerification
export const listVerifications = mongo.listVerifications

export const safeList = mongo.safeList

export const getAllContracts = mongo.getAllContracts
export const getDevicesByWorkerId = mongo.getDevicesByWorkerId
export const getAllTasks = mongo.getAllTasks
export const getAllIncidents = mongo.getAllIncidents
export const getEmployerById = mongo.getEmployerById
export const createAuditLog = mongo.createAuditLog
export const getWorkerById = mongo.findUserById // alias
export const createCallHistory = mongo.createCallHistory
export const findLastCallByPhone = mongo.findLastCallByPhone
export const createCallLog = mongo.createCallLog
