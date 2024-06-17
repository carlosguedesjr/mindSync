import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';

import { Coupon } from 'src/app/models/coupon';
import { Access } from 'src/app/models/access';

import { UtilService } from 'src/app/services/util.service';
import { CouponService } from 'src/app/services/firebase/coupon.service';
import { AccessService } from 'src/app/services/firebase/access.service';

@Component({
  selector: 'app-coupon-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class CouponFormComponent implements OnInit {

  saving = false;
  formGroup: FormGroup;
  accessList: Access[];

  constructor(
    private _util: UtilService,
    private _coupon: CouponService,
    private _access: AccessService,
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<CouponFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Coupon = new Coupon()
  ) {
    this.formGroup = this.formBuilder.group({
      code: new FormControl('', Validators.required),
      value: new FormControl('', Validators.min(1)),
      accessId: new FormControl('', Validators.required),
      validity: new FormControl('', Validators.required),
      quantity: new FormControl(0, [Validators.required, Validators.min(0)]),
      percentage: new FormControl(false)
    });
  }

  async ngOnInit(): Promise<void> {
    if (this.data.id) this.setData();
  }

  setData(): void {
    this.formGroup.patchValue(this.data);
  }

  get controls() {
    return this.formGroup.controls;
  }

  async getAccess(): Promise<void> {
    this.accessList = await this._access.getAllActive();
  }

  uppercase() {
    const value = this._util.removeAccent(this.controls.code.value);
    this.controls.code.setValue(value.toUpperCase());
  }

  async onSubmit(): Promise<void> {
    if (this.formGroup.valid) {
      this.saving = true;
      Object.assign(this.data, this.formGroup.value);
      this.data.validity.setHours(23, 59, 59);

      await this._coupon.save(this.data);

      this.saving = false;
      this._util.message('Cupom salvo com sucesso!', 'success');
      this.dialogRef.close(true);
    } else this._util.message('Verifique os dados antes de salvar!', 'warn');
  }
}
