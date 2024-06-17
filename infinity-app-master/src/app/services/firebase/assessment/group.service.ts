import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

import { FirebaseAbstract } from '../abstract';
import { Group } from 'src/app/models/assessment';

@Injectable({
  providedIn: 'root'
})
export class AssessmentGroupService extends FirebaseAbstract<Group> {

  static collectionName = 'assessment-groups';

  constructor(
    protected db: AngularFirestore
  ) {
    super(db, AssessmentGroupService.collectionName);
  }
}
