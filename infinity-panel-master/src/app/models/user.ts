import { Base } from './base';
import { Group } from './group';
import { Permission } from './permission';

export class User extends Base {
  name: string;
  email: string;
  image?: string;
  groups: string[];
  permissions: Permission[];

  authType: 'email';
  authRole: 'common' | 'administrator' | 'developer';

  _groups?: Group[];

  constructor() {
    super();
    this.groups = [];
    this.permissions = [];
    this.authType = 'email';
    this.authRole = 'common';
  }
}
