import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { FirebaseErrorCodeMessages } from 'src/app/exceptions/authentication-error';

import { User } from 'src/app/models/user';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private _user: UserService,
    private auth: AngularFireAuth,
  ) { }

  signIn(email: string, password: string): Promise<User> {
    return new Promise((resolve, reject) => {
      this.auth.signInWithEmailAndPassword(email, password).then(credential => {
        this._user.getById(credential.user.uid).then(user => {
          if (user) resolve(user);
          else {
            this.signOut();
            reject('User not found!');
          }
        });
      }).catch(err => reject(FirebaseErrorCodeMessages.auth[err.code] || 'Houve um erro ao realizar o login. Por favor, tente novamente.'));
    });
  }

  signOut(): Promise<void> {
    return this.auth.signOut();
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    return this.auth.sendPasswordResetEmail(email).catch(err =>
      Promise.reject(FirebaseErrorCodeMessages.auth[err.code] || 'Houve um erro ao realizar o login. Por favor, tente novamente.')
    );
  }

  async verifyPasswordResetCode(code: string): Promise<string> {
    return this.auth.verifyPasswordResetCode(code);
  }

  async confirmPasswordReset(code: string, newPassword: string): Promise<void> {
    return this.auth.confirmPasswordReset(code, newPassword);
  }
}
