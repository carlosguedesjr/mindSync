import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

import { FirebaseAbstract } from '../abstract';
import { Assessment } from 'src/app/models/assessment';

@Injectable({
  providedIn: 'root'
})
export class AssessmentService extends FirebaseAbstract<Assessment> {

  static collectionName = 'assessments';

  constructor(
    protected db: AngularFirestore
  ) {
    super(db, AssessmentService.collectionName);
  }
}
