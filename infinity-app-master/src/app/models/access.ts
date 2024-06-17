import { Base } from './base';
import { Assessment } from './assessment';

export class Access extends Base {
  code: string;
  used: number;
  validity: Date;
  quantity: number;
  companyId?: string;
  assessmentIds: string[];

  _assessments?: Assessment[];

  constructor() {
    super();
    this.used = 0;
    this.quantity = 0;
    this.assessmentIds = [];
  }
}
