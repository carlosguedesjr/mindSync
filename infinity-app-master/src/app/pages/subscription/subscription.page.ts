import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Subscription } from 'src/app/models/subscription';

import { UtilService } from 'src/app/services/util.service';
import { StorageService } from 'src/app/services/storage.service';
import { AccessService } from 'src/app/services/firebase/access.service';
import { SubscriptionService } from 'src/app/services/firebase/subscription.service';

@Component({
  selector: 'app-subscription',
  templateUrl: './subscription.page.html',
  styleUrls: ['./subscription.page.scss'],
})
export class SubscriptionPage implements OnInit {

  isIOS: boolean;
  showAuth = false;
  togglePass = false;
  formGroup: FormGroup;

  private data = new Subscription();

  constructor(
    private _util: UtilService,
    private _access: AccessService,
    private _storage: StorageService,
    private formBuilder: FormBuilder,
    private popoverCtrl: PopoverController,
    private _subscription: SubscriptionService
  ) {
    this.formGroup = this.formBuilder.group({
      accessCode: ['', Validators.required]
    });
  }

  ngOnInit(): void {}

  get controls() {
    return this.formGroup.controls;
  }

  uppercase() {
    const value: string = this.controls.accessCode.value;
    this.controls.accessCode.setValue(value.toUpperCase());
  }

  async onSubmit() {
    if (this.formGroup.valid) {
      const loader = await this._util.loading('Acessando...');
      const accessCode: string = this.formGroup.value.accessCode;
      const student = this._storage.getUser;

      this.data.student.id = student.id;
      this.data.student.name = student.name;

      await this._access.getByCode(accessCode).then(async access => {
        const subscription = await this._subscription.getByStudentIdByAccessId(access.id).catch(_ => {});
        if (!subscription) {
          this.data.access.id = access.id;
          this.data.access.code = access.code;
          this.data.assessmentIds = access.assessmentIds;
          await this._subscription.add(this.data);
          await this._access.update(access.id, {used: access.used+1});
          this.goToBack(access);
        } else this._util.message('Código já utilizado!');
      }).catch(err => this._util.message(err));
      loader.dismiss();
    } else this._util.message('Preencha os dados corretamente antes de prosseguir!');
  }

  goToBack(params?: any) {
    this.popoverCtrl.dismiss(params);
  }
}
