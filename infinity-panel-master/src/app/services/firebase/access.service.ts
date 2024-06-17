import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

import { FirebaseAbstract } from './abstract';
import { Access } from 'src/app/models/access';

@Injectable({
  providedIn: 'root'
})
export class AccessService extends FirebaseAbstract<Access> {

  static collectionName = 'access-contents';

  constructor(
    protected db: AngularFirestore
  ) {
    super(db, AccessService.collectionName);
  }
}
