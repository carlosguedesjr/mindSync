import { Base } from './base';

export class Company extends Base {
  name: string;
  image?: string;

  constructor() {
    super();
  }
}

export class Branch extends Base {
  name: string;
  companyId: string;

  _company?: Company;
}

export class Department extends Base {
  name: string;
  branchId: string;

  _branch?: Branch;
}

export class Area extends Base {
  name: string;
  departmentId: string;

  _department?: Department;
}

export class Post extends Base {
  name: string;
  level: number;
  areaId: string;

  _area?: Area;
}
