import firebase from 'firebase/app';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';

import { Student } from 'src/app/models/student';

import { StudentService } from './student.service';
import { StorageService } from '../storage.service';
import { AuthErrorCodeMessages } from 'src/app/exceptions/authentication-error';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private auth: AngularFireAuth,
    private _student: StudentService,
    private _storage: StorageService,
  ) { }

  async register(data: Student, password: string): Promise<string> {
    return this._student.add({...data, password} as any).then(_ => this.signInEmail(data.email, password));
  }

  async signInEmail(email: string, password: string): Promise<string> {
    return this.auth.signInWithEmailAndPassword(email, password)
      .then(credential => credential.user.uid)
      .catch(err => Promise.reject(AuthErrorCodeMessages.auth[err.code] || err));
  }

  signInGoogle(): Promise<void> {
    return this.auth.signInWithRedirect(new firebase.auth.GoogleAuthProvider());
  }

  signInFacebook(): Promise<void> {
    return this.auth.signInWithRedirect(new firebase.auth.FacebookAuthProvider());
  }

  signInApple(): Promise<void> {
    return this.auth.signInWithRedirect(new firebase.auth.OAuthProvider('apple.com'));
  }

  signInPhone(phone: string, appVerifier: firebase.auth.RecaptchaVerifier) {
    return this.auth.signInWithPhoneNumber(`+55${phone}`, appVerifier);
  }

  async getRedirectResult(): Promise<firebase.auth.UserCredential> {
    return this.auth.getRedirectResult()
      .catch(err => Promise.reject(AuthErrorCodeMessages.auth[err.code] || err));
  }

  resetPassword(email: string) {
    return this.auth.sendPasswordResetEmail(email);
  }

  verifyPasswordResetCode(code: string) {
    return this.auth.verifyPasswordResetCode(code);
  }

  confirmPasswordReset(code: string, password: string) {
    return this.auth.confirmPasswordReset(code, password);
  }

  signOut() {
    localStorage.clear();
    this._storage.clearObservables();
    return this.auth.signOut();
  }
}
