import { Router } from '@angular/router';
import { Component, NgZone, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';

import { UtilService } from 'src/app/services/util.service';
import { StorageService } from 'src/app/services/storage.service';
import { AuthService } from 'src/app/services/firebase/auth.service';

@Component({
  selector: 'app-auth-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginFormComponent implements OnInit {

  loading = false;
  formGroup: FormGroup;

  constructor(
    private ngZone: NgZone,
    private router: Router,
    private _util: UtilService,
    private _auth: AuthService,
    private formBuilder: FormBuilder,
    private _storage: StorageService,
  ) {
    this.formGroup = this.formBuilder.group({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', Validators.required)
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
      await this._auth.signIn(value.email, value.password).then(res => {
        this._storage.setUser(res);
        this.ngZone.run(_ => this.router.navigateByUrl('/'));
      }).catch(err => {
        this._util.message('E-mail ou senha inválido!', 'warn');
      });
      this.loading = false;
    } else this._util.message('Verifique os dados antes de continuar!', 'warn');
  }
}
