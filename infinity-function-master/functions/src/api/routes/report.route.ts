import { Router } from 'express';
import { AuthRole } from '../../enums/auth.enum';

import { ensureRole } from '../middlewares/ensure-role';
import ReportController from '../controllers/report.controller';
import { ensureAuthentication } from '../middlewares/ensure-authentication';

const reportRouter = Router();

reportRouter.use(ensureAuthentication);

reportRouter.get('/neuro', ensureRole([AuthRole.ADMINISTRATOR]), ReportController.neuro);

export default reportRouter;
