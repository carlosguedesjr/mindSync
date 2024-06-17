import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { NavController, Platform } from '@ionic/angular';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';

import { Student } from 'src/app/models/student';

import { UtilService } from 'src/app/services/util.service';
import { AuthService } from 'src/app/services/firebase/auth.service';
import { UserService } from 'src/app/services/firebase/user.service';
import { ValidatorService } from 'src/app/services/validator.service';
import { StudentService } from 'src/app/services/firebase/student.service';
import { NotificationsService } from 'src/app/services/notification.services';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

  isIOS: boolean;
  showAuth = false;
  togglePass = false;
  formGroup: FormGroup;

  constructor(
    private _user: UserService,
    private _auth: AuthService,
    private _util: UtilService,
    private platform: Platform,
    private navCtrl: NavController,
    private _student: StudentService,
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private _notification: NotificationsService
  ) {
    this.formGroup = this.formBuilder.group({
      name: ['', [Validators.required, this.validatorName]],
      cpf: ['', [Validators.required, ValidatorService.validatorCPF]],
      phone: ['', [Validators.required, Validators.minLength(14)]],
      email: ['', [Validators.required, Validators.email]],
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
    this.isIOS = this.platform.is('ios');
  }

  get controls() {
    return this.formGroup.controls;
  }

  validatorName(control: AbstractControl) {
    let error: {invalid: boolean} = null;
    const value: string = control.value || '';
    const nameList = value.split(' ');
    if (nameList.length < 2 || !nameList[1]) error = {invalid: true};
    return error;
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

  async validateCPF() {
    const value = this.controls.cpf.value;
    if (value && !this.controls.cpf.hasError('invalid')) {
      const students = await this._student.getWhere('cpf', '==', value);
      this.controls.cpf.setErrors(students.length ? {exist: true} : null);
    }
  }

  async validateEmail() {
    const value = this.controls.email.value;
    if (value && !this.controls.email.hasError('email')) {
      const users = await this._user.getWhere('email', '==', value);
      const students = await this._student.getWhere('email', '==', value);
      this.controls.email.setErrors(students.length || users.length ? {exist: true} : null);
    }
  }

  async onSubmit() {
    if (this.formGroup.valid) {
      const loader = await this._util.loading('Criando...');

      const value = this.formGroup.value;
      const data: Student = Object.assign(new Student(), value);

      data.cpf = ValidatorService.cleanCPF(data.cpf);
      data.phone = ValidatorService.cleanPhone(data.phone);

      await this._auth.register(data, value.password).then(async uid => {
        await this.updateToken(uid);
        this.goToNext();
      }).catch(err => this._util.message(err));

      loader.dismiss();
    } else this._util.message('Preencha os dados corretamente antes de prosseguir!');
  }

  async updateToken(id: string) {
    const token = await this._notification.getToken;
    await this._student.update(id, {token});
  }

  goToNext() {
    const url = this.activatedRoute.snapshot.paramMap.get('returnUrl') || '/';
    this.navCtrl.navigateRoot(url);
  }

  goToBack() {
    this.navCtrl.back();
  }
}
