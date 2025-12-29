import type { Request, Response } from 'express';
export declare function mockCall(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function mockSms(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
