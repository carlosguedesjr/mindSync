import AppError from './app-error';

class ValidationError extends AppError {
  constructor(err: any = 'Validation fails.') {
    super(err, 'application/validations-fail');
  }
}

export default ValidationError;
