import { Base } from './base';
import { Company } from './company';
import { Assessment } from './assessment';

export class Access extends Base {
  used: number;
  code!: string;
  validity!: Date;
  quantity: number;
  companyId?: string;
  assessmentIds: string[];

  _company?: Company;
  _assessments?: Assessment[];

  constructor() {
    super();
    this.used = 0;
    this.quantity = 0;
    this.assessmentIds = [];
  }
}
