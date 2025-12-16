import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { HTTP_CODES } from '../common/httpCodes';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_123';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"

    if (!token) {
        return res.status(HTTP_CODES.UNAUTHORIZED).json({ message: 'Authentication required' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        (req as any).user = { id: decoded.id };
        next();
    } catch (error) {
        return res.status(HTTP_CODES.FORBIDDEN).json({ message: 'Invalid or expired token' });
    }
};
