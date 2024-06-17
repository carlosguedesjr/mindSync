import { Request, Response, NextFunction } from 'express';

import { AuthRole } from '../../enums/auth.enum';
import AppError from '../../exceptions/app-error';

export const ensureRole = (roles: AuthRole[]) => (
  request: Request,
  _: Response,
  nextFunction: NextFunction
) => {
  if (undefined === roles.find(role => request.user?.role === role)) {
    throw new AppError('Without permission.', 'application/without-permission', 403);
  }

  nextFunction();
};
