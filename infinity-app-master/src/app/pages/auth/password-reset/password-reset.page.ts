import { NavController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';

import { UtilService } from 'src/app/services/util.service';
import { StorageService } from 'src/app/services/storage.service';
import { AuthService } from 'src/app/services/firebase/auth.service';

@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.page.html',
  styleUrls: ['./password-reset.page.scss'],
})
export class PasswordResetPage implements OnInit {

  code: string;
  togglePass = false;
  formGroup: FormGroup;

  constructor(
    private _auth: AuthService,
    private _util: UtilService,
    private navCtrl: NavController,
    public _storage: StorageService,
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
  ) {
    this.formGroup = this.formBuilder.group({
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/[0-9]/),
        Validators.pattern(/[a-zA-Z]/)
      ]],
      confPassword: ['', Validators.required]
    }, {validators: this.validatorPassword});
  }

  async ngOnInit() {
    this.code = this.activatedRoute.snapshot.queryParamMap.get('oobCode');
    await this._auth.verifyPasswordResetCode(this.code).catch(_ => {
      this._util.message('Código de redefinição inválido! Faça o processo de redefinição novamente!');
      this.navCtrl.navigateRoot('/auth/esqueci-senha');
    });
  }

  get controls() {
    return this.formGroup.controls;
  }

  validatorPassword(group: FormGroup): ValidatorFn {
    const password = group.get('password').value;
    const confirmControl = group.get('confPassword');
    let result: {
      required?: boolean;
      passNotSame?: boolean;
    } = null;

    if (confirmControl.hasError('required')) result = {required: true};
    else if (password !== confirmControl.value) result = {passNotSame: true};

    confirmControl.setErrors(result);
    return null;
  }

  async onSubmit() {
    if (this.formGroup.valid) {
      const loader = await this._util.loading('Buscando...');
      const data = this.formGroup.value;
      await this._auth.confirmPasswordReset(this.code, data.password).then(_ => {
        this._util.message('Senha redefinida com sucesso! Faça login, utilizando sua nova senha!');
        this.navCtrl.navigateRoot('/auth/entrar');
      }).catch(_ => this._util.message('Erro ao redefinir senha!'));
      loader.dismiss();
    } else this._util.message('Verifique os dados antes de prosseguir!');
  }

  goToBack() {
    this.navCtrl.back();
  }
}
