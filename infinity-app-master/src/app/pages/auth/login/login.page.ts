import { ActivatedRoute } from '@angular/router';
import { NavController, Platform } from '@ionic/angular';
import { Component, NgZone, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Student } from 'src/app/models/student';

import { UtilService } from 'src/app/services/util.service';
import { StorageService } from 'src/app/services/storage.service';
import { AuthService } from 'src/app/services/firebase/auth.service';
import { StudentService } from 'src/app/services/firebase/student.service';
import { NotificationsService } from 'src/app/services/notification.services';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  isIOS: boolean;
  showAuth = false;
  togglePass = false;
  formGroup: FormGroup;

  constructor(
    private ngZone: NgZone,
    private _auth: AuthService,
    private _util: UtilService,
    private platform: Platform,
    private navCtrl: NavController,
    private _student: StudentService,
    private _storage: StorageService,
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private _notification: NotificationsService
  ) {
    this.formGroup = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  async ngOnInit() {
    this.isIOS = this.platform.is('ios');
    await this._auth.getRedirectResult().then(async credential => {
      if (credential.user) {
        const loader = await this._util.loading('Entrando...');
        const token = await this._notification.getToken;
        const uid = credential.user.uid;
        const data = new Student();
        data.id = uid;
        data.token = token;
        data.authType = 'google';
        data.email = credential.user.email;
        data.image = credential.user.photoURL;
        data.name = credential.user.displayName;

        if (credential.credential.signInMethod.indexOf('apple') > -1) data.authType = 'apple';
        else if (credential.credential.signInMethod.indexOf('facebook') > -1) data.authType = 'facebook';

        await this._student.getById(uid).then(student => {
          if (student && !student.deletedAt) {
            this._storage.setUser = student;
            this.goToNext();
          } else return Promise.reject('Deleted');
        }).catch(async err => {
          if (err === 'Deleted') return Promise.reject('Aluno desativado!');
          await this._student.set(uid, data);
          this.goToNext();
        });
        loader.dismiss();
      }
    }).catch(err => {
      this._auth.signOut();
      this._util.message(err);
    });
  }

  async authSocial(type: 'facebook' | 'google' | 'apple') {
    const loader = await this._util.loading('Redirecionando...');
    if (type === 'facebook') await this._auth.signInFacebook();
    else if (type === 'google') await this._auth.signInGoogle();
    else if (type === 'apple') await this._auth.signInApple();
    loader.dismiss();
  }

  onToggleInputs() {
    this.ngZone.run(_ => this.showAuth = !this.showAuth);
  }

  async onSubmit() {
    if (this.formGroup.valid) {
      const value = this.formGroup.value;
      const loader = await this._util.loading('Entrando...');
      await this._auth.signInEmail(value.email, value.password).then(async uid => {
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
}
