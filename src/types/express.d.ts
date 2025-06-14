import { Request, Response } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    username: string;
  };
}

export interface TypedResponse<T> extends Response {
  json: (data: T) => void;
}