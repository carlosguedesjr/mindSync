import { Request, Response } from 'express';

import {
  NeuroValidation
} from '../validations/report.validation';
import ValidationError from '../../exceptions/validation-error';

class ReportController {

  async neuro(request: Request, response: Response) {
    const query = request.query as any;

    await NeuroValidation.validate(query).catch(err => {
      throw new ValidationError(err.errors[0]);
    });

    return response.json({
      success: true
    })
  }
}

export default new ReportController();
