import { Router } from 'express';
import { AuthRole } from '../../enums/auth.enum';

import { ensureRole } from '../middlewares/ensure-role';
import UserController from '../controllers/user.controller';
import { ensureAuthentication } from '../middlewares/ensure-authentication';

const userRouter = Router();

userRouter.use(ensureAuthentication);

userRouter.get('/', UserController.index);
userRouter.post('/', UserController.store);
userRouter.get('/:id', UserController.show);
userRouter.put('/:id', UserController.update);
userRouter.delete(
  '/:id',
  ensureRole([AuthRole.ADMINISTRATOR]),
  UserController.delete
);

export default userRouter;
