import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export const setToken = (user_id: number, email: string) => {
    return jwt.sign({ id: user_id, email }, env.jwtSecret, { expiresIn: '7d' });
};

export const verifyToken = (token: string) => {
    return jwt.verify(token, env.jwtSecret);
};