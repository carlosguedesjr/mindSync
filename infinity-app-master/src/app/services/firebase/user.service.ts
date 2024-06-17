import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

import { User } from 'src/app/models/user';
import { FirebaseAbstract } from './abstract';

@Injectable({
  providedIn: 'root'
})
export class UserService extends FirebaseAbstract<User> {

  static collectionName = 'users';

  constructor(
    protected db: AngularFirestore
  ) {
    super(db, UserService.collectionName);
  }
}
