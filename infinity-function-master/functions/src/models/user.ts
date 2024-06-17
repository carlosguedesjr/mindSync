import { Base } from './base';
import { PageRole } from '../enums/page-role.enum';
import { AuthRole, AuthType } from '../enums/auth.enum';

export class User extends Base {
  name!: string;
  email!: string;
  phone!: string;
  image?: string;

  permissions: Permission[];
  
  authType: AuthType;
  authRole: AuthRole;

  constructor() {
    super();
    this.permissions = [];
    this.authType = AuthType.EMAIL;
    this.authRole = AuthRole.COMMON;
  }
}

export class Permission {
  page!: string;
  role!: PageRole;
}