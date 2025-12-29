export type Role = 'admin' | 'worker' | 'employer' | 'auditor';
export interface User {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    role: Role;
    createdAt: string;
    updatedAt?: string;
}
