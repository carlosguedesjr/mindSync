import * as admin from "firebase-admin";
import { Request, Response, NextFunction } from "express";

import AppError from "../../exceptions/app-error";

export const ensureAuthentication = async (
  request: Request,
  _: Response,
  nextFunction: NextFunction
) => {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    throw new AppError('JWT token is missing', 'application/token-missing');
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2) {
    throw new AppError('Token malformatted.', 'application/token-malformatted', 406);
  }

  const [scheme, token] = parts;

  if (!/^Bearer$/i.test(scheme)) {
    throw new AppError('Token malformatted.', 'application/token-malformatted', 406);
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token);

    request.user = decoded;
  } catch (e) {
    throw new AppError('Invalid token', 'application/invalid-token', 401);
  }

  nextFunction();
};
