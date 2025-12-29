import { Db } from 'mongodb';
export declare function connect(): Promise<Db | null>;
export declare function initDb(): Promise<void>;
export declare function createUser({ id, name, email, passwordHash, role }: any): Promise<{
    id: any;
    name: any;
    email: any;
    password_hash: any;
    role: any;
    created_at: Date;
}>;
export declare function findUserByEmail(email: string): Promise<import("mongodb").WithId<import("bson").Document> | null>;
export declare function findUserById(id: string): Promise<import("mongodb").WithId<import("bson").Document> | null>;
export declare function updateUser(u: any): Promise<import("mongodb").WithId<import("bson").Document> | null>;
export declare function listUsers(): Promise<import("mongodb").WithId<import("bson").Document>[]>;
export declare function listWorkers(): Promise<import("mongodb").WithId<import("bson").Document>[]>;
export declare function createVerification({ id, workerId, result }: any): Promise<{
    id: any;
    worker_id: any;
    result: any;
    created_at: Date;
}>;
export declare function listVerifications(_filter?: any): Promise<import("mongodb").WithId<import("bson").Document>[]>;
export declare function safeList(collectionName: string): Promise<import("mongodb").WithId<import("bson").Document>[]>;
export declare function getAllContracts(filters?: {
    workerId?: string;
    employerId?: string;
    status?: string;
}): Promise<import("mongodb").WithId<import("bson").Document>[]>;
export declare function getDevicesByWorkerId(workerId: string): Promise<import("mongodb").WithId<import("bson").Document>[]>;
export declare function getAllTasks(filters?: {
    workerId?: string;
    employerId?: string;
}): Promise<import("mongodb").WithId<import("bson").Document>[]>;
export declare function getAllIncidents(filters?: {
    workerId?: string;
    status?: string;
}): Promise<import("mongodb").WithId<import("bson").Document>[]>;
export declare function getEmployerById(employerId: string): Promise<import("mongodb").WithId<import("bson").Document> | null>;
export declare function createAuditLog(logData: any): Promise<{
    id: string;
    actorId: any;
    actorName: any;
    actorRole: any;
    action: any;
    resource: any;
    resourceId: any;
    details: any;
    ipAddress: any;
    userAgent: any;
    timestamp: Date;
} | null>;
export declare function close(): Promise<void>;
