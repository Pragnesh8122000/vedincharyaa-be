import { Request, Response, NextFunction } from "express";
import enMessages from "../common/languages/enMessages.json";

// Define the shape of our messages file
type MessageCode = keyof typeof enMessages;
// Extend Express Response interface
declare global {
  namespace Express {
    interface Response {
      sendResponse(
        success: boolean,
        statusCode: number,
        messageCode: string,
        data?: any,
        replaceObj?: Record<string, string>
      ): void;
    }
  }
}

const responseMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.sendResponse = (
    success: boolean,
    statusCode: number,
    messageCode: string,
    data?: any,
    replaceObj?: Record<string, string>
  ) => {
    let message =
      (enMessages as any)[messageCode] || enMessages.UNKNOWN_MESSAGE_CODE;

    if (message === enMessages.UNKNOWN_MESSAGE_CODE) {
      console.warn(
        `Warning: Message code '${messageCode}' not found in enMessages.json`
      );
    } else if (replaceObj) {
      // Replace placeholders: "Welcome {firstName}" -> "Welcome Arjun"
      Object.keys(replaceObj).forEach((key) => {
        message = message.replace(`{${key}}`, replaceObj[key]);
      });
    }

    res.status(statusCode).json({
      success,
      message,
      data,
    });
  };
  next();
};

export default responseMiddleware;
