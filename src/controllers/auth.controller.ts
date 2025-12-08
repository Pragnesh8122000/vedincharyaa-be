import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_123';
const SALT_ROUNDS = 10;
const STATIC_OTP = '123456';

export const signup = async (req: Request, res: Response) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.sendResponse(false, 400, 'USER_EXISTS');
        }

        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        const newUser = new User({
            firstName,
            lastName,
            email,
            passwordHash,
            isVerified: false
        });

        await newUser.save();

        res.sendResponse(true, 201, 'USER_CREATED', { email: newUser.email });
    } catch (error) {
        console.error('Signup error:', error);
        res.sendResponse(false, 500, 'SIGNUP_ERROR');
    }
};

export const verifyOtp = async (req: Request, res: Response) => {
    try {
        const { email, otp } = req.body;

        if (otp !== STATIC_OTP) {
            return res.sendResponse(false, 400, 'INVALID_OTP');
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.sendResponse(false, 404, 'USER_NOT_FOUND');
        }

        user.isVerified = true;
        await user.save();

        res.sendResponse(true, 200, 'OTP_VERIFIED');
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.sendResponse(false, 500, 'VERIFY_OTP_ERROR');
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.sendResponse(false, 400, 'INVALID_CREDENTIALS');
        }

        if (!user.isVerified) {
            return res.sendResponse(false, 403, 'USER_NOT_VERIFIED');
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.sendResponse(false, 400, 'INVALID_CREDENTIALS');
        }

        const token = jwt.sign(
            { id: user._id, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.sendResponse(true, 200, 'LOGIN_SUCCESS', {
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.sendResponse(false, 500, 'LOGIN_ERROR');
    }
};
