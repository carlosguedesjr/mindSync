import { Base } from './base';
import { differenceInYears } from 'date-fns';
import { Company, Branch, Department, Area, Post } from './company';

export class Student extends Base {
  name: string;
  email: string;
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

  get getAge() {
    return differenceInYears(new Date(), this.dateBirth) || 0;
  }

  get getGeneration() {
    const year = this.dateBirth.getFullYear();
    if (year >= 1943 && year <= 1960) return 'BB';
    else if (year >= 1961 && year <= 1981) return 'GX';
    else if (year >= 1982 && year <= 2004) return 'GY';
    else if (year >= 2005 && year <= 2022) return 'GZ';
  }

  get getSeven() {
    const age = this.getAge;
    let seven = 1;
    for (let i = 0; i <= 120; i += 7)
      if (i <= age) seven += 1;
      else if (i > age) break;
    return seven;
  }

  static get getScholarities() {
    return [
      {id: 'Ensino Fundamental Incompleto', name: 'Ensino Fundamental Incompleto'},
      {id: 'Ensino Fundamental Completo', name: 'Ensino Fundamental Completo'},
      {id: 'Ensino Médio Incompleto', name: 'Ensino Médio Incompleto'},
      {id: 'Ensino Médio Completo', name: 'Ensino Médio Completo'},
      {id: 'Ensino Técnico Incompleto', name: 'Ensino Técnico Incompleto'},
      {id: 'Ensino Técnico Completo', name: 'Ensino Técnico Completo'},
      {id: 'Ensino Superior Incompleto', name: 'Ensino Superior Incompleto'},
      {id: 'Ensino Superior Completo', name: 'Ensino Superior Completo'},
      {id: 'Pós-Graduação Incompleta', name: 'Pós-Graduação Incompleta'},
      {id: 'Pós-Graduação Completa', name: 'Pós-Graduação Completa'},
      {id: 'Mestrado Incompleto', name: 'Mestrado Incompleto'},
      {id: 'Mestrado Completo', name: 'Mestrado Completo'},
      {id: 'Doutorado Incompleto', name: 'Doutorado Incompleto'},
      {id: 'Doutorado Completo', name: 'Doutorado Completo'},
      {id: 'Pós-Doutorado Incompleto', name: 'Pós-Doutorado Incompleto'},
      {id: 'Pós-Doutorado Completo', name: 'Pós-Doutorado Completo'}
    ];
  }
}

export class Social {
  linkedin?: string;
  facebook?: string;
  instagram?: string;
}

export class Course {
  name: string;
  institute: string;
  city: string;
  state: string;
  conclusion?: Date;
}

export class Address {
  street: string;
  district: string;
  number: string;
  city: string;
  state: string;
  zipcode: string;
  complement?: string;
}

export class StudentCompany {
  companyId: string;
  branchId: string;
  departmentId: string;
  areaId: string;
  postId: string;

  _post?: Post;
  _area?: Area;
  _branch?: Branch;
  _company?: Company;
  _department?: Department;
}
