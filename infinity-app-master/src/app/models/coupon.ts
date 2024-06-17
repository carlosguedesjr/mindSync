import { Base } from './base';
import { Assessment } from './assessment';

export class Coupon extends Base {
  code: string;
  used: number;
  value: number;
  validity: Date;
  quantity: number;
  percentage: boolean;

  mbas: string[];
  courses: string[];
  assessments: string[];

  _mbas?: any[];
  _courses?: any[];
  _assessments?: Assessment[];

  constructor() {
    super();
    this.used = 0;
    this.mbas = [];
    this.quantity = 0;
    this.courses = [];
    this.assessments = [];
    this.percentage = false;
  }
}
