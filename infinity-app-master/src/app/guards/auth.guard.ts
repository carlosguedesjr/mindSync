import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { CanActivate, Router } from '@angular/router';

import { StorageService } from 'src/app/services/storage.service';
import { StudentService } from 'src/app/services/firebase/student.service';
import { SubscriptionService } from '../services/firebase/subscription.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private router: Router,
    private auth: AngularFireAuth,
    private _student: StudentService,
    private _storage: StorageService,
    private _subscription: SubscriptionService
  ){ }

  canActivate(): Observable<boolean> | Promise<boolean> | boolean {
    return new Promise(resolve => {
      this.auth.onAuthStateChanged(async fbUser => {
        if (fbUser) {
          const user = await this._student.getById(fbUser.uid);
          if (user && !user.deletedAt) {
            this._storage.setUser = user;
            this._storage.setSubscriptions = await this._subscription.getByStudentId();
            resolve(true);
          } else this.auth.signOut();
        } else {
          this.router.navigateByUrl('/auth/entrar');
          this._storage.removeUser();
          resolve(false);
        }
      });
    });
  }
}
