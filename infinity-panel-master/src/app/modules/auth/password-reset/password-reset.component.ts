import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';

import { UtilService } from 'src/app/services/util.service';
import { AuthService } from 'src/app/services/firebase/auth.service';

@Component({
  selector: 'app-auth-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.scss']
})
export class PasswordResetFormComponent implements OnInit {

  code: string;
  loading = false;
  isValidCode = true;
  formGroup: FormGroup;

  constructor(
    private router: Router,
    private _util: UtilService,
    private _auth: AuthService,
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute
  ) {
    this.formGroup = this.formBuilder.group({
      password: new FormControl('', Validators.required)
    });
  }

  async ngOnInit(): Promise<void> {
    this.code = this.activatedRoute.snapshot.queryParamMap.get('oobCode');
    await this._auth.verifyPasswordResetCode(this.code).catch(_ => {
      this.isValidCode = false;
      this._util.message('Código de redefinição inválido!', 'warn');
    });
  }

  get controls() {
    return this.formGroup.controls;
  }

  async onSubmit(): Promise<void> {
    if (this.formGroup.valid) {
      this.loading = true;
      const value = this.formGroup.value;
      await this._auth.confirmPasswordReset(this.code, value.password).then(_ => {
        this.router.navigateByUrl('/auth/entrar');
        this._util.message('Senha redefinida com sucesso!', 'success');
      }).catch(err => this._util.message(err, 'warn'));
      this.loading = false;
    } else this._util.message('Verifique os dados antes de continuar!', 'warn');
  }
}
