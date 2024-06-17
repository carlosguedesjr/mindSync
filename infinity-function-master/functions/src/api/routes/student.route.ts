import { Router } from 'express';
import { AuthRole } from '../../enums/auth.enum';

import { ensureRole } from '../middlewares/ensure-role';
import StudentController from '../controllers/student.controller';
import { ensureAuthentication } from '../middlewares/ensure-authentication';

const studentRouter = Router();

studentRouter.post('/', StudentController.store);

studentRouter.use(ensureAuthentication);

studentRouter.put('/:id', StudentController.update);

studentRouter.get('/', ensureRole([AuthRole.ADMINISTRATOR]), StudentController.all);
studentRouter.delete('/:id', ensureRole([AuthRole.ADMINISTRATOR]), StudentController.delete);

export default studentRouter;
