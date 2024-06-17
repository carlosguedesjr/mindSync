import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { UtilService } from 'src/app/services/util.service';
import { StorageService } from 'src/app/services/storage.service';
import { AuthService } from 'src/app/services/firebase/auth.service';

@Component({
  selector: 'app-forgot',
  templateUrl: './forgot.page.html',
  styleUrls: ['./forgot.page.scss'],
})
export class ForgotPage {

  formGroup: FormGroup;

  constructor(
    private _auth: AuthService,
    private _util: UtilService,
    private navCtrl: NavController,
    public _storage: StorageService,
    private formBuilder: FormBuilder,
  ) {
    this.formGroup = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  async onSubmit() {
    if (this.formGroup.valid) {
      const loader = await this._util.loading('Buscando...');
      const data = this.formGroup.value;
      await this._auth.resetPassword(data.email).then(res => {
        this._util.message('Senha enviada ao e-mail cadastrado.');
        this.navCtrl.navigateRoot('/auth/entrar');
      }).catch(_ => this._util.message('E-mail inválido ou não cadastrado!'));
      loader.dismiss();
    } else this._util.message('Verifique os dados antes de prosseguir!');
  }

  goToBack() {
    this.navCtrl.back();
  }
}
