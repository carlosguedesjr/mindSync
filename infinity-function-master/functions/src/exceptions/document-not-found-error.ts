import AppError from './app-error';

export class DocumentNotFoundError extends AppError {
  constructor() {
    super('Document not found.', 'application/document-not-found', 404);
  }
}
