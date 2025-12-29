import type { Request, Response } from 'express';
export declare function incomingCall(req: Request, res: Response): Promise<void>;
export declare function incomingSms(req: Request, res: Response): Promise<void>;
