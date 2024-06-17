import { Router } from 'express';

import userRouter from './user.route';
import reportRouter from './report.route';
import studentRouter from './student.route';

const routes = Router();

routes.use('/users', userRouter);
routes.use('/reports', reportRouter);
routes.use('/students', studentRouter);

export default routes;
