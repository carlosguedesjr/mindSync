import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';

import { UtilService } from 'src/app/services/util.service';
import { AuthService } from 'src/app/services/firebase/auth.service';

@Component({
  selector: 'app-auth-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordFormComponent implements OnInit {

  loading = false;
  formGroup: FormGroup;

  constructor(
    private router: Router,
    private _util: UtilService,
    private _auth: AuthService,
    private formBuilder: FormBuilder
  ) {
    this.formGroup = this.formBuilder.group({
      email: new FormControl('', [Validators.required, Validators.email])
    });
  }

  ngOnInit(): void { }

  get controls() {
    return this.formGroup.controls;
  }

  async onSubmit(): Promise<void> {
    if (this.formGroup.valid) {
      this.loading = true;
      const value = this.formGroup.value;
      await this._auth.sendPasswordResetEmail(value.email).then(res => {
        this._util.message('E-mail enviado, verifique seu email!', 'success');
        this.router.navigateByUrl('/auth/entrar');
      }).catch(err => this._util.message(err, 'warn'));
      this.loading = false;
    } else this._util.message('Verifique os dados antes de continuar!', 'warn');
  }
}
