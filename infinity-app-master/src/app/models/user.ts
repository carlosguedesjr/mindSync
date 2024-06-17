import { Base } from './base';

export class User extends Base {
  name: string;
  email: string;
  image?: string;

  authType: 'email';
  authRole: 'common' | 'administrator' | 'developer';

  constructor() {
    super();
    this.authType = 'email';
    this.authRole = 'common';
  }
}
