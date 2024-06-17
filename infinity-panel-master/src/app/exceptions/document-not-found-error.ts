export class DocumentNotFoundError extends Error {
  constructor(id: string) {
    super(`Document '${id}' was not found.`);

    this.name = 'DocumentNotFoundError';
  }
}
