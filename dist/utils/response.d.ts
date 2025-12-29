import type { Response } from 'express';
export declare function ok(res: Response, data: unknown, status?: number): Response<any, Record<string, any>>;
export declare function err(res: Response, status?: number, error?: unknown): Response<any, Record<string, any>>;
