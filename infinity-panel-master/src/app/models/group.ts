import { Base } from './base';
import { Permission } from './permission';

export class Group extends Base {
  name: string;
  permissions: Permission[];

  constructor() {
    super();
    this.permissions = [];
  }
}
