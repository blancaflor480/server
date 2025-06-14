import { Request, Response } from 'express';
import { AuthRequest } from '../types/express';
export declare const getInventoryItems: (req: AuthRequest, res: Response) => Promise<void>;
export declare const createInventoryItem: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateInventoryItem: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteInventoryItem: (req: AuthRequest, res: Response) => Promise<void>;
export declare const validateModelNo: (req: Request, res: Response) => Promise<void>;
export declare const validateSerialNo: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=inventory.controller.d.ts.map