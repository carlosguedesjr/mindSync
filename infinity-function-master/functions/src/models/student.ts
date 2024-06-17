import { Base } from './base';
import { Company, Branch, Department, Area, Post } from './company';

export class Student extends Base {
  name!: string;
  email!: string;
  authType: 'email' | 'google' | 'facebook' | 'apple';

  token?: string;
  image?: string;
  phone?: string;
  genre?: string;
  dateBirth?: Date;
  childrens?: number;
  cityBirth?: string;
  stateBirth?: string;
  scholarity?: string;
  civilStatus?: string;

  rg?: string;
  cpf?: string;
  rgEmitter?: string;

  motherName?: string;
  spouseName?: string;

  social?: Social;
  course?: Course;
  address?: Address;
  company?: StudentCompany;

  constructor() {
    super();
    this.authType = 'email';
  }
}

export class Social {
  linkedin?: string;
  facebook?: string;
  instagram?: string;
}

export class Course {
  name!: string;
  institute!: string;
  city!: string;
  state!: string;
  conclusion?: Date;
}

export class Address {
  street!: string;
  district!: string;
  number!: string;
  city!: string;
  state!: string;
  zipcode!: string;
  complement?: string;
}

export class StudentCompany {
  companyId!: string;
  branchId!: string;
  departmentId!: string;
  areaId!: string;
  postId!: string;

  _post?: Post;
  _area?: Area;
  _branch?: Branch;
  _company?: Company;
  _department?: Department;
}
