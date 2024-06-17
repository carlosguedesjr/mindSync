import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { Coupon } from 'src/app/models/coupon';

@Component({
  selector: 'app-coupon-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class CouponDetailComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public object: Coupon,
    private dialogRef: MatDialogRef<CouponDetailComponent>,
  ) { }

  ngOnInit(): void {}

  goToBack(params?: any): void {
    this.dialogRef.close(params);
  }
}
