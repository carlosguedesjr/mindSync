import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

import { Group } from 'src/app/models/group';
import { FirebaseAbstract } from './abstract';

@Injectable({
  providedIn: 'root'
})
export class GroupService extends FirebaseAbstract<Group> {

  static collectionName = 'groups';

  constructor(
    protected db: AngularFirestore
  ) {
    super(db, GroupService.collectionName);
  }
}
