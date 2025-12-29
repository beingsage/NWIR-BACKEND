import type { Request, Response, NextFunction } from 'express';
export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
    };
}
export declare function requireAuth(req: AuthRequest, res: Response, next: NextFunction): Response<any, Record<string, any>> | undefined;
