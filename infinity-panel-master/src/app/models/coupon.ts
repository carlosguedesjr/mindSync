import { Base } from './base';

export class Coupon extends Base {
  code: string;
  used: number;
  value: number;
  validity: Date;
  accessId: string;
  quantity: number;
  percentage: boolean;

  constructor() {
    super();
    this.used = 0;
    this.quantity = 0;
    this.percentage = false;
  }
}
