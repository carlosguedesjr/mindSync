import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

import { FirebaseAbstract } from '../abstract';
import { Question } from 'src/app/models/assessment';

@Injectable({
  providedIn: 'root'
})
export class AssessmentQuestionService extends FirebaseAbstract<Question> {

  static collectionName = 'assessment-questions';

  constructor(
    protected db: AngularFirestore
  ) {
    super(db, AssessmentQuestionService.collectionName);
  }
}
