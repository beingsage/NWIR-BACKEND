export declare function signUser(u: {
    id: string;
    email: string;
    role?: string;
}): string;
export declare function verifyToken(token: string): unknown;
