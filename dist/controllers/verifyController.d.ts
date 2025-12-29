import type { Request, Response } from 'express';
export declare function verifyWorker(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
