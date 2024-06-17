import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

import { FirebaseAbstract } from './abstract';
import { Coupon } from 'src/app/models/coupon';

@Injectable({
  providedIn: 'root'
})
export class CouponService extends FirebaseAbstract<Coupon> {

  static collectionName = 'coupons';

  constructor(
    protected db: AngularFirestore
  ) {
    super(db, CouponService.collectionName);
  }
}
