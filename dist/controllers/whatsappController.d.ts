import type { Request, Response } from 'express';
export declare function verify(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function handleMessage(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
declare const _default: {
    handleMessage: typeof handleMessage;
    verify: typeof verify;
};
export default _default;
